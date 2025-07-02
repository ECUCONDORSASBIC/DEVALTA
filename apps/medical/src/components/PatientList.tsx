import React, { useState } from 'react';
import axios from 'axios';

const PatientList: React.FC = () => {
  const [patients, setPatients] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchPatients = async (page: number, query: string) => {
    try {
      const response = await axios.get('/api/patients', {
        params: {
          page,
          search: query,
        },
      });

      setPatients(response.data.patients);
      setTotalPages(response.data.totalPages);
    } catch (error) {
      console.error('Failed to fetch patients', error);
    }
  };

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value);
    fetchPatients(1, event.target.value);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    fetchPatients(page, searchQuery);
  };

  React.useEffect(() => {
    fetchPatients(currentPage, searchQuery);
  }, [currentPage, searchQuery]);

  return (
    <div className="p-4">
      <input
        type="text"
        value={searchQuery}
        onChange={handleSearch}
        placeholder="Search patients..."
        className="mb-4 p-2 border border-gray-300 rounded"
      />
      <table className="min-w-full border-collapse block md:table">
        <thead className="block md:table-header-group">
          <tr className="border border-gray-300 md:table-row">
            <th className="p-2 block md:table-cell">Name</th>
            <th className="p-2 block md:table-cell">Age</th>
            <th className="p-2 block md:table-cell">Actions</th>
          </tr>
        </thead>
        <tbody className="block md:table-row-group">
          {patients.map((patient) => (
            <tr key={patient.id} className="border border-gray-300 md:table-row">
              <td className="p-2 block md:table-cell">{patient.name}</td>
              <td className="p-2 block md:table-cell">{patient.age}</td>
              <td className="p-2 block md:table-cell">
                <button className="bg-blue-500 text-white p-1 rounded">View</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="flex justify-between mt-4">
        <button onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1} className="p-2 bg-blue-500 text-white rounded">
          Previous
        </button>
        <span>Page {currentPage} of {totalPages}</span>
        <button onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages} className="p-2 bg-blue-500 text-white rounded">
          Next
        </button>
      </div>
    </div>
  );
};

export default PatientList;

