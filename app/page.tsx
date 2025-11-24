'use client';

import { FileUploader } from "@/components/FileUploader";
import { Header } from "@/components/Header";
import { Features } from "@/components/Features";
import { Footer } from "@/components/Footer";
import { Shield, Zap, Lock, Clock, Link2 } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen relative overflow-hidden bg-[#0a0f1e]">
      {/* Dark chain-link background */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute inset-0 chain-bg animate-chain opacity-40" />
        <div className="absolute inset-0 bg-gradient-to-br from-[#0a0f1e] via-[#1a2332] to-[#0a0f1e]" />
        
        {/* Spiral accent elements */}
        <div className="absolute top-20 right-20 w-96 h-96 spiral-gradient opacity-10 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-20 left-20 w-96 h-96 spiral-gradient opacity-10 rounded-full blur-3xl animate-spiral animation-delay-2000" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] spiral-gradient opacity-5 rounded-full blur-3xl animate-pulse-glow" />
        
        {/* Floating particles */}
        <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-cyan-400/40 rounded-full animate-float" />
        <div className="absolute top-1/3 right-1/3 w-3 h-3 bg-cyan-400/30 rounded-full animate-float animation-delay-1000" />
        <div className="absolute bottom-1/4 right-1/4 w-2 h-2 bg-cyan-400/40 rounded-full animate-float animation-delay-2000" />
        <div className="absolute bottom-1/3 left-1/3 w-3 h-3 bg-cyan-400/30 rounded-full animate-float animation-delay-3000" />
        
        {/* Neon accent lines with animation */}
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-cyan-500/20 to-transparent animate-pulse" />
        <div className="absolute bottom-0 right-0 w-full h-1 bg-gradient-to-r from-transparent via-cyan-500/20 to-transparent animate-pulse animation-delay-1000" />
        
        {/* Grid overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(0,180,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(0,180,255,0.03)_1px,transparent_1px)] bg-[size:100px_100px]" />
      </div>

      <Header />
      
      <main>
        <div className="container mx-auto px-4 py-12 md:py-20 max-w-7xl">
          {/* Hero Section */}
          <div className="text-center space-y-10 mb-20 animate-fade-in">
            {/* Chain link badge */}
            <div className="inline-flex items-center gap-3 px-6 py-3 rounded-2xl glass-dark neon-border animate-pulse-glow">
              <Link2 className="w-5 h-5 text-cyan-400 animate-pulse" />
              <Shield className="w-5 h-5 text-cyan-400 animate-pulse animation-delay-1000" />
              <span className="text-sm font-bold text-cyan-400 tracking-wider uppercase">Zero-Knowledge Security Chain</span>
            </div>
            
            <h1 className="text-6xl md:text-8xl font-black tracking-tight">
              <span className="block text-white neon-text mb-4">
                SECURE FILE
              </span>
              <span className="block bg-gradient-to-r from-cyan-400 via-blue-500 to-cyan-400 bg-clip-text text-transparent">
                TRANSFER
              </span>
            </h1>
            
            <p className="text-xl md:text-2xl text-slate-300 max-w-3xl mx-auto leading-relaxed font-light">
              Military-grade encryption. <span className="text-cyan-400 font-semibold">Anonymous</span>. <span className="text-cyan-400 font-semibold">Untraceable</span>. <span className="text-cyan-400 font-semibold">Unbreakable</span>.
              <span className="block mt-4 text-base text-slate-400 border-l-2 border-cyan-500 pl-4 ml-4">No registration • No tracking • Complete privacy</span>
            </p>

            {/* Stats with chain design */}
            <div className="flex flex-wrap justify-center gap-6 pt-12">
              {[
                { icon: Zap, label: "500MB", sublabel: "Max Transfer", color: "cyan" },
                { icon: Lock, label: "AES-256", sublabel: "Encryption", color: "blue" },
                { icon: Clock, label: "7 Days", sublabel: "Retention", color: "indigo" }
              ].map((stat, i) => (
                <div key={i} className={`group relative animate-fade-in ${i === 1 ? 'animation-delay-1000' : i === 2 ? 'animation-delay-2000' : ''}`}>
                  <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/20 to-blue-500/20 rounded-2xl blur-xl group-hover:blur-2xl transition-all animate-pulse-glow" />
                  <div className="relative flex items-center gap-4 px-6 py-4 glass-dark neon-border rounded-2xl transform hover:scale-105 hover:-translate-y-2 transition-all">
                    <div className="p-3 rounded-xl bg-gradient-to-br from-cyan-500/10 to-blue-500/10 border border-cyan-500/30">
                      <stat.icon className="w-6 h-6 text-cyan-400" />
                    </div>
                    <div className="text-left">
                      <div className="text-2xl font-black text-white">{stat.label}</div>
                      <div className="text-xs text-slate-400 font-medium uppercase tracking-wider">{stat.sublabel}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Upload Section */}
          <div className="animate-slide-up">
            <FileUploader />
          </div>

          {/* Features */}
          <div className="mt-20">
            <Features />
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
