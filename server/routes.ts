import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth } from "./auth";
import { 
  insertStudentSchema, 
  insertDocumentSchema, 
  insertFormFieldSchema, 
  insertDocumentRequirementSchema, 
  insertChatMessageSchema,
  insertCourseSchema,
  insertCourseShiftSchema,
  insertCourseModalitySchema
} from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Set up authentication routes
  await setupAuth(app);

  // API routes for students
  app.post("/api/students", async (req, res) => {
    try {
      const validatedData = insertStudentSchema.parse(req.body);
      const student = await storage.createStudent(validatedData);
      res.status(201).json(student);
    } catch (error) {
      res.status(400).json({ message: error instanceof Error ? error.message : "Erro na validação dos dados" });
    }
  });

  app.get("/api/students", async (req, res) => {
    try {
      const students = await storage.getAllStudents();
      res.json(students);
    } catch (error) {
      res.status(500).json({ message: "Erro ao buscar estudantes" });
    }
  });

  app.get("/api/students/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "ID inválido" });
      }
      
      const student = await storage.getStudent(id);
      if (!student) {
        return res.status(404).json({ message: "Estudante não encontrado" });
      }
      
      res.json(student);
    } catch (error) {
      res.status(500).json({ message: "Erro ao buscar estudante" });
    }
  });

  app.put("/api/students/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "ID inválido" });
      }
      
      const validatedData = insertStudentSchema.parse(req.body);
      const updatedStudent = await storage.updateStudent(id, validatedData);
      
      if (!updatedStudent) {
        return res.status(404).json({ message: "Estudante não encontrado" });
      }
      
      res.json(updatedStudent);
    } catch (error) {
      res.status(400).json({ message: error instanceof Error ? error.message : "Erro na validação dos dados" });
    }
  });

  // API routes for documents
  app.post("/api/documents", async (req, res) => {
    try {
      const validatedData = insertDocumentSchema.parse(req.body);
      const document = await storage.createDocument(validatedData);
      res.status(201).json(document);
    } catch (error) {
      res.status(400).json({ message: error instanceof Error ? error.message : "Erro na validação dos dados" });
    }
  });

  app.get("/api/students/:id/documents", async (req, res) => {
    try {
      const studentId = parseInt(req.params.id);
      if (isNaN(studentId)) {
        return res.status(400).json({ message: "ID inválido" });
      }
      
      const documents = await storage.getDocumentsByStudentId(studentId);
      res.json(documents);
    } catch (error) {
      res.status(500).json({ message: "Erro ao buscar documentos" });
    }
  });

  // API routes for form customization
  app.get("/api/form-fields", async (req, res) => {
    try {
      const fields = await storage.getAllFormFields();
      res.json(fields);
    } catch (error) {
      res.status(500).json({ message: "Erro ao buscar campos do formulário" });
    }
  });

  app.post("/api/admin/form-fields", async (req, res) => {
    try {
      const validatedData = insertFormFieldSchema.parse(req.body);
      const field = await storage.createFormField(validatedData);
      res.status(201).json(field);
    } catch (error) {
      res.status(400).json({ message: error instanceof Error ? error.message : "Erro na validação dos dados" });
    }
  });

  app.put("/api/admin/form-fields/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "ID inválido" });
      }
      
      const validatedData = insertFormFieldSchema.parse(req.body);
      const updatedField = await storage.updateFormField(id, validatedData);
      
      if (!updatedField) {
        return res.status(404).json({ message: "Campo não encontrado" });
      }
      
      res.json(updatedField);
    } catch (error) {
      res.status(400).json({ message: error instanceof Error ? error.message : "Erro na validação dos dados" });
    }
  });

  app.delete("/api/admin/form-fields/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "ID inválido" });
      }
      
      await storage.deleteFormField(id);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Erro ao excluir campo" });
    }
  });

  // API routes for document requirements
  app.get("/api/document-requirements", async (req, res) => {
    try {
      const requirements = await storage.getAllDocumentRequirements();
      res.json(requirements);
    } catch (error) {
      res.status(500).json({ message: "Erro ao buscar requisitos de documentos" });
    }
  });

  app.post("/api/admin/document-requirements", async (req, res) => {
    try {
      const validatedData = insertDocumentRequirementSchema.parse(req.body);
      const requirement = await storage.createDocumentRequirement(validatedData);
      res.status(201).json(requirement);
    } catch (error) {
      res.status(400).json({ message: error instanceof Error ? error.message : "Erro na validação dos dados" });
    }
  });

  app.put("/api/admin/document-requirements/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "ID inválido" });
      }
      
      const validatedData = insertDocumentRequirementSchema.parse(req.body);
      const updatedRequirement = await storage.updateDocumentRequirement(id, validatedData);
      
      if (!updatedRequirement) {
        return res.status(404).json({ message: "Requisito não encontrado" });
      }
      
      res.json(updatedRequirement);
    } catch (error) {
      res.status(400).json({ message: error instanceof Error ? error.message : "Erro na validação dos dados" });
    }
  });

  app.delete("/api/admin/document-requirements/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "ID inválido" });
      }
      
      await storage.deleteDocumentRequirement(id);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Erro ao excluir requisito" });
    }
  });
  
  // API routes for chat messages
  app.post("/api/chat-messages", async (req, res) => {
    try {
      const validatedData = insertChatMessageSchema.parse(req.body);
      const message = await storage.createChatMessage(validatedData);
      res.status(201).json(message);
    } catch (error) {
      res.status(400).json({ message: error instanceof Error ? error.message : "Erro na validação dos dados" });
    }
  });

  app.get("/api/students/:id/chat-messages", async (req, res) => {
    try {
      const studentId = parseInt(req.params.id);
      if (isNaN(studentId)) {
        return res.status(400).json({ message: "ID inválido" });
      }
      
      const messages = await storage.getChatMessagesByStudentId(studentId);
      res.json(messages);
    } catch (error) {
      res.status(500).json({ message: "Erro ao buscar mensagens" });
    }
  });

  // Initialize default form fields if none exist
  const existingFields = await storage.getAllFormFields();
  if (existingFields.length === 0) {
    await storage.seedDefaultFormFields();
  }
  
  // Initialize default document requirements if none exist
  const existingRequirements = await storage.getAllDocumentRequirements();
  if (existingRequirements.length === 0) {
    await storage.seedDefaultDocumentRequirements();
  }
  
  // API routes for courses
  app.get("/api/courses", async (req, res) => {
    try {
      const courses = await storage.getAllCourses();
      res.json(courses);
    } catch (error) {
      res.status(500).json({ message: "Erro ao buscar cursos" });
    }
  });
  
  app.get("/api/courses/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "ID inválido" });
      }
      
      const course = await storage.getCourse(id);
      if (!course) {
        return res.status(404).json({ message: "Curso não encontrado" });
      }
      
      res.json(course);
    } catch (error) {
      res.status(500).json({ message: "Erro ao buscar curso" });
    }
  });
  
  app.post("/api/admin/courses", async (req, res) => {
    try {
      // Ensure user is admin
      if (!req.user?.isAdmin) {
        return res.status(403).json({ message: "Acesso não autorizado" });
      }
      
      const validatedData = insertCourseSchema.parse(req.body);
      const course = await storage.createCourse(validatedData);
      res.status(201).json(course);
    } catch (error) {
      res.status(400).json({ message: error instanceof Error ? error.message : "Erro na validação dos dados" });
    }
  });
  
  app.put("/api/admin/courses/:id", async (req, res) => {
    try {
      // Ensure user is admin
      if (!req.user?.isAdmin) {
        return res.status(403).json({ message: "Acesso não autorizado" });
      }
      
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "ID inválido" });
      }
      
      const validatedData = insertCourseSchema.parse(req.body);
      const updatedCourse = await storage.updateCourse(id, validatedData);
      
      if (!updatedCourse) {
        return res.status(404).json({ message: "Curso não encontrado" });
      }
      
      res.json(updatedCourse);
    } catch (error) {
      res.status(400).json({ message: error instanceof Error ? error.message : "Erro na validação dos dados" });
    }
  });
  
  app.delete("/api/admin/courses/:id", async (req, res) => {
    try {
      // Ensure user is admin
      if (!req.user?.isAdmin) {
        return res.status(403).json({ message: "Acesso não autorizado" });
      }
      
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "ID inválido" });
      }
      
      await storage.deleteCourse(id);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Erro ao excluir curso" });
    }
  });
  
  // API routes for course shifts
  app.get("/api/courses/:id/shifts", async (req, res) => {
    try {
      const courseId = parseInt(req.params.id);
      if (isNaN(courseId)) {
        return res.status(400).json({ message: "ID inválido" });
      }
      
      const shifts = await storage.getCourseShiftsByCourseId(courseId);
      res.json(shifts);
    } catch (error) {
      res.status(500).json({ message: "Erro ao buscar turnos" });
    }
  });
  
  app.post("/api/admin/course-shifts", async (req, res) => {
    try {
      // Ensure user is admin
      if (!req.user?.isAdmin) {
        return res.status(403).json({ message: "Acesso não autorizado" });
      }
      
      const validatedData = insertCourseShiftSchema.parse(req.body);
      const shift = await storage.createCourseShift(validatedData);
      res.status(201).json(shift);
    } catch (error) {
      res.status(400).json({ message: error instanceof Error ? error.message : "Erro na validação dos dados" });
    }
  });
  
  app.put("/api/admin/course-shifts/:id", async (req, res) => {
    try {
      // Ensure user is admin
      if (!req.user?.isAdmin) {
        return res.status(403).json({ message: "Acesso não autorizado" });
      }
      
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "ID inválido" });
      }
      
      const validatedData = insertCourseShiftSchema.parse(req.body);
      const updatedShift = await storage.updateCourseShift(id, validatedData);
      
      if (!updatedShift) {
        return res.status(404).json({ message: "Turno não encontrado" });
      }
      
      res.json(updatedShift);
    } catch (error) {
      res.status(400).json({ message: error instanceof Error ? error.message : "Erro na validação dos dados" });
    }
  });
  
  app.delete("/api/admin/course-shifts/:id", async (req, res) => {
    try {
      // Ensure user is admin
      if (!req.user?.isAdmin) {
        return res.status(403).json({ message: "Acesso não autorizado" });
      }
      
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "ID inválido" });
      }
      
      await storage.deleteCourseShift(id);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Erro ao excluir turno" });
    }
  });
  
  // API routes for course modalities
  app.get("/api/courses/:id/modalities", async (req, res) => {
    try {
      const courseId = parseInt(req.params.id);
      if (isNaN(courseId)) {
        return res.status(400).json({ message: "ID inválido" });
      }
      
      const modalities = await storage.getCourseModalitiesByCourseId(courseId);
      res.json(modalities);
    } catch (error) {
      res.status(500).json({ message: "Erro ao buscar modalidades" });
    }
  });
  
  app.post("/api/admin/course-modalities", async (req, res) => {
    try {
      // Ensure user is admin
      if (!req.user?.isAdmin) {
        return res.status(403).json({ message: "Acesso não autorizado" });
      }
      
      const validatedData = insertCourseModalitySchema.parse(req.body);
      const modality = await storage.createCourseModality(validatedData);
      res.status(201).json(modality);
    } catch (error) {
      res.status(400).json({ message: error instanceof Error ? error.message : "Erro na validação dos dados" });
    }
  });
  
  app.put("/api/admin/course-modalities/:id", async (req, res) => {
    try {
      // Ensure user is admin
      if (!req.user?.isAdmin) {
        return res.status(403).json({ message: "Acesso não autorizado" });
      }
      
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "ID inválido" });
      }
      
      const validatedData = insertCourseModalitySchema.parse(req.body);
      const updatedModality = await storage.updateCourseModality(id, validatedData);
      
      if (!updatedModality) {
        return res.status(404).json({ message: "Modalidade não encontrada" });
      }
      
      res.json(updatedModality);
    } catch (error) {
      res.status(400).json({ message: error instanceof Error ? error.message : "Erro na validação dos dados" });
    }
  });
  
  app.delete("/api/admin/course-modalities/:id", async (req, res) => {
    try {
      // Ensure user is admin
      if (!req.user?.isAdmin) {
        return res.status(403).json({ message: "Acesso não autorizado" });
      }
      
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "ID inválido" });
      }
      
      await storage.deleteCourseModality(id);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Erro ao excluir modalidade" });
    }
  });
  
  // Initialize default courses if none exist
  const existingCourses = await storage.getAllCourses();
  if (existingCourses.length === 0) {
    await storage.seedDefaultCourses();
  }

  const httpServer = createServer(app);
  return httpServer;
}
