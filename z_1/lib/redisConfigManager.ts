import { Redis } from '@upstash/redis';

const redis = Redis.fromEnv();

const CONFIG_KEYS = {
  app: "app-config",
  content: "content-config",
  data: "data-config",
  taxonomy: "taxonomy-config",
} as const;

type ConfigKey = keyof typeof CONFIG_KEYS;

export function getConfig(key: ConfigKey) {
  return redis.get(CONFIG_KEYS[key]);
}

export async function setConfig(key: ConfigKey, value: unknown) {
  return await redis.set(CONFIG_KEYS[key], value);
}

export async function deleteConfig(key: ConfigKey) {
  return await redis.del(CONFIG_KEYS[key]);
}

// Convenience methods
export function getAppConfig() { return getConfig('app'); }
export function setAppConfig(value: unknown) { return setConfig('app', value); }
export function deleteAppConfig() { return deleteConfig('app'); }

export function getContentConfig() { return getConfig('content'); }
export function setContentConfig(value: unknown) { return setConfig('content', value); }
export function deleteContentConfig() { return deleteConfig('content'); }

export function getDataConfig() { return getConfig('data'); }
export function setDataConfig(value: unknown) { return setConfig('data', value); }
export function deleteDataConfig() { return deleteConfig('data'); }

export function getTaxonomyConfig() { return getConfig('taxonomy'); }
export function setTaxonomyConfig(value: unknown) { return setConfig('taxonomy', value); }
export function deleteTaxonomyConfig() { return deleteConfig('taxonomy'); }

