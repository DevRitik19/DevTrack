const express = require('express');
const router = express.Router();
const {
  getProjects,
  getProjectById,
  createProject,
  updateProject,
  deleteProject,
} = require('../controllers/projectController');
const { protect } = require('../middleware/auth');
const { validateCreateProject, validateUpdateProject } = require('../middleware/validation');

// All project routes require authentication
router.use(protect);

router.route('/')
  .get(getProjects)
  .post(validateCreateProject, createProject);

router.route('/:id')
  .get(getProjectById)
  .patch(validateUpdateProject, updateProject)
  .delete(deleteProject);

module.exports = router;
