import api from './api';

export const getInsignias = async () => {
    const response = await api.get('/insignias');
    return response.data;
};
