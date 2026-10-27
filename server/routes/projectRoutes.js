const express = require('express');
const router = express.Router();
const projectController = require('../controllers/projectController');
const { requireAuth, requireAdmin } = require('../middleware/authMiddleware');

// Public routes
router.get('/', projectController.getAllProjects);
router.get('/tags', projectController.getAllTags);
router.get('/:slug', projectController.getProjectBySlug);

// Protected Admin CRUD routes
router.post('/', requireAuth, requireAdmin, projectController.createProject);
router.put('/:id', requireAuth, requireAdmin, projectController.updateProject);
router.delete('/:id', requireAuth, requireAdmin, projectController.deleteProject);

module.exports = router;
