import API_BASE_URL from "../utils/apiConfig";
import { jwtDecode } from "jwt-decode";
import { useAuth } from "../pages/Auth";

const refreshToken = async () => {
  const authTokens = JSON.parse(localStorage.getItem("authTokens"));
  if (!authTokens?.refreshToken) return null;

  const response = await fetch(`${API_BASE_URL}/auth/refresh?refreshToken=${authTokens.refreshToken}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
  });

  if (!response.ok) return null;

  const data = await response.json();
  localStorage.setItem("authTokens", JSON.stringify(data));
  return data;
};

const logoutAndRedirect = () => {
  localStorage.removeItem("authTokens");
  window.location.href = "/login"; // 🔥 Redirection immédiate + reload
};

const fetchWithAuth = async (url, options = {}) => {
  const tokens = JSON.parse(localStorage.getItem("authTokens"));
  let accessToken = tokens?.accessToken;

  let headers = {
    ...(options.headers || {}),
    ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
  };

  let response = await fetch(url, { ...options, headers });

  if (response.status === 401) {
    const newTokens = await refreshToken();

    if (!newTokens) {
      logoutAndRedirect();
      return;
    }

    headers = {
      ...headers,
      Authorization: `Bearer ${newTokens.accessToken}`,
    };

    response = await fetch(url, { ...options, headers });

    if (response.status === 401) {
      logoutAndRedirect();
      return;
    }
  }

  return response;
};

export default fetchWithAuth;




// const fetchWithAuth = async (url, options = {}) => {
//   const authTokens = localStorage.getItem('authTokens') ? JSON.parse(localStorage.getItem('authTokens')) : null;
//   const token = authTokens ? authTokens.accessToken : null;

//   const defaultHeaders = {
//     ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
//     'Content-Type': 'application/json'
//   };

//   const headers = {
//     ...defaultHeaders,
//     ...(options.headers || {}) // fusionne avec les headers envoyés dans options
//   };

//   try {
//     const response = await fetch(url, {
//       ...options,
//       headers
//     });

//     if (!response.ok) {
//       const errorText = await response.text();
//       console.error(`Erreur HTTP: ${response.status} - ${errorText}`);
//       const error = new Error(errorText);
//       error.status = response.status;
//       throw error;
//     }

//     return response;
//   } catch (error) {
//     console.error("Erreur fetch:", error);
//     throw error;
//   }
// };


// export default fetchWithAuth;