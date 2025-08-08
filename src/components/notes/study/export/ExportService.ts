import jsPDF from 'jspdf';
import { Document, Packer, Paragraph, TextRun, Header, Footer, Table, TableRow, TableCell, AlignmentType } from 'docx';
import { Note } from '@/types/note';

export type ExportFormat = 'pdf' | 'docx' | 'txt';
export type ContentType = 'original' | 'summary' | 'keyPoints' | 'enriched' | 'markdown' | 'questions';

export interface ExportOptions {
  format: ExportFormat;
  contentType: ContentType;
  note: Note;
  fontSize?: number;
}

export interface EmailOptions {
  contentType: ContentType;
  note: Note;
  recipientEmail: string;
  subject?: string;
  message?: string;
}

class ExportService {
  private getContentByType(note: Note, contentType: ContentType): string {
    switch (contentType) {
      case 'original':
        return note.content || note.description || '';
      case 'summary':
        return note.summary || '';
      case 'keyPoints':
        return note.key_points || '';
      case 'enriched':
        return note.enriched_content || '';
      case 'markdown':
        return note.markdown_content || '';
      case 'questions':
        return note.questions_content || '';
      default:
        return note.content || note.description || '';
    }
  }

  private getContentTitle(contentType: ContentType): string {
    switch (contentType) {
      case 'original':
        return 'Original Content';
      case 'summary':
        return 'Summary';
      case 'keyPoints':
        return 'Key Points';
      case 'enriched':
        return 'Enriched Note';
      case 'markdown':
        return 'Original++';
      case 'questions':
        return 'Top 10 Questions';
      default:
        return 'Content';
    }
  }

  private preserveFormattingForPDF(content: string, contentType?: ContentType): string {
    // Enhanced formatting preservation for PDF
    let formattedContent = content
      // Remove AI enhancement tags FIRST - most critical fix
      .replace(/\[(?:AI_)?(?:ENHANCED|ENRICHED)\]([\s\S]*?)\[\/(?:AI_)?(?:ENHANCED|ENRICHED)\]/gi, '$1')
      // Remove any remaining AI enhancement divs and tags
      .replace(/<div[^>]*class[^>]*ai[^>]*enhanced[^>]*>[\s\S]*?<\/div>/gi, '')
      .replace(/<div[^>]*class[^>]*enhanced[^>]*>[\s\S]*?<\/div>/gi, '')
      .replace(/\[(?:ENHANCED|ENRICHED|AI_ENHANCED)\]/gi, '')
      .replace(/\[\/(?:ENHANCED|ENRICHED|AI_ENHANCED)\]/gi, '')
      // REMOVE QUESTION FORMATTING TAGS - critical fix
      .replace(/\*\*QUESTION\*\*/g, '')
      .replace(/\*\*ENDQUESTION\*\*/g, '')
      // Convert headers to plain text (remove ### markdown syntax)
      .replace(/<h([1-6])[^>]*>(.*?)<\/h[1-6]>/g, (match, level, text) => {
        return '\n\n' + text.trim() + '\n\n';
      })
      // Preserve bold formatting
      .replace(/<strong[^>]*>(.*?)<\/strong>/g, '**$1**')
      .replace(/<b[^>]*>(.*?)<\/b>/g, '**$1**')
      // Mark italic formatting for PDF processing (not markdown)
      .replace(/<em[^>]*>(.*?)<\/em>/g, 'PDFITALIC$1ENDPDFITALIC')
      .replace(/<i[^>]*>(.*?)<\/i>/g, 'PDFITALIC$1ENDPDFITALIC')
      // Handle existing markdown italic and convert to PDF markers
      .replace(/\*([^*]+)\*/g, 'PDFITALIC$1ENDPDFITALIC')
      // Preserve bullet lists with proper indentation for multi-line content
      .replace(/<ul[^>]*>/g, '')
      .replace(/<\/ul>/g, '\n')
      .replace(/<li[^>]*>(.*?)<\/li>/g, (match, content) => {
        // Process multi-line bullet content with proper indentation
        const lines = content.split('\n');
        const firstLine = '  • ' + lines[0].trim() + '\n';
        const additionalLines = lines.slice(1).map(line => 
          line.trim() ? '    ' + line.trim() + '\n' : '\n'
        ).join('');
        return firstLine + additionalLines;
      })
      // Preserve numbered lists
      .replace(/<ol[^>]*>/g, '')
      .replace(/<\/ol>/g, '\n')
      .replace(/<li[^>]*>(.*?)<\/li>/g, (match, content, index) => `  ${index + 1}. ${content}\n`)
      // Preserve paragraphs with proper spacing
      .replace(/<p[^>]*>/g, '')
      .replace(/<\/p>/g, '\n\n')
      // Preserve line breaks
      .replace(/<br\s*\/?>/g, '\n')
      // Handle tables (convert to text representation)
      .replace(/<table[^>]*>/g, '\n--- TABLE ---\n')
      .replace(/<\/table>/g, '\n--- END TABLE ---\n')
      .replace(/<tr[^>]*>/g, '| ')
      .replace(/<\/tr>/g, ' |\n')
      .replace(/<t[hd][^>]*>(.*?)<\/t[hd]>/g, '$1 | ')
      // Handle divs and spans while preserving structure
      .replace(/<div[^>]*>/g, '\n')
      .replace(/<\/div>/g, '\n')
      .replace(/<span[^>]*>/g, '')
      .replace(/<\/span>/g, '')
      // Remove remaining HTML tags
      .replace(/<[^>]+>/g, '')
      // Decode HTML entities
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      // Clean up excessive whitespace while preserving intentional spacing
      .replace(/\n\s*\n\s*\n/g, '\n\n')
      .replace(/^\s+|\s+$/g, '')
      .trim();

    // Enhanced question detection for Top 10 Questions - format for PDF display
    if (contentType === 'questions') {
      formattedContent = formattedContent
        // Mark questions for special formatting (Q1., Q2., etc.) - for PDF processing only
        .replace(/^(Q\d+[\.\:]?\s*)(.*$)/gm, 'PDFQUESTION$1$2ENDPDFQUESTION')
        // Mark numbered questions without Q prefix
        .replace(/^(\d+[\.\:]?\s*)(.*?)(?=\n|$)/gm, (match, number, text) => {
          if (text.trim().endsWith('?') || text.trim().length > 10) {
            return `PDFQUESTION${number}${text}ENDPDFQUESTION`;
          }
          return match;
        });
    }

    return formattedContent;
  }

