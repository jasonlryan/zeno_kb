export interface SchemaField {
  name: string;
  type: string;
  required?: boolean;
  generated?: boolean;
}

import { getDataConfig, setDataConfig } from './redisConfigManager';
import { ZenoConfig, ZenoAsset } from '../types/config';
import fs from 'fs';
import path from 'path';

const schemaFilePath = path.join(process.cwd(), 'data/schema.json');

function loadSchema(): { fields: SchemaField[] } {
  const raw = fs.readFileSync(schemaFilePath, 'utf-8');
  return JSON.parse(raw);
}

async function loadData(): Promise<ZenoConfig> {
  return await getDataConfig() as ZenoConfig;
}

async function saveData(data: ZenoConfig) {
  await setDataConfig(data);
}

/**
 * Add a new asset to Redis data config using the schema definition
 */
export async function addAsset(asset: Partial<ZenoAsset>) {
  const schema = loadSchema();
  const data = await loadData();

  const newAsset: any = {};
  for (const field of schema.fields) {
    if (field.generated && field.name === 'id') {
      newAsset.id = asset.id || Date.now().toString();
      continue;
    }
    if (field.name === 'date_created') {
      newAsset.date_created = asset.date_created || new Date().toISOString();
      continue;
    }
    if (field.name === 'date_modified') {
      newAsset.date_modified = new Date().toISOString();
      continue;
    }
    if (asset[field.name as keyof ZenoAsset] !== undefined) {
      newAsset[field.name] = asset[field.name as keyof ZenoAsset];
    } else if (field.required) {
      newAsset[field.name] = field.type === 'array' ? [] : '';
    }
  }

  data.tools.push(newAsset);
  await saveData(data);
  return newAsset;
}

/**
 * Remove an asset by id from Redis data config
 */
export async function removeAsset(id: string) {
  const data = await loadData();
  const originalLength = data.tools.length;
  data.tools = data.tools.filter((t: any) => t.id !== id);
  if (data.tools.length === originalLength) {
    return false;
  }
  await saveData(data);
  return true;
}
