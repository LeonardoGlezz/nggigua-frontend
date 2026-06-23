import api from './api';

export const login = async (correo, contrasena) => {
    const response = await api.post('/auth/login', { correo, contrasena });
    localStorage.setItem('token', response.data.token);
    return response.data;
};

export const registro = async (correo, contrasena, nombre, tipo_perfil) => {
    const response = await api.post('/auth/registro', { correo, contrasena, nombre, tipo_perfil });
    return response.data;
};

export const logout = () => {
    localStorage.removeItem('token');
};

export const getPerfil = async () => {
    const response = await api.get('/auth/perfil-completo');
    return response.data;
};