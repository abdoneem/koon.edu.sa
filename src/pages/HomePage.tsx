import { useMemo } from "react"
import { useTranslation } from "react-i18next"
import { MotionSection } from "../components/MotionSection"
import { PageLayout } from "../components/PageLayout"
import { CtaSection } from "../components/sections/CtaSection"
import { FacilitiesTeaserSection } from "../components/sections/FacilitiesTeaserSection"
import { FaqSection } from "../components/sections/FaqSection"
import { FacultySection } from "../components/sections/FacultySection"
import { HeroSection } from "../components/sections/HeroSection"
import { HighlightsSection } from "../components/sections/HighlightsSection"
import { HomeNewsTeaserSection } from "../components/sections/HomeNewsTeaserSection"
import { ProgramsSection } from "../components/sections/ProgramsSection"
import { QuickLinksSection } from "../components/sections/QuickLinksSection"
import { ShowcaseSection } from "../components/sections/ShowcaseSection"
import { VirtualTourSection } from "../components/sections/VirtualTourSection"
import { StatsStrip } from "../components/sections/StatsStrip"
import { TrustBadgesSection } from "../components/sections/TrustBadgesSection"
import { ValuesRibbonSection } from "../components/sections/ValuesRibbonSection"
import { siteImagery } from "../content/siteImagery"
import { useCmsContent } from "../hooks/useCmsContent"
import { fetchLandingPageContent } from "../services/cmsClient"
import type { LandingPageContent } from "../types/cms"

export function HomePage() {
  const { t } = useTranslation()
  const fallback = useMemo(
    () =>
      ({
        hero: {
          title: t("hero.title"),
          subtitle: t("hero.subtitle"),
          primaryCta: t("hero.primaryCta"),
          secondaryCta: t("hero.secondaryCta"),
          location: t("hero.location"),
        },
        programs: t("programs.items", { returnObjects: true }),
        highlights: t("highlights.items", { returnObjects: true }),
      }) as LandingPageContent,
    [t],
  )

  const { content, error, isLoading } = useCmsContent(fetchLandingPageContent, fallback)

  return (
    <PageLayout>
      {error ? (
        <p className="container notice" role="status">
          {error}
        </p>
      ) : null}
      {isLoading ? (
        <p className="container notice" role="status">
          {t("common.loading")}
        </p>
      ) : null}
      <HeroSection
        hero={content.hero}
        brand={t("brand")}
        visionLine={t("hero.visionLine")}
        heroImageSrc={content.hero.backgroundImage?.url ?? siteImagery.hero}
        heroImageAlt={content.hero.backgroundImage?.alt ?? t("imagery.heroAlt")}
        heroImageCaption={t("imagery.heroCaption")}
      />
      <MotionSection>
        <StatsStrip />
      </MotionSection>
      <QuickLinksSection />
      <VirtualTourSection />
      <ValuesRibbonSection />
      <MotionSection>
        <ShowcaseSection />
      </MotionSection>
      <MotionSection>
        <ProgramsSection
          title={t("programs.title")}
          lead={t("programs.lead")}
          feeLabel={t("programs.feeLabel")}
          programs={content.programs}
        />
      </MotionSection>
      <FacilitiesTeaserSection />
      <MotionSection>
        <HighlightsSection
          title={t("highlights.title")}
          lead={t("highlights.lead")}
          highlights={content.highlights}
        />
      </MotionSection>
      <FacultySection />
      <HomeNewsTeaserSection />
      <TrustBadgesSection />
      <FaqSection />
      <CtaSection title={t("cta.title")} action={t("cta.action")} hint={t("cta.hint")} />
    </PageLayout>
  )
}
