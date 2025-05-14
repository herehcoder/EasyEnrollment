import { useState } from "react";
import { Document } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { formatDateTime, createFileFromBase64 } from "@/lib/utils";
import { Download, ExternalLink, FileText, Image } from "lucide-react";

interface DocumentPreviewProps {
  document: Document;
}

export default function DocumentPreview({ document }: DocumentPreviewProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
  const isImage = document.mimeType.startsWith('image/');
  
  const handleDownload = () => {
    try {
      // Create file from base64
      const file = createFileFromBase64(
        document.fileData,
        document.fileName,
        document.mimeType
      );
      
      // Create download link
      const downloadUrl = URL.createObjectURL(file);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = document.fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Clean up
      URL.revokeObjectURL(downloadUrl);
    } catch (error) {
      console.error('Error downloading file:', error);
      alert('Erro ao baixar o arquivo. Tente novamente.');
    }
  };
  
  const handleOpenPreview = () => {
    setIsDialogOpen(true);
  };
  
  return (
    <>
      <div className="document-preview bg-gray-50 border border-gray-200 rounded-lg overflow-hidden shadow-sm">
        <div className="p-3 bg-gray-100 border-b border-gray-200 flex justify-between items-center">
          <span className="font-medium text-sm text-gray-700">{document.type}</span>
          <div className="flex">
            <Button
              variant="ghost"
              size="sm"
              className="text-gray-500 hover:text-gray-700 mr-1"
              onClick={handleDownload}
            >
              <Download className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="text-gray-500 hover:text-gray-700"
              onClick={handleOpenPreview}
            >
              <ExternalLink className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        {/* Document preview */}
        <div 
          className="h-32 w-full relative cursor-pointer"
          onClick={handleOpenPreview}
        >
          {isImage ? (
            <img 
              src={document.fileData} 
              alt={document.type} 
              className="w-full h-32 object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gray-50">
              <FileText className="h-16 w-16 text-gray-300" />
            </div>
          )}
        </div>
        
        <div className="p-3">
          <p className="text-xs text-gray-500">
            Enviado em: {formatDateTime(document.uploadDate)}
          </p>
        </div>
      </div>
      
      {/* Full-screen preview dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh]">
          <div className="flex flex-col items-center">
            <h3 className="text-lg font-medium mb-4">{document.type}</h3>
            
            <div className="overflow-hidden max-h-[70vh] w-full flex items-center justify-center">
              {isImage ? (
                <img 
                  src={document.fileData} 
                  alt={document.type} 
                  className="max-w-full max-h-[70vh] object-contain"
                />
              ) : (
                <div className="p-8 text-center">
                  <FileText className="h-24 w-24 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">
                    O documento não pode ser visualizado. Clique em baixar para ver o conteúdo.
                  </p>
                </div>
              )}
            </div>
            
            <div className="mt-4 w-full flex justify-between items-center">
              <p className="text-sm text-gray-500">
                Enviado em: {formatDateTime(document.uploadDate)}
              </p>
              <Button
                variant="outline"
                className="flex items-center"
                onClick={handleDownload}
              >
                <Download className="h-4 w-4 mr-2" />
                Baixar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
