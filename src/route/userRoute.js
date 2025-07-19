const express = require("express")
const { registration, getUserById, updateUserById, getAllUsers } = require("../controller/userController")
const { authenticate } = require("../middleware/authMiddleware")
const router = express.Router()

router.post("/register", registration)
router.get("/:id", authenticate, getUserById)
router.put("/:id", authenticate, updateUserById)
router.get("/", authenticate, getAllUsers)

module.exports = router