const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');
global.WebSocket = require('ws');

// 1. Configure these values (or set them in your .env file)
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://duxutcoohteuwwkgypky.supabase.co';
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR1eHV0Y29vaHRldXd3a2d5cGt5Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MjkyNTU5MSwiZXhwIjoyMDk4NTAxNTkxfQ.t6tBP7BTk7rerBVdoitpQAHsM_3aNhAQAamQjWE1W9A';
const BUCKET_NAME = 'epicurious-images';

const CSV_PATH = path.join(__dirname, '../Food Ingredients and Recipe Dataset with Image Name Mapping.csv');
const IMAGES_DIR = path.join(__dirname, '../Food Images/Food Images');

if (SUPABASE_URL === 'YOUR_SUPABASE_URL') {
  console.error("Please set SUPABASE_URL and SUPABASE_KEY in this script or as environment variables.");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
  auth: { persistSession: false }
});

// Helper to parse CSV manually
function parseCSV(content) {
  const results = [];
  const lines = content.split('\n');
  const headers = lines[0].trim().split(',').map(h => h.trim().replace(/\r/, ''));

  let i = 1;
  while (i < lines.length) {
    let line = lines[i];
    if (!line.trim()) { i++; continue; }
    while ((line.match(/\"/g) || []).length % 2 !== 0 && i + 1 < lines.length) {
      i++; line += '\n' + lines[i];
    }
    const row = {};
    const fields = [];
    let current = '';
    let inQuotes = false;
    for (let c = 0; c < line.length; c++) {
      const ch = line[c];
      if (ch === '\"') inQuotes = !inQuotes;
      else if (ch === ',' && !inQuotes) { fields.push(current); current = ''; }
      else current += ch;
    }
    fields.push(current);
    headers.forEach((h, idx) => row[h] = (fields[idx] || '').trim());
    results.push(row);
    i++;
  }
  return results;
}

async function uploadImage(imageName) {
  const filePath = path.join(IMAGES_DIR, imageName);
  if (!fs.existsSync(filePath)) {
    return { success: false, error: `File not found locally: ${imageName}` };
  }

  const fileExt = path.extname(imageName).toLowerCase();
  const contentType = fileExt === '.jpg' || fileExt === '.jpeg' ? 'image/jpeg'
    : fileExt === '.png' ? 'image/png'
      : 'application/octet-stream';

  const fileBuffer = fs.readFileSync(filePath);

  const { data, error } = await supabase.storage
    .from(BUCKET_NAME)
    .upload(imageName, fileBuffer, {
      contentType: contentType,
      upsert: true // Overwrite if it already exists
    });

  if (error) {
    return { success: false, error: error.message };
  }
  return { success: true };
}

async function main() {
  console.log("Reading CSV...");
  const content = fs.readFileSync(CSV_PATH, 'utf8');
  const data = parseCSV(content);

  // Extract unique image names from CSV
  const imageNames = [...new Set(data.map(r => r.Image_Name).filter(n => n && n.trim() !== ''))];
  console.log(`Found ${imageNames.length} unique images referenced in the CSV.`);

  const CONCURRENCY = 10;
  let successCount = 0;
  let errorCount = 0;

  console.log(`Starting upload to bucket '${BUCKET_NAME}' (Concurrency: ${CONCURRENCY})...`);

  for (let i = 0; i < imageNames.length; i += CONCURRENCY) {
    const chunk = imageNames.slice(i, i + CONCURRENCY);
    const promises = chunk.map(async (name) => {
      const res = await uploadImage(name + '.jpg'); // Kaggle dataset appends .jpg to most files. Adjust if names already have .jpg
      if (res.success) {
        successCount++;
        process.stdout.write('+');
      } else {
        errorCount++;
        process.stdout.write('x');
        if (errorCount === 1) {
          console.error(`\n[First Error Example]: ${res.error}`);
        }
      }
    });

    await Promise.all(promises);

    // Print progress every 100 uploads
    if ((i + chunk.length) % 100 === 0) {
      console.log(`\nProgress: ${i + chunk.length} / ${imageNames.length} (Success: ${successCount}, Errors: ${errorCount})`);
    }
  }

  console.log(`\n\nUpload Complete!`);
  console.log(`Successfully uploaded: ${successCount}`);
  console.log(`Errors/Missing locally: ${errorCount}`);
}

main().catch(console.error);
