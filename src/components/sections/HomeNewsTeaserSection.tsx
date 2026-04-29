import { motion, useReducedMotion } from "framer-motion"
import { useTranslation } from "react-i18next"
import { Link } from "react-router-dom"
import { usePublicLocale } from "../../hooks/usePublicLocale"
import { newsCoverOrFallback } from "../../content/siteImagery"
import { IconTrending } from "../icons/schoolIcons"

export function HomeNewsTeaserSection() {
  const { t } = useTranslation()
  const { href } = usePublicLocale()
  const reduce = useReducedMotion()
  const items = t("newsPage.items", { returnObjects: true }) as {
    id: string
    iso: string
    date: string
    title: string
    excerpt: string
    imageAlt: string
  }[]
  const preview = items.slice(0, 3)

  return (
    <section
      className="section home-news-section section-surface section-surface--mist"
      aria-labelledby="home-news-heading"
    >
      <div className="container">
        <div className="section-head section-head--with-mark">
          <div className="section-head__mark" aria-hidden>
            <IconTrending className="section-head__mark-icon" size={22} />
          </div>
          <p className="eyebrow">{t("home.newsTeaser.eyebrow")}</p>
          <h2 id="home-news-heading">{t("home.newsTeaser.title")}</h2>
          <p className="section-lead">{t("home.newsTeaser.lead")}</p>
        </div>
        <ul className="home-news-grid">
          {preview.map((item, i) => {
            const src = newsCoverOrFallback(item.id)
            return (
              <motion.li
                key={item.id}
                className="home-news-card"
                initial={reduce ? false : { opacity: 0, y: 18 }}
                whileInView={reduce ? undefined : { opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: reduce ? 0 : i * 0.06, duration: 0.4 }}
              >
                {src ? (
                  <div className="home-news-card__media">
                    <img
                      src={src}
                      alt={item.imageAlt}
                      width={640}
                      height={400}
                      loading={i === 0 ? "eager" : "lazy"}
                      decoding="async"
                      className="home-news-card__img"
                    />
                  </div>
                ) : null}
                <div className="home-news-card__body">
                  <time dateTime={item.iso}>{item.date}</time>
                  <h3>{item.title}</h3>
                  <p>{item.excerpt}</p>
                  <Link to={href("/media")} className="home-news-link">
                    {t("home.newsTeaser.readMore")}
                  </Link>
                </div>
              </motion.li>
            )
          })}
        </ul>
        <div className="home-news-footer-cta">
          <Link to={href("/media")} className="btn btn-primary">
            {t("home.newsTeaser.viewAll")}
          </Link>
        </div>
      </div>
    </section>
  )
}
