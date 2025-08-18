import React from 'react';
import './RichTextDisplay.css';
import { sanitizeHTML } from '@/utils/sanitize';

interface RichTextDisplayProps {
  content: string;
  fontSize?: number;
  textAlign?: 'left' | 'center' | 'right' | 'justify';
  className?: string;
  showImages?: boolean;
}

export const RichTextDisplay: React.FC<RichTextDisplayProps> = ({
  content,
  fontSize = 16,
  textAlign = 'left',
  className = '',
  showImages = true
}) => {
  if (!content || content.trim().length === 0) {
    return <div className="text-muted-foreground">No content available</div>;
  }

  const containerStyle = {
    fontSize: `${fontSize}px`,
    textAlign: textAlign,
    lineHeight: 1.6
  };

  const containerClass = `rich-text-display ${className} ${!showImages ? 'hide-images' : ''}`;

  // For rich HTML content from Tiptap, render directly with proper sanitization
  const isRichHTML = content.includes('<p>') || 
                     content.includes('<h1>') || 
                     content.includes('<h2>') || 
                     content.includes('<strong>') ||
                     content.includes('<table>') ||
                     content.includes('<img>') ||
                     content.includes('<a ') ||
                     content.includes('font-size:') ||
                     content.includes('color:');

  // Enhanced sanitization for rich content
  const sanitizedContent = isRichHTML ? 
    sanitizeHTML(content) : 
    sanitizeHTML(`<p>${content.replace(/\n/g, '<br>')}</p>`);

  return (
    <div 
      className={containerClass}
      style={containerStyle}
      dangerouslySetInnerHTML={{ __html: sanitizedContent }}
    />
  );
};