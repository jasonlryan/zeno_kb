import { Redis } from "@upstash/redis";

const redis = Redis.fromEnv();

const CONFIG_KEYS = {
  app: "app-config",
  content: "content-config",
  data: "data-config",
  taxonomy: "taxonomy-config",
} as const;

type ConfigKey = keyof typeof CONFIG_KEYS;

export async function getConfig(key: ConfigKey) {
  return await redis.get(CONFIG_KEYS[key]);
}

export async function setConfig(key: ConfigKey, value: unknown) {
  return await redis.set(CONFIG_KEYS[key], value);
}

export async function deleteConfig(key: ConfigKey) {
  return await redis.del(CONFIG_KEYS[key]);
}

export const getAppConfig = () => getConfig("app");
export const setAppConfig = (value: unknown) => setConfig("app", value);

export const getContentConfig = () => getConfig("content");
export const setContentConfig = (value: unknown) => setConfig("content", value);

export const getDataConfig = () => getConfig("data");
export const setDataConfig = (value: unknown) => setConfig("data", value);

export const getTaxonomyConfig = () => getConfig("taxonomy");
export const setTaxonomyConfig = (value: unknown) => setConfig("taxonomy", value);

