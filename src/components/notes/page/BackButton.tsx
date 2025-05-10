
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface BackButtonProps {
  title?: string;
}

export const BackButton = ({ title }: BackButtonProps) => {
  const navigate = useNavigate();

  const handleGoBack = () => {
    navigate(-1);
  };

  return (
    <div className="mb-6 flex items-center justify-between">
      <Button 
        variant="outline" 
        onClick={handleGoBack} 
        className="flex items-center gap-2"
      >
        <ArrowLeft className="h-4 w-4" />
        Back
      </Button>
      {title && <h1 className="text-2xl font-bold text-mint-800">{title}</h1>}
    </div>
  );
};
