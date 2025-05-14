import { users, students, documents, formFields, documentRequirements, chatMessages } from "@shared/schema";
import type {
  User, InsertUser,
  Student, InsertStudent,
  Document, InsertDocument,
  FormField, InsertFormField,
  DocumentRequirement, InsertDocumentRequirement,
  ChatMessage, InsertChatMessage
} from "@shared/schema";
import session from "express-session";
import createMemoryStore from "memorystore";

const MemoryStore = createMemoryStore(session);

export interface IStorage {
  // Session store
  sessionStore: session.SessionStore;
  
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: Partial<User>): Promise<User>;
  
  // Student methods
  createStudent(student: InsertStudent): Promise<Student>;
  getStudent(id: number): Promise<Student | undefined>;
  getAllStudents(): Promise<Student[]>;
  updateStudent(id: number, student: Partial<Student>): Promise<Student | undefined>;
  
  // Document methods
  createDocument(document: InsertDocument): Promise<Document>;
  getDocument(id: number): Promise<Document | undefined>;
  getDocumentsByStudentId(studentId: number): Promise<Document[]>;
  
  // Form field methods
  createFormField(field: InsertFormField): Promise<FormField>;
  getFormField(id: number): Promise<FormField | undefined>;
  getAllFormFields(): Promise<FormField[]>;
  updateFormField(id: number, field: Partial<FormField>): Promise<FormField | undefined>;
  deleteFormField(id: number): Promise<void>;
  seedDefaultFormFields(): Promise<void>;
  
  // Document requirement methods
  createDocumentRequirement(requirement: InsertDocumentRequirement): Promise<DocumentRequirement>;
  getDocumentRequirement(id: number): Promise<DocumentRequirement | undefined>;
  getAllDocumentRequirements(): Promise<DocumentRequirement[]>;
  updateDocumentRequirement(id: number, requirement: Partial<DocumentRequirement>): Promise<DocumentRequirement | undefined>;
  deleteDocumentRequirement(id: number): Promise<void>;
  seedDefaultDocumentRequirements(): Promise<void>;
  
  // Chat message methods
  createChatMessage(message: InsertChatMessage): Promise<ChatMessage>;
  getChatMessage(id: number): Promise<ChatMessage | undefined>;
  getChatMessagesByStudentId(studentId: number): Promise<ChatMessage[]>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private students: Map<number, Student>;
  private documents: Map<number, Document>;
  private formFields: Map<number, FormField>;
  private documentRequirements: Map<number, DocumentRequirement>;
  private chatMessages: Map<number, ChatMessage>;
  
  sessionStore: session.SessionStore;
  private userIdCounter: number;
  private studentIdCounter: number;
  private documentIdCounter: number;
  private formFieldIdCounter: number;
  private documentRequirementIdCounter: number;
  private chatMessageIdCounter: number;

  constructor() {
    this.users = new Map();
    this.students = new Map();
    this.documents = new Map();
    this.formFields = new Map();
    this.documentRequirements = new Map();
    this.chatMessages = new Map();
    
    this.userIdCounter = 1;
    this.studentIdCounter = 1;
    this.documentIdCounter = 1;
    this.formFieldIdCounter = 1;
    this.documentRequirementIdCounter = 1;
    this.chatMessageIdCounter = 1;
    
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000 // 24 hours
    });
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username
    );
  }

  async createUser(user: Partial<User>): Promise<User> {
    const id = this.userIdCounter++;
    const newUser: User = {
      id,
      username: user.username!,
      password: user.password!,
      isAdmin: user.isAdmin || false
    };
    this.users.set(id, newUser);
    return newUser;
  }

  // Student methods
  async createStudent(student: InsertStudent): Promise<Student> {
    const id = this.studentIdCounter++;
    const now = new Date();
    
    const newStudent: Student = {
      id,
      ...student,
      registrationDate: now
    };
    
    this.students.set(id, newStudent);
    return newStudent;
  }

  async getStudent(id: number): Promise<Student | undefined> {
    return this.students.get(id);
  }

  async getAllStudents(): Promise<Student[]> {
    return Array.from(this.students.values());
  }

  async updateStudent(id: number, studentData: Partial<Student>): Promise<Student | undefined> {
    const existingStudent = this.students.get(id);
    if (!existingStudent) return undefined;
    
    const updatedStudent: Student = {
      ...existingStudent,
      ...studentData
    };
    
    this.students.set(id, updatedStudent);
    return updatedStudent;
  }

  // Document methods
  async createDocument(document: InsertDocument): Promise<Document> {
    const id = this.documentIdCounter++;
    const now = new Date();
    
    const newDocument: Document = {
      id,
      ...document,
      uploadDate: now
    };
    
    this.documents.set(id, newDocument);
    return newDocument;
  }

  async getDocument(id: number): Promise<Document | undefined> {
    return this.documents.get(id);
  }

  async getDocumentsByStudentId(studentId: number): Promise<Document[]> {
    return Array.from(this.documents.values()).filter(
      (doc) => doc.studentId === studentId
    );
  }

  // Form field methods
  async createFormField(field: InsertFormField): Promise<FormField> {
    const id = this.formFieldIdCounter++;
    
    const newField: FormField = {
      id,
      ...field
    };
    
    this.formFields.set(id, newField);
    return newField;
  }

  async getFormField(id: number): Promise<FormField | undefined> {
    return this.formFields.get(id);
  }

  async getAllFormFields(): Promise<FormField[]> {
    return Array.from(this.formFields.values()).sort((a, b) => a.order - b.order);
  }

  async updateFormField(id: number, fieldData: Partial<FormField>): Promise<FormField | undefined> {
    const existingField = this.formFields.get(id);
    if (!existingField) return undefined;
    
    const updatedField: FormField = {
      ...existingField,
      ...fieldData
    };
    
    this.formFields.set(id, updatedField);
    return updatedField;
  }

  async deleteFormField(id: number): Promise<void> {
    this.formFields.delete(id);
  }

  async seedDefaultFormFields(): Promise<void> {
    const defaultFields: Omit<FormField, 'id'>[] = [
      { name: 'fullName', label: 'Nome Completo', type: 'text', required: true, order: 1, section: 'personal', active: true },
      { name: 'cpf', label: 'CPF', type: 'text', required: true, order: 2, section: 'personal', active: true },
      { name: 'rg', label: 'RG', type: 'text', required: true, order: 3, section: 'personal', active: true },
      { name: 'birthDate', label: 'Data de Nascimento', type: 'date', required: true, order: 4, section: 'personal', active: true },
      { name: 'gender', label: 'Gênero', type: 'select', required: true, order: 5, section: 'personal', active: true },
      { name: 'address', label: 'Endereço', type: 'text', required: true, order: 6, section: 'personal', active: true },
      { name: 'city', label: 'Cidade', type: 'text', required: true, order: 7, section: 'personal', active: true },
      { name: 'state', label: 'Estado', type: 'select', required: true, order: 8, section: 'personal', active: true },
      { name: 'zipCode', label: 'CEP', type: 'text', required: true, order: 9, section: 'personal', active: true },
      { name: 'email', label: 'Email', type: 'email', required: true, order: 1, section: 'contact', active: true },
      { name: 'phone', label: 'Telefone Celular', type: 'tel', required: true, order: 2, section: 'contact', active: true },
      { name: 'whatsapp', label: 'WhatsApp', type: 'tel', required: false, order: 3, section: 'contact', active: true },
      { name: 'emergencyContact', label: 'Nome do Contato de Emergência', type: 'text', required: false, order: 4, section: 'contact', active: true },
      { name: 'emergencyPhone', label: 'Telefone de Emergência', type: 'tel', required: false, order: 5, section: 'contact', active: true },
      { name: 'course', label: 'Curso Desejado', type: 'select', required: true, order: 1, section: 'course', active: true },
      { name: 'shift', label: 'Turno', type: 'radio', required: true, order: 2, section: 'course', active: true },
      { name: 'modality', label: 'Modalidade', type: 'radio', required: true, order: 3, section: 'course', active: true },
      { name: 'additionalInfo', label: 'Informações Adicionais', type: 'textarea', required: false, order: 4, section: 'course', active: true },
    ];
    
    for (const field of defaultFields) {
      await this.createFormField(field);
    }
  }

  // Document requirement methods
  async createDocumentRequirement(requirement: InsertDocumentRequirement): Promise<DocumentRequirement> {
    const id = this.documentRequirementIdCounter++;
    
    const newRequirement: DocumentRequirement = {
      id,
      ...requirement
    };
    
    this.documentRequirements.set(id, newRequirement);
    return newRequirement;
  }

  async getDocumentRequirement(id: number): Promise<DocumentRequirement | undefined> {
    return this.documentRequirements.get(id);
  }

  async getAllDocumentRequirements(): Promise<DocumentRequirement[]> {
    return Array.from(this.documentRequirements.values()).sort((a, b) => a.order - b.order);
  }

  async updateDocumentRequirement(id: number, requirementData: Partial<DocumentRequirement>): Promise<DocumentRequirement | undefined> {
    const existingRequirement = this.documentRequirements.get(id);
    if (!existingRequirement) return undefined;
    
    const updatedRequirement: DocumentRequirement = {
      ...existingRequirement,
      ...requirementData
    };
    
    this.documentRequirements.set(id, updatedRequirement);
    return updatedRequirement;
  }

  async deleteDocumentRequirement(id: number): Promise<void> {
    this.documentRequirements.delete(id);
  }

  async seedDefaultDocumentRequirements(): Promise<void> {
    const defaultRequirements: Omit<DocumentRequirement, 'id'>[] = [
      { name: 'RG (frente e verso)', description: 'Documento de identidade com foto', required: true, active: true, order: 1 },
      { name: 'CPF', description: 'Cadastro de Pessoa Física', required: true, active: true, order: 2 },
      { name: 'Comprovante de Residência', description: 'Conta de água, luz ou telefone (últimos 3 meses)', required: true, active: true, order: 3 },
      { name: 'Certificado de Conclusão do Ensino Médio', description: 'Documento oficial que comprove a conclusão do ensino médio', required: true, active: true, order: 4 },
      { name: 'Foto 3x4 recente', description: 'Foto colorida com fundo branco', required: true, active: true, order: 5 }
    ];
    
    for (const requirement of defaultRequirements) {
      await this.createDocumentRequirement(requirement);
    }
  }

  // Chat message methods
  async createChatMessage(message: InsertChatMessage): Promise<ChatMessage> {
    const id = this.chatMessageIdCounter++;
    const now = new Date();
    
    const newMessage: ChatMessage = {
      id,
      ...message,
      timestamp: now
    };
    
    this.chatMessages.set(id, newMessage);
    return newMessage;
  }

  async getChatMessage(id: number): Promise<ChatMessage | undefined> {
    return this.chatMessages.get(id);
  }

  async getChatMessagesByStudentId(studentId: number): Promise<ChatMessage[]> {
    return Array.from(this.chatMessages.values())
      .filter(msg => msg.studentId === studentId)
      .sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
  }
}

export const storage = new MemStorage();
