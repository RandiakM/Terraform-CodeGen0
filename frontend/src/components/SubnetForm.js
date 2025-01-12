// Update the useEffect hook to use the Netlify Function endpoint
useEffect(() => {
  const fetchVPCs = async () => {
    setIsLoadingVPCs(true);
    try {
      const response = await axios.get('/.netlify/functions/vpc-list');
      if (response.data.success) {
        setVpcs(response.data.vpcs);
      } else {
        setError('Failed to fetch VPCs');
      }
    } catch (error) {
      console.error('Error fetching VPCs:', error);
      setError('Failed to fetch VPCs: ' + (error.response?.data?.error || error.message));
    } finally {
      setIsLoadingVPCs(false);
    }
  };

  fetchVPCs();
}, []);

