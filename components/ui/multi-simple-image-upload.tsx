'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ImagePlus, Trash } from 'lucide-react';
import Image from 'next/image';

interface MultiSimpleImageUploadProps {
  disabled?: boolean;
  onChange: (value: string[]) => void;
  onRemove: (url: string) => void;
  value: string[];
}

const MultiSimpleImageUpload: React.FC<MultiSimpleImageUploadProps> = ({
  disabled,
  onChange,
  onRemove,
  value,
}) => {
  const [isUploading, setIsUploading] = useState(false);

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    console.log("Selected files:", files);

    const uploadPromises = Array.from(files).map(async (file) => {
      try {
        // Upload to Cloudinary
        const formData = new FormData();
        formData.append('file', file);
        formData.append('upload_preset', 'preset1324');

        const response = await fetch(
          `https://api.cloudinary.com/v1_1/dh1s9ohow/image/upload`,
          {
            method: 'POST',
            body: formData,
          }
        );

        if (!response.ok) {
          throw new Error('Upload failed');
        }

        const data = await response.json();
        console.log("Cloudinary upload result:", data);
        
        if (data.secure_url) {
          return data.secure_url;
        } else {
          throw new Error('No secure URL returned');
        }
      } catch (error) {
        console.error("Error uploading to Cloudinary:", error);
        return null;
      }
    });

    try {
      const uploadedUrls = await Promise.all(uploadPromises);
      const validUrls = uploadedUrls.filter(url => url !== null) as string[];
      
      if (validUrls.length > 0) {
        onChange([...value, ...validUrls]);
      }
    } catch (error) {
      console.error("Error uploading files:", error);
    } finally {
      setIsUploading(false);
      // Reset the input
      event.target.value = '';
    }
  };

  return (
    <div>
      {/* Debug info */}
      {value.length > 0 && (
        <div className="mb-2 p-2 bg-gray-100 rounded text-xs">
          <strong>Debug:</strong> {value.length} images uploaded
        </div>
      )}
      
      <div className="mb-4 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {value.map((url) => (
          <div key={url} className="relative w-[200px] h-[200px] rounded-md overflow-hidden border-2 border-gray-300">
            <div className="z-10 absolute top-2 right-2">
              <Button
                type="button"
                onClick={() => onRemove(url)}
                variant="destructive"
                size="sm"
              >
                <Trash className="h-4 w-4" />
              </Button>
            </div>
            <Image fill className="object-cover" alt="Image" src={url} />
          </div>
        ))}
      </div>

      <div>
        <input
          type="file"
          accept="image/*"
          multiple
          onChange={handleFileChange}
          disabled={disabled || isUploading}
          className="hidden"
          id="multi-image-upload"
        />
        <Button
          type="button"
          onClick={() => document.getElementById('multi-image-upload')?.click()}
          disabled={disabled || isUploading}
          variant="secondary"
        >
          <ImagePlus className="h-4 w-4 mr-2" />
          {isUploading ? 'Uploading to Cloudinary...' : 'Upload Images'}
        </Button>
      </div>
    </div>
  );
};

export default MultiSimpleImageUpload;
