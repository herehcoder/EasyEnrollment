import { 
  users, students, documents, formFields, documentRequirements, chatMessages,
  courses, courseShifts, courseModalities
} from "@shared/schema";
import type {
  User, InsertUser,
  Student, InsertStudent,
  Document, InsertDocument,
  FormField, InsertFormField,
  DocumentRequirement, InsertDocumentRequirement,
  ChatMessage, InsertChatMessage,
  Course, InsertCourse,
  CourseShift, InsertCourseShift,
  CourseModality, InsertCourseModality
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
  
  // Course methods
  createCourse(course: InsertCourse): Promise<Course>;
  getCourse(id: number): Promise<Course | undefined>;
  getAllCourses(): Promise<Course[]>;
  updateCourse(id: number, course: Partial<Course>): Promise<Course | undefined>;
  deleteCourse(id: number): Promise<void>;
  
  // Course shift methods
  createCourseShift(shift: InsertCourseShift): Promise<CourseShift>;
  getCourseShift(id: number): Promise<CourseShift | undefined>;
  getCourseShiftsByCourseId(courseId: number): Promise<CourseShift[]>;
  updateCourseShift(id: number, shift: Partial<CourseShift>): Promise<CourseShift | undefined>;
  deleteCourseShift(id: number): Promise<void>;
  
  // Course modality methods
  createCourseModality(modality: InsertCourseModality): Promise<CourseModality>;
  getCourseModality(id: number): Promise<CourseModality | undefined>;
  getCourseModalitiesByCourseId(courseId: number): Promise<CourseModality[]>;
  updateCourseModality(id: number, modality: Partial<CourseModality>): Promise<CourseModality | undefined>;
  deleteCourseModality(id: number): Promise<void>;
  seedDefaultCourses(): Promise<void>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private students: Map<number, Student>;
  private documents: Map<number, Document>;
  private formFields: Map<number, FormField>;
  private documentRequirements: Map<number, DocumentRequirement>;
  private chatMessages: Map<number, ChatMessage>;
  private courses: Map<number, Course>;
  private courseShifts: Map<number, CourseShift>;
  private courseModalities: Map<number, CourseModality>;
  
  sessionStore: session.SessionStore;
  private userIdCounter: number;
  private studentIdCounter: number;
  private documentIdCounter: number;
  private formFieldIdCounter: number;
  private documentRequirementIdCounter: number;
  private chatMessageIdCounter: number;
  private courseIdCounter: number;
  private courseShiftIdCounter: number;
  private courseModalityIdCounter: number;

  constructor() {
    this.users = new Map();
    this.students = new Map();
    this.documents = new Map();
    this.formFields = new Map();
    this.documentRequirements = new Map();
    this.chatMessages = new Map();
    this.courses = new Map();
    this.courseShifts = new Map();
    this.courseModalities = new Map();
    
    this.userIdCounter = 1;
    this.studentIdCounter = 1;
    this.documentIdCounter = 1;
    this.formFieldIdCounter = 1;
    this.documentRequirementIdCounter = 1;
    this.chatMessageIdCounter = 1;
    this.courseIdCounter = 1;
    this.courseShiftIdCounter = 1;
    this.courseModalityIdCounter = 1;
    
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

  // Course methods
  async createCourse(course: InsertCourse): Promise<Course> {
    const id = this.courseIdCounter++;
    const now = new Date();
    
    const newCourse: Course = {
      id,
      ...course,
      createdAt: now
    };
    
    this.courses.set(id, newCourse);
    return newCourse;
  }

  async getCourse(id: number): Promise<Course | undefined> {
    return this.courses.get(id);
  }

  async getAllCourses(): Promise<Course[]> {
    return Array.from(this.courses.values());
  }

  async updateCourse(id: number, courseData: Partial<Course>): Promise<Course | undefined> {
    const existingCourse = this.courses.get(id);
    if (!existingCourse) return undefined;
    
    const updatedCourse: Course = {
      ...existingCourse,
      ...courseData
    };
    
    this.courses.set(id, updatedCourse);
    return updatedCourse;
  }

  async deleteCourse(id: number): Promise<void> {
    this.courses.delete(id);
    
    // Also delete related shifts and modalities
    const shiftsToDelete = Array.from(this.courseShifts.values())
      .filter(shift => shift.courseId === id)
      .map(shift => shift.id);
    
    for (const shiftId of shiftsToDelete) {
      this.courseShifts.delete(shiftId);
    }
    
    const modalitiesToDelete = Array.from(this.courseModalities.values())
      .filter(modality => modality.courseId === id)
      .map(modality => modality.id);
    
    for (const modalityId of modalitiesToDelete) {
      this.courseModalities.delete(modalityId);
    }
  }

  // Course shift methods
  async createCourseShift(shift: InsertCourseShift): Promise<CourseShift> {
    const id = this.courseShiftIdCounter++;
    
    const newShift: CourseShift = {
      id,
      ...shift
    };
    
    this.courseShifts.set(id, newShift);
    return newShift;
  }

  async getCourseShift(id: number): Promise<CourseShift | undefined> {
    return this.courseShifts.get(id);
  }

  async getCourseShiftsByCourseId(courseId: number): Promise<CourseShift[]> {
    return Array.from(this.courseShifts.values())
      .filter(shift => shift.courseId === courseId);
  }

  async updateCourseShift(id: number, shiftData: Partial<CourseShift>): Promise<CourseShift | undefined> {
    const existingShift = this.courseShifts.get(id);
    if (!existingShift) return undefined;
    
    const updatedShift: CourseShift = {
      ...existingShift,
      ...shiftData
    };
    
    this.courseShifts.set(id, updatedShift);
    return updatedShift;
  }

  async deleteCourseShift(id: number): Promise<void> {
    this.courseShifts.delete(id);
  }

  // Course modality methods
  async createCourseModality(modality: InsertCourseModality): Promise<CourseModality> {
    const id = this.courseModalityIdCounter++;
    
    const newModality: CourseModality = {
      id,
      ...modality
    };
    
    this.courseModalities.set(id, newModality);
    return newModality;
  }

  async getCourseModality(id: number): Promise<CourseModality | undefined> {
    return this.courseModalities.get(id);
  }

  async getCourseModalitiesByCourseId(courseId: number): Promise<CourseModality[]> {
    return Array.from(this.courseModalities.values())
      .filter(modality => modality.courseId === courseId);
  }

  async updateCourseModality(id: number, modalityData: Partial<CourseModality>): Promise<CourseModality | undefined> {
    const existingModality = this.courseModalities.get(id);
    if (!existingModality) return undefined;
    
    const updatedModality: CourseModality = {
      ...existingModality,
      ...modalityData
    };
    
    this.courseModalities.set(id, updatedModality);
    return updatedModality;
  }

  async deleteCourseModality(id: number): Promise<void> {
    this.courseModalities.delete(id);
  }
  
  // Seed default courses
  async seedDefaultCourses(): Promise<void> {
    // Default courses
    const defaultCourses: Omit<Course, 'id' | 'createdAt'>[] = [
      { 
        name: 'Administração', 
        code: 'ADM', 
        description: 'Curso de Administração com ênfase em gestão de negócios e empreendedorismo',
        duration: 48,
        coordinator: 'Dra. Ana Silva',
        price: 799.90,
        active: true
      },
      { 
        name: 'Engenharia Civil', 
        code: 'ENG-CIV', 
        description: 'Engenharia Civil com foco em construção sustentável e projetos urbanos',
        duration: 60,
        coordinator: 'Dr. Carlos Oliveira',
        price: 1299.90,
        active: true
      },
      { 
        name: 'Direito', 
        code: 'DIR', 
        description: 'Curso de Direito com ênfase em Direito Digital e novas tecnologias',
        duration: 60,
        coordinator: 'Dra. Patrícia Mendes',
        price: 1199.90,
        active: true
      },
      { 
        name: 'Ciência da Computação', 
        code: 'CC', 
        description: 'Ciência da Computação com foco em desenvolvimento de software e IA',
        duration: 48,
        coordinator: 'Dr. Bruno Costa',
        price: 999.90,
        active: true
      },
      { 
        name: 'Medicina', 
        code: 'MED', 
        description: 'Curso de Medicina com ênfase em saúde pública e tecnologias médicas',
        duration: 72,
        coordinator: 'Dra. Márcia Santos',
        price: 5999.90,
        active: true
      }
    ];
    
    for (const course of defaultCourses) {
      const createdCourse = await this.createCourse(course);
      
      // Add shifts for each course
      const shifts = [
        { courseId: createdCourse.id, name: 'Manhã', startTime: '08:00', endTime: '12:00', weekdays: 'seg,ter,qua,qui,sex', active: true },
        { courseId: createdCourse.id, name: 'Tarde', startTime: '13:30', endTime: '17:30', weekdays: 'seg,ter,qua,qui,sex', active: true },
        { courseId: createdCourse.id, name: 'Noite', startTime: '19:00', endTime: '22:30', weekdays: 'seg,ter,qua,qui,sex', active: true }
      ];
      
      for (const shift of shifts) {
        await this.createCourseShift(shift);
      }
      
      // Add modalities for each course
      const modalities = [
        { courseId: createdCourse.id, name: 'Presencial', description: 'Aulas totalmente presenciais', active: true },
        { courseId: createdCourse.id, name: 'Semipresencial', description: 'Aulas presenciais e online', active: true },
        { courseId: createdCourse.id, name: 'EAD', description: 'Ensino à distância com encontros online', active: true }
      ];
      
      for (const modality of modalities) {
        await this.createCourseModality(modality);
      }
    }
  }
}

export const storage = new MemStorage();
