declare module '@nuxt/types' {
  interface BlogPost {
    _id: string
    id: string,
    title: string,
    content: string,
    createdAt: number,
    upnumberdAt: number,
    thumbnail: CloudinaryMedia
  }

  interface Cms {
    id: string,
    name: string,
    createdAt: number,
    published_at: number,
    upnumberdAt: number
  }

  interface Framework {
    id: string,
    name: string,
    thumbnail: CloudinaryMedia,
    description: string
    createdAt: number,
    published_at: number,
    upnumberdAt: number
  }

  interface Database {
    id: string,
    name: string,
    thumbnail: CloudinaryMedia,
    description: string,
    createdAt: number,
    published_at: number,
    upnumberdAt: number
  }

  interface Platform {
    id: string,
    name: string,
    thumbnail: CloudinaryMedia,
    description: string,
    slogan: string,
    createdAt: number,
    published_at: number,
    upnumberdAt: number
  }

  interface ProgramingLanguage {
    id: string,
    name: string,
    frameworks: Framework[],
    cms: Cms[],
    createdAt: number,
    published_at: number,
    upnumberdAt: number
  }

  interface ProjectCategory {
    id: string,
    name: string,
    createdAt: number,
    upnumberdAt: number,
    published_at: number
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
    createdAt: number,
    upnumberdAt: number,
    published_at: number
  }

  interface Testimonial {
    id: string,
    name: string,
    reviews: string,
    link: string,
    project: string,
    createdAt: number,
    upnumberdAt: number,
    published_at: number
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
