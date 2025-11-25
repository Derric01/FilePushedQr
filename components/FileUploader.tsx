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
  combineIVAndData
} from '@/lib/crypto';
import { UploadResult } from './UploadResult';

const MAX_FILE_SIZE = 500 * 1024 * 1024; // 500MB
const MAX_EXPIRY_DAYS = 5;

export function FileUploader() {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [uploadResult, setUploadResult] = useState<any>(null);
  
  // Mode: 'file' or 'text'
  const [mode, setMode] = useState<'file' | 'text'>('file');
  const [textContent, setTextContent] = useState('');
  
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
    // Convert text to file if in text mode
    let fileToUpload = file;
    
    if (mode === 'text') {
      if (!textContent.trim()) {
        toast({
          title: 'No text entered',
          description: 'Please enter some text to share',
          variant: 'destructive',
        });
        return;
      }
      
      const blob = new Blob([textContent], { type: 'text/plain' });
      fileToUpload = new File([blob], 'shared-text.txt', { type: 'text/plain' });
    }
    
    if (!fileToUpload) return;

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

      const { encryptedData, iv } = await encryptFile(fileToUpload, encryptionKey);
      const combined = combineIVAndData(iv, encryptedData);
      setProgress(50);

      // Step 3: Upload to backend
      toast({
        title: 'Uploading...',
        description: 'Sending encrypted data to server',
      });

      const formData = new FormData();
      formData.append('file', new Blob([combined]), fileToUpload.name);
      formData.append('fileName', fileToUpload.name);
      formData.append('fileType', fileToUpload.type || 'application/octet-stream');
      formData.append('fileSize', fileToUpload.size.toString());
      formData.append('expiresIn', (expiryHours * 60).toString());
      
      if (passwordProtected && password) {
        formData.append('password', password);
      }

      const response = await fetch('/api/upload', {
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
      setTextContent('');
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
      <div className="absolute top-0 left-0 w-16 sm:w-32 h-16 sm:h-32 border-t-2 border-l-2 border-cyan-500/30 rounded-tl-2xl sm:rounded-tl-3xl animate-pulse-glow" />
      <div className="absolute bottom-0 right-0 w-16 sm:w-32 h-16 sm:h-32 border-b-2 border-r-2 border-cyan-500/30 rounded-br-2xl sm:rounded-br-3xl animate-pulse-glow animation-delay-1000" />
      
      <div className="relative p-4 sm:p-8 md:p-10">
        {/* Mode Tabs */}
        <div className="flex gap-2 mb-6">
          <Button
            variant={mode === 'file' ? 'default' : 'outline'}
            onClick={() => { setMode('file'); setTextContent(''); setFile(null); }}
            className={`flex-1 min-h-[44px] ${ mode === 'file' ? 'glass-dark neon-border bg-cyan-500/20 text-cyan-300' : 'glass-dark border-slate-600 text-slate-400 hover:border-cyan-500/50 hover:text-cyan-400'}`}
          >
            <FileIcon className="mr-2 h-4 w-4" />
            Upload File
          </Button>
          <Button
            variant={mode === 'text' ? 'default' : 'outline'}
            onClick={() => { setMode('text'); setFile(null); }}
            className={`flex-1 min-h-[44px] ${mode === 'text' ? 'glass-dark neon-border bg-cyan-500/20 text-cyan-300' : 'glass-dark border-slate-600 text-slate-400 hover:border-cyan-500/50 hover:text-cyan-400'}`}
          >
            <Upload className="mr-2 h-4 w-4" />
            Share Text
          </Button>
        </div>

        {/* File Upload Mode */}
        {mode === 'file' && (
          <div
            {...getRootProps()}
            className={`group relative border-2 border-dashed rounded-2xl sm:rounded-3xl p-6 sm:p-12 text-center cursor-pointer transition-all duration-300 min-h-[200px] sm:min-h-[250px] flex items-center justify-center
              ${isDragActive ? 'border-cyan-400 bg-cyan-500/10 neon-border scale-[1.02]' : 'border-slate-600 hover:border-cyan-500/50'}
              ${uploading ? 'pointer-events-none opacity-50' : ''}
              ${file ? 'border-cyan-500/50 bg-gradient-to-br from-cyan-500/5 to-blue-500/5' : ''}`}
          >
            <input {...getInputProps()} />
          
          {file ? (
            <div className="space-y-4 sm:space-y-6 animate-fade-in w-full">
              <div className="relative inline-block">
                <div className="absolute inset-0 bg-cyan-500/20 rounded-full blur-2xl animate-pulse" />
                <div className="relative p-4 sm:p-6 glass-dark rounded-full border-2 border-cyan-500/30">
                  <FileIcon className="mx-auto h-12 w-12 sm:h-16 sm:w-16 text-cyan-400" />
                </div>
              </div>
              <div className="px-2">
                <p className="font-black text-lg sm:text-2xl text-white mb-2 break-all">{file.name}</p>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-3 text-xs sm:text-sm">
                  <span className="px-2 sm:px-3 py-1 glass-dark rounded-lg text-cyan-400 font-mono">
                    {(file.size / 1024 / 1024).toFixed(2)} MB
                  </span>
                  <span className="px-2 sm:px-3 py-1 glass-dark rounded-lg text-slate-400 font-mono truncate max-w-[200px]">
                    {file.type || 'Unknown'}
                  </span>
                </div>
              </div>
              {!uploading && (
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={(e) => { e.stopPropagation(); setFile(null); }}
                  className="border-red-500/50 text-red-400 hover:bg-red-500/10 hover:border-red-500 min-h-[44px]"
                >
                  Remove File
                </Button>
              )}
            </div>
          ) : (
            <div className="space-y-4 sm:space-y-6 w-full">
              <div className="relative inline-block">
                <div className={`absolute inset-0 bg-cyan-500/20 rounded-full blur-3xl transition-opacity ${isDragActive ? 'opacity-60 animate-pulse' : 'opacity-30'}`} />
                <div className="relative p-4 sm:p-6 glass-dark rounded-full border-2 border-cyan-500/30 group-hover:border-cyan-500/50 transition-colors">
                  <Upload className={`mx-auto h-12 w-12 sm:h-16 sm:w-16 text-slate-400 transition-all duration-300 ${isDragActive ? 'scale-110 text-cyan-400' : 'group-hover:scale-105 group-hover:text-cyan-400'}`} />
                </div>
              </div>
              <div className="px-4">
                <p className="text-xl sm:text-2xl font-black text-white mb-2">
                  {isDragActive ? 'DROP FILE HERE' : 'UPLOAD FILE'}
                </p>
                <p className="text-xs sm:text-sm text-slate-400 max-w-md mx-auto leading-relaxed">
                  <span className="text-cyan-400 font-semibold">Drag & drop</span> or <span className="text-cyan-400 font-semibold">click</span> to select
                  <br />
                  <span className="text-[10px] sm:text-xs opacity-75">All formats • Up to 500MB</span>
                </p>
              </div>
            </div>
          )}
          </div>
        )}

        {/* Text Mode */}
        {mode === 'text' && (
          <div className="space-y-4">
            <textarea
              placeholder="Paste or type your text here...&#10;&#10;• Share notes, code snippets, or messages&#10;• Military-grade encryption applied automatically&#10;• Set expiration time below"
              value={textContent}
              onChange={(e) => setTextContent(e.target.value)}
              disabled={uploading}
              className="w-full min-h-[250px] sm:min-h-[300px] p-4 sm:p-6 glass-dark border-2 border-slate-600 focus:border-cyan-500 rounded-xl sm:rounded-2xl text-white placeholder:text-slate-500 resize-y text-sm sm:text-base leading-relaxed font-mono transition-all outline-none"
              maxLength={10000000}
            />
            <p className="text-xs text-slate-400 text-right font-mono">
              {textContent.length.toLocaleString()} characters
            </p>
          </div>
        )}

      {/* Upload Options */}
      {((file && mode === 'file') || (textContent && mode === 'text')) && !uploading && (
        <div className="mt-6 sm:mt-8 space-y-5 sm:space-y-6">
          {/* Expiry */}
          <div className="space-y-3">
            <Label className="text-xs sm:text-sm font-bold text-white uppercase tracking-wide">Auto-Delete Timer</Label>
            <div className="grid grid-cols-3 sm:flex gap-2 flex-wrap">
              {[1, 6, 12, 24, 72, 120].map((hours) => (
                <Button
                  key={hours}
                  variant={expiryHours === hours ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setExpiryHours(hours)}
                  className={`min-h-[44px] text-sm sm:text-base ${expiryHours === hours ? 'glass-dark neon-border bg-cyan-500/20 text-cyan-300 font-mono' : 'glass-dark border-slate-600 text-slate-400 hover:border-cyan-500/50 hover:text-cyan-400 font-mono'}`}
                >
                  {hours < 24 ? `${hours}h` : `${hours / 24}d`}
                </Button>
              ))}
            </div>
          </div>

          {/* Password Protection */}
          <div className="relative overflow-hidden space-y-4 p-4 sm:p-5 glass-dark rounded-xl border-2 border-slate-700/50">
            <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent" />
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="p-1.5 sm:p-2 glass-dark rounded-lg border border-cyan-500/30">
                  <Lock className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-cyan-400" />
                </div>
                <Label htmlFor="password-toggle" className="text-xs sm:text-sm font-bold text-white uppercase tracking-wide">Password Lock</Label>
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
                className="glass-dark border-2 border-slate-600 focus:border-cyan-500 text-white placeholder:text-slate-500 min-h-[44px] text-base"
              />
            )}
          </div>

          {/* Upload Button */}
          <Button
            className="relative w-full glass-dark neon-border border-2 border-cyan-500/50 hover:border-cyan-400 text-cyan-300 hover:text-cyan-200 font-black text-base sm:text-lg uppercase tracking-wider shadow-[0_0_30px_rgba(0,180,255,0.3)] hover:shadow-[0_0_50px_rgba(0,180,255,0.5)] transform hover:scale-[1.02] transition-all duration-300 min-h-[52px] sm:min-h-[56px]"
            size="lg"
            onClick={handleUpload}
            disabled={uploading || (passwordProtected && !password)}
          >
            {uploading ? (
              <>
                <Loader2 className="mr-2 sm:mr-3 h-5 w-5 sm:h-6 sm:w-6 animate-spin" />
                <span className="hidden xs:inline">Encrypting & Uploading...</span>
                <span className="xs:hidden">Uploading...</span>
              </>
            ) : (
              <>
                <Lock className="mr-2 sm:mr-3 h-5 w-5 sm:h-6 sm:w-6" />
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
