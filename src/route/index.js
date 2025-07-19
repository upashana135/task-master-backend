const express = require("express")
const router = express.Router()

const userRoutes = require("./userRoute")
const authRoutes = require("./authRoute")
const taskRoutes = require("./taskRoute")
const teamRoutes = require("./teamRoute")
const teamMemberRoutes = require("./teamMemberRoute")
const projectRoutes = require("./projectRoute")
const { authenticate } = require("../middleware/authMiddleware")


router.use("/users", userRoutes)
router.use("/", authRoutes);
router.use("/teams", authenticate, teamRoutes)
router.use("/team-member", authenticate, teamMemberRoutes)
router.use("/projects", authenticate, projectRoutes)
router.use("/tasks", authenticate, taskRoutes)

module.exports = router

