
import React from "react";
import { DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { Mail } from "lucide-react";

interface EmailActionProps {
  noteTitle: string;
  noteContent: string;
}

export const EmailAction = ({ noteTitle, noteContent }: EmailActionProps) => {
  const handleEmail = (e: React.MouseEvent) => {
    e.stopPropagation();
    const subject = encodeURIComponent(`Note: ${noteTitle}`);
    const body = encodeURIComponent(noteContent);
    const mailtoLink = `mailto:?subject=${subject}&body=${body}`;
    window.open(mailtoLink);
  };

  return (
    <DropdownMenuItem 
      onClick={handleEmail}
      className="flex items-center cursor-pointer px-3 py-3 rounded-lg hover:bg-mint-50 transition-colors duration-200 group"
    >
      <div className="flex items-center justify-center w-8 h-8 bg-blue-100 rounded-lg mr-3 group-hover:bg-blue-200 transition-colors duration-200">
        <Mail className="h-4 w-4 text-blue-600" />
      </div>
      <span className="text-sm font-medium text-gray-900">Send via Email</span>
    </DropdownMenuItem>
  );
};
