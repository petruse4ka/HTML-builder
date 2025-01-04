const fs = require('node:fs/promises');
const path = require('node:path');

async function bundleHtml(source, destination, components) {
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

    const templateContent = await fs.readFile(source, 'utf-8');
    const indexFilePath = path.join(destination, 'index.html');

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
      `File ${indexFilePath} has been successfully bundled.\n`,
    );
  } catch (error) {
    process.stdout.write(`Error: ${error.message}`);
  }
}

const componentsPath = path.join(__dirname, 'components');
const sourcePath = path.join(__dirname, 'template.html');
const destinationPath = path.join(__dirname, 'projects-dist');

bundleHtml(sourcePath, destinationPath, componentsPath);
