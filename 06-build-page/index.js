const fs = require('node:fs/promises');
const path = require('node:path');
const { createReadStream, createWriteStream } = require('node:fs');

async function bundleProject(
  htmlSource,
  stylesSource,
  destination,
  components,
) {
  try {
    await fs.mkdir(destination, { recursive: true });

    const destinationContent = await fs.readdir(destinationPath, {
      withFileTypes: true,
    });

    for (const content of destinationContent) {
      const contentPath = path.join(destinationPath, content.name);
      if (content.isFile()) {
        await fs.unlink(contentPath);
      } else if (content.isDirectory()) {
        await fs.rm(contentPath);
      }
    }

    const templateContent = await fs.readFile(htmlSource, 'utf-8');
    const indexFilePath = path.join(destination, 'index.html');
    const indexFileName = path.basename(indexFilePath);

    await fs.writeFile(indexFilePath, templateContent, 'utf-8');

    let indexFileContent = await fs.readFile(indexFilePath, 'utf-8');
    const componentsContent = await fs.readdir(components, {
      withFileTypes: true,
    });

    for (const component of componentsContent) {
      const componentPath = path.join(components, component.name);
      const componentExtension = path.extname(componentPath);
      const componentName = path.basename(componentPath, componentExtension);
      if (component.isFile() && componentExtension === '.html') {
        const componentContent = await fs.readFile(componentPath, 'utf-8');
        indexFileContent = indexFileContent
          .split(`{{${componentName}}}`)
          .join(componentContent);
      }
    }

    await fs.writeFile(indexFilePath, indexFileContent, 'utf-8');

    process.stdout.write(
      `File ${indexFileName} has been successfully created in ${destination}.\n`,
    );

    const writePath = path.join(destination, 'style.css');
    const writeFileName = path.basename(writePath);
    const writeStream = createWriteStream(writePath, 'utf-8');
    const sourceContent = await fs.readdir(stylesSource, {
      withFileTypes: true,
    });

    for (const content of sourceContent) {
      const contentPath = path.join(stylesSource, content.name);
      const contentExtension = path.extname(contentPath);

      if (content.isFile() && contentExtension === '.css') {
        const readStream = createReadStream(contentPath, 'utf-8');

        for await (const chunk of readStream) {
          writeStream.write(`${chunk}\n`);
        }
      }
    }

    writeStream.end();

    writeStream.on('finish', () => {
      process.stdout.write(
        `File ${writeFileName} has been successfully created in ${destination}.\n`,
      );
    });
  } catch (error) {
    process.stdout.write(`Error: ${error.message}`);
  }
}

const stylesSourcePath = path.join(__dirname, 'styles');
const componentsPath = path.join(__dirname, 'components');
const htmlSourcePath = path.join(__dirname, 'template.html');
const destinationPath = path.join(__dirname, 'projects-dist');

bundleProject(
  htmlSourcePath,
  stylesSourcePath,
  destinationPath,
  componentsPath,
);
