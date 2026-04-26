import React from 'react';
import { TextAlignType } from '../hooks/useStudyViewState';
import { SimpleContentRenderer } from '../SimpleContentRenderer';

interface PlainTextNoteRendererProps {
  content: string;
  fontSize: number;
  textAlign: TextAlignType;
  className?: string;
  /**
   * When true, render markdown structure (#, ##, ###, **bold**, *italic*,
   * bullet lists). Used by the "Top 10 Questions" tab so Q/A formatting is
   * readable but the strict markdown→HTML pipeline (which can collapse to
   * empty) is bypassed.
   */
  enableMarkdown?: boolean;
}

/**
 * Safe renderer used by tabs that MUST always be visible (Original,
 * Top 10 Questions). Avoids the markdown/sanitize pipeline that has
 * historically returned empty output for valid content.
 */
export const PlainTextNoteRenderer: React.FC<PlainTextNoteRendererProps> = ({
  content,
  fontSize,
  textAlign,
  className = '',
  enableMarkdown = false,
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

  const containerStyle: React.CSSProperties = {
    fontSize: `${fontSize}px`,
    textAlign,
    lineHeight: 1.6,
    whiteSpace: 'normal',
    color: 'hsl(var(--foreground))',
  };

  // Lightweight inline-formatter for **bold** and *italic*. Returns React
  // nodes so we never inject raw HTML and never trip a sanitizer.
  const renderInline = (text: string): React.ReactNode[] => {
    const tokens = text.split(/(\*\*[^*]+\*\*|\*[^*]+\*)/g);
    return tokens.map((tok, i) => {
      if (/^\*\*[^*]+\*\*$/.test(tok)) {
        return <strong key={i}>{tok.slice(2, -2)}</strong>;
      }
      if (/^\*[^*]+\*$/.test(tok)) {
        return <em key={i}>{tok.slice(1, -1)}</em>;
      }
      return <React.Fragment key={i}>{tok}</React.Fragment>;
    });
  };

  // Plain-text mode (Original tab): split on blank lines, preserve newlines.
  if (!enableMarkdown) {
    const paragraphs = safeContent
      .replace(/\r\n/g, '\n')
      .split(/\n{2,}/)
      .map((p) => p.trim())
      .filter((p) => p.length > 0);

    return (
      <div className={`simple-content ${className}`} style={containerStyle}>
        {paragraphs.map((para, idx) => (
          <p key={idx} style={{ marginBottom: '0.9rem', whiteSpace: 'pre-wrap' }}>
            {para}
          </p>
        ))}
      </div>
    );
  }

  // Markdown mode (Questions tab): render headings, bullets and inline bold/italic
  // line by line. No regex on the whole document, no sanitizer, no double-pass.
  const blocks = safeContent.replace(/\r\n/g, '\n').split(/\n{2,}/).filter((b) => b.trim().length > 0);

  return (
    <div className={`simple-content ${className}`} style={containerStyle}>
      {blocks.map((block, blockIdx) => {
        const lines = block.split('\n').map((l) => l.trim()).filter(Boolean);

        // Bullet list block (every line starts with - * or •)
        if (lines.length > 0 && lines.every((l) => /^[-*•]\s+/.test(l))) {
          return (
            <ul key={blockIdx} style={{ marginBottom: '0.9rem', paddingLeft: '1.5rem', listStyle: 'disc' }}>
              {lines.map((l, i) => (
                <li key={i} style={{ marginBottom: '0.35rem' }}>
                  {renderInline(l.replace(/^[-*•]\s+/, ''))}
                </li>
              ))}
            </ul>
          );
        }

        // Numbered list block
        if (lines.length > 0 && lines.every((l) => /^\d+\.\s+/.test(l))) {
          return (
            <ol key={blockIdx} style={{ marginBottom: '0.9rem', paddingLeft: '1.5rem', listStyle: 'decimal' }}>
              {lines.map((l, i) => (
                <li key={i} style={{ marginBottom: '0.35rem' }}>
                  {renderInline(l.replace(/^\d+\.\s+/, ''))}
                </li>
              ))}
            </ol>
          );
        }

        // Mixed block: render each line as heading / paragraph
        return (
          <div key={blockIdx} style={{ marginBottom: '0.9rem' }}>
            {lines.map((line, i) => {
              const h1 = line.match(/^#\s+(.*)$/);
              const h2 = line.match(/^##\s+(.*)$/);
              const h3 = line.match(/^###\s+(.*)$/);
              const h4 = line.match(/^####\s+(.*)$/);

              if (h1) {
                return (
                  <h1
                    key={i}
                    style={{
                      fontSize: '1.75rem',
                      fontWeight: 700,
                      color: 'hsl(var(--primary))',
                      marginTop: i === 0 ? 0 : '1.25rem',
                      marginBottom: '0.75rem',
                      borderBottom: '2px solid hsl(var(--border))',
                      paddingBottom: '0.4rem',
                    }}
                  >
                    {renderInline(h1[1])}
                  </h1>
                );
              }
              if (h2) {
                return (
                  <h2
                    key={i}
                    style={{
                      fontSize: '1.4rem',
                      fontWeight: 600,
                      color: 'hsl(var(--primary))',
                      marginTop: i === 0 ? 0 : '1.1rem',
                      marginBottom: '0.6rem',
                    }}
                  >
                    {renderInline(h2[1])}
                  </h2>
                );
              }
              if (h3) {
                return (
                  <h3 key={i} style={{ fontSize: '1.2rem', fontWeight: 600, marginTop: '0.9rem', marginBottom: '0.5rem' }}>
                    {renderInline(h3[1])}
                  </h3>
                );
              }
              if (h4) {
                return (
                  <h4 key={i} style={{ fontSize: '1.05rem', fontWeight: 600, marginTop: '0.75rem', marginBottom: '0.4rem' }}>
                    {renderInline(h4[1])}
                  </h4>
                );
              }
              return (
                <p key={i} style={{ margin: '0 0 0.5rem 0', whiteSpace: 'pre-wrap' }}>
                  {renderInline(line)}
                </p>
              );
            })}
          </div>
        );
      })}
    </div>
  );
};
