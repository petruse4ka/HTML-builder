const fs = require('node:fs/promises');
const path = require('node:path');

async function copyFolder(source, destination) {
  try {
    await fs.mkdir(destination, { recursive: true });

    const destinationContents = await fs.readdir(destination, {
      withFileTypes: true,
    });

    for (const content of destinationContents) {
      const contentPath = path.join(destination, content.name);
      if (content.isFile()) {
        await fs.unlink(contentPath);
      } else if (content.isDirectory()) {
        await fs.rm(contentPath, { recursive: true });
      }
    }

    const sourceContents = await fs.readdir(source, { withFileTypes: true });

    for (const content of sourceContents) {
      const sourcePath = path.join(source, content.name);
      const destinationPath = path.join(destination, content.name);

      if (content.isFile()) {
        await fs.copyFile(sourcePath, destinationPath);
      } else if (content.isDirectory()) {
        await copyFolder(sourcePath, destinationPath);
      }
    }

    process.stdout.write(
      `Folder ${source} and all of its contents has been successfully copied.\n`,
    );
  } catch (error) {
    process.stdout.write(`Error: ${error.message}`);
  }
}

const currentFolderPath = path.join(__dirname, 'files');
const newFolderPath = path.join(__dirname, 'files-copy');

copyFolder(currentFolderPath, newFolderPath);
