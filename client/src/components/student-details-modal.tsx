import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { Student, Document } from "@shared/schema";
import { 
  Download, 
  Edit, 
  File, 
  FileText, 
  Trash, 
  ExternalLink, 
  MessageSquare,
  Printer,
  Share2
} from "lucide-react";
import { formatDateTime } from "@/lib/utils";
import DocumentPreview from "@/components/document-preview";
import { openWhatsApp } from "@/lib/utils";

interface StudentDetailsModalProps {
  student: Student;
  onClose: () => void;
}

export default function StudentDetailsModal({ student, onClose }: StudentDetailsModalProps) {
  const [isOpen, setIsOpen] = useState(true);
  const [tab, setTab] = useState("info");
  
  // Fetch student documents
  const { data: documents, isLoading } = useQuery({
    queryKey: [`/api/students/${student.id}/documents`],
    staleTime: 60000,
  });
  
  const handleClose = () => {
    setIsOpen(false);
    onClose();
  };
  
  const handlePrintSheet = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;
    
    // Create print document
    const printContent = `
      <html>
        <head>
          <title>Ficha de Matrícula - ${student.fullName}</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; }
            h1 { text-align: center; color: #128C7E; }
            .section { margin-bottom: 20px; }
            .section-title { background-color: #128C7E; color: white; padding: 5px 10px; }
            .info-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px; }
            .info-item { margin-bottom: 5px; }
            .label { font-weight: bold; }
            @media print {
              body { padding: 0; }
              button { display: none; }
            }
          </style>
        </head>
        <body>
          <h1>Ficha de Matrícula</h1>
          
          <div class="section">
            <h2 class="section-title">Informações Pessoais</h2>
            <div class="info-grid">
              <div class="info-item"><span class="label">Nome Completo:</span> ${student.fullName}</div>
              <div class="info-item"><span class="label">CPF:</span> ${student.cpf}</div>
              <div class="info-item"><span class="label">RG:</span> ${student.rg || '-'}</div>
              <div class="info-item"><span class="label">Data de Nascimento:</span> ${student.birthDate}</div>
              <div class="info-item"><span class="label">Gênero:</span> ${student.gender || '-'}</div>
            </div>
          </div>
          
          <div class="section">
            <h2 class="section-title">Endereço</h2>
            <div class="info-grid">
              <div class="info-item"><span class="label">Endereço:</span> ${student.address}</div>
              <div class="info-item"><span class="label">Cidade:</span> ${student.city}</div>
              <div class="info-item"><span class="label">Estado:</span> ${student.state}</div>
              <div class="info-item"><span class="label">CEP:</span> ${student.zipCode}</div>
            </div>
          </div>
          
          <div class="section">
            <h2 class="section-title">Contato</h2>
            <div class="info-grid">
              <div class="info-item"><span class="label">Email:</span> ${student.email}</div>
              <div class="info-item"><span class="label">Telefone:</span> ${student.phone}</div>
              <div class="info-item"><span class="label">WhatsApp:</span> ${student.whatsapp || '-'}</div>
              <div class="info-item"><span class="label">Contato de Emergência:</span> ${student.emergencyContact || '-'}</div>
              <div class="info-item"><span class="label">Telefone de Emergência:</span> ${student.emergencyPhone || '-'}</div>
            </div>
          </div>
          
          <div class="section">
            <h2 class="section-title">Informações do Curso</h2>
            <div class="info-grid">
              <div class="info-item"><span class="label">Curso:</span> ${student.course}</div>
              <div class="info-item"><span class="label">Turno:</span> ${student.shift}</div>
              <div class="info-item"><span class="label">Modalidade:</span> ${student.modality}</div>
              <div class="info-item"><span class="label">Data da Matrícula:</span> ${formatDateTime(student.registrationDate)}</div>
              <div class="info-item"><span class="label">Status:</span> ${student.status === 'complete' ? 'Completa' : 'Pendente'}</div>
            </div>
          </div>
          
          <div class="section">
            <h2 class="section-title">Informações Adicionais</h2>
            <p>${student.additionalInfo || 'Nenhuma informação adicional fornecida.'}</p>
          </div>
          
          <div style="margin-top: 40px; text-align: center;">
            <p>________________________________</p>
            <p>Assinatura do Aluno</p>
          </div>
          
          <button onclick="window.print()" style="display: block; margin: 20px auto; padding: 10px 20px; background: #128C7E; color: white; border: none; border-radius: 4px; cursor: pointer;">
            Imprimir
          </button>
        </body>
      </html>
    `;
    
    printWindow.document.open();
    printWindow.document.write(printContent);
    printWindow.document.close();
  };
  
  const handleShareWhatsApp = () => {
    const studentInfo = `
*FICHA DE MATRÍCULA*
*Nome:* ${student.fullName}
*CPF:* ${student.cpf}
*Email:* ${student.email}
*Telefone:* ${student.phone}

*Curso:* ${student.course}
*Turno:* ${student.shift}
*Modalidade:* ${student.modality}

*Data da Matrícula:* ${formatDateTime(student.registrationDate)}
*Status:* ${student.status === 'complete' ? 'Completa' : 'Pendente'}

_Informações detalhadas disponíveis no sistema_
    `;
    
    openWhatsApp(studentInfo);
  };
  
  // Human-readable course name mapping
  const courseNames: Record<string, string> = {
    'administracao': 'Administração',
    'engenharia': 'Engenharia',
    'medicina': 'Medicina',
    'direito': 'Direito',
    'computacao': 'Ciência da Computação'
  };
  
  // Human-readable shift name mapping
  const shiftNames: Record<string, string> = {
    'manha': 'Manhã',
    'tarde': 'Tarde',
    'noite': 'Noite'
  };
  
  // Human-readable modality name mapping
  const modalityNames: Record<string, string> = {
    'presencial': 'Presencial',
    'semipresencial': 'Semipresencial',
    'ead': 'EAD (Ensino à Distância)'
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-lg font-medium flex items-center">
            <span>Detalhes do Aluno</span>
          </DialogTitle>
        </DialogHeader>
        
        <div className="flex-1 overflow-y-auto p-1">
          <Tabs defaultValue={tab} value={tab} onValueChange={setTab} className="w-full">
            <TabsList className="mb-4">
              <TabsTrigger value="info">Informações</TabsTrigger>
              <TabsTrigger value="documents">Documentos</TabsTrigger>
              <TabsTrigger value="chat">Histórico de Chat</TabsTrigger>
            </TabsList>
            
            <TabsContent value="info" className="space-y-4">
              {/* Student Info */}
              <div className="flex flex-col md:flex-row mb-8">
                <div className="w-full md:w-1/4 flex flex-col items-center mb-4 md:mb-0">
                  <div className="w-32 h-32 rounded-full bg-gray-200 flex items-center justify-center mb-3">
                    <span className="text-4xl font-semibold text-gray-500">{student.fullName.charAt(0)}</span>
                  </div>
                  <h3 className="font-bold text-gray-800 text-lg">{student.fullName}</h3>
                  <p className="text-gray-500 text-sm">Matrícula #{student.id}</p>
                  <div className="mt-2">
                    <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      student.status === 'complete' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      Matrícula {student.status === 'complete' ? 'Completa' : 'Pendente'}
                    </span>
                  </div>
                </div>
                
                <div className="w-full md:w-3/4 md:pl-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="text-sm font-medium text-gray-500">Informações Pessoais</h4>
                      <div className="mt-2 space-y-2">
                        <p className="text-sm"><span className="font-medium text-gray-600">Nome Completo:</span> {student.fullName}</p>
                        <p className="text-sm"><span className="font-medium text-gray-600">CPF:</span> {student.cpf}</p>
                        <p className="text-sm"><span className="font-medium text-gray-600">RG:</span> {student.rg || '-'}</p>
                        <p className="text-sm"><span className="font-medium text-gray-600">Data de Nascimento:</span> {student.birthDate}</p>
                        <p className="text-sm"><span className="font-medium text-gray-600">Gênero:</span> {student.gender || '-'}</p>
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="text-sm font-medium text-gray-500">Contato</h4>
                      <div className="mt-2 space-y-2">
                        <p className="text-sm"><span className="font-medium text-gray-600">Email:</span> {student.email}</p>
                        <p className="text-sm"><span className="font-medium text-gray-600">Telefone:</span> {student.phone}</p>
                        <p className="text-sm"><span className="font-medium text-gray-600">WhatsApp:</span> {student.whatsapp || '-'}</p>
                        <p className="text-sm"><span className="font-medium text-gray-600">Contato Emergência:</span> {student.emergencyContact || '-'}</p>
                        <p className="text-sm"><span className="font-medium text-gray-600">Tel. Emergência:</span> {student.emergencyPhone || '-'}</p>
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="text-sm font-medium text-gray-500">Endereço</h4>
                      <div className="mt-2 space-y-2">
                        <p className="text-sm"><span className="font-medium text-gray-600">Endereço:</span> {student.address}</p>
                        <p className="text-sm"><span className="font-medium text-gray-600">Cidade:</span> {student.city}</p>
                        <p className="text-sm"><span className="font-medium text-gray-600">Estado:</span> {student.state}</p>
                        <p className="text-sm"><span className="font-medium text-gray-600">CEP:</span> {student.zipCode}</p>
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="text-sm font-medium text-gray-500">Matrícula</h4>
                      <div className="mt-2 space-y-2">
                        <p className="text-sm">
                          <span className="font-medium text-gray-600">Curso:</span> {courseNames[student.course] || student.course}
                        </p>
                        <p className="text-sm">
                          <span className="font-medium text-gray-600">Turno:</span> {shiftNames[student.shift] || student.shift}
                        </p>
                        <p className="text-sm">
                          <span className="font-medium text-gray-600">Modalidade:</span> {modalityNames[student.modality] || student.modality}
                        </p>
                        <p className="text-sm">
                          <span className="font-medium text-gray-600">Data da Matrícula:</span> {formatDateTime(student.registrationDate)}
                        </p>
                        <p className="text-sm">
                          <span className="font-medium text-gray-600">Observações:</span> {student.additionalInfo || 'Nenhuma observação.'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="documents">
              {/* Document Viewer */}
              <div>
                <h4 className="text-gray-700 font-medium mb-4">Documentos Anexados</h4>
                
                {isLoading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
                    <p className="text-gray-500">Carregando documentos...</p>
                  </div>
                ) : !documents || documents.length === 0 ? (
                  <div className="text-center py-8 bg-gray-50 rounded-lg border border-dashed border-gray-300">
                    <FileText className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-500">Nenhum documento anexado</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {documents.map((doc: Document) => (
                      <DocumentPreview
                        key={doc.id}
                        document={doc}
                      />
                    ))}
                  </div>
                )}
              </div>
            </TabsContent>
            
            <TabsContent value="chat">
              <div className="border rounded-lg p-4 bg-gray-50">
                <h4 className="text-gray-700 font-medium mb-4">Histórico de Conversas</h4>
                
                {/* Fetch chat messages in a real app */}
                <div className="text-center py-8">
                  <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-500">Histórico de chat não disponível</p>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
        
        <div className="bg-gray-50 px-6 py-4 flex justify-between items-center border-t border-gray-200">
          <div className="flex space-x-2">
            <Button 
              variant="outline" 
              className="flex items-center"
              onClick={handlePrintSheet}
            >
              <Printer className="h-4 w-4 mr-1" />
              <span>Ficha Completa</span>
            </Button>
            <Button 
              variant="outline" 
              className="flex items-center"
            >
              <Download className="h-4 w-4 mr-1" />
              <span>Documentos</span>
            </Button>
            <Button 
              className="flex items-center bg-primary hover:bg-[hsl(var(--whatsapp-light-green))]"
              onClick={handleShareWhatsApp}
            >
              <Share2 className="h-4 w-4 mr-1" />
              <span>WhatsApp</span>
            </Button>
          </div>
          <Button 
            variant="ghost" 
            size="icon"
            className="text-red-600 hover:text-red-800 hover:bg-red-50"
          >
            <Trash className="h-5 w-5" />
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
