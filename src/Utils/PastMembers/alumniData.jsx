// Alumni of NANMS UDUS, from ALUMNI_NANMS_UDUS.docx (2025 list). 81 named alumni, newest class first.
// Fields match AlumniCard.jsx: name, title, cover_pic_url, class, current_title, current_practice_location, desc.
//
// Cover pictures come from src/assets/gallery/Alumni (any capitalisation). Each image is matched to a person automatically from its
// FILE NAME, which should contain the title, the name and the class, e.g.  Dr. Isah Idris Haruna (Class of 2022).jpg
// Matching ignores capitalisation, "Dr."/"Prof.", punctuation and word order, and needs the same class year.
// Anyone without a matching image gets PLACEHOLDER. In development, the console lists unmatched images/people.

// Folder and file names may use any capitals (Alumni, alumni, ...): Linux builds on Vercel are case-sensitive,
// so every image in assets/gallery is collected and the folder is picked by its lower-case name below.
const ALUMNI_FOLDER = "alumni";

// Path starts with /src = from the project root, so this file can live in any folder.
const allImages = import.meta.glob("/src/assets/gallery/*/*.{jpg,jpeg,png,webp,gif,svg,avif,JPG,JPEG,PNG,WEBP,GIF,SVG,AVIF}", { eager: true, import: "default" });

const folderOf = path => path.split("/").slice(-2, -1)[0] || "";
const images = Object.fromEntries(Object.entries(allImages).filter(([path]) => folderOf(path).toLowerCase() === ALUMNI_FOLDER));

// Placeholder: a file called placeholder.* inside the alumni folder if you add one, otherwise a built-in grey avatar.
const BUILT_IN_PLACEHOLDER = "data:image/svg+xml;utf8," + encodeURIComponent(
  "<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><rect width='100' height='100' fill='#d9dde3'/><circle cx='50' cy='38' r='18' fill='#9aa3af'/><path d='M14 92c4-22 20-32 36-32s32 10 36 32z' fill='#9aa3af'/></svg>"
);
const placeholderEntry = Object.entries(images).find(([path]) => /^placeholder\./i.test(path.split("/").pop()));
const PLACEHOLDER = placeholderEntry ? placeholderEntry[1] : BUILT_IN_PLACEHOLDER;
if (placeholderEntry) delete images[placeholderEntry[0]];
const IMAGE_FOLDER = "";

const TITLE_WORDS = new Set(["dr", "prof", "professor", "mr", "mrs", "ms"]);

const words = text =>
  String(text).toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, " ").split(" ").filter(word => word && !TITLE_WORDS.has(word));

// "Dr. Isah Idris Haruna (Class of 2022).jpg" -> { year: 2022, tokens: ["isah","idris","haruna"] }
function readFileName(path) {
  let file = path.split("/").pop();
  try { file = decodeURIComponent(file); } catch { /* keep the raw name */ }
  file = file.replace(/\.[^.]+$/, "");
  const yearMatch = file.match(/class\s*(?:of|0f)?\s*(\d{4})/i) || file.match(/\b(19|20)\d{2}\b/);
  const year = yearMatch ? Number(yearMatch[1].length === 4 ? yearMatch[1] : yearMatch[0]) : null;
  const nameOnly = file.replace(/\(?\s*class[^)]*\)?/i, " ").replace(/\b(19|20)\d{2}\b/g, " ");
  return { year, tokens: words(nameOnly) };
}

function findImage(person, files) {
  const mine = words(person.name);
  let best = null, bestScore = 0;
  for (const file of files) {
    if (file.year !== person.class) continue;
    const shared = file.tokens.filter(token => mine.includes(token)).length;
    // every word in the shorter of the two names must appear in the other, and at least two words must agree
    const needed = Math.min(mine.length, file.tokens.length);
    if (shared < Math.min(2, needed) || shared < needed) continue;
    const score = shared * 10 - Math.abs(mine.length - file.tokens.length);
    if (score > bestScore) { best = file; bestScore = score; }
  }
  return best;
}

