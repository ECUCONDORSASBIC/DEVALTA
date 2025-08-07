import { v4 as uuidv4 } from 'uuid';
import { adminDb } from '@/lib/firebase-admin';
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

// Interfaces
export interface Company {
  id: string;
  name: string;
  description?: string;
  location?: string;
  website?: string;
  contactEmail: string;
  phone?: string;
  size?: 'startup' | 'small' | 'medium' | 'large' | 'enterprise';
  industry?: string;
  specialties: string[];
  ownerId: string;
  createdBy?: string;
  updatedBy?: string;
  createdAt: Date;
  updatedAt: Date;
  status: 'active' | 'inactive' | 'suspended';
}

export interface MarketplaceListing {
  id: string;
  title: string;
  description: string;
  category: 'job' | 'service' | 'equipment' | 'consultation';
  type: 'full-time' | 'part-time' | 'contract' | 'consultation' | 'one-time';
  location?: string;
  remote: boolean;
  requirements: string[];
  benefits: string[];
  salaryRange?: {
    min?: number;
    max?: number;
    currency: string;
  };
  applicationDeadline?: Date;
  tags: string[];
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'active' | 'paused' | 'closed';
  companyId: string;
  createdBy: string;
  updatedBy?: string;
  createdAt: Date;
  updatedAt: Date;
  viewCount: number;
  applicationCount: number;
}

export interface MarketplaceApplication {
  id: string;
  listingId: string;
  applicantId: string;
  coverLetter: string;
  resume?: string;
  additionalInfo?: string;
  availabilityDate?: Date;
  expectedSalary?: number;
  status: 'pending' | 'reviewing' | 'accepted' | 'rejected';
  reviewNotes?: string;
  interviewDate?: Date;
  rejectionReason?: string;
  reviewedBy?: string;
  reviewedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

class MarketplaceService {
  private static db = adminDb;
  private static companiesCollection = 'marketplace_companies';
  private static listingsCollection = 'marketplace_listings';
  private static applicationsCollection = 'marketplace_applications';

