/**
 * GET /api/v1/dashboard/analytics
 * Get analytics data for charts and graphs
 */
import { NextRequest, NextResponse } from "next/server";
import { 
  logger, 
  createSuccessResponse, 
  createErrorResponse, 
  UnauthorizedError,
  AppError,
  validateSchema
} from "@altamedica/shared";
import { z } from "zod";

// Query parameters schema
const analyticsQuerySchema = z.object({
  period: z.enum(["week", "month", "quarter", "year"]).default("month"),
  metric: z.enum(["applications", "jobs", "views", "users"]).optional(),
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

    // Parse query parameters
    const url = new URL(request.url);
    const queryParams = Object.fromEntries(url.searchParams.entries());
    const validation = validateSchema(analyticsQuerySchema, queryParams);

    if (!validation.success) {
      return NextResponse.json(
        createErrorResponse('VALIDATION_ERROR', validation.error),
        { status: 400 }
      );
    }    const { period, metric } = validation.data;
    const periodValue = period || "month"; // Ensure we have a default value
    
    logger.info(
      `Getting analytics for user: ${user.uid}, period: ${periodValue}, metric: ${metric}`
    );

    // Calculate date range based on period
    const now = new Date();
    const startDate = new Date();
    let groupBy: string;

    switch (periodValue) {
      case "week":
        startDate.setDate(now.getDate() - 7);
        groupBy = "day";
        break;
      case "month":
        startDate.setMonth(now.getMonth() - 1);
        groupBy = "day";
        break;
      case "quarter":
        startDate.setMonth(now.getMonth() - 3);
        groupBy = "week";
        break;
      case "year":
        startDate.setFullYear(now.getFullYear() - 1);
        groupBy = "month";
        break;
    }

    // Mock analytics data - En producción vendría de Firestore
    let analytics: Record<string, unknown> = {};

    if (user.role === "company") {      // Company analytics mock data
      analytics = {
        applicationsOverTime: generateMockTimeSeriesData(periodValue, 'applications'),
        jobsOverTime: generateMockTimeSeriesData(periodValue, 'jobs'),
        applicationsByStatus: {
          pending: 45,
          reviewed: 23,
          interviewing: 12,
          accepted: 8,
          rejected: 15,
          withdrawn: 3
        },
        topSpecialties: [
          { specialty: "Cardiología", count: 25 },
          { specialty: "Neurología", count: 18 },
          { specialty: "Pediatría", count: 15 },
          { specialty: "Ginecología", count: 12 },
          { specialty: "Medicina General", count: 10 }
        ]
      };
    } else if (user.role === "doctor") {      // Doctor analytics mock data
      analytics = {
        applicationsOverTime: generateMockTimeSeriesData(periodValue, 'applications'),
        applicationsByStatus: {
          pending: 8,
          reviewed: 5,
          interviewing: 2,
          accepted: 1,
          rejected: 3,
          withdrawn: 1
        },
        applicationsByJobType: {
          "full-time": 12,
          "part-time": 5,
          "contract": 3,
          "temporary": 2
        }
      };
    } else if (user.role === "admin") {
      // Admin analytics mock data
      analytics = {
        usersOverTime: generateMockTimeSeriesData(periodValue, 'users'),
        jobsOverTime: generateMockTimeSeriesData(periodValue, 'jobs'),
        applicationsOverTime: generateMockTimeSeriesData(periodValue, 'applications'),
        usersByRole: {
          doctor: 450,
          company: 85,
          admin: 5
        },
        jobsBySpecialty: [
          { specialty: "Cardiología", count: 125 },
          { specialty: "Neurología", count: 98 },
          { specialty: "Pediatría", count: 87 },
          { specialty: "Ginecología", count: 76 },
          { specialty: "Medicina General", count: 65 },
          { specialty: "Psiquiatría", count: 54 },
          { specialty: "Dermatología", count: 43 },
          { specialty: "Oftalmología", count: 32 },
          { specialty: "Urología", count: 28 },
          { specialty: "Endocrinología", count: 21 }
        ],
        applicationsByStatus: {
          pending: 234,
          reviewed: 156,
          interviewing: 89,
          accepted: 67,
          rejected: 145,
          withdrawn: 23
        }
      };
    }    const responseData = {
      period: periodValue,
      dateRange: { startDate, endDate: now },
      analytics,
    };

    return NextResponse.json(createSuccessResponse(responseData));
  } catch (error: unknown) {
    logger.error("Get analytics error:", error);
    
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

// Helper function to generate mock time series data
function generateMockTimeSeriesData(period: string, dataType: string): Record<string, number> {
  const data: Record<string, number> = {};
  const now = new Date();
  let days: number;

  switch (period) {
    case "week":
      days = 7;
      break;
    case "month":
      days = 30;
      break;
    case "quarter":
      days = 90;
      break;
    case "year":
      days = 365;
      break;
    default:
      days = 30;
  }

  for (let i = days; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(now.getDate() - i);
    const key = date.toISOString().split("T")[0]; // YYYY-MM-DD format

    // Generate realistic mock data based on data type
    let value: number;
    switch (dataType) {
      case 'applications':
        value = Math.floor(Math.random() * 20) + 5; // 5-25 applications per day
        break;
      case 'jobs':
        value = Math.floor(Math.random() * 10) + 1; // 1-11 jobs per day
        break;
      case 'users':
        value = Math.floor(Math.random() * 15) + 2; // 2-17 new users per day
        break;
      default:
        value = Math.floor(Math.random() * 10) + 1;
    }

    data[key] = value;
  }

  return data;
}
