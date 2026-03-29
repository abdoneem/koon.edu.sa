import { photoUrls } from "./photoUrls"

const svg = (file: string) => `/images/${file}`

/**
 * Saudi-context generated art in /images/saudi plus SVG where abstraction fits (e.g. virtual tour UI).
 */
export const siteImagery = {
  hero: photoUrls.campusExterior,
  showcase: [
    photoUrls.classroomStudents,
    photoUrls.meetingHandshake,
    photoUrls.scienceLab,
  ],
  newsById: {
    n1: photoUrls.hallwayBright,
    n2: photoUrls.receptionLobby,
    n3: photoUrls.scienceLab,
  },
  virtualTour: svg("illustr-virtual-tour.svg"),
  facilitiesTeaser: [
    photoUrls.scienceLab,
    photoUrls.libraryInterior,
    photoUrls.sportsField,
  ],
  programsById: {
    ey: photoUrls.youngWriters,
    el: photoUrls.elementaryClass,
    im: photoUrls.studentStudyTech,
    se: photoUrls.scienceLab,
  },
  highlights: [
    photoUrls.classroomDesks,
    photoUrls.highlightIdentity,
    photoUrls.studentsStudying,
    photoUrls.highlightCommunity,
  ],
  faculty: photoUrls.teamworkTable,
  about: photoUrls.campusExterior,
  pageHero: {
    academics: photoUrls.classroomStudents,
    studentLife: photoUrls.sportsField,
    facilities: photoUrls.hallwayBright,
    admissions: photoUrls.receptionLobby,
    contact: photoUrls.buildingEntrance,
  },
  academicsBlocks: [
    photoUrls.youngWriters,
    photoUrls.studentStudyTech,
    photoUrls.workshopMakers,
    photoUrls.graduationGowns,
  ],
  studentLifeBlocks: [
    photoUrls.teamworkTable,
    photoUrls.artsMusic,
    photoUrls.meetingHandshake,
    photoUrls.elementaryClass,
  ],
  facilitiesZones: [
    photoUrls.classroomDesks,
    photoUrls.scienceLab,
    photoUrls.libraryInterior,
    photoUrls.sportsField,
    photoUrls.artsMusic,
    photoUrls.hallwayBright,
  ],
} as const

export function newsImageForId(id: string): string | undefined {
  return siteImagery.newsById[id as keyof typeof siteImagery.newsById]
}

export function programImageForId(id: string): string | undefined {
  return siteImagery.programsById[id as keyof typeof siteImagery.programsById]
}

export function highlightImageForIndex(i: number): string {
  return siteImagery.highlights[i] ?? siteImagery.highlights[0]
}

/** Home quick-link cards: all photographic backgrounds (no SVG) for visual consistency. */
export function quickLinkImageForId(id: "register" | "whatsapp" | "admissions"): string {
  const map = {
    admissions: photoUrls.receptionLobby,
    whatsapp: photoUrls.meetingHandshake,
    register: photoUrls.buildingEntrance,
  } as const

  return map[id]
}

export function facilitiesTeaserImageForIndex(i: number): string {
  return siteImagery.facilitiesTeaser[i] ?? siteImagery.facilitiesTeaser[0]
}

export function academicsBlockImage(i: number): string {
  return siteImagery.academicsBlocks[i] ?? siteImagery.academicsBlocks[0]
}

export function studentLifeBlockImage(i: number): string {
  return siteImagery.studentLifeBlocks[i] ?? siteImagery.studentLifeBlocks[0]
}

export function facilitiesZoneImage(i: number): string {
  return siteImagery.facilitiesZones[i] ?? siteImagery.facilitiesZones[0]
}
