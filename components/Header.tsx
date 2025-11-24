import Link from 'next/link';
import { Shield, Upload, Info } from 'lucide-react';

export function Header() {
  return (
    <header className="border-b border-cyan-500/20 backdrop-blur-2xl glass-dark sticky top-0 z-50 shadow-[0_0_30px_rgba(0,180,255,0.1)]">
      {/* Chain pattern background */}
      <div className="absolute inset-0 chain-bg opacity-10 pointer-events-none" />
      
      <div className="relative container mx-auto px-4 py-5 flex justify-between items-center">
        <Link href="/" className="group flex items-center gap-3 font-bold text-xl transform hover:scale-105 transition-all duration-300">
          <div className="relative">
            <div className="absolute inset-0 bg-cyan-500/30 rounded-lg blur-xl group-hover:blur-2xl transition-all" />
            <div className="relative p-2.5 glass-dark neon-border rounded-lg">
              <Shield className="h-6 w-6 text-cyan-400" />
            </div>
          </div>
          <span className="neon-text font-black uppercase tracking-wider text-white">
            FilePushedQR
          </span>
        </Link>

        <nav className="flex gap-2">
          <Link
            href="/"
            className="group flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-bold uppercase tracking-wide text-slate-300 hover:text-cyan-400 glass-dark hover:border-cyan-500/50 border border-transparent transition-all"
          >
            <Upload className="h-4 w-4" />
            <span>Upload</span>
          </Link>
          <Link
            href="/about"
            className="group flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-bold uppercase tracking-wide text-slate-300 hover:text-cyan-400 glass-dark hover:border-cyan-500/50 border border-transparent transition-all"
          >
            <Info className="h-4 w-4" />
            <span>About</span>
          </Link>
        </nav>
      </div>
    </header>
  );
}
