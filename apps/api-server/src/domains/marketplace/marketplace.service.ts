import { v4 as uuidv4 } from 'uuid';
import { adminDb } from '@/shared/lib/firebase-admin';
import { 
  collection, 
  doc, 
  addDoc, 
  getDoc, 
  getDocs, 
  updateDoc, 
  deleteDoc,
  query, 
  where, 
  orderBy, 
  limit,
  serverTimestamp,
  Timestamp,
  increment
} from 'firebase-admin/firestore';

import { Company, JobListing, JobApplication, MarketplaceStats } from './marketplace.types';

export class MarketplaceService {
  private static db = adminDb;
  private static companiesCollection = 'marketplace_companies';
  private static listingsCollection = 'marketplace_listings';
  private static applicationsCollection = 'marketplace_applications';

  // Company Management
  static async createCompany(data: Omit<Company, 'id' | 'createdAt' | 'updatedAt' | 'isActive' | 'isVerified'>): Promise<Company> {
    try {
      const companyData = {
        ...data,
        isActive: true,
        isVerified: false,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };

      const docRef = await addDoc(collection(this.db, this.companiesCollection), companyData);
      
      return {
        id: docRef.id,
        ...data,
        isActive: true,
        isVerified: false,
        createdAt: new Date(),
        updatedAt: new Date()
      };
    } catch (error) {
      console.error('Error creating company:', error);
      throw new Error('Failed to create company');
    }
  }

  static async getCompany(companyId: string): Promise<Company | null> {
    try {
      const docRef = doc(this.db, this.companiesCollection, companyId);
      const docSnap = await getDoc(docRef);
      
      if (!docSnap.exists()) {
        return null;
      }

      const data = docSnap.data();
      return this.convertFirestoreToCompany({ id: docSnap.id, ...data });
    } catch (error) {
      console.error('Error getting company:', error);
      throw new Error('Failed to get company');
    }
  }

  static async getCompanies(filters: any = {}): Promise<Company[]> {
    try {
      let q = query(
        collection(this.db, this.companiesCollection),
        where('isActive', '==', true),
        orderBy('createdAt', 'desc')
      );

      if (filters.industry) {
        q = query(q, where('industry', '==', filters.industry));
      }

      if (filters.size) {
        q = query(q, where('size', '==', filters.size));
      }

      if (filters.verified !== undefined) {
        q = query(q, where('isVerified', '==', filters.verified));
      }

      if (filters.limit) {
        q = query(q, limit(filters.limit));
      }

      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(d => this.convertFirestoreToCompany({ id: d.id, ...d.data() }));
    } catch (error) {
      console.error('Error getting companies:', error);
      throw new Error('Failed to get companies');
    }
  }

  static async updateCompany(companyId: string, data: Partial<Company>): Promise<Company> {
    try {
      const docRef = doc(this.db, this.companiesCollection, companyId);
      const docSnap = await getDoc(docRef);
      
      if (!docSnap.exists()) {
        throw new Error('Company not found');
      }

      const updateData: any = {
        ...data,
        updatedAt: serverTimestamp()
      };

      await updateDoc(docRef, updateData);

      const updatedDoc = await getDoc(docRef);
      return this.convertFirestoreToCompany({ id: updatedDoc.id, ...updatedDoc.data() });
    } catch (error) {
      console.error('Error updating company:', error);
      throw error;
    }
  }

  // Job Listing Management
  static async createJobListing(data: Omit<JobListing, 'id' | 'createdAt' | 'updatedAt'>): Promise<JobListing> {
    try {
      const listingData = {
        ...data,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        applicationDeadline: data.applicationDeadline ? Timestamp.fromDate(data.applicationDeadline) : null
      };

      const docRef = await addDoc(collection(this.db, this.listingsCollection), listingData);
      
      return {
        id: docRef.id,
        ...data,
        createdAt: new Date(),
        updatedAt: new Date()
      };
    } catch (error) {
      console.error('Error creating job listing:', error);
      throw new Error('Failed to create job listing');
    }
  }

