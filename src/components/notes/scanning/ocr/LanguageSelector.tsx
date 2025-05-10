
import { Globe } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface LanguageSelectorProps {
  selectedLanguage: string;
  onLanguageChange: (language: string) => void;
  availableLanguages: { code: string; name: string }[];
  isProcessing: boolean;
}

export const LanguageSelector: React.FC<LanguageSelectorProps> = ({
  selectedLanguage,
  onLanguageChange,
  availableLanguages,
  isProcessing
}) => {
  return (
    <div className="flex items-center">
      <Globe className="h-4 w-4 mr-1 text-muted-foreground" />
      
      <Select value={selectedLanguage} onValueChange={onLanguageChange} disabled={isProcessing}>
        <SelectTrigger className="w-[130px]">
          <SelectValue placeholder="Language" />
        </SelectTrigger>
        <SelectContent>
          {availableLanguages.map(language => (
            <SelectItem key={language.code} value={language.code}>
              {language.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};
