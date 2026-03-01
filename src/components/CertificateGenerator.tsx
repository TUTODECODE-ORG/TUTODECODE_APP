import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Share2, Award, Printer } from 'lucide-react';
import type { Course } from '@/types';

interface CertificateProps {
  course: Course;
  userName?: string; // On pourra le rendre dynamique plus tard
  date?: string;
}

export function CertificateCard({ course, userName = "Agent Tactique", date = new Date().toLocaleDateString() }: CertificateProps) {

  const handlePrint = () => {
    // Construct the certificate HTML safely
    const certificateHtml = `
          <!DOCTYPE html>
          <html>
            <head>
              <title>Proof of Hack - ${course.title.replace(/<[^>]*>?/gm, '')}</title>
              <style>
                @font-face {
                    font-family: 'Inter';
                    src: url('/fonts/inter.woff2') format('woff2');
                }
                body { 
                  margin: 0; 
                  padding: 0; 
                  display: flex; 
                  justify-content: center; 
                  align-items: center; 
                  height: 100vh; 
                  background-color: #000; 
                  font-family: 'monospace';
                  -webkit-print-color-adjust: exact;
                  color: #0f0;
                }
                .certificate {
                  width: 800px;
                  height: 600px;
                  background: #111;
                  padding: 40px;
                  position: relative;
                  border: 2px solid #0f0;
                  display: flex;
                  flex-direction: column;
                  align-items: flex-start;
                  text-align: left;
                  box-shadow: 0 0 20px rgba(0,255,0,0.2);
                }
                .header {
                  color: #0f0;
                  font-size: 32px;
                  font-weight: bold;
                  margin-top: 20px;
                  text-transform: uppercase;
                  letter-spacing: 2px;
                  border-bottom: 2px solid #0f0;
                  width: 100%;
                  padding-bottom: 10px;
                }
                .recipient-name {
                  color: #fff;
                  font-size: 24px;
                  margin: 20px 0;
                  font-weight: bold;
                }
                .course-name {
                  font-weight: bold;
                  font-size: 20px;
                  color: #0f0;
                  margin: 10px 0;
                }
                .footer {
                  margin-top: auto;
                  display: flex;
                  justify-content: space-between;
                  width: 100%;
                  font-size: 14px;
                  color: #0f0;
                }
                .signature {
                  border-top: 1px dashed #0f0;
                  padding-top: 5px;
                  width: 250px;
                }
                .meta-info {
                  margin-top: 20px; 
                  font-style: italic; 
                  color: #888;
                }
                @media print {
                  body { background: none; }
                  .no-print { display: none; }
                }
              </style>
            </head>
            <body>
              <div class="certificate">
                <div class="header">RAPPORT OPÉRATIONNEL - PROOF OF HACK</div>
                <div class="recipient-name">Opérateur : ${userName.replace(/<[^>]*>?/gm, '')}</div>
                <div class="course-name">Mission accomplie : ${course.title.replace(/<[^>]*>?/gm, '')}</div>
                <div class="meta-info">
                  Gouvernance: Clearance Level ${course.level.toUpperCase()} <br/>
                  Durée de l'opération: ${course.duration}
                </div>
                <br/><br/>
                <div class="meta-info">> ÉVALUATION GLOBALE: SUCCÈS</div>
                <div class="meta-info">> HASH DE VALIDATION: ${Math.random().toString(36).substr(2, 10).toUpperCase()}-${Date.now().toString(36).toUpperCase()}</div>
                <div class="footer">
                  <div class="signature">Horodatage: ${date.replace(/<[^>]*>?/gm, '')}</div>
                  <div class="signature">Système Neural TutoDecode</div>
                </div>
              </div>
            </body>
          </html>
        `;

    const printWindow = window.open('', '_blank');
    if (printWindow) {
      // @ts-expect-error - document.open/write deprecated but needed for print
      printWindow.document.open();
      // @ts-expect-error - document.write usage for certificate printing
      printWindow.document.write(certificateHtml);
      printWindow.document.close();

      // Wait for resources and print
      setTimeout(() => {
        printWindow.print();
      }, 1000);
    }
  };

  return (
    <Card className="p-8 bg-black border-2 border-emerald-500/20 shadow-2xl relative overflow-hidden group font-mono">
      {/* Decorative background elements */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-bl-[100px] pointer-events-none transition-transform group-hover:scale-110"></div>
      <div className="absolute top-0 right-0 p-4 opacity-10 font-bold text-4xl text-emerald-500 select-none">POH</div>

      <div className="relative z-10 text-center space-y-6">
        <div className="mx-auto w-16 h-16 bg-gradient-to-br from-emerald-900 to-black border border-emerald-500/50 rounded-xl flex items-center justify-center text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.2)]">
          <Award className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <h2 className="text-xl font-bold tracking-widest text-emerald-500">PROOF OF HACK</h2>
          <p className="text-zinc-400 italic font-mono text-sm">&gt; Opérateur : {userName}</p>
        </div>

        <div className="py-4 border-y border-dashed border-emerald-500/30">
          <h3 className="text-lg font-bold text-white">{course.title}</h3>
          <p className="text-xs text-emerald-600 mt-2 font-mono">
            DURÉE: {course.duration} | {course.level.toUpperCase()}
          </p>
        </div>

        <div className="flex justify-center gap-3 pt-4">
          <Button onClick={handlePrint} className="gap-2 bg-emerald-600/10 text-emerald-400 border border-emerald-500/50 hover:bg-emerald-600/20 hover:text-white">
            <Printer className="w-4 h-4" />
            Générer Rapport PDF
          </Button>
          <Button variant="outline" className="gap-2 border-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-800">
            <Share2 className="w-4 h-4" />
            Partager
          </Button>
        </div>

        <p className="text-[10px] text-zinc-600 pt-4 uppercase tracking-widest">
          Empreinte cryptographique générée le {date}
        </p>
      </div>
    </Card>
  );
}
