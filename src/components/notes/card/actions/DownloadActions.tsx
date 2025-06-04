
import React from "react";
import { DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { Download, FileText, FileType } from "lucide-react";
import { toast } from "sonner";

interface DownloadActionsProps {
  noteTitle: string;
  noteContent: string;
}

export const DownloadActions = ({ noteTitle, noteContent }: DownloadActionsProps) => {
  const downloadAsText = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    
    console.log("Download as TXT triggered", { noteTitle, contentLength: noteContent?.length || 0 });
    
    try {
      const content = noteContent || 'No content available';
      const blob = new Blob([content], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${noteTitle || 'note'}.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      toast.success("Note downloaded as TXT file");
      console.log("TXT download completed successfully");
    } catch (error) {
      console.error("TXT download failed:", error);
      toast.error("Failed to download note as TXT");
    }
  };

  const downloadAsMarkdown = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    
    console.log("Download as Markdown triggered", { noteTitle, contentLength: noteContent?.length || 0 });
    
    try {
      const content = noteContent || 'No content available';
      const markdownContent = `# ${noteTitle || 'Untitled Note'}\n\n${content}`;
      const blob = new Blob([markdownContent], { type: 'text/markdown' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${noteTitle || 'note'}.md`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      toast.success("Note downloaded as Markdown file");
      console.log("Markdown download completed successfully");
    } catch (error) {
      console.error("Markdown download failed:", error);
      toast.error("Failed to download note as Markdown");
    }
  };

  return (
    <>
      <DropdownMenuItem 
        onClick={downloadAsText}
        className="flex items-center cursor-pointer px-3 py-3 rounded-lg hover:bg-mint-50 transition-colors duration-200 group"
      >
        <div className="flex items-center justify-center w-8 h-8 bg-green-100 rounded-lg mr-3 group-hover:bg-green-200 transition-colors duration-200">
          <FileText className="h-4 w-4 text-green-600" />
        </div>
        <span className="text-sm font-medium text-gray-900">Download as TXT</span>
      </DropdownMenuItem>
      
      <DropdownMenuItem 
        onClick={downloadAsMarkdown}
        className="flex items-center cursor-pointer px-3 py-3 rounded-lg hover:bg-mint-50 transition-colors duration-200 group"
      >
        <div className="flex items-center justify-center w-8 h-8 bg-green-100 rounded-lg mr-3 group-hover:bg-green-200 transition-colors duration-200">
          <FileType className="h-4 w-4 text-green-600" />
        </div>
        <span className="text-sm font-medium text-gray-900">Download as Markdown</span>
      </DropdownMenuItem>
    </>
  );
};
