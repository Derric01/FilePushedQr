'use client';

import { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Copy, Download, ExternalLink, Shield, Clock, Eye, Trash2, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';

interface UploadResultProps {
  result: {
    shareUrl: string;
    manageUrl: string;
    ownerToken: string;
    expiresAt: string;
    shareId: string;
  };
  onReset: () => void;
}

export function UploadResult({ result, onReset }: UploadResultProps) {
  const [showOwnerToken, setShowOwnerToken] = useState(false);
  const { toast } = useToast();

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: 'Copied!',
      description: `${label} copied to clipboard`,
    });
  };

  const downloadQR = () => {
    const svg = document.getElementById('qr-code');
    if (!svg) return;

    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx?.drawImage(img, 0, 0);
      const pngFile = canvas.toDataURL('image/png');

      const downloadLink = document.createElement('a');
      downloadLink.download = `FilePushedQR-${result.shareId}.png`;
      downloadLink.href = pngFile;
      downloadLink.click();
    };

    img.src = `data:image/svg+xml;base64,${btoa(svgData)}`;
  };

  const expiryDate = new Date(result.expiresAt);
  const timeRemaining = Math.floor((expiryDate.getTime() - Date.now()) / (1000 * 60 * 60));

  return (
    <div className="space-y-6 animate-fade-in">
      <Card className="relative overflow-hidden glass-dark border-2 border-cyan-500/30 shadow-[0_0_50px_rgba(0,180,255,0.2)]">
        {/* Chain pattern background */}
        <div className="absolute inset-0 chain-bg opacity-10" />
        
        <div className="relative p-8 md:p-12">
          <div className="text-center space-y-8">
            {/* Success icon with neon glow */}
            <div className="relative inline-block">
              <div className="absolute inset-0 bg-cyan-500/30 rounded-full blur-3xl animate-pulse" />
              <div className="relative inline-flex items-center justify-center w-24 h-24 rounded-full glass-dark neon-border">
                <Shield className="w-12 h-12 text-cyan-400" />
              </div>
            </div>

            <div className="space-y-3">
              <h2 className="text-4xl md:text-5xl font-black uppercase tracking-tight neon-text">
                UPLOAD COMPLETE
              </h2>
              <p className="text-lg text-slate-300">
                Your file is <span className="font-bold text-cyan-400">encrypted</span> and ready to share
              </p>
            </div>

            {/* QR Code with dark design */}
            <div className="flex justify-center my-8">
              <div className="relative group">
                <div className="absolute -inset-4 bg-cyan-500/20 rounded-2xl blur-2xl group-hover:blur-3xl transition-all" />
                <div className="relative p-6 glass-dark neon-border rounded-2xl shadow-[0_0_40px_rgba(0,180,255,0.3)] transform hover:scale-105 transition-transform duration-300">
                  <div className="bg-white p-4 rounded-lg">
                    <QRCodeSVG
                      id="qr-code"
                      value={result.shareUrl}
                      size={256}
                      level="H"
                      includeMargin
                      className="rounded-lg"
                    />
                  </div>
                  <div className="mt-4 flex gap-2 justify-center">
                    <Button
                      size="sm"
                      onClick={downloadQR}
                      className="glass-dark border border-cyan-500/50 text-cyan-400 hover:border-cyan-400 font-bold uppercase text-xs"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Download
                    </Button>
                  </div>
                </div>
              </div>
            </div>

          {/* Share URL */}
          <div className="space-y-3">
            <Label className="text-sm font-bold text-white uppercase tracking-wide">Share Link</Label>
            <div className="flex gap-2">
              <Input
                value={result.shareUrl}
                readOnly
                className="glass-dark border-2 border-slate-600 text-cyan-300 font-mono text-sm"
              />
              <Button
                size="icon"
                onClick={() => copyToClipboard(result.shareUrl, 'Share link')}
                className="glass-dark border border-cyan-500/50 text-cyan-400 hover:border-cyan-400"
              >
                <Copy className="h-4 w-4" />
              </Button>
              <Button
                size="icon"
                onClick={() => window.open(result.shareUrl, '_blank')}
                className="glass-dark border border-cyan-500/50 text-cyan-400 hover:border-cyan-400"
              >
                <ExternalLink className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Info Cards */}
          <div className="grid grid-cols-2 gap-4 pt-4">
            <div className="p-4 glass-dark border border-cyan-500/30 rounded-lg">
              <div className="flex items-center gap-2 text-sm text-slate-400 mb-2">
                <Clock className="h-4 w-4 text-cyan-400" />
                <span className="uppercase tracking-wide font-bold text-xs">Expires In</span>
              </div>
              <div className="font-black text-xl text-white">
                {timeRemaining > 24 ? `${Math.floor(timeRemaining / 24)}d` : `${timeRemaining}h`}
              </div>
            </div>

            <div className="p-4 glass-dark border border-cyan-500/30 rounded-lg">
              <div className="flex items-center gap-2 text-sm text-slate-400 mb-2">
                <Eye className="h-4 w-4 text-cyan-400" />
                <span className="uppercase tracking-wide font-bold text-xs">View Limit</span>
              </div>
              <div className="font-black text-xl text-white">∞</div>
            </div>
          </div>

          {/* Owner Token (Collapsible) */}
          <div className="border-t border-slate-700/50 pt-6 space-y-3">
            <Button
              size="sm"
              onClick={() => setShowOwnerToken(!showOwnerToken)}
              className="glass-dark text-slate-400 hover:text-cyan-400 border border-slate-700 hover:border-cyan-500/50"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              {showOwnerToken ? 'Hide' : 'Show'} Management Token
            </Button>

            {showOwnerToken && (
              <div className="space-y-3 p-4 glass-dark border border-slate-700 rounded-lg">
                <p className="text-sm text-slate-400 leading-relaxed">
                  Save this token to delete your file early. <span className="text-cyan-400 font-bold">One-time view only!</span>
                </p>
                <div className="flex gap-2">
                  <Input
                    value={result.manageUrl}
                    readOnly
                    className="glass-dark border-2 border-slate-600 text-cyan-300 font-mono text-xs"
                  />
                  <Button
                    size="icon"
                    onClick={() => copyToClipboard(result.manageUrl, 'Management link')}
                    className="glass-dark border border-cyan-500/50 text-cyan-400 hover:border-cyan-400"
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3 pt-6">
            <Button 
              className="flex-1 glass-dark neon-border text-cyan-300 hover:text-cyan-200 font-bold uppercase tracking-wide" 
              onClick={onReset}
            >
              <Upload className="mr-2 h-5 w-5" />
              Upload Another
            </Button>
          </div>
          </div>
        </div>
      </Card>

      {/* Security Notice */}
      <Card className="relative overflow-hidden glass-dark border-2 border-cyan-500/30">
        <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent" />
        <div className="relative p-6">
          <div className="flex items-start gap-4">
            <div className="p-3 glass-dark rounded-lg border border-cyan-500/30">
              <Shield className="h-6 w-6 text-cyan-400" />
            </div>
            <div className="flex-1 text-left">
              <h3 className="font-bold text-white mb-2 uppercase tracking-wide">End-to-End Encrypted</h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                Your file was encrypted <strong className="text-cyan-400">in your browser</strong> before upload. The server never sees your unencrypted data. Only someone with the link can decrypt and view your file.
              </p>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
