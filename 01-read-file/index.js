const path = require('node:path');
const fs = require('node:fs');

const filePath = path.join(__dirname, 'text.txt');
const readStream = fs.createReadStream(filePath, 'utf8');

async function readFile(stream) {
  try {
    for await (const chunk of stream) {
      process.stdout.write(chunk);
    }
  } catch (error) {
    console.error(`Error: ${error.message}`);
  }
}

readFile(readStream);
