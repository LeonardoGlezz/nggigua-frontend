import api from './api';

export const getNiveles = async () => {
    const response = await api.get('/niveles');
    return response.data;
};

export const getActividades = async (nivelId) => {
    const response = await api.get(`/niveles/${nivelId}/actividades`);
    return response.data;
};