  private addFooterToPDF(pdf: jsPDF, pageWidth: number, pageHeight: number, margin: number): void {
    // Save current font state
    const currentFontSize = pdf.getFontSize();
    
    pdf.setFontSize(8);
    pdf.setFont(undefined, 'italic');
    pdf.setTextColor(62, 180, 137); // dark green color
    const footerText = 'Generated by PrepGenie.io';
    const textWidth = pdf.getTextWidth(footerText);
    const xPosition = (pageWidth - textWidth) / 2;
    pdf.text(footerText, xPosition, pageHeight - 10);
    
    // CRITICAL: Complete font state reset after footer
    pdf.setTextColor(0, 0, 0); // Reset to black
    pdf.setFont(undefined, 'normal'); // Reset to normal weight
    pdf.setFontSize(currentFontSize); // Restore original font size
  }

  async exportToPDF(options: ExportOptions): Promise<void> {
    const { note, contentType, fontSize = 12 } = options;
    const content = this.getContentByType(note, contentType);
    const contentTitle = this.getContentTitle(contentType);
    
    if (!content) {
      throw new Error(`No ${contentTitle.toLowerCase()} available to export`);
    }

    const pdf = new jsPDF();
    const pageWidth = pdf.internal.pageSize.width;
    const pageHeight = pdf.internal.pageSize.height;
    const margin = 20;
    const maxLineWidth = pageWidth - (margin * 2);
    const footerHeight = 20;
    const contentAreaHeight = pageHeight - margin - footerHeight;
    
    // Title
    pdf.setFontSize(18);
    pdf.setFont(undefined, 'bold');
    pdf.text(note.title || 'Untitled Note', margin, 30);
    
    // Content type
    pdf.setFontSize(14);
    pdf.setFont(undefined, 'bold');
    pdf.text(`${contentTitle}`, margin, 45);
    
    // Add a separator line
    pdf.setDrawColor(77, 182, 172); // mint color
    pdf.line(margin, 50, pageWidth - margin, 50);
    
    // Content with preserved formatting
    pdf.setFontSize(fontSize);
    pdf.setFont(undefined, 'normal');
    const formattedContent = this.preserveFormattingForPDF(content, contentType);

    const ensureRoom = () => {
      if (yPosition > contentAreaHeight) {
        this.addFooterToPDF(pdf, pageWidth, pageHeight, margin);
        pdf.addPage();
        pdf.setFontSize(fontSize);
        pdf.setFont(undefined, 'normal');
        pdf.setTextColor(0, 0, 0);
        yPosition = margin;
      }
    };

    const lineHeight = fontSize * 0.7;

    const drawInlineText = (text: string, x: number, y: number, maxWidth: number) => {
      // Simple inline italic handler (single pair per line support)
      if (text.includes('PDFITALIC') && text.includes('ENDPDFITALIC')) {
        const before = text.substring(0, text.indexOf('PDFITALIC'));
        const italic = text.substring(text.indexOf('PDFITALIC') + 9, text.indexOf('ENDPDFITALIC'));
        const after = text.substring(text.indexOf('ENDPDFITALIC') + 12);

        let cursorX = x;
        if (before) {
          pdf.setFont(undefined, 'normal');
          pdf.text(before, cursorX, y);
          cursorX += pdf.getTextWidth(before);
        }
        if (italic) {
          pdf.setFont(undefined, 'italic');
          pdf.text(italic, cursorX, y);
          cursorX += pdf.getTextWidth(italic);
        }
        if (after) {
          pdf.setFont(undefined, 'normal');
          pdf.text(after, cursorX, y);
        }
        pdf.setFont(undefined, 'normal');
      } else if (text.startsWith('**') && text.endsWith('**')) {
        pdf.setFont(undefined, 'bold');
        pdf.text(text.slice(2, -2), x, y);
        pdf.setFont(undefined, 'normal');
      } else {
        pdf.setFont(undefined, 'normal');
        pdf.text(text, x, y);
      }
    };

    const lines = formattedContent.split('\n');
    let yPosition = 65;

    for (const rawLine of lines) {
      const line = rawLine.trimEnd();
      if (!line) {
        yPosition += lineHeight; // preserve blank line spacing
        continue;
      }

      if (line.startsWith('PDFQUESTION') && line.includes('ENDPDFQUESTION')) {
        const questionText = line.replace(/PDFQUESTION/, '').replace(/ENDPDFQUESTION/, '');
        ensureRoom();
        pdf.setFont(undefined, 'bold');
        pdf.setTextColor(62, 180, 137);
        const chunks = pdf.splitTextToSize(questionText, maxLineWidth);
        chunks.forEach((chunk) => {
          ensureRoom();
          pdf.text(chunk, margin, yPosition);
          yPosition += lineHeight;
        });
        pdf.setFont(undefined, 'normal');
        pdf.setTextColor(0, 0, 0);
        continue;
      }

      if (line.startsWith('PDFBULLET ')) {
        const text = line.replace(/^PDFBULLET\s+/, '');
        const wrapped = pdf.splitTextToSize(text, maxLineWidth - 10);
        wrapped.forEach((chunk, idx) => {
          ensureRoom();
          if (idx === 0) {
            pdf.text('•', margin, yPosition);
          }
          drawInlineText(chunk, margin + 10, yPosition, maxLineWidth - 10);
          yPosition += lineHeight;
        });
        continue;
      }

      // Regular paragraph line
      const wrapped = pdf.splitTextToSize(line, maxLineWidth);
      wrapped.forEach((chunk) => {
        ensureRoom();
        drawInlineText(chunk, margin, yPosition, maxLineWidth);
        yPosition += lineHeight;
      });
    }
    
    // Add footer to the last page
    this.addFooterToPDF(pdf, pageWidth, pageHeight, margin);
    
    pdf.save(`${note.title || 'note'}-${contentType}.pdf`);
  }

