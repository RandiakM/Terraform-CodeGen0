'use client';

import React, { useState } from 'react';
import axios from 'axios';

const FinalTerraformGenerator = () => {
  const [generatedCode, setGeneratedCode] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const generateFinalTerraform = async () => {
    setError('');
    setGeneratedCode('');
    setIsLoading(true);

    try {
      const response = await axios.get(
        'http://localhost:3000/api/terraform/generate-final',
        {
          timeout: 10000
        }
      );

      if (response.data.success) {
        setGeneratedCode(response.data.code);
      } else {
        setError(response.data.error || 'Failed to generate final Terraform code');
      }
    } catch (error) {
      console.error('Error generating final Terraform code:', error);
      setError(
        error.response?.data?.error || 
        error.message || 
        'Failed to generate final Terraform code'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Generate Final Terraform File</h2>
      
      {error && (
        <div className="mb-4 p-4 bg-red-50 border-l-4 border-red-500 text-red-700">
          <p className="font-medium">Error</p>
          <p>{error}</p>
        </div>
      )}

      <button
        onClick={generateFinalTerraform}
        disabled={isLoading}
        className={`w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white 
          ${isLoading
            ? 'bg-blue-400 cursor-not-allowed' 
            : 'bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
          }`}
      >
        {isLoading ? 'Generating...' : 'Generate Final Terraform File'}
      </button>

      {generatedCode && (
        <div className="mt-6">
          <h3 className="text-lg font-semibold mb-2 text-gray-800">Generated Final Terraform Code:</h3>
          <pre className="p-4 bg-gray-50 rounded-md overflow-x-auto border border-gray-200">
            <code>{generatedCode}</code>
          </pre>
        </div>
      )}
    </div>
  );
};

export default FinalTerraformGenerator;

