const fetchWithAuth = async (url, options = {}) => {
  const authTokens = localStorage.getItem('authTokens') ? JSON.parse(localStorage.getItem('authTokens')) : null;
  const token = authTokens ? authTokens.accessToken : null;

  const defaultHeaders = {
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    'Content-Type': 'application/json'
  };

  const headers = {
    ...defaultHeaders,
    ...(options.headers || {}) // fusionne avec les headers envoyés dans options
  };

  try {
    const response = await fetch(url, {
      ...options,
      headers
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Erreur HTTP: ${response.status} - ${errorText}`);
      const error = new Error(errorText);
      error.status = response.status;
      throw error;
    }

    return response;
  } catch (error) {
    console.error("Erreur fetch:", error);
    throw error;
  }
};


export default fetchWithAuth;