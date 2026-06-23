import api from './api';

export const guardarProgreso = async (actividad_id, puntaje) => {
    const response = await api.post('/progreso', { actividad_id, puntaje });
    return response.data;
};

export const obtenerProgreso = async () => {
    const response = await api.get('/progreso');
    return response.data;
};

export const getRankingMemorама = async () => {
    const response = await api.get('/ranking/memorama');
    return response.data;
};