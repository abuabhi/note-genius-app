
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

interface ErrorStateProps {
  title?: string;
  message?: string;
  buttonText?: string;
}

export const ErrorState = ({ 
  title = "Note Not Found", 
  message = "The note you're looking for doesn't exist or has been deleted.",
  buttonText = "Back to Notes"
}: ErrorStateProps) => {
  const navigate = useNavigate();
  
  const handleGoBack = () => {
    navigate(-1);
  };

  return (
    <div className="container mx-auto p-6">
      <div className="bg-red-50 border border-red-200 rounded-md p-6 text-center">
        <h2 className="text-xl font-semibold text-red-700 mb-2">{title}</h2>
        <p className="mb-4 text-red-600">{message}</p>
        <Button onClick={handleGoBack}>
          {buttonText}
        </Button>
      </div>
    </div>
  );
};
