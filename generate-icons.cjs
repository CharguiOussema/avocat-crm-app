/**
 * Icon Generator Script for PWA
 *
 * This script helps generate placeholder icons or convert a source icon
 * to all required PWA icon sizes.
 *
 * Usage:
 * 1. Install sharp: npm install --save-dev sharp
 * 2. Place your logo as 'logo.png' in this directory (512x512 recommended)
 * 3. Run: node generate-icons.js
 *
 * If no logo.png exists, it will create placeholder icons.
 */

const fs = require('fs');
const path = require('path');

// Icon sizes needed for PWA
const ICON_SIZES = [72, 96, 128, 144, 152, 192, 384, 512];

// Output directory
const OUTPUT_DIR = path.join(__dirname, 'public', 'icons');

// Create output directory if it doesn't exist
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  console.log('✅ Created icons directory');
}

// Check if sharp is installed
let sharp;
try {
  sharp = require('sharp');
} catch (error) {
  console.log('⚠️  Sharp not installed. Run: npm install --save-dev sharp');
  console.log('📝 Generating placeholder SVG icons instead...\n');
  generatePlaceholderSVGs();
  process.exit(0);
}

// Source logo path
const SOURCE_LOGO = path.join(__dirname, 'logo.png');

/**
 * Generate icons from source logo
 */
async function generateIcons() {
  if (!fs.existsSync(SOURCE_LOGO)) {
    console.log('⚠️  No logo.png found in root directory');
    console.log('📝 Creating placeholder icons instead...\n');
    await generatePlaceholders();
    return;
  }

  console.log('🎨 Generating PWA icons from logo.png...\n');

  try {
    for (const size of ICON_SIZES) {
      const outputPath = path.join(OUTPUT_DIR, `icon-${size}x${size}.png`);

      await sharp(SOURCE_LOGO)
        .resize(size, size, {
          fit: 'contain',
          background: { r: 255, g: 255, b: 255, alpha: 0 }
        })
        .png()
        .toFile(outputPath);

      console.log(`✅ Generated icon-${size}x${size}.png`);
    }

    console.log('\n🎉 All icons generated successfully!');
    console.log(`📁 Icons saved to: ${OUTPUT_DIR}`);
  } catch (error) {
    console.error('❌ Error generating icons:', error.message);
    process.exit(1);
  }
}

/**
 * Generate placeholder PNG icons using sharp
 */
async function generatePlaceholders() {
  console.log('🎨 Generating placeholder icons with sharp...\n');

  try {
    for (const size of ICON_SIZES) {
      const outputPath = path.join(OUTPUT_DIR, `icon-${size}x${size}.png`);

      // Create a simple colored square with rounded corners
      const svg = `
        <svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" style="stop-color:#1890ff;stop-opacity:1" />
              <stop offset="100%" style="stop-color:#096dd9;stop-opacity:1" />
            </linearGradient>
          </defs>
          <rect width="${size}" height="${size}" rx="${size * 0.15}" fill="url(#grad)"/>
          <text x="50%" y="50%" font-family="Arial, sans-serif" font-size="${size * 0.4}"
                font-weight="bold" fill="white" text-anchor="middle" dy=".35em">AC</text>
        </svg>
      `;

      await sharp(Buffer.from(svg))
        .png()
        .toFile(outputPath);

      console.log(`✅ Generated placeholder icon-${size}x${size}.png`);
    }

    console.log('\n🎉 Placeholder icons generated successfully!');
    console.log(`📁 Icons saved to: ${OUTPUT_DIR}`);
    console.log('\n💡 Tip: Replace these with your actual logo later!');
    console.log('   1. Create a 512x512 PNG logo named "logo.png"');
    console.log('   2. Place it in the project root');
    console.log('   3. Run this script again: node generate-icons.js');
  } catch (error) {
    console.error('❌ Error generating placeholders:', error.message);
    process.exit(1);
  }
}

/**
 * Generate placeholder SVG icons (fallback when sharp not available)
 */
function generatePlaceholderSVGs() {
  console.log('🎨 Generating placeholder SVG icons...\n');

  for (const size of ICON_SIZES) {
    const outputPath = path.join(OUTPUT_DIR, `icon-${size}x${size}.svg`);

    const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="grad-${size}" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#1890ff;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#096dd9;stop-opacity:1" />
    </linearGradient>
  </defs>
  <rect width="${size}" height="${size}" rx="${size * 0.15}" fill="url(#grad-${size})"/>
  <text x="50%" y="50%" font-family="Arial, sans-serif" font-size="${size * 0.4}"
        font-weight="bold" fill="white" text-anchor="middle" dy=".35em">AC</text>
</svg>`;

    fs.writeFileSync(outputPath, svg);
    console.log(`✅ Generated placeholder icon-${size}x${size}.svg`);
  }

  console.log('\n⚠️  SVG icons generated (PNG recommended)');
  console.log('💡 To generate PNG icons:');
  console.log('   1. Install sharp: npm install --save-dev sharp');
  console.log('   2. Run this script again: node generate-icons.js');
  console.log('\n📁 Icons saved to:', OUTPUT_DIR);
}

// Run the generator
generateIcons();
