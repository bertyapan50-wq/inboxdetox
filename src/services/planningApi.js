const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

/**
 * Generate daily plan
 */
export const generatePlan = async (date = null) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/planning/generate-plan`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({ date }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('API Error (generatePlan):', error);
    throw error;
  }
};

/**
 * Get today's schedule
 */
export const getTodaySchedule = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/planning/today`, {
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('API Error (getTodaySchedule):', error);
    throw error;
  }
};

/**
 * Create new task
 */
export const createTask = async (taskData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/planning/tasks`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify(taskData),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('API Error (createTask):', error);
    throw error;
  }
};

/**
 * Get all tasks
 */
export const getTasks = async (filters = {}) => {
  try {
    const params = new URLSearchParams(filters);
    const response = await fetch(`${API_BASE_URL}/api/planning/tasks?${params}`, {
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('API Error (getTasks):', error);
    throw error;
  }
};

/**
 * Update task
 */
export const updateTask = async (taskId, updates) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/planning/tasks/${taskId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify(updates),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('API Error (updateTask):', error);
    throw error;
  }
};

/**
 * Delete task
 */
export const deleteTask = async (taskId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/planning/tasks/${taskId}`, {
      method: 'DELETE',
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('API Error (deleteTask):', error);
    throw error;
  }
};

/**
 * Reschedule task
 */
export const rescheduleTask = async (taskId, newTime) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/planning/tasks/${taskId}/reschedule`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({ newTime }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('API Error (rescheduleTask):', error);
    throw error;
  }
};

/**
 * Complete task
 */
export const completeTask = async (taskId, actualDuration = null) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/planning/tasks/${taskId}/complete`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({ actualDuration }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('API Error (completeTask):', error);
    throw error;
  }
};

/**
 * Get work pattern settings
 */
export const getWorkPattern = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/planning/work-pattern`, {
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('API Error (getWorkPattern):', error);
    throw error;
  }
};

/**
 * Update work pattern settings
 */
export const updateWorkPattern = async (updates) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/planning/work-pattern`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify(updates),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('API Error (updateWorkPattern):', error);
    throw error;
  }
};

// Default export for backward compatibility
const planningApi = {
  generatePlan,
  getTodaySchedule,
  createTask,
  getTasks,
  updateTask,
  deleteTask,
  rescheduleTask,
  completeTask,
  getWorkPattern,
  updateWorkPattern
};

export default planningApi;