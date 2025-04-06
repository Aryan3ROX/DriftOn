import { exec } from 'child_process';
import { promisify } from 'util';
import path from 'path';
import { fileURLToPath } from 'url';

const execAsync = promisify(exec);
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const javaBridgePath = path.join(__dirname, '..', 'JavaBridge.java');
const jdbcDriverPath = path.join(__dirname, '..', 'mysql-connector-j-8.0.33.jar');

// Helper to run Java commands
async function runJava(command, ...args) {
  try {
    // Make sure your Java file is compiled first with the JDBC driver
    await execAsync(`javac -cp "${jdbcDriverPath}" ${javaBridgePath}`);
    
    // Set up classpath separator based on OS
    const separator = process.platform === 'win32' ? ';' : ':';
    
    // Replace null/undefined values with "null" string
    const processedArgs = args.map(arg => arg === null || arg === undefined ? "null" : arg);
    
    // Run the Java program with command and arguments
    const { stdout, stderr } = await execAsync(
      `java -cp "${path.dirname(javaBridgePath)}${separator}${jdbcDriverPath}" JavaBridge ${command} ${processedArgs.join(' ')}`
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

const getVehicles = async (req, res) => {
  const { name, fuel_type, transmission, seats, price_per_day, type } = req.body;
  
  try {
    const result = await runJava(
      'getVehicles', 
      name || null,
      fuel_type || null,
      transmission || null,
      seats || null,
      price_per_day || null,
      type || null
    );
    
    if (result.error) {
      return res.status(500).json({ error: `Java error: ${result.error}` });
    }
    
    if (result.status === 'success') {
      return res
        .status(200)
        .json({ message: "Fetched Vehicles Successfully!", vehicles: result.vehicles });
    } else {
      return res.status(500).json({ error: result.message || "Failed to fetch vehicles" });
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: "Database query error" });
  }
};

const getDrivers = async (req, res) => {
  const { rating, price_per_day, preference } = req.body;
  
  try {
    const result = await runJava(
      'getDrivers', 
      rating || null,
      price_per_day || null,
      preference || null
    );
    
    if (result.error) {
      return res.status(500).json({ error: `Java error: ${result.error}` });
    }
    
    if (result.status === 'success') {
      return res
        .status(200)
        .json({ message: "Fetched Drivers Successfully!", drivers: result.drivers });
    } else {
      return res.status(500).json({ error: result.message || "Failed to fetch drivers" });
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: "Database query error" });
  }
};

const getPromos = async (req, res) => {
  try {
    const result = await runJava('getPromos');
    
    if (result.error) {
      return res.status(500).json({ error: `Java error: ${result.error}` });
    }
    
    if (result.status === 'success') {
      return res
        .status(200)
        .json({ message: "Promotions Fetched Successfully!", promos: result.promos });
    } else {
      return res.status(500).json({ error: result.message || "Failed to fetch promotions" });
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: "Database query error" });
  }
};

const getLeaderboard = async (req, res) => {
  try {
    const result = await runJava('getLeaderboard');
    
    if (result.error) {
      return res.status(500).json({ error: `Java error: ${result.error}` });
    }
    
    if (result.status === 'success') {
      return res
        .status(200)
        .json({ 
          message: "Fetched Leaderboard Successfully!", 
          rides: result.rides,
          drivers: result.drivers,
          vehicles: result.vehicles
        });
    } else {
      return res.status(500).json({ error: result.message || "Failed to fetch leaderboard" });
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: "Database query error" });
  }
};

export { getDrivers, getLeaderboard, getVehicles, getPromos };
