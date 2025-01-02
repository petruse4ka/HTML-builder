const fs = require('node:fs/promises');
const path = require('node:path');

async function copyFolder(source, destination) {
  try {
    await fs.mkdir(destination, { recursive: true });

    const destinationContents = await fs.readdir(destination, {
      withFileTypes: true,
    });

    for (const content of destinationContents) {
      const filePath = path.join(destination, content.name);
      if (content.isFile()) {
        await fs.unlink(filePath);
      }
    }

    const sourceContents = await fs.readdir(source, { withFileTypes: true });

    for (const content of sourceContents) {
      const sourcePath = path.join(source, content.name);
      const destinationPath = path.join(destination, content.name);

      if (content.isFile()) {
        await fs.copyFile(sourcePath, destinationPath);
      }
    }

    process.stdout.write('All the files have been successfully copied');
  } catch (error) {
    process.stdout.write(`Error: ${error.message}`);
  }
}

const currentFolderPath = path.join(__dirname, 'files');
const newFolderPath = path.join(__dirname, 'files-copy');

copyFolder(currentFolderPath, newFolderPath);
