import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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

export default function HomePage() {
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
              Özellikler
            </Link>
            <Link href="#pricing" className="text-slate-300 hover:text-white transition-colors">
              Fiyatlandırma
            </Link>
            <Link href="#how-it-works" className="text-slate-300 hover:text-white transition-colors">
              Nasıl Çalışır?
            </Link>
          </nav>

          <div className="flex items-center gap-3">
            <Link href="/auth/login">
              <Button variant="ghost">Giriş Yap</Button>
            </Link>
            <Link href="/auth/register">
              <Button>Ücretsiz Başla</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4">
        <div className="container mx-auto text-center max-w-4xl">
          <Badge variant="premium" size="lg" className="mb-6">
            <Sparkles className="w-4 h-4 mr-2" />
            3 Gün Ücretsiz Dene
          </Badge>

          <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
            Notlarını <span className="text-gradient">Oyuna</span> Dönüştür,
            <br />
            <span className="text-gradient-gold">Oynayarak</span> Öğren
          </h1>

          <p className="text-xl text-slate-400 mb-10 max-w-2xl mx-auto">
            LAIBA ile ders notlarını eğlenceli oyunlara dönüştür.
            Dungeon&apos;larda maceraya atıl, Arena&apos;da yarış,
            Raid&apos;lerde takımınla savaş!
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <Link href="/auth/register">
              <Button size="xl" className="w-full sm:w-auto">
                Hemen Başla
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
            <Link href="#how-it-works">
              <Button size="xl" variant="outline" className="w-full sm:w-auto">
                Nasıl Çalışır?
              </Button>
            </Link>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-8 max-w-lg mx-auto">
            <div className="text-center">
              <div className="text-3xl font-bold text-gradient">10K+</div>
              <div className="text-sm text-slate-500">Aktif Öğrenci</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-gradient-gold">50K+</div>
              <div className="text-sm text-slate-500">Oyun Oynandı</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-gradient">4.9</div>
              <div className="text-sm text-slate-500">Kullanıcı Puanı</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Neden LAIBA?</h2>
            <p className="text-slate-400 text-lg">
              Geleneksel öğrenme yöntemlerini unutun, oyunlaştırılmış öğrenme ile tanışın.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <FeatureCard
              icon={<BookOpen className="w-6 h-6" />}
              title="Akıllı Not Sistemi"
              description="4 katmanlı CRAQ metoduyla notlarını yapılandır: Kavramlar, İlişkiler, Uygulamalar, Sorular."
            />
            <FeatureCard
              icon={<Gamepad2 className="w-6 h-6" />}
              title="3 Oyun Modu"
              description="Dungeon'da solo macera, Arena'da 1v1 yarış, Raid'de takım savaşı."
            />
            <FeatureCard
              icon={<Trophy className="w-6 h-6" />}
              title="Ustalık Sistemi"
              description="Konularda ilerlemenizi takip edin, rozetler kazanın, sıralamada yükselin."
            />
            <FeatureCard
              icon={<Target className="w-6 h-6" />}
              title="Kişiselleştirilmiş"
              description="AI destekli zorluk ayarlama, zayıf noktalarınıza odaklanma."
            />
            <FeatureCard
              icon={<Users className="w-6 h-6" />}
              title="Sosyal Öğrenme"
              description="Arkadaşlarınla yarış, takımlar kur, birlikte öğren."
            />
            <FeatureCard
              icon={<Zap className="w-6 h-6" />}
              title="OCR Pro Max"
              description="Ders notlarını kamerayla tara, anında oyuna dönüştür."
              premium
            />
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-20 px-4 relative">
        <div className="container mx-auto max-w-4xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Nasıl Çalışır?</h2>
            <p className="text-slate-400 text-lg">
              3 basit adımda öğrenmeye başla
            </p>
          </div>

          <div className="space-y-8">
            <StepCard
              number={1}
              title="Notlarını Ekle"
              description="Kavramları, ilişkileri, uygulamaları ve soruları gir. CRAQ sistemi ile yapılandır."
            />
            <StepCard
              number={2}
              title="Oyun Üret"
              description="AI motorumuz notlarını analiz eder ve kişiselleştirilmiş oyun kartları oluşturur."
            />
            <StepCard
              number={3}
              title="Oyna ve Öğren"
              description="Dungeon, Arena veya Raid modlarında oyna. Eğlenirken bilgini pekiştir!"
            />
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 px-4">
        <div className="container mx-auto max-w-5xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Basit ve Şeffaf Fiyatlandırma</h2>
            <p className="text-slate-400 text-lg">
              İhtiyacına uygun planı seç. 3 gün ücretsiz dene, beğenmezsen iptal et.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <PricingCard
              name="Ücretsiz"
              price="₺0"
              period="sonsuza dek"
              features={[
                "5 özel not",
                "3 konu ile sınırlı Dungeon",
                "Günde 3 Arena maçı",
                "Temel ustalık takibi",
              ]}
              buttonText="Ücretsiz Başla"
              buttonVariant="secondary"
            />
            <PricingCard
              name="Pro"
              price="₺149.99"
              period="aylık"
              features={[
                "Sınırsız not",
                "Sınırsız Dungeon",
                "Sınırsız Arena",
                "Raid erişimi",
                "Gelişmiş analitik",
                "İçerik üretici kazancı",
              ]}
              buttonText="3 Gün Ücretsiz Dene"
              popular
            />
            <PricingCard
              name="Pro Max"
              price="₺249.99"
              period="aylık"
              features={[
                "Pro'daki her şey",
                "OCR Pro Max (kamera tarama)",
                "Öncelikli destek",
                "Erken erişim özellikleri",
                "Özel rozetler",
              ]}
              buttonText="Pro Max'i Dene"
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
              Öğrenmeyi Oyuna Dönüştürmeye Hazır mısın?
            </h2>
            <p className="text-slate-400 mb-8">
              Binlerce öğrenci LAIBA ile daha etkili öğreniyor. Sen de katıl!
            </p>
            <Link href="/auth/register">
              <Button size="xl">
                Hemen Ücretsiz Başla
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
                Gizlilik Politikası
              </Link>
              <Link href="/terms" className="hover:text-white transition-colors">
                Kullanım Şartları
              </Link>
              <Link href="/contact" className="hover:text-white transition-colors">
                İletişim
              </Link>
            </div>

            <div className="text-sm text-slate-500">
              © 2026 LAIBA. Tüm hakları saklıdır.
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
  premium = false
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  premium?: boolean;
}) {
  return (
    <Card gradient className="p-6 card-hover relative overflow-hidden">
      {premium && (
        <Badge variant="premium" size="sm" className="absolute top-4 right-4">
          Pro Max
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
  popular = false
}: {
  name: string;
  price: string;
  period: string;
  features: string[];
  buttonText: string;
  buttonVariant?: "default" | "secondary" | "gold";
  popular?: boolean;
}) {
  return (
    <Card
      gradient
      glow={popular}
      className={`p-6 relative ${popular ? "border-violet-500/50 scale-105" : ""}`}
    >
      {popular && (
        <Badge variant="premium" className="absolute -top-3 left-1/2 -translate-x-1/2">
          En Popüler
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
