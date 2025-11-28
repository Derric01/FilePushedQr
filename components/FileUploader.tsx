'use client';

import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, FileIcon, Loader2, Lock } from 'lucide-react';
import JSZip from 'jszip';
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

export function FileUploader() {
  const [files, setFiles] = useState<File[]>([]);
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
      // Filter out files that are too large
      const validFiles = acceptedFiles.filter(file => {
        if (file.size > MAX_FILE_SIZE) {
          toast({
            title: `${file.name} too large`,
            description: 'Maximum file size is 500MB per file',
            variant: 'destructive',
          });
          return false;
        }
        return true;
      });

      if (validFiles.length > 0) {
        setFiles(prev => [...prev, ...validFiles]);
        setUploadResult(null);
      }
    }
  }, [toast]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    multiple: true,
    disabled: uploading,
  });

  // Additional handler for programmatic file selection (e.g., Playwright tests)
  const handleFileInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = event.target.files;
    if (selectedFiles && selectedFiles.length > 0) {
      onDrop(Array.from(selectedFiles));
    }
  };

  const handleUpload = async () => {
    // Get files to upload
    let filesToUpload = files;
    
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
      filesToUpload = [new File([blob], 'shared-text.txt', { type: 'text/plain' })];
    }
    
    if (filesToUpload.length === 0) return;

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
      let fileToUpload: File;
      let finalFileName: string;
      let finalFileType: string;
      
      // If multiple files, create a ZIP bundle
      if (filesToUpload.length > 1) {
        toast({
          title: `Bundling ${filesToUpload.length} files`,
          description: 'Creating ZIP archive...',
        });
        
        const zip = new JSZip();
        
        // Add each file to the ZIP
        for (const file of filesToUpload) {
          zip.file(file.name, file);
        }
        
        setProgress(20);
        
        // Generate the ZIP blob
        const zipBlob = await zip.generateAsync({ type: 'blob' });
        fileToUpload = new File([zipBlob], 'files.zip', { type: 'application/zip' });
        finalFileName = `${filesToUpload.length}_files.zip`;
        finalFileType = 'application/zip';
        
        toast({
          title: 'ZIP created',
          description: `Bundled ${filesToUpload.length} files into one archive`,
        });
      } else {
        // Single file - no ZIP needed
        fileToUpload = filesToUpload[0];
        finalFileName = fileToUpload.name;
        finalFileType = fileToUpload.type || 'application/octet-stream';
      }
      
      setProgress(30);
      
      toast({
        title: 'Encrypting',
        description: 'Securing your file(s)...',
      });

      // Step 1: Generate encryption key
      const encryptionKey = await generateEncryptionKey();
      const keyString = await exportKey(encryptionKey);

      // Step 2: Encrypt file client-side
      const { encryptedData, iv } = await encryptFile(fileToUpload, encryptionKey);
      const combined = combineIVAndData(iv, encryptedData);
      
      setProgress(60);

      // Step 3: Upload to backend
      const formData = new FormData();
      formData.append('file', new Blob([combined]), finalFileName);
      formData.append('fileName', finalFileName);
      formData.append('fileType', finalFileType);
      formData.append('fileSize', fileToUpload.size.toString());
      formData.append('expiresIn', (expiryHours * 60).toString());
      
      if (passwordProtected && password) {
        formData.append('password', password);
      }
      
      toast({
        title: 'Uploading',
        description: 'Sending to secure server...',
      });

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      const result = await response.json();
      
      setProgress(90);
      
      // Build share URL with encryption key
      const shareUrl = `${window.location.origin}/view/${result.shareId}#key=${encodeURIComponent(keyString)}`;
      
      setUploadResult({
        ...result,
        shareUrl,
        encryptionKey: keyString,
        fileName: finalFileName,
      });
      
      setProgress(100);

      toast({
        title: 'Upload successful!',
        description: filesToUpload.length > 1 
          ? `${filesToUpload.length} files bundled and encrypted` 
          : 'File uploaded and encrypted',
      });

      // Reset form
      setFiles([]);
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
            onClick={() => { setMode('file'); setTextContent(''); setFiles([]); }}
            className={`flex-1 min-h-[44px] ${ mode === 'file' ? 'glass-dark neon-border bg-cyan-500/20 text-cyan-300' : 'glass-dark border-slate-600 text-slate-400 hover:border-cyan-500/50 hover:text-cyan-400'}`}
          >
            <FileIcon className="mr-2 h-4 w-4" />
            Upload Files
          </Button>
          <Button
            variant={mode === 'text' ? 'default' : 'outline'}
            onClick={() => { setMode('text'); setFiles([]); }}
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
              ${files.length > 0 ? 'border-cyan-500/50 bg-gradient-to-br from-cyan-500/5 to-blue-500/5' : ''}`}
          >
            <input {...getInputProps()} onChange={handleFileInputChange} />
          
          {files.length > 0 ? (
            <div className="space-y-4 w-full max-h-[400px] overflow-y-auto">
              {files.map((file, idx) => (
                <div key={idx} className="flex items-center gap-3 p-3 glass-dark rounded-xl border border-slate-700 hover:border-cyan-500/50 transition-all">
                  <FileIcon className="h-8 w-8 text-cyan-400 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-white text-sm truncate">{file.name}</p>
                    <div className="flex gap-2 text-xs">
                      <span className="text-cyan-400 font-mono">{(file.size / 1024 / 1024).toFixed(2)} MB</span>
                      <span className="text-slate-400 truncate">{file.type || 'Unknown'}</span>
                    </div>
                  </div>
                  {!uploading && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={(e) => { e.stopPropagation(); setFiles(files.filter((_, i) => i !== idx)); }}
                      className="border-red-500/50 text-red-400 hover:bg-red-500/10 flex-shrink-0"
                    >
                      ✕
                    </Button>
                  )}
                </div>
              ))}
              <p className="text-sm text-cyan-400 font-mono text-center">
                {files.length} file{files.length !== 1 ? 's' : ''} selected
              </p>
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
      {((files.length > 0 && mode === 'file') || (textContent && mode === 'text')) && !uploading && (
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
