'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Download, Lock, Loader2, AlertCircle, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { 
  importKey, 
  decryptFile, 
  extractIVAndData, 
  base64ToArrayBuffer 
} from '@/lib/crypto';

export default function ViewPage() {
  const params = useParams();
  const shareId = params?.shareId as string;
  const { toast } = useToast();

  const [loading, setLoading] = useState(true);
  const [fileInfo, setFileInfo] = useState<any>(null);
  const [password, setPassword] = useState('');
  const [decrypting, setDecrypting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Get encryption key from URL fragment
  const getKeyFromFragment = (): string | null => {
    if (typeof window === 'undefined') return null;
    const fragment = window.location.hash;
    const match = fragment.match(/#key=([^&]+)/);
    return match ? match[1] : null;
  };

  // Fetch file metadata
  useEffect(() => {
    const fetchFileInfo = async () => {
      try {
        const response = await fetch(`/api/view/${shareId}/info`);
        
        if (!response.ok) {
          if (response.status === 404) {
            setError('File not found or has been deleted');
          } else if (response.status === 410) {
            setError('File has expired');
          } else {
            setError('Failed to load file information');
          }
          return;
        }

        const data = await response.json();
        setFileInfo(data);
      } catch (err) {
        setError('Network error. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    if (shareId) {
      fetchFileInfo();
    }
  }, [shareId]);

  const handleDownload = async () => {
    const encryptionKey = getKeyFromFragment();
    
    if (!encryptionKey) {
      toast({
        title: 'Missing encryption key',
        description: 'The URL is incomplete. Encryption key not found.',
        variant: 'destructive',
      });
      return;
    }

    if (fileInfo?.passwordProtected && !password) {
      toast({
        title: 'Password required',
        description: 'Please enter the password to access this file',
        variant: 'destructive',
      });
      return;
    }

    setDecrypting(true);

    try {
      // Fetch encrypted file
      const response = await fetch(`/api/view/${shareId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: password || undefined }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to retrieve file');
      }

      const data = await response.json();

      toast({
        title: 'Decrypting file...',
        description: 'Processing encrypted data',
      });

      // Import encryption key
      const cryptoKey = await importKey(encryptionKey);

      // Decode encrypted data
      const encryptedBuffer = base64ToArrayBuffer(data.encryptedData);
      const combined = new Uint8Array(encryptedBuffer);

      // Extract IV and ciphertext
      const { iv, data: ciphertext } = extractIVAndData(combined);

      // Decrypt file
      const decryptedData = await decryptFile(ciphertext, iv, cryptoKey);

      // Create blob and trigger download
      const blob = new Blob([decryptedData], { type: data.fileType });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = data.fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast({
        title: 'Download successful!',
        description: 'File decrypted and downloaded',
      });
    } catch (err: any) {
      console.error('Decrypt error:', err);
      toast({
        title: 'Decryption failed',
        description: err.message || 'Invalid key or corrupted file',
        variant: 'destructive',
      });
    } finally {
      setDecrypting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen relative overflow-hidden bg-[#0a0f1e]">
        <div className="fixed inset-0 -z-10">
          <div className="absolute inset-0 chain-bg opacity-20" />
          <div className="absolute inset-0 bg-gradient-to-br from-[#0a0f1e] via-[#1a2332] to-[#0a0f1e]" />
          <div className="absolute top-20 right-20 w-96 h-96 spiral-gradient opacity-10 rounded-full blur-3xl animate-spiral" />
        </div>
        <Header />
        <div className="container mx-auto px-4 py-12 flex flex-col justify-center items-center min-h-[70vh]">
          <div className="relative">
            <div className="absolute inset-0 bg-cyan-500/30 rounded-full blur-3xl animate-pulse" />
            <div className="relative p-6 glass-dark rounded-full neon-border">
              <Loader2 className="h-16 w-16 animate-spin text-cyan-400" />
            </div>
          </div>
          <p className="mt-8 text-xl font-bold text-slate-300 uppercase tracking-wide animate-pulse">Loading File...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen relative overflow-hidden bg-[#0a0f1e]">
        <div className="fixed inset-0 -z-10">
          <div className="absolute inset-0 chain-bg opacity-20" />
          <div className="absolute inset-0 bg-gradient-to-br from-[#0a0f1e] via-[#1a2332] to-[#0a0f1e]" />
        </div>
        <Header />
        <div className="container mx-auto px-4 py-12 max-w-2xl">
          <Card className="relative overflow-hidden glass-dark border-2 border-red-500/30 shadow-[0_0_40px_rgba(239,68,68,0.2)] p-12 text-center animate-fade-in">
            <div className="absolute inset-0 chain-bg opacity-5" />
            <div className="relative">
              <div className="relative inline-block mb-6">
                <div className="absolute inset-0 bg-red-500/30 rounded-full blur-3xl" />
                <div className="relative inline-flex items-center justify-center w-24 h-24 rounded-full glass-dark border-2 border-red-500/50">
                  <AlertCircle className="w-12 h-12 text-red-400" />
                </div>
              </div>
              <h1 className="text-4xl font-black mb-4 text-white uppercase tracking-tight">File Not Found</h1>
              <p className="text-lg text-slate-400 mb-8">{error}</p>
              <Button 
                size="lg"
                onClick={() => (window.location.href = '/')}
                className="glass-dark neon-border text-cyan-300 hover:text-cyan-200 font-bold uppercase tracking-wide"
              >
                Go to Homepage
              </Button>
            </div>
          </Card>
        </div>
        <Footer />
      </div>
    );
  }

  const expiresIn = fileInfo
    ? Math.floor((new Date(fileInfo.expiresAt).getTime() - Date.now()) / (1000 * 60 * 60))
    : 0;

  return (
    <div className="min-h-screen relative overflow-hidden bg-[#0a0f1e]">
      {/* Dark chain background */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute inset-0 chain-bg opacity-20" />
        <div className="absolute inset-0 bg-gradient-to-br from-[#0a0f1e] via-[#1a2332] to-[#0a0f1e]" />
        <div className="absolute top-20 right-20 w-96 h-96 spiral-gradient opacity-10 rounded-full blur-3xl animate-spiral" />
        <div className="absolute bottom-20 left-20 w-96 h-96 spiral-gradient opacity-10 rounded-full blur-3xl" />
      </div>

      <Header />
      
      <main className="container mx-auto px-4 py-12 max-w-2xl">
        <Card className="relative overflow-hidden glass-dark border-2 border-cyan-500/30 shadow-[0_0_50px_rgba(0,180,255,0.2)] animate-fade-in">
          {/* Chain pattern overlay */}
          <div className="absolute inset-0 chain-bg opacity-10" />
          
          <div className="relative p-8 md:p-12">
            <div className="text-center space-y-8">
              {/* File Icon with neon glow */}
              <div className="relative inline-block">
                <div className="absolute inset-0 bg-cyan-500/30 rounded-full blur-3xl animate-pulse" />
                <div className="relative inline-flex items-center justify-center w-28 h-28 rounded-full glass-dark neon-border transform hover:scale-110 transition-transform">
                  {fileInfo?.fileType.startsWith('image/') ? (
                    <Eye className="w-14 h-14 text-cyan-400" />
                  ) : fileInfo?.fileType.startsWith('video/') ? (
                    <Download className="w-14 h-14 text-cyan-400" />
                  ) : (
                    <Download className="w-14 h-14 text-cyan-400" />
                  )}
                </div>
              </div>

              {/* File Info */}
              <div className="space-y-4">
                <h1 className="text-3xl md:text-4xl font-black text-white break-all">
                  {fileInfo?.fileName}
                </h1>
                <div className="flex items-center justify-center gap-3 flex-wrap">
                  <span className="px-5 py-2 glass-dark border border-cyan-500/30 text-cyan-400 rounded-xl text-sm font-bold uppercase tracking-wide">
                    {(parseInt(fileInfo?.fileSize || '0') / 1024 / 1024).toFixed(2)} MB
                  </span>
                  <span className="px-5 py-2 glass-dark border border-cyan-500/30 text-cyan-400 rounded-xl text-sm font-bold uppercase tracking-wide">
                    AES-256
                  </span>
                </div>
              </div>

              {/* Stats Cards */}
              <div className="grid grid-cols-2 gap-4 py-4">
                <div className="group relative overflow-hidden p-6 glass-dark border-2 border-cyan-500/30 rounded-2xl hover:border-cyan-500/50 hover:shadow-[0_0_30px_rgba(0,180,255,0.2)] transform hover:scale-105 transition-all">
                  <div className="absolute inset-0 bg-cyan-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="relative">
                    <div className="flex items-center gap-2 text-sm font-bold text-slate-400 mb-2 uppercase tracking-wide">
                      <Eye className="h-4 w-4 text-cyan-400" />
                      Views
                    </div>
                    <div className="text-4xl font-black text-white">{fileInfo?.viewCount || 0}</div>
                  </div>
                </div>
                <div className="group relative overflow-hidden p-6 glass-dark border-2 border-cyan-500/30 rounded-2xl hover:border-cyan-500/50 hover:shadow-[0_0_30px_rgba(0,180,255,0.2)] transform hover:scale-105 transition-all">
                  <div className="absolute inset-0 bg-cyan-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="relative">
                    <div className="flex items-center gap-2 text-sm font-bold text-slate-400 mb-2 uppercase tracking-wide">
                      <Lock className="h-4 w-4 text-cyan-400" />
                      Expires
                    </div>
                    <div className="text-4xl font-black text-white">
                      {expiresIn > 24 ? `${Math.floor(expiresIn / 24)}d` : `${expiresIn}h`}
                    </div>
                  </div>
                </div>
              </div>

              {/* Password Input */}
              {fileInfo?.passwordProtected && (
                <div className="space-y-3 text-left animate-slide-up">
                  <div className="p-5 glass-dark border-2 border-cyan-500/30 rounded-xl">
                    <Label htmlFor="password" className="flex items-center gap-2 text-cyan-400 font-bold uppercase tracking-wide mb-3">
                      <Lock className="h-5 w-5" />
                      Password Required
                    </Label>
                    <Input
                      id="password"
                      type="password"
                      placeholder="Enter password to unlock"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleDownload()}
                      className="glass-dark border-2 border-slate-600 focus:border-cyan-500 text-white placeholder:text-slate-500"
                    />
                  </div>
                </div>
              )}

              {/* Download Button */}
              <Button
                size="lg"
                className="w-full text-lg glass-dark neon-border border-2 border-cyan-500/50 hover:border-cyan-400 text-cyan-300 hover:text-cyan-200 font-black uppercase tracking-wider shadow-[0_0_30px_rgba(0,180,255,0.3)] hover:shadow-[0_0_50px_rgba(0,180,255,0.5)] transform hover:scale-[1.02] transition-all duration-300 py-7"
                onClick={handleDownload}
                disabled={decrypting || (fileInfo?.passwordProtected && !password)}
              >
                {decrypting ? (
                  <>
                    <Loader2 className="mr-3 h-7 w-7 animate-spin" />
                    Decrypting...
                  </>
                ) : (
                  <>
                    <Download className="mr-3 h-7 w-7" />
                    Decrypt & Download
                  </>
                )}
              </Button>

              {/* Security Notice */}
              <div className="pt-6 border-t border-slate-700/50">
                <div className="flex items-start gap-4 p-5 glass-dark border border-cyan-500/30 rounded-xl">
                  <div className="p-2.5 glass-dark border border-cyan-500/30 rounded-lg">
                    <Lock className="h-5 w-5 text-cyan-400" />
                  </div>
                  <div className="flex-1 text-left">
                    <h3 className="font-bold text-sm text-white mb-2 uppercase tracking-wide">Security Guaranteed</h3>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      File encrypted with AES-256-GCM. Decryption happens <strong className="text-cyan-400">locally in your browser</strong>. 
                      The server never has access to your unencrypted data.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </main>

      <Footer />
    </div>
  );
}
