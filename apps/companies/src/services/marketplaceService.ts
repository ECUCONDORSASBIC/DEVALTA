// apps/companies/src/services/marketplaceService.ts
import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

export const getListings = async (companyId: string) => {
  // TODO: Implement actual API call with filtering by companyId
  // const response = await axios.get(`${API_URL}/marketplace/listings?companyId=${companyId}`);
  // return response.data;

  // Returning mock data for now
  return [
    { id: '1', title: 'Cardiologist Needed', status: 'open' },
    { id: '2', title: 'Dermatologist for Telemedicine', status: 'closed' },
    { id: '3', title: 'General Practitioner (Part-Time)', status: 'filled' },
  ];
};

export const createListing = async (listingData: any) => {
  const response = await axios.post(`${API_URL}/marketplace/listings`, listingData);
  return response.data;
};
