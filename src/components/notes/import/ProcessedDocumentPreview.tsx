
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";

interface ProcessedDocumentPreviewProps {
  text: string;
  title: string;
  setTitle: (title: string) => void;
}

export const ProcessedDocumentPreview = ({ 
  text, 
  title, 
  setTitle 
}: ProcessedDocumentPreviewProps) => {
  return (
    <div className="space-y-4 mt-4">
      <div>
        <Label htmlFor="document-title">Document Title</Label>
        <Input
          id="document-title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Enter document title"
        />
      </div>
      
      <div>
        <Label>Document Content</Label>
        <Card>
          <CardContent className="p-4">
            <ScrollArea className="h-[300px] w-full">
              <div className="whitespace-pre-wrap">
                {text}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
