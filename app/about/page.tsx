import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Shield, Lock, Code, Database, Cloud, GitBranch } from 'lucide-react';
import { Card } from '@/components/ui/card';

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <Header />
      
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">About FilePushedQR</h1>
          <p className="text-xl text-muted-foreground">
            Enterprise-grade secure file sharing built with privacy-first principles
          </p>
        </div>

        {/* Mission */}
        <Card className="p-8 mb-8">
          <h2 className="text-2xl font-bold mb-4">Our Mission</h2>
          <p className="text-muted-foreground leading-relaxed">
            FilePushedQR was built to demonstrate that true privacy and security don't have to 
            come at the cost of usability. By implementing zero-knowledge architecture and 
            client-side encryption, we ensure that your files remain yours - always.
          </p>
        </Card>

        {/* Technology Stack */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold mb-6 text-center">Built With</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <Card className="p-6">
              <Code className="h-10 w-10 text-primary mb-3" />
              <h3 className="font-semibold mb-2">Modern Stack</h3>
              <p className="text-sm text-muted-foreground">
                Next.js 14, TypeScript, Node.js, Express
              </p>
            </Card>

            <Card className="p-6">
              <Database className="h-10 w-10 text-primary mb-3" />
              <h3 className="font-semibold mb-2">Robust Data</h3>
              <p className="text-sm text-muted-foreground">
                PostgreSQL with Prisma ORM for type-safe queries
              </p>
            </Card>

            <Card className="p-6">
              <Cloud className="h-10 w-10 text-primary mb-3" />
              <h3 className="font-semibold mb-2">Cloud Storage</h3>
              <p className="text-sm text-muted-foreground">
                Cloudflare R2 for fast, reliable object storage
              </p>
            </Card>
          </div>
        </div>

        {/* Security Principles */}
        <Card className="p-8 mb-8">
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
            <Shield className="h-6 w-6" />
            Security Principles
          </h2>
          <ul className="space-y-4">
            <li className="flex gap-3">
              <Lock className="h-5 w-5 text-primary mt-1 flex-shrink-0" />
              <div>
                <strong>Client-Side Encryption:</strong> Files are encrypted in your browser 
                using military-grade encryption before upload. The server never sees plaintext.
              </div>
            </li>
            <li className="flex gap-3">
              <Lock className="h-5 w-5 text-primary mt-1 flex-shrink-0" />
              <div>
                <strong>Zero-Knowledge:</strong> Encryption keys stay in URL fragments and 
                never reach our servers. We literally cannot decrypt your files.
              </div>
            </li>
            <li className="flex gap-3">
              <Lock className="h-5 w-5 text-primary mt-1 flex-shrink-0" />
              <div>
                <strong>Anonymous by Design:</strong> No accounts, no tracking cookies, 
                no personal data collection. IP addresses are hashed for privacy.
              </div>
            </li>
            <li className="flex gap-3">
              <Lock className="h-5 w-5 text-primary mt-1 flex-shrink-0" />
              <div>
                <strong>Auto-Deletion:</strong> Files expire after your chosen time (max 5 days) 
                and are permanently deleted from storage.
              </div>
            </li>
          </ul>
        </Card>

        {/* Open Source */}
        <Card className="p-8 bg-primary/5 border-primary/20">
          <div className="flex items-start gap-4">
            <GitBranch className="h-8 w-8 text-primary flex-shrink-0" />
            <div>
              <h3 className="font-semibold text-lg mb-2">Open Source & Auditable</h3>
              <p className="text-muted-foreground mb-4">
                This project is built as a portfolio piece demonstrating production-ready 
                security architecture. The code is designed to be clean, well-documented, 
                and suitable for technical interviews.
              </p>
              <p className="text-sm text-muted-foreground">
                Review the architecture, security implementation, and codebase on GitHub.
              </p>
            </div>
          </div>
        </Card>
      </div>

      <Footer />
    </main>
  );
}
