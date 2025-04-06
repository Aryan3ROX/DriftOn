import { exec } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const javaBridgePath = path.join(__dirname, 'JavaBridge.java');
const jdbcDriverPath = path.join(__dirname, 'mysql-connector-j-8.0.33.jar'); // Update with your driver name

// Download MySQL connector if it doesn't exist
async function ensureJdbcDriver() {
  if (!fs.existsSync(jdbcDriverPath)) {
    console.log('MySQL JDBC driver not found. Please download it from:');
    console.log('https://dev.mysql.com/downloads/connector/j/');
    console.log('and place it in:', __dirname);
    console.log('File name should be:', path.basename(jdbcDriverPath));
    process.exit(1);
  }
}

// Simple function to compile and run the Java bridge
async function testJavaBridge() {
  await ensureJdbcDriver();
  
  console.log('Compiling JavaBridge.java...');
  
  exec(`javac -cp "${jdbcDriverPath}" ${javaBridgePath}`, (compileError) => {
    if (compileError) {
      console.error('Compilation error:', compileError);
      return;
    }
    
    console.log('Running Java bridge with test command...');
    
    const vehicleID = 1; // Test with vehicle ID 1
    
    // Include both the current directory and the MySQL connector JAR in the classpath
    exec(`java -cp "${path.dirname(javaBridgePath)};${jdbcDriverPath}" JavaBridge getVehicle ${vehicleID}`, 
      (error, stdout, stderr) => {
        if (error) {
          console.error('Error running Java:', error);
          return;
        }
        
        if (stderr) {
          console.error('Java stderr:', stderr);
        }
        
        console.log('Java bridge output:');
        console.log(stdout);
        
        try {
          const result = JSON.parse(stdout);
          console.log('Parsed result:');
          console.log(JSON.stringify(result, null, 2));
        } catch (parseError) {
          console.error('Error parsing Java output as JSON:', parseError);
        }
      }
    );
  });
}

testJavaBridge();