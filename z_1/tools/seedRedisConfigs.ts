import fs from "fs";
import path from "path";
import {
  setAppConfig,
  setContentConfig,
  setDataConfig,
  setTaxonomyConfig,
} from "../lib/redisConfigManager";

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

