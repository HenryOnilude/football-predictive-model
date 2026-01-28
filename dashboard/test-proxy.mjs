import { ProxyAgent, fetch } from 'undici';
import dotenv from 'dotenv';

// Load variables from .env.local
dotenv.config({ path: '.env.local' });

const proxyUrl = process.env.RESIDENTIAL_PROXY_URL;

if (!proxyUrl) {
  console.error("❌ No Proxy URL found in .env.local");
  process.exit(1);
}

console.log(`🔎 Testing Proxy: ${proxyUrl.replace(/:[^:@]+@/, ':****@')} ...`);

const client = new ProxyAgent({
  uri: proxyUrl,
  bodyTimeout: 15000
});

async function checkIP() {
  try {
    // 1. Ask a public server "What is my IP?"
    const response = await fetch('https://api.ipify.org?format=json', {
      dispatcher: client
    });

    const data = await response.json();
    console.log("✅ SUCCESS! The internet thinks your IP is:", data.ip);
    console.log("If this IP is different from your home IP, it worked.");
    
  } catch (error) {
    console.error("❌ FAILED:", error.message);
    if (error.cause) console.error("Cause:", error.cause);
  }
}

checkIP();
