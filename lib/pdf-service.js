import api from './api';

export const pdfService = {
    // Get all PDFs of all users
    getAllPdfs: async () => {
        const token = localStorage.getItem('token');
        const response = await api.get('/pdfs', {
          headers: { Authorization: `Bearer ${token}` }
        });
        return response.data;
    },

    // Upload a new PDF
    uploadPdf: async (formData) => {
        const token = localStorage.getItem('token');
        const response = await api.post('/pdfs', formData, {
            headers: {
                Authorization: `Bearer ${token}`
            },
        });
        return response.data;
    },

    // Get a specific PDF with its URL
    getPdf: async (id) => {
        const response = await api.get(`/pdfs/${id}`);
        return response.data;
    },

    updatePdf: async (id, data) => {
        const token = localStorage.getItem("token");
        const response = await api.put(`/pdfs/${id}`, data, {
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json"
            }
        });
        return response.data;
    },

    deletePdf: async (id) => {
        const token = localStorage.getItem("token");
        const response = await api.delete(`/pdfs/${id}`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
        return response.data;
    },

    // Download PDF file
    downloadPdf: async (id) => {
        const response = await api.get(`/pdfs/${id}/download`, {
            responseType: 'blob'
        });
        return response.data;
    },

    // Add PDF to collection
    addToCollection: async (id, collectionId) => {
        await api.post(`/pdfs/${id}/collections`, {
            collection_id: collectionId
        });
    },

    // Remove PDF from collection
    removeFromCollection: async (id, collectionId) => {
        await api.delete(`/pdfs/${id}/collections`, {
            data: { collection_id: collectionId }
        });
    }
};