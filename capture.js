import puppeteer from 'puppeteer';
import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';

const outDir = path.join(process.cwd(), 'src', 'assets', 'images');
if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

async function capture() {
  console.log('Starting Vite server...');
  const viteProcess = spawn('npm', ['run', 'dev'], { shell: true });

  await new Promise((resolve) => setTimeout(resolve, 5000)); // wait for vite to start

  console.log('Launching Puppeteer...');
  const browser = await puppeteer.launch({
    headless: 'new',
    defaultViewport: { width: 1280, height: 800 }
  });

  const page = await browser.newPage();
  
  const routes = [
    { name: 'screenshot_admin.png', path: '/EcobrickWeb/#/admin' }
  ];

  for (const route of routes) {
    console.log(`Navigating to ${route.path}...`);
    try {
      await page.goto(`http://localhost:5173${route.path}`, { waitUntil: 'networkidle0', timeout: 30000 });
      await page.screenshot({ path: path.join(outDir, route.name), fullPage: true });
      console.log(`Saved ${route.name}`);
    } catch (err) {
      console.error(`Failed to capture ${route.path}`, err);
    }
  }

  await browser.close();
  viteProcess.kill();
  console.log('Done!');
  process.exit(0);
}

capture();
