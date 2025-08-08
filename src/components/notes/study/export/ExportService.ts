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
      // Preserve headers with proper spacing
      .replace(/<h([1-6])[^>]*>(.*?)<\/h[1-6]>/g, (match, level, text) => {
        const headerPrefix = '#'.repeat(parseInt(level)) + ' ';
        return '\n\n' + headerPrefix + text.trim() + '\n\n';
      })
      // Preserve bold formatting
      .replace(/<strong[^>]*>(.*?)<\/strong>/g, '**$1**')
      .replace(/<b[^>]*>(.*?)<\/b>/g, '**$1**')
      // Preserve italic formatting
      .replace(/<em[^>]*>(.*?)<\/em>/g, '*$1*')
      .replace(/<i[^>]*>(.*?)<\/i>/g, '*$1*')
      // Preserve bullet lists with proper indentation
      .replace(/<ul[^>]*>/g, '')
      .replace(/<\/ul>/g, '\n')
      .replace(/<li[^>]*>(.*?)<\/li>/g, '  • $1\n')
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
    const lines = pdf.splitTextToSize(formattedContent, maxLineWidth);
    
    let yPosition = 65;
    lines.forEach((line: string) => {
      if (yPosition > contentAreaHeight) {
        // Add footer to current page
        this.addFooterToPDF(pdf, pageWidth, pageHeight, margin);
        pdf.addPage();
        // COMPLETE font state reset for new page
        pdf.setFontSize(fontSize);
        pdf.setFont(undefined, 'normal');
        pdf.setTextColor(0, 0, 0);
        yPosition = margin;
      }
      
      // Handle different text styles
      if (line.includes('PDFQUESTION') && line.includes('ENDPDFQUESTION')) {
        // Handle questions with bold and green formatting
        const questionText = line.replace(/PDFQUESTION/, '').replace(/ENDPDFQUESTION/, '');
        pdf.setFont(undefined, 'bold');
        pdf.setTextColor(62, 180, 137); // dark green
        pdf.text(questionText, margin, yPosition);
        // CRITICAL: Reset font state immediately after special formatting
        pdf.setFont(undefined, 'normal');
        pdf.setTextColor(0, 0, 0);
        pdf.setFontSize(fontSize);
      } else if (line.startsWith('**') && line.endsWith('**')) {
        pdf.setFont(undefined, 'bold');
        pdf.text(line.slice(2, -2), margin, yPosition);
        // CRITICAL: Reset font state immediately
        pdf.setFont(undefined, 'normal');
        pdf.setFontSize(fontSize);
      } else if (line.startsWith('# ')) {
        pdf.setFontSize(fontSize + 4);
        pdf.setFont(undefined, 'bold');
        pdf.text(line.slice(2), margin, yPosition);
        // CRITICAL: Reset font state immediately
        pdf.setFontSize(fontSize);
        pdf.setFont(undefined, 'normal');
      } else if (line.startsWith('## ')) {
        pdf.setFontSize(fontSize + 2);
        pdf.setFont(undefined, 'bold');
        pdf.text(line.slice(3), margin, yPosition);
        // CRITICAL: Reset font state immediately
        pdf.setFontSize(fontSize);
        pdf.setFont(undefined, 'normal');
      } else {
        // Ensure normal formatting for regular text
        pdf.setFont(undefined, 'normal');
        pdf.setFontSize(fontSize);
        pdf.setTextColor(0, 0, 0);
        pdf.text(line, margin, yPosition);
      }
      
      yPosition += fontSize * 0.7;
    });
    
    // Add footer to the last page
    this.addFooterToPDF(pdf, pageWidth, pageHeight, margin);
    
    pdf.save(`${note.title || 'note'}-${contentType}.pdf`);
  }

  private preserveFormattingForDOCX(content: string): { paragraphs: any[] } {
    const paragraphs: any[] = [];
    
    // Remove AI enhancement tags FIRST - critical for DOCX
    let cleanContent = content
      .replace(/\[(?:AI_)?(?:ENHANCED|ENRICHED)\]([\s\S]*?)\[\/(?:AI_)?(?:ENHANCED|ENRICHED)\]/gi, '$1')
      .replace(/<div[^>]*class[^>]*ai[^>]*enhanced[^>]*>[\s\S]*?<\/div>/gi, '')
      .replace(/<div[^>]*class[^>]*enhanced[^>]*>[\s\S]*?<\/div>/gi, '')
      .replace(/\[(?:ENHANCED|ENRICHED|AI_ENHANCED)\]/gi, '')
      .replace(/\[\/(?:ENHANCED|ENRICHED|AI_ENHANCED)\]/gi, '')
      // REMOVE QUESTION FORMATTING TAGS - critical fix for DOCX
      .replace(/\*\*QUESTION\*\*/g, '')
      .replace(/\*\*ENDQUESTION\*\*/g, '');
    
    // Split content by major elements (headers, paragraphs, lists)
    const htmlContent = cleanContent
      .replace(/<h([1-6])[^>]*>(.*?)<\/h[1-6]>/g, '||HEADER$1||$2||ENDHEADER||')
      .replace(/<p[^>]*>(.*?)<\/p>/g, '||PARAGRAPH||$1||ENDPARAGRAPH||')
      .replace(/<ul[^>]*>(.*?)<\/ul>/g, '||LIST||$1||ENDLIST||')
      .replace(/<li[^>]*>(.*?)<\/li>/g, '||LISTITEM||$1||ENDLISTITEM||');

    const parts = htmlContent.split(/\|\|[A-Z]+\|\|/);
    
    for (let i = 0; i < parts.length; i++) {
      const part = parts[i].trim();
      if (!part) continue;

      if (part.match(/^HEADER([1-6])/)) {
        const level = parseInt(part.match(/^HEADER([1-6])/)?.[1] || '1');
        const text = parts[i + 1]?.replace(/\|\|ENDHEADER\|\|/, '') || '';
        paragraphs.push(new Paragraph({
          children: [new TextRun({ text: text.trim(), bold: true, size: 28 - (level * 2) })],
          spacing: { before: 240, after: 120 }
        }));
        i++; // Skip the text part
      } else if (part === 'PARAGRAPH') {
        const text = parts[i + 1]?.replace(/\|\|ENDPARAGRAPH\|\|/, '') || '';
        const cleanText = text.replace(/<[^>]+>/g, '').trim();
        if (cleanText) {
          paragraphs.push(new Paragraph({
            children: [new TextRun({ text: cleanText, size: 22 })],
            spacing: { after: 120 }
          }));
        }
        i++; // Skip the text part
      } else if (part === 'LISTITEM') {
        const text = parts[i + 1]?.replace(/\|\|ENDLISTITEM\|\|/, '') || '';
        const cleanText = text.replace(/<[^>]+>/g, '').trim();
        if (cleanText) {
          paragraphs.push(new Paragraph({
            children: [new TextRun({ text: `• ${cleanText}`, size: 22 })],
            indent: { left: 720 },
            spacing: { after: 60 }
          }));
        }
        i++; // Skip the text part
      }
    }

    // If no structured content found, create a simple paragraph
    if (paragraphs.length === 0) {
      const cleanText = content.replace(/<[^>]+>/g, '').trim();
      if (cleanText) {
        paragraphs.push(new Paragraph({
          children: [new TextRun({ text: cleanText, size: 22 })],
        }));
      }
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

    const buffer = await Packer.toBuffer(doc);
    const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' });
    
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
