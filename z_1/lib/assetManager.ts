export interface SchemaField {
  name: string;
  type: string;
  required?: boolean;
  generated?: boolean;
}

export interface Asset {
  [key: string]: any;
}

import fs from 'fs';
import path from 'path';

const dataFilePath = path.join(process.cwd(), 'z_1/config/data.json');
const schemaFilePath = path.join(process.cwd(), 'z_1/data/schema.json');

function loadSchema(): { fields: SchemaField[] } {
  const raw = fs.readFileSync(schemaFilePath, 'utf-8');
  return JSON.parse(raw);
}

function loadData() {
  const raw = fs.readFileSync(dataFilePath, 'utf-8');
  return JSON.parse(raw);
}

function saveData(data: any) {
  fs.writeFileSync(dataFilePath, JSON.stringify(data, null, 2), 'utf-8');
}

/**
 * Add a new asset to data.json using the schema definition
 */
export function addAsset(asset: Asset) {
  const schema = loadSchema();
  const data = loadData();

  const newAsset: Asset = {};
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
    if (asset[field.name] !== undefined) {
      newAsset[field.name] = asset[field.name];
    } else if (field.required) {
      newAsset[field.name] = field.type === 'array' ? [] : '';
    }
  }

  data.tools.push(newAsset);
  saveData(data);
  return newAsset;
}

/**
 * Remove an asset by id from data.json
 */
export function removeAsset(id: string) {
  const data = loadData();
  const originalLength = data.tools.length;
  data.tools = data.tools.filter((t: any) => t.id !== id);
  if (data.tools.length === originalLength) {
    return false;
  }
  saveData(data);
  return true;
}