  static async getJobListing(listingId: string): Promise<JobListing | null> {
    try {
      const docRef = doc(this.db, this.listingsCollection, listingId);
      const docSnap = await getDoc(docRef);
      
      if (!docSnap.exists()) {
        return null;
      }

      const data = docSnap.data();
      return this.convertFirestoreToListing({ id: docSnap.id, ...data });
    } catch (error) {
      console.error('Error getting job listing:', error);
      throw new Error('Failed to get job listing');
    }
  }

  static async getJobListings(filters: any = {}): Promise<JobListing[]> {
    try {
      let q = query(
        collection(this.db, this.listingsCollection),
        where('status', '==', 'published'),
        orderBy('createdAt', 'desc')
      );

      if (filters.companyId) {
        q = query(q, where('companyId', '==', filters.companyId));
      }

      if (filters.employmentType) {
        q = query(q, where('employmentType', '==', filters.employmentType));
      }

      if (filters.experienceLevel) {
        q = query(q, where('experienceLevel', '==', filters.experienceLevel));
      }

      if (filters.department) {
        q = query(q, where('department', '==', filters.department));
      }

      if (filters.limit) {
        q = query(q, limit(filters.limit));
      }

      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(d => this.convertFirestoreToListing({ id: d.id, ...d.data() }));
    } catch (error) {
      console.error('Error getting job listings:', error);
      throw new Error('Failed to get job listings');
    }
  }

  static async updateJobListing(listingId: string, data: Partial<JobListing>): Promise<JobListing> {
    try {
      const docRef = doc(this.db, this.listingsCollection, listingId);
      const docSnap = await getDoc(docRef);
      
      if (!docSnap.exists()) {
        throw new Error('Job listing not found');
      }

      const updateData: any = {
        ...data,
        updatedAt: serverTimestamp()
      };

      if (data.applicationDeadline) {
        updateData.applicationDeadline = Timestamp.fromDate(data.applicationDeadline);
      }

      await updateDoc(docRef, updateData);

      const updatedDoc = await getDoc(docRef);
      return this.convertFirestoreToListing({ id: updatedDoc.id, ...updatedDoc.data() });
    } catch (error) {
      console.error('Error updating job listing:', error);
      throw error;
    }
  }

  static async deleteJobListing(listingId: string): Promise<void> {
    try {
      const docRef = doc(this.db, this.listingsCollection, listingId);
      await deleteDoc(docRef);
    } catch (error) {
      console.error('Error deleting job listing:', error);
      throw new Error('Failed to delete job listing');
    }
  }

  // Application Management
  static async createJobApplication(data: Omit<JobApplication, 'id' | 'appliedAt' | 'status'>): Promise<JobApplication> {
    try {
      const applicationData = {
        ...data,
        status: 'pending' as const,
        appliedAt: serverTimestamp()
      };

      const docRef = await addDoc(collection(this.db, this.applicationsCollection), applicationData);
      
      return {
        id: docRef.id,
        ...data,
        status: 'pending',
        appliedAt: new Date()
      };
    } catch (error) {
      console.error('Error creating job application:', error);
      throw new Error('Failed to create job application');
    }
  }

  static async getJobApplication(applicationId: string): Promise<JobApplication | null> {
    try {
      const docRef = doc(this.db, this.applicationsCollection, applicationId);
      const docSnap = await getDoc(docRef);
      
      if (!docSnap.exists()) {
        return null;
      }

      const data = docSnap.data();
      return this.convertFirestoreToApplication({ id: docSnap.id, ...data });
    } catch (error) {
      console.error('Error getting job application:', error);
      throw new Error('Failed to get job application');
    }
  }

  static async getJobApplicationsByListing(listingId: string, filters: any = {}): Promise<JobApplication[]> {
    try {
      let q = query(
        collection(this.db, this.applicationsCollection),
        where('listingId', '==', listingId),
        orderBy('appliedAt', 'desc')
      );

      if (filters.status) {
        q = query(q, where('status', '==', filters.status));
      }

      if (filters.limit) {
        q = query(q, limit(filters.limit));
      }

      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(d => this.convertFirestoreToApplication({ id: d.id, ...d.data() }));
    } catch (error) {
      console.error('Error getting job applications by listing:', error);
      throw new Error('Failed to get job applications');
    }
  }

