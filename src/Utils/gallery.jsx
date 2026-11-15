// Gallery images, bundled into one array ready to export.
//
// Reads the images in two subfolders of src/assets/gallery: gallery/Members and gallery/Events (capital letters in the folder names do not matter).
// Vite collects the files at build time, and each import becomes the final URL of the image.
//
// Each item: { id, src, alt, category, file }
//   src       the image URL, use it as <img src={item.src} />
//   alt       readable text made from the file name (extension removed, _ and - turned into spaces)
//   category  the subfolder it came from in lower case: "members" or "events"
//   file      the original file name
//
// Exports: gallery (all images), galleryByCategory (grouped), galleryCategories (folder names)

// Only these subfolders are used. Use null to take every subfolder of gallery instead.
const ONLY_FOLDERS = ["members", "events"]; // compared without regard to capitals

const images = import.meta.glob("../assets/gallery/*/*.{jpg,jpeg,png,webp,gif,svg,avif,JPG,JPEG,PNG,WEBP,GIF,SVG,AVIF}", { eager: true, import: "default" });

const prettyName = file => {
  let name = file;
  try { name = decodeURIComponent(file); } catch { /* keep the raw name */ }
  return name
    .replace(/\.[^.]+$/, "")        // extension
    .replace(/[_-]+/g, " ")         // _ and - to spaces
    .replace(/\s+/g, " ")
    .trim();
};

export const gallery = Object.entries(images)
  .map(([path, src]) => {
    const parts = path.split("/");
    const file = parts.pop();
    const folder = parts.pop();
    return { path, src, file, folder, category: folder.toLowerCase() };
  })
  .filter(item => !ONLY_FOLDERS || ONLY_FOLDERS.map(name => name.toLowerCase()).includes(item.category))
  .sort((a, b) => a.category.localeCompare(b.category) || a.file.localeCompare(b.file, undefined, { numeric: true, sensitivity: "base" }))
  .map(({ path, src, file, category }, index) => ({
    id: `${category}-${index + 1}`,
    src,
    alt: prettyName(file),
    category,
    file,
  }));

export const galleryCategories = [...new Set(gallery.map(item => item.category))];

export const galleryByCategory = Object.fromEntries(
  galleryCategories.map(category => [category, gallery.filter(item => item.category === category)])
);

if (import.meta.env?.DEV) {
  const found = [...new Set(Object.keys(images).map(path => path.split("/").slice(-2, -1)[0]))];
  console.info(`[gallery] ${gallery.length} images used. Folders found in assets/gallery: ${found.join(", ") || "(none, check the path)"}`);
}

export default gallery;
