import { useState, useCallback } from "react";
import { Camera, Image as ImageIcon, Scan, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface ImageDropzoneProps {
  onImageSelect: (file: File) => void;
  className?: string;
}

export function ImageDropzone({ 
  onImageSelect, 
  className,
}: ImageDropzoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDragIn = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
      setIsDragging(true);
    }
  }, []);

  const handleDragOut = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      if (file.type.startsWith("image/")) {
        setPreview(URL.createObjectURL(file));
        onImageSelect(file);
      }
    }
  }, [onImageSelect]);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      setPreview(URL.createObjectURL(file));
      onImageSelect(file);
    }
  }, [onImageSelect]);

  const handleCameraClick = useCallback(() => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.capture = "environment";
    input.onchange = (e) => {
      const target = e.target as HTMLInputElement;
      if (target.files && target.files.length > 0) {
        const file = target.files[0];
        setPreview(URL.createObjectURL(file));
        onImageSelect(file);
      }
    };
    input.click();
  }, [onImageSelect]);

  const clearPreview = () => {
    setPreview(null);
  };

  return (
    <div className={cn("space-y-4", className)}>
      {/* Preview with phone mockup style */}
      <div
        onDragEnter={handleDragIn}
        onDragLeave={handleDragOut}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        className={cn(
          "relative rounded-[2rem] overflow-hidden transition-all duration-300 bg-chef-dark",
          isDragging ? "scale-[1.02] ring-4 ring-chef-accent/30" : "",
          preview ? "aspect-[3/4]" : "aspect-[3/4]"
        )}
      >
        {preview ? (
          <div className="relative w-full h-full">
            <img 
              src={preview} 
              alt="Preview" 
              className="w-full h-full object-cover"
            />
            {/* Overlay controls */}
            <div className="absolute top-4 left-4 right-4 flex justify-between items-center">
              <button
                onClick={clearPreview}
                className="w-10 h-10 rounded-full bg-foreground/30 backdrop-blur-sm flex items-center justify-center text-white hover:bg-foreground/50 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
              <div className="px-4 py-2 rounded-full bg-white/90 backdrop-blur-sm flex items-center gap-2">
                <div className="w-5 h-5 rounded-full bg-chef-dark flex items-center justify-center">
                  <span className="text-white text-xs">🍳</span>
                </div>
                <span className="font-semibold text-chef-dark text-sm">Chef AI</span>
              </div>
              <button className="w-10 h-10 rounded-full bg-foreground/30 backdrop-blur-sm flex items-center justify-center text-white">
                <span className="text-lg">?</span>
              </button>
            </div>
            
            {/* Scan ring animation */}
            <div className="absolute inset-8 rounded-full border-4 border-white/50 scan-ring pointer-events-none" />
          </div>
        ) : (
          <label className="flex flex-col items-center justify-center w-full h-full cursor-pointer p-8">
            <div className="relative mb-6">
              <div className="w-24 h-24 rounded-full border-4 border-white/30 flex items-center justify-center">
                <div className="w-16 h-16 rounded-full bg-white/10 flex items-center justify-center">
                  <ImageIcon className="w-8 h-8 text-white/70" />
                </div>
              </div>
              <div className="absolute -inset-4 rounded-full border-2 border-dashed border-white/20 animate-pulse" />
            </div>
            <p className="text-lg font-medium text-white mb-1">Tire uma foto</p>
            <p className="text-sm text-white/60 text-center">
              Ou arraste uma imagem aqui
            </p>
            <input
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              className="hidden"
            />
          </label>
        )}
      </div>

      {/* Action buttons */}
      <div className="grid grid-cols-4 gap-2">
        <label className="flex flex-col items-center gap-1.5 py-3 px-2 rounded-xl cursor-pointer transition-all bg-card shadow-card border border-border">
          <div className="w-6 h-6 flex items-center justify-center">
            <Scan className="w-5 h-5" />
          </div>
          <span className="text-[10px] font-medium">Scan Food</span>
          <input type="file" accept="image/*" onChange={handleFileSelect} className="hidden" />
        </label>
        <div className="flex flex-col items-center gap-1.5 py-3 px-2 rounded-xl text-muted-foreground hover:bg-muted transition-all">
          <div className="w-6 h-6 flex items-center justify-center text-lg">|||</div>
          <span className="text-[10px] font-medium">Barcode</span>
        </div>
        <div className="flex flex-col items-center gap-1.5 py-3 px-2 rounded-xl text-muted-foreground hover:bg-muted transition-all">
          <div className="w-6 h-6 flex items-center justify-center text-xs">📋</div>
          <span className="text-[10px] font-medium">Food Label</span>
        </div>
        <div className="flex flex-col items-center gap-1.5 py-3 px-2 rounded-xl text-muted-foreground hover:bg-muted transition-all">
          <div className="w-6 h-6 flex items-center justify-center">
            <ImageIcon className="w-5 h-5" />
          </div>
          <span className="text-[10px] font-medium">Library</span>
        </div>
      </div>

      {/* Camera button */}
      <div className="flex items-center justify-center gap-4 pt-2">
        <button className="w-12 h-12 rounded-full bg-muted flex items-center justify-center text-muted-foreground">
          <span className="text-xl">✨</span>
        </button>
        <button 
          onClick={handleCameraClick}
          className="w-16 h-16 rounded-full bg-chef-dark shadow-button flex items-center justify-center hover:scale-105 transition-transform"
        >
          <div className="w-12 h-12 rounded-full border-2 border-white/30" />
        </button>
        <div className="w-12 h-12" />
      </div>
    </div>
  );
}
