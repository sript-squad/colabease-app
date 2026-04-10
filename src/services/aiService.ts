import axios from 'axios';

const BASE_URL = 'http://localhost:3000/ai';

export const aiService = {
  suggestTasks: async (name: string, description?: string) => {
    return axios.post(`${BASE_URL}/suggest-tasks`, { name, description });
  },
};
