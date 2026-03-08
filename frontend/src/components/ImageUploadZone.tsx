import { useState, useCallback } from "react";
import { motion } from "framer-motion";
import { Upload, Image as ImageIcon, X } from "lucide-react";

interface ImageUploadZoneProps {
  onFileSelect: (file: File) => void;
  acceptedFormats?: string;
}

const ImageUploadZone = ({ onFileSelect, acceptedFormats = ".bmp,.jpg,.jpeg,.png" }: ImageUploadZoneProps) => {
  const [preview, setPreview] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);

  const handleFile = useCallback((file: File) => {
    onFileSelect(file);
    const reader = new FileReader();
    reader.onload = (e) => setPreview(e.target?.result as string);
    reader.readAsDataURL(file);
  }, [onFileSelect]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }, [handleFile]);

  const clearPreview = () => setPreview(null);

  return (
    <div
      onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
      onDragLeave={() => setDragging(false)}
      onDrop={handleDrop}
      className={`upload-zone ${dragging ? "dragging" : ""}`}
    >
      {preview ? (
        <div className="relative inline-block">
          <img src={preview} alt="Preview" className="max-h-48 rounded-xl mx-auto" />
          <button
            onClick={clearPreview}
            className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center text-xs"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center gap-3"
        >
          <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center">
            <Upload className="w-6 h-6 text-primary" />
          </div>
          <div>
            <p className="text-sm font-medium text-foreground mb-1">
              Drag & drop your image here
            </p>
            <p className="text-xs text-muted-foreground">
              or click to browse · Accepts {acceptedFormats}
            </p>
          </div>
          <label className="cursor-pointer px-4 py-2 rounded-lg bg-primary/10 text-primary text-sm font-medium hover:bg-primary/15 transition-colors">
            Browse Files
            <input
              type="file"
              accept={acceptedFormats}
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleFile(file);
              }}
            />
          </label>
        </motion.div>
      )}
    </div>
  );
};

export default ImageUploadZone;
