const fs = require('node:fs/promises');
const path = require('node:path');
const { createReadStream, createWriteStream } = require('node:fs');

async function bundleHtml(source, destination, components) {
  try {
    const templateContent = await fs.readFile(source, 'utf-8');
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
  } catch (error) {
    process.stdout.write(`bundleHtml error: ${error.message}`);
  }
}

async function bundleStyles(source, destination) {
  try {
    const writePath = path.join(destination, 'style.css');
    const writeFileName = path.basename(writePath);
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
        `File ${writeFileName} has been successfully created in ${destination}.\n`,
      );
    });
  } catch (error) {
    process.stdout.write(`bundleStyles error: ${error.message}`);
  }
}

async function bundleAssets(source, destination) {
  try {
    await fs.mkdir(destination, { recursive: true });

    const sourceContents = await fs.readdir(source, { withFileTypes: true });

    for (const content of sourceContents) {
      const sourcePath = path.join(source, content.name);
      const destinationPath = path.join(destination, content.name);

      if (content.isFile()) {
        await fs.copyFile(sourcePath, destinationPath);
      } else if (content.isDirectory()) {
        await bundleAssets(sourcePath, destinationPath);
      }
    }

    process.stdout.write(
      `Folder ${source} and all of its contents has been successfully copied in ${destination}.\n`,
    );
  } catch (error) {
    process.stdout.write(`bundleAssets error: ${error.message}`);
  }
}

async function bundleProject(
  htmlSource,
  stylesSource,
  assetsSources,
  destination,
  components,
  assetsDestination,
) {
  try {
    await fs.mkdir(destination, { recursive: true });
    const destinationContent = await fs.readdir(destination, {
      withFileTypes: true,
    });

    for (const content of destinationContent) {
      const contentPath = path.join(destination, content.name);
      if (content.isFile()) {
        await fs.unlink(contentPath);
      } else if (content.isDirectory()) {
        await fs.rm(contentPath, { recursive: true });
      }
    }

    await bundleHtml(htmlSource, destination, components);
    await bundleStyles(stylesSource, destination);
    await bundleAssets(assetsSources, assetsDestination);
  } catch (error) {
    process.stdout.write(`bundleProject error: ${error.message}\n`);
  }
}

const stylesSourcePath = path.join(__dirname, 'styles');
const componentsPath = path.join(__dirname, 'components');
const htmlSourcePath = path.join(__dirname, 'template.html');
const destinationPath = path.join(__dirname, 'project-dist');
const assetsSourcePath = path.join(__dirname, 'assets');
const assetsDestinationPath = path.join(destinationPath, 'assets');

bundleProject(
  htmlSourcePath,
  stylesSourcePath,
  assetsSourcePath,
  destinationPath,
  componentsPath,
  assetsDestinationPath,
);
