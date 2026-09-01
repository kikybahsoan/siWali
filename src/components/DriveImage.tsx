import React, { useState } from 'react';
import { getOptimizedImageUrl, getDriveThumbnailFallback, ImageSizePreset } from '../utils/imageHelper';
import { Image as ImageIcon, User, AlertCircle, ExternalLink } from 'lucide-react';

interface DriveImageProps {
  src?: string;
  alt?: string;
  preset?: ImageSizePreset;
  className?: string;
  fallbackType?: 'student' | 'activity' | 'general';
  gender?: 'L' | 'P';
  onClick?: () => void;
  showZoomIcon?: boolean;
}

export const DriveImage: React.FC<DriveImageProps> = ({
  src,
  alt = 'Gambar',
  preset = 'low' as ImageSizePreset,
  className = 'w-full h-full object-cover',
  fallbackType = 'general',
  gender,
  onClick,
  showZoomIcon = false,
}) => {
  const [hasError, setHasError] = useState<boolean>(false);
  const [useSecondaryFallback, setUseSecondaryFallback] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  if (!src || !src.trim() || hasError) {
    return (
      <div
        onClick={onClick}
        className={`flex flex-col items-center justify-center bg-slate-100 text-slate-400 border border-slate-200/80 select-none ${className} ${
          onClick ? 'cursor-pointer hover:bg-slate-200/70 transition-colors' : ''
        }`}
      >
        {fallbackType === 'student' ? (
          <User className="w-1/2 h-1/2 text-slate-400 stroke-1" />
        ) : (
          <ImageIcon className="w-1/2 h-1/2 text-slate-300 stroke-1" />
        )}
        {hasError && (
          <span className="text-[9px] text-amber-600 font-medium mt-0.5 px-1 text-center truncate max-w-full">
            Akses Private
          </span>
        )}
      </div>
    );
  }

  const primaryUrl = getOptimizedImageUrl(src, preset);
  const fallbackUrl = getDriveThumbnailFallback(src);
  const activeUrl = useSecondaryFallback ? fallbackUrl : primaryUrl;

  return (
    <div className={`relative overflow-hidden group ${onClick ? 'cursor-pointer' : ''}`}>
      {isLoading && (
        <div className="absolute inset-0 bg-slate-200 animate-pulse flex items-center justify-center">
          <ImageIcon className="w-5 h-5 text-slate-400 animate-bounce" />
        </div>
      )}
      <img
        src={activeUrl}
        alt={alt}
        loading="lazy"
        referrerPolicy="no-referrer"
        crossOrigin="anonymous"
        onLoad={() => {
          setIsLoading(false);
        }}
        onError={() => {
          if (!useSecondaryFallback) {
            setUseSecondaryFallback(true);
          } else {
            setHasError(true);
            setIsLoading(false);
          }
        }}
        onClick={onClick}
        className={`${className} transition-opacity duration-300 ${
          isLoading ? 'opacity-0' : 'opacity-100'
        }`}
      />
      {showZoomIcon && (
        <div
          onClick={onClick}
          className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white"
        >
          <ExternalLink className="w-5 h-5 drop-shadow" />
        </div>
      )}
    </div>
  );
};
