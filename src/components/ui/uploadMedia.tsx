import { Card, CardContent } from '@/components/ui/card';
import { Plus } from 'lucide-react';
import { useRef } from 'react';

interface UploadCardProps {
  accept?: string;
  onChange?: (file: File | null) => void;
}

export default function UploadMedia({
  // accept = '.flac,.m4a,.mp3,.mp4,.mpeg,.mpga,.oga,.ogg,.wav,.webm',
  accept = 'audio/ogg,application/ogg,audio/webm,video/webm,.oga,.ogg,.opus,.webm,.mp3,.m4a,.wav,.flac,.mp4,.mpeg,.mpga',
  onChange,
}: UploadCardProps) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    if (onChange) {
      onChange(file);
    }
  };

  return (
    <Card
      className='h-37 flex items-center justify-center cursor-pointer hover:shadow-lg transition'
      onClick={handleClick}
    >
      <CardContent className='flex items-center justify-center h-full'>
        <Plus className='w-12 h-12 text-gray-400' />
        <input
          type='file'
          accept={accept}
          ref={fileInputRef}
          className='hidden'
          onChange={handleFileChange}
        />
      </CardContent>
    </Card>
  );
}
