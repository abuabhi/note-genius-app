
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CameraCapture } from "./CameraCapture";
import { ImageUpload } from "./ImageUpload";

interface SingleImageCaptureProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onImageCaptured: (imageUrl: string) => void;
  isDragOver: boolean;
  onDragOver: (e: React.DragEvent) => void;
  onDragLeave: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent) => void;
}

export const SingleImageCapture = ({
  activeTab,
  setActiveTab,
  onImageCaptured,
  isDragOver,
  onDragOver,
  onDragLeave,
  onDrop
}: SingleImageCaptureProps) => {
  return (
    <div
      className={`transition-all duration-200 ${isDragOver ? 'bg-purple-50 border-purple-200' : ''}`}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
    >
      <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-4">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="camera">Camera</TabsTrigger>
          <TabsTrigger value="upload">Upload / Drop</TabsTrigger>
        </TabsList>
        
        <TabsContent value="camera" className="min-h-[300px] flex items-center justify-center">
          <CameraCapture 
            onImageCaptured={onImageCaptured}
            isActive={activeTab === "camera"}
          />
        </TabsContent>
        
        <TabsContent value="upload" className="min-h-[300px] flex items-center justify-center">
          <div className="w-full">
            <div className={`transition-all duration-200 ${isDragOver ? 'border-purple-500 bg-purple-50' : ''}`}>
              <ImageUpload onImageUploaded={onImageCaptured} />
            </div>
            <p className="text-center text-sm text-gray-500 mt-4">
              💡 Tip: Drop a single image for standard processing, or multiple images for batch processing
            </p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};
