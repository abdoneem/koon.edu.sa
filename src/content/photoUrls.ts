/**
 * Photorealistic representative images (Saudi / Riyadh, boys’ international school context).
 * Files in public/images/saudi/. Replace with official campus photography when available.
 */
const sa = (file: string) => `/images/saudi/${file}`

export const photoUrls = {
  campusExterior: sa("gen-hero-campus-saudi.png"),
  campusWalkway: sa("gen-hero-campus-saudi.png"),
  classroomDesks: sa("gen-classroom-saudi.png"),
  classroomStudents: sa("gen-classroom-saudi.png"),
  studentsStudying: sa("gen-library-saudi.png"),
  youngWriters: sa("gen-early-years-saudi.png"),
  libraryInterior: sa("gen-library-saudi.png"),
  sportsField: sa("gen-sports-saudi.png"),
  scienceLab: sa("gen-lab-saudi.png"),
  artsMusic: sa("gen-community-saudi.png"),
  workshopMakers: sa("gen-lab-saudi.png"),
  graduationGowns: sa("gen-classroom-saudi.png"),
  meetingHandshake: sa("gen-community-saudi.png"),
  teamworkTable: sa("gen-community-saudi.png"),
  /** Intermediate years — library / focused study (boys’ school) */
  studentStudyTech: sa("gen-library-saudi.png"),
  elementaryClass: sa("gen-classroom-saudi.png"),
  hallwayBright: sa("gen-reception-saudi.png"),
  receptionLobby: sa("gen-reception-saudi.png"),
  buildingEntrance: sa("gen-hero-campus-saudi.png"),
} as const
