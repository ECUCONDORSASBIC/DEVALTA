/**
 * GET /api/v1/applications
 * Get applications with filtering and pagination
 */
import { NextRequest, NextResponse } from "next/server";
import { 
  logger, 
  createSuccessResponse, 
  createErrorResponse, 
  UnauthorizedError,
  ValidationError,
  NotFoundError,
  ForbiddenError,
  AppError,
  validateSchema,
  validatePagination
} from "@altamedica/shared";
import { z } from "zod";

// Query parameters schema
const applicationsQuerySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(10),
  sortBy: z.string().optional(),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
  q: z.string().optional(),
  status: z
    .enum([
      "pending",
      "reviewed",
      "interviewing",
      "accepted",
      "rejected",
      "withdrawn",
    ])
    .optional(),
  jobId: z.string().optional(),
  doctorId: z.string().optional(),
  companyId: z.string().optional(),
});

const applicationCreateSchema = z.object({
  jobId: z.string().min(1, "Job ID is required"),
  coverLetter: z.string().min(10, "Cover letter must be at least 10 characters"),
  availableStartDate: z.string().optional(),
  salaryExpectation: z.number().positive().optional(),
  resumeUrl: z.string().url().optional(),
  portfolioUrls: z.array(z.string().url()).optional(),
});

export async function GET(request: NextRequest) {
  try {
    // Mock authentication - En producción sería un middleware real
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedError('Authorization header required');
    }

    // Mock user data - En producción vendría de Firebase Auth
    const user = {
      uid: 'mock-user-id',
      role: 'admin', // 'doctor', 'company', 'admin'
      companyId: 'mock-company-id'
    };

    // Parse and validate query parameters
    const url = new URL(request.url);
    const queryParams = Object.fromEntries(url.searchParams.entries());
    const validation = validateSchema(applicationsQuerySchema, queryParams);

    if (!validation.success) {
      return NextResponse.json(
        createErrorResponse('VALIDATION_ERROR', validation.error),
        { status: 400 }
      );
    }

    const {
      page,
      limit,
      sortBy,
      sortOrder,
      q,
      status,
      jobId,
      doctorId,
      companyId,
    } = validation.data;

    logger.info(`Getting applications for user: ${user.uid}`, validation.data);

    // Mock applications data
    const mockApplications = generateMockApplications(user, { status, jobId, doctorId, companyId, q });
    
    // Apply pagination
    const startIndex = ((page ?? 1) - 1) * (limit ?? 10);
    const endIndex = startIndex + (limit ?? 10);
    const paginatedApplications = mockApplications.slice(startIndex, endIndex);

    // Calculate pagination metadata
    const total = mockApplications.length;
    const totalPages = Math.ceil(total / (limit ?? 10));
    const hasNextPage = (page ?? 1) < totalPages;
    const hasPreviousPage = (page ?? 1) > 1;

    const responseData = {
      applications: paginatedApplications,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNextPage,
        hasPreviousPage,
      },
      filters: {
        status,
        jobId,
        doctorId,
        companyId,
        search: q,
      },
    };

    return NextResponse.json(createSuccessResponse(responseData));
  } catch (error: unknown) {
    logger.error("Get applications error:", error);
    
    if (error instanceof AppError) {
      return NextResponse.json(
        createErrorResponse((error as any).code, (error as any).message, error.details),
        { status: (error as any).statusCode }
      );
    }

    return NextResponse.json(
      createErrorResponse('INTERNAL_ERROR', 'Internal server error'),
      { status: 500 }
    );
  }
}

/**
 * POST /api/v1/applications
 * Create a new job application (doctor only)
 */
export async function POST(request: NextRequest) {
  try {
    // Mock authentication - En producción sería un middleware real
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedError('Authorization header required');
    }

    // Mock user data - En producción vendría de Firebase Auth
    const user = {
      uid: 'mock-doctor-id',
      role: 'doctor', // Only doctors can create applications
      email: 'doctor@altamedica.com'
    };

    // Only doctors can create applications
    if (user.role !== "doctor") {
      throw new ForbiddenError("Only doctors can create job applications");
    }

    // Validate request body
    const body = await request.json();
    const validation = validateSchema(applicationCreateSchema, body);

    if (!validation.success) {
      return NextResponse.json(
        createErrorResponse('VALIDATION_ERROR', validation.error),
        { status: 400 }
      );
    }

    const {
      jobId,
      coverLetter,
      availableStartDate,
      salaryExpectation,
      resumeUrl,
      portfolioUrls,
    } = validation.data;

    logger.info(`Creating application for doctor: ${user.uid}, job: ${jobId}`);

    // Mock check if job exists and is active
    const mockJob = {
      id: jobId,
      title: "Cardiólogo Senior",
      specialty: "Cardiología",
      companyId: "mock-company-id",
      isActive: true,
      applications: 12
    };

    if (!mockJob.isActive) {
      throw new ValidationError("Job listing is no longer active");
    }

    // Mock check if doctor has already applied
    const existingApplication = false; // In real implementation, check database

    if (existingApplication) {
      throw new ValidationError("You have already applied to this job");
    }

    // Create application data
    const applicationData = {
      id: `app-${Date.now()}`,
      jobId,
      doctorId: user.uid,
      companyId: mockJob.companyId,
      coverLetter,
      resumeUrl: resumeUrl || null,
      portfolioUrls: portfolioUrls || [],
      availableStartDate: availableStartDate || null,
      salaryExpectation: salaryExpectation || null,
      status: "pending",
      appliedAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      statusHistory: [
        {
          status: "pending",
          changedAt: new Date().toISOString(),
          changedBy: user.uid,
          notes: "Application submitted",
        },
      ],
      job: {
        id: mockJob.id,
        title: mockJob.title,
        specialty: mockJob.specialty,
      },
      company: {
        id: mockJob.companyId,
        name: "Hospital San José",
        logo: "https://example.com/logo.png",
        location: "Ciudad de México, México",
      },
    };

    logger.info(`Application created successfully: ${applicationData.id}`);
    return NextResponse.json(createSuccessResponse(applicationData), { status: 201 });
  } catch (error: unknown) {
    logger.error("Create application error:", error);
    
    if (error instanceof AppError) {
      return NextResponse.json(
        createErrorResponse((error as any).code, (error as any).message, error.details),
        { status: (error as any).statusCode }
      );
    }

    return NextResponse.json(
      createErrorResponse('INTERNAL_ERROR', 'Internal server error'),
      { status: 500 }
    );
  }
}

