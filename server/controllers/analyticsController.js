const AccessLog = require('../models/nosql/AccessLog');
const { Project } = require('../models/sql');

/**
 * Get high-level overview metrics for the Admin Dashboard
 */
const getOverview = async (req, res) => {
  try {
    // 1. Total projects in MariaDB
    const totalProjects = await Project.count();

    // 2. Total access logs in MongoDB
    const totalVisits = await AccessLog.countDocuments();

    // 3. Average response time and min/max
    const latencyStats = await AccessLog.aggregate([
      {
        $group: {
          _id: null,
          avgResponseTime: { $avg: '$responseTimeMs' },
          minResponseTime: { $min: '$responseTimeMs' },
          maxResponseTime: { $max: '$responseTimeMs' },
        },
      },
    ]);

    const avgResponseTime = latencyStats.length > 0 ? Math.round(latencyStats[0].avgResponseTime * 10) / 10 : 0;
    const minResponseTime = latencyStats.length > 0 ? latencyStats[0].minResponseTime : 0;
    const maxResponseTime = latencyStats.length > 0 ? latencyStats[0].maxResponseTime : 0;

    // 4. Unique IP count
    const uniqueIps = await AccessLog.distinct('ipAddress');

    // 5. Visits in the last 24 hours
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const visits24h = await AccessLog.countDocuments({ timestamp: { $gte: oneDayAgo } });

    // 6. Top visited paths
    const topPaths = await AccessLog.aggregate([
      { $group: { _id: '$path', count: { $sum: 1 }, avgLatency: { $avg: '$responseTimeMs' } } },
      { $sort: { count: -1 } },
      { $limit: 5 },
    ]);

    return res.status(200).json({
      success: true,
      data: {
        totalProjects,
        totalVisits,
        avgResponseTime,
        minResponseTime,
        maxResponseTime,
        uniqueVisitors: uniqueIps.length,
        visits24h,
        topPaths,
      },
    });
  } catch (error) {
    console.error('[AnalyticsController] Error in getOverview:', error);
    return res.status(500).json({
      success: false,
      message: 'Gagal mengambil ringkasan analitik.',
      error: error.message,
    });
  }
};

/**
 * Get visits trend for Recharts (grouped by date)
 */
const getVisitsTrend = async (req, res) => {
  try {
    const days = parseInt(req.query.days, 10) || 14;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const trend = await AccessLog.aggregate([
      {
        $match: {
          timestamp: { $gte: startDate },
        },
      },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$timestamp' },
          },
          visits: { $sum: 1 },
          avgLatency: { $avg: '$responseTimeMs' },
        },
      },
      {
        $project: {
          _id: 0,
          date: '$_id',
          visits: 1,
          avgLatency: { $round: ['$avgLatency', 1] },
        },
      },
      {
        $sort: { date: 1 },
      },
    ]);

    // If trend is empty or has gaps, ensure at least today is represented
    if (trend.length === 0) {
      const todayStr = new Date().toISOString().split('T')[0];
      trend.push({ date: todayStr, visits: 0, avgLatency: 0 });
    }

    return res.status(200).json({
      success: true,
      data: trend,
    });
  } catch (error) {
    console.error('[AnalyticsController] Error in getVisitsTrend:', error);
    return res.status(500).json({
      success: false,
      message: 'Gagal mengambil data tren kunjungan.',
      error: error.message,
    });
  }
};

/**
 * Get paginated raw access logs from MongoDB
 */
const getRawLogs = async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(100, Math.max(5, parseInt(req.query.limit, 10) || 20));
    const skip = (page - 1) * limit;

    const query = {};
    if (req.query.path) {
      query.path = { $regex: req.query.path, $options: 'i' };
    }
    if (req.query.ip) {
      query.ipAddress = { $regex: req.query.ip, $options: 'i' };
    }
    if (req.query.targetProjectId) {
      query.targetProjectId = parseInt(req.query.targetProjectId, 10);
    }

    const [total, logs] = await Promise.all([
      AccessLog.countDocuments(query),
      AccessLog.find(query)
        .sort({ timestamp: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
    ]);

    // Lookup project titles from MariaDB for logs with targetProjectId
    const projectIds = [...new Set(logs.map((l) => l.targetProjectId).filter(Boolean))];
    let projectMap = {};

    if (projectIds.length > 0) {
      const projects = await Project.findAll({
        where: { id: projectIds },
        attributes: ['id', 'title', 'slug'],
      });
      projectMap = projects.reduce((acc, p) => {
        acc[p.id] = { title: p.title, slug: p.slug };
        return acc;
      }, {});
    }

    const enrichedLogs = logs.map((log) => ({
      ...log,
      project: log.targetProjectId ? projectMap[log.targetProjectId] || null : null,
    }));

    return res.status(200).json({
      success: true,
      data: enrichedLogs,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('[AnalyticsController] Error in getRawLogs:', error);
    return res.status(500).json({
      success: false,
      message: 'Gagal mengambil daftar log audit.',
      error: error.message,
    });
  }
};

module.exports = {
  getOverview,
  getVisitsTrend,
  getRawLogs,
};
