#!/usr/bin/env node

/**
 * Environment Setup Script
 * 
 * This script helps set up environment variables for different development scenarios.
 * Run with: node scripts/setup-env.js [environment]
 * 
 * Environments:
 * - local: Sets up for local development with proxy
 * - custom: Prompts for custom API URL
 * - production: Sets up for production deployment
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const environments = {
  local: {
    VITE_API_URL: '',
    description: 'Local development with Vite proxy'
  },
  custom: {
    VITE_API_URL: 'http://localhost:3000',
    description: 'Custom API URL (will prompt for URL)'
  },
  production: {
    VITE_API_URL: 'https://gp-backend-iter3.vercel.app',
    description: 'Production API URL'
  }
};

function createEnvFile(envVars, filename = '.env.local') {
  const envContent = Object.entries(envVars)
    .map(([key, value]) => `${key}=${value}`)
    .join('\n');
  
  const envPath = path.join(process.cwd(), filename);
  
  try {
    fs.writeFileSync(envPath, envContent);
    console.log(`✅ Created ${filename} with the following configuration:`);
    console.log(envContent);
    console.log(`\n📁 File location: ${envPath}`);
  } catch (error) {
    console.error(`❌ Error creating ${filename}:`, error.message);
    process.exit(1);
  }
}

function promptForCustomUrl() {
  return new Promise((resolve) => {
    rl.question('Enter your custom API URL (e.g., http://localhost:3000): ', (url) => {
      resolve(url.trim());
    });
  });
}

async function main() {
  const environment = process.argv[2] || 'local';
  
  console.log('🚀 GreenPulse API Environment Setup\n');
  
  if (!environments[environment]) {
    console.log('Available environments:');
    Object.entries(environments).forEach(([key, config]) => {
      console.log(`  ${key}: ${config.description}`);
    });
    console.log('\nUsage: node scripts/setup-env.js [environment]');
    process.exit(1);
  }
  
  let envVars = { ...environments[environment] };
  
  if (environment === 'custom') {
    const customUrl = await promptForCustomUrl();
    if (customUrl) {
      envVars.VITE_API_URL = customUrl;
    }
  }
  
  createEnvFile(envVars);
  
  console.log('\n📋 Next steps:');
  console.log('1. Start the development server: npm run dev');
  console.log('2. Check browser console for API request logs');
  console.log('3. Test API calls in your application');
  
  if (environment === 'local') {
    console.log('\n💡 Note: Local development uses Vite proxy to forward API calls to production backend');
  }
  
  rl.close();
}

main().catch(console.error);
