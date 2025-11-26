const express = require('express');
const router = express.Router();

const { authMiddleware } = require('../middlewares/authMiddleware');
const taskController = require('../controllers/taskController');


router.get("/all", taskController.getTasks);

router.post("/add", taskController.addTask);

router.put("/update/:id", taskController.updateTask);

router.put("/update/status/:id", taskController.updateTaskStatus);

router.delete("/delete/:id", taskController.deleteTask);

module.exports = router;