// scripts/setup-folders.js
const fs = require('fs')
const path = require('path')
const { execSync } = require('child_process')

const foldersToCreate = [
  'public/uploads',
  'public/uploads/rooms',
  'public/images'
]

foldersToCreate.forEach(folderPath => {
  const fullPath = path.join(process.cwd(), folderPath)
  
  if (!fs.existsSync(fullPath)) {
    fs.mkdirSync(fullPath, { recursive: true })
    console.log(`Created folder: ${folderPath}`)
  } else {
    console.log(`Folder already exists: ${folderPath}`)
  }
})

// Buat file .gitkeep untuk memastikan folder tidak hilang di git
const gitkeepPaths = [
  'public/uploads/.gitkeep',
  'public/uploads/rooms/.gitkeep'
]

gitkeepPaths.forEach(gitkeepPath => {
  const fullPath = path.join(process.cwd(), gitkeepPath)
  if (!fs.existsSync(fullPath)) {
    fs.writeFileSync(fullPath, '')
    console.log(`Created .gitkeep file: ${gitkeepPath}`)
  }
})

console.log('🎉 Setup complete!')

// Generate Prisma Client
try {
  console.log('🔄 Generating Prisma Client...')
  execSync('npx prisma generate', { stdio: 'inherit' })
  console.log('✅ Prisma Client generated successfully!')
} catch (error) {
  console.log('⚠️ Prisma generate will be handled by build script')
}