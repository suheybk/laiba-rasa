import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Brain, ArrowLeft } from "lucide-react";

export const metadata = {
    title: "Kullanım Şartları | L3IBA",
    description: "L3IBA kullanım şartları ve hizmet koşulları.",
};

export default function TermsPage() {
    return (
        <div className="min-h-screen py-20 px-4 page-transition">
            <div className="container mx-auto max-w-3xl">
                {/* Header */}
                <div className="mb-8">
                    <Link href="/" className="inline-flex items-center gap-2 text-violet-400 hover:text-violet-300 mb-6">
                        <ArrowLeft className="w-4 h-4" />
                        Ana Sayfaya Dön
                    </Link>
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center">
                            <Brain className="w-6 h-6 text-white" />
                        </div>
                        <span className="text-2xl font-bold">L3IBA</span>
                    </div>
                    <h1 className="text-4xl font-bold mb-2">Kullanım Şartları</h1>
                    <p className="text-slate-400">Son güncelleme: Ocak 2026</p>
                </div>

                {/* Content */}
                <Card gradient className="p-8">
                    <CardContent className="prose prose-invert max-w-none space-y-6">
                        <section>
                            <h2 className="text-xl font-semibold text-white mb-3">1. Hizmet Kabülü</h2>
                            <p className="text-slate-300 leading-relaxed">
                                L3IBA hizmetlerini kullanarak bu Kullanım Şartları&apos;nı kabul etmiş olursunuz.
                                Bu şartları kabul etmiyorsanız, hizmetlerimizi kullanmamanızı rica ederiz.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-semibold text-white mb-3">2. Hesap Oluşturma</h2>
                            <ul className="list-disc list-inside text-slate-300 space-y-2">
                                <li>Hesap oluşturmak için 13 yaşından büyük olmalısınız.</li>
                                <li>Doğru ve güncel bilgiler sağlamalısınız.</li>
                                <li>Hesap güvenliğinden sizler sorumlusunuz.</li>
                                <li>Hesabınızı başkalarıyla paylaşmamalısınız.</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-xl font-semibold text-white mb-3">3. Kabul Edilebilir Kullanım</h2>
                            <p className="text-slate-300 leading-relaxed">
                                Hizmetlerimizi kullanırken şunları yapmayı kabul edersiniz:
                            </p>
                            <ul className="list-disc list-inside text-slate-300 space-y-2 mt-2">
                                <li>Yasalara ve etik kurallara uymak</li>
                                <li>Diğer kullanıcılara saygılı davranmak</li>
                                <li>Telif haklı içerikleri izinsiz paylaşmamak</li>
                                <li>Sistemi kötüye kullanmamak veya hacklememeye çalışmak</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-xl font-semibold text-white mb-3">4. İçerik Sahipliği</h2>
                            <p className="text-slate-300 leading-relaxed">
                                Oluşturduğunuz notlar ve içerikler size aittir. Ancak, bu içerikleri
                                platformumuzda barındırma ve diğer kullanıcılarla paylaşma (izin verdiğiniz
                                takdirde) hakkını bize vermiş olursunuz.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-semibold text-white mb-3">5. Abonelik ve Ödemeler</h2>
                            <ul className="list-disc list-inside text-slate-300 space-y-2">
                                <li>Ücretli planlar için geçerli ödeme bilgileri gereklidir.</li>
                                <li>Abonelikler otomatik olarak yenilenir.</li>
                                <li>İptal, bir sonraki fatura döneminden önce yapılmalıdır.</li>
                                <li>İade politikamız 7 gün içinde geçerlidir.</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-xl font-semibold text-white mb-3">6. Hizmet Değişiklikleri</h2>
                            <p className="text-slate-300 leading-relaxed">
                                Hizmetlerimizi herhangi bir zamanda değiştirme, askıya alma veya sonlandırma
                                hakkımız saklıdır. Önemli değışikliklerde kullanıcıları önceden bilgilendireceğiz.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-semibold text-white mb-3">7. Sorumluluk Sınırlaması</h2>
                            <p className="text-slate-300 leading-relaxed">
                                L3IBA, hizmetlerin kesintisiz veya hatasız olacağını garanti etmez.
                                Dolaylı, özel veya sonuçsal zararlardan sorumlu değiliz.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-semibold text-white mb-3">8. Uyuşmazlık Çözümü</h2>
                            <p className="text-slate-300 leading-relaxed">
                                Bu şartlardan kaynaklanan uyuşmazlıklar, Türkiye Cumhuriyeti yasalarına
                                tabidir ve İstanbul Mahkemeleri yetkilidir.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-semibold text-white mb-3">9. İletişim</h2>
                            <p className="text-slate-300 leading-relaxed">
                                Sorularınız için{" "}
                                <Link href="/contact" className="text-violet-400 hover:text-violet-300">
                                    iletişim sayfamızı
                                </Link>{" "}
                                ziyaret edebilirsiniz.
                            </p>
                        </section>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
