declare module '@nuxt/types' {
  interface BlogPost {
    id: string,
    title: string,
    content: string,
    updatedAt: Date,
    thumbnail: CloudinaryMedia
  }

  interface Cms {
    id: string,
    name: string,
    createdAt: Date,
    published_at: Date,
    updatedAt: Date
  }

  interface Framework {
    id: string,
    name: string,
    createdAt: Date,
    published_at: Date,
    updatedAt: Date
  }

  interface Database {
    id: string,
    name: string,
    thumbnail: CloudinaryMedia,
    description: string,
    createdAt: Date,
    published_at: Date,
    updatedAt: Date
  }

  interface Platform {
    id: string,
    name: string,
    thumbnail: CloudinaryMedia,
    description: string,
    slogan: string,
    createdAt: Date,
    published_at: Date,
    updatedAt: Date
  }

  interface ProgramingLanguage {
    id: string,
    name: string,
    frameworks: Framework[],
    cms: Cms[],
    createdAt: Date,
    published_at: Date,
    updatedAt: Date
  }

  interface ProjectCategory {
    id: string,
    name: string,
    createdAt: Date,
    updatedAt: Date,
    published_at: Date
  }

  interface Project {
    id: string,
    name: string,
    description: string,
    images: CloudinaryMedia[],
    link: string,
    frameworks: Framework[],
    databases: Database[]
    cms: Cms[],
    project_categories: ProjectCategory[],
    platforms: Platform[],
    programing_languages: ProgramingLanguage[],
    videos: CloudinaryVideo[],
    createdAt: Date,
    updatedAt: Date,
    published_at: Date
  }

  interface Testimonial {
    id: string,
    name: string,
    reviews: string,
    link: string,
    project: string,
    createdAt: Date,
    updatedAt: Date,
    published_at: Date
  }

  interface HomePage {
    meta_title: string,
    meta_description: string,
    introduction: string,
    resume_summary: string
  }

  interface Contact {
    name: string,
    email: string,
    message: string
  }
}
