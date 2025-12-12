const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

async function convertSvgToPng() {
  try {
    // Convert 192x192 icon
    await sharp(path.join(__dirname, '../public/icons/icon-192x192.svg'))
      .resize(192, 192)
      .png()
      .toFile(path.join(__dirname, '../public/icons/icon-192x192.png'));
    
    console.log('Successfully created icon-192x192.png');
    
    // Convert 512x512 icon
    await sharp(path.join(__dirname, '../public/icons/icon-512x512.svg'))
      .resize(512, 512)
      .png()
      .toFile(path.join(__dirname, '../public/icons/icon-512x512.png'));
    
    console.log('Successfully created icon-512x512.png');
    
    console.log('All icons generated successfully!');
  } catch (error) {
    console.error('Error generating icons:', error);
  }
}

convertSvgToPng(); 