import api from './api';

export const pdfService = {
    // Get all PDFs of all users
    getPdfs: async () => {
        const token = localStorage.getItem('token');
        const response = await api.get('/pdfs', {
          headers: { Authorization: `Bearer ${token}` }
        });
        return response.data;
    },

    // Upload a new PDF
    uploadPdf: async (formData) => {
        const response = await api.post('/pdfs', formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });
        return response.data;
    },

    // Get a specific PDF with its URL
    getPdf: async (id) => {
        const response = await api.get(`/pdfs/${id}`);
        return response.data;
    },

    // Update PDF metadata
    updatePdf: async (id, data) => {
        const response = await api.put(`/pdfs/${id}`, data);
        return response.data;
    },

    // Delete a PDF
    deletePdf: async (id) => {
        await api.delete(`/pdfs/${id}`);
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