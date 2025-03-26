import { Router } from "express"
import { registerUser, loginUser, logoutUser } from "./auth/user.js"
import {authenticateToken,viewHistory,bookRide,submitFeedback,viewDetailedReview} from "./controllers/user_controller.js"
import { getDrivers,getLeaderboard,getVehicles } from "./controllers/nonuser_controller.js"
// import { login } from "../../frontend/DriftOn/src/redux/authSlice"

const router = Router()

router.route("/register").post(registerUser)

router.route("/login").post(loginUser)

router.route("/logout").post(logoutUser)

router.route("/view-history").get(authenticateToken,viewHistory)

router.route("/book-ride").post(authenticateToken,bookRide)

router.route("/submit-feedback").post(authenticateToken,submitFeedback)

router.route("/view-detailed-review").get(authenticateToken,viewDetailedReview)

router.route("/get-vehicles").get(getVehicles)

router.route("/get-drivers").get(getDrivers)

router.route("/get-leaderboard").get(getLeaderboard)

export default router