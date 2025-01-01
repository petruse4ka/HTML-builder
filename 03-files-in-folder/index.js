const fs = require('node:fs/promises');
const path = require('node:path');

async function showFileInfo(folder) {
  try {
    const files = await fs.readdir(folder, { withFileTypes: true });

    for (const file of files) {
      if (file.isFile()) {
        const fileExtension = path.extname(file.name);
        const fileName = path.basename(file.name, fileExtension);
        const filePath = path.join(folder, file.name);
        const fileSize = (await fs.stat(filePath)).size / 1024;

        process.stdout.write(
          `${fileName} - ${fileExtension.slice(1)} - ${fileSize.toFixed(
            2,
          )}kb\n`,
        );
      }
    }
  } catch (error) {
    process.stdout.write(`Error: ${error.message}`);
  }
}

const folderPath = path.join(__dirname, 'secret-folder');

showFileInfo(folderPath);
