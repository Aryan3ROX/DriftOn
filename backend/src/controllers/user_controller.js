import jwt from "jsonwebtoken";
import util from "util";
import connection from "../connection.js";

const options = {
  httpOnly: true,
  // secure: true
};

const query = util.promisify(connection.query).bind(connection);

const authenticateToken = async (req, res, next) => {
  const token =
    req.cookies?.token || req.header("Authorization")?.replace("Bearer ", "");
  if (!token) return res.status(401).json({ error: "Access Denied!" });

  jwt.verify(token, process.env.JWT_SECRET, (error, user) => {
    if (error) return res.status(403).json({ error: "Invalid Token!" });
    req.user = user;
    next();
  });
};

const bookingPage = async (req, res) => {
  const { vehicleID } = req.body;
  try {
    const vehicle = await query(`SELECT * FROM vehicles WHERE vehicleID = ?`, [
      vehicleID,
    ]);

    return res
      .status(200)
      .json({ message: "Vehicle Fetched Successfully!", vehicle });
  } catch (error) {
    return res.status(500).json({ error: "Database query error" });
  }
};

const bookRide = async (req, res) => {
  const { vehicleID, distance, days, price, driverID } = req.body;
  const userID = req.user.userID;
  const date = new Date().toISOString().slice(0, 19).replace("T", " ");

  try {
    const lastRide = await query(
      "SELECT rideID FROM bookings ORDER BY rideID DESC LIMIT 1"
    );
    let rideID = lastRide.length > 0 ? lastRide[0].rideID : 0;

    await query(`INSERT INTO bookings VALUES (?, ?, ?, ?, ?, ?, ?, ?)`, [
      rideID + 1,
      userID,
      vehicleID,
      date,
      distance,
      price,
      days,
      driverID,
    ]);

    return res
      .status(201)
      .json({ message: "Ride Booked Successfully!", rideID: rideID + 1 });
  } catch (error) {
    return res.status(500).json({ error: "Database query error" });
  }
};

const submitFeedback = async (req, res) => {
  const { rideID, rating, review, recommendation } = req.body;

  try {
    const vehicle = await query(`SELECT * FROM bookings WHERE rideID = ?`, [
      rideID,
    ]);
    const vehicleID = vehicle[0].vehicleID;
    const driverID = vehicle[0].driverID;

    if (driverID !== null) {
      await query(
        `UPDATE drivers SET total_trips = total_trips + 1, rating = ((rating * (total_trips - 1)) + ?) / total_trips WHERE driverID = ?`,
        [rating, driverID]
      );
    }

    await query(`INSERT INTO leaderboard VALUES (?, ?, ?, ?, ?)`, [
      rideID,
      vehicleID,
      rating,
      review,
      recommendation,
    ]);

    return res
      .status(201)
      .json({ message: "Leaderboard Updated Successfully!" });
  } catch (error) {
    return res.status(500).json({ error: "Database query error" });
  }
};

const viewHistory = async (req, res) => {
  const user = req.user;
  try {
    const results = await query(`SELECT * FROM bookings WHERE userID = ? ORDER BY date DESC`, [
      user.userID,
    ]);

    return res
      .status(200)
      .json({ message: "Successfully Fetched User Rides!", results });
  } catch (error) {
    return res.status(500).json({ error: "Database query error" });
  }
};

const viewDetailedReview = async (req, res) => {
  const { rideID } = req.body;
  try {
    const review = await query(`SELECT * FROM leaderboard WHERE rideID = ?`, [
      rideID,
    ]);

    return res
      .status(200)
      .json({ message: "Successfully Fetched Detailed User Review!", review });
  } catch (error) {
    return res.status(500).json({ error: "Database query error" });
  }
};

export {
  authenticateToken,
  bookingPage,
  viewHistory,
  bookRide,
  submitFeedback,
  viewDetailedReview,
};
