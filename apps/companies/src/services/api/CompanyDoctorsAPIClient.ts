/**
 * 👨‍⚕️ COMPANY DOCTORS API CLIENT
 * Cliente API especializado para gestión de doctores en empresas
 */

import { BaseAPIClient } from '@altamedica/shared'
import { CompanyDoctor, APIResponse } from '@altamedica/types'

export class CompanyDoctorsAPIClient extends BaseAPIClient {
  constructor() {
    super('/companies')
  }

  // =====================================
  // GESTIÓN DE DOCTORES
  // =====================================

  async getCompanyDoctors(companyId: string): Promise<APIResponse<CompanyDoctor[]>> {
    return this.get<CompanyDoctor[]>(`/${companyId}/doctors`)
  }

  async addDoctorToCompany(
    companyId: string,
    doctorData: Partial<CompanyDoctor>
  ): Promise<APIResponse<CompanyDoctor>> {
    return this.post<CompanyDoctor>(doctorData, `/${companyId}/doctors`)
  }

  async updateDoctorInCompany(
    companyId: string,
    doctorId: string,
    data: Partial<CompanyDoctor>
  ): Promise<APIResponse<CompanyDoctor>> {
    return this.put<CompanyDoctor>(data, `/${companyId}/doctors/${doctorId}`)
  }

  async removeDoctorFromCompany(
    companyId: string,
    doctorId: string
  ): Promise<APIResponse<{ success: boolean }>> {
    return this.delete<{ success: boolean }>(`/${companyId}/doctors/${doctorId}`)
  }

  // =====================================
  // ESTADÍSTICAS DE DOCTORES
  // =====================================

  async getDoctorStats(companyId: string): Promise<APIResponse<{
    totalDoctors: number
    activeDoctors: number
    doctorsBySpecialty: Record<string, number>
    averageExperience: number
    retentionRate: number
  }>> {
    return this.get(`/${companyId}/doctors/stats`)
  }
}