#!/usr/bin/env node

import https from 'https';
import fs from 'fs';
import path from 'path';
import { initializeDatabase, clearDatabase, createAlbum, createPhoto, closeDatabase } from '../app/lib/db';

// Sample cities and photo count
const CITIES = ['Amsterdam', 'Barcelona', 'Dubai', 'New York', 'Paris', 'Rio', 'Sydney', 'Tokyo'];
const PHOTOS_PER_ALBUM = 15;

/**
 * Download a photo from a URL (follows redirects)
 */
async function downloadPhoto(url: string, filePath: string): Promise<boolean> {
  return new Promise((resolve) => {
    const download = (downloadUrl: string, redirectCount = 0) => {
      if (redirectCount > 5) {
        resolve(false);
        return;
      }

      const file = fs.createWriteStream(filePath);
      https.get(downloadUrl, (response) => {
        // Handle redirects
        if (response.statusCode === 301 || response.statusCode === 302) {
          file.close();
          fs.unlink(filePath, () => {});
          const redirectUrl = response.headers.location;
          if (redirectUrl) {
            download(redirectUrl, redirectCount + 1);
          } else {
            resolve(false);
          }
          return;
        }

        if (response.statusCode !== 200) {
          file.close();
          fs.unlink(filePath, () => {});
          resolve(false);
          return;
        }

        response.pipe(file);
        file.on('finish', () => {
          file.close();
          resolve(true);
        });
      }).on('error', () => {
        file.close();
        fs.unlink(filePath, () => {});
        resolve(false);
      });
    };

    download(url);
  });
}

/**
 * Create a simple placeholder image using picsum.photos
 */
async function createPlaceholderPhoto(filePath: string, seed: number): Promise<void> {
  // Use picsum.photos which provides reliable placeholder images
  const url = `https://picsum.photos/seed/${seed}/800/600.jpg`;
  const success = await downloadPhoto(url, filePath);
  
  if (!success) {
    // If download fails, create a minimal valid JPEG placeholder
    // This is a 1x1 gray pixel JPEG
    const minimalJpeg = Buffer.from([
      0xFF, 0xD8, 0xFF, 0xE0, 0x00, 0x10, 0x4A, 0x46, 0x49, 0x46, 0x00, 0x01,
      0x01, 0x01, 0x00, 0x48, 0x00, 0x48, 0x00, 0x00, 0xFF, 0xDB, 0x00, 0x43,
      0x00, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF,
      0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF,
      0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF,
      0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF,
      0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF,
      0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xC0, 0x00, 0x0B, 0x08, 0x00,
      0x01, 0x00, 0x01, 0x01, 0x01, 0x11, 0x00, 0xFF, 0xC4, 0x00, 0x14, 0x00,
      0x01, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
      0x00, 0x00, 0x00, 0x00, 0x00, 0xFF, 0xDA, 0x00, 0x08, 0x01, 0x01, 0x00,
      0x00, 0x3F, 0x00, 0x7F, 0xFF, 0xD9
    ]);
    fs.writeFileSync(filePath, minimalJpeg);
  }
}

/**
 * Main seeding function
 */
async function seed() {
  console.log('🌱 Starting database seed...\n');

  // Initialize database schema
  console.log('📦 Initializing database schema...');
  initializeDatabase();
  console.log('✅ Database schema initialized\n');

  // Clear existing data
  console.log('🗑️  Clearing existing data...');
  clearDatabase();
  console.log('✅ Database cleared\n');

  // Create public/sample-photos directory
  const photosDir = path.join(process.cwd(), 'public', 'sample-photos');
  if (!fs.existsSync(photosDir)) {
    fs.mkdirSync(photosDir, { recursive: true });
    console.log('📁 Created public/sample-photos directory\n');
  }

  // Seed albums and photos
  console.log(`🌍 Creating ${CITIES.length} albums with ${PHOTOS_PER_ALBUM} photos each...\n`);

  for (const city of CITIES) {
    const citySlug = city.toLowerCase().replace(/\s+/g, '-');
    console.log(`  📸 ${city}...`);

    // Create album
    const albumId = createAlbum(city);

    // Create photos
    for (let i = 1; i <= PHOTOS_PER_ALBUM; i++) {
      const fileName = `${citySlug}-${i}.jpg`;
      const filePath = `/sample-photos/${fileName}`;
      const fullPath = path.join(photosDir, fileName);

      // Create photo record in database
      createPhoto(albumId, filePath, i - 1); // 0-indexed display_order

      // Download placeholder photo
      if (!fs.existsSync(fullPath)) {
        try {
          const seed = `${citySlug}-${i}`.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
          await createPlaceholderPhoto(fullPath, seed);
        } catch (error) {
          console.error(`    ⚠️  Failed to create ${fileName}:`, error);
        }
      }
    }

    console.log(`    ✅ Created ${PHOTOS_PER_ALBUM} photos`);
  }

  console.log(`\n🎉 Seed complete!`);
  console.log(`   - ${CITIES.length} albums created`);
  console.log(`   - ${CITIES.length * PHOTOS_PER_ALBUM} photos created`);
  console.log(`   - Database: app/lib/database.db`);
  console.log(`   - Photos: public/sample-photos/\n`);

  // Close database connection
  closeDatabase();
}

// Run seed
seed().catch((error) => {
  console.error('❌ Seed failed:', error);
  process.exit(1);
});
