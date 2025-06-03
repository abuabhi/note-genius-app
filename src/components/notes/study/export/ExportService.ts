import jsPDF from 'jspdf';
import { Document, Packer, Paragraph, TextRun } from 'docx';
import { Note } from '@/types/note';

export type ExportFormat = 'pdf' | 'docx' | 'txt';
export type ContentType = 'original' | 'summary' | 'keyPoints' | 'improved' | 'markdown';

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
      case 'improved':
        return note.improved_content || '';
      case 'markdown':
        return note.markdown_content || '';
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
      case 'improved':
        return 'Improved Content';
      case 'markdown':
        return 'Markdown Content';
      default:
        return 'Content';
    }
  }

  private stripHtmlAndFormat(content: string): string {
    // First, handle common HTML formatting
    let formattedContent = content
      // Remove style attributes but keep the content
      .replace(/<p style="[^"]*">/g, '')
      .replace(/<\/p>/g, '\n\n')
      // Handle headers
      .replace(/<h([1-6])[^>]*>(.*?)<\/h[1-6]>/g, (match, level, text) => {
        const headerPrefix = '#'.repeat(parseInt(level)) + ' ';
        return headerPrefix + text + '\n\n';
      })
      // Handle bold and italic
      .replace(/<strong[^>]*>(.*?)<\/strong>/g, '**$1**')
      .replace(/<b[^>]*>(.*?)<\/b>/g, '**$1**')
      .replace(/<em[^>]*>(.*?)<\/em>/g, '*$1*')
      .replace(/<i[^>]*>(.*?)<\/i>/g, '*$1*')
      // Handle lists
      .replace(/<ul[^>]*>/g, '')
      .replace(/<\/ul>/g, '\n')
      .replace(/<ol[^>]*>/g, '')
      .replace(/<\/ol>/g, '\n')
      .replace(/<li[^>]*>(.*?)<\/li>/g, '• $1\n')
      // Handle line breaks
      .replace(/<br\s*\/?>/g, '\n')
      // Handle divs and spans
      .replace(/<div[^>]*>/g, '')
      .replace(/<\/div>/g, '\n')
      .replace(/<span[^>]*>/g, '')
      .replace(/<\/span>/g, '')
      // Remove any remaining HTML tags
      .replace(/<[^>]+>/g, '')
      // Decode HTML entities
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      // Clean up excessive whitespace
      .replace(/\n\s*\n\s*\n/g, '\n\n')
      .replace(/^\s+|\s+$/g, '')
      .trim();

    return formattedContent;
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
    pdf.setFontSize(16);
    pdf.setFont(undefined, 'bold');
    pdf.text(note.title || 'Untitled Note', margin, 30);
    
    // Content type
    pdf.setFontSize(12);
    pdf.setFont(undefined, 'normal');
    pdf.text(`${contentTitle}`, margin, 45);
    
    // Content
    pdf.setFontSize(fontSize);
    const formattedContent = this.stripHtmlAndFormat(content);
    const lines = pdf.splitTextToSize(formattedContent, maxLineWidth);
    
    let yPosition = 60;
    lines.forEach((line: string) => {
      if (yPosition > contentAreaHeight) {
        // Add footer to current page
        this.addFooterToPDF(pdf, pageWidth, pageHeight, margin);
        pdf.addPage();
        yPosition = margin;
      }
      pdf.text(line, margin, yPosition);
      yPosition += fontSize * 0.6;
    });
    
    // Add footer to the last page
    this.addFooterToPDF(pdf, pageWidth, pageHeight, margin);
    
    pdf.save(`${note.title || 'note'}-${contentType}.pdf`);
  }

  private addFooterToPDF(pdf: jsPDF, pageWidth: number, pageHeight: number, margin: number): void {
    pdf.setFontSize(8);
    pdf.setFont(undefined, 'italic');
    const footerText = 'Generated with StudyApp';
    const textWidth = pdf.getTextWidth(footerText);
    const xPosition = (pageWidth - textWidth) / 2;
    pdf.text(footerText, xPosition, pageHeight - 10);
  }

  async exportToDOCX(options: ExportOptions): Promise<void> {
    const { note, contentType } = options;
    const content = this.getContentByType(note, contentType);
    const contentTitle = this.getContentTitle(contentType);
    
    if (!content) {
      throw new Error(`No ${contentTitle.toLowerCase()} available to export`);
    }

    const formattedContent = this.stripHtmlAndFormat(content);
    
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
          default: new Paragraph({
            children: [],
          }),
        },
        footers: {
          default: new Paragraph({
            children: [
              new TextRun({
                text: 'Generated with StudyApp',
                size: 16,
                italics: true,
              }),
            ],
            alignment: 'center',
          }),
        },
        children: [
          new Paragraph({
            children: [
              new TextRun({
                text: note.title || 'Untitled Note',
                bold: true,
                size: 32, // 16pt
              }),
            ],
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: contentTitle,
                bold: true,
                size: 24, // 12pt
              }),
            ],
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: formattedContent,
                size: 22, // 11pt
              }),
            ],
          }),
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

  async exportToTXT(options: ExportOptions): Promise<void> {
    const { note, contentType } = options;
    const content = this.getContentByType(note, contentType);
    const contentTitle = this.getContentTitle(contentType);
    
    if (!content) {
      throw new Error(`No ${contentTitle.toLowerCase()} available to export`);
    }

    const formattedContent = this.stripHtmlAndFormat(content);
    const txtContent = [
      note.title || 'Untitled Note',
      '='.repeat((note.title || 'Untitled Note').length),
      '',
      contentTitle,
      '-'.repeat(contentTitle.length),
      '',
      formattedContent,
      '',
      '',
      'Generated with StudyApp',
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
      const response = await fetch('/api/send-note-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          to: recipientEmail,
          subject: subject || `${note.title || 'Note'} - ${contentTitle}`,
          message: message || '',
          noteTitle: note.title || 'Untitled Note',
          contentType: contentTitle,
          content: this.stripHtmlAndFormat(content),
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to send email');
      }
    } catch (error) {
      console.error('Error sending email:', error);
      throw new Error('Failed to send email. Please try again.');
    }
  }
}

export const exportService = new ExportService();
