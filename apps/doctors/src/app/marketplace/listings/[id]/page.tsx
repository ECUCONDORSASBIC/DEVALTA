// apps/doctors/src/app/marketplace/listings/[id]/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { getListingDetails, applyToListing } from '../../../../services/marketplaceService';
import { useRouter } from 'next/navigation';

interface ListingDetails {
  id: string;
  title: string;
  company: string;
  specialty: string;
  location: string;
  hoursPerWeek: number;
  remuneration: string;
  description: string;
}

const ListingDetailsPage = ({ params }: { params: { id: string } }) => {
  const router = useRouter();
  const [listing, setListing] = useState<ListingDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (params.id) {
      const fetchDetails = async () => {
        try {
          const data = await getListingDetails(params.id as string);
          setListing(data);
        } catch (err) {
          setError('Failed to fetch listing details.');
          console.error(err);
        } finally {
          setIsLoading(false);
        }
      };
      fetchDetails();
    }
  }, [params.id]);

  const handleApply = async () => {
    // Placeholder data for application
    const applicationData = {
      listingId: params.id,
      doctorId: 'doctor-456', // This should come from user auth
      coverLetter: 'I am very interested in this opportunity.'
    };
    try {
      await applyToListing(applicationData);
      router.push('/marketplace/applications');
    } catch (err) {
      setError('Failed to submit application.');
      console.error(err);
    }
  };

  if (isLoading) return <p>Loading...</p>;
  if (error) return <p className="text-red-500">{error}</p>;
  if (!listing) return <p>Listing not found.</p>;

  return (
    <div>
      <h1 className="text-3xl font-bold mb-2">{listing.title}</h1>
      <p className="text-xl text-gray-700 mb-4">{listing.company}</p>
      <div className="p-4 border rounded-lg">
        <p><strong>Specialty:</strong> {listing.specialty}</p>
        <p><strong>Location:</strong> {listing.location}</p>
        <p><strong>Hours per week:</strong> {listing.hoursPerWeek}</p>
        <p><strong>Remuneration:</strong> {listing.remuneration}</p>
        <p className="mt-4">{listing.description}</p>
        <button 
          onClick={handleApply}
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mt-6"
        >
          Apply Now
        </button>
      </div>
    </div>
  );
};

export default ListingDetailsPage;