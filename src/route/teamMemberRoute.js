const express = require("express")
const { teamMemberInvitation, updateInvitation, getTeamMemberByTeamId } = require("../controller/teamMemberController")
const router = express.Router()

router.post("/:teamId", teamMemberInvitation)
router.patch("/:memberId", updateInvitation)
router.get("/:teamId", getTeamMemberByTeamId)

module.exports = router