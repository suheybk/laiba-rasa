import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Brain, ArrowLeft } from "lucide-react";

export const runtime = "edge";



export const metadata = {
    title: "Gizlilik Politikası | L3IBA",
    description: "L3IBA gizlilik politikası ve kişisel verilerin korunması hakkında bilgi.",
};

export default function PrivacyPage() {
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
                    <h1 className="text-4xl font-bold mb-2">Gizlilik Politikası</h1>
                    <p className="text-slate-400">Son güncelleme: Ocak 2026</p>
                </div>

                {/* Content */}
                <Card gradient className="p-8">
                    <CardContent className="prose prose-invert max-w-none space-y-6">
                        <section>
                            <h2 className="text-xl font-semibold text-white mb-3">1. Giriş</h2>
                            <p className="text-slate-300 leading-relaxed">
                                L3IBA (&quot;biz&quot;, &quot;bizim&quot; veya &quot;uygulama&quot;) olarak, kullanıcılarımızın
                                gizliliğine önem veriyoruz. Bu Gizlilik Politikası, hizmetlerimizi kullanırken
                                topladığımız, kullandığımız ve koruduğumuz bilgileri açıklamaktadır.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-semibold text-white mb-3">2. Topladığımız Bilgiler</h2>
                            <ul className="list-disc list-inside text-slate-300 space-y-2">
                                <li><strong>Hesap Bilgileri:</strong> E-posta adresi, kullanıcı adı, profil fotoğrafı</li>
                                <li><strong>Öğrenme Verileri:</strong> Oluşturduğunuz notlar, oyun skorları, ilerleme durumu</li>
                                <li><strong>Kullanım Verileri:</strong> Uygulama içi etkileşimler, oturum süreleri</li>
                                <li><strong>Cihaz Bilgileri:</strong> Tarayıcı türü, IP adresi, cihaz tanımlayıcıları</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-xl font-semibold text-white mb-3">3. Bilgilerin Kullanımı</h2>
                            <p className="text-slate-300 leading-relaxed">
                                Topladığımız bilgileri şu amaçlarla kullanıyoruz:
                            </p>
                            <ul className="list-disc list-inside text-slate-300 space-y-2 mt-2">
                                <li>Hizmetlerimizi sunmak ve geliştirmek</li>
                                <li>Kişiselleştirilmiş öğrenme deneyimi sağlamak</li>
                                <li>Teknik destek ve müşteri hizmetleri sunmak</li>
                                <li>Güvenlik ve dolandırıcılık önleme</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-xl font-semibold text-white mb-3">4. Veri Güvenliği</h2>
                            <p className="text-slate-300 leading-relaxed">
                                Verilerinizi korumak için endüstri standardı güvenlik önlemleri kullanıyoruz.
                                Tüm veri aktarımları SSL/TLS ile şifrelenmektedir. Ancak, internet üzerinden
                                hiçbir iletim yöntemi %100 güvenli değildir.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-semibold text-white mb-3">5. Üçüncü Taraflarla Paylaşım</h2>
                            <p className="text-slate-300 leading-relaxed">
                                Kişisel bilgilerinizi üçüncü taraflarla satmıyoruz. Hizmet sağlayıcılarımız
                                (hosting, analitik) ile yalnızca hizmet sunumu için gerekli olan bilgileri paylaşıyoruz.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-semibold text-white mb-3">6. Haklarınız</h2>
                            <p className="text-slate-300 leading-relaxed">
                                KVKK kapsamında şu haklara sahipsiniz:
                            </p>
                            <ul className="list-disc list-inside text-slate-300 space-y-2 mt-2">
                                <li>Verilerinize erişim talep etme</li>
                                <li>Verilerin düzeltilmesini veya silinmesini isteme</li>
                                <li>Veri işlemeye itiraz etme</li>
                                <li>Veri taşınabilirliği talep etme</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-xl font-semibold text-white mb-3">7. İletişim</h2>
                            <p className="text-slate-300 leading-relaxed">
                                Gizlilik politikamız hakkında sorularınız için{" "}
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
