
import { ExternalLink } from 'lucide-react';

interface AttachmentProps {
  scanPreviewUrl?: string | null;
  importPreviewUrl?: string | null;
  confidence?: number;
  fileType?: string;
  importedAt?: string;
}

export const NoteAttachments = ({
  scanPreviewUrl,
  importPreviewUrl,
  confidence,
  fileType,
  importedAt
}: AttachmentProps) => {
  return (
    <>
      {scanPreviewUrl && (
        <div className="space-y-2">
          <h3 className="text-md font-medium">Scanned Image</h3>
          <div className="relative rounded-md overflow-hidden border border-mint-100">
            <img 
              src={scanPreviewUrl} 
              alt="Scanned note" 
              className="w-full h-auto max-h-[300px] object-contain"
            />
            <a 
              href={scanPreviewUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="absolute top-2 right-2 bg-background/70 p-1 rounded-md"
              title="Open original"
            >
              <ExternalLink className="h-4 w-4" />
            </a>
          </div>
          {confidence !== undefined && (
            <p className="text-xs text-muted-foreground">
              OCR Confidence: {Math.round(confidence * 100)}%
            </p>
          )}
        </div>
      )}

      {importPreviewUrl && (
        <div className="space-y-2">
          <h3 className="text-md font-medium">Imported File</h3>
          <div className="flex items-center gap-2 p-3 border border-mint-100 rounded-md">
            <a 
              href={importPreviewUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-mint-600 flex items-center gap-1"
            >
              {fileType?.toUpperCase()} File <ExternalLink className="h-3 w-3" />
            </a>
            {importedAt && (
              <span className="text-xs text-muted-foreground ml-auto">
                Imported on {new Date(importedAt).toLocaleDateString()}
              </span>
            )}
          </div>
        </div>
      )}
    </>
  );
};
