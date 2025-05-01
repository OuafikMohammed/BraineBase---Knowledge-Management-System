// import axios from 'axios';

// // On prépare une instance axios pour éviter de répéter baseURL
// const api = axios.create({
//   baseURL: 'http://127.0.0.1:8000/api', // backend Laravel local
// });

// // Fonction pour se connecter
// export async function login(email, password) {
//   const response = await api.post('/login', { email, password });
//   return response.data; // contient { token, user }
// }

// // Fonction pour s'inscrire
// export async function register(name, email, password, profileType) {
//   const response = await api.post('/register', {
//     name,
//     email,
//     password,
//     profile_type: profileType,
//   });
//   return response.data; // contient { token, user }
// }

// // Fonction pour récupérer une ressource protégée
// export async function getProfile(token) {
//   const response = await api.get('/me', {
//     headers: {
//       Authorization: `Bearer ${token}`,
//     },
//   });
//   return response.data;
// }

// export const handleLogout = () => {
//   localStorage.removeItem('token');
//   window.location.reload(); // Refresh the page
// };