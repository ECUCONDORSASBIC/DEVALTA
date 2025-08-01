// apps/doctors/src/app/marketplace/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getAvailableListings } from '../../services/marketplaceService';

interface Listing {
  id: string;
  title: string;
  company: string;
}

const MarketplacePage = () => {
  const router = useRouter();
  const [listings, setListings] = useState<Listing[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchListings = async () => {
      try {
        const data = await getAvailableListings();
        setListings(data);
      } catch (err) {
        setError('Failed to fetch listings.');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchListings();
  }, []);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Marketplace</h1>
      <div className="p-4 border rounded-lg">
        <h2 className="text-xl font-semibold">Available Listings</h2>
        {isLoading && <p>Loading...</p>}
        {error && <p className="text-red-500">{error}</p>}
        {!isLoading && !error && (
          <ul>
            {listings.map((listing) => (
              <li 
                key={listing.id} 
                className="py-3 border-b flex justify-between items-center cursor-pointer hover:bg-gray-50"
                onClick={() => router.push(`/marketplace/listings/${listing.id}`)}
              >
                <div>
                  <p className="font-semibold">{listing.title}</p>
                  <p className="text-sm text-gray-600">{listing.company}</p>
                </div>
                <span className="text-sm text-gray-500">{'>'}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default MarketplacePage;