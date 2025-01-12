'use client';

import React, { useState, useEffect } from 'react';
import axios from 'axios';

const NATForm = () => {
  const [name, setName] = useState('');
  const [subnetId, setSubnetId] = useState('');
  const [allocationId, setAllocationId] = useState('');
  const [generatedCode, setGeneratedCode] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [subnets, setSubnets] = useState([]);
  const [isLoadingSubnets, setIsLoadingSubnets] = useState(false);

  useEffect(() => {
    const fetchSubnets = async () => {
      setIsLoadingSubnets(true);
      setError('');
      try {
        const response = await axios.get('http://localhost:3000/api/subnet/list');
        if (response.data.success) {
          setSubnets(response.data.subnets);
        } else {
          setError('Failed to fetch Subnets');
        }
      } catch (error) {
        console.error('Error fetching Subnets:', error);
        setError('Failed to fetch Subnets: ' + (error.response?.data?.error || error.message));
      } finally {
        setIsLoadingSubnets(false);
      }
    };

    fetchSubnets();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setGeneratedCode('');
    setIsLoading(true);

    try {
      const response = await axios.post(
        'http://localhost:3000/api/nat/generate',
        { name, subnetId, allocationId },
        {
          headers: { 'Content-Type': 'application/json' },
          timeout: 5000
        }
      );

      if (response.data.success) {
        setGeneratedCode(response.data.code);
      } else {
        setError(response.data.error || 'Failed to generate NAT Gateway code');
      }
    } catch (error) {
      console.error('Error generating NAT Gateway code:', error);
      setError(
        error.response?.data?.error || 
        error.message || 
        'Failed to generate NAT Gateway code'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const selectedSubnet = subnets.find(subnet => subnet._id === subnetId);

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Generate NAT Gateway</h2>
      
      {error && (
        <div className="mb-4 p-4 bg-red-50 border-l-4 border-red-500 text-red-700">
          <p className="font-medium">Error</p>
          <p>{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
            NAT Gateway Name
          </label>
          <input
            type="text"
            id="name"
            placeholder="my-nat-gateway"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div>
          <label htmlFor="subnetId" className="block text-sm font-medium text-gray-700 mb-1">
            Subnet
          </label>
          <select
            id="subnetId"
            value={subnetId}
            onChange={(e) => setSubnetId(e.target.value)}
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            disabled={isLoadingSubnets}
          >
            <option value="">Select a Subnet</option>
            {subnets.map((subnet) => (
              <option key={subnet._id} value={subnet._id}>
                {subnet.name} ({subnet.cidrBlock})
              </option>
            ))}
          </select>
          {isLoadingSubnets && (
            <p className="mt-1 text-sm text-gray-500">Loading Subnets...</p>
          )}
          {selectedSubnet && (
            <p className="mt-1 text-sm text-green-600">
              Selected Subnet: {selectedSubnet.name}
            </p>
          )}
        </div>

        <div>
          <label htmlFor="allocationId" className="block text-sm font-medium text-gray-700 mb-1">
            Allocation ID (Provide Your Elastic IP Allocation ID)
          </label>
          <input
            type="text"
            id="allocationId"
            placeholder="eipalloc-xxxxxxxx"
            value={allocationId}
            onChange={(e) => setAllocationId(e.target.value)}
            required
            pattern="^eipalloc-[a-z0-9]+$"
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <p className="mt-1 text-sm text-gray-500">Format: eipalloc-xxxxxxxx</p>
        </div>

        <button
          type="submit"
          disabled={isLoading || isLoadingSubnets || !subnetId}
          className={`w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white 
            ${(isLoading || isLoadingSubnets || !subnetId)
              ? 'bg-blue-400 cursor-not-allowed' 
              : 'bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
            }`}
        >
          {isLoading ? 'Generating...' : 'Generate'}
        </button>
      </form>

      {generatedCode && (
        <div className="mt-6">
          <h3 className="text-lg font-semibold mb-2 text-gray-800">Generated Terraform Code:</h3>
          <pre className="p-4 bg-gray-50 rounded-md overflow-x-auto border border-gray-200">
            <code>{generatedCode}</code>
          </pre>
        </div>
      )}
    </div>
  );
};

export default NATForm;