  static async getJobApplicationsByApplicant(applicantId: string): Promise<JobApplication[]> {
    try {
      const q = query(
        collection(this.db, this.applicationsCollection),
        where('applicantId', '==', applicantId),
        orderBy('appliedAt', 'desc')
      );

      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(d => this.convertFirestoreToApplication({ id: d.id, ...d.data() }));
    } catch (error) {
      console.error('Error getting job applications by applicant:', error);
      throw new Error('Failed to get job applications');
    }
  }

  static async updateJobApplication(applicationId: string, data: Partial<JobApplication>): Promise<JobApplication> {
    try {
      const docRef = doc(this.db, this.applicationsCollection, applicationId);
      const docSnap = await getDoc(docRef);
      
      if (!docSnap.exists()) {
        throw new Error('Job application not found');
      }

      const updateData: any = { ...data };

      if (data.reviewedAt) {
        updateData.reviewedAt = Timestamp.fromDate(data.reviewedAt);
      }

      await updateDoc(docRef, updateData);

      const updatedDoc = await getDoc(docRef);
      return this.convertFirestoreToApplication({ id: updatedDoc.id, ...updatedDoc.data() });
    } catch (error) {
      console.error('Error updating job application:', error);
      throw error;
    }
  }

  // Statistics
  static async getMarketplaceStats(): Promise<MarketplaceStats> {
    try {
      const [companiesQuery, listingsQuery, applicationsQuery] = await Promise.all([
        getDocs(collection(this.db, this.companiesCollection)),
        getDocs(collection(this.db, this.listingsCollection)),
        getDocs(collection(this.db, this.applicationsCollection))
      ]);

      const companies = companiesQuery.docs.map(doc => doc.data());
      const listings = listingsQuery.docs.map(doc => doc.data());
      const applications = applicationsQuery.docs.map(doc => doc.data());

      const totalCompanies = companies.length;
      const activeCompanies = companies.filter(c => c.isActive).length;
      const totalListings = listings.length;
      const activeListings = listings.filter(l => l.status === 'published').length;
      const totalApplications = applications.length;

      // Applications from last 30 days
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      const recentApplications = applications.filter(a => 
        a.appliedAt && a.appliedAt.toDate() > thirtyDaysAgo
      ).length;

      return {
        totalCompanies,
        activeCompanies,
        totalListings,
        activeListings,
        totalApplications,
        recentApplications
      };
    } catch (error) {
      console.error('Error getting marketplace stats:', error);
      throw new Error('Failed to get marketplace statistics');
    }
  }

  // Helper methods
  private static convertFirestoreToCompany(data: any): Company {
    return {
      id: data.id,
      name: data.name,
      description: data.description,
      industry: data.industry,
      size: data.size,
      location: data.location,
      website: data.website,
      logoUrl: data.logoUrl,
      contactInfo: data.contactInfo,
      isVerified: data.isVerified || false,
      isActive: data.isActive !== false,
      createdBy: data.createdBy,
      createdAt: data.createdAt?.toDate() || new Date(),
      updatedAt: data.updatedAt?.toDate() || new Date()
    };
  }

  private static convertFirestoreToListing(data: any): JobListing {
    return {
      id: data.id,
      companyId: data.companyId,
      title: data.title,
      description: data.description,
      department: data.department,
      location: data.location,
      employmentType: data.employmentType,
      salaryRange: data.salaryRange,
      requirements: data.requirements || [],
      benefits: data.benefits || [],
      skills: data.skills || [],
      experienceLevel: data.experienceLevel,
      status: data.status,
      applicationDeadline: data.applicationDeadline?.toDate(),
      createdBy: data.createdBy,
      createdAt: data.createdAt?.toDate() || new Date(),
      updatedAt: data.updatedAt?.toDate() || new Date()
    };
  }

  private static convertFirestoreToApplication(data: any): JobApplication {
    return {
      id: data.id,
      listingId: data.listingId,
      applicantId: data.applicantId,
      resumeUrl: data.resumeUrl,
      coverLetter: data.coverLetter,
      status: data.status,
      notes: data.notes,
      appliedAt: data.appliedAt?.toDate() || new Date(),
      reviewedAt: data.reviewedAt?.toDate(),
      reviewedBy: data.reviewedBy
    };
  }
}