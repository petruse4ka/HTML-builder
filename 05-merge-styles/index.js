const path = require('node:path');
const fs = require('node:fs/promises');
const { createReadStream, createWriteStream } = require('node:fs');

async function mergeStyles(source, destination) {
  try {
    const destinationContent = await fs.readdir(destination, {
      withFileTypes: true,
    });
    const writePath = path.join(destination, 'bundle.css');
    const writeFileName = path.basename(writePath);

    for (const content of destinationContent) {
      const contentPath = path.join(destination, content.name);
      const contentName = path.basename(contentPath);

      if (content.isFile() && contentName === writeFileName) {
        await fs.unlink(contentPath);
      }
    }

    const writeStream = createWriteStream(writePath, 'utf-8');
    const sourceContent = await fs.readdir(source, { withFileTypes: true });

    for (const content of sourceContent) {
      const contentPath = path.join(source, content.name);
      const contentExtension = path.extname(contentPath);
      const contentName = path.basename(contentPath);

      if (content.isFile() && contentExtension === '.css') {
        const readStream = createReadStream(contentPath, 'utf-8');

        for await (const chunk of readStream) {
          writeStream.write(`${chunk}\n`);
        }
        process.stdout.write(
          `${contentName} is successfully compiled into ${writeFileName}\n`,
        );
      }
    }

    writeStream.end();

    writeStream.on('finish', () => {
      process.stdout.write(
        `File ${writeFileName} has been successfully created.\n`,
      );
    });
  } catch (error) {
    process.stdout.write(`Error: ${error.message}`);
  }
}

const sourcePath = path.join(__dirname, 'styles');
const destinationPath = path.join(__dirname, 'project-dist');

mergeStyles(sourcePath, destinationPath);
