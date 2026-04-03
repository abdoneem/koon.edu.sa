import { createTheme, type MantineColorsTuple } from "@mantine/core"

/** Matches public site :root — navy #164289, sky #48A9E0 (see index.css). */
export const koonBlue: MantineColorsTuple = [
  "#f0f7ff",
  "#e8f2fc",
  "#cfe5f5",
  "#a8d4ef",
  "#7fc4e8",
  "#48a9e0",
  "#2f8ec4",
  "#1d5599",
  "#164289",
  "#0a1628",
]

export const koonMantineTheme = createTheme({
  primaryColor: "koon",
  colors: {
    koon: koonBlue,
  },
  defaultRadius: "md",
  fontFamily: `"Plus Jakarta Sans", "Cairo", sans-serif`,
  headings: { fontFamily: `"Plus Jakarta Sans", "Cairo", sans-serif`, fontWeight: "600" },
  defaultGradient: { from: "koon.7", to: "koon.5", deg: 135 },
})
