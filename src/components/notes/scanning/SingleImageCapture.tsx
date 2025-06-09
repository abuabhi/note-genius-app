
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CameraCapture } from "./CameraCapture";
import { ImageUpload } from "./ImageUpload";

interface SingleImageCaptureProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onImageCaptured: (imageUrl: string) => void;
  onMultipleImages: (files: File[]) => void;
  isDragOver: boolean;
  onDragEnter: (e: React.DragEvent) => void;
  onDragOver: (e: React.DragEvent) => void;
  onDragLeave: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent) => void;
}

export const SingleImageCapture = ({
  activeTab,
  setActiveTab,
  onImageCaptured,
  onMultipleImages,
  isDragOver,
  onDragEnter,
  onDragOver,
  onDragLeave,
  onDrop
}: SingleImageCaptureProps) => {
  return (
    <div
      className={`transition-all duration-300 rounded-lg ${
        isDragOver ? 'bg-blue-50 border-2 border-blue-300 border-dashed p-2' : ''
      }`}
      onDragEnter={onDragEnter}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
    >
      <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-4">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="camera" disabled={isDragOver}>
            Camera
          </TabsTrigger>
          <TabsTrigger value="upload" className={isDragOver ? 'bg-blue-100' : ''}>
            Upload / Drop Files
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="camera" className="min-h-[300px] flex items-center justify-center">
          {!isDragOver ? (
            <CameraCapture 
              onImageCaptured={onImageCaptured}
              isActive={activeTab === "camera"}
            />
          ) : (
            <div className="text-center p-8">
              <p className="text-blue-600 font-medium">Switch to Upload tab to drop files</p>
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="upload" className="min-h-[300px] flex items-center justify-center">
          <div className="w-full">
            <ImageUpload 
              onImageUploaded={onImageCaptured} 
              onMultipleImagesUploaded={onMultipleImages}
              isDragOver={isDragOver}
              onDragEnter={onDragEnter}
              onDragOver={onDragOver}
              onDragLeave={onDragLeave}
              onDrop={onDrop}
            />
            
            <div className="mt-6 p-4 bg-gradient-to-r from-mint-50 to-blue-50 rounded-lg border border-mint-200">
              <h4 className="font-medium text-mint-700 mb-2">💡 Handwriting OCR Tips</h4>
              <ul className="text-sm text-mint-600 space-y-1">
                <li>• Use good lighting and avoid shadows</li>
                <li>• Ensure text is clearly visible and not blurry</li>
                <li>• Higher resolution images work better</li>
                <li>• OpenAI Vision (Premium) gives best handwriting results</li>
              </ul>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};