// Helper function to generate mock applications data
function generateMockApplications(user: any, filters: any): any[] {
  const mockApplications = [
    {
      id: "app-001",
      jobId: "job-001",
      doctorId: "doctor-001",
      companyId: "company-001",
      coverLetter: "I am very interested in this cardiology position...",
      status: "pending",
      appliedAt: "2025-06-20T10:00:00Z",
      createdAt: "2025-06-20T10:00:00Z",
      job: {
        id: "job-001",
        title: "Cardiólogo Senior",
        specialty: "Cardiología",
        location: "Ciudad de México",
        jobType: "full-time",
        urgency: "high",
        salary: { min: 80000, max: 120000, currency: "MXN" }
      },
      doctor: {
        id: "doctor-001",
        firstName: "Dr. Juan",
        lastName: "Pérez",
        email: "juan.perez@example.com",
        avatar: "https://example.com/avatar1.jpg"
      },
      company: {
        id: "company-001",
        name: "Hospital San José",
        logo: "https://example.com/logo1.png",
        location: "Ciudad de México"
      }
    },
    {
      id: "app-002",
      jobId: "job-002",
      doctorId: "doctor-002",
      companyId: "company-002",
      coverLetter: "I would like to apply for the neurology position...",
      status: "reviewed",
      appliedAt: "2025-06-19T15:30:00Z",
      createdAt: "2025-06-19T15:30:00Z",
      job: {
        id: "job-002",
        title: "Neurólogo",
        specialty: "Neurología",
        location: "Guadalajara",
        jobType: "part-time",
        urgency: "medium",
        salary: { min: 60000, max: 90000, currency: "MXN" }
      },
      doctor: {
        id: "doctor-002",
        firstName: "Dra. María",
        lastName: "González",
        email: "maria.gonzalez@example.com",
        avatar: "https://example.com/avatar2.jpg"
      },
      company: {
        id: "company-002",
        name: "Clínica Médica Guadalajara",
        logo: "https://example.com/logo2.png",
        location: "Guadalajara"
      }
    },
    {
      id: "app-003",
      jobId: "job-003",
      doctorId: "doctor-003",
      companyId: "company-001",
      coverLetter: "I am interested in the pediatrics opportunity...",
      status: "accepted",
      appliedAt: "2025-06-18T09:15:00Z",
      createdAt: "2025-06-18T09:15:00Z",
      job: {
        id: "job-003",
        title: "Pediatra",
        specialty: "Pediatría",
        location: "Monterrey",
        jobType: "full-time",
        urgency: "low",
        salary: { min: 70000, max: 100000, currency: "MXN" }
      },
      doctor: {
        id: "doctor-003",
        firstName: "Dr. Carlos",
        lastName: "Rodríguez",
        email: "carlos.rodriguez@example.com",
        avatar: "https://example.com/avatar3.jpg"
      },
      company: {
        id: "company-001",
        name: "Hospital San José",
        logo: "https://example.com/logo1.png",
        location: "Monterrey"
      }
    }
  ];

  // Apply filters
  let filteredApplications = mockApplications;

  if ((filters as any).status) {
    filteredApplications = filteredApplications.filter((app: any) => app.status === (filters as any).status);
  }
  if (filters.jobId) {
    filteredApplications = filteredApplications.filter((app: any) => app.jobId === filters.jobId);
  }
  if ((filters as any).doctorId) {
    filteredApplications = filteredApplications.filter((app: any) => app.doctorId === (filters as any).doctorId);
  }
  if (filters.companyId) {
    filteredApplications = filteredApplications.filter((app: any) => app.companyId === filters.companyId);
  }
  if (filters.q) {
    const searchText = filters.q.toLowerCase();
    filteredApplications = filteredApplications.filter((app: any) => 
      app.job.title.toLowerCase().includes(searchText) ||
      app.doctor.firstName.toLowerCase().includes(searchText) ||
      app.doctor.lastName.toLowerCase().includes(searchText) ||
      app.company.name.toLowerCase().includes(searchText)
    );
  }

  // Apply role-based filtering
  if (user.role === "doctor") {
    filteredApplications = filteredApplications.filter((app: any) => app.doctorId === user.uid);
  } else if (user.role === "company") {
    filteredApplications = filteredApplications.filter((app: any) => app.companyId === user.companyId);
  }
  // Admins can see all applications

  return filteredApplications;
}