  private preserveFormattingForDOCX(content: string): { paragraphs: any[] } {
    // Build properly formatted DOCX paragraphs from mixed HTML/Markdown content
    const paragraphs: any[] = [];

    // 1) Clean content: strip AI/QUESTION tags, convert HTML blocks to newlines, remove leftover tags, decode entities
    let txt = content
      // AI/Enhanced wrappers
      .replace(/\[(?:AI_)?(?:ENHANCED|ENRICHED)\]([\s\S]*?)\[\/(?:AI_)?(?:ENHANCED|ENRICHED)\]/gi, '$1')
      .replace(/<div[^>]*class[^>]*ai[^>]*enhanced[^>]*>[\s\S]*?<\/div>/gi, '')
      .replace(/<div[^>]*class[^>]*enhanced[^>]*>[\s\S]*?<\/div>/gi, '')
      .replace(/\[(?:ENHANCED|ENRICHED|AI_ENHANCED)\]/gi, '')
      .replace(/\[\/(?:ENHANCED|ENRICHED|AI_ENHANCED)\]/gi, '')
      // QUESTION tags
      .replace(/\*\*QUESTION\*\*/g, '')
      .replace(/\*\*ENDQUESTION\*\*/g, '')
      // Convert some HTML structure to text
      .replace(/<br\s*\/?>(?=\n)?/gi, '\n')
      .replace(/<\/(p|div|section)>/gi, '\n\n')
      .replace(/<(p|div|section)[^>]*>/gi, '')
      .replace(/<\/(h[1-6])>/gi, '\n\n')
      .replace(/<h([1-6])[^>]*>(.*?)<\/h[1-6]>/gi, (m, lvl, t) => `\n\n#${'#'.repeat(Math.max(0, (+lvl - 1)))} ${t}\n\n`)
      .replace(/<ul[^>]*>/gi, '\n')
      .replace(/<\/ul>/gi, '\n')
      .replace(/<ol[^>]*>/gi, '\n')
      .replace(/<\/ol>/gi, '\n')
      .replace(/<li[^>]*>([\s\S]*?)<\/li>/gi, (m, t) => `• ${t}\n`)
      // Remove any other tags
      .replace(/<[^>]+>/g, '')
      // Decode common entities
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      // Normalize excess blank lines
      .replace(/\r\n/g, '\n')
      .replace(/\n{3,}/g, '\n\n')
      .trim();

    // 2) Helpers
    const makeRuns = (raw: string): TextRun[] => {
      // Protect bold first
      let marked = raw.replace(/\*\*([^*]+)\*\*/g, 'B_OPEN$1B_CLOSE');
      // Safe italics (avoid bullet-leading asterisks)
      marked = marked.replace(/(^|[^*])\*([^*\n]+?)\*/g, (m, pre, inner) => `${pre}I_OPEN${inner}I_CLOSE`);

      const parts = marked.split(/(B_OPEN|B_CLOSE|I_OPEN|I_CLOSE)/);
      const runs: TextRun[] = [] as any;
      let bold = false, ital = false;
      for (let i = 0; i < parts.length; i++) {
        const token = parts[i];
        if (token === 'B_OPEN') { bold = true; continue; }
        if (token === 'B_CLOSE') { bold = false; continue; }
        if (token === 'I_OPEN') { ital = true; continue; }
        if (token === 'I_CLOSE') { ital = false; continue; }
        if (!token) continue;
        runs.push(new TextRun({ text: token, bold, italics: ital, size: 22 }));
      }
      return runs;
    };

    const pushParagraph = (text: string) => {
      const trimmed = text.trim();
      if (!trimmed) return;
      paragraphs.push(new Paragraph({ children: makeRuns(trimmed), spacing: { after: 120 } }));
    };

    const pushBullet = (text: string) => {
      const t = text.replace(/^([•*+\-]\s+)/, '').trim();
      paragraphs.push(new Paragraph({
        children: [new TextRun({ text: '• ', bold: true, size: 22 }), ...makeRuns(t)],
        indent: { left: 720 },
        spacing: { after: 60 },
      }));
    };

    const pushNumbered = (n: string, text: string) => {
      const prefix = `${n}. `;
      paragraphs.push(new Paragraph({
        children: [new TextRun({ text: prefix, bold: true, size: 22 }), ...makeRuns(text.trim())],
        indent: { left: 720 },
        spacing: { after: 60 },
      }));
    };

    // 3) Line-based parsing
    const lines = txt.split('\n');
    for (let raw of lines) {
      const line = raw.trimRight();
      if (!line.trim()) { paragraphs.push(new Paragraph({ children: [new TextRun({ text: ' ', size: 2 })] })); continue; }

      // Headings in markdown style: remove ### but keep emphasis
      const h = line.match(/^\s*#{1,6}\s+(.*)$/);
      if (h) {
        const text = h[1].trim();
        paragraphs.push(new Paragraph({ children: makeRuns(text), spacing: { before: 240, after: 120 } }));
        continue;
      }

      // Bullets: -, *, +, •
      if (/^\s*[•*+\-]\s+/.test(line)) { pushBullet(line); continue; }

      // Numbered: 1. 2) etc
      const num = line.match(/^\s*(\d+)[\.)]\s+(.*)$/);
      if (num) { pushNumbered(num[1], num[2]); continue; }

      // Plain paragraph
      pushParagraph(line);
    }

    if (paragraphs.length === 0) {
      pushParagraph(txt);
    }

    return { paragraphs };
  }

