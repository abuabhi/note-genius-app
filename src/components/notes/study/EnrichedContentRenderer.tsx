import React, { useMemo } from 'react';
import { TextAlignType } from './hooks/useStudyViewState';
import { markdownToHtml } from '@/utils/markdownConverter';
import { sanitizeEnrichedHTML } from '@/utils/sanitize';
import './SimpleContentRenderer.css';
import './EnrichedContentRenderer.css';

interface EnrichedContentRendererProps {
  content: string;
  fontSize?: number;
  textAlign?: TextAlignType;
  className?: string;
  hideColoring?: boolean;
}

type Segment = { kind: 'original' | 'enriched'; text: string };

const normalizeSegmentText = (raw: string): string => {
  return raw
    .replace(/\r\n/g, '\n')
    .replace(/^\s*\n+/, '')
    .replace(/\n+\s*$/, '')
    .trim();
};

const splitEnrichedSegments = (raw: string): Segment[] => {
  if (!raw) return [];
  const openRe = /\[(?:AI_)?(?:ENHANCED|ENRICHED)\]/i;
  const closeRe = /\[\/(?:AI_)?(?:ENHANCED|ENRICHED)\]/i;

  const segments: Segment[] = [];
  let rest = raw;

  while (rest.length > 0) {
    const openMatch = rest.match(openRe);
    if (!openMatch || openMatch.index === undefined) {
      const text = normalizeSegmentText(rest);
      if (text.length > 0) segments.push({ kind: 'original', text });
      break;
    }
    const beforeText = normalizeSegmentText(rest.slice(0, openMatch.index));
    if (beforeText.length > 0) segments.push({ kind: 'original', text: beforeText });

    const afterOpen = rest.slice(openMatch.index + openMatch[0].length);
    const closeMatch = afterOpen.match(closeRe);
    if (!closeMatch || closeMatch.index === undefined) {
      const enriched = normalizeSegmentText(afterOpen);
      if (enriched.length > 0) segments.push({ kind: 'enriched', text: enriched });
      break;
    }
    const enrichedText = normalizeSegmentText(afterOpen.slice(0, closeMatch.index));
    if (enrichedText.length > 0) segments.push({ kind: 'enriched', text: enrichedText });
    rest = afterOpen.slice(closeMatch.index + closeMatch[0].length);
  }

  return segments;
};

// Returns true when the rendered HTML has no visible text content.
const isHtmlEmpty = (html: string): boolean => {
  if (!html) return true;
  const stripped = html.replace(/<[^>]+>/g, '').replace(/&nbsp;/g, ' ').trim();
  return stripped.length === 0;
};

const escapeHtml = (s: string): string =>
  s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

export const EnrichedContentRenderer: React.FC<EnrichedContentRendererProps> = ({
  content,
  fontSize = 16,
  textAlign = 'left',
  className = '',
  hideColoring = false,
}) => {
  const segments = useMemo(() => splitEnrichedSegments(content || ''), [content]);

  if (import.meta.env.DEV) {
    // eslint-disable-next-line no-console
    console.log('[EnrichedContentRenderer]', {
      contentLength: content?.length ?? 0,
      segmentCount: segments.length,
      segmentKinds: segments.map((s) => `${s.kind}:${s.text.length}`),
    });
  }

  if (!content || content.trim().length === 0) {
    return <div className="text-muted-foreground">No content available</div>;
  }

  const containerStyle: React.CSSProperties = {
    fontSize: `${fontSize}px`,
    textAlign,
    lineHeight: 1.6,
  };

  return (
    <div
      className={`enriched-content simple-content ${hideColoring ? 'hide-coloring' : ''} ${className}`}
      style={containerStyle}
    >
      {segments.map((seg, i) => {
        const rawHtml = markdownToHtml(seg.text);
        let html = sanitizeEnrichedHTML(rawHtml);

        // Defensive fallback: if sanitization produced an empty body,
        // fall back to escaped raw text so the user always sees content.
        if (isHtmlEmpty(html)) {
          html = `<pre style="white-space:pre-wrap;font-family:inherit;margin:0;">${escapeHtml(seg.text)}</pre>`;
          if (import.meta.env.DEV) {
            // eslint-disable-next-line no-console
            console.warn('[EnrichedContentRenderer] empty render fallback used', {
              kind: seg.kind,
              snippet: seg.text.slice(0, 120),
            });
          }
        }

        if (seg.kind === 'enriched') {
          return (
            <section key={i} className="ai-enriched-card" aria-label="AI enriched content">
              <span className="ai-enriched-badge">Enriched</span>
              <div
                className="ai-enriched-body"
                dangerouslySetInnerHTML={{ __html: html }}
              />
            </section>
          );
        }
        return (
          <div
            key={i}
            className="ai-original-block"
            dangerouslySetInnerHTML={{ __html: html }}
          />
        );
      })}
    </div>
  );
};

export default EnrichedContentRenderer;
