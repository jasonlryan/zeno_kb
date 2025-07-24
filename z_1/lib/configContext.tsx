"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { ZenoConfig } from "../types/config";

interface AppConfig {
  [key: string]: any;
}

interface ContentConfig {
  [key: string]: any;
}

interface ConfigContextType {
  appConfig: AppConfig | null;
  contentConfig: ContentConfig | null;
  dataConfig: ZenoConfig | null;
  loading: boolean;
  error: string | null;
}

const ConfigContext = createContext<ConfigContextType | undefined>(undefined);

interface ConfigProviderProps {
  children: ReactNode;
}

export function ConfigProvider({ children }: ConfigProviderProps) {
  const [appConfig, setAppConfig] = useState<AppConfig | null>(null);
  const [contentConfig, setContentConfig] = useState<ContentConfig | null>(
    null
  );
  const [dataConfig, setDataConfig] = useState<ZenoConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchConfigs() {
      try {
        setLoading(true);
        setError(null);

        const [appRes, contentRes, dataRes] = await Promise.all([
          fetch("/api/config/app"),
          fetch("/api/config/content"),
          fetch("/api/config/data"),
        ]);

        if (!appRes.ok || !contentRes.ok || !dataRes.ok) {
          throw new Error("Failed to fetch configs");
        }

        const [app, content, data] = await Promise.all([
          appRes.json(),
          contentRes.json(),
          dataRes.json(),
        ]);

        setAppConfig(app);
        setContentConfig(content);
        setDataConfig(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load config");
        console.error("Config loading error:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchConfigs();
  }, []);

  return (
    <ConfigContext.Provider
      value={{
        appConfig,
        contentConfig,
        dataConfig,
        loading,
        error,
      }}
    >
      {children}
    </ConfigContext.Provider>
  );
}

export function useConfigContext() {
  const context = useContext(ConfigContext);
  if (context === undefined) {
    throw new Error("useConfigContext must be used within a ConfigProvider");
  }
  return context;
}
