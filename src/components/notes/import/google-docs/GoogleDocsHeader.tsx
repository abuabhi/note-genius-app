
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Check, X, User, LogOut, ChevronDown, ArrowLeft, FileText } from "lucide-react";

interface GoogleDocsHeaderProps {
  isAuthenticated: boolean;
  userName: string | null;
  onBack: () => void;
  onDisconnect: () => void;
}

export const GoogleDocsHeader = ({ isAuthenticated, userName, onBack, onDisconnect }: GoogleDocsHeaderProps) => {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" onClick={onBack} className="p-2">
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex items-center gap-2">
          <div className="p-2 bg-blue-100 rounded-lg">
            <FileText className="h-5 w-5 text-blue-600" />
          </div>
          <div>
            <h3 className="font-semibold">Google Docs Import</h3>
            <p className="text-sm text-muted-foreground">
              Select and import your Google Docs
            </p>
          </div>
        </div>
      </div>
      
      {/* Connection Status & User Menu */}
      {isAuthenticated ? (
        <div className="flex items-center gap-2">
          <Badge className="bg-green-500 hover:bg-green-600">
            <Check className="h-3 w-3 mr-1" /> Connected
          </Badge>
          {userName && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="px-3">
                  <User className="h-3 w-3 mr-1" />
                  {userName.split(' ')[0]}
                  <ChevronDown className="h-3 w-3 ml-1" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <div className="px-3 py-2 text-sm border-b">
                  <p className="font-medium">{userName}</p>
                </div>
                <DropdownMenuItem onClick={onDisconnect}>
                  <LogOut className="h-4 w-4 mr-2" />
                  Switch Account
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      ) : (
        <Badge className="bg-gray-400 hover:bg-gray-500">
          <X className="h-3 w-3 mr-1" /> Not Connected
        </Badge>
      )}
    </div>
  );
};
