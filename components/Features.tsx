'use client';

import { Shield, Lock, Clock, Eye, Zap, Globe, Download, Users } from 'lucide-react';
import { Card } from '@/components/ui/card';

export function Features() {
  const features = [
    {
      icon: Shield,
      title: 'Military-Grade Encryption',
      description: 'AES-256-GCM encryption happens in your browser before upload. Your keys never touch our servers.',
    },
    {
      icon: Lock,
      title: 'Zero-Knowledge Architecture',
      description: 'We can\'t decrypt your files even if we wanted to. Only people with the share link can access them.',
    },
    {
      icon: Clock,
      title: 'Auto-Destruct Timer',
      description: 'Set expiration from 1 hour to 7 days. Files are permanently deleted and unrecoverable after expiry.',
    },
    {
      icon: Eye,
      title: 'Complete Anonymity',
      description: 'No accounts, no email, no tracking cookies. Share files without revealing your identity.',
    },
    {
      icon: Zap,
      title: 'Lightning Fast',
      description: 'Optimized streaming uploads and downloads. Handle files up to 500MB with ease.',
    },
    {
      icon: Download,
      title: 'QR Code Sharing',
      description: 'Instantly generate QR codes for quick mobile sharing. No typing, just scan and go.',
    },
    {
      icon: Globe,
      title: 'Universal Access',
      description: 'Works on any device, any browser. Desktop, mobile, tablet - seamless experience everywhere.',
    },
    {
      icon: Users,
      title: 'Password Protection',
      description: 'Add an extra layer of security with optional password protection for sensitive files.',
    },
  ];

  return (
    <div className="space-y-16">
      <div className="text-center space-y-4">
        <h2 className="text-5xl md:text-6xl font-black uppercase tracking-tight">
          <span className="neon-text">
            Why Choose Us?
          </span>
        </h2>
        <p className="text-xl text-slate-400 max-w-2xl mx-auto">
          Built with security, privacy, and user experience as our top priorities
        </p>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {features.map((feature, index) => (
          <Card
            key={feature.title}
            className="group relative overflow-hidden glass-dark border-2 border-slate-700/50 hover:border-cyan-500/50 hover:shadow-[0_0_30px_rgba(0,180,255,0.2)] transition-all duration-300 animate-fade-in"
            style={{ animationDelay: `${index * 50}ms` }}
          >
            {/* Chain link connector line */}
            {index < features.length - 1 && index % 4 !== 3 && (
              <div className="hidden lg:block absolute top-1/2 -right-3 w-6 h-px bg-gradient-to-r from-cyan-500/50 to-transparent z-10" />
            )}
            
            <div className="relative p-6 space-y-4">
              {/* Neon glow on hover */}
              <div className="absolute inset-0 bg-cyan-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              
              {/* Icon */}
              <div className="relative">
                <div className="absolute inset-0 bg-cyan-500/20 rounded-xl blur-xl opacity-0 group-hover:opacity-60 transition-opacity" />
                <div className="relative inline-flex items-center justify-center w-14 h-14 rounded-xl glass-dark border border-cyan-500/30 group-hover:border-cyan-400/50 transform group-hover:scale-110 transition-all duration-300">
                  <feature.icon className="w-7 h-7 text-cyan-400" />
                </div>
              </div>

              {/* Content */}
              <div className="relative space-y-2">
                <h3 className="font-black text-base uppercase tracking-wide text-white">
                  {feature.title}
                </h3>
                <p className="text-sm text-slate-400 leading-relaxed">
                  {feature.description}
                </p>
              </div>

              {/* Corner accent */}
              <div className="absolute top-0 right-0 w-16 h-16 border-t border-r border-cyan-500/20 rounded-tr-2xl" />
            </div>
          </Card>
        ))}
      </div>

      {/* Bottom CTA Section */}
      <div className="relative overflow-hidden rounded-3xl glass-dark border-2 border-cyan-500/30">
        {/* Chain background */}
        <div className="absolute inset-0 chain-bg opacity-10" />
        
        {/* Neon border glow */}
        <div className="absolute inset-0 neon-border opacity-50" />
        
        <div className="relative p-12 text-center space-y-6">
          <h3 className="text-4xl md:text-5xl font-black text-white uppercase tracking-tight">
            Ready to Share Securely?
          </h3>
          <p className="text-xl text-slate-300 max-w-2xl mx-auto">
            Join thousands of users who trust FilePushedQR for secure, anonymous file sharing
          </p>
          <div className="flex flex-wrap justify-center gap-4 pt-4">
            <div className="px-6 py-3 glass-dark border border-cyan-500/30 rounded-xl text-cyan-400 font-bold uppercase tracking-wide">
              100% Free
            </div>
            <div className="px-6 py-3 glass-dark border border-cyan-500/30 rounded-xl text-cyan-400 font-bold uppercase tracking-wide">
              No Registration
            </div>
            <div className="px-6 py-3 glass-dark border border-cyan-500/30 rounded-xl text-cyan-400 font-bold uppercase tracking-wide">
              Open Source
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
