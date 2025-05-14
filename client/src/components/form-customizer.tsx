import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  DragDropContext, 
  Droppable, 
  Draggable,
  DropResult
} from '@hello-pangea/dnd';
import { FormField, DocumentRequirement } from "@shared/schema";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { 
  GripVertical, 
  Edit, 
  Trash, 
  Plus,
  Save,
  X
} from "lucide-react";

interface FormCustomizerProps {
  type: 'formFields' | 'documentRequirements';
  items: FormField[] | DocumentRequirement[];
}

export default function FormCustomizer({ type, items }: FormCustomizerProps) {
  const [localItems, setLocalItems] = useState<any[]>([...items]);
  const [editItem, setEditItem] = useState<any | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isConfirmDeleteOpen, setIsConfirmDeleteOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<number | null>(null);
  const { toast } = useToast();

  // Determine API endpoint based on type
  const apiEndpoint = type === 'formFields' 
    ? '/api/admin/form-fields' 
    : '/api/admin/document-requirements';
  
  // Mutations for form field actions
  const updateMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await apiRequest("PUT", `${apiEndpoint}/${data.id}`, data);
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Atualizado com sucesso",
        description: "As alterações foram salvas."
      });
      
      // Refetch data
      queryClient.invalidateQueries({ queryKey: [type === 'formFields' ? '/api/form-fields' : '/api/document-requirements'] });
    },
    onError: (error) => {
      toast({
        title: "Erro ao atualizar",
        description: error.message,
        variant: "destructive"
      });
    }
  });
  
  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await apiRequest("POST", apiEndpoint, data);
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Criado com sucesso",
        description: "O novo item foi adicionado."
      });
      
      // Refetch data
      queryClient.invalidateQueries({ queryKey: [type === 'formFields' ? '/api/form-fields' : '/api/document-requirements'] });
    },
    onError: (error) => {
      toast({
        title: "Erro ao criar",
        description: error.message,
        variant: "destructive"
      });
    }
  });
  
  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await apiRequest("DELETE", `${apiEndpoint}/${id}`, undefined);
      return res;
    },
    onSuccess: () => {
      toast({
        title: "Excluído com sucesso",
        description: "O item foi removido."
      });
      
      // Refetch data
      queryClient.invalidateQueries({ queryKey: [type === 'formFields' ? '/api/form-fields' : '/api/document-requirements'] });
    },
    onError: (error) => {
      toast({
        title: "Erro ao excluir",
        description: error.message,
        variant: "destructive"
      });
    }
  });
  
  // Handle drag end
  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;
    
    const items = Array.from(localItems);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);
    
    // Update order property for each item
    const updatedItems = items.map((item, index) => ({
      ...item,
      order: index + 1
    }));
    
    setLocalItems(updatedItems);
    
    // Save new order to backend
    updatedItems.forEach(item => {
      updateMutation.mutate({ ...item, order: item.order });
    });
  };
  
  // Handle edit item
  const handleEditItem = (item: any) => {
    setEditItem({ ...item });
    setIsDialogOpen(true);
  };
  
  // Handle add new item
  const handleAddItem = () => {
    const maxOrder = localItems.length > 0 
      ? Math.max(...localItems.map(item => item.order))
      : 0;
    
    if (type === 'formFields') {
      setEditItem({
        id: 0, // New item
        name: '',
        label: '',
        type: 'text',
        required: false,
        order: maxOrder + 1,
        section: 'personal',
        active: true
      });
    } else {
      setEditItem({
        id: 0, // New item
        name: '',
        description: '',
        required: false,
        active: true,
        order: maxOrder + 1
      });
    }
    
    setIsDialogOpen(true);
  };
  
  // Handle save item
  const handleSaveItem = () => {
    if (!editItem) return;
    
    if (editItem.id === 0) {
      // Create new item
      const { id, ...newItem } = editItem;
      createMutation.mutate(newItem);
    } else {
      // Update existing item
      updateMutation.mutate(editItem);
    }
    
    setIsDialogOpen(false);
    setEditItem(null);
  };
  
  // Handle delete confirmation
  const handleConfirmDelete = (id: number) => {
    setItemToDelete(id);
    setIsConfirmDeleteOpen(true);
  };
  
  // Handle delete item
  const handleDeleteItem = () => {
    if (itemToDelete === null) return;
    
    deleteMutation.mutate(itemToDelete);
    setIsConfirmDeleteOpen(false);
    setItemToDelete(null);
  };
  
  // Handle toggle active
  const handleToggleActive = (item: any) => {
    const updatedItem = { ...item, active: !item.active };
    updateMutation.mutate(updatedItem);
  };
  
  // Handle toggle required
  const handleToggleRequired = (item: any) => {
    const updatedItem = { ...item, required: !item.required };
    updateMutation.mutate(updatedItem);
  };
  
  return (
    <div className="space-y-4">
      <div className="flex justify-between">
        <h3 className="text-lg font-medium">
          {type === 'formFields' ? 'Campos do Formulário' : 'Requisitos de Documentos'}
        </h3>
        <Button
          size="sm"
          onClick={handleAddItem}
          className="flex items-center"
        >
          <Plus className="h-4 w-4 mr-1" />
          Adicionar
        </Button>
      </div>
      
      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId="items">
          {(provided) => (
            <div
              {...provided.droppableProps}
              ref={provided.innerRef}
              className="space-y-2"
            >
              {localItems.map((item, index) => (
                <Draggable
                  key={item.id.toString()}
                  draggableId={item.id.toString()}
                  index={index}
                >
                  {(provided) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      className={`flex items-center justify-between p-3 bg-white rounded border ${
                        item.active 
                          ? 'border-gray-200' 
                          : 'border-gray-200 bg-gray-50 opacity-60'
                      }`}
                    >
                      <div className="flex items-center flex-1">
                        <div
                          {...provided.dragHandleProps}
                          className="mr-2 cursor-grab"
                        >
                          <GripVertical className="h-5 w-5 text-gray-400" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center">
                            <span className="font-medium">{type === 'formFields' ? item.label : item.name}</span>
                            {item.required && (
                              <span className="ml-2 text-xs bg-gray-200 text-gray-600 px-2 py-0.5 rounded">
                                Obrigatório
                              </span>
                            )}
                          </div>
                          {type === 'formFields' && (
                            <span className="text-xs text-gray-500">
                              Tipo: {item.type} | Seção: {item.section}
                            </span>
                          )}
                          {type === 'documentRequirements' && item.description && (
                            <span className="text-xs text-gray-500">
                              {item.description}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="flex items-center space-x-2 mr-2">
                          <Switch
                            id={`active-${item.id}`}
                            checked={item.active}
                            onCheckedChange={() => handleToggleActive(item)}
                          />
                          <Label htmlFor={`active-${item.id}`} className="text-xs">
                            Ativo
                          </Label>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-gray-500 hover:text-gray-700"
                          onClick={() => handleEditItem(item)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-red-500 hover:text-red-700"
                          onClick={() => handleConfirmDelete(item.id)}
                        >
                          <Trash className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
              
              {localItems.length === 0 && (
                <div className="p-8 text-center border border-dashed border-gray-300 rounded-md">
                  <p className="text-gray-500">
                    Nenhum item encontrado. Clique em "Adicionar" para criar um novo.
                  </p>
                </div>
              )}
            </div>
          )}
        </Droppable>
      </DragDropContext>
      
      {/* Edit Dialog */}
      {editItem && (
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editItem.id === 0 ? 'Adicionar' : 'Editar'} {type === 'formFields' ? 'Campo' : 'Documento'}
              </DialogTitle>
            </DialogHeader>
            
            <div className="space-y-4 py-4">
              {type === 'formFields' ? (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="field-name">Nome do Campo (ID)</Label>
                    <Input
                      id="field-name"
                      value={editItem.name}
                      onChange={(e) => setEditItem({ ...editItem, name: e.target.value })}
                      placeholder="Ex: fullName"
                    />
                    <p className="text-xs text-gray-500">
                      Identificador único do campo no sistema
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="field-label">Rótulo</Label>
                    <Input
                      id="field-label"
                      value={editItem.label}
                      onChange={(e) => setEditItem({ ...editItem, label: e.target.value })}
                      placeholder="Ex: Nome Completo"
                    />
                    <p className="text-xs text-gray-500">
                      Nome exibido para o usuário
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="field-type">Tipo</Label>
                    <Select
                      value={editItem.type}
                      onValueChange={(value) => setEditItem({ ...editItem, type: value })}
                    >
                      <SelectTrigger id="field-type">
                        <SelectValue placeholder="Selecione o tipo" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="text">Texto</SelectItem>
                        <SelectItem value="email">Email</SelectItem>
                        <SelectItem value="tel">Telefone</SelectItem>
                        <SelectItem value="date">Data</SelectItem>
                        <SelectItem value="select">Seleção</SelectItem>
                        <SelectItem value="radio">Rádio</SelectItem>
                        <SelectItem value="textarea">Área de Texto</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="field-section">Seção</Label>
                    <Select
                      value={editItem.section}
                      onValueChange={(value) => setEditItem({ ...editItem, section: value })}
                    >
                      <SelectTrigger id="field-section">
                        <SelectValue placeholder="Selecione a seção" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="personal">Informações Pessoais</SelectItem>
                        <SelectItem value="contact">Informações de Contato</SelectItem>
                        <SelectItem value="course">Seleção de Curso</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </>
              ) : (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="doc-name">Nome do Documento</Label>
                    <Input
                      id="doc-name"
                      value={editItem.name}
                      onChange={(e) => setEditItem({ ...editItem, name: e.target.value })}
                      placeholder="Ex: RG (frente e verso)"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="doc-description">Descrição</Label>
                    <Input
                      id="doc-description"
                      value={editItem.description}
                      onChange={(e) => setEditItem({ ...editItem, description: e.target.value })}
                      placeholder="Ex: Documento de identidade com foto"
                    />
                  </div>
                </>
              )}
              
              <div className="flex space-x-4">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="required"
                    checked={editItem.required}
                    onCheckedChange={(checked) => setEditItem({ ...editItem, required: checked })}
                  />
                  <Label htmlFor="required">Obrigatório</Label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Switch
                    id="active"
                    checked={editItem.active}
                    onCheckedChange={(checked) => setEditItem({ ...editItem, active: checked })}
                  />
                  <Label htmlFor="active">Ativo</Label>
                </div>
              </div>
            </div>
            
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsDialogOpen(false)}
                className="flex items-center"
              >
                <X className="h-4 w-4 mr-1" />
                Cancelar
              </Button>
              <Button
                onClick={handleSaveItem}
                className="flex items-center bg-primary hover:bg-[hsl(var(--whatsapp-light-green))]"
              >
                <Save className="h-4 w-4 mr-1" />
                Salvar
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
      
      {/* Delete Confirmation Dialog */}
      <Dialog open={isConfirmDeleteOpen} onOpenChange={setIsConfirmDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar Exclusão</DialogTitle>
          </DialogHeader>
          
          <div className="py-4">
            <p>
              Tem certeza que deseja excluir este item? Esta ação não pode ser desfeita.
            </p>
          </div>
          
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsConfirmDeleteOpen(false)}
            >
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteItem}
            >
              Excluir
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
