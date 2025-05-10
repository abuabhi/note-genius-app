
import { Loader2 } from "lucide-react";

export const LoadingState = ({ message = "Loading..." }: { message?: string }) => {
  return (
    <div className="container mx-auto p-6 flex items-center justify-center h-[50vh]">
      <div className="text-center">
        <Loader2 className="h-8 w-8 animate-spin mx-auto text-mint-500" />
        <p className="mt-2 text-muted-foreground">{message}</p>
      </div>
    </div>
  );
};
