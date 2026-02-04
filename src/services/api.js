// services/api.js

const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://email-cleanup-saas-v2-1.onrender.com';

const api = {
  // Analyze emails with AI (UPDATED to use analyze-simple)
  analyzeEmails: async (emails) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/email/analyze-simple`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ emails }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('API Error (analyzeEmails):', error);
      throw error;
    }
  },

  // Delete emails
  deleteEmails: async (emailIds) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/email/delete`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ emailIds }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('API Error (deleteEmails):', error);
      throw error;
    }
  },

  // Archive emails
  archiveEmails: async (emailIds) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/email/archive`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ emailIds }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('API Error (archiveEmails):', error);
      throw error;
    }
  },

  // Get user info
  getUser: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/user`, {
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('API Error (getUser):', error);
      throw error;
    }
  },

  // Get emails
  getEmails: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/emails`, {
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('API Error (getEmails):', error);
      throw error;
    }
  },

  // Logout
  logout: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/logout`, {
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('API Error (logout):', error);
      throw error;
    }
  },
};

// Export as default
export default api;