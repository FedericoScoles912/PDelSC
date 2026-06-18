// Fix Bootstrap URLs in all project HTML files
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const projectsDir = path.join(__dirname, 'Projects');

// Get all project directories
const getProjectDirs = () => {
  const entries = fs.readdirSync(projectsDir, { withFileTypes: true });
  return entries
    .filter(entry => entry.isDirectory())
    .map(entry => path.join(projectsDir, entry.name));
};

// Fix the Bootstrap URL in a file
const fixFile = (dir) => {
  const filePath = path.join(dir, 'index.html');
  if (!fs.existsSync(filePath)) {
    console.log(`File not found: ${filePath}`);
    return;
  }

  let content = fs.readFileSync(filePath, 'utf8');
  
  // Replace both CSS and JS URLs (though our files don't have JS yet, just in case)
  let fixedContent = content;
  
  // Replace bootstrap-5.3.0 with bootstrap@5.3.0
  fixedContent = fixedContent.replaceAll('bootstrap-5.3.0', 'bootstrap@5.3.0');
  
  if (fixedContent !== content) {
    fs.writeFileSync(filePath, fixedContent, 'utf8');
    console.log(`Fixed: ${filePath}`);
  } else {
    console.log(`No changes needed for: ${filePath}`);
  }
};

// Run the fix
console.log('Fixing Bootstrap URLs...');
const projectDirs = getProjectDirs();
projectDirs.forEach(fixFile);

console.log('All files processed!');
