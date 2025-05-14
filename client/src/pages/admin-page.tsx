import { useState, useEffect } from "react";
import { useLocation, useParams } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { School, LogOut, Search, PanelsTopLeft, Users, BookOpen, FileText, Settings } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle,
  CardDescription
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import StudentDetailsModal from "@/components/student-details-modal";
import FormCustomizer from "@/components/form-customizer";
import { Student } from "@shared/schema";

export default function AdminPage() {
  const { section } = useParams();
  const [currentSection, setCurrentSection] = useState(section || "dashboard");
  const [selectedTab, setSelectedTab] = useState("students");
  const [searchQuery, setSearchQuery] = useState("");
  const [showStudentModal, setShowStudentModal] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [location, navigate] = useLocation();
  const { user, logoutMutation } = useAuth();
  const { toast } = useToast();

  const { data: students, isLoading: studentsLoading } = useQuery({
    queryKey: ["/api/students"],
    staleTime: 60000,
  });

  const { data: formFields, isLoading: formFieldsLoading } = useQuery({
    queryKey: ["/api/form-fields"],
    staleTime: 60000,
  });

  const { data: documentRequirements, isLoading: documentRequirementsLoading } = useQuery({
    queryKey: ["/api/document-requirements"],
    staleTime: 60000,
  });

  useEffect(() => {
    if (section) {
      setCurrentSection(section);
    }
  }, [section]);

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  const handleSectionChange = (section: string) => {
    setCurrentSection(section);
    navigate(`/admin/${section}`);
  };

  const handleViewStudent = (student: Student) => {
    setSelectedStudent(student);
    setShowStudentModal(true);
  };

  const filteredStudents = students ? students.filter((student: Student) => 
    student.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    student.cpf.toLowerCase().includes(searchQuery.toLowerCase()) ||
    student.email.toLowerCase().includes(searchQuery.toLowerCase())
  ) : [];

  // Calculate statistics
  const totalRegistrations = students?.length || 0;
  const completeRegistrations = students?.filter(
    (student: Student) => student.status === "complete"
  ).length || 0;
  const pendingRegistrations = students?.filter(
    (student: Student) => student.status === "pending"
  ).length || 0;
  const todayRegistrations = students?.filter(
    (student: Student) => {
      const today = new Date();
      const regDate = new Date(student.registrationDate);
      return regDate.toDateString() === today.toDateString();
    }
  ).length || 0;

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
          <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center mr-3">
            <School className="h-6 w-6 text-primary" />
          </div>
          <h1 className="font-medium">EasyMatrícula - Painel Administrativo</h1>
        </div>
        <div className="flex items-center">
          <span className="mr-2 text-sm">{user?.username}</span>
          <Button 
            variant="ghost"
            size="icon"
            onClick={handleLogout}
            className="hover:bg-white/20"
          >
            <LogOut className="h-5 w-5" />
          </Button>
        </div>
      </motion.header>
      
      {/* Admin Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        <motion.div 
          className="w-64 bg-gray-100 border-r border-gray-200 flex flex-col"
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <div className="p-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input 
                type="text" 
                placeholder="Buscar alunos..." 
                className="pl-10 pr-4 py-2 w-full text-sm"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
          
          <nav className="flex-1 overflow-y-auto">
            <ul className="px-2 space-y-1">
              <li>
                <Button
                  variant={currentSection === "dashboard" ? "default" : "ghost"}
                  className={`w-full justify-start ${
                    currentSection === "dashboard" ? "bg-primary text-white" : "text-gray-700"
                  }`}
                  onClick={() => handleSectionChange("dashboard")}
                >
                  <PanelsTopLeft className="mr-3 h-4 w-4" />
                  <span>PanelsTopLeft</span>
                </Button>
              </li>
              <li>
                <Button
                  variant={currentSection === "students" ? "default" : "ghost"}
                  className={`w-full justify-start ${
                    currentSection === "students" ? "bg-primary text-white" : "text-gray-700"
                  }`}
                  onClick={() => handleSectionChange("students")}
                >
                  <Users className="mr-3 h-4 w-4" />
                  <span>Alunos</span>
                </Button>
              </li>
              <li>
                <Button
                  variant={currentSection === "courses" ? "default" : "ghost"}
                  className={`w-full justify-start ${
                    currentSection === "courses" ? "bg-primary text-white" : "text-gray-700"
                  }`}
                  onClick={() => handleSectionChange("courses")}
                >
                  <BookOpen className="mr-3 h-4 w-4" />
                  <span>Cursos</span>
                </Button>
              </li>
              <li>
                <Button
                  variant={currentSection === "documents" ? "default" : "ghost"}
                  className={`w-full justify-start ${
                    currentSection === "documents" ? "bg-primary text-white" : "text-gray-700"
                  }`}
                  onClick={() => handleSectionChange("documents")}
                >
                  <FileText className="mr-3 h-4 w-4" />
                  <span>Documentos</span>
                </Button>
              </li>
              <li>
                <Button
                  variant={currentSection === "settings" ? "default" : "ghost"}
                  className={`w-full justify-start ${
                    currentSection === "settings" ? "bg-primary text-white" : "text-gray-700"
                  }`}
                  onClick={() => handleSectionChange("settings")}
                >
                  <Settings className="mr-3 h-4 w-4" />
                  <span>Configurações</span>
                </Button>
              </li>
            </ul>
          </nav>
        </motion.div>
        
        {/* Main Content */}
        <motion.div 
          className="flex-1 overflow-y-auto bg-gray-50 p-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3, delay: 0.2 }}
        >
          {currentSection === "dashboard" && (
            <>
              <div className="mb-6">
                <h2 className="text-xl font-bold text-gray-800">Visão Geral</h2>
                <p className="text-gray-600 text-sm">Bem-vindo ao painel de administração!</p>
              </div>
              
              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center">
                      <div className="rounded-full bg-blue-100 p-3 mr-4">
                        <Users className="h-6 w-6 text-blue-500" />
                      </div>
                      <div>
                        <p className="text-gray-500 text-sm">Total de Matrículas</p>
                        <p className="text-2xl font-bold text-gray-800">{totalRegistrations}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center">
                      <div className="rounded-full bg-green-100 p-3 mr-4">
                        <svg className="h-6 w-6 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-gray-500 text-sm">Matrículas Completas</p>
                        <p className="text-2xl font-bold text-gray-800">{completeRegistrations}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center">
                      <div className="rounded-full bg-yellow-100 p-3 mr-4">
                        <svg className="h-6 w-6 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-gray-500 text-sm">Matrículas Pendentes</p>
                        <p className="text-2xl font-bold text-gray-800">{pendingRegistrations}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center">
                      <div className="rounded-full bg-purple-100 p-3 mr-4">
                        <svg className="h-6 w-6 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-gray-500 text-sm">Novas Hoje</p>
                        <p className="text-2xl font-bold text-gray-800">{todayRegistrations}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
              
              {/* Recent Registrations */}
              <Card className="mb-8">
                <CardHeader className="pb-3">
                  <CardTitle>Matrículas Recentes</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Aluno</th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Curso</th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Data</th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {studentsLoading ? (
                          <tr>
                            <td colSpan={5} className="px-6 py-4 text-center text-sm text-gray-500">
                              Carregando dados...
                            </td>
                          </tr>
                        ) : filteredStudents.length === 0 ? (
                          <tr>
                            <td colSpan={5} className="px-6 py-4 text-center text-sm text-gray-500">
                              Nenhum aluno encontrado
                            </td>
                          </tr>
                        ) : (
                          filteredStudents.slice(0, 5).map((student: Student) => (
                            <tr key={student.id}>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center">
                                  <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                                    <span className="text-gray-600 font-semibold">{student.fullName.charAt(0)}</span>
                                  </div>
                                  <div className="ml-4">
                                    <div className="text-sm font-medium text-gray-900">{student.fullName}</div>
                                    <div className="text-sm text-gray-500">{student.email}</div>
                                  </div>
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-gray-900">{student.course}</div>
                                <div className="text-sm text-gray-500">{student.modality} - {student.shift}</div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-gray-900">
                                  {new Date(student.registrationDate).toLocaleDateString('pt-BR')}
                                </div>
                                <div className="text-sm text-gray-500">
                                  {new Date(student.registrationDate).toLocaleTimeString('pt-BR', { 
                                    hour: '2-digit', 
                                    minute: '2-digit' 
                                  })}
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                  student.status === 'complete' 
                                    ? 'bg-green-100 text-green-800' 
                                    : 'bg-yellow-100 text-yellow-800'
                                }`}>
                                  {student.status === 'complete' ? 'Completa' : 'Pendente'}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                <Button 
                                  variant="ghost" 
                                  size="sm" 
                                  className="text-primary hover:text-accent mr-1"
                                  onClick={() => handleViewStudent(student)}
                                >
                                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                  </svg>
                                </Button>
                                <Button 
                                  variant="ghost" 
                                  size="sm" 
                                  className="text-blue-600 hover:text-blue-800 mr-1"
                                >
                                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                  </svg>
                                </Button>
                                <Button 
                                  variant="ghost" 
                                  size="sm" 
                                  className="text-red-600 hover:text-red-800"
                                >
                                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                  </svg>
                                </Button>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </>
          )}

          {currentSection === "settings" && (
            <>
              <div className="mb-6">
                <h2 className="text-xl font-bold text-gray-800">Configurações do Formulário</h2>
                <p className="text-gray-600 text-sm">Personalize os campos e requisitos de documentos para o processo de matrícula.</p>
              </div>
              
              <Tabs defaultValue="form-fields" className="w-full">
                <TabsList className="mb-4">
                  <TabsTrigger value="form-fields">Campos do Formulário</TabsTrigger>
                  <TabsTrigger value="doc-requirements">Requisitos de Documentos</TabsTrigger>
                </TabsList>
                
                <TabsContent value="form-fields">
                  <Card>
                    <CardHeader>
                      <CardTitle>Personalização dos Campos</CardTitle>
                      <CardDescription>
                        Adicione, remova ou edite os campos do formulário de matrícula.
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      {formFieldsLoading ? (
                        <div className="py-4 text-center">Carregando campos do formulário...</div>
                      ) : (
                        <FormCustomizer 
                          type="formFields" 
                          items={formFields || []} 
                        />
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>
                
                <TabsContent value="doc-requirements">
                  <Card>
                    <CardHeader>
                      <CardTitle>Requisitos de Documentos</CardTitle>
                      <CardDescription>
                        Defina quais documentos são necessários para a matrícula.
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      {documentRequirementsLoading ? (
                        <div className="py-4 text-center">Carregando requisitos de documentos...</div>
                      ) : (
                        <FormCustomizer 
                          type="documentRequirements" 
                          items={documentRequirements || []} 
                        />
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </>
          )}

          {currentSection === "students" && (
            <>
              <div className="mb-6">
                <h2 className="text-xl font-bold text-gray-800">Gerenciamento de Alunos</h2>
                <p className="text-gray-600 text-sm">Visualize e gerencie todos os alunos matriculados.</p>
              </div>
              
              <Card>
                <CardContent className="pt-6">
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Aluno</th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Curso</th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contato</th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Data</th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {studentsLoading ? (
                          <tr>
                            <td colSpan={6} className="px-6 py-4 text-center text-sm text-gray-500">
                              Carregando dados...
                            </td>
                          </tr>
                        ) : filteredStudents.length === 0 ? (
                          <tr>
                            <td colSpan={6} className="px-6 py-4 text-center text-sm text-gray-500">
                              Nenhum aluno encontrado
                            </td>
                          </tr>
                        ) : (
                          filteredStudents.map((student: Student) => (
                            <tr key={student.id}>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center">
                                  <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                                    <span className="text-gray-600 font-semibold">{student.fullName.charAt(0)}</span>
                                  </div>
                                  <div className="ml-4">
                                    <div className="text-sm font-medium text-gray-900">{student.fullName}</div>
                                    <div className="text-sm text-gray-500">CPF: {student.cpf}</div>
                                  </div>
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-gray-900">{student.course}</div>
                                <div className="text-sm text-gray-500">{student.modality} - {student.shift}</div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-gray-900">{student.email}</div>
                                <div className="text-sm text-gray-500">{student.phone}</div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-gray-900">
                                  {new Date(student.registrationDate).toLocaleDateString('pt-BR')}
                                </div>
                                <div className="text-sm text-gray-500">
                                  {new Date(student.registrationDate).toLocaleTimeString('pt-BR', { 
                                    hour: '2-digit', 
                                    minute: '2-digit' 
                                  })}
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                  student.status === 'complete' 
                                    ? 'bg-green-100 text-green-800' 
                                    : 'bg-yellow-100 text-yellow-800'
                                }`}>
                                  {student.status === 'complete' ? 'Completa' : 'Pendente'}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                <Button 
                                  variant="ghost" 
                                  size="sm" 
                                  className="text-primary hover:text-accent mr-1"
                                  onClick={() => handleViewStudent(student)}
                                >
                                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                  </svg>
                                </Button>
                                <Button 
                                  variant="ghost" 
                                  size="sm" 
                                  className="text-blue-600 hover:text-blue-800 mr-1"
                                >
                                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                  </svg>
                                </Button>
                                <Button 
                                  variant="ghost" 
                                  size="sm" 
                                  className="text-red-600 hover:text-red-800"
                                >
                                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                  </svg>
                                </Button>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </motion.div>
      </div>

      {/* Student Details Modal */}
      {showStudentModal && selectedStudent && (
        <StudentDetailsModal 
          student={selectedStudent} 
          onClose={() => setShowStudentModal(false)} 
        />
      )}
    </div>
  );
}
