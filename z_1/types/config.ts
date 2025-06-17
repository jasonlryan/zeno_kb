// Configuration type definitions

export interface AppConfig {
  app: {
    name: string;
    version: string;
    description: string;
  };
  navigation: {
    sidebar: {
      sections: SidebarSection[];
    };
    breadcrumbs: {
      separator: string;
      showHome: boolean;
      homeLabel: string;
    };
  };
  search: {
    placeholder: string;
    noResultsMessage: string;
    suggestions: {
      enabled: boolean;
      maxItems: number;
    };
    filters: {
      enabled: boolean;
      defaultExpanded: boolean;
    };
  };
  ui: {
    theme: {
      default: string;
      options: string[];
    };
    layout: {
      sidebarCollapsible: boolean;
      sidebarDefaultCollapsed: boolean;
      maxContentWidth: string;
    };
    animations: {
      enabled: boolean;
      duration: string;
    };
    toast: {
      position: string;
      duration: number;
      maxVisible: number;
    };
  };
  features: {
    aiChat: {
      enabled: boolean;
      provider: string;
      maxHistoryItems: number;
    };
    accessControl: {
      enabled: boolean;
      approvalWorkflow: boolean;
      defaultTier: string;
    };
    scheduling: {
      enabled: boolean;
      featuredRotation: string;
    };
    feedback: {
      enabled: boolean;
      anonymous: boolean;
    };
  };
  limits: {
    searchResults: number;
    featuredTools: number;
    recentTools: number;
    categoriesPerPage: number;
    toolsPerPage: number;
  };
}

export interface ContentConfig {
  pages: {
    home: PageContent;
    search: SearchPageContent;
    library: LibraryPageContent;
    curator: CuratorPageContent;
    users: UsersPageContent;
    analytics: AnalyticsPageContent;
  };
  components: {
    toolCard: ToolCardContent;
    toolDetail: ToolDetailContent;
    accessRequest: AccessRequestContent;
    feedback: FeedbackContent;
    chat: ChatContent;
    toast: ToastContent;
    banner: BannerContent;
  };
  forms: {
    validation: Record<string, string>;
    actions: Record<string, string>;
  };
  states: Record<string, string>;
  time: {
    formats: Record<string, string>;
    labels: Record<string, string>;
  };
}

export interface DataConfig {
  tools: Tool[];
  categories: Category[];
  functionCategories: string[];
  tags: Tag[];
  users: User[];
  announcements: Announcement[];
  metadata: {
    version: string;
    lastUpdated: string;
    totalTools: number;
    totalCategories: number;
    totalUsers: number;
  };
}

// Individual content interfaces
export interface PageContent {
  title: string;
  subtitle: string;
  sections?: Record<string, {
    title: string;
    subtitle: string;
  }>;
}

export interface SearchPageContent extends PageContent {
  placeholder: string;
  noResults: {
    title: string;
    message: string;
    suggestions: string[];
  };
  filters: {
    title: string;
    clearAll: string;
    apply: string;
    sections: Record<string, {
      title: string;
      placeholder?: string;
      options?: Record<string, string>;
    }>;
  };
}

export interface LibraryPageContent extends PageContent {
  tabs: Record<string, string>;
  empty: Record<string, {
    title: string;
    message: string;
  }>;
}

export interface CuratorPageContent {
  title: string;
  subtitle: string;
  sections: {
    overview: {
      title: string;
      metrics: Record<string, string>;
    };
    tools: {
      title: string;
      actions: Record<string, string>;
    };
    requests: {
      title: string;
      actions: Record<string, string>;
    };
    scheduling: {
      title: string;
      subtitle: string;
    };
  };
}

export interface UsersPageContent extends PageContent {
  actions: Record<string, string>;
}

export interface AnalyticsPageContent {
  title: string;
  subtitle: string;
  sections: Record<string, string>;
}

export interface ToolCardContent {
  labels: Record<string, string>;
  actions: Record<string, string>;
  badges: Record<string, string>;
}

export interface ToolDetailContent {
  sections: Record<string, string>;
  labels: Record<string, string>;
  actions: Record<string, string>;
}

export interface AccessRequestContent {
  title: string;
  subtitle: string;
  form: {
    labels: Record<string, string>;
    placeholders: Record<string, string>;
    validation: Record<string, string>;
  };
  process: {
    title: string;
    steps: string[];
  };
  actions: Record<string, string>;
}

export interface FeedbackContent {
  title: string;
  options: Record<string, string>;
  comment: {
    placeholder: string;
    submit: string;
  };
  thanks: string;
}

export interface ChatContent {
  title: string;
  placeholder: string;
  actions: Record<string, string>;
  states: Record<string, string>;
}

export interface ToastContent {
  success: Record<string, string>;
  error: Record<string, string>;
  info: Record<string, string>;
}

export interface BannerContent {
  types: Record<string, string>;
  actions: Record<string, string>;
}

// Data interfaces (extending existing types)
export interface SidebarSection {
  id: string;
  title: string;
  items: SidebarItem[];
}

export interface SidebarItem {
  id: string;
  title: string;
  icon: string;
  route: string;
  description: string;
  permissions?: string[];
  active?: boolean;
}

export interface Tool {
  id: string;
  title: string;
  description: string;
  type: "GPT" | "Doc" | "Script" | "Video";
  tier: "Foundation" | "Specialist";
  complexity: "Beginner" | "Intermediate" | "Advanced";
  tags: string[];
  featured?: boolean;
  function: string;
  link: string;
  date_added: string;
  added_by: string;
  scheduled_feature_date?: string | null;
}

export interface Category {
  id: string;
  icon: string;
  title: string;
  description: string;
  count: number;
  color: string;
  featured: boolean;
}

export interface Tag {
  id: string;
  label: string;
  category: string;
  color: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  avatar: string;
}

export interface Announcement {
  id: string;
  type: string;
  title: string;
  message: string;
  active: boolean;
  dismissible: boolean;
  startDate: string;
  endDate: string;
}

// Configuration manager interface
export interface ConfigManager {
  getAppConfig(): AppConfig;
  getContentConfig(): ContentConfig;
  getDataConfig(): DataConfig;
  getText(path: string): string;
  getNavigation(): SidebarSection[];
  getTools(): Tool[];
  getCategories(): Category[];
  getFunctionCategories(): string[];
  isFeatureEnabled(feature: string): boolean;
} 