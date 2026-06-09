export interface Product {
  id: string;
  name: string;
  description: string;
  category: string;
  npmInstall: string;
  version: string;
  github?: string;
  npm?: string;
}

export type Category ***REMOVED*** "all" | "database" | "security" | "devops" | "testing" | "cli-tools" | "performance";

export const CATEGORIES: Record<Category, string> ***REMOVED*** {
  all: "All Products",
  database: "Database",
  security: "Security",
  devops: "DevOps & CI/CD",
  testing: "Testing",
  "cli-tools": "CLI Tools",
  performance: "Performance",
};
