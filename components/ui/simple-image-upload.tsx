'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ImagePlus, Trash } from 'lucide-react';
import Image from 'next/image';

interface SimpleImageUploadProps {
  disabled?: boolean;
  onChange: (value: string) => void;
  onRemove: () => void;
  value: string;
}

const SimpleImageUpload: React.FC<SimpleImageUploadProps> = ({
  disabled,
  onChange,
  onRemove,
  value,
}) => {
  const [isUploading, setIsUploading] = useState(false);

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    console.log("Selected file:", file);

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
        onChange(data.secure_url);
      } else {
        throw new Error('No secure URL returned');
      }
    } catch (error) {
      console.error("Error uploading to Cloudinary:", error);
      // Fallback to base64 for testing
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        console.log("Fallback to base64:", result);
        onChange(result);
      };
      reader.readAsDataURL(file);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div>
      {/* Debug info */}
      {value && (
        <div className="mb-2 p-2 bg-gray-100 rounded text-xs">
          <strong>Debug:</strong> Image URL: {value.substring(0, 50)}...
        </div>
      )}
      
      <div className="mb-4 flex items-center gap-4">
        {value && (
          <div className="relative w-[200px] h-[200px] rounded-md overflow-hidden border-2 border-gray-300">
            <div className="z-10 absolute top-2 right-2">
              <Button
                type="button"
                onClick={onRemove}
                variant="destructive"
                size="sm"
              >
                <Trash className="h-4 w-4" />
              </Button>
            </div>
            <Image fill className="object-cover" alt="Image" src={value} />
          </div>
        )}
      </div>

      <div>
        <input
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          disabled={disabled || isUploading}
          className="hidden"
          id="image-upload"
        />
        <Button
          type="button"
          onClick={() => document.getElementById('image-upload')?.click()}
          disabled={disabled || isUploading}
          variant="secondary"
        >
          <ImagePlus className="h-4 w-4 mr-2" />
          {isUploading ? 'Uploading to Cloudinary...' : 'Upload an Image'}
        </Button>
      </div>
    </div>
  );
};

export default SimpleImageUpload;
