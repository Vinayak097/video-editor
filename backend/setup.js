const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Ensure uploads directories exist
const dirs = [
  path.join(__dirname, 'uploads'),
  path.join(__dirname, 'uploads/original'),
  path.join(__dirname, 'uploads/processed')
];

dirs.forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
    console.log(`Created directory: ${dir}`);
  }
});

// Generate Prisma client
try {
  console.log('Generating Prisma client...');
  execSync('npx prisma generate', { stdio: 'inherit' });
  
  console.log('Creating database tables...');
  execSync('npx prisma db push', { stdio: 'inherit' });
  
  console.log('Setup completed successfully!');
} catch (error) {
  console.error('Setup failed:', error.message);
  process.exit(1);
}
