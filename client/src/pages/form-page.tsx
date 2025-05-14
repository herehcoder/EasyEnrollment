import { useState, useEffect } from "react";
import { useParams, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";
import { ArrowLeft, ArrowRight, Check } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { 
  Form, 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from "@/components/ui/form";
import { Card, CardContent } from "@/components/ui/card";
import DocumentUpload from "@/components/document-upload";
import { insertStudentSchema } from "@shared/schema";
import { z } from "zod";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";

// Form steps
const STEPS = ["personal", "contact", "course", "documents"];

export default function FormPage() {
  const { step } = useParams<{ step: string }>();
  const [location, navigate] = useLocation();
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(parseInt(step) || 1);
  const [formData, setFormData] = useState<any>({});
  const [documents, setDocuments] = useState<{ [key: string]: { file: File, preview: string } }>({});

  // Get form fields and document requirements
  const { data: formFields, isLoading: fieldsLoading } = useQuery({
    queryKey: ["/api/form-fields"],
    staleTime: 60000,
  });

  const { data: documentRequirements, isLoading: requirementsLoading } = useQuery({
    queryKey: ["/api/document-requirements"],
    staleTime: 60000,
  });

  // Filter form fields by section
  const getFieldsBySection = (section: string) => {
    if (!formFields) return [];
    return formFields
      .filter((field: any) => field.section === section && field.active)
      .sort((a: any, b: any) => a.order - b.order);
  };

  // Get active requirements
  const getActiveRequirements = () => {
    if (!documentRequirements) return [];
    return documentRequirements
      .filter((req: any) => req.active)
      .sort((a: any, b: any) => a.order - b.order);
  };

  // Create extended schema with validation
  const formSchema = z.object({
    // Personal information
    fullName: z.string().min(3, "Nome completo é obrigatório"),
    cpf: z.string().min(11, "CPF inválido"),
    rg: z.string().optional(),
    birthDate: z.string().min(1, "Data de nascimento é obrigatória"),
    gender: z.string().optional(),
    address: z.string().min(3, "Endereço é obrigatório"),
    city: z.string().min(1, "Cidade é obrigatória"),
    state: z.string().min(1, "Estado é obrigatório"),
    zipCode: z.string().min(5, "CEP é obrigatório"),
    
    // Contact information
    email: z.string().email("Email inválido"),
    phone: z.string().min(10, "Telefone é obrigatório"),
    whatsapp: z.string().optional(),
    emergencyContact: z.string().optional(),
    emergencyPhone: z.string().optional(),
    
    // Course information
    course: z.string().min(1, "Curso é obrigatório"),
    shift: z.string().min(1, "Turno é obrigatório"),
    modality: z.string().min(1, "Modalidade é obrigatória"),
    additionalInfo: z.string().optional(),
  });

  // Form setup
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: formData,
  });

  // Submit mutation for student registration
  const submitMutation = useMutation({
    mutationFn: async (data: z.infer<typeof formSchema>) => {
      const res = await apiRequest("POST", "/api/students", data);
      const student = await res.json();
      
      // After student is created, upload each document
      const documentPromises = Object.entries(documents).map(async ([type, { file }]) => {
        // Convert file to base64
        const reader = new FileReader();
        const fileDataPromise = new Promise<string>((resolve) => {
          reader.onload = () => resolve(reader.result as string);
          reader.readAsDataURL(file);
        });
        
        const fileData = await fileDataPromise;
        
        // Upload document
        const documentData = {
          studentId: student.id,
          type,
          fileName: file.name,
          fileData,
          mimeType: file.type
        };
        
        const docRes = await apiRequest("POST", "/api/documents", documentData);
        return docRes.json();
      });
      
      await Promise.all(documentPromises);
      
      return student;
    },
    onSuccess: () => {
      toast({
        title: "Matrícula enviada com sucesso!",
        description: "Você receberá um email de confirmação em breve.",
      });
      
      // Redirect to chat page after success
      setTimeout(() => navigate("/chat"), 1500);
    },
    onError: (error) => {
      toast({
        title: "Erro ao enviar matrícula",
        description: error.message || "Ocorreu um erro ao enviar sua matrícula. Tente novamente.",
        variant: "destructive"
      });
    }
  });
  
  // Update form values when step changes
  useEffect(() => {
    const values = form.getValues();
    setFormData(prev => ({ ...prev, ...values }));
  }, [currentStep]);
  
  // Update URL when step changes
  useEffect(() => {
    navigate(`/form/${currentStep}`);
  }, [currentStep, navigate]);
  
  // Go to next step
  const handleNext = async () => {
    const section = STEPS[currentStep - 1];
    const fields = getFieldsBySection(section);
    
    // Validate fields for current step
    const fieldNames = fields.map((field: any) => field.name);
    const stepValues = form.getValues();
    
    // Check for validation errors
    const stepData: any = {};
    let hasErrors = false;
    
    for (const field of fieldNames) {
      try {
        await form.trigger(field as any);
        stepData[field] = stepValues[field as keyof typeof stepValues];
      } catch (error) {
        hasErrors = true;
      }
    }
    
    if (form.formState.errors && Object.keys(form.formState.errors).some(key => fieldNames.includes(key))) {
      return;
    }
    
    // If no errors, go to next step
    setFormData(prev => ({ ...prev, ...stepData }));
    
    if (currentStep < STEPS.length) {
      setCurrentStep(currentStep + 1);
    } else {
      // Submit form if on last step
      form.handleSubmit(onSubmit)();
    }
  };
  
  // Go to previous step
  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    } else {
      navigate("/chat");
    }
  };
  
  // Handle form submission
  const onSubmit = (data: z.infer<typeof formSchema>) => {
    submitMutation.mutate(data);
  };
  
  // Handle document change
  const handleDocumentChange = (type: string, file: File) => {
    // Create preview
    const reader = new FileReader();
    reader.onload = () => {
      setDocuments(prev => ({
        ...prev,
        [type]: {
          file,
          preview: reader.result as string
        }
      }));
    };
    reader.readAsDataURL(file);
  };
  
  // Handle document removal
  const handleDocumentRemove = (type: string) => {
    setDocuments(prev => {
      const newDocs = { ...prev };
      delete newDocs[type];
      return newDocs;
    });
  };
  
  // Go back to chat
  const handleGoBack = () => {
    navigate("/chat");
  };
  
  // Loading state
  if (fieldsLoading || requirementsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }
  
  // Get fields for current step
  const currentSectionFields = getFieldsBySection(STEPS[currentStep - 1]);
  const activeRequirements = getActiveRequirements();
  
  return (
    <div className="h-screen flex flex-col">
      {/* Header */}
      <motion.header 
        className="bg-primary text-white px-4 py-3 flex items-center justify-between shadow-md"
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        <div className="flex items-center">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={handleGoBack}
            className="mr-2 text-white hover:bg-primary/20"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="font-medium">Formulário de Matrícula</h1>
        </div>
        <div className="text-sm">
          Passo <span>{currentStep}</span> de <span>{STEPS.length}</span>
        </div>
      </motion.header>
      
      {/* Form Content */}
      <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            {/* Step 1: Personal Information */}
            {currentStep === 1 && (
              <motion.div 
                className="bg-white rounded-lg shadow p-6 animate-fade-in"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <h2 className="text-xl font-bold text-gray-800 mb-6">Informações Pessoais</h2>
                
                <div className="space-y-4">
                  {currentSectionFields.map((field: any) => (
                    <FormField
                      key={field.id}
                      control={form.control}
                      name={field.name as any}
                      render={({ field: formField }) => (
                        <FormItem>
                          <FormLabel>{field.label}{field.required && '*'}</FormLabel>
                          <FormControl>
                            {field.type === 'text' && (
                              <Input 
                                placeholder={`Digite ${field.label.toLowerCase()}`} 
                                {...formField} 
                              />
                            )}
                            {field.type === 'select' && (
                              <Select 
                                onValueChange={formField.onChange} 
                                defaultValue={formField.value}
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder={`Selecione ${field.label.toLowerCase()}`} />
                                </SelectTrigger>
                                <SelectContent>
                                  {field.name === 'gender' && (
                                    <>
                                      <SelectItem value="masculino">Masculino</SelectItem>
                                      <SelectItem value="feminino">Feminino</SelectItem>
                                      <SelectItem value="outro">Outro</SelectItem>
                                      <SelectItem value="nao_informar">Prefiro não informar</SelectItem>
                                    </>
                                  )}
                                  {field.name === 'state' && (
                                    <>
                                      <SelectItem value="AC">Acre</SelectItem>
                                      <SelectItem value="AL">Alagoas</SelectItem>
                                      <SelectItem value="AP">Amapá</SelectItem>
                                      <SelectItem value="AM">Amazonas</SelectItem>
                                      <SelectItem value="BA">Bahia</SelectItem>
                                      <SelectItem value="CE">Ceará</SelectItem>
                                      <SelectItem value="DF">Distrito Federal</SelectItem>
                                      <SelectItem value="ES">Espírito Santo</SelectItem>
                                      <SelectItem value="GO">Goiás</SelectItem>
                                      <SelectItem value="MA">Maranhão</SelectItem>
                                      <SelectItem value="MT">Mato Grosso</SelectItem>
                                      <SelectItem value="MS">Mato Grosso do Sul</SelectItem>
                                      <SelectItem value="MG">Minas Gerais</SelectItem>
                                      <SelectItem value="PA">Pará</SelectItem>
                                      <SelectItem value="PB">Paraíba</SelectItem>
                                      <SelectItem value="PR">Paraná</SelectItem>
                                      <SelectItem value="PE">Pernambuco</SelectItem>
                                      <SelectItem value="PI">Piauí</SelectItem>
                                      <SelectItem value="RJ">Rio de Janeiro</SelectItem>
                                      <SelectItem value="RN">Rio Grande do Norte</SelectItem>
                                      <SelectItem value="RS">Rio Grande do Sul</SelectItem>
                                      <SelectItem value="RO">Rondônia</SelectItem>
                                      <SelectItem value="RR">Roraima</SelectItem>
                                      <SelectItem value="SC">Santa Catarina</SelectItem>
                                      <SelectItem value="SP">São Paulo</SelectItem>
                                      <SelectItem value="SE">Sergipe</SelectItem>
                                      <SelectItem value="TO">Tocantins</SelectItem>
                                    </>
                                  )}
                                </SelectContent>
                              </Select>
                            )}
                            {field.type === 'date' && (
                              <Input 
                                type="date" 
                                {...formField} 
                              />
                            )}
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  ))}
                </div>
                
                <div className="mt-8 flex justify-end">
                  <Button 
                    type="button" 
                    onClick={handleNext}
                    className="bg-primary hover:bg-[hsl(var(--whatsapp-light-green))] transition-all flex items-center"
                  >
                    Próximo
                    <ArrowRight className="ml-1 h-4 w-4" />
                  </Button>
                </div>
              </motion.div>
            )}
            
            {/* Step 2: Contact Information */}
            {currentStep === 2 && (
              <motion.div 
                className="bg-white rounded-lg shadow p-6 animate-fade-in"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <h2 className="text-xl font-bold text-gray-800 mb-6">Informações de Contato</h2>
                
                <div className="space-y-4">
                  {currentSectionFields.map((field: any) => (
                    <FormField
                      key={field.id}
                      control={form.control}
                      name={field.name as any}
                      render={({ field: formField }) => (
                        <FormItem>
                          <FormLabel>{field.label}{field.required && '*'}</FormLabel>
                          <FormControl>
                            {field.type === 'text' && (
                              <Input 
                                placeholder={`Digite ${field.label.toLowerCase()}`} 
                                {...formField} 
                              />
                            )}
                            {field.type === 'email' && (
                              <Input 
                                type="email" 
                                placeholder={`Digite ${field.label.toLowerCase()}`} 
                                {...formField} 
                              />
                            )}
                            {field.type === 'tel' && (
                              <Input 
                                type="tel" 
                                placeholder={`Digite ${field.label.toLowerCase()}`} 
                                {...formField} 
                              />
                            )}
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  ))}
                </div>
                
                <div className="mt-8 flex justify-between">
                  <Button 
                    type="button" 
                    onClick={handlePrevious}
                    variant="outline"
                    className="flex items-center"
                  >
                    <ArrowLeft className="mr-1 h-4 w-4" />
                    Anterior
                  </Button>
                  <Button 
                    type="button" 
                    onClick={handleNext}
                    className="bg-primary hover:bg-[hsl(var(--whatsapp-light-green))] transition-all flex items-center"
                  >
                    Próximo
                    <ArrowRight className="ml-1 h-4 w-4" />
                  </Button>
                </div>
              </motion.div>
            )}
            
            {/* Step 3: Course Selection */}
            {currentStep === 3 && (
              <motion.div 
                className="bg-white rounded-lg shadow p-6 animate-fade-in"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <h2 className="text-xl font-bold text-gray-800 mb-6">Seleção de Curso</h2>
                
                <div className="space-y-4">
                  {currentSectionFields.map((field: any) => (
                    <FormField
                      key={field.id}
                      control={form.control}
                      name={field.name as any}
                      render={({ field: formField }) => (
                        <FormItem>
                          <FormLabel>{field.label}{field.required && '*'}</FormLabel>
                          <FormControl>
                            {field.type === 'select' && (
                              <Select 
                                onValueChange={formField.onChange} 
                                defaultValue={formField.value}
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder={`Selecione ${field.label.toLowerCase()}`} />
                                </SelectTrigger>
                                <SelectContent>
                                  {field.name === 'course' && (
                                    <>
                                      <SelectItem value="administracao">Administração</SelectItem>
                                      <SelectItem value="engenharia">Engenharia</SelectItem>
                                      <SelectItem value="medicina">Medicina</SelectItem>
                                      <SelectItem value="direito">Direito</SelectItem>
                                      <SelectItem value="computacao">Ciência da Computação</SelectItem>
                                    </>
                                  )}
                                </SelectContent>
                              </Select>
                            )}
                            {field.type === 'radio' && (
                              <RadioGroup
                                onValueChange={formField.onChange}
                                defaultValue={formField.value}
                                className="flex space-x-4"
                              >
                                {field.name === 'shift' && (
                                  <>
                                    <div className="flex items-center space-x-2">
                                      <RadioGroupItem value="manha" id="shift-manha" />
                                      <Label htmlFor="shift-manha">Manhã</Label>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                      <RadioGroupItem value="tarde" id="shift-tarde" />
                                      <Label htmlFor="shift-tarde">Tarde</Label>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                      <RadioGroupItem value="noite" id="shift-noite" />
                                      <Label htmlFor="shift-noite">Noite</Label>
                                    </div>
                                  </>
                                )}
                                {field.name === 'modality' && (
                                  <>
                                    <div className="flex items-center space-x-2">
                                      <RadioGroupItem value="presencial" id="modality-presencial" />
                                      <Label htmlFor="modality-presencial">Presencial</Label>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                      <RadioGroupItem value="semipresencial" id="modality-semipresencial" />
                                      <Label htmlFor="modality-semipresencial">Semipresencial</Label>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                      <RadioGroupItem value="ead" id="modality-ead" />
                                      <Label htmlFor="modality-ead">EAD</Label>
                                    </div>
                                  </>
                                )}
                              </RadioGroup>
                            )}
                            {field.type === 'textarea' && (
                              <Textarea
                                placeholder={`Digite ${field.label.toLowerCase()}`}
                                className="h-24"
                                {...formField}
                              />
                            )}
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  ))}
                </div>
                
                <div className="mt-8 flex justify-between">
                  <Button 
                    type="button" 
                    onClick={handlePrevious}
                    variant="outline"
                    className="flex items-center"
                  >
                    <ArrowLeft className="mr-1 h-4 w-4" />
                    Anterior
                  </Button>
                  <Button 
                    type="button" 
                    onClick={handleNext}
                    className="bg-primary hover:bg-[hsl(var(--whatsapp-light-green))] transition-all flex items-center"
                  >
                    Próximo
                    <ArrowRight className="ml-1 h-4 w-4" />
                  </Button>
                </div>
              </motion.div>
            )}
            
            {/* Step 4: Document Upload */}
            {currentStep === 4 && (
              <motion.div 
                className="bg-white rounded-lg shadow p-6 animate-fade-in"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <h2 className="text-xl font-bold text-gray-800 mb-6">Upload de Documentos</h2>
                
                <div className="space-y-6">
                  {activeRequirements.map((requirement: any) => (
                    <DocumentUpload
                      key={requirement.id}
                      title={requirement.name}
                      description={requirement.description}
                      required={requirement.required}
                      value={documents[requirement.name]?.preview || ""}
                      onChange={(file) => handleDocumentChange(requirement.name, file)}
                      onRemove={() => handleDocumentRemove(requirement.name)}
                    />
                  ))}
                </div>
                
                <div className="mt-8 flex justify-between">
                  <Button 
                    type="button" 
                    onClick={handlePrevious}
                    variant="outline"
                    className="flex items-center"
                  >
                    <ArrowLeft className="mr-1 h-4 w-4" />
                    Anterior
                  </Button>
                  <Button 
                    type="button" 
                    onClick={form.handleSubmit(onSubmit)}
                    className="bg-primary hover:bg-[hsl(var(--whatsapp-light-green))] transition-all flex items-center"
                    disabled={submitMutation.isPending}
                  >
                    {submitMutation.isPending ? (
                      <>
                        <div className="animate-spin h-4 w-4 mr-2 border-2 border-white border-t-transparent rounded-full"></div>
                        Enviando...
                      </>
                    ) : (
                      <>
                        Finalizar Matrícula
                        <Check className="ml-1 h-4 w-4" />
                      </>
                    )}
                  </Button>
                </div>
              </motion.div>
            )}
          </form>
        </Form>
      </div>
    </div>
  );
}
