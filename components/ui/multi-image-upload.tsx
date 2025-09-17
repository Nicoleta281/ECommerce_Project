'use client';

import { CldUploadWidget } from 'next-cloudinary';
import { useEffect, useState } from 'react';

import { Button } from '@/components/ui/button';
import Image from 'next/image';
import { ImagePlus, Trash } from 'lucide-react';

interface MultiImageUploadProps {
  disabled?: boolean;
  onChange: (value: string[]) => void;
  onRemove: (url: string) => void;
  value: string[];
}

const MultiImageUpload: React.FC<MultiImageUploadProps> = ({
  disabled,
  onChange,
  onRemove,
  value,
}) => {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Debug: Log the current value
  useEffect(() => {
    console.log("MultiImageUpload - Current value:", value);
  }, [value]);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const onUpload = (result: any) => {
    console.log("Cloudinary upload result:", result);
    
    // Handle different possible result structures
    let secureUrl = null;
    
    if (result?.info?.secure_url) {
      secureUrl = result.info.secure_url;
    } else if (typeof result?.info === 'string') {
      secureUrl = result.info;
    } else if (result?.secure_url) {
      secureUrl = result.secure_url;
    } else if (typeof result === 'string') {
      secureUrl = result;
    }
    
    if (secureUrl) {
      console.log("Setting image URL:", secureUrl);
      onChange([...value, secureUrl]);
    } else {
      console.error("Invalid upload result - no secure URL found:", result);
    }
  };

  if (!isMounted) {
    return null;
  }

  return (
    <div>
      <div className="mb-4 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {value.map((url) => (
          <div key={url} className="relative w-[200px] h-[200px] rounded-md overflow-hidden">
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

      <CldUploadWidget 
        onUpload={onUpload} 
        uploadPreset="preset1324"
        onError={(error) => {
          console.error("Cloudinary upload error:", error);
        }}
        onOpen={() => {
          console.log("Cloudinary widget opened");
        }}
        onClose={() => {
          console.log("Cloudinary widget closed");
        }}
        options={{
          maxFiles: 10,
          sources: ['local'],
          multiple: true,
        }}
      >
        {({ open }) => (
          <Button
            type="button"
            onClick={() => {
              console.log("Opening Cloudinary widget...");
              open();
            }}
            disabled={disabled}
            variant="secondary"
          >
            <ImagePlus className="h-4 w-4 mr-2" />
            Upload Images
          </Button>
        )}
      </CldUploadWidget>
    </div>
  );
};

export default MultiImageUpload;
