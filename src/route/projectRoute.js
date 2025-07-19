const express = require("express")
const { createProject, getAllProjects } = require("../controller/projectController")
const router = express.Router()

router.post("/", createProject)
router.get("/", getAllProjects)

module.exports = router