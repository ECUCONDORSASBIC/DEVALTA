// apps/doctors/src/app/marketplace/applications/page.tsx
import React from 'react';

const ApplicationsPage = () => {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">My Applications</h1>
      <div className="p-4 border rounded-lg">
        <h2 className="text-xl font-semibold">Your Applications</h2>
        <ul>
          <li className="py-2 border-b">Listing 1 - Pending</li>
          <li className="py-2 border-b">Listing 2 - Viewed</li>
          <li className="py-2">Listing 3 - Accepted</li>
        </ul>
      </div>
    </div>
  );
};

export default ApplicationsPage;