  async exportToDOCX(options: ExportOptions): Promise<void> {
    const { note, contentType } = options;
    const content = this.getContentByType(note, contentType);
    const contentTitle = this.getContentTitle(contentType);
    
    if (!content) {
      throw new Error(`No ${contentTitle.toLowerCase()} available to export`);
    }

    const { paragraphs } = this.preserveFormattingForDOCX(content);
    
    const doc = new Document({
      sections: [{
        properties: {
          page: {
            margin: {
              top: 720,
              right: 720,
              bottom: 720,
              left: 720,
            },
          },
        },
        headers: {
          default: new Header({
            children: [
              new Paragraph({
                children: [],
              }),
            ],
          }),
        },
        footers: {
          default: new Footer({
            children: [
              new Paragraph({
                children: [
                  new TextRun({
                    text: 'Generated by PrepGenie.io',
                    size: 16,
                    italics: true,
                    color: '3EB489', // dark green color - FIXED
                  }),
                ],
                alignment: AlignmentType.CENTER,
              }),
            ],
          }),
        },
        children: [
          new Paragraph({
            children: [
              new TextRun({
                text: note.title || 'Untitled Note',
                bold: true,
                size: 32, // 16pt
                color: '2D3748', // dark gray
              }),
            ],
            spacing: { after: 240 },
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: contentTitle,
                bold: true,
                size: 24, // 12pt
                color: '4DB6AC', // mint color
              }),
            ],
            spacing: { after: 240 },
          }),
          ...paragraphs,
        ],
      }],
    });

    const blob = await Packer.toBlob(doc);
    
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${note.title || 'note'}-${contentType}.docx`;
    link.click();
    
    URL.revokeObjectURL(link.href);
  }

  private preserveFormattingForTXT(content: string): string {
    // Enhanced text formatting with better structure preservation
    let formattedContent = content
      // Remove AI enhancement tags FIRST - critical for TXT
      .replace(/\[(?:AI_)?(?:ENHANCED|ENRICHED)\]([\s\S]*?)\[\/(?:AI_)?(?:ENHANCED|ENRICHED)\]/gi, '$1')
      .replace(/<div[^>]*class[^>]*ai[^>]*enhanced[^>]*>[\s\S]*?<\/div>/gi, '')
      .replace(/<div[^>]*class[^>]*enhanced[^>]*>[\s\S]*?<\/div>/gi, '')
      .replace(/\[(?:ENHANCED|ENRICHED|AI_ENHANCED)\]/gi, '')
      .replace(/\[\/(?:ENHANCED|ENRICHED|AI_ENHANCED)\]/gi, '')
      // REMOVE QUESTION FORMATTING TAGS - critical fix for TXT
      .replace(/\*\*QUESTION\*\*/g, '')
      .replace(/\*\*ENDQUESTION\*\*/g, '')
      // Headers with visual emphasis
      .replace(/<h1[^>]*>(.*?)<\/h1>/g, '\n\n═══ $1 ═══\n\n')
      .replace(/<h2[^>]*>(.*?)<\/h2>/g, '\n\n▓▓▓ $1 ▓▓▓\n\n')
      .replace(/<h3[^>]*>(.*?)<\/h3>/g, '\n\n■■■ $1 ■■■\n\n')
      .replace(/<h([4-6])[^>]*>(.*?)<\/h[4-6]>/g, '\n\n>>> $2 <<<\n\n')
      // Bold and italic with text markers
      .replace(/<strong[^>]*>(.*?)<\/strong>/g, '**$1**')
      .replace(/<b[^>]*>(.*?)<\/b>/g, '**$1**')
      .replace(/<em[^>]*>(.*?)<\/em>/g, '*$1*')
      .replace(/<i[^>]*>(.*?)<\/i>/g, '*$1*')
      // Lists with proper indentation
      .replace(/<ul[^>]*>/g, '\n')
      .replace(/<\/ul>/g, '\n')
      .replace(/<ol[^>]*>/g, '\n')
      .replace(/<\/ol>/g, '\n')
      .replace(/<li[^>]*>(.*?)<\/li>/g, '    • $1\n')
      // Tables with ASCII art
      .replace(/<table[^>]*>/g, '\n┌─────────────────────────────────────┐\n')
      .replace(/<\/table>/g, '└─────────────────────────────────────┘\n')
      .replace(/<tr[^>]*>/g, '│ ')
      .replace(/<\/tr>/g, ' │\n')
      .replace(/<t[hd][^>]*>(.*?)<\/t[hd]>/g, '$1 │ ')
      // Paragraphs with proper spacing
      .replace(/<p[^>]*>/g, '\n')
      .replace(/<\/p>/g, '\n\n')
      .replace(/<br\s*\/?>/g, '\n')
      .replace(/<div[^>]*>/g, '\n')
      .replace(/<\/div>/g, '\n')
      .replace(/<span[^>]*>/g, '')
      .replace(/<\/span>/g, '')
      // Clean up HTML tags
      .replace(/<[^>]+>/g, '')
      // Decode entities
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      // Clean up spacing
      .replace(/\n\s*\n\s*\n/g, '\n\n')
      .trim();

    return formattedContent;
  }

  async exportToTXT(options: ExportOptions): Promise<void> {
    const { note, contentType } = options;
    const content = this.getContentByType(note, contentType);
    const contentTitle = this.getContentTitle(contentType);
    
    if (!content) {
      throw new Error(`No ${contentTitle.toLowerCase()} available to export`);
    }

    const formattedContent = this.preserveFormattingForTXT(content);
    const txtContent = [
      '═'.repeat(60),
      (note.title || 'Untitled Note').toUpperCase(),
      '═'.repeat(60),
      '',
      `▓▓▓ ${contentTitle.toUpperCase()} ▓▓▓`,
      '',
      formattedContent,
      '',
      '',
      '─'.repeat(60),
      'Generated by PrepGenie.io',
      '─'.repeat(60),
    ].join('\n');

    const blob = new Blob([txtContent], { type: 'text/plain' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${note.title || 'note'}-${contentType}.txt`;
    link.click();
    
    URL.revokeObjectURL(link.href);
  }

  async export(options: ExportOptions): Promise<void> {
    switch (options.format) {
      case 'pdf':
        return this.exportToPDF(options);
      case 'docx':
        return this.exportToDOCX(options);
      case 'txt':
        return this.exportToTXT(options);
      default:
        throw new Error(`Unsupported export format: ${options.format}`);
    }
  }

  async sendEmail(options: EmailOptions): Promise<void> {
    const { note, contentType, recipientEmail, subject, message } = options;
    const content = this.getContentByType(note, contentType);
    const contentTitle = this.getContentTitle(contentType);
    
    if (!content) {
      throw new Error(`No ${contentTitle.toLowerCase()} available to send`);
    }

    try {
      const response = await fetch('/functions/v1/send-note-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp1aGNtd3VqemZkZG1hZm96dWJkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY1MjUxOTQsImV4cCI6MjA2MjEwMTE5NH0.oz_MnWdGGh76eOjQ2k69OhQhqBh4KXG0Wq_cN-VJwzw'}`
        },
        body: JSON.stringify({
          to: recipientEmail,
          subject: subject || `${note.title || 'Note'} - ${contentTitle}`,
          message: message || '',
          noteTitle: note.title || 'Untitled Note',
          contentType: contentTitle,
          content: this.preserveFormattingForTXT(content),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to send email');
      }

      const result = await response.json();
      console.log('Email sent successfully:', result);
    } catch (error) {
      console.error('Error sending email:', error);
      throw new Error(error instanceof Error ? error.message : 'Failed to send email. Please try again.');
    }
  }
}

export const exportService = new ExportService();
