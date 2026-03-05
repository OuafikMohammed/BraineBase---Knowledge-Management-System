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
                Authorization: `Bearer ${token}`,
                'Content-Type': 'multipart/form-data'
            },
        });
        return response.data;
    },

    // Get a specific PDF with its URL
    getPdf: async (id) => {
        const token = localStorage.getItem('token');
        const response = await api.get(`/pdfs/${id}`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        return response.data;
    },

    // View PDF (returns a blob for viewing)
    viewPdf: async (id) => {
        const token = localStorage.getItem('token');
        try {
            const response = await api.get(`/pdfs/${id}/view`, {
                responseType: 'blob',
                headers: { Authorization: `Bearer ${token}` }
            });
            return response.data;
        } catch (error) {
            console.error('Error in viewPdf:', error);
            throw error;
        }
    },

    // Update PDF metadata
    updatePdf: async (id, data) => {
        const token = localStorage.getItem("token");
        try {
            const response = await api.put(`/pdfs/${id}`, data, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json"
                }
            });
            return response.data;
        } catch (error) {
            console.error('Error in updatePdf:', error);
            throw error;
        }
    },

    // Delete PDF
    deletePdf: async (id) => {
        const token = localStorage.getItem("token");
        try {
            const response = await api.delete(`/pdfs/${id}`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            return response.data;
        } catch (error) {
            console.error('Error in deletePdf:', error);
            throw error;
        }
    },

    // Download PDF
    downloadPdf: async (id) => {
        const token = localStorage.getItem("token");
        try {
            const response = await api.get(`/pdfs/${id}/download`, {
                responseType: 'blob',
                headers: { Authorization: `Bearer ${token}` }
            });
            return response.data;
        } catch (error) {
            console.error('Error in downloadPdf:', error);
            throw error;
        }
    }
};