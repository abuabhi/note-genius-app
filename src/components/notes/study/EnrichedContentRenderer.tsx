import React, { useMemo } from 'react';
import { TextAlignType } from './hooks/useStudyViewState';
import { markdownToHtml } from '@/utils/markdownConverter';
import { sanitizeEnrichedHTML } from '@/utils/sanitize';
import './SimpleContentRenderer.css';
import './EnrichedContentRenderer.css';

export interface InlineExpansion {
  id: string;
  originalText: string;
  expandedContent: string;
}

interface EnrichedContentRendererProps {
  content: string;
  fontSize?: number;
  textAlign?: TextAlignType;
  className?: string;
  hideColoring?: boolean;
  expansions?: InlineExpansion[];
  onRemoveExpansion?: (id: string) => void;
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
  expansions = [],
  onRemoveExpansion,
}) => {
  const segments = useMemo(() => splitEnrichedSegments(content || ''), [content]);

  if (import.meta.env.DEV) {
    // eslint-disable-next-line no-console
    console.log('[EnrichedContentRenderer]', {
      contentLength: content?.length ?? 0,
      segmentCount: segments.length,
      segmentKinds: segments.map((s) => `${s.kind}:${s.text.length}`),
      expansionCount: expansions.length,
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

  // Match each expansion to the first segment whose text contains the original
  // selection. Anything unmatched will be appended at the end so it is never lost.
  const expansionsBySegment = new Map<number, InlineExpansion[]>();
  const unmatchedExpansions: InlineExpansion[] = [];
  for (const exp of expansions) {
    const needle = (exp.originalText || '').trim();
    let placed = false;
    if (needle.length > 0) {
      // Try a few progressively shorter prefixes for robustness.
      const candidates = [needle, needle.slice(0, 80), needle.slice(0, 40)].filter(
        (c) => c.length >= 8
      );
      for (let idx = 0; idx < segments.length; idx++) {
        const segText = segments[idx].text;
        if (candidates.some((c) => segText.includes(c))) {
          const list = expansionsBySegment.get(idx) || [];
          list.push(exp);
          expansionsBySegment.set(idx, list);
          placed = true;
          break;
        }
      }
    }
    if (!placed) unmatchedExpansions.push(exp);
  }

  const renderExpansionCard = (exp: InlineExpansion) => {
    const expansionClass = hideColoring ? 'ai-expansion-content-neutral' : 'ai-expansion-content';
    const expHtml = sanitizeEnrichedHTML(markdownToHtml(exp.expandedContent || ''));
    const safeHtml = isHtmlEmpty(expHtml)
      ? `<pre style="white-space:pre-wrap;font-family:inherit;margin:0;">${escapeHtml(exp.expandedContent || '')}</pre>`
      : expHtml;
    return (
      <div key={`exp-${exp.id}`} className={expansionClass} style={{ position: 'relative' }}>
        <div dangerouslySetInnerHTML={{ __html: safeHtml }} />
        {onRemoveExpansion && (
          <button
            type="button"
            aria-label="Remove expansion"
            onClick={() => onRemoveExpansion(exp.id)}
            className="expansion-remove-btn"
            style={{ position: 'absolute', top: 8, right: 8 }}
          >
            ×
          </button>
        )}
      </div>
    );
  };

  return (
    <div
      className={`enriched-content simple-content ${hideColoring ? 'hide-coloring' : ''} ${className}`}
      style={containerStyle}
    >
      {segments.map((seg, i) => {
        const rawHtml = markdownToHtml(seg.text);
        let html = sanitizeEnrichedHTML(rawHtml);

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

        const segExpansions = expansionsBySegment.get(i) || [];

        const segmentNode =
          seg.kind === 'enriched' ? (
            <section className="ai-enriched-card" aria-label="AI enriched content">
              <span className="ai-enriched-badge">Enriched</span>
              <div
                className="ai-enriched-body"
                dangerouslySetInnerHTML={{ __html: html }}
              />
            </section>
          ) : (
            <div
              className="ai-original-block"
              dangerouslySetInnerHTML={{ __html: html }}
            />
          );

        return (
          <React.Fragment key={i}>
            {segmentNode}
            {segExpansions.map(renderExpansionCard)}
          </React.Fragment>
        );
      })}
      {unmatchedExpansions.map(renderExpansionCard)}
    </div>
  );
};

export default EnrichedContentRenderer;
