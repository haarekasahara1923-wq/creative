'use client';

import { useState, useRef } from 'react';

interface CloudinaryUploaderProps {
  folder: string;
  onUpload: (result: { url: string; publicId: string }) => void;
  accept?: string;
  label?: string;
  currentUrl?: string;
  mediaType?: 'image' | 'video' | 'auto';
}

export default function CloudinaryUploader({
  folder,
  onUpload,
  accept = 'image/*',
  label = 'Upload Image',
  currentUrl,
  mediaType = 'image',
}: CloudinaryUploaderProps) {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState(currentUrl || '');
  const [error, setError] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const MAX_SIZE = 50 * 1024 * 1024; // 50 MB
    if (file.size > MAX_SIZE) {
      setError('File size must be less than 50 MB');
      return;
    }

    setUploading(true);
    setError('');

    try {
      // Get signed params from server
      const signRes = await fetch('/api/upload/sign', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ folder }),
      });
      const { timestamp, signature, apiKey, cloudName } = await signRes.json();

      // Upload directly to Cloudinary
      const formData = new FormData();
      formData.append('file', file);
      formData.append('timestamp', String(timestamp));
      formData.append('signature', signature);
      formData.append('api_key', apiKey);
      formData.append('folder', folder);

      const resourceType = mediaType === 'video' ? 'video' : mediaType === 'auto' ? 'auto' : 'image';
      const uploadRes = await fetch(
        `https://api.cloudinary.com/v1_1/${cloudName}/${resourceType}/upload`,
        { method: 'POST', body: formData }
      );

      const data = await uploadRes.json();
      if (data.error) throw new Error(data.error.message);

      setPreview(data.secure_url);
      onUpload({ url: data.secure_url, publicId: data.public_id });
    } catch (err: any) {
      setError(err.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">{label}</label>
      <div
        className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center cursor-pointer hover:border-amber-500 transition-colors"
        onClick={() => inputRef.current?.click()}
      >
        {preview ? (
          mediaType === 'video' ? (
            <video src={preview} className="max-h-40 mx-auto rounded" controls />
          ) : (
            <img src={preview} alt="Preview" className="max-h-40 mx-auto rounded object-cover" />
          )
        ) : (
          <div className="py-4">
            <svg className="mx-auto h-10 w-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <p className="mt-2 text-sm text-gray-500">{uploading ? 'Uploading...' : 'Click to upload'}</p>
          </div>
        )}
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          onChange={handleFileChange}
          className="hidden"
          disabled={uploading}
        />
      </div>
      {uploading && (
        <div className="flex items-center gap-2 text-amber-600 text-sm">
          <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          Uploading to Cloudinary...
        </div>
      )}
      {error && <p className="text-red-500 text-sm">{error}</p>}
    </div>
  );
}
