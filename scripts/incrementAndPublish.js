/**
 * Script to increment version numbers and publish codemods
 * 
 * Usage:
 * 1. Make sure you have the codemod CLI installed globally:
 *    npm install -g @codemod/cli
 * 
 * 2. Run the script from the project root:
 *    node scripts/incrementAndPublish.js [folderPath] [--major|--minor]
 * 
 * Arguments:
 * - folderPath: (optional) Path to the folder containing codemods. If not provided,
 *              defaults to codemods/nodejs/devcycle-to-openfeature
 * - --major: (optional) Increment the major version number
 * - --minor: (optional) Increment the minor version number
 * 
 * If neither --major nor --minor is provided, the patch version will be incremented.
 * 
 * The script will:
 * - Find all .codemodrc.json files in the specified directory
 * - Increment the version number in each file according to the specified level
 * - Run 'codemod publish' in each directory containing a configuration file
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const defaultRootDir = path.join(__dirname, '..', 'codemods', 'nodejs', 'devcycle-to-openfeature');

function parseArgs() {
    const args = process.argv.slice(2);
    let folderPath = defaultRootDir;
    let versionType = 'patch';

    for (let i = 0; i < args.length; i++) {
        if (args[i] === '--major') {
            versionType = 'major';
        } else if (args[i] === '--minor') {
            versionType = 'minor';
        } else if (!args[i].startsWith('--')) {
            folderPath = args[i];
        }
    }

    return { folderPath, versionType };
}

function findCodemodrcFiles(dir) {
    const files = [];
    const items = fs.readdirSync(dir);
    
    for (const item of items) {
        const fullPath = path.join(dir, item);
        const stat = fs.statSync(fullPath);
        
        if (stat.isDirectory()) {
            files.push(...findCodemodrcFiles(fullPath));
        } else if (item === '.codemodrc.json') {
            files.push(fullPath);
        }
    }
    
    return files;
}

function incrementVersion(filePath, versionType) {
    const content = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    const [major, minor, patch] = content.version.split('.').map(Number);
    
    switch (versionType) {
        case 'major':
            content.version = `${major + 1}.0.0`;
            break;
        case 'minor':
            content.version = `${major}.${minor + 1}.0`;
            break;
        default: // patch
            content.version = `${major}.${minor}.${patch + 1}`;
    }
    
    fs.writeFileSync(filePath, JSON.stringify(content, null, 2));
    console.log(`Incremented ${versionType} version in ${filePath} to ${content.version}`);
}

function publishCodemod(dir) {
    try {
        execSync('codemod publish', { cwd: dir, stdio: 'inherit' });
        console.log(`Published codemod in ${dir}`);
    } catch (error) {
        console.error(`Failed to publish codemod in ${dir}:`, error.message);
    }
}

function main() {
    const { folderPath, versionType } = parseArgs();

    if (!fs.existsSync(folderPath)) {
        console.error(`Error: Directory "${folderPath}" does not exist`);
        process.exit(1);
    }

    const codemodrcFiles = findCodemodrcFiles(folderPath);
    
    if (codemodrcFiles.length === 0) {
        console.log(`No .codemodrc.json files found in "${folderPath}"`);
        process.exit(0);
    }
    
    for (const file of codemodrcFiles) {
        const dir = path.dirname(file);
        incrementVersion(file, versionType);
        publishCodemod(dir);
    }
}

main(); 