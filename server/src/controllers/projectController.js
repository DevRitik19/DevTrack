const Project = require('../models/Project');

// @desc    Get all projects for current user with search, filter, and sort
// @route   GET /api/projects
// @access  Private
const getProjects = async (req, res, next) => {
  try {
    const { search, status, sort, technology } = req.query;

    // Strict ownership filter
    const query = { user: req.user._id };

    // Search filter across title, description, and technologies
    if (search && search.trim() !== '') {
      const regex = new RegExp(search.trim(), 'i');
      query.$or = [{ title: regex }, { description: regex }, { technologies: regex }];
    }

    // Status filter
    if (status && ['Planned', 'In Progress', 'Completed'].includes(status)) {
      query.status = status;
    }

    // Technology filter
    if (technology && technology.trim() !== '') {
      query.technologies = { $in: [new RegExp(`^${technology.trim()}$`, 'i')] };
    }

    // Sorting
    let sortOption = { updatedAt: -1 }; // default newest updated first
    if (sort === 'oldest') {
      sortOption = { createdAt: 1 };
    } else if (sort === 'newest') {
      sortOption = { createdAt: -1 };
    } else if (sort === 'title_asc') {
      sortOption = { title: 1 };
    } else if (sort === 'title_desc') {
      sortOption = { title: -1 };
    } else if (sort === 'progress_high') {
      sortOption = { completionPercentage: -1 };
    } else if (sort === 'progress_low') {
      sortOption = { completionPercentage: 1 };
    }

    const projects = await Project.find(query).sort(sortOption);

    res.status(200).json({
      success: true,
      count: projects.length,
      data: projects,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get single project by ID (strictly owned)
// @route   GET /api/projects/:id
// @access  Private
const getProjectById = async (req, res, next) => {
  try {
    const project = await Project.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found or you are not authorized to view it',
      });
    }

    res.status(200).json({
      success: true,
      data: project,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Create a new project
// @route   POST /api/projects
// @access  Private
const createProject = async (req, res, next) => {
  try {
    const {
      title,
      description,
      technologies,
      githubUrl,
      liveDemoUrl,
      status,
      completionPercentage,
      isPublic,
    } = req.body;

    const project = await Project.create({
      user: req.user._id,
      title,
      description: description || '',
      technologies: Array.isArray(technologies) ? technologies : [],
      githubUrl: githubUrl || '',
      liveDemoUrl: liveDemoUrl || '',
      status: status || 'Planned',
      completionPercentage: completionPercentage !== undefined ? Number(completionPercentage) : 0,
      isPublic: isPublic !== undefined ? isPublic : true,
    });

    res.status(201).json({
      success: true,
      message: 'Project created successfully',
      data: project,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Update an existing project (strictly owned)
// @route   PATCH /api/projects/:id
// @access  Private
const updateProject = async (req, res, next) => {
  try {
    const project = await Project.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found or you are not authorized to modify it',
      });
    }

    const {
      title,
      description,
      technologies,
      githubUrl,
      liveDemoUrl,
      status,
      completionPercentage,
      isPublic,
    } = req.body;

    if (title !== undefined) project.title = title;
    if (description !== undefined) project.description = description;
    if (technologies !== undefined) project.technologies = Array.isArray(technologies) ? technologies : [];
    if (githubUrl !== undefined) project.githubUrl = githubUrl;
    if (liveDemoUrl !== undefined) project.liveDemoUrl = liveDemoUrl;
    if (status !== undefined) project.status = status;
    if (completionPercentage !== undefined) project.completionPercentage = Number(completionPercentage);
    if (isPublic !== undefined) project.isPublic = isPublic;

    await project.save();

    res.status(200).json({
      success: true,
      message: 'Project updated successfully',
      data: project,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Delete a project (strictly owned)
// @route   DELETE /api/projects/:id
// @access  Private
const deleteProject = async (req, res, next) => {
  try {
    const project = await Project.findOneAndDelete({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found or you are not authorized to delete it',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Project deleted successfully',
      data: { id: req.params.id },
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getProjects,
  getProjectById,
  createProject,
  updateProject,
  deleteProject,
};
