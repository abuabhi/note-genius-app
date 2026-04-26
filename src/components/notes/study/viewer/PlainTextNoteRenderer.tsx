import React from 'react';
import { TextAlignType } from '../hooks/useStudyViewState';
import { sanitizeHTML } from '@/utils/sanitize';

interface PlainTextNoteRendererProps {
  content: string;
  fontSize: number;
  textAlign: TextAlignType;
  className?: string;
  /**
   * When true, render markdown structure (#, ##, ###, bullets, numbered lists).
   * Inline `**bold**` markers are stripped (never bolded) so Q/A content reads
   * cleanly.
   */
  enableMarkdown?: boolean;
}

/**
 * Safe renderer used by every study enhancement tab except Enriched Note.
 *
 * Goals:
 *   - Never produce a blank page when the DB has content.
 *   - Handle three input shapes: real HTML (Summary), markdown (Original++,
 *     Top 10 Questions), and bullet-only plain text (Key Points).
 *   - Use the design-system primary color for headings so all tabs look
 *     consistent; never inject hardcoded greens.
 *   - Do NOT emit bold for `**...**` — strip those markers instead.
 */
export const PlainTextNoteRenderer: React.FC<PlainTextNoteRendererProps> = ({
  content,
  fontSize,
  textAlign,
  className = '',
  enableMarkdown = false,
}) => {
  const safeContent = (content ?? '').toString();

  if (!safeContent.trim()) {
    return <div className="text-muted-foreground">No content available</div>;
  }

  const containerStyle: React.CSSProperties = {
    fontSize: `${fontSize}px`,
    textAlign,
    lineHeight: 1.6,
    color: 'hsl(var(--foreground))',
  };

  // ---- HTML branch -------------------------------------------------------
  // Some tabs (notably Summary) store real HTML. Sanitize and render it
  // directly so we never strip tags or hide content.
  const looksLikeHtml = /<\/?(p|h[1-6]|ul|ol|li|table|img|a |strong|em|blockquote|div|span|br)/i.test(
    safeContent
  );
  if (looksLikeHtml) {
    const sanitized = sanitizeHTML(safeContent);
    const finalHtml =
      sanitized && sanitized.replace(/<[^>]+>/g, '').trim().length > 0
        ? sanitized
        : `<pre style="white-space:pre-wrap;font-family:inherit;margin:0;">${safeContent
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')}</pre>`;
    return (
      <div
        className={`study-safe-content ${className}`}
        style={containerStyle}
        dangerouslySetInnerHTML={{ __html: finalHtml }}
      />
    );
  }

  // Strip markdown emphasis markers everywhere (no bold, no italic). This
  // satisfies the "no bold in questions/answers" requirement and keeps every
  // other tab consistent.
  const stripEmphasis = (text: string): string =>
    text
      .replace(/\*\*\*([^*]+)\*\*\*/g, '$1')
      .replace(/\*\*([^*]+)\*\*/g, '$1')
      .replace(/__([^_]+)__/g, '$1')
      .replace(/(^|[^*])\*([^*\n]+)\*/g, '$1$2')
      .replace(/(^|[^_])_([^_\n]+)_/g, '$1$2');

  // ---- Plain text mode (Original tab) -----------------------------------
  if (!enableMarkdown) {
    const paragraphs = safeContent
      .replace(/\r\n/g, '\n')
      .split(/\n{2,}/)
      .map((p) => p.trim())
      .filter((p) => p.length > 0);

    return (
      <div className={`study-safe-content ${className}`} style={containerStyle}>
        {paragraphs.map((para, idx) => (
          <p key={idx} style={{ marginBottom: '0.9rem', whiteSpace: 'pre-wrap' }}>
            {stripEmphasis(para)}
          </p>
        ))}
      </div>
    );
  }

  // ---- Markdown mode (Original++, Summary fallback, Key Points, Q/A) ----
  const blocks = safeContent
    .replace(/\r\n/g, '\n')
    .split(/\n{2,}/)
    .filter((b) => b.trim().length > 0);

  return (
    <div className={`study-safe-content ${className}`} style={containerStyle}>
      {blocks.map((block, blockIdx) => {
        const lines = block.split('\n').map((l) => l.trim()).filter(Boolean);

        if (lines.length > 0 && lines.every((l) => /^[-*•]\s+/.test(l))) {
          return (
            <ul
              key={blockIdx}
              style={{
                marginBottom: '0.9rem',
                paddingLeft: '1.5rem',
                listStyle: 'disc',
              }}
            >
              {lines.map((l, i) => (
                <li key={i} style={{ marginBottom: '0.4rem' }}>
                  {stripEmphasis(l.replace(/^[-*•]\s+/, ''))}
                </li>
              ))}
            </ul>
          );
        }

        if (lines.length > 0 && lines.every((l) => /^\d+\.\s+/.test(l))) {
          return (
            <ol
              key={blockIdx}
              style={{
                marginBottom: '0.9rem',
                paddingLeft: '1.5rem',
                listStyle: 'decimal',
              }}
            >
              {lines.map((l, i) => (
                <li key={i} style={{ marginBottom: '0.4rem' }}>
                  {stripEmphasis(l.replace(/^\d+\.\s+/, ''))}
                </li>
              ))}
            </ol>
          );
        }

        return (
          <div key={blockIdx} style={{ marginBottom: '0.9rem' }}>
            {lines.map((line, i) => {
              const h1 = line.match(/^#\s+(.*)$/);
              const h2 = line.match(/^##\s+(.*)$/);
              const h3 = line.match(/^###\s+(.*)$/);
              const h4 = line.match(/^####\s+(.*)$/);
              const bullet = line.match(/^[-*•]\s+(.*)$/);
              const numbered = line.match(/^\d+\.\s+(.*)$/);

              if (h1) {
                return (
                  <h1
                    key={i}
                    style={{
                      fontSize: '1.65rem',
                      fontWeight: 700,
                      color: 'hsl(var(--primary))',
                      marginTop: i === 0 ? 0 : '1.25rem',
                      marginBottom: '0.75rem',
                      borderBottom: '2px solid hsl(var(--border))',
                      paddingBottom: '0.4rem',
                    }}
                  >
                    {stripEmphasis(h1[1])}
                  </h1>
                );
              }
              if (h2) {
                return (
                  <h2
                    key={i}
                    style={{
                      fontSize: '1.35rem',
                      fontWeight: 600,
                      color: 'hsl(var(--primary))',
                      marginTop: i === 0 ? 0 : '1.1rem',
                      marginBottom: '0.6rem',
                    }}
                  >
                    {stripEmphasis(h2[1])}
                  </h2>
                );
              }
              if (h3) {
                return (
                  <h3
                    key={i}
                    style={{
                      fontSize: '1.15rem',
                      fontWeight: 600,
                      color: 'hsl(var(--primary))',
                      marginTop: '0.9rem',
                      marginBottom: '0.5rem',
                    }}
                  >
                    {stripEmphasis(h3[1])}
                  </h3>
                );
              }
              if (h4) {
                return (
                  <h4
                    key={i}
                    style={{
                      fontSize: '1.05rem',
                      fontWeight: 600,
                      color: 'hsl(var(--primary))',
                      marginTop: '0.75rem',
                      marginBottom: '0.4rem',
                    }}
                  >
                    {stripEmphasis(h4[1])}
                  </h4>
                );
              }
              if (bullet) {
                return (
                  <div
                    key={i}
                    style={{
                      paddingLeft: '1.25rem',
                      position: 'relative',
                      margin: '0 0 0.4rem 0',
                    }}
                  >
                    <span
                      style={{
                        position: 'absolute',
                        left: '0.25rem',
                        top: '0.55em',
                        width: 6,
                        height: 6,
                        borderRadius: '50%',
                        background: 'hsl(var(--primary))',
                      }}
                    />
                    {stripEmphasis(bullet[1])}
                  </div>
                );
              }
              if (numbered) {
                return (
                  <p key={i} style={{ margin: '0 0 0.45rem 0', whiteSpace: 'pre-wrap' }}>
                    {stripEmphasis(line)}
                  </p>
                );
              }
              return (
                <p key={i} style={{ margin: '0 0 0.5rem 0', whiteSpace: 'pre-wrap' }}>
                  {stripEmphasis(line)}
                </p>
              );
            })}
          </div>
        );
      })}
    </div>
  );
};
