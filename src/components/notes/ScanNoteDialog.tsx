
import { useState, useRef } from "react";
import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Camera, FileText, Upload } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";

export const ScanNoteDialog = ({ onSaveNote }: { onSaveNote: (note: any) => void }) => {
  const [activeTab, setActiveTab] = useState("camera");
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [recognizedText, setRecognizedText] = useState("");
  const [noteTitle, setNoteTitle] = useState("");
  const [noteCategory, setNoteCategory] = useState("Uncategorized");
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (error) {
      toast({
        title: "Camera Error",
        description: "Unable to access camera. Please check permissions.",
        variant: "destructive",
      });
      setActiveTab("upload");
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
      tracks.forEach(track => track.stop());
    }
  };

  const captureImage = () => {
    if (videoRef.current && canvasRef.current) {
      const canvas = canvasRef.current;
      const video = videoRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      canvas.getContext('2d')?.drawImage(video, 0, 0, canvas.width, canvas.height);
      const imageUrl = canvas.toDataURL('image/png');
      setCapturedImage(imageUrl);
      stopCamera();
      processImage(imageUrl);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const imageUrl = event.target?.result as string;
        setCapturedImage(imageUrl);
        processImage(imageUrl);
      };
      reader.readAsDataURL(file);
    }
  };

  const processImage = async (imageUrl: string) => {
    setIsProcessing(true);
    
    try {
      // In a production app, we would integrate with Tesseract.js here
      // For now, we'll simulate OCR with a timeout to show the flow
      setTimeout(() => {
        // Simulate OCR result
        setRecognizedText("This is simulated recognized text from the image. In a real implementation, we would use Tesseract.js or an API like OpenAI Vision to perform OCR on the captured image.");
        setIsProcessing(false);
      }, 2000);
      
      // Real implementation would be:
      // const { createWorker } = await import('tesseract.js');
      // const worker = await createWorker();
      // await worker.loadLanguage('eng');
      // await worker.initialize('eng');
      // const { data: { text } } = await worker.recognize(imageUrl);
      // setRecognizedText(text);
      // await worker.terminate();
      // setIsProcessing(false);
    } catch (error) {
      toast({
        title: "Processing Error",
        description: "Failed to process the image. Please try again.",
        variant: "destructive",
      });
      setIsProcessing(false);
    }
  };

  const handleSaveNote = () => {
    if (!noteTitle.trim()) {
      toast({
        title: "Title Required",
        description: "Please add a title for your note.",
        variant: "destructive",
      });
      return;
    }

    const today = new Date();
    const dateString = today.toISOString().split('T')[0];

    const newNote = {
      id: Date.now().toString(),
      title: noteTitle,
      description: recognizedText.substring(0, 100) + (recognizedText.length > 100 ? "..." : ""),
      date: dateString,
      category: noteCategory,
      content: recognizedText,
      sourceType: 'scan',
      scanData: {
        originalImageUrl: capturedImage,
        recognizedText: recognizedText,
        confidence: 0.8, // Simulated confidence score
      }
    };

    onSaveNote(newNote);
    resetForm();
    setIsSheetOpen(false);
    
    toast({
      title: "Note Created",
      description: "Your handwritten note has been converted and saved.",
    });
  };

  const resetForm = () => {
    setCapturedImage(null);
    setRecognizedText("");
    setNoteTitle("");
    setNoteCategory("Uncategorized");
    setActiveTab("camera");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <Sheet open={isSheetOpen} onOpenChange={(open) => {
      setIsSheetOpen(open);
      if (open && activeTab === "camera") {
        startCamera();
      } else if (!open) {
        stopCamera();
        resetForm();
      }
    }}>
      <SheetTrigger asChild>
        <Button>
          <Camera className="mr-2 h-4 w-4" />
          Scan Note
        </Button>
      </SheetTrigger>
      <SheetContent className="w-full sm:max-w-lg md:max-w-xl overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Scan Handwritten Note</SheetTitle>
          <SheetDescription>
            Capture or upload a photo of your handwritten notes to convert them to digital text.
          </SheetDescription>
        </SheetHeader>
        
        {!capturedImage ? (
          <Tabs value={activeTab} onValueChange={(value) => {
            setActiveTab(value);
            if (value === "camera") {
              startCamera();
            } else {
              stopCamera();
            }
          }} className="mt-4">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="camera">Camera</TabsTrigger>
              <TabsTrigger value="upload">Upload</TabsTrigger>
            </TabsList>
            
            <TabsContent value="camera" className="min-h-[300px] flex items-center justify-center">
              <div className="w-full">
                <video 
                  ref={videoRef} 
                  autoPlay 
                  playsInline 
                  className="w-full rounded-md border border-input"
                  style={{ display: activeTab === "camera" ? "block" : "none" }} 
                />
                <canvas ref={canvasRef} className="hidden" />
                <Button onClick={captureImage} className="mt-4 w-full">
                  <Camera className="mr-2 h-4 w-4" />
                  Capture Image
                </Button>
              </div>
            </TabsContent>
            
            <TabsContent value="upload" className="min-h-[300px] flex items-center justify-center">
              <div className="w-full text-center">
                <Card className="border-dashed border-2 cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                  <CardContent className="p-6 flex flex-col items-center">
                    <Upload className="h-12 w-12 text-mint-600 mb-2" />
                    <p className="text-sm text-mint-700">Click to select an image or drag and drop</p>
                    <p className="text-xs text-mint-500 mt-2">Supports PNG, JPG</p>
                  </CardContent>
                </Card>
                <input
                  type="file"
                  ref={fileInputRef}
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </div>
            </TabsContent>
          </Tabs>
        ) : (
          <div className="mt-4 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium mb-2">Original Image</p>
                <img 
                  src={capturedImage} 
                  alt="Captured note" 
                  className="w-full h-auto rounded-md border border-input"
                />
                <Button 
                  variant="outline" 
                  className="mt-2 w-full"
                  onClick={() => {
                    setCapturedImage(null);
                    if (activeTab === "camera") {
                      startCamera();
                    }
                  }}
                >
                  Try Again
                </Button>
              </div>
              
              <div>
                <p className="text-sm font-medium mb-2">Extracted Text</p>
                {isProcessing ? (
                  <div className="h-full flex items-center justify-center">
                    <div className="text-center">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-mint-700 mx-auto"></div>
                      <p className="mt-4 text-sm text-mint-700">Processing your image...</p>
                    </div>
                  </div>
                ) : (
                  <Textarea 
                    value={recognizedText}
                    onChange={(e) => setRecognizedText(e.target.value)}
                    className="min-h-[200px]"
                    placeholder="Extracted text will appear here..."
                  />
                )}
              </div>
            </div>
            
            {!isProcessing && (
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Note Title</label>
                  <Input 
                    value={noteTitle}
                    onChange={(e) => setNoteTitle(e.target.value)}
                    placeholder="Enter a title for your note"
                    className="mt-1"
                  />
                </div>
                
                <div>
                  <label className="text-sm font-medium">Category</label>
                  <Input 
                    value={noteCategory}
                    onChange={(e) => setNoteCategory(e.target.value)}
                    placeholder="Category (e.g., Math, History)"
                    className="mt-1"
                  />
                </div>
              </div>
            )}
          </div>
        )}
        
        <SheetFooter className="mt-4">
          <Button
            onClick={handleSaveNote}
            disabled={isProcessing || !capturedImage || !recognizedText}
          >
            <FileText className="mr-2 h-4 w-4" />
            Save Note
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
};
