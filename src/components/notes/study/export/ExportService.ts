
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

  private stripMarkdown(content: string): string {
    return content
      .replace(/#{1,6}\s+/g, '') // Remove headers
      .replace(/\*\*(.*?)\*\*/g, '$1') // Remove bold
      .replace(/\*(.*?)\*/g, '$1') // Remove italic
      .replace(/`(.*?)`/g, '$1') // Remove code
      .replace(/\[(.*?)\]\(.*?\)/g, '$1') // Remove links
      .replace(/^\s*[-*+]\s+/gm, '• ') // Convert lists
      .replace(/^\s*\d+\.\s+/gm, '1. ') // Convert numbered lists
      .trim();
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
    const margin = 20;
    const maxLineWidth = pageWidth - (margin * 2);
    
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
    const strippedContent = this.stripMarkdown(content);
    const lines = pdf.splitTextToSize(strippedContent, maxLineWidth);
    
    let yPosition = 60;
    lines.forEach((line: string) => {
      if (yPosition > pdf.internal.pageSize.height - margin) {
        pdf.addPage();
        yPosition = margin;
      }
      pdf.text(line, margin, yPosition);
      yPosition += fontSize * 0.6;
    });
    
    // Metadata
    const currentDate = new Date().toLocaleDateString();
    pdf.setFontSize(8);
    pdf.text(`Exported on ${currentDate}`, margin, pdf.internal.pageSize.height - 10);
    
    pdf.save(`${note.title || 'note'}-${contentType}.pdf`);
  }

  async exportToDOCX(options: ExportOptions): Promise<void> {
    const { note, contentType } = options;
    const content = this.getContentByType(note, contentType);
    const contentTitle = this.getContentTitle(contentType);
    
    if (!content) {
      throw new Error(`No ${contentTitle.toLowerCase()} available to export`);
    }

    const strippedContent = this.stripMarkdown(content);
    
    const doc = new Document({
      sections: [{
        properties: {},
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
                text: strippedContent,
                size: 22, // 11pt
              }),
            ],
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: `Exported on ${new Date().toLocaleDateString()}`,
                size: 16, // 8pt
                italics: true,
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

    const strippedContent = this.stripMarkdown(content);
    const txtContent = [
      note.title || 'Untitled Note',
      '='.repeat((note.title || 'Untitled Note').length),
      '',
      contentTitle,
      '-'.repeat(contentTitle.length),
      '',
      strippedContent,
      '',
      `Exported on ${new Date().toLocaleDateString()}`,
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
          content: this.stripMarkdown(content),
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
