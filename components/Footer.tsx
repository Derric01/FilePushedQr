import { Github, Heart, Shield, Lock, Zap } from 'lucide-react';

export function Footer() {
  return (
    <footer className="relative mt-20 border-t border-cyan-500/20 backdrop-blur-xl glass-dark overflow-hidden">
      {/* Chain pattern background */}
      <div className="absolute inset-0 chain-bg opacity-5" />
      
      <div className="relative container mx-auto px-4 py-12">
        {/* Divider line with glow */}
        <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent" />
        
        <div className="grid md:grid-cols-3 gap-8 mb-8">
          {/* Brand Section */}
          <div className="text-center md:text-left space-y-4">
            <h3 className="font-black text-2xl neon-text uppercase tracking-wider">
              FilePushedQR
            </h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              Secure, anonymous, encrypted file sharing. Built with privacy first.
            </p>
            <div className="flex gap-3 justify-center md:justify-start">
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="GitHub Repository"
                className="p-2.5 glass-dark rounded-lg border border-slate-700 hover:border-cyan-500/50 transition-colors group"
              >
                <Github className="h-5 w-5 text-slate-400 group-hover:text-cyan-400" />
              </a>
            </div>
          </div>

          {/* Features */}
          <div className="text-center space-y-4">
            <h4 className="font-bold text-white uppercase tracking-wide text-sm">Security Features</h4>
            <div className="space-y-3 text-sm">
              <div className="flex items-center justify-center gap-2 text-slate-300">
                <Shield className="h-4 w-4 text-cyan-400" />
                <span>Military-Grade Encryption</span>
              </div>
              <div className="flex items-center justify-center gap-2 text-slate-300">
                <Lock className="h-4 w-4 text-cyan-400" />
                <span>Zero-Knowledge Architecture</span>
              </div>
              <div className="flex items-center justify-center gap-2 text-slate-300">
                <Zap className="h-4 w-4 text-cyan-400" />
                <span>Client-Side Processing</span>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="text-center md:text-right space-y-4">
            <h4 className="font-bold text-white uppercase tracking-wide text-sm">Why Choose Us?</h4>
            <div className="flex flex-col gap-2 text-sm items-center md:items-end">
              <div className="inline-block px-4 py-1.5 glass-dark border border-cyan-500/30 text-cyan-400 rounded-lg font-bold uppercase tracking-wide text-xs">
                100% Free
              </div>
              <div className="inline-block px-4 py-1.5 glass-dark border border-cyan-500/30 text-cyan-400 rounded-lg font-bold uppercase tracking-wide text-xs">
                No Tracking
              </div>
              <div className="inline-block px-4 py-1.5 glass-dark border border-cyan-500/30 text-cyan-400 rounded-lg font-bold uppercase tracking-wide text-xs">
                Open Source
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-slate-700/50 text-center space-y-3">
          <div className="absolute left-1/2 -translate-x-1/2 w-32 h-px bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent" />
          <p className="text-sm text-slate-400 mt-8">
            &copy; {new Date().getFullYear()} FilePushedQR. Built with{' '}
            <Heart className="inline h-4 w-4 text-cyan-400 fill-cyan-400" /> for privacy.
          </p>
          <p className="text-xs text-slate-500 max-w-2xl mx-auto leading-relaxed">
            All files are encrypted <strong className="text-cyan-400">client-side</strong> with military-grade encryption before upload. 
            We employ zero-knowledge architecture - your encryption keys <strong className="text-cyan-400">never</strong> reach our servers.
            Your privacy is our priority.
          </p>
        </div>
      </div>
    </footer>
  );
}
