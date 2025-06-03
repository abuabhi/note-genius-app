
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
} from '@/components/ui/dropdown-menu';
import { Download, ChevronDown, FileText, Target, List, Sparkles, Code, Mail, FileDown } from 'lucide-react';
import { Note } from '@/types/note';
import { exportService, ContentType, ExportFormat } from '../export/ExportService';
import { EmailDialog } from '../export/EmailDialog';
import { toast } from 'sonner';

interface StudyViewExportDropdownProps {
  note: Note;
}

interface ContentOption {
  type: ContentType;
  label: string;
  icon: React.ElementType;
  available: boolean;
}

export const StudyViewExportDropdown = ({ note }: StudyViewExportDropdownProps) => {
  const [emailDialog, setEmailDialog] = useState<{ open: boolean; contentType: ContentType | null }>({
    open: false,
    contentType: null
  });

  const contentOptions: ContentOption[] = [
    {
      type: 'original',
      label: 'Original Content',
      icon: FileText,
      available: Boolean(note.content || note.description)
    },
    {
      type: 'summary',
      label: 'Summary',
      icon: Target,
      available: Boolean(note.summary)
    },
    {
      type: 'keyPoints',
      label: 'Key Points',
      icon: List,
      available: Boolean(note.key_points)
    },
    {
      type: 'improved',
      label: 'Improved Content',
      icon: Sparkles,
      available: Boolean(note.improved_content)
    },
    {
      type: 'markdown',
      label: 'Original++',
      icon: Code,
      available: Boolean(note.markdown_content)
    }
  ];

  const availableContent = contentOptions.filter(option => option.available);

  const handleExport = async (contentType: ContentType, format: ExportFormat) => {
    try {
      await exportService.export({
        format,
        contentType,
        note,
        fontSize: 12
      });
      toast.success(`${format.toUpperCase()} exported successfully!`);
    } catch (error) {
      console.error('Export error:', error);
      toast.error(error instanceof Error ? error.message : 'Export failed');
    }
  };

  const handleEmailClick = (contentType: ContentType) => {
    setEmailDialog({ open: true, contentType });
  };

  const closeEmailDialog = () => {
    setEmailDialog({ open: false, contentType: null });
  };

  if (availableContent.length === 0) {
    return (
      <Button variant="outline" size="sm" disabled>
        <Download className="mr-2 h-4 w-4 text-gray-400" />
        No Content Available
      </Button>
    );
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className="bg-mint-50 border-mint-200 text-mint-700 hover:bg-mint-100 hover:text-mint-800">
            <Download className="mr-2 h-4 w-4 text-mint-600" />
            Export
            <ChevronDown className="ml-2 h-4 w-4 text-mint-600" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent 
          align="end" 
          className="w-72 bg-white border border-gray-200 shadow-lg rounded-md z-50"
        >
          {availableContent.map((content, index) => {
            const Icon = content.icon;
            return (
              <div key={content.type}>
                <DropdownMenuSub>
                  <DropdownMenuSubTrigger className="flex items-start px-4 py-3 text-sm cursor-pointer hover:bg-mint-50 focus:bg-mint-50">
                    <Icon className="mr-3 h-4 w-4 text-mint-600 mt-0.5 flex-shrink-0" />
                    <div className="flex flex-col">
                      <span className="font-medium text-gray-900">{content.label}</span>
                      <span className="text-xs text-gray-500">Download or email this content</span>
                    </div>
                  </DropdownMenuSubTrigger>
                  <DropdownMenuSubContent className="w-48 bg-white border border-gray-200 shadow-lg rounded-md">
                    <DropdownMenuItem 
                      onClick={() => handleExport(content.type, 'pdf')}
                      className="flex items-center px-3 py-2 text-sm cursor-pointer hover:bg-gray-50"
                    >
                      <FileDown className="mr-2 h-4 w-4 text-mint-600" />
                      Download PDF
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={() => handleExport(content.type, 'docx')}
                      className="flex items-center px-3 py-2 text-sm cursor-pointer hover:bg-gray-50"
                    >
                      <FileDown className="mr-2 h-4 w-4 text-mint-600" />
                      Download DOCX
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={() => handleExport(content.type, 'txt')}
                      className="flex items-center px-3 py-2 text-sm cursor-pointer hover:bg-gray-50"
                    >
                      <FileDown className="mr-2 h-4 w-4 text-mint-600" />
                      Download TXT
                    </DropdownMenuItem>
                    <DropdownMenuSeparator className="my-1 border-t border-gray-100" />
                    <DropdownMenuItem 
                      onClick={() => handleEmailClick(content.type)}
                      className="flex items-center px-3 py-2 text-sm cursor-pointer hover:bg-gray-50"
                    >
                      <Mail className="mr-2 h-4 w-4 text-mint-600" />
                      Send via Email
                    </DropdownMenuItem>
                  </DropdownMenuSubContent>
                </DropdownMenuSub>
                {index < availableContent.length - 1 && (
                  <DropdownMenuSeparator className="my-1 border-t border-gray-100" />
                )}
              </div>
            );
          })}
        </DropdownMenuContent>
      </DropdownMenu>

      {emailDialog.contentType && (
        <EmailDialog
          isOpen={emailDialog.open}
          onClose={closeEmailDialog}
          note={note}
          contentType={emailDialog.contentType}
        />
      )}
    </>
  );
};
