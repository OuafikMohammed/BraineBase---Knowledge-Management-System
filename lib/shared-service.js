import api from './api';

export const sharedService = {
    // Get all PDFs shared with me
    getSharedWithMe: async () => {
        const token = localStorage.getItem('token');
        const response = await api.get('/shared/pdfs', {
            headers: { Authorization: `Bearer ${token}` }
        });
        return response.data;
    },

    // Share a PDF with other users
    sharePdf: async (pdfId, data) => {
        const token = localStorage.getItem('token');
        const response = await api.post(`/pdfs/${pdfId}/share`, data, {
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        return response.data;
    },

    // Update sharing settings for a PDF
    updatePdfSharing: async (pdfId, data) => {
        const token = localStorage.getItem('token');
        const response = await api.put(`/pdfs/${pdfId}/share`, data, {
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        return response.data;
    },

    // Remove sharing for a PDF
    removePdfSharing: async (pdfId, userId) => {
        const token = localStorage.getItem('token');
        const response = await api.delete(`/pdfs/${pdfId}/share/${userId}`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        return response.data;
    },

    // Get sharing settings for a PDF
    getPdfSharingSettings: async (pdfId) => {
        const token = localStorage.getItem('token');
        const response = await api.get(`/pdfs/${pdfId}/share`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        return response.data;
    }
};
