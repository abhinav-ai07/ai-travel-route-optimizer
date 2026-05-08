/* eslint-disable no-console */
const fs = require('fs');
const path = require('path');

const directories = [
  'pages',
  'pages/api',
  'components',
  'lib',
  'styles',
  'public'
];

console.log('🚀 Setting up frontend directories...\n');

directories.forEach(dir => {
  const dirPath = path.join(__dirname, dir);
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
    console.log(`✅ Created ${dir} directory`);
  } else {
    console.log(`✔️  ${dir} directory already exists`);
  }
});

console.log('\n✨ Setup complete! Frontend structure initialized.');
console.log('\n📝 Next steps:');
console.log('   1. npm install');
console.log('   2. npm run dev');
console.log('\n🌐 Open http://localhost:3000 in your browser\n');
