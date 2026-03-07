"use client";

import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Download, Loader2 } from "lucide-react";

interface CareerPDFExportProps {
    targetRef: React.RefObject<HTMLDivElement | null>;
    filename?: string;
}

export function CareerPDFExport({ targetRef, filename = "kariyer-raporum" }: CareerPDFExportProps) {
    const [isGenerating, setIsGenerating] = useState(false);

    const handleExport = async () => {
        if (!targetRef.current) return;
        setIsGenerating(true);

        try {
            // Use browser print as a more reliable approach
            const printContent = targetRef.current.cloneNode(true) as HTMLElement;

            // Create print window
            const printWindow = window.open("", "_blank");
            if (!printWindow) {
                alert("Pop-up engelleyici aktif olabilir. Lütfen izin verin.");
                setIsGenerating(false);
                return;
            }

            printWindow.document.write(`
                <!DOCTYPE html>
                <html dir="ltr" lang="tr">
                <head>
                    <meta charset="UTF-8">
                    <title>${filename}</title>
                    <style>
                        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
                        
                        * {
                            margin: 0;
                            padding: 0;
                            box-sizing: border-box;
                        }
                        
                        body {
                            font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
                            background: #0f172a;
                            color: #e2e8f0;
                            padding: 2rem;
                            -webkit-print-color-adjust: exact;
                            print-color-adjust: exact;
                        }
                        
                        .pdf-header {
                            text-align: center;
                            margin-bottom: 2rem;
                            padding-bottom: 1.5rem;
                            border-bottom: 2px solid #334155;
                        }
                        
                        .pdf-header h1 {
                            font-size: 2rem;
                            font-weight: 800;
                            background: linear-gradient(135deg, #a78bfa, #22d3ee);
                            -webkit-background-clip: text;
                            -webkit-text-fill-color: transparent;
                            margin-bottom: 0.5rem;
                        }
                        
                        .pdf-header p {
                            color: #94a3b8;
                            font-size: 0.875rem;
                        }
                        
                        .pdf-section {
                            margin-bottom: 1.5rem;
                            background: #1e293b;
                            border: 1px solid #334155;
                            border-radius: 1rem;
                            padding: 1.5rem;
                        }
                        
                        .pdf-section h2 {
                            font-size: 1.125rem;
                            font-weight: 700;
                            margin-bottom: 1rem;
                            color: #f1f5f9;
                        }
                        
                        .pdf-radar {
                            text-align: center;
                        }
                        
                        .pdf-job {
                            display: flex;
                            align-items: center;
                            gap: 1rem;
                            padding: 0.75rem 1rem;
                            background: #0f172a;
                            border: 1px solid #334155;
                            border-radius: 0.75rem;
                            margin-bottom: 0.5rem;
                        }
                        
                        .pdf-job-rank {
                            width: 2.5rem;
                            height: 2.5rem;
                            border-radius: 0.75rem;
                            background: linear-gradient(135deg, rgba(139,92,246,0.2), rgba(34,211,238,0.2));
                            display: flex;
                            align-items: center;
                            justify-content: center;
                            font-weight: 700;
                            color: #a78bfa;
                            flex-shrink: 0;
                        }
                        
                        .pdf-job-info {
                            flex: 1;
                        }
                        
                        .pdf-job-name {
                            font-weight: 600;
                        }
                        
                        .pdf-job-sub {
                            font-size: 0.75rem;
                            color: #64748b;
                        }
                        
                        .pdf-job-score {
                            font-weight: 600;
                            color: #a78bfa;
                            font-size: 0.875rem;
                        }
                        
                        .pdf-footer {
                            text-align: center;
                            margin-top: 2rem;
                            padding-top: 1.5rem;
                            border-top: 1px solid #334155;
                            color: #64748b;
                            font-size: 0.75rem;
                        }
                        
                        .pdf-badge {
                            display: inline-block;
                            padding: 0.25rem 0.75rem;
                            border-radius: 9999px;
                            font-size: 0.75rem;
                            background: rgba(139,92,246,0.15);
                            color: #a78bfa;
                            border: 1px solid rgba(139,92,246,0.3);
                            margin: 0.25rem;
                        }
                        
                        .pdf-stats {
                            display: flex;
                            justify-content: center;
                            gap: 1rem;
                            margin-bottom: 1rem;
                        }
                        
                        @media print {
                            body { padding: 1rem; }
                            .no-print { display: none !important; }
                        }
                    </style>
                </head>
                <body>
                    ${printContent.innerHTML}
                    <div class="pdf-footer">
                        <p>LAIBA — Kariyer Keşif Raporu</p>
                        <p>l3iba.com • ${new Date().toLocaleDateString('tr-TR')}</p>
                    </div>
                    <script>
                        setTimeout(() => {
                            window.print();
                            setTimeout(() => window.close(), 1000);
                        }, 500);
                    </script>
                </body>
                </html>
            `);
            printWindow.document.close();
        } catch (err) {
            console.error("PDF export error:", err);
            alert("PDF oluşturulurken bir hata oluştu.");
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <Button variant="outline" onClick={handleExport} disabled={isGenerating}>
            {isGenerating ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
                <Download className="w-4 h-4 mr-2" />
            )}
            PDF İndir
        </Button>
    );
}
