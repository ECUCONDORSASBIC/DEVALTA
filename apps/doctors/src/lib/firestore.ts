import { getFirestore, collection, doc, getDocs, getDoc, addDoc, updateDoc, deleteDoc, query, where, orderBy, limit } from 'firebase/firestore'
import { app } from '@/lib/firebase'

const db = getFirestore(app)

// Marketplace Operations
export const marketplaceService = {
  // Get all marketplace offers with filters
  async getOffers(filters: {
    search?: string
    specialty?: string
    type?: string
    location?: string
    urgent?: boolean
    remote?: boolean
  } = {}) {
    try {
      let q = query(collection(db, 'marketplace_offers'), orderBy('postedDate', 'desc'))

      if (filters.specialty) {
        q = query(q, where('specialty', '==', filters.specialty))
      }
      if (filters.type) {
        q = query(q, where('type', '==', filters.type))
      }
      if (filters.urgent !== undefined) {
        q = query(q, where('urgent', '==', filters.urgent))
      }
      if (filters.remote !== undefined) {
        q = query(q, where('remote', '==', filters.remote))
      }

      const snapshot = await getDocs(q)
      let offers = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }))

      // Client-side filtering for complex searches
      if (filters.search) {
        const searchLower = filters.search.toLowerCase()
        offers = offers.filter(offer => 
          offer.title.toLowerCase().includes(searchLower) ||
          offer.company.toLowerCase().includes(searchLower) ||
          offer.description.toLowerCase().includes(searchLower)
        )
      }

      if (filters.location) {
        offers = offers.filter(offer =>
          offer.location.toLowerCase().includes(filters.location!.toLowerCase())
        )
      }

      return offers
    } catch (error) {
      console.error('Error fetching marketplace offers:', error)
      throw error
    }
  },

  // Get specific offer by ID
  async getOfferById(id: string) {
    try {
      const docRef = doc(db, 'marketplace_offers', id)
      const docSnap = await getDoc(docRef)
      
      if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() }
      }
      return null
    } catch (error) {
      console.error('Error fetching offer:', error)
      throw error
    }
  },

  // Create new marketplace offer (for companies)
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

  // Apply to an offer
  async applyToOffer(applicationData: {
    offerId: string
    doctorId: string
    coverLetter?: string
    resume?: string
    doctorProfile: any
  }) {
    try {
      // Create application document
      const applicationRef = await addDoc(collection(db, 'marketplace_applications'), {
        ...applicationData,
        status: 'pending',
        appliedAt: new Date().toISOString(),
        companyResponse: null
      })

      // Update offer application count
      const offerRef = doc(db, 'marketplace_offers', applicationData.offerId)
      const offerSnap = await getDoc(offerRef)
      
      if (offerSnap.exists()) {
        await updateDoc(offerRef, {
          applications: (offerSnap.data().applications || 0) + 1
        })
      }

      return applicationRef.id
    } catch (error) {
      console.error('Error applying to offer:', error)
      throw error
    }
  },

  // Get applications for a doctor
  async getDoctorApplications(doctorId: string) {
    try {
      const q = query(
        collection(db, 'marketplace_applications'),
        where('doctorId', '==', doctorId),
        orderBy('appliedAt', 'desc')
      )
      
      const snapshot = await getDocs(q)
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }))
    } catch (error) {
      console.error('Error fetching doctor applications:', error)
      throw error
    }
  }
}

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
  }
}

// User Profiles Service
export const userService = {
  // Get user profile
  async getUserProfile(userId: string) {
    try {
      const docRef = doc(db, 'users', userId)
      const docSnap = await getDoc(docRef)
      
      if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() }
      }
      return null
    } catch (error) {
      console.error('Error fetching user profile:', error)
      throw error
    }
  },

  // Update user profile
  async updateUserProfile(userId: string, profileData: any) {
    try {
      const docRef = doc(db, 'users', userId)
      await updateDoc(docRef, {
        ...profileData,
        updatedAt: new Date().toISOString()
      })
    } catch (error) {
      console.error('Error updating user profile:', error)
      throw error
    }
  },

  // Create user profile
  async createUserProfile(userId: string, profileData: any) {
    try {
      const docRef = doc(db, 'users', userId)
      await updateDoc(docRef, {
        ...profileData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      })
    } catch (error) {
      console.error('Error creating user profile:', error)
      throw error
    }
  }
}