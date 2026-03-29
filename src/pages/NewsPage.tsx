import { motion, useReducedMotion } from "framer-motion"
import { useTranslation } from "react-i18next"
import { Link } from "react-router-dom"
import { PageLayout } from "../components/PageLayout"
import { newsImageForId } from "../content/siteImagery"

export function NewsPage() {
  const { t } = useTranslation()
  const reduce = useReducedMotion()
  const items = t("newsPage.items", { returnObjects: true }) as {
    id: string
    iso: string
    date: string
    title: string
    excerpt: string
    imageAlt: string
  }[]

  return (
    <PageLayout>
      <motion.div
        initial={reduce ? false : { opacity: 0, y: 16 }}
        animate={reduce ? undefined : { opacity: 1, y: 0 }}
        transition={{ duration: 0.45 }}
      >
        <header className="page-hero-slab">
          <div className="container">
            <h1 className="page-title">{t("newsPage.title")}</h1>
            <p className="page-subtitle page-hero-lead">{t("newsPage.lead")}</p>
          </div>
        </header>
        <section className="section container">
          <ul className="news-list">
            {items.map((item, i) => {
              const src = newsImageForId(item.id)
              return (
                <motion.li
                  key={item.id}
                  className="news-card"
                  initial={reduce ? false : { opacity: 0, y: 20 }}
                  whileInView={reduce ? undefined : { opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: reduce ? 0 : i * 0.06 }}
                >
                  {src ? (
                    <div className="news-card__media">
                      <img
                        src={src}
                        alt={item.imageAlt}
                        width={960}
                        height={600}
                        loading={i < 2 ? "eager" : "lazy"}
                        decoding="async"
                        className="news-card__img"
                      />
                    </div>
                  ) : null}
                  <div className="news-card__body">
                    <time dateTime={item.iso}>{item.date}</time>
                    <h2>{item.title}</h2>
                    <p>{item.excerpt}</p>
                    <Link to="/contact" className="news-read-more">
                      {t("newsPage.readMore")}
                    </Link>
                  </div>
                </motion.li>
              )
            })}
          </ul>
        </section>
      </motion.div>
    </PageLayout>
  )
}
