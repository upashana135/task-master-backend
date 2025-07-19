const express = require("express")
const { createTeam, getTeams, deleteATeam } = require("../controller/teamController")
const router = express.Router()

router.post("/", createTeam)
router.get("/", getTeams)
router.delete("/:id", deleteATeam)

module.exports = router