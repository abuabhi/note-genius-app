import React, { useMemo } from 'react';
import { TextAlignType } from './hooks/useStudyViewState';
import { markdownToHtml } from '@/utils/markdownConverter';
import { sanitizeHTML } from '@/utils/sanitize';
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

/**
 * Splits raw enriched_content into ordered original/enriched segments.
 * Supports [AI_ENHANCED]…[/AI_ENHANCED] and [AI_ENRICHED]…[/AI_ENRICHED]
 * (case-insensitive). Tolerates a missing closing tag by treating the
 * remainder of the document as enriched.
 */
const splitEnrichedSegments = (raw: string): Segment[] => {
  if (!raw) return [];
  const openRe = /\[(?:AI_)?(?:ENHANCED|ENRICHED)\]/i;
  const closeRe = /\[\/(?:AI_)?(?:ENHANCED|ENRICHED)\]/i;

  const segments: Segment[] = [];
  let rest = raw;

  while (rest.length > 0) {
    const openMatch = rest.match(openRe);
    if (!openMatch || openMatch.index === undefined) {
      segments.push({ kind: 'original', text: rest });
      break;
    }
    const before = rest.slice(0, openMatch.index);
    if (before.trim().length > 0) {
      segments.push({ kind: 'original', text: before });
    }
    const afterOpen = rest.slice(openMatch.index + openMatch[0].length);
    const closeMatch = afterOpen.match(closeRe);
    if (!closeMatch || closeMatch.index === undefined) {
      // No closing tag — treat rest as enriched and stop.
      const enriched = afterOpen.trim();
      if (enriched.length > 0) segments.push({ kind: 'enriched', text: enriched });
      break;
    }
    const enrichedText = afterOpen.slice(0, closeMatch.index).trim();
    if (enrichedText.length > 0) {
      segments.push({ kind: 'enriched', text: enrichedText });
    }
    rest = afterOpen.slice(closeMatch.index + closeMatch[0].length);
  }

  return segments;
};

export const EnrichedContentRenderer: React.FC<EnrichedContentRendererProps> = ({
  content,
  fontSize = 16,
  textAlign = 'left',
  className = '',
  hideColoring = false,
}) => {
  const segments = useMemo(() => splitEnrichedSegments(content || ''), [content]);

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
        const html = sanitizeHTML(markdownToHtml(seg.text));
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
