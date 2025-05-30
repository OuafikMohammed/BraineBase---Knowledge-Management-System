import api from './api';

export const collectionService = {
    // Get all collections for the current user
    getAllCollections: async () => {
        const token = localStorage.getItem('token');
        console.log('Getting collections with token:', token ? 'Token present' : 'No token');
        
        try {
            if (!token) {
                throw new Error('No authentication token found');
            }

            // Add request URL logging
            console.log('Making request to:', api.defaults.baseURL + '/collections');
            
            const response = await api.get('/collections', {
                headers: { 
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            
            if (!response.data) {
                throw new Error('No data received from server');
            }
            
            console.log('Collections response:', {
                status: response.status,
                dataLength: Array.isArray(response.data) ? response.data.length : 'not an array',
                data: response.data
            });
            
            return response.data;
        } catch (error) {
            console.error('Get collections error:', {
                name: error.name,
                message: error.message,
                response: {
                    status: error.response?.status,
                    statusText: error.response?.statusText,
                    data: error.response?.data
                },
                request: {
                    url: error.config?.url,
                    method: error.config?.method,
                    headers: error.config?.headers
                },
                stack: error.stack
            });
            throw error;
        }
    },
    
    // Get collections shared with the current user
    getSharedCollections: async () => {
        const token = localStorage.getItem('token');
        try {
            const response = await api.get('/collections/shared', {
                headers: { Authorization: `Bearer ${token}` }
            });
            return response.data;
        } catch (error) {
            console.error('Get shared collections error:', error.response?.data || error);
            throw error;        }
    },

    // Create a new collection
    createCollection: async (data) => {
        const token = localStorage.getItem('token');
        const response = await api.post('/collections', data, {
            headers: { 
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        return response.data;
    },

    // Get a specific collection
    getCollection: async (collectionId) => {
        const token = localStorage.getItem('token');
        try {
            if (!token) {
                throw new Error('No authentication token found');
            }

            console.log('Fetching collection:', collectionId);
            const response = await api.get(`/collections/${collectionId}`, {
                headers: { 
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            
            if (!response.data) {
                throw new Error('No data received from server');
            }
            
            console.log('Collection response:', {
                status: response.status,
                data: response.data
            });
            
            return response.data;
        } catch (error) {
            console.error('Get collection error:', {
                name: error.name,
                message: error.message,
                response: {
                    status: error.response?.status,
                    statusText: error.response?.statusText,
                    data: error.response?.data
                },
                request: {
                    url: error.config?.url,
                    method: error.config?.method,
                    headers: error.config?.headers
                }
            });
            throw error;
        }
    },

    // Update a collection
    updateCollection: async (collectionId, data) => {
        const token = localStorage.getItem('token');
        try {
            const response = await api.put(`/collections/${collectionId}`, data, {
                headers: { 
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            return response.data;
        } catch (error) {
            console.error('Update collection error:', error.response?.data || error);
            throw error;
        }
    },

    // Delete a collection
    deleteCollection: async (collectionId) => {
        const token = localStorage.getItem('token');
        try {
            await api.delete(`/collections/${collectionId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
        } catch (error) {
            console.error('Delete collection error:', error.response?.data || error);
            throw error;
        }
    },

    // Update collection sharing settings
    shareCollection: async (collectionId, data) => {
        const token = localStorage.getItem('token');
        try {
            await api.post(`/collections/${collectionId}/share`, data, {
                headers: { 
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
        } catch (error) {
            console.error('Share collection error:', error.response?.data || error);
            throw error;
        }
    },

    // Add PDF to collection
    addPdfToCollection: async (collectionId, pdfId) => {
        const token = localStorage.getItem('token');
        try {
            const response = await api.post(`/collections/${collectionId}/pdfs/${pdfId}`, {}, {
                headers: { 
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            return response.data;
        } catch (error) {
            console.error('Add PDF to collection error:', error.response?.data || error);
            throw error;
        }
    },

    // Remove PDF from collection
    removePdfFromCollection: async (collectionId, pdfId) => {
        const token = localStorage.getItem('token');
        try {
            const response = await api.delete(`/collections/${collectionId}/pdfs/${pdfId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            return response.data;
        } catch (error) {
            console.error('Remove PDF from collection error:', error.response?.data || error);
            throw error;
        }
    },

    // Get all PDFs in a collection
    getCollectionPdfs: async (collectionId) => {
        const token = localStorage.getItem('token');
        try {
            const response = await api.get(`/collections/${collectionId}/pdfs`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            return response.data;
        } catch (error) {
            console.error('Get collection PDFs error:', error.response?.data || error);
            throw error;
        }
    },

    // Update PDF in collection
    updatePdfInCollection: async (collectionId, pdfId, data) => {
        const token = localStorage.getItem('token');
        try {
            const response = await api.put(`/collections/${collectionId}/pdfs/${pdfId}`, data, {
                headers: { 
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            return response.data;
        } catch (error) {
            console.error('Update PDF in collection error:', error.response?.data || error);
            throw error;
        }    },

    // Search users for sharing
    searchUsers: async (query) => {
        const token = localStorage.getItem('token');
        try {
            const response = await api.get('/collections/search-users', {
                params: { query },
                headers: { Authorization: `Bearer ${token}` }
            });
            return response.data;
        } catch (error) {
            console.error('Search users error:', error.response?.data || error);
            throw error;
        }
    },

    // Share collection with users
    shareCollection: async (collectionId, data) => {
        const token = localStorage.getItem('token');
        try {
            const response = await api.post(`/collections/${collectionId}/share`, data, {
                headers: { 
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            return response.data;
        } catch (error) {
            console.error('Share collection error:', error.response?.data || error);
            throw error;
        }
    },

    // Update user's role in collection
    updateShare: async (collectionId, userId, role) => {
        const token = localStorage.getItem('token');
        try {
            const response = await api.put(`/collections/${collectionId}/share/${userId}`, { role }, {
                headers: { 
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            return response.data;
        } catch (error) {
            console.error('Update share error:', error.response?.data || error);
            throw error;
        }
    },

    // Remove user's access to collection
    removeShare: async (collectionId, userId) => {
        const token = localStorage.getItem('token');
        try {
            const response = await api.delete(`/collections/${collectionId}/share/${userId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            return response.data;
        } catch (error) {
            console.error('Remove share error:', error.response?.data || error);
            throw error;
        }
    },

    // Get collection sharing settings
    getShares: async (collectionId) => {
        const token = localStorage.getItem('token');
        try {
            const response = await api.get(`/collections/${collectionId}/shares`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            return response.data;
        } catch (error) {
            console.error('Get shares error:', error.response?.data || error);
            throw error;
        }
    },

    // Respond to share request
    respondToShare: async (collectionId, notificationId, response) => {
        const token = localStorage.getItem('token');
        try {
            const apiResponse = await api.post(`/collections/${collectionId}/share/respond`, {
                notification_id: notificationId,
                response
            }, {
                headers: { 
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            return apiResponse.data;
        } catch (error) {
            console.error('Share response error:', error.response?.data || error);
            throw error;
        }
    },
};