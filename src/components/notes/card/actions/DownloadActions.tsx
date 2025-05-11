
import React from "react";
import { Download, File, FileText } from "lucide-react";
import { toast } from "sonner";
import jsPDF from "jspdf";
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
