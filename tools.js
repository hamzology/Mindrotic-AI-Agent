const fs = require('fs/promises');
const fsall = require('fs');
const path = require('path');
const { exec } = require('child_process');
const { execSync } = require('child_process');

// Security check to ensure file access is within the project directory
const isPathSafe = (baseDir, targetPath) => {
    const resolvedBase = path.resolve(baseDir);
    const resolvedTarget = path.resolve(baseDir, targetPath);
    return resolvedTarget.startsWith(resolvedBase);
};

const listDir = async (baseDir, subDir = '.') => {
    const dirPath = path.join(baseDir, subDir);
    if (!isPathSafe(baseDir, dirPath)) throw new Error('Access denied');
    const entries = await fs.readdir(dirPath, { withFileTypes: true });
    return entries.map(entry => ({
        name: entry.name,
        isDirectory: entry.isDirectory(),
    }));
};

const readFile = async (baseDir, filePath) => {
    const fullPath = path.join(baseDir, filePath);
    if (!isPathSafe(baseDir, fullPath)) throw new Error('Access denied');
    try {
        return await fs.readFile(fullPath, 'utf-8');
    } catch (error) {
        return `Error reading file: ${error.message}`;
    }
};

const writeFile = async (baseDir, filePath, content) => {
    const fullPath = path.join(baseDir, filePath);
    if (!isPathSafe(baseDir, fullPath)) throw new Error('Access denied');
    await fs.mkdir(path.dirname(fullPath), { recursive: true });
    await fs.writeFile(fullPath, content);
    return `File written: ${filePath}`;
};

const execCommand = (baseDir, command) => {
    if (!isPathSafe(baseDir, baseDir)) throw new Error('Invalid working directory');
    return new Promise((resolve, reject) => {
        exec(command, { cwd: baseDir }, (error, stdout, stderr) => {
            if (error) {
                reject(`Error: ${error.message}\nStderr: ${stderr}`);
                return;
            }
            resolve(stdout);
        });
    });
};

const appendloga = async (content) => {
        const readmePath = path.join(agentState.directory, 'README.md');
        try {
            const currentContent = await readFile(agentState.directory, 'README.md');
            const newContent = `${currentContent}\n\n---\n\n## Progress Update\n\n${content}`;
            await writeFile(agentState.directory, 'README.md', newContent);
            return 'README.md updated with progress.';
        } catch (e) { // README doesn't exist, create it
            await writeFile(agentState.directory, 'README.md', content);
            return 'README.md created with initial content.';
        }
    }

const ProjectMarkdown = (projectDir) => {
  if (!fsall.existsSync(projectDir) || !fsall.lstatSync(projectDir).isDirectory()) {
    throw new Error('Directory does not exist!');
  }

  const skipDirs = ['node_modules', 'vendor'];
  const skipFiles = ['package-lock.json', 'log.md', '.env'];

  let markdown = '';

  // Project Folder Structure using `tree`, excluding node_modules and vendor
  markdown += '## 📁 Project Folders and Files Structure\n';
  markdown += '```\n';
  try {
    const treeOutput = execSync(`tree -I "${skipDirs.join('|')}" "${projectDir}"`, {
      encoding: 'utf8',
    });
	  
  const lines = treeOutput.split('\n');
  const trimmedOutput = lines.slice(1).join('\n');
    markdown += trimmedOutput;
  } catch (err) {
    markdown += '[Error generating tree structure]\n';
  }
  markdown += '```\n\n';


  const listFiles = (dir) => {
    const results = [];
    const files = fsall.readdirSync(dir);
    for (const file of files) {
      const fullPath = path.join(dir, file);
      const stat = fsall.lstatSync(fullPath);

      const isSkipDir = stat.isDirectory() && skipDirs.includes(file);
      const isSkipFile =
        stat.isFile() && skipFiles.includes(file.toLowerCase());

      if (isSkipDir) continue;
      if (stat.isDirectory()) {
        results.push(...listFiles(fullPath));
      } else if (!isSkipFile) {
        results.push(fullPath);
      }
    }
    return results;
  };

  const allFiles = listFiles(projectDir);
  if (allFiles.length === 0) {
    return '';
  }
  //return markdown;
  // File Contents
  markdown += '## 📄 File Contents\n';

  for (const filePath of allFiles) {
    const relativePath = path.relative(projectDir, filePath);
    markdown += `### ${relativePath}\n`;
    markdown += '```\n';
    try {
      const content = fsall.readFileSync(filePath, 'utf8');
      markdown += content;
    } catch (err) {
      markdown += '[Error reading file content]';
    }
    markdown += '\n```\n\n';
  }

  return markdown;
};
module.exports = { listDir, readFile, writeFile, execCommand, appendloga, ProjectMarkdown };