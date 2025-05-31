import api from './api';

const vaultService = {
  // Get all vaults for authenticated user
  getAllVaults: async () => {
    const token = localStorage.getItem('token');
    const response = await api.get('/vaults', {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  },

  // Create a new vault
  createVault: async (vaultData) => {
    const token = localStorage.getItem('token');
    const response = await api.post('/vaults', vaultData, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  },

  // Get a specific vault with its elements
  getVault: async (vaultId) => {
    const token = localStorage.getItem('token');
    const response = await api.get(`/vaults/${vaultId}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    // Ensure the items array exists even if no items are present
    return {
      ...response.data,
      items: response.data.elements || []
    };
  },

  // Update a vault
  updateVault: async (vaultId, vaultData) => {
    const response = await api.put(`/vaults/${vaultId}`, vaultData, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`
      }
    });
    return response.data;
  },

  // Delete a vault
  deleteVault: async (vaultId) => {
    const response = await api.delete(`/vaults/${vaultId}`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`
      }
    });
    return response.data;
  },

  // Element operations
  getElements: async (vaultId) => {
    const token = localStorage.getItem('token');
    const response = await api.get(`/vaults/${vaultId}/elements`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  },

  createElement: async (vaultId, elementData) => {
    const token = localStorage.getItem('token');
    const response = await api.post(`/vaults/${vaultId}/elements`, elementData, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  },

  updateElement: async (elementId, elementData) => {
    const token = localStorage.getItem('token');
    const response = await api.put(`/elements/${elementId}`, elementData, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  },

  deleteElement: async (elementId) => {
    const token = localStorage.getItem('token');
    const response = await api.delete(`/elements/${elementId}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  },

  updateElementContent: async (elementId, content) => {
    const token = localStorage.getItem('token');
    const response = await api.put(`/elements/${elementId}`, { content_html: content }, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  },

  // Update an element's parent folder
  updateElementParent: async (elementId, newParentId) => {
    const token = localStorage.getItem('token');
    const response = await api.put(`/elements/${elementId}/parent`, { parent_id: newParentId }, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  },

  // Get a single element by ID
  getElement: async (elementId) => {
    const token = localStorage.getItem('token');
    const response = await api.get(`/elements/${elementId}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  },

  // Search elements by tags
  searchByTags: async (vaultId, tags) => {
    const token = localStorage.getItem('token');
    const response = await api.post(`/vaults/${vaultId}/search-tags`, {
      tags: tags
    }, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    return response.data;
  },

  // Restore a specific version of an element
  restoreVersion: async (elementId, versionId) => {
    const token = localStorage.getItem('token');
    const response = await api.post(`/elements/${elementId}/restore-version`, {
      versionId: versionId
    }, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    return response.data;
  }
};

export { vaultService };