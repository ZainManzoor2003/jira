const express = require('express');
const router = express.Router();
const projectController = require('../controllers/projectController');
const { authMiddleware } = require('../middlewares/authMiddleware');


router.post('/add',authMiddleware,projectController.addProject);

router.put('/update/:id',authMiddleware, projectController.updateProject);

router.delete('/delete/:id',authMiddleware,projectController.deleteProject);

router.get('/getProjects', authMiddleware, projectController.getProjectsByUser);

module.exports = router;