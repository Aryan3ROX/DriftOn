import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import https from 'https';
import { createWriteStream } from 'fs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const jdbcDriverPath = path.join(__dirname, 'mysql-connector-j-8.0.33.jar');

// Download the JDBC driver if it doesn't exist
async function downloadJdbcDriver() {
  if (fs.existsSync(jdbcDriverPath)) {
    console.log('MySQL JDBC driver already exists.');
    return true;
  }
  
  console.log('Downloading MySQL JDBC driver...');
  const url = 'https://repo1.maven.org/maven2/com/mysql/mysql-connector-j/8.0.33/mysql-connector-j-8.0.33.jar';
  
  return new Promise((resolve, reject) => {
    const file = createWriteStream(jdbcDriverPath);
    https.get(url, (response) => {
      response.pipe(file);
      file.on('finish', () => {
        file.close();
        console.log('Download completed.');
        resolve(true);
      });
    }).on('error', (err) => {
      fs.unlink(jdbcDriverPath, () => {});
      console.error('Error downloading the JDBC driver:', err.message);
      console.log('Please download it manually from:');
      console.log('https://dev.mysql.com/downloads/connector/j/');
      console.log('and place it in:', __dirname);
      reject(err);
    });
  });
}

downloadJdbcDriver()
  .then(() => console.log('Setup complete.'))
  .catch(err => console.error('Setup failed:', err));