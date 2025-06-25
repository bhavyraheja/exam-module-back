const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Build configuration
const config = {
  sourceDir: 'src',
  buildDir: 'dist',
  filesToCopy: [
    '.env',
    'package.json',
    'package-lock.json',
    'README.md'
  ],
  // Add any directories with static assets that need to be copied
  staticDirs: [
    'public',
    'uploads'
  ]
};

// Create build directory
function createBuildDir() {
  console.log('Creating build directory...');
  if (fs.existsSync(config.buildDir)) {
    fs.rmSync(config.buildDir, { recursive: true, force: true });
  }
  fs.mkdirSync(config.buildDir);
}

// Copy source files
function copySourceFiles() {
  console.log('Copying source files...');
  
  // Create source directory in build if it doesn't exist
  if (!fs.existsSync(path.join(config.buildDir, config.sourceDir))) {
    fs.mkdirSync(path.join(config.buildDir, config.sourceDir), { recursive: true });
  }
  
  // Copy all JavaScript files from the source directory
  const copyDir = (src, dest) => {
    if (!fs.existsSync(src)) return;
    
    const entries = fs.readdirSync(src, { withFileTypes: true });
    
    entries.forEach(entry => {
      const srcPath = path.join(src, entry.name);
      const destPath = path.join(dest, entry.name);
      
      if (entry.isDirectory()) {
        fs.mkdirSync(destPath, { recursive: true });
        copyDir(srcPath, destPath);
      } else if (entry.name.endsWith('.js')) {
        fs.copyFileSync(srcPath, destPath);
      }
    });
  };
  
  copyDir(config.sourceDir, path.join(config.buildDir, config.sourceDir));
}

// Copy static files and directories
function copyStaticFiles() {
  console.log('Copying static files...');
  
  // Copy individual files
  config.filesToCopy.forEach(file => {
    if (fs.existsSync(file)) {
      fs.copyFileSync(file, path.join(config.buildDir, path.basename(file)));
    }
  });
  
  // Copy static directories
  config.staticDirs.forEach(dir => {
    if (fs.existsSync(dir)) {
      const destDir = path.join(config.buildDir, dir);
      fs.mkdirSync(destDir, { recursive: true });
      
      copyDir(dir, destDir);
    }
  });
  
  function copyDir(src, dest) {
    const entries = fs.readdirSync(src, { withFileTypes: true });
    
    entries.forEach(entry => {
      const srcPath = path.join(src, entry.name);
      const destPath = path.join(dest, entry.name);
      
      if (entry.isDirectory()) {
        fs.mkdirSync(destPath, { recursive: true });
        copyDir(srcPath, destPath);
      } else {
        fs.copyFileSync(srcPath, destPath);
      }
    });
  }
}

// Install production dependencies
function installDependencies() {
  console.log('Installing production dependencies...');
  process.chdir(config.buildDir);
  execSync('npm install --production', { stdio: 'inherit' });
  process.chdir('..');
}

// Create production start script
function createStartScript() {
  console.log('Creating start script...');
  const startScript = `#!/bin/sh
node src/app.js`;
  
  fs.writeFileSync(path.join(config.buildDir, 'start.sh'), startScript);
  fs.chmodSync(path.join(config.buildDir, 'start.sh'), '755');
}

// Main build function
function build() {
  console.log('Starting build process...');
  createBuildDir();
  copySourceFiles();
  copyStaticFiles();
  installDependencies();
  createStartScript();
  console.log('Build completed successfully! Your build is in the dist/ directory.');
}

// Execute build
build();