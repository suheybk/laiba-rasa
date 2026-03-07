import { setRequestLocale } from 'next-intl/server';
import { Link } from "@/lib/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LanguageSwitcher } from "@/components/ui/language-switcher";
import { getTranslations } from "next-intl/server";
import {

  BookOpen,
  Gamepad2,
  Trophy,
  Users,
  Sparkles,
  Brain,
  Target,
  Zap,
  ArrowRight,
  Check
} from "lucide-react";



export default async function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "HomePage" });
  const tNav = await getTranslations({ locale, namespace: "Navigation" });
  const tPricing = await getTranslations({ locale, namespace: "HomePage.pricing" });

  return (
    <div className="min-h-screen page-transition">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 glass">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center">
              <Brain className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold text-gradient">LAIBA</span>
          </Link>

          <nav className="hidden md:flex items-center gap-8">
            <Link href="#features" className="text-slate-300 hover:text-white transition-colors">
              {tNav("features")}
            </Link>
            <Link href="#pricing" className="text-slate-300 hover:text-white transition-colors">
              {tNav("pricing")}
            </Link>
            <Link href="#how-it-works" className="text-slate-300 hover:text-white transition-colors">
              {t("howItWorks.title")}
            </Link>
          </nav>

          <div className="flex items-center gap-3">
            <LanguageSwitcher />
            <Link href="/auth/login">
              <Button variant="ghost">{tNav("login")}</Button>
            </Link>
            <Link href="/auth/register">
              <Button>{tNav("register")}</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4">
        <div className="container mx-auto text-center max-w-4xl">
          <Badge variant="premium" size="lg" className="mb-6">
            <Sparkles className="w-4 h-4 mr-2" />
            {t("hero.badge")}
          </Badge>

          <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
            {t("hero.title1")} <span className="text-gradient">{t("hero.titleHighlight1")}</span> {t("hero.title2")}
            <br />
            <span className="text-gradient-gold">{t("hero.titleHighlight2")}</span> {t("hero.title3")}
          </h1>

          <p className="text-xl text-slate-400 mb-10 max-w-2xl mx-auto">
            {t("hero.description")}
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <Link href="/auth/register">
              <Button size="xl" className="w-full sm:w-auto">
                {t("hero.ctaStart")}
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
            <Link href="#how-it-works">
              <Button size="xl" variant="outline" className="w-full sm:w-auto">
                {t("hero.ctaHow")}
              </Button>
            </Link>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-8 max-w-lg mx-auto">
            <div className="text-center">
              <div className="text-3xl font-bold text-gradient">10K+</div>
              <div className="text-sm text-slate-500">{t("stats.students")}</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-gradient-gold">50K+</div>
              <div className="text-sm text-slate-500">{t("stats.games")}</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-gradient">4.9</div>
              <div className="text-sm text-slate-500">{t("stats.rating")}</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">{t("featuresSection.title")}</h2>
            <p className="text-slate-400 text-lg">
              {t("featuresSection.subtitle")}
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <FeatureCard
              icon={<BookOpen className="w-6 h-6" />}
              title={t("featuresSection.smartNotes")}
              description={t("featuresSection.smartNotesDesc")}
            />
            <FeatureCard
              icon={<Gamepad2 className="w-6 h-6" />}
              title={t("featuresSection.gameModes")}
              description={t("featuresSection.gameModesDesc")}
            />
            <FeatureCard
              icon={<Trophy className="w-6 h-6" />}
              title={t("featuresSection.mastery")}
              description={t("featuresSection.masteryDesc")}
            />
            <FeatureCard
              icon={<Target className="w-6 h-6" />}
              title={t("featuresSection.personalized")}
              description={t("featuresSection.personalizedDesc")}
            />
            <FeatureCard
              icon={<Users className="w-6 h-6" />}
              title={t("featuresSection.social")}
              description={t("featuresSection.socialDesc")}
            />
            <FeatureCard
              icon={<Zap className="w-6 h-6" />}
              title={t("featuresSection.ocrPro")}
              description={t("featuresSection.ocrProDesc")}
              premium
              premiumLabel="Pro Max"
            />
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-20 px-4 relative">
        <div className="container mx-auto max-w-4xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">{t("howItWorks.title")}</h2>
            <p className="text-slate-400 text-lg">
              {t("howItWorks.subtitle")}
            </p>
          </div>

          <div className="space-y-8">
            <StepCard
              number={1}
              title={t("howItWorks.step1Title")}
              description={t("howItWorks.step1Desc")}
            />
            <StepCard
              number={2}
              title={t("howItWorks.step2Title")}
              description={t("howItWorks.step2Desc")}
            />
            <StepCard
              number={3}
              title={t("howItWorks.step3Title")}
              description={t("howItWorks.step3Desc")}
            />
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 px-4">
        <div className="container mx-auto max-w-5xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">{tPricing("title")}</h2>
            <p className="text-slate-400 text-lg">
              {tPricing("subtitle")}
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <PricingCard
              name={tPricing("free")}
              price="₺0"
              period={tPricing("forever")}
              features={[
                tPricing("features.notes5"),
                tPricing("features.dungeon3"),
                tPricing("features.arena3"),
                tPricing("features.basicTracking"),
              ]}
              buttonText={tPricing("freeStart")}
              buttonVariant="secondary"
            />
            <PricingCard
              name={tPricing("pro")}
              price="₺149.99"
              period={tPricing("monthly")}
              features={[
                tPricing("features.unlimitedNotes"),
                tPricing("features.unlimitedDungeon"),
                tPricing("features.unlimitedArena"),
                tPricing("features.raidAccess"),
                tPricing("features.advancedAnalytics"),
                tPricing("features.creatorEarnings"),
              ]}
              buttonText={tPricing("tryFree")}
              popular
              popularLabel={tPricing("popular")}
            />
            <PricingCard
              name={tPricing("proMax")}
              price="₺249.99"
              period={tPricing("monthly")}
              features={[
                tPricing("features.allProFeatures"),
                tPricing("features.ocrProMax"),
                tPricing("features.prioritySupport"),
                tPricing("features.earlyAccess"),
                tPricing("features.specialBadges"),
              ]}
              buttonText={tPricing("tryProMax")}
              buttonVariant="gold"
            />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-3xl">
          <Card gradient glow className="p-12 text-center">
            <h2 className="text-3xl font-bold mb-4">
              {t("cta.title")}
            </h2>
            <p className="text-slate-400 mb-8">
              {t("cta.subtitle")}
            </p>
            <Link href="/auth/register">
              <Button size="xl">
                {t("cta.button")}
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 border-t border-slate-800">
        <div className="container mx-auto max-w-6xl">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center">
                <Brain className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold">LAIBA</span>
            </div>

            <div className="flex gap-6 text-sm text-slate-400">
              <Link href="/privacy" className="hover:text-white transition-colors">
                {t("footer.privacy")}
              </Link>
              <Link href="/terms" className="hover:text-white transition-colors">
                {t("footer.terms")}
              </Link>
              <Link href="/contact" className="hover:text-white transition-colors">
                {t("footer.contact")}
              </Link>
            </div>

            <div className="text-sm text-slate-500">
              {t("footer.copyright")}
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

// Feature Card Component
function FeatureCard({
  icon,
  title,
  description,
  premium = false,
  premiumLabel = "Pro Max"
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  premium?: boolean;
  premiumLabel?: string;
}) {
  return (
    <Card gradient className="p-6 card-hover relative overflow-hidden">
      {premium && (
        <Badge variant="premium" size="sm" className="absolute top-4 right-4">
          {premiumLabel}
        </Badge>
      )}
      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-500/20 to-indigo-500/20 flex items-center justify-center text-violet-400 mb-4">
        {icon}
      </div>
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      <p className="text-slate-400 text-sm">{description}</p>
    </Card>
  );
}

// Step Card Component
function StepCard({
  number,
  title,
  description
}: {
  number: number;
  title: string;
  description: string;
}) {
  return (
    <div className="flex gap-6 items-start">
      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
        {number}
      </div>
      <div>
        <h3 className="text-xl font-semibold mb-2">{title}</h3>
        <p className="text-slate-400">{description}</p>
      </div>
    </div>
  );
}

// Pricing Card Component
function PricingCard({
  name,
  price,
  period,
  features,
  buttonText,
  buttonVariant = "default",
  popular = false,
  popularLabel = "Most Popular"
}: {
  name: string;
  price: string;
  period: string;
  features: string[];
  buttonText: string;
  buttonVariant?: "default" | "secondary" | "gold";
  popular?: boolean;
  popularLabel?: string;
}) {
  return (
    <Card
      gradient
      glow={popular}
      className={`p-6 relative ${popular ? "border-violet-500/50 scale-105" : ""}`}
    >
      {popular && (
        <Badge variant="premium" className="absolute -top-3 left-1/2 -translate-x-1/2">
          {popularLabel}
        </Badge>
      )}
      <div className="text-center mb-6">
        <h3 className="text-xl font-semibold mb-2">{name}</h3>
        <div className="flex items-baseline justify-center gap-1">
          <span className="text-4xl font-bold">{price}</span>
          <span className="text-slate-400">/ {period}</span>
        </div>
      </div>

      <ul className="space-y-3 mb-8">
        {features.map((feature, index) => (
          <li key={index} className="flex items-center gap-2 text-sm">
            <Check className="w-4 h-4 text-emerald-400 flex-shrink-0" />
            <span className="text-slate-300">{feature}</span>
          </li>
        ))}
      </ul>

      <Link href="/auth/register" className="block">
        <Button
          variant={buttonVariant}
          className="w-full"
        >
          {buttonText}
        </Button>
      </Link>
    </Card>
  );
}
