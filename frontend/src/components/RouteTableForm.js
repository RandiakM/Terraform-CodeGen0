"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";

const RouteTableForm = () => {
  const [name, setName] = useState("");
  const [vpcId, setVpcId] = useState("");
  const [routes, setRoutes] = useState([{ cidrBlock: "", gatewayId: "" }]);
  const [generatedCode, setGeneratedCode] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [vpcs, setVpcs] = useState([]);
  const [isLoadingVPCs, setIsLoadingVPCs] = useState(false);

  // Update the useEffect hook to use the Netlify Function endpoint
  useEffect(() => {
    const fetchVPCs = async () => {
      setIsLoadingVPCs(true);
      try {
        const response = await axios.get("/.netlify/functions/vpc-list");
        if (response.data.success) {
          setVpcs(response.data.vpcs);
        } else {
          setError("Failed to fetch VPCs");
        }
      } catch (error) {
        console.error("Error fetching VPCs:", error);
        setError("Failed to fetch VPCs");
      } finally {
        setIsLoadingVPCs(false);
      }
    };

    fetchVPCs();
  }, []);

  const handleAddRoute = () => {
    setRoutes([...routes, { cidrBlock: "", gatewayId: "" }]);
  };

  const handleRouteChange = (index, field, value) => {
    const newRoutes = [...routes];
    newRoutes[index][field] = value;
    setRoutes(newRoutes);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setGeneratedCode("");
    setIsLoading(true);

    try {
      const response = await axios.post(
        "/.netlify/functions/route-table-generate",
        { name, vpcId, routes },
        {
          headers: {
            "Content-Type": "application/json",
          },
          timeout: 5000,
        }
      );

      if (response.data.success) {
        setGeneratedCode(response.data.code);
      } else {
        setError(response.data.error || "Failed to generate route table code");
      }
    } catch (error) {
      console.error("Error generating route table code:", error);
      setError(
        error.response?.data?.error ||
          error.message ||
          "Failed to generate route table code"
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">
        Generate Route Table
      </h2>

      {error && (
        <div className="mb-4 p-4 bg-red-50 border-l-4 border-red-500 text-red-700">
          <p className="font-medium">Error</p>
          <p>{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label
            htmlFor="name"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Route Table Name
          </label>
          <input
            type="text"
            id="name"
            placeholder="my-route-table"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div>
          <label
            htmlFor="vpcId"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            VPC
          </label>
          <select
            id="vpcId"
            value={vpcId}
            onChange={(e) => setVpcId(e.target.value)}
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            disabled={isLoadingVPCs}
          >
            <option value="">Select a VPC</option>
            {vpcs.map((vpc) => (
              <option key={vpc._id} value={vpc._id}>
                {vpc.name} ({vpc.cidrBlock})
              </option>
            ))}
          </select>
          {isLoadingVPCs && (
            <p className="mt-1 text-sm text-gray-500">Loading VPCs...</p>
          )}
        </div>

        {routes.map((route, index) => (
          <div key={index} className="space-y-2">
            <h3 className="text-lg font-medium text-gray-700">
              Route {index + 1}
            </h3>
            <div>
              <label
                htmlFor={`cidrBlock-${index}`}
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                CIDR Block
              </label>
              <input
                type="text"
                id={`cidrBlock-${index}`}
                placeholder="0.0.0.0/0"
                value={route.cidrBlock}
                onChange={(e) =>
                  handleRouteChange(index, "cidrBlock", e.target.value)
                }
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label
                htmlFor={`gatewayId-${index}`}
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Gateway ID
              </label>
              <input
                type="text"
                id={`gatewayId-${index}`}
                placeholder="igw-xxxxxx"
                value={route.gatewayId}
                onChange={(e) =>
                  handleRouteChange(index, "gatewayId", e.target.value)
                }
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        ))}

        <button
          type="button"
          onClick={handleAddRoute}
          className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50"
        >
          Add Route
        </button>

        <button
          type="submit"
          disabled={isLoading || isLoadingVPCs}
          className={`w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white 
            ${
              isLoading || isLoadingVPCs
                ? "bg-blue-400 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            }`}
        >
          {isLoading ? "Generating..." : "Generate"}
        </button>
      </form>

      {generatedCode && (
        <div className="mt-6">
          <h3 className="text-lg font-semibold mb-2 text-gray-800">
            Generated Terraform Code:
          </h3>
          <pre className="p-4 bg-gray-50 rounded-md overflow-x-auto border border-gray-200">
            <code>{generatedCode}</code>
          </pre>
        </div>
      )}
    </div>
  );
};

export default RouteTableForm;