  // Company Management
  static async createCompany(data: Omit<Company, 'id' | 'createdAt' | 'updatedAt' | 'status'>): Promise<Company> {
    try {
      const companyData = {
        ...data,
        status: 'active' as const,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };

      const docRef = await addDoc(collection(this.db, this.companiesCollection), companyData);
      
      return {
        id: docRef.id,
        ...data,
        status: 'active',
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

  static async getCompanies(filters: any = {}): Promise<{ companies: Company[]; count: number }> {
    try {
      let q = query(
        collection(this.db, this.companiesCollection),
        where('status', '==', 'active'),
        orderBy('createdAt', 'desc')
      );

      if (filters.industry) {
        q = query(q, where('industry', '==', filters.industry));
      }

      if (filters.size) {
        q = query(q, where('size', '==', filters.size));
      }

      if (filters.location) {
        q = query(q, where('location', '==', filters.location));
      }

      if (filters.limit) {
        q = query(q, limit(filters.limit));
      }

      const querySnapshot = await getDocs(q);
      const companies = querySnapshot.docs.map(d => this.convertFirestoreToCompany({ id: d.id, ...d.data() }));

      return {
        companies,
        count: companies.length
      };
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

  // Listing Management
  static async createListing(data: Omit<MarketplaceListing, 'id' | 'createdAt' | 'updatedAt' | 'viewCount' | 'applicationCount'>): Promise<MarketplaceListing> {
    try {
      const listingData = {
        ...data,
        viewCount: 0,
        applicationCount: 0,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        applicationDeadline: data.applicationDeadline ? Timestamp.fromDate(data.applicationDeadline) : null
      };

      const docRef = await addDoc(collection(this.db, this.listingsCollection), listingData);
      
      return {
        id: docRef.id,
        ...data,
        viewCount: 0,
        applicationCount: 0,
        createdAt: new Date(),
        updatedAt: new Date()
      };
    } catch (error) {
      console.error('Error creating listing:', error);
      throw new Error('Failed to create listing');
    }
  }

  static async getListing(listingId: string): Promise<MarketplaceListing | null> {
    try {
      const docRef = doc(this.db, this.listingsCollection, listingId);
      const docSnap = await getDoc(docRef);
      
      if (!docSnap.exists()) {
        return null;
      }

      const data = docSnap.data();
      return this.convertFirestoreToListing({ id: docSnap.id, ...data });
    } catch (error) {
      console.error('Error getting listing:', error);
      throw new Error('Failed to get listing');
    }
  }

  static async getListings(filters: any = {}): Promise<{ listings: MarketplaceListing[]; count: number }> {
    try {
      let q = query(
        collection(this.db, this.listingsCollection),
        where('status', '==', 'active'),
        orderBy('createdAt', 'desc')
      );

      if (filters.category) {
        q = query(q, where('category', '==', filters.category));
      }

      if (filters.type) {
        q = query(q, where('type', '==', filters.type));
      }

      if (filters.location) {
        q = query(q, where('location', '==', filters.location));
      }

      if (filters.remote !== undefined) {
        q = query(q, where('remote', '==', filters.remote));
      }

      if (filters.companyId) {
        q = query(q, where('companyId', '==', filters.companyId));
      }

      if (filters.limit) {
        q = query(q, limit(filters.limit));
      }

      const querySnapshot = await getDocs(q);
      const listings = querySnapshot.docs.map(d => this.convertFirestoreToListing({ id: d.id, ...d.data() }));

      return {
        listings,
        count: listings.length
      };
    } catch (error) {
      console.error('Error getting listings:', error);
      throw new Error('Failed to get listings');
    }
  }

  static async updateListing(listingId: string, data: Partial<MarketplaceListing>): Promise<MarketplaceListing> {
    try {
      const docRef = doc(this.db, this.listingsCollection, listingId);
      const docSnap = await getDoc(docRef);
      
      if (!docSnap.exists()) {
        throw new Error('Listing not found');
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
      console.error('Error updating listing:', error);
      throw error;
    }
  }

  static async deleteListing(listingId: string): Promise<void> {
    try {
      const docRef = doc(this.db, this.listingsCollection, listingId);
      await deleteDoc(docRef);
    } catch (error) {
      console.error('Error deleting listing:', error);
      throw new Error('Failed to delete listing');
    }
  }

  static async incrementListingViews(listingId: string): Promise<void> {
    try {
      const docRef = doc(this.db, this.listingsCollection, listingId);
      await updateDoc(docRef, {
        viewCount: increment(1)
      });
    } catch (error) {
      console.error('Error incrementing listing views:', error);
      // Don't throw error as this is not critical
    }
  }

  // Application Management
  static async createApplication(data: Omit<MarketplaceApplication, 'id' | 'createdAt' | 'updatedAt'>): Promise<MarketplaceApplication> {
    try {
      const applicationData = {
        ...data,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        availabilityDate: data.availabilityDate ? Timestamp.fromDate(data.availabilityDate) : null
      };

      const docRef = await addDoc(collection(this.db, this.applicationsCollection), applicationData);
      
      // Increment application count for the listing
      const listingRef = doc(this.db, this.listingsCollection, data.listingId);
      await updateDoc(listingRef, {
        applicationCount: increment(1)
      });

      return {
        id: docRef.id,
        ...data,
        createdAt: new Date(),
        updatedAt: new Date()
      };
    } catch (error) {
      console.error('Error creating application:', error);
      throw new Error('Failed to create application');
    }
  }

  static async getApplication(applicationId: string): Promise<MarketplaceApplication | null> {
    try {
      const docRef = doc(this.db, this.applicationsCollection, applicationId);
      const docSnap = await getDoc(docRef);
      
      if (!docSnap.exists()) {
        return null;
      }

      const data = docSnap.data();
      return this.convertFirestoreToApplication({ id: docSnap.id, ...data });
    } catch (error) {
      console.error('Error getting application:', error);
      throw new Error('Failed to get application');
    }
  }

  static async getApplicationByUserAndListing(userId: string, listingId: string): Promise<MarketplaceApplication | null> {
    try {
      const q = query(
        collection(this.db, this.applicationsCollection),
        where('applicantId', '==', userId),
        where('listingId', '==', listingId),
        limit(1)
      );

      const querySnapshot = await getDocs(q);
      if (querySnapshot.empty) {
        return null;
      }

      const doc = querySnapshot.docs[0];
      return this.convertFirestoreToApplication({ id: doc.id, ...doc.data() });
    } catch (error) {
      console.error('Error getting application by user and listing:', error);
      throw new Error('Failed to get application');
    }
  }

  static async getApplicationsForListing(listingId: string, filters: any = {}): Promise<{ applications: MarketplaceApplication[]; count: number; total: number }> {
    try {
      let q = query(
        collection(this.db, this.applicationsCollection),
        where('listingId', '==', listingId),
        orderBy('createdAt', 'desc')
      );

      if (filters.status) {
        q = query(q, where('status', '==', filters.status));
      }

      if (filters.limit) {
        q = query(q, limit(filters.limit));
      }

      const querySnapshot = await getDocs(q);
      const applications = querySnapshot.docs.map(d => this.convertFirestoreToApplication({ id: d.id, ...d.data() }));

      // Get total count without limit
      const totalQuery = query(
        collection(this.db, this.applicationsCollection),
        where('listingId', '==', listingId)
      );
      const totalSnapshot = await getDocs(totalQuery);

      return {
        applications,
        count: applications.length,
        total: totalSnapshot.size
      };
    } catch (error) {
      console.error('Error getting applications for listing:', error);
      throw new Error('Failed to get applications');
    }
  }

  static async updateApplication(applicationId: string, data: Partial<MarketplaceApplication>): Promise<MarketplaceApplication> {
    try {
      const docRef = doc(this.db, this.applicationsCollection, applicationId);
      const docSnap = await getDoc(docRef);
      
      if (!docSnap.exists()) {
        throw new Error('Application not found');
      }

      const updateData: any = {
        ...data,
        updatedAt: serverTimestamp()
      };

      if (data.availabilityDate) {
        updateData.availabilityDate = Timestamp.fromDate(data.availabilityDate);
      }

      if (data.interviewDate) {
        updateData.interviewDate = Timestamp.fromDate(data.interviewDate);
      }

      if (data.reviewedAt) {
        updateData.reviewedAt = Timestamp.fromDate(data.reviewedAt);
      }

      await updateDoc(docRef, updateData);

      const updatedDoc = await getDoc(docRef);
      return this.convertFirestoreToApplication({ id: updatedDoc.id, ...updatedDoc.data() });
    } catch (error) {
      console.error('Error updating application:', error);
      throw error;
    }
  }

  // Marketplace Overview
  static async getMarketplaceOverview(filters: any = {}): Promise<any> {
    try {
      const [companiesResult, listingsResult] = await Promise.all([
        this.getCompanies(filters),
        this.getListings(filters)
      ]);

      return {
        companies: companiesResult.companies,
        listings: listingsResult.listings,
        totalCompanies: companiesResult.count,
        totalListings: listingsResult.count
      };
    } catch (error) {
      console.error('Error getting marketplace overview:', error);
      throw new Error('Failed to get marketplace overview');
    }
  }

  // Notifications
  static async notifyApplicantStatusChange(application: MarketplaceApplication): Promise<void> {
    try {
      // This would integrate with a notification service
      console.log(`Notifying applicant ${application.applicantId} about status change to ${application.status}`);
      
      // In a real implementation, you would:
      // 1. Get applicant's notification preferences
      // 2. Send email/push notification
      // 3. Create in-app notification
    } catch (error) {
      console.error('Error sending notification:', error);
      // Don't throw error as this is not critical
    }
  }

  // Helper methods
  private static convertFirestoreToCompany(data: any): Company {
    return {
      id: data.id,
      name: data.name,
      description: data.description,
      location: data.location,
      website: data.website,
      contactEmail: data.contactEmail,
      phone: data.phone,
      size: data.size,
      industry: data.industry,
      specialties: data.specialties || [],
      ownerId: data.ownerId,
      createdBy: data.createdBy,
      updatedBy: data.updatedBy,
      createdAt: data.createdAt?.toDate() || new Date(),
      updatedAt: data.updatedAt?.toDate() || new Date(),
      status: data.status
    };
  }

  private static convertFirestoreToListing(data: any): MarketplaceListing {
    return {
      id: data.id,
      title: data.title,
      description: data.description,
      category: data.category,
      type: data.type,
      location: data.location,
      remote: data.remote || false,
      requirements: data.requirements || [],
      benefits: data.benefits || [],
      salaryRange: data.salaryRange,
      applicationDeadline: data.applicationDeadline?.toDate(),
      tags: data.tags || [],
      priority: data.priority,
      status: data.status,
      companyId: data.companyId,
      createdBy: data.createdBy,
      updatedBy: data.updatedBy,
      createdAt: data.createdAt?.toDate() || new Date(),
      updatedAt: data.updatedAt?.toDate() || new Date(),
      viewCount: data.viewCount || 0,
      applicationCount: data.applicationCount || 0
    };
  }

  private static convertFirestoreToApplication(data: any): MarketplaceApplication {
    return {
      id: data.id,
      listingId: data.listingId,
      applicantId: data.applicantId,
      coverLetter: data.coverLetter,
      resume: data.resume,
      additionalInfo: data.additionalInfo,
      availabilityDate: data.availabilityDate?.toDate(),
      expectedSalary: data.expectedSalary,
      status: data.status,
      reviewNotes: data.reviewNotes,
      interviewDate: data.interviewDate?.toDate(),
      rejectionReason: data.rejectionReason,
      reviewedBy: data.reviewedBy,
      reviewedAt: data.reviewedAt?.toDate(),
      createdAt: data.createdAt?.toDate() || new Date(),
      updatedAt: data.updatedAt?.toDate() || new Date()
    };
  }
}

export default MarketplaceService;