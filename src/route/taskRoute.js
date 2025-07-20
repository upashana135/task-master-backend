const express = require("express")
const { createTask, getAllTask, deleteATask, markTaskCompleted, addTaskComment } = require("../controller/taskController")
const router = express.Router()

router.post("/", createTask)
router.get("/", getAllTask)
router.delete("/:id", deleteATask)
router.patch("/:id", markTaskCompleted)
router.post("/:taskId/comments", addTaskComment)

module.exports = router