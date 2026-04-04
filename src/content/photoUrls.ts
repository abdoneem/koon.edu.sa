/**
 * Photorealistic imagery: official campus building photos in /images/campus/
 * plus generated placeholders in /images/saudi/ for classrooms, labs, etc.
 */
const sa = (file: string) => `/images/saudi/${file}`
const campus = (file: string) => `/images/campus/${file}`

export const photoUrls = {
  /** Building / campus — real photography */
  campusExterior: campus("campus-exterior.jpg"),
  campusWalkway: campus("campus-walkway.jpg"),
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
  hallwayBright: campus("campus-hallway.jpg"),
  receptionLobby: campus("campus-reception.jpg"),
  buildingEntrance: campus("campus-entrance.jpg"),
  /** Highlights grid — identity & roots (card 02) */
  highlightIdentity: sa("gen-highlight-identity-saudi.png"),
  /** Highlights grid — nurturing community (card 04) */
  highlightCommunity: sa("gen-highlight-community-saudi.png"),
} as const
