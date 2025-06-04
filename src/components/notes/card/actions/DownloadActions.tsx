
import React from "react";
import { DropdownMenuSub, DropdownMenuSubTrigger, DropdownMenuSubContent, DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { Download, FileText, FileType } from "lucide-react";

interface DownloadActionsProps {
  noteTitle: string;
  noteContent: string;
}

export const DownloadActions = ({ noteTitle, noteContent }: DownloadActionsProps) => {
  const downloadAsText = () => {
    const blob = new Blob([noteContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${noteTitle}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const downloadAsMarkdown = () => {
    const markdownContent = `# ${noteTitle}\n\n${noteContent}`;
    const blob = new Blob([markdownContent], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${noteTitle}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <DropdownMenuSub>
      <DropdownMenuSubTrigger className="flex items-center cursor-pointer px-3 py-3 rounded-lg hover:bg-mint-50 transition-colors duration-200 group">
        <div className="flex items-center justify-center w-8 h-8 bg-green-100 rounded-lg mr-3 group-hover:bg-green-200 transition-colors duration-200">
          <Download className="h-4 w-4 text-green-600" />
        </div>
        <span className="text-sm font-medium text-gray-900">Download</span>
      </DropdownMenuSubTrigger>
      <DropdownMenuSubContent className="bg-white/95 backdrop-blur-sm border border-mint-200 shadow-lg rounded-lg p-1">
        <DropdownMenuItem 
          onClick={downloadAsText}
          className="flex items-center cursor-pointer px-3 py-2 rounded-md hover:bg-mint-50 transition-colors duration-200"
        >
          <FileText className="mr-2 h-4 w-4 text-mint-600" />
          <span className="text-sm text-gray-900">Download as TXT</span>
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={downloadAsMarkdown}
          className="flex items-center cursor-pointer px-3 py-2 rounded-md hover:bg-mint-50 transition-colors duration-200"
        >
          <FileType className="mr-2 h-4 w-4 text-mint-600" />
          <span className="text-sm text-gray-900">Download as Markdown</span>
        </DropdownMenuItem>
      </DropdownMenuSubContent>
    </DropdownMenuSub>
  );
};
