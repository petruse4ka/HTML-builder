const path = require('node:path');
const fs = require('node:fs');

const writeFile = path.join(__dirname, 'text.txt');
const writeStream = fs.createWriteStream(writeFile);

process.stdin.setEncoding('utf-8');

process.stdout.write(
  'Tell us what you want to add to the text file? When you want to finalize the creation of the file, type "exit" or press Ctrl+C.\n',
);

process.stdin.on('data', (text) => {
  if (text.trim() === 'exit') {
    process.stdout.write('Thank you, the file is created');
    writeStream.end();
    process.exit();
  } else {
    writeStream.write(text, (error) => {
      if (error) {
        console.log(`Error: ${error.message}`);
      }
    });
  }
});

process.on('SIGINT', () => {
  process.stdout.write('Thank you, the file is created');
  writeStream.end();
  process.exit();
});
