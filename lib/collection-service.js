import api from './api';

export const collectionService = {
    // Get all collections for the current user
    getAllCollections: async () => {
        const token = localStorage.getItem('token');
        const response = await api.get('/collections', {
            headers: { Authorization: `Bearer ${token}` }
        });
        return response.data;
    },

    // Create a new collection
    createCollection: async (data) => {
        const response = await api.post('/collections', data);
        return response.data;
    },

    // Get a specific collection
    getCollection: async (collectionId) => {
        const response = await api.get(`/collections/${collectionId}`);
        return response.data;
    },

    // Update a collection
    updateCollection: async (collectionId, data) => {
        const response = await api.put(`/collections/${collectionId}`, data);
        return response.data;
    },

    // Delete a collection
    deleteCollection: async (collectionId) => {
        await api.delete(`/collections/${collectionId}`);
    },

    // Get favorite collections
    getFavorites: async () => {
        const response = await api.get('/favorites');
        return response.data;
    },

    // Add PDF to collection
    addPdfToCollection: async (collectionId, pdfId) => {
        const response = await api.post(`/collections/${collectionId}/pdfs/${pdfId}`);
        return response.data;
    },

    // Remove PDF from collection
    removePdfFromCollection: async (collectionId, pdfId) => {
        const response = await api.delete(`/collections/${collectionId}/pdfs/${pdfId}`);
        return response.data;
    },

    // Get all PDFs in a collection
    getCollectionPdfs: async (collectionId) => {
        const response = await api.get(`/collections/${collectionId}/pdfs`);
        return response.data;
    }
};