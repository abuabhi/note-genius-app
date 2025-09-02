import React from 'react';
import { ReactVideoPlayer } from './ReactVideoPlayer';
import { LucideIcon } from 'lucide-react';

interface VideoFeatureSectionProps {
  title: string;
  description: string;
  benefits: string[];
  videoUrl: string;
  fallbackUrl?: string;
  icon: LucideIcon;
  highlight?: string;
  reverse?: boolean;
}

export const VideoFeatureSection = ({ 
  title, 
  description, 
  benefits, 
  videoUrl,
  fallbackUrl, 
  icon: Icon,
  highlight,
  reverse = false 
}: VideoFeatureSectionProps) => {
  return (
    <div className="py-12 sm:py-16 lg:py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className={`grid lg:grid-cols-2 gap-8 lg:gap-12 items-center ${reverse ? 'lg:direction-rtl' : ''}`}>
          {/* Content Side */}
          <div className={`space-y-6 ${reverse ? 'lg:direction-ltr lg:order-2' : ''}`}>
            <div className="flex items-center gap-4">
              <div className="inline-flex items-center justify-center p-3 rounded-xl bg-gradient-to-r from-mint-500 to-mint-600 shadow-lg">
                <Icon className="h-6 w-6 text-white" />
              </div>
              {highlight && (
                <span className="px-3 py-1 text-xs bg-mint-100 text-mint-700 rounded-full font-medium border border-mint-200">
                  {highlight}
                </span>
              )}
            </div>
            
            <div>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 leading-tight">
                {title}
              </h2>
              <p className="mt-4 text-base sm:text-lg text-gray-600 leading-relaxed">
                {description}
              </p>
            </div>

            <div className="space-y-3">
              {benefits.map((benefit, index) => (
                <div key={index} className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-2 h-2 bg-mint-500 rounded-full mt-2" />
                  <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
                    {benefit}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Video Side */}
          <div className={`relative ${reverse ? 'lg:order-1' : ''}`}>
            <div className="absolute -inset-2 sm:-inset-4 bg-gradient-to-r from-mint-300 to-neutral-300 blur-2xl sm:blur-3xl opacity-20" />
            <ReactVideoPlayer 
              url={videoUrl}
              fallbackUrl={fallbackUrl}
              title={`${title} Demo`}
              className="relative"
            />
          </div>
        </div>
      </div>
    </div>
  );
};