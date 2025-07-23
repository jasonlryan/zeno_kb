require('dotenv').config({ path: '.env.local' });
const fs = require('fs');
const path = require('path');
console.log('UPSTASH_REDIS_REST_URL:', process.env.UPSTASH_REDIS_REST_URL);
console.log('UPSTASH_REDIS_REST_TOKEN:', process.env.UPSTASH_REDIS_REST_TOKEN);

const redisConfigManager = require('../lib/redisConfigManager');

// Test Redis connection
async function testRedisConnection() {
  try {
    const ping = await redisConfigManager.getConfig('data'); // Try to get the data-config key (may be undefined)
    console.log('Redis connection successful. data-config key:', ping ? 'found' : 'not found');
  } catch (err) {
    console.error('Redis connection failed:', err);
    process.exit(1);
  }
}

async function seedConfigs() {
  const base = path.join(process.cwd(), 'z_1/public/config');
  await redisConfigManager.setAppConfig(JSON.parse(fs.readFileSync(path.join(base, 'app-config.json'), 'utf-8')));
  await redisConfigManager.setContentConfig(JSON.parse(fs.readFileSync(path.join(base, 'content.json'), 'utf-8')));
  await redisConfigManager.setDataConfig(JSON.parse(fs.readFileSync(path.join(base, 'data.json'), 'utf-8')));
  await redisConfigManager.setTaxonomyConfig(JSON.parse(fs.readFileSync(path.join(base, 'taxonomy.json'), 'utf-8')));
  console.log('Configs seeded to Redis!');
}

testRedisConnection().then(seedConfigs);

