import type { ParsedContent } from "@nuxt/content/dist/runtime/types";
declare module '@nuxt/types' {
  interface About extends ParsedContent {
    introduction: string;
    resume_summary: string;
  }
  interface SEO extends ParsedContent {
    meta_title: string;
    meta_description: string;
  }
}