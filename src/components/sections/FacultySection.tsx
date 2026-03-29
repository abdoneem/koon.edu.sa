import { useTranslation } from "react-i18next"
import { siteImagery } from "../../content/siteImagery"
import { MotionSection } from "../MotionSection"
import { FigureImage } from "../FigureImage"
import { IconBadge } from "../IconBadge"
import { IconGraduation, IconHandshake, IconUsers } from "../icons/schoolIcons"

const facultyStatIcons = [IconUsers, IconGraduation, IconHandshake] as const

export function FacultySection() {
  const { t } = useTranslation()

  return (
    <MotionSection>
      <section
        className="section faculty-section section-surface section-surface--navy-ink"
        aria-labelledby="faculty-heading"
      >
        <div className="container faculty-inner">
          <div className="faculty-copy">
            <IconBadge variant="light" className="faculty-hero-icon">
              <IconGraduation className="icon-badge__svg" size={24} />
            </IconBadge>
            <h2 id="faculty-heading">{t("home.faculty.title")}</h2>
            <p className="section-lead">{t("home.faculty.lead")}</p>
            <p className="faculty-body">{t("home.faculty.body")}</p>
          </div>
          <FigureImage
            src={siteImagery.faculty}
            alt={t("imagery.facultyPanelAlt")}
            className="faculty-visual"
            width={640}
            height={420}
          />
          <div className="faculty-stats" aria-label={t("home.faculty.statsAria")}>
            {(t("home.faculty.stats", { returnObjects: true }) as { value: string; label: string }[]).map(
              (s, i) => {
                const Ic = facultyStatIcons[i] ?? facultyStatIcons[0]
                return (
                  <div key={s.label} className="faculty-stat">
                    <IconBadge variant="light">
                      <Ic className="icon-badge__svg" size={20} />
                    </IconBadge>
                    <span className="faculty-stat-value">{s.value}</span>
                    <span className="faculty-stat-label">{s.label}</span>
                  </div>
                )
              },
            )}
          </div>
        </div>
      </section>
    </MotionSection>
  )
}
