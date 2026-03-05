import api from './api';

const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1 second
const TIMEOUT = 15000; // 15 seconds

// Helper function to add delay between retries
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const profileService = {
  // Get user profile with retries for resilience
  async getProfile() {
    let lastError;
    for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), TIMEOUT);

        const response = await api.get('/profile', {
          signal: controller.signal
        });

        clearTimeout(timeoutId);
        
        const userData = response.data.user;
        if (!userData) {
          throw new Error('Invalid user data');
        }

        return userData;
      } catch (error) {
        lastError = error;
        
        // Don't retry on 401 or if it's the last attempt
        if (error.response?.status === 401 || attempt === MAX_RETRIES - 1) {
          throw error;
        }

        // Add exponential backoff delay
        await delay(RETRY_DELAY * Math.pow(2, attempt));
      }
    }

    throw lastError;
  },

  // Update user profile
  async updateProfile(data) {
    try {
      const response = await api.put('/profile', data);
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: 'Failed to update profile' };
    }
  },

  // Update user avatar
  async updateAvatar(formData) {
    try {
      const response = await api.post('/profile/avatar', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: 'Failed to update avatar' };
    }  }
};

export default profileService;
