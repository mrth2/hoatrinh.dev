declare module '@nuxt/types' {
  interface CloudinaryMediaFormat {
    hash: string,
    name: string
    url: string,
    mime: string,
    ext: string
    path: string,
    width: Number,
    height: Number
  }

  interface CloudinaryMediaFormats {
    small: CloudinaryMediaFormat,
    medium: CloudinaryMediaFormat,
    thumbnail: CloudinaryMediaFormat
  }

  interface CloudinaryMedia {
    id: string,
    hash: string,
    name: string,
    caption: string,
    createdAt: Date,
    ext: string,
    formats: CloudinaryMediaFormats,
    url: string,
    width: Number,
    height: Number,
    size: Number
  }

  interface CloudinaryVideo {}
}
