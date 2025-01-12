'use client';

import React, { useState } from 'react';
import axios from 'axios';
import config from '../config';

const VPCForm = () => {
  const [name, setName] = useState('');
  const [cidrBlock, setCidrBlock] = useState('');
  const [generatedCode, setGeneratedCode] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setGeneratedCode('');
    setIsLoading(true);

    try {
      const response = await axios.post(
        `${config.apiUrl}/vpc/generate`,
        { name, cidrBlock },
        {
          headers: { 'Content-Type': 'application/json' },
          timeout: 5000
        }
      );
      
      if (response.data.success) {
        setGeneratedCode(response.data.code);
      } else {
        setError(response.data.error || 'Failed to generate VPC code');
      }
    } catch (error) {
      console.error('Error generating VPC code:', error);
      setError(
        error.response?.data?.error || 
        error.message || 
        'Failed to generate VPC code'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Generate VPC</h2>
      
      {error && (
        <div className="mb-4 p-4 bg-red-50 border-l-4 border-red-500 text-red-700">
          <p className="font-medium">Error</p>
          <p>{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
            VPC Name
          </label>
          <input
            type="text"
            id="name"
            placeholder="my-vpc"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div>
          <label htmlFor="cidrBlock" className="block text-sm font-medium text-gray-700 mb-1">
            CIDR Block
          </label>
          <input
            type="text"
            id="cidrBlock"
            placeholder="10.0.0.0/16"
            value={cidrBlock}
            onChange={(e) => setCidrBlock(e.target.value)}
            required
            pattern="^([0-9]{1,3}\.){3}[0-9]{1,3}\/[0-9]{1,2}$"
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <p className="mt-1 text-sm text-gray-500">Format: x.x.x.x/x (e.g., 10.0.0.0/16)</p>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className={`w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white 
            ${isLoading 
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

export default VPCForm;

