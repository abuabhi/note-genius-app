import React from 'react';
import { TextAlignType } from '../hooks/useStudyViewState';
import { SimpleContentRenderer } from '../SimpleContentRenderer';

interface PlainTextNoteRendererProps {
  content: string;
  fontSize: number;
  textAlign: TextAlignType;
  className?: string;
}

/**
 * Safe renderer for the "Original" note tab.
 *
 * The original note must ALWAYS be visible. We avoid the markdown/expansion
 * pipeline (which has historically produced empty output for plain-text notes)
 * and render paragraphs directly. If the content happens to look like rich
 * HTML, we still hand it to SimpleContentRenderer so existing notes keep their
 * formatting.
 */
export const PlainTextNoteRenderer: React.FC<PlainTextNoteRendererProps> = ({
  content,
  fontSize,
  textAlign,
  className = '',
}) => {
  const safeContent = content ?? '';

  if (!safeContent.trim()) {
    return <div className="text-muted-foreground">No content available</div>;
  }

  // If the stored content already contains real HTML formatting (e.g. it was
  // created in the rich editor), defer to the existing renderer so we don't
  // strip tables/images/styling.
  const looksLikeHtml = /<\/?(p|h[1-6]|ul|ol|li|table|img|a |strong|em|blockquote|div|span|br)/i.test(safeContent);
  if (looksLikeHtml) {
    return (
      <SimpleContentRenderer
        content={safeContent}
        fontSize={fontSize}
        textAlign={textAlign}
        className={className}
      />
    );
  }

  // Plain text: split on blank lines into paragraphs, preserve single
  // line breaks within a paragraph. React handles escaping so the user's
  // text is rendered verbatim — never blank.
  const paragraphs = safeContent
    .replace(/\r\n/g, '\n')
    .split(/\n{2,}/)
    .map((p) => p.trim())
    .filter((p) => p.length > 0);

  return (
    <div
      className={`simple-content ${className}`}
      style={{
        fontSize: `${fontSize}px`,
        textAlign,
        lineHeight: 1.6,
        whiteSpace: 'normal',
        color: 'hsl(var(--foreground))',
      }}
    >
      {paragraphs.map((para, idx) => (
        <p key={idx} style={{ marginBottom: '0.9rem', whiteSpace: 'pre-wrap' }}>
          {para}
        </p>
      ))}
    </div>
  );
};
