const { Op } = require('sequelize');
const { sequelize, Project, Tag } = require('../models/sql');
const ProjectDetail = require('../models/nosql/ProjectDetail');

/**
 * Generate a URL-friendly slug from string
 */
const slugify = (text) => {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-') // Replace spaces with -
    .replace(/[^\w\-]+/g, '') // Remove all non-word chars
    .replace(/\-\-+/g, '-'); // Replace multiple - with single -
};

/**
 * Get all projects with optional filtering, search, and category
 */
const getAllProjects = async (req, res) => {
  try {
    const { category, tag, search, featured } = req.query;

    const whereClause = {};

    if (category && category !== 'All') {
      whereClause.category = category;
    }

    if (featured !== undefined) {
      whereClause.featured = featured === 'true';
    }

    if (search) {
      whereClause[Op.or] = [
        { title: { [Op.like]: `%${search}%` } },
        { slug: { [Op.like]: `%${search}%` } },
      ];
    }

    const includeOptions = [
      {
        model: Tag,
        as: 'tags',
        through: { attributes: [] },
        ...(tag && tag !== 'All' ? { where: { name: tag } } : {}),
      },
    ];

    const projects = await Project.findAll({
      where: whereClause,
      include: includeOptions,
      order: [
        ['featured', 'DESC'],
        ['created_at', 'DESC'],
      ],
    });

    return res.status(200).json({
      success: true,
      count: projects.length,
      data: projects,
    });
  } catch (error) {
    console.error('[ProjectController] Error in getAllProjects:', error);
    return res.status(500).json({
      success: false,
      message: 'Gagal mengambil daftar proyek.',
      error: error.message,
    });
  }
};

/**
 * Get single project by slug combining MariaDB metadata & MongoDB ProjectDetail
 */
const getProjectBySlug = async (req, res) => {
  try {
    const { slug } = req.params;

    // 1. Fetch core entity from MariaDB
    const project = await Project.findOne({
      where: { slug },
      include: [
        {
          model: Tag,
          as: 'tags',
          through: { attributes: [] },
        },
      ],
    });

    if (!project) {
      return res.status(404).json({
        success: false,
        message: `Proyek dengan slug "${slug}" tidak ditemukan.`,
      });
    }

    // Attach targetProjectId to request so auditLogger logs it into MongoDB AccessLogs!
    req.targetProjectId = project.id;

    // 2. Fetch unstructured & telemetry doc from MongoDB
    const detailDoc = await ProjectDetail.findOne({ projectId: project.id }).lean();

    // 3. Merge SQL entity and NoSQL document into unified response JSON
    const mergedData = {
      ...project.toJSON(),
      details: detailDoc || {
        projectId: project.id,
        markdownContent: '## Belum ada dokumentasi teknis untuk proyek ini.',
        architectureDiagramUrl: '',
        systemSpecs: {},
        changelog: [],
      },
    };

    return res.status(200).json({
      success: true,
      data: mergedData,
    });
  } catch (error) {
    console.error('[ProjectController] Error in getProjectBySlug:', error);
    return res.status(500).json({
      success: false,
      message: 'Gagal mengambil detail proyek.',
      error: error.message,
    });
  }
};

/**
 * Create Project (Atomic CRUD across MariaDB and MongoDB)
 */
const createProject = async (req, res) => {
  const transaction = await sequelize.transaction();

  try {
    const {
      title,
      slug: customSlug,
      category,
      repo_url,
      demo_url,
      license,
      featured,
      tags, // Array of tag names or IDs
      markdownContent,
      architectureDiagramUrl,
      systemSpecs,
      changelog,
    } = req.body;

    if (!title || !category) {
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        message: 'Judul (title) dan Kategori (category) wajib diisi.',
      });
    }

    const finalSlug = customSlug ? slugify(customSlug) : slugify(title);

    // Check slug uniqueness
    const existingSlug = await Project.findOne({ where: { slug: finalSlug } });
    if (existingSlug) {
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        message: `Slug "${finalSlug}" sudah digunakan oleh proyek lain.`,
      });
    }

    // Step A: Create Core Project in MariaDB
    const project = await Project.create(
      {
        title,
        slug: finalSlug,
        category,
        repo_url: repo_url || null,
        demo_url: demo_url || null,
        license: license || 'MIT',
        featured: !!featured,
      },
      { transaction }
    );

    // Associate Tags
    if (Array.isArray(tags) && tags.length > 0) {
      const tagInstances = [];
      for (const t of tags) {
        if (typeof t === 'string') {
          const [tagRecord] = await Tag.findOrCreate({
            where: { name: t.trim() },
            defaults: { icon_class: 'tag' },
            transaction,
          });
          tagInstances.push(tagRecord);
        } else if (typeof t === 'number') {
          const tagRecord = await Tag.findByPk(t, { transaction });
          if (tagRecord) tagInstances.push(tagRecord);
        }
      }
      await project.setTags(tagInstances, { transaction });
    }

    // Step B: Synchronously create Technical Details in MongoDB
    let projectDetail;
    try {
      projectDetail = await ProjectDetail.create({
        projectId: project.id,
        markdownContent: markdownContent || '# ' + title + '\n\nDokumentasi teknis arsitektur.',
        architectureDiagramUrl: architectureDiagramUrl || '',
        systemSpecs: systemSpecs || {},
        changelog: Array.isArray(changelog) ? changelog : [],
      });
    } catch (mongoError) {
      // If MongoDB insertion fails, rollback MariaDB to maintain dual-db atomic integrity!
      await transaction.rollback();
      throw new Error(`MongoDB ProjectDetail creation failed: ${mongoError.message}`);
    }

    // Commit SQL transaction
    await transaction.commit();

    // Fetch freshly created project with associations
    const freshProject = await Project.findByPk(project.id, {
      include: [{ model: Tag, as: 'tags', through: { attributes: [] } }],
    });

    return res.status(201).json({
      success: true,
      message: 'Proyek berhasil dibuat di kedua database (MariaDB + MongoDB).',
      data: {
        ...freshProject.toJSON(),
        details: projectDetail,
      },
    });
  } catch (error) {
    if (transaction && !transaction.finished) {
      await transaction.rollback();
    }
    console.error('[ProjectController] Error in createProject:', error);
    return res.status(500).json({
      success: false,
      message: 'Gagal membuat proyek baru.',
      error: error.message,
    });
  }
};

