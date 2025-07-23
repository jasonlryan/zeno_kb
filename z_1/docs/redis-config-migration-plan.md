# Redis Config Migration Plan

## Overview

This plan describes how to migrate Zeno Knowledge Base configuration files (`app-config.json`, `content.json`, `data.json`, `taxonomy.json`) from the filesystem to Upstash Redis for persistent, serverless, and scalable storage.

---

## 1. Redis Key Structure

- Each config file will be stored as a separate Redis key:
  - `app-config`
  - `content-config`
  - `data-config`
  - `taxonomy-config`
- Each value will be the full JSON object of the config file.

---

## 2. Upstash Redis Setup

- Ensure Upstash Redis credentials are in `.env.local`:
  - `KV_URL`, `KV_REST_API_URL`, `KV_REST_API_TOKEN`, etc.
- Install the Upstash Redis client:
  ```sh
  npm install @upstash/redis
  ```

---

## 3. Utility Module: `lib/redisConfigManager.ts`

- Create a utility for reading, writing, and deleting config objects in Redis.

```ts
import { Redis } from "@upstash/redis";
const redis = Redis.fromEnv();
const CONFIG_KEYS = {
  app: "app-config",
  content: "content-config",
  data: "data-config",
  taxonomy: "taxonomy-config",
};
export async function getConfig(key: keyof typeof CONFIG_KEYS) {
  return await redis.get(CONFIG_KEYS[key]);
}
export async function setConfig(key: keyof typeof CONFIG_KEYS, value: any) {
  return await redis.set(CONFIG_KEYS[key], value);
}
export async function deleteConfig(key: keyof typeof CONFIG_KEYS) {
  return await redis.del(CONFIG_KEYS[key]);
}
// Convenience methods for each config type...
```

---

## 4. Seeding Redis with Existing Configs

- Script to upload current JSON files to Redis:

```ts
import fs from "fs";
import path from "path";
import {
  setAppConfig,
  setContentConfig,
  setDataConfig,
  setTaxonomyConfig,
} from "./redisConfigManager";
async function seedConfigs() {
  const base = path.join(process.cwd(), "z_1/public/config");
  await setAppConfig(
    JSON.parse(fs.readFileSync(path.join(base, "app-config.json"), "utf-8"))
  );
  await setContentConfig(
    JSON.parse(fs.readFileSync(path.join(base, "content.json"), "utf-8"))
  );
  await setDataConfig(
    JSON.parse(fs.readFileSync(path.join(base, "data.json"), "utf-8"))
  );
  await setTaxonomyConfig(
    JSON.parse(fs.readFileSync(path.join(base, "taxonomy.json"), "utf-8"))
  );
  console.log("Configs seeded to Redis!");
}
seedConfigs();
```

---

## 5. API Route Example

- Example for `/api/config/[type]`:

```ts
import { NextRequest, NextResponse } from "next/server";
import {
  getConfig,
  setConfig,
  deleteConfig,
} from "../../../lib/redisConfigManager";
export async function GET(
  req: NextRequest,
  { params }: { params: { type: string } }
) {
  const { type } = params;
  const config = await getConfig(type as any);
  return NextResponse.json(config);
}
export async function POST(
  req: NextRequest,
  { params }: { params: { type: string } }
) {
  const { type } = params;
  const body = await req.json();
  await setConfig(type as any, body);
  return NextResponse.json({ success: true });
}
export async function DELETE(
  req: NextRequest,
  { params }: { params: { type: string } }
) {
  const { type } = params;
  await deleteConfig(type as any);
  return NextResponse.json({ success: true });
}
```

---

## 6. Frontend/Backend Integration

- Update all config reads/writes to use the new API endpoints or utility methods.
- Remove direct file system access for configs.

---

## 7. Testing & Validation

- Test all CRUD operations for each config type via API and UI.
- Validate that changes persist and are reflected in the app.

---

## 8. Rollback Plan

- Keep backups of all original JSON files.
- If needed, restore configs by re-seeding Redis from backups.

---

## 9. Future Enhancements

- Add versioning or backup keys in Redis for config history.
- Add admin UI for config management.
