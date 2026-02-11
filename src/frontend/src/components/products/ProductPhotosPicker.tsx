import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { X, Upload, Image as ImageIcon } from 'lucide-react';
import { ExternalBlob } from '@/backend';
import { toast } from 'sonner';

interface ProductPhotosPickerProps {
  onPhotosChange: (blobs: ExternalBlob[]) => void;
  maxFiles?: number;
  maxSizeMB?: number;
  resetToken?: number;
}

export default function ProductPhotosPicker({
  onPhotosChange,
  maxFiles = 5,
  maxSizeMB = 5,
  resetToken = 0,
}: ProductPhotosPickerProps) {
  const [previews, setPreviews] = useState<{ url: string; blob: ExternalBlob }[]>([]);
  const [uploadProgress, setUploadProgress] = useState<{ [key: string]: number }>({});
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Reset previews when resetToken changes
  useEffect(() => {
    if (resetToken > 0) {
      previews.forEach((preview) => URL.revokeObjectURL(preview.url));
      setPreviews([]);
      setUploadProgress({});
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  }, [resetToken]);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    
    if (files.length === 0) return;

    // Validate file count
    if (previews.length + files.length > maxFiles) {
      toast.error(`Maximum ${maxFiles} photos allowed`);
      return;
    }

    // Validate file types and sizes
    const validFiles: File[] = [];
    for (const file of files) {
      if (!file.type.startsWith('image/')) {
        toast.error(`${file.name} is not an image file`);
        continue;
      }
      if (file.size > maxSizeMB * 1024 * 1024) {
        toast.error(`${file.name} exceeds ${maxSizeMB}MB limit`);
        continue;
      }
      validFiles.push(file);
    }

    if (validFiles.length === 0) return;

    // Process valid files
    const newPreviews: { url: string; blob: ExternalBlob }[] = [];
    
    for (const file of validFiles) {
      const arrayBuffer = await file.arrayBuffer();
      const uint8Array = new Uint8Array(arrayBuffer);
      
      // Create ExternalBlob with upload progress tracking
      const blob = ExternalBlob.fromBytes(uint8Array).withUploadProgress((percentage) => {
        setUploadProgress((prev) => ({ ...prev, [file.name]: percentage }));
      });
      
      // Create local preview URL
      const previewUrl = URL.createObjectURL(file);
      
      newPreviews.push({ url: previewUrl, blob });
    }

    const updatedPreviews = [...previews, ...newPreviews];
    setPreviews(updatedPreviews);
    onPhotosChange(updatedPreviews.map((p) => p.blob));

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleRemove = (index: number) => {
    const preview = previews[index];
    URL.revokeObjectURL(preview.url);
    
    const updatedPreviews = previews.filter((_, i) => i !== index);
    setPreviews(updatedPreviews);
    onPhotosChange(updatedPreviews.map((p) => p.blob));
  };

  return (
    <div className="space-y-4">
      <div>
        <Label>Product Photos (Optional)</Label>
        <p className="text-sm text-muted-foreground mt-1">
          Add up to {maxFiles} photos. Max {maxSizeMB}MB per photo.
        </p>
      </div>

      {/* Preview Grid */}
      {previews.length > 0 && (
        <div className="grid grid-cols-3 gap-3">
          {previews.map((preview, index) => (
            <div key={index} className="relative aspect-square rounded-lg overflow-hidden border bg-muted">
              <img
                src={preview.url}
                alt={`Preview ${index + 1}`}
                className="w-full h-full object-cover"
              />
              <button
                type="button"
                onClick={() => handleRemove(index)}
                className="absolute top-1 right-1 p-1 bg-destructive text-destructive-foreground rounded-full hover:bg-destructive/90 transition-colors"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Upload Button */}
      {previews.length < maxFiles && (
        <div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            onChange={handleFileSelect}
            className="hidden"
            id="photo-upload"
          />
          <Button
            type="button"
            variant="outline"
            className="w-full"
            onClick={() => fileInputRef.current?.click()}
          >
            {previews.length === 0 ? (
              <>
                <Upload className="h-4 w-4 mr-2" />
                Upload Photos
              </>
            ) : (
              <>
                <ImageIcon className="h-4 w-4 mr-2" />
                Add More Photos ({previews.length}/{maxFiles})
              </>
            )}
          </Button>
        </div>
      )}
    </div>
  );
}
