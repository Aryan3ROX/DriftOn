import { Router } from "express"
import { registerUser, loginUser, logoutUser } from "./auth/user.js"
import {authenticateToken,viewHistory,bookRide,submitFeedback,viewDetailedReview,bookingPage} from "./controllers/user_controller.js"
import { getDrivers,getLeaderboard,getVehicles,getPromos } from "./controllers/nonuser_controller.js"

const router = Router()

router.route("/register").post(registerUser)

router.route("/login").post(loginUser)

router.route("/logout").post(logoutUser)

router.route("/view-history").get(authenticateToken,viewHistory)

router.route("/booking").post(authenticateToken,bookingPage)

router.route("/book-ride").post(authenticateToken,bookRide)

router.route("/submit-feedback").post(authenticateToken,submitFeedback)

router.route("/view-detailed-review").post(authenticateToken,viewDetailedReview)

router.route("/get-vehicles").post(getVehicles)

router.route("/get-drivers").post(getDrivers)

router.route("/get-promos").get(getPromos)

router.route("/get-leaderboard").get(getLeaderboard)

export default router