const files = Object.entries(images).map(([path, url]) => ({ path, url, ...readFileName(path) }));

const people = [
  { name: "Isah Idris Haruna", title: "Dr.", class: 2022, current_title: "", current_practice_location: "UATH Gwagwalada, Abuja", desc: "Class president. Graduated 2024." },
  { name: "Abdullahi Adamu Abugi", title: "Dr.", class: 2022, current_title: "", current_practice_location: "General Hospital Minna", desc: "Graduated 2024." },
  { name: "Abdullahi Muhammad Ndawondi", title: "Dr.", class: 2022, current_title: "", current_practice_location: "General Hospital Minna", desc: "Graduated 2024." },
  { name: "Ahmed Yusuf", title: "Dr.", class: 2022, current_title: "", current_practice_location: "FMC Bida", desc: "Graduated 2024." },
  { name: "Aisha Abdulwasiu Zubair", title: "Dr.", class: 2022, current_title: "", current_practice_location: "IBB Specialist Hospital", desc: "Graduated 2024." },
  { name: "Umar Faruq Husseini", title: "Dr.", class: 2022, current_title: "", current_practice_location: "Federal Medical Centre, Gusau", desc: "Graduated 2024." },
  { name: "Usman Muhammad Alfa", title: "Dr.", class: 2021, current_title: "", current_practice_location: "General Hospital Minna", desc: "Class president. Graduated 2023." },
  { name: "Muhammad Abdullahi Saba", title: "Dr.", class: 2021, current_title: "", current_practice_location: "", desc: "Graduated 2023." },
  { name: "Summayah Abdallah", title: "Dr.", class: 2021, current_title: "", current_practice_location: "", desc: "Graduated 2023." },
  { name: "Awwal Abdullahi Muhammad", title: "Dr.", class: 2021, current_title: "Medical Officer", current_practice_location: "", desc: "Class president. Graduated 2022." },
  { name: "Ni’imah Rabiu", title: "Dr.", class: 2021, current_title: "Medical Officer", current_practice_location: "Niger State", desc: "Graduated 2022." },
  { name: "Ibrahim Husseini", title: "Dr.", class: 2021, current_title: "Medical Officer", current_practice_location: "", desc: "Graduated 2022." },
  { name: "Abdulazeez Usman", title: "Dr.", class: 2021, current_title: "Medical Officer", current_practice_location: "", desc: "Graduated 2022." },
  { name: "Farid Mikail", title: "Dr.", class: 2021, current_title: "Medical Officer", current_practice_location: "", desc: "Graduated 2022." },
  { name: "Idris Aliyu Gbodoti", title: "Dr.", class: 2020, current_title: "Medical Officer", current_practice_location: "IBB Specialist Hospital", desc: "Class president. Graduated 2021." },
  { name: "Asma’u Muhammad", title: "Dr.", class: 2020, current_title: "Registrar", current_practice_location: "Jos University Teaching Hospital", desc: "Graduated 2021." },
  { name: "Aisha Y. Muhammad", title: "Dr.", class: 2020, current_title: "Medical Officer", current_practice_location: "", desc: "Graduated 2021." },
  { name: "Idris Ibrahim Kuta", title: "Dr.", class: 2020, current_title: "Medical Officer", current_practice_location: "IBB Specialist Hospital", desc: "Graduated 2021." },
  { name: "Abubakar Aliyu Danjuma", title: "Dr.", class: 2020, current_title: "Radiology Resident", current_practice_location: "", desc: "Graduated 2021." },
  { name: "Umar Abubakar", title: "Dr.", class: 2020, current_title: "Registrar, Orthopedics", current_practice_location: "Federal Teaching Hospital, Katsina", desc: "Graduated 2021." },
  { name: "Ibrahim Sanda Tukura", title: "Dr.", class: 2020, current_title: "Senior Medical Officer / Registrar", current_practice_location: "", desc: "Graduated 2021." },
  { name: "Khaleed Muhammad", title: "Dr.", class: 2020, current_title: "", current_practice_location: "", desc: "Graduated 2021." },
  { name: "Ibrahim Abubakar Usman", title: "Dr.", class: 2019, current_title: "Medical Officer", current_practice_location: "", desc: "Class president." },
  { name: "Muhammad Aisha Isah", title: "Dr.", class: 2019, current_title: "Medical Officer", current_practice_location: "", desc: "" },
  { name: "Adamu Yusuf", title: "Dr.", class: 2019, current_title: "Medical Officer", current_practice_location: "", desc: "" },
  { name: "Fatima Umar Tafida", title: "Dr.", class: 2019, current_title: "Resident, O&G", current_practice_location: "", desc: "" },
  { name: "Hauwa Ummi Abubakar", title: "Dr.", class: 2019, current_title: "Registrar, Anaesthesia", current_practice_location: "AKTH", desc: "" },
  { name: "Muhammad Abdulkadir Kandi", title: "Dr.", class: 2019, current_title: "", current_practice_location: "", desc: "" },
  { name: "Yahaya Ndakotsu", title: "Dr.", class: 2018, current_title: "GP / Registrar", current_practice_location: "United Kingdom", desc: "" },
  { name: "Abubakar Sadiq Aliyu", title: "Dr.", class: 2018, current_title: "Senior Registrar, Radiology", current_practice_location: "UATH Gwagwalada", desc: "" },
  { name: "Muhammad Alfa", title: "Dr.", class: 2017, current_title: "Radiology Resident", current_practice_location: "UDUTH, Sokoto", desc: "" },
  { name: "Abdulsalam Abdulmalik", title: "Dr.", class: 2017, current_title: "Senior Registrar, Microbiology", current_practice_location: "UDUTH, Sokoto", desc: "" },
  { name: "Nasir Jibril", title: "Dr.", class: 2017, current_title: "", current_practice_location: "United Kingdom", desc: "" },
  { name: "Fauziyah Abdallah", title: "Dr.", class: 2017, current_title: "Ophthalmology", current_practice_location: "UDUTH, Sokoto", desc: "" },
  { name: "Babastu Adamu", title: "Dr.", class: 2017, current_title: "Senior Medical Officer", current_practice_location: "", desc: "" },
  { name: "Miriam Joshua Aliyu", title: "Dr.", class: 2017, current_title: "Senior Medical Officer", current_practice_location: "", desc: "" },
  { name: "Ahmed Aliyu", title: "Dr.", class: 2017, current_title: "", current_practice_location: "", desc: "" },
  { name: "Musa Alhaji Shehu", title: "Dr.", class: 2016, current_title: "Research Clinician (MRC)", current_practice_location: "The Gambia, London School of Hygiene and Tropical Medicine", desc: "" },
  { name: "Suleiman Awwal Makusidi", title: "Dr.", class: 2016, current_title: "Consultant Psychiatrist", current_practice_location: "UMTH", desc: "" },
  { name: "Fatima Abubakar", title: "Dr.", class: 2016, current_title: "Senior Registrar, O&G", current_practice_location: "FMC Gusau", desc: "" },
  { name: "Mustapha Shaba", title: "Dr.", class: 2016, current_title: "Resident", current_practice_location: "National Eye Centre, Kaduna", desc: "" },
  { name: "Shafa Shehu", title: "Dr.", class: 2016, current_title: "", current_practice_location: "", desc: "" },
  { name: "Alfa Yusuf", title: "Dr.", class: 2015, current_title: "Consultant, O&G", current_practice_location: "FMC Bida", desc: "" },
  { name: "Salihu Muhammad", title: "Dr.", class: 2015, current_title: "Head, Hospital Services", current_practice_location: "General Hospital Agaie", desc: "" },
  { name: "Umar Ndagi", title: "Dr.", class: 2014, current_title: "State Lead and Public Health Advisor", current_practice_location: "Georgetown Global Health Nigeria", desc: "Graduated 2015." },
  { name: "Babadoko Mustapha", title: "Dr.", class: 2013, current_title: "Senior Registrar", current_practice_location: "ABUTH Zaria", desc: "Graduated 2014." },
  { name: "Kabiru Muhammad Dankani", title: "Dr.", class: 2013, current_title: "Resident", current_practice_location: "AKTH Kano", desc: "Graduated 2014." },
  { name: "Tasiu Ibrahim", title: "Dr.", class: 2013, current_title: "", current_practice_location: "", desc: "Graduated 2014." },
  { name: "Amina Gana", title: "Dr.", class: 2013, current_title: "", current_practice_location: "", desc: "Graduated 2014." },
  { name: "Aisha Haruna Abdullahi", title: "Dr.", class: 2013, current_title: "", current_practice_location: "Asokoro District Hospital, Abuja", desc: "Graduated 2014." },
  { name: "Muhammad Baba", title: "Dr.", class: 2012, current_title: "Senior Registrar, Urology", current_practice_location: "FMC Bida", desc: "" },
  { name: "Habiba Bello Saidu", title: "Dr.", class: 2012, current_title: "", current_practice_location: "", desc: "" },
  { name: "Abdullahi Muhammad Panti", title: "Dr.", class: 2011, current_title: "Senior Registrar, Family Medicine", current_practice_location: "FMC Bida", desc: "" },
  { name: "Aisha Gogo Ahmed", title: "Dr.", class: 2011, current_title: "Senior Registrar, Family Medicine", current_practice_location: "FMC Bida", desc: "" },
  { name: "Ibrahim Ndagi", title: "Dr.", class: 2011, current_title: "Senior Registrar, Ophthalmology", current_practice_location: "FMC Bida / National Eye Centre, Kaduna", desc: "" },
  { name: "Aisha Nnaguda Abdullahi", title: "Dr.", class: 2011, current_title: "", current_practice_location: "", desc: "" },
  { name: "Aisha Usman", title: "Dr.", class: 2010, current_title: "Senior Registrar, Family Medicine", current_practice_location: "FMC Bida", desc: "" },
  { name: "Muhammad Jiya Fatima", title: "Dr.", class: 2010, current_title: "Senior Registrar", current_practice_location: "FMC Bida", desc: "" },
  { name: "Yakubu Raji Egigogo", title: "Dr.", class: 2009, current_title: "Assistant Director, Epidemiology and Research", current_practice_location: "Georgetown Global Health Nigeria", desc: "" },
  { name: "Jibrin Papilo", title: "Dr.", class: 2009, current_title: "", current_practice_location: "", desc: "" },
  { name: "Fatima Abdullahi Raji", title: "Dr.", class: 2009, current_title: "Senior Registrar, O&G", current_practice_location: "UDUTH Sokoto", desc: "" },
  { name: "Musa Mustapha", title: "Dr.", class: 2008, current_title: "Department of Anatomy", current_practice_location: "ABU Zaria", desc: "" },
  { name: "Gana Yakubu", title: "Dr.", class: 2007, current_title: "Consultant", current_practice_location: "FMC Bida", desc: "" },
  { name: "Mohammad Saleh", title: "Dr.", class: 2007, current_title: "Senior Emergency Management Specialist", current_practice_location: "U.S. CDC", desc: "" },
  { name: "Ruqayya Ahmad", title: "Dr.", class: 2007, current_title: "Neonatal Unit", current_practice_location: "JBAM Minna", desc: "" },
  { name: "Makun Babazhitsu", title: "Dr.", class: 2002, current_title: "Senior Lecturer / Consultant, Clinical Microbiology", current_practice_location: "UDUTH, Sokoto", desc: "" },
  { name: "Bala Edward", title: "Dr.", class: 2002, current_title: "Consultant, Plastic Surgery", current_practice_location: "FMC Bida", desc: "" },
  { name: "Yusuf Ibrahim", title: "Dr.", class: 2002, current_title: "Consultant, Family Medicine", current_practice_location: "FMC Bida", desc: "" },
  { name: "Ahmed Baba", title: "Dr.", class: 2002, current_title: "", current_practice_location: "", desc: "" },
  { name: "Adama Saidu", title: "Dr.", class: 2001, current_title: "Consultant, Family Medicine", current_practice_location: "", desc: "" },
  { name: "Baba Jibril", title: "Dr.", class: 1999, current_title: "Consultant Paediatrician", current_practice_location: "UDUTH Sokoto", desc: "" },
  { name: "M. A. Makusidi", title: "Prof.", class: 1999, current_title: "Professor / Consultant, Nephrology", current_practice_location: "UDUTH Sokoto", desc: "" },
  { name: "Daniel Jiya Aliyu", title: "Prof.", class: 1999, current_title: "Professor / Consultant, ENT", current_practice_location: "", desc: "" },
  { name: "E. U. Yunusa", title: "Prof.", class: 1999, current_title: "Professor / Consultant, Community Medicine", current_practice_location: "UDUTH Sokoto", desc: "" },
  { name: "Jibril Isah", title: "Dr.", class: 1998, current_title: "Director, Medical Services", current_practice_location: "Hospital Management Board, Minna, Niger State", desc: "First accredited set; first NANMS UDUS set (formerly NISMESA)." },
  { name: "Abubakar Panti", title: "Prof.", class: 1998, current_title: "Professor / Consultant, O&G", current_practice_location: "UDUTH Sokoto", desc: "First accredited set; first NANMS UDUS set (formerly NISMESA)." },
  { name: "Idris Haruna", title: "Dr.", class: 1998, current_title: "Consultant, O&G", current_practice_location: "FMC Bida", desc: "First accredited set; first NANMS UDUS set (formerly NISMESA)." },
  { name: "Mustapha Aliyu Yahaya", title: "Dr.", class: 1998, current_title: "Consultant", current_practice_location: "General Hospital Suleja", desc: "First accredited set; first NANMS UDUS set (formerly NISMESA)." },
  { name: "Adamu Umar Gati", title: "Dr.", class: 1998, current_title: "Consultant Cardiologist", current_practice_location: "South Africa", desc: "First accredited set; first NANMS UDUS set (formerly NISMESA)." },
  { name: "Isah Umar", title: "Dr.", class: 1998, current_title: "Consultant / EMD", current_practice_location: "Hospital Management Board, Minna", desc: "First accredited set; first NANMS UDUS set (formerly NISMESA)." },
  { name: "Muhammad Alhaji Ndakotsu", title: "Dr.", class: 1997, current_title: "Consultant, Haematology", current_practice_location: "UDUTH Sokoto", desc: "Completed in UNIMAID." },
];

const used = new Set();
export const alumni = people.map(person => {
  const match = findImage(person, files);
  if (match) used.add(match.path);
  return { ...person, cover_pic_url: match ? match.url : PLACEHOLDER };
});

if (import.meta.env?.DEV) {
  const noPhoto = alumni.filter(person => person.cover_pic_url === PLACEHOLDER).map(person => `${person.title} ${person.name} (${person.class})`);
  const unused = files.filter(file => !used.has(file.path)).map(file => file.path.replace(IMAGE_FOLDER, ""));
  if (unused.length) console.warn("[alumniData] images that matched nobody:", unused);
  if (noPhoto.length) console.info(`[alumniData] ${noPhoto.length} alumni using the placeholder:`, noPhoto);
}

export default alumni;
