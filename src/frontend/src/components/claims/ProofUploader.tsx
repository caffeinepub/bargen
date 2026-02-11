import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Upload, X, FileImage, FileVideo, AlertCircle } from 'lucide-react';
import { ExternalBlob } from '../../backend';
import { Progress } from '@/components/ui/progress';

interface ProofUploaderProps {
  files: ExternalBlob[];
  onChange: (files: ExternalBlob[]) => void;
}

const MAX_FILES = 5;
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'video/mp4', 'video/quicktime'];

export default function ProofUploader({ files, onChange }: ProofUploaderProps) {
  const [error, setError] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState<{ [key: number]: number }>({});
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    setError(null);
    const selectedFiles = Array.from(event.target.files || []);

    if (files.length + selectedFiles.length > MAX_FILES) {
      setError(`You can upload a maximum of ${MAX_FILES} files`);
      return;
    }

    for (const file of selectedFiles) {
      if (!ACCEPTED_TYPES.includes(file.type)) {
        setError(`File type not supported: ${file.name}. Please upload images (JPEG, PNG, GIF, WebP) or videos (MP4, MOV)`);
        return;
      }

      if (file.size > MAX_FILE_SIZE) {
        setError(`File too large: ${file.name}. Maximum size is 10MB`);
        return;
      }
    }

    const newBlobs: ExternalBlob[] = [];
    for (let i = 0; i < selectedFiles.length; i++) {
      const file = selectedFiles[i];
      const bytes = new Uint8Array(await file.arrayBuffer());
      const blob = ExternalBlob.fromBytes(bytes).withUploadProgress((percentage) => {
        setUploadProgress(prev => ({ ...prev, [files.length + i]: percentage }));
      });
      newBlobs.push(blob);
    }

    onChange([...files, ...newBlobs]);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleRemove = (index: number) => {
    const newFiles = files.filter((_, i) => i !== index);
    onChange(newFiles);
    setUploadProgress(prev => {
      const newProgress = { ...prev };
      delete newProgress[index];
      return newProgress;
    });
  };

  const getFileIcon = (index: number) => {
    // Since we can't easily determine type from ExternalBlob, use generic icons
    return index % 2 === 0 ? FileImage : FileVideo;
  };

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold mb-2">Upload Proof</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Provide photo or video evidence to support your claim. This helps us process your request faster and more accurately.
        </p>
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="text-xs">
            <strong>Privacy & Security:</strong> Your proof files are securely stored and only used to review your claim. 
            We accept images (JPEG, PNG, GIF, WebP) and videos (MP4, MOV) up to 10MB each.
          </AlertDescription>
        </Alert>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="space-y-3">
        {files.map((file, index) => {
          const Icon = getFileIcon(index);
          const progress = uploadProgress[index];
          return (
            <div key={index} className="flex items-center gap-3 p-3 bg-muted rounded-lg">
              <Icon className="h-5 w-5 text-muted-foreground flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium truncate">Proof File {index + 1}</div>
                {progress !== undefined && progress < 100 && (
                  <Progress value={progress} className="h-1 mt-1" />
                )}
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleRemove(index)}
                className="flex-shrink-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          );
        })}
      </div>

      {files.length < MAX_FILES && (
        <div>
          <input
            ref={fileInputRef}
            type="file"
            accept={ACCEPTED_TYPES.join(',')}
            multiple
            onChange={handleFileSelect}
            className="hidden"
          />
          <Button
            variant="outline"
            className="w-full"
            onClick={() => fileInputRef.current?.click()}
          >
            <Upload className="h-4 w-4 mr-2" />
            Upload Files ({files.length}/{MAX_FILES})
          </Button>
          <p className="text-xs text-muted-foreground mt-2 text-center">
            Accepted: Images (JPEG, PNG, GIF, WebP) and Videos (MP4, MOV) • Max 10MB per file
          </p>
        </div>
      )}
    </div>
  );
}
