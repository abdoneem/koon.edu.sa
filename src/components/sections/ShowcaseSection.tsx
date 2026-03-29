import { useTranslation } from "react-i18next"
import { siteImagery } from "../../content/siteImagery"
import { IconBadge } from "../IconBadge"
import { FigureImage } from "../FigureImage"
import { IconFlask, IconSparkles, IconUsers } from "../icons/schoolIcons"

type ShowcaseBlock = {
  title: string
  description: string
  imageAlt: string
  imageCaption: string
}

const blockIcons = [IconFlask, IconUsers, IconSparkles] as const

export function ShowcaseSection() {
  const { t } = useTranslation()
  const blocks = t("showcase.blocks", { returnObjects: true }) as ShowcaseBlock[]
  const showcaseImages = siteImagery.showcase

  return (
    <section
      className="section showcase-section section-surface section-surface--parchment"
      aria-labelledby="showcase-heading"
    >
      <div className="container">
        <div className="section-head">
          <h2 id="showcase-heading">{t("showcase.title")}</h2>
          <p className="section-lead">{t("showcase.lead")}</p>
        </div>
        <div className="showcase-list">
          {blocks.map((block, i) => {
            const Ic = blockIcons[i] ?? blockIcons[0]
            return (
              <article
                key={block.title}
                className={`showcase-row ${i % 2 === 1 ? "showcase-row--reverse" : ""}`}
              >
                <div className="showcase-copy">
                  <IconBadge variant="default">
                    <Ic className="icon-badge__svg" size={22} />
                  </IconBadge>
                  <h3>{block.title}</h3>
                  <p>{block.description}</p>
                </div>
                <FigureImage
                  src={showcaseImages[i] ?? showcaseImages[0] ?? siteImagery.hero}
                  alt={block.imageAlt}
                  caption={block.imageCaption}
                  width={880}
                  height={560}
                  className="showcase-media"
                />
              </article>
            )
          })}
        </div>
      </div>
    </section>
  )
}
