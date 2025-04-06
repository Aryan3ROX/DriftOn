import jwt from "jsonwebtoken";
import util from "util";
import connection from "../connection.js";
import { exec } from 'child_process';
import { promisify } from 'util';
import path from 'path';
import { fileURLToPath } from 'url';

const execAsync = promisify(exec);
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const javaBridgePath = path.join(__dirname, '..', 'JavaBridge.java');
const jdbcDriverPath = path.join(__dirname, '..', 'mysql-connector-j-8.0.33.jar');

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

// Simple helper to run Java commands
async function runJava(command, ...args) {
  try {
    // Make sure your Java file is compiled first with the JDBC driver
    await execAsync(`javac -cp "${jdbcDriverPath}" ${javaBridgePath}`);
    
    // Set up classpath separator based on OS
    const separator = process.platform === 'win32' ? ';' : ':';
    
    // Run the Java program with command and arguments
    const { stdout, stderr } = await execAsync(
      `java -cp "${path.dirname(javaBridgePath)}${separator}${jdbcDriverPath}" JavaBridge ${command} ${args.join(' ')}`
    );
    
    if (stderr && stderr.trim() !== '') {
      console.error('Java Error:', stderr);
      return { error: stderr };
    }
    
    return JSON.parse(stdout);
  } catch (error) {
    console.error('Error running Java:', error);
    return { error: error.message };
  }
}

// Get vehicle details using Java
const bookingPage = async (req, res) => {
  const { vehicleID } = req.body;
  
  try {
    // Call our Java bridge with the getVehicle command
    const result = await runJava('getVehicle', vehicleID);
    
    if (result.error) {
      return res.status(500).json({ error: `Java error: ${result.error}` });
    }
    
    if (result.status === 'success') {
      return res
        .status(200)
        .json({ message: "Vehicle Fetched Successfully!", vehicle: result.vehicle });
    } else {
      return res.status(404).json({ error: result.message || "Vehicle not found" });
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: "Database query error" });
  }
};

const bookRide = async (req, res) => {
  const { vehicleID, distance, days, price, driverID } = req.body;
  const userID = req.user.userID;
  
  // Format date without spaces
  const now = new Date();
  const date = now.toISOString().slice(0, 19).replace("T", "_").replace(/:/g, "-");

  try {
    // Call Java to book the ride
    const result = await runJava(
      'bookRide', 
      userID, 
      vehicleID, 
      date,  // Date without spaces
      distance, 
      price, 
      days, 
      driverID
    );
    
    if (result.error) {
      return res.status(500).json({ error: `Java error: ${result.error}` });
    }
    
    if (result.status === 'success') {
      return res
        .status(201)
        .json({ message: "Ride Booked Successfully!", rideID: result.rideID });
    } else {
      return res.status(500).json({ error: result.message || "Failed to book ride" });
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: "Database query error" });
  }
};

const submitFeedback = async (req, res) => {
  const { rideID, rating, review, recommendation } = req.body;

  try {
    // Call Java to submit feedback
    const result = await runJava('submitFeedback', rideID, rating, review, recommendation);
    if (result.error) {
      return res.status(500).json({ error: `Java error: ${result.error}` });
    }
    
    if (result.status === 'success') {
      return res
        .status(201)
        .json({ message: "Leaderboard Updated Successfully!" });
    } else {
      return res.status(500).json({ error: result.message || "Failed to submit feedback" });
    }
  } catch (error) {
    return res.status(500).json({ error: "Database query error" });
  }
};

const viewHistory = async (req, res) => {
  const userID = req.user.userID;
  
  try {
    // Call Java to get user's ride history
    const result = await runJava('viewHistory', userID);
    
    if (result.error) {
      return res.status(500).json({ error: `Java error: ${result.error}` });
    }
    
    if (result.status === 'success') {
      return res
        .status(200)
        .json({ message: "Successfully Fetched User Rides!", results: result.results });
    } else {
      return res.status(500).json({ error: result.message || "Failed to fetch history" });
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: "Database query error" });
  }
};

const viewDetailedReview = async (req, res) => {
  const { rideID } = req.body;
  
  try {
    // Call Java to get detailed review
    const result = await runJava('viewDetailedReview', rideID);
    
    if (result.error) {
      return res.status(500).json({ error: `Java error: ${result.error}` });
    }
    
    if (result.status === 'success') {
      return res
        .status(200)
        .json({ message: "Successfully Fetched Detailed User Review!", review: result.review });
    } else {
      return res.status(500).json({ error: result.message || "Failed to fetch review" });
    }
  } catch (error) {
    console.log(error);
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
