import { getFirestore, collection, doc, getDocs, getDoc, addDoc, updateDoc, deleteDoc, query, where, orderBy, limit } from 'firebase/firestore'
import { app } from '@/lib/firebase'

const db = getFirestore(app)

// Companies Service
export const companiesService = {
  // Get all companies
  async getCompanies() {
    try {
      const q = query(collection(db, 'companies'), orderBy('rating', 'desc'))
      const snapshot = await getDocs(q)
      
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }))
    } catch (error) {
      console.error('Error fetching companies:', error)
      throw error
    }
  },

  // Get company by ID
  async getCompanyById(id: string) {
    try {
      const docRef = doc(db, 'companies', id)
      const docSnap = await getDoc(docRef)
      
      if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() }
      }
      return null
    } catch (error) {
      console.error('Error fetching company:', error)
      throw error
    }
  },

  // Create/Update company profile
  async updateCompany(id: string, companyData: any) {
    try {
      const docRef = doc(db, 'companies', id)
      await updateDoc(docRef, {
        ...companyData,
        updatedAt: new Date().toISOString()
      })
    } catch (error) {
      console.error('Error updating company:', error)
      throw error
    }
  },

  // Create new company
  async createCompany(companyData: any) {
    try {
      const docRef = await addDoc(collection(db, 'companies'), {
        ...companyData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        jobCount: 0,
        rating: 0
      })
      return docRef.id
    } catch (error) {
      console.error('Error creating company:', error)
      throw error
    }
  }
}

// Marketplace Operations for Companies
export const marketplaceService = {
  // Get all marketplace offers for a company
  async getCompanyOffers(companyId: string) {
    try {
      const q = query(
        collection(db, 'marketplace_offers'),
        where('companyId', '==', companyId),
        orderBy('postedDate', 'desc')
      )
      
      const snapshot = await getDocs(q)
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }))
    } catch (error) {
      console.error('Error fetching company offers:', error)
      throw error
    }
  },

  // Create new marketplace offer
  async createOffer(offerData: any) {
    try {
      const docRef = await addDoc(collection(db, 'marketplace_offers'), {
        ...offerData,
        createdAt: new Date().toISOString(),
        postedDate: new Date().toISOString(),
        applications: 0,
        status: 'active'
      })
      return docRef.id
    } catch (error) {
      console.error('Error creating offer:', error)
      throw error
    }
  },

  // Update marketplace offer
  async updateOffer(offerId: string, offerData: any) {
    try {
      const docRef = doc(db, 'marketplace_offers', offerId)
      await updateDoc(docRef, {
        ...offerData,
        updatedAt: new Date().toISOString()
      })
    } catch (error) {
      console.error('Error updating offer:', error)
      throw error
    }
  },

  // Get applications for company offers
  async getOfferApplications(companyId: string) {
    try {
      // First get all offers from this company
      const offersQuery = query(
        collection(db, 'marketplace_offers'),
        where('companyId', '==', companyId)
      )
      const offersSnapshot = await getDocs(offersQuery)
      const offerIds = offersSnapshot.docs.map(doc => doc.id)

      if (offerIds.length === 0) return []

      // Get applications for these offers
      const applicationsQuery = query(
        collection(db, 'marketplace_applications'),
        where('offerId', 'in', offerIds),
        orderBy('appliedAt', 'desc')
      )
      
      const applicationsSnapshot = await getDocs(applicationsQuery)
      return applicationsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }))
    } catch (error) {
      console.error('Error fetching offer applications:', error)
      throw error
    }
  },

  // Respond to application
  async respondToApplication(applicationId: string, response: {
    status: 'accepted' | 'rejected' | 'interview'
    message?: string
    interviewDate?: string
  }) {
    try {
      const docRef = doc(db, 'marketplace_applications', applicationId)
      await updateDoc(docRef, {
        status: response.status,
        companyResponse: {
          ...response,
          respondedAt: new Date().toISOString()
        },
        updatedAt: new Date().toISOString()
      })
    } catch (error) {
      console.error('Error responding to application:', error)
      throw error
    }
  }
}

// Analytics Service
export const analyticsService = {
  // Get company analytics
  async getCompanyAnalytics(companyId: string) {
    try {
      // Get total offers
      const offersQuery = query(
        collection(db, 'marketplace_offers'),
        where('companyId', '==', companyId)
      )
      const offersSnapshot = await getDocs(offersQuery)
      const totalOffers = offersSnapshot.docs.length

      // Get total applications
      const offerIds = offersSnapshot.docs.map(doc => doc.id)
      let totalApplications = 0
      
      if (offerIds.length > 0) {
        const applicationsQuery = query(
          collection(db, 'marketplace_applications'),
          where('offerId', 'in', offerIds)
        )
        const applicationsSnapshot = await getDocs(applicationsQuery)
        totalApplications = applicationsSnapshot.docs.length
      }

      return {
        totalOffers,
        totalApplications,
        averageApplicationsPerOffer: totalOffers > 0 ? totalApplications / totalOffers : 0,
        activeOffers: offersSnapshot.docs.filter(doc => doc.data().status === 'active').length
      }
    } catch (error) {
      console.error('Error fetching company analytics:', error)
      throw error
    }
  }
}