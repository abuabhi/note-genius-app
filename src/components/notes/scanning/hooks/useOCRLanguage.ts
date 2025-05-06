
import { getAvailableOCRLanguages } from "@/utils/ocrUtils";

export const useOCRLanguage = () => {
  const availableLanguages = getAvailableOCRLanguages();
  
  const getLanguageNameByCode = (code: string): string => {
    const language = availableLanguages.find(lang => lang.code === code);
    return language ? language.name : code;
  };
  
  return {
    availableLanguages,
    getLanguageNameByCode
  };
};