/**
 * Update Project across MariaDB and MongoDB
 */
const updateProject = async (req, res) => {
  const transaction = await sequelize.transaction();

  try {
    const { id } = req.params;
    const {
      title,
      slug: customSlug,
      category,
      repo_url,
      demo_url,
      license,
      featured,
      tags,
      markdownContent,
      architectureDiagramUrl,
      systemSpecs,
      changelog,
    } = req.body;

    const project = await Project.findByPk(id, { transaction });
    if (!project) {
      await transaction.rollback();
      return res.status(404).json({
        success: false,
        message: 'Proyek tidak ditemukan.',
      });
    }

    const updatedSlug = customSlug ? slugify(customSlug) : project.slug;

    // Check slug collision if slug changed
    if (updatedSlug !== project.slug) {
      const existing = await Project.findOne({ where: { slug: updatedSlug } });
      if (existing && existing.id !== project.id) {
        await transaction.rollback();
        return res.status(400).json({
          success: false,
          message: `Slug "${updatedSlug}" sudah digunakan oleh proyek lain.`,
        });
      }
    }

    // 1. Update MariaDB
    await project.update(
      {
        title: title || project.title,
        slug: updatedSlug,
        category: category || project.category,
        repo_url: repo_url !== undefined ? repo_url : project.repo_url,
        demo_url: demo_url !== undefined ? demo_url : project.demo_url,
        license: license || project.license,
        featured: featured !== undefined ? !!featured : project.featured,
      },
      { transaction }
    );

    // Update tags if provided
    if (Array.isArray(tags)) {
      const tagInstances = [];
      for (const t of tags) {
        if (typeof t === 'string') {
          const [tagRecord] = await Tag.findOrCreate({
            where: { name: t.trim() },
            defaults: { icon_class: 'tag' },
            transaction,
          });
          tagInstances.push(tagRecord);
        } else if (typeof t === 'number') {
          const tagRecord = await Tag.findByPk(t, { transaction });
          if (tagRecord) tagInstances.push(tagRecord);
        }
      }
      await project.setTags(tagInstances, { transaction });
    }

    // 2. Update MongoDB ProjectDetail
    const detailUpdates = {};
    if (markdownContent !== undefined) detailUpdates.markdownContent = markdownContent;
    if (architectureDiagramUrl !== undefined) detailUpdates.architectureDiagramUrl = architectureDiagramUrl;
    if (systemSpecs !== undefined) detailUpdates.systemSpecs = systemSpecs;
    if (changelog !== undefined) detailUpdates.changelog = changelog;

    const updatedDetail = await ProjectDetail.findOneAndUpdate(
      { projectId: project.id },
      { $set: detailUpdates },
      { new: true, upsert: true }
    );

    await transaction.commit();

    const freshProject = await Project.findByPk(project.id, {
      include: [{ model: Tag, as: 'tags', through: { attributes: [] } }],
    });

    return res.status(200).json({
      success: true,
      message: 'Proyek berhasil diperbarui.',
      data: {
        ...freshProject.toJSON(),
        details: updatedDetail,
      },
    });
  } catch (error) {
    if (transaction && !transaction.finished) {
      await transaction.rollback();
    }
    console.error('[ProjectController] Error in updateProject:', error);
    return res.status(500).json({
      success: false,
      message: 'Gagal memperbarui proyek.',
      error: error.message,
    });
  }
};

/**
 * Delete Project from both MariaDB and MongoDB
 */
const deleteProject = async (req, res) => {
  const transaction = await sequelize.transaction();

  try {
    const { id } = req.params;

    const project = await Project.findByPk(id, { transaction });
    if (!project) {
      await transaction.rollback();
      return res.status(404).json({
        success: false,
        message: 'Proyek tidak ditemukan.',
      });
    }

    // 1. Delete from MariaDB (Pivot rows removed automatically or cascade)
    await project.setTags([], { transaction });
    await project.destroy({ transaction });

    // 2. Delete corresponding Document from MongoDB
    await ProjectDetail.deleteOne({ projectId: Number(id) });

    await transaction.commit();

    return res.status(200).json({
      success: true,
      message: `Proyek ID ${id} berhasil dihapus dari MariaDB dan MongoDB.`,
    });
  } catch (error) {
    if (transaction && !transaction.finished) {
      await transaction.rollback();
    }
    console.error('[ProjectController] Error in deleteProject:', error);
    return res.status(500).json({
      success: false,
      message: 'Gagal menghapus proyek.',
      error: error.message,
    });
  }
};

/**
 * Get all available tags
 */
const getAllTags = async (req, res) => {
  try {
    const tags = await Tag.findAll({
      order: [['name', 'ASC']],
    });
    return res.status(200).json({
      success: true,
      data: tags,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Gagal mengambil daftar tag.',
      error: error.message,
    });
  }
};

module.exports = {
  getAllProjects,
  getProjectBySlug,
  createProject,
  updateProject,
  deleteProject,
  getAllTags,
};
