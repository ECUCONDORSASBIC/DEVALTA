import Image from 'next/image';
import React from 'react';

interface OptimizedImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  priority?: boolean;
  sizes?: string;
  fill?: boolean;
  quality?: number;
  placeholder?: 'blur' | 'empty';
  blurDataURL?: string;
}

/**
 * Optimized Image Component
 * Wrapper around Next.js Image with sensible defaults and performance optimizations
 */
export const OptimizedImage: React.FC<OptimizedImageProps> = ({
  src,
  alt,
  width,
  height,
  className = '',
  priority = false,
  sizes = '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw',
  fill = false,
  quality = 75,
  placeholder = 'empty',
  blurDataURL,
}) => {
  // Create a simple blur placeholder if none provided
  const defaultBlurDataURL = 
    'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q==';

  const imageProps = {
    src,
    alt,
    className,
    priority,
    quality,
    placeholder,
    blurDataURL: blurDataURL || (placeholder === 'blur' ? defaultBlurDataURL : undefined),
    ...(fill 
      ? { fill: true, sizes }
      : { width: width || 300, height: height || 200, sizes }
    )
  };

  return <Image {...imageProps} />;
};

/**
 * Avatar Image Component
 * Optimized for profile pictures and avatars
 */
interface AvatarImageProps {
  src?: string;
  alt: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  fallback?: string;
  className?: string;
}

export const AvatarImage: React.FC<AvatarImageProps> = ({
  src,
  alt,
  size = 'md',
  fallback,
  className = '',
}) => {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16',
    xl: 'w-24 h-24',
  };

  const sizePixels = {
    sm: 32,
    md: 48,
    lg: 64,
    xl: 96,
  };

  if (!src) {
    return (
      <div className={`${sizeClasses[size]} ${className} bg-gray-200 rounded-full flex items-center justify-center`}>
        <span className="text-gray-500 font-medium">
          {fallback || alt.charAt(0).toUpperCase()}
        </span>
      </div>
    );
  }

  return (
    <div className={`${sizeClasses[size]} ${className} relative rounded-full overflow-hidden`}>
      <OptimizedImage
        src={src}
        alt={alt}
        fill
        className="object-cover"
        sizes={`${sizePixels[size]}px`}
        priority={size === 'xl'} // Prioritize larger avatars
      />
    </div>
  );
};

export default OptimizedImage;
