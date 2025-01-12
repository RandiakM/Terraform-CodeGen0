const config = {
    apiUrl: process.env.NODE_ENV === 'production'
      ? '/.netlify/functions'
      : 'https://terraform-codegen0.netlify.app/api'
  };
  
  export default config;
  
  