export { prisma as default } from './client.js'
export { TelemedicineService } from './services/telemedicine-service.js'
export type { 
  TelemedicineSessionWithRelations,
  CreateTelemedicineSessionData,
  UpdateTelemedicineSessionData,
  CreateChatMessageData,
  TelemedicineStatsFilter,
  TelemedicineStats
} from './services/telemedicine-service.js'