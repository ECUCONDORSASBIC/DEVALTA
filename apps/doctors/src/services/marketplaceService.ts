// apps/doctors/src/services/marketplaceService.ts
import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

export const getAvailableListings = async () => {
  // TODO: Implement actual API call
  // const response = await axios.get(`${API_URL}/marketplace/listings?status=open`);
  // return response.data;

  // Returning mock data for now
  return [
    { id: '1', title: 'Cardiologist Needed', company: 'Some Hospital' },
    { id: '2', title: 'Dermatologist for Telemedicine', company: 'Another Clinic' },
    { id: '3', title: 'General Practitioner (Part-Time)', company: 'Telemedicine Platform' },
  ];
};

export const getListingDetails = async (listingId: string) => {
    // TODO: Implement actual API call
    // const response = await axios.get(`${API_URL}/marketplace/listings/${listingId}`);
    // return response.data;

    // Returning mock data for now
    return {
        id: listingId,
        title: 'Cardiologist Needed',
        company: 'Some Hospital',
        specialty: 'Cardiology',
        location: 'New York, NY',
        hoursPerWeek: 20,
        remuneration: '$100/hour',
        description: 'Detailed description of the job.'
    };
};

export const applyToListing = async (applicationData: any) => {
    const response = await axios.post(`${API_URL}/marketplace/listings/${applicationData.listingId}/apply`, applicationData);
    return response.data;
};
