const express = require('express');
const router = express.Router();

const { authMiddleware } = require('../middlewares/authMiddleware');
const taskController = require('../controllers/taskController');


router.get("/all", taskController.getTasks);

router.post("/add", authMiddleware, taskController.addTask);

router.put("/update/:id", authMiddleware, taskController.updateTask);

router.put("/update/status/:id", authMiddleware, taskController.updateTaskStatus);

router.delete("/delete/:id", authMiddleware, taskController.deleteTask);

router.post("/comment/:taskId", authMiddleware, taskController.commentTask);

router.get("/comment/all", taskController.getComments);

router.get("/comment/:taskId", authMiddleware ,taskController.getCommentsByTask);

module.exports = router;