
import React from "react";
import { Download, File, FileText, FileType } from "lucide-react";
import { toast } from "sonner";
import jsPDF from "jspdf";
import { Document, Packer, Paragraph, TextRun, HeadingLevel } from "docx";
import {
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuItem
} from "@/components/ui/dropdown-menu";

interface DownloadActionsProps {
  noteTitle: string;
  noteContent: string;
}

export const DownloadActions = ({ noteTitle, noteContent }: DownloadActionsProps) => {
  const handleDownloadAsPDF = (e: React.MouseEvent) => {
    e.stopPropagation();
    
    try {
      toast.loading("Generating PDF...");
      
      const doc = new jsPDF();
      
      // Add title
      doc.setFontSize(18);
      doc.text(noteTitle, 20, 20);
      
      // Add content with word wrap
      doc.setFontSize(12);
      const splitText = doc.splitTextToSize(noteContent, 170);
      doc.text(splitText, 20, 30);
      
      // Save the PDF
      doc.save(`${noteTitle.replace(/\s+/g, '-').toLowerCase()}.pdf`);
      
      toast.dismiss();
      toast.success("PDF downloaded successfully");
    } catch (error) {
      console.error("Error generating PDF:", error);
      toast.dismiss();
      toast.error("Failed to generate PDF");
    }
  };

  const handleDownloadAsDocx = (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      toast.loading("Generating DOCX...");
      
      // Create document
      const doc = new Document({
        sections: [
          {
            properties: {},
            children: [
              // Title with heading style
              new Paragraph({
                text: noteTitle,
                heading: HeadingLevel.HEADING_1,
                spacing: {
                  after: 200,
                },
              }),
              
              // Format the content like in study mode
              // Split the content by paragraphs and create styled paragraphs
              ...noteContent.split('\n').map(paragraph => 
                new Paragraph({
                  children: [
                    new TextRun({
                      text: paragraph,
                      size: 24, // Similar to the study mode font size
                    }),
                  ],
                  spacing: {
                    after: 120,
                  },
                })
              ),
            ],
          },
        ],
      });
      
      // Generate and save the document
      Packer.toBlob(doc).then(blob => {
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${noteTitle.replace(/\s+/g, '-').toLowerCase()}.docx`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        toast.dismiss();
        toast.success("DOCX downloaded successfully");
      });
      
    } catch (error) {
      console.error("Error generating DOCX:", error);
      toast.dismiss();
      toast.error("Failed to generate DOCX");
    }
  };

  const handleDownloadAsMarkdown = (e: React.MouseEvent) => {
    e.stopPropagation();
    // Create a text file with the note content
    const element = document.createElement("a");
    const file = new Blob([`# ${noteTitle}\n\n${noteContent}`], {type: 'text/markdown'});
    element.href = URL.createObjectURL(file);
    element.download = `${noteTitle.replace(/\s+/g, '-').toLowerCase()}.md`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    toast.success("Markdown file downloaded successfully");
  };

  return (
    <DropdownMenuSub>
      <DropdownMenuSubTrigger className="flex items-center cursor-pointer">
        <Download className="mr-2 h-4 w-4" />
        <span>Download</span>
      </DropdownMenuSubTrigger>
      <DropdownMenuSubContent className="bg-white">
        <DropdownMenuItem onClick={handleDownloadAsDocx} className="cursor-pointer">
          <FileType className="mr-2 h-4 w-4" />
          <span>Word Document (.docx)</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleDownloadAsPDF} className="cursor-pointer">
          <File className="mr-2 h-4 w-4" />
          <span>PDF Document</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleDownloadAsMarkdown} className="cursor-pointer">
          <FileText className="mr-2 h-4 w-4" />
          <span>Markdown File</span>
        </DropdownMenuItem>
      </DropdownMenuSubContent>
    </DropdownMenuSub>
  );
};
