const config = {
    apiUrl: process.env.NODE_ENV === 'production'
      ? '/.netlify/functions'
      : 'http://localhost:3000/api'
  };
  
  export default config;
  
  