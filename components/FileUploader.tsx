'use client';

import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, FileIcon, Loader2, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/components/ui/use-toast';
import { 
  generateEncryptionKey, 
  exportKey, 
  encryptFile, 
  combineIVAndData,
  arrayBufferToBase64 
} from '@/lib/crypto';
import { UploadResult } from './UploadResult';

const MAX_FILE_SIZE = 500 * 1024 * 1024; // 500MB
const MAX_EXPIRY_DAYS = 5;

export function FileUploader() {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [uploadResult, setUploadResult] = useState<any>(null);
  
  // Form state
  const [expiryHours, setExpiryHours] = useState(24);
  const [passwordProtected, setPasswordProtected] = useState(false);
  const [password, setPassword] = useState('');

  const { toast } = useToast();

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      const selectedFile = acceptedFiles[0];
      
      if (selectedFile.size > MAX_FILE_SIZE) {
        toast({
          title: 'File too large',
          description: 'Maximum file size is 500MB',
          variant: 'destructive',
        });
        return;
      }

      setFile(selectedFile);
      setUploadResult(null);
    }
  }, [toast]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    multiple: false,
    disabled: uploading,
  });

  const handleUpload = async () => {
    if (!file) return;

    if (passwordProtected && !password) {
      toast({
        title: 'Password required',
        description: 'Please enter a password or disable protection',
        variant: 'destructive',
      });
      return;
    }

    setUploading(true);
    setProgress(10);

    try {
      // Step 1: Generate encryption key
      const encryptionKey = await generateEncryptionKey();
      const keyString = await exportKey(encryptionKey);
      setProgress(20);

      // Step 2: Encrypt file client-side
      toast({
        title: 'Encrypting file...',
        description: 'Your file is being encrypted locally',
      });

      const { encryptedData, iv } = await encryptFile(file, encryptionKey);
      const combined = combineIVAndData(iv, encryptedData);
      const encryptedBase64 = arrayBufferToBase64(combined.buffer);
      setProgress(50);

      // Step 3: Upload to backend
      toast({
        title: 'Uploading...',
        description: 'Sending encrypted data to server',
      });

      const formData = new FormData();
      formData.append('file', new Blob([combined]), file.name);
      formData.append('fileName', file.name);
      formData.append('fileType', file.type || 'application/octet-stream');
      formData.append('fileSize', file.size.toString());
      formData.append('expiresIn', (expiryHours * 60).toString());
      
      if (passwordProtected && password) {
        formData.append('password', password);
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/upload`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      const result = await response.json();
      setProgress(100);

      // Step 4: Build share URL with encryption key
      const shareUrl = `${window.location.origin}/view/${result.shareId}#key=${keyString}`;

      setUploadResult({
        ...result,
        shareUrl,
        encryptionKey: keyString,
      });

      toast({
        title: 'Upload successful!',
        description: 'Your file is ready to share',
      });

      // Reset form
      setFile(null);
      setPassword('');
    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: 'Upload failed',
        description: 'Please try again',
        variant: 'destructive',
      });
    } finally {
      setUploading(false);
      setProgress(0);
    }
  };

  if (uploadResult) {
    return <UploadResult result={uploadResult} onReset={() => setUploadResult(null)} />;
  }

  return (
    <Card className="relative overflow-hidden glass-dark border-2 border-cyan-500/20 shadow-[0_0_50px_rgba(0,180,255,0.15)] animate-fade-in">
      {/* Chain link pattern overlay */}
      <div className="absolute inset-0 chain-bg opacity-20 pointer-events-none animate-chain" />
      
      {/* Neon accent borders with animation */}
      <div className="absolute top-0 left-0 w-32 h-32 border-t-2 border-l-2 border-cyan-500/30 rounded-tl-3xl animate-pulse-glow" />
      <div className="absolute bottom-0 right-0 w-32 h-32 border-b-2 border-r-2 border-cyan-500/30 rounded-br-3xl animate-pulse-glow animation-delay-1000" />
      
      <div className="relative p-8 md:p-10">
        {/* Dropzone */}
        <div
          {...getRootProps()}
          className={`group relative border-2 border-dashed rounded-3xl p-12 text-center cursor-pointer transition-all duration-300
            ${isDragActive ? 'border-cyan-400 bg-cyan-500/10 neon-border scale-[1.02]' : 'border-slate-600 hover:border-cyan-500/50'}
            ${uploading ? 'pointer-events-none opacity-50' : ''}
            ${file ? 'border-cyan-500/50 bg-gradient-to-br from-cyan-500/5 to-blue-500/5' : ''}`}
        >
          <input {...getInputProps()} />
          
          {file ? (
            <div className="space-y-6 animate-fade-in">
              <div className="relative inline-block">
                <div className="absolute inset-0 bg-cyan-500/20 rounded-full blur-2xl animate-pulse" />
                <div className="relative p-6 glass-dark rounded-full border-2 border-cyan-500/30">
                  <FileIcon className="mx-auto h-16 w-16 text-cyan-400" />
                </div>
              </div>
              <div>
                <p className="font-black text-2xl text-white mb-2">{file.name}</p>
                <div className="flex items-center justify-center gap-3 text-sm">
                  <span className="px-3 py-1 glass-dark rounded-lg text-cyan-400 font-mono">
                    {(file.size / 1024 / 1024).toFixed(2)} MB
                  </span>
                  <span className="px-3 py-1 glass-dark rounded-lg text-slate-400 font-mono">
                    {file.type || 'Unknown'}
                  </span>
                </div>
              </div>
              {!uploading && (
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={(e) => { e.stopPropagation(); setFile(null); }}
                  className="border-red-500/50 text-red-400 hover:bg-red-500/10 hover:border-red-500"
                >
                  Remove File
                </Button>
              )}
            </div>
          ) : (
            <div className="space-y-6">
              <div className="relative inline-block">
                <div className={`absolute inset-0 bg-cyan-500/20 rounded-full blur-3xl transition-opacity ${isDragActive ? 'opacity-60 animate-pulse' : 'opacity-30'}`} />
                <div className="relative p-6 glass-dark rounded-full border-2 border-cyan-500/30 group-hover:border-cyan-500/50 transition-colors">
                  <Upload className={`mx-auto h-16 w-16 text-slate-400 transition-all duration-300 ${isDragActive ? 'scale-110 text-cyan-400' : 'group-hover:scale-105 group-hover:text-cyan-400'}`} />
                </div>
              </div>
              <div>
                <p className="text-2xl font-black text-white mb-2">
                  {isDragActive ? 'DROP FILE HERE' : 'UPLOAD FILE'}
                </p>
                <p className="text-sm text-slate-400 max-w-md mx-auto leading-relaxed">
                  <span className="text-cyan-400 font-semibold">Drag & drop</span> or <span className="text-cyan-400 font-semibold">click</span> to select
                  <br />
                  <span className="text-xs opacity-75">All formats • Up to 500MB</span>
                </p>
              </div>
            </div>
          )}
        </div>

      {/* Upload Options */}
      {file && !uploading && (
        <div className="mt-8 space-y-6">
          {/* Expiry */}
          <div className="space-y-3">
            <Label className="text-sm font-bold text-white uppercase tracking-wide">Auto-Delete Timer</Label>
            <div className="flex gap-2 flex-wrap">
              {[1, 6, 12, 24, 72, 120].map((hours) => (
                <Button
                  key={hours}
                  variant={expiryHours === hours ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setExpiryHours(hours)}
                  className={expiryHours === hours ? 'glass-dark neon-border bg-cyan-500/20 text-cyan-300 font-mono' : 'glass-dark border-slate-600 text-slate-400 hover:border-cyan-500/50 hover:text-cyan-400 font-mono'}
                >
                  {hours < 24 ? `${hours}h` : `${hours / 24}d`}
                </Button>
              ))}
            </div>
          </div>

          {/* Password Protection */}
          <div className="relative overflow-hidden space-y-4 p-5 glass-dark rounded-xl border-2 border-slate-700/50">
            <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent" />
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 glass-dark rounded-lg border border-cyan-500/30">
                  <Lock className="h-4 w-4 text-cyan-400" />
                </div>
                <Label htmlFor="password-toggle" className="text-sm font-bold text-white uppercase tracking-wide">Password Lock</Label>
              </div>
              <Switch
                id="password-toggle"
                checked={passwordProtected}
                onCheckedChange={setPasswordProtected}
                className="data-[state=checked]:bg-cyan-500"
              />
            </div>
            
            {passwordProtected && (
              <Input
                type="password"
                placeholder="Enter secure password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="glass-dark border-2 border-slate-600 focus:border-cyan-500 text-white placeholder:text-slate-500"
              />
            )}
          </div>

          {/* Upload Button */}
          <Button
            className="relative w-full glass-dark neon-border border-2 border-cyan-500/50 hover:border-cyan-400 text-cyan-300 hover:text-cyan-200 font-black text-lg uppercase tracking-wider shadow-[0_0_30px_rgba(0,180,255,0.3)] hover:shadow-[0_0_50px_rgba(0,180,255,0.5)] transform hover:scale-[1.02] transition-all duration-300"
            size="lg"
            onClick={handleUpload}
            disabled={uploading || (passwordProtected && !password)}
          >
            {uploading ? (
              <>
                <Loader2 className="mr-3 h-6 w-6 animate-spin" />
                Encrypting & Uploading...
              </>
            ) : (
              <>
                <Lock className="mr-3 h-6 w-6" />
                ENCRYPT & UPLOAD
              </>
            )}
          </Button>
        </div>
      )}

      {/* Progress Bar */}
      {uploading && (
        <div className="mt-6 space-y-3">
          <div className="relative h-2 bg-slate-800/50 rounded-full overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-cyan-500/20 to-transparent animate-pulse" />
            <Progress value={progress} className="h-full [&>div]:bg-gradient-to-r [&>div]:from-cyan-500 [&>div]:to-blue-500" />
          </div>
          <p className="text-sm text-center text-slate-400 font-mono font-bold uppercase tracking-wider">
            {progress < 30 ? 'ENCRYPTING...' : progress < 70 ? 'UPLOADING...' : 'FINALIZING...'}
          </p>
        </div>
      )}
      </div>
    </Card>
  );
}
