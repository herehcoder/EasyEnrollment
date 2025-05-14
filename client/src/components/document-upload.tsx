import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Upload, X, FileText, Image, Check } from "lucide-react";

interface DocumentUploadProps {
  title: string;
  description?: string;
  required?: boolean;
  value?: string;
  onChange: (file: File) => void;
  onRemove: () => void;
}

export default function DocumentUpload({
  title,
  description,
  required = false,
  value,
  onChange,
  onRemove
}: DocumentUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  
  const handleClick = () => {
    if (inputRef.current) {
      inputRef.current.click();
    }
  };
  
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };
  
  const handleDragLeave = () => {
    setIsDragging(false);
  };
  
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      const file = files[0];
      handleFileChange(file);
    }
  };
  
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const file = files[0];
      handleFileChange(file);
    }
  };
  
  const handleFileChange = (file: File) => {
    // Validate file type
    const validTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];
    if (!validTypes.includes(file.type)) {
      alert('Formato de arquivo inválido. Por favor, use JPG, PNG ou PDF.');
      return;
    }
    
    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      alert('Arquivo muito grande. O tamanho máximo é 5MB.');
      return;
    }
    
    onChange(file);
  };
  
  const getFileIcon = () => {
    if (!value) return null;
    
    if (value.startsWith('data:image')) {
      return <Image className="h-10 w-10 text-primary" />;
    } else {
      return <FileText className="h-10 w-10 text-primary" />;
    }
  };
  
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {title} {required && <span className="text-red-500">*</span>}
      </label>
      
      {value ? (
        <div className="border rounded-lg p-4 flex items-center justify-between bg-gray-50">
          <div className="flex items-center">
            {getFileIcon()}
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-900">Arquivo enviado</p>
              <div className="flex items-center mt-1">
                <Check className="h-4 w-4 text-green-500 mr-1" />
                <span className="text-xs text-green-600">Documento anexado com sucesso</span>
              </div>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="text-red-500 hover:text-red-700 hover:bg-red-50"
            onClick={onRemove}
          >
            <X className="h-5 w-5" />
          </Button>
        </div>
      ) : (
        <div
          className={`border-2 border-dashed rounded-lg p-4 text-center transition-all cursor-pointer
            ${isDragging ? 'border-primary bg-primary/5' : 'border-gray-300 hover:border-primary'}`}
          onClick={handleClick}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <input
            type="file"
            id={`file-${title}`}
            className="hidden"
            ref={inputRef}
            onChange={handleFileSelect}
            accept="image/*,.pdf"
          />
          <Upload className="h-10 w-10 text-gray-400 mx-auto" />
          <p className="mt-2 text-sm text-gray-500">
            Clique para selecionar ou arraste o arquivo aqui
          </p>
          <p className="text-xs text-gray-400 mt-1">
            Formatos aceitos: JPG, PNG, PDF (máx 5MB)
          </p>
          {description && (
            <p className="text-xs text-gray-500 mt-2 italic">{description}</p>
          )}
        </div>
      )}
    </div>
  );
}
