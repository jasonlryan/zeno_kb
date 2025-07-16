// Types for Zeno KB assets/tools, schema-driven

export interface ZenoAsset {
  id: string; // generated if not present in CSV
  title: string;
  description?: string; // optional per schema
  url: string;
  type: string; // e.g., 'GPT', 'Prompt', etc. (from Media Type)
  categories: string[]; // from Business Category (comma-separated in CSV)
  skillLevel?: string; // optional, from Skill Level
  
  // Additional fields from existing Tool structure
  tier?: "Foundation" | "Specialist";
  complexity?: "Beginner" | "Intermediate" | "Advanced";
  tags?: string[];
  featured?: boolean;
  function?: string;
  date_added?: string;
  added_by?: string;
  scheduled_feature_date?: string | null;
  
  // Learning Guide specific fields
  content_type?: string;
  estimated_read_time?: string;
  prerequisites?: string[];
  learning_objectives?: string[];
  
  // Video specific fields
  duration?: string;
  transcript_available?: boolean;
  
  // Script specific fields
  language?: string;
  requirements?: string[];
  
  // Allow additional dynamic fields
  [key: string]: any;
}

// If you have a config root object:
export interface ZenoConfig {
  tools: ZenoAsset[];
  // ...other config fields
} 