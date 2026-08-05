import api from './api';

// ===== Usuarios =====
export const listarUsuarios = async () => (await api.get('/admin/usuarios')).data;
export const obtenerUsuario = async (id) => (await api.get(`/admin/usuarios/${id}`)).data;
export const actualizarUsuario = async (id, datos) => (await api.put(`/admin/usuarios/${id}`, datos)).data;
export const eliminarUsuario = async (id) => (await api.delete(`/admin/usuarios/${id}`)).data;

// ===== Estadísticas =====
export const getEstadisticas = async () => (await api.get('/admin/estadisticas')).data;

// ===== Niveles =====
export const listarNivelesAdmin = async () => (await api.get('/admin/niveles')).data;
export const crearNivel = async (datos) => (await api.post('/admin/niveles', datos)).data;
export const actualizarNivel = async (id, datos) => (await api.put(`/admin/niveles/${id}`, datos)).data;
export const eliminarNivel = async (id) => (await api.delete(`/admin/niveles/${id}`)).data;

// ===== Actividades =====
export const listarActividadesAdmin = async (nivel_id) =>
    (await api.get('/admin/actividades', { params: nivel_id ? { nivel_id } : {} })).data;
export const crearActividad = async (datos) => (await api.post('/admin/actividades', datos)).data;
export const actualizarActividad = async (id, datos) => (await api.put(`/admin/actividades/${id}`, datos)).data;
export const eliminarActividad = async (id) => (await api.delete(`/admin/actividades/${id}`)).data;

// ===== Items de actividad =====
export const listarItems = async (actividad_id) => (await api.get(`/admin/actividades/${actividad_id}/items`)).data;
export const crearItem = async (datos) => (await api.post('/admin/items', datos)).data;
export const actualizarItem = async (id, datos) => (await api.put(`/admin/items/${id}`, datos)).data;
export const eliminarItem = async (id) => (await api.delete(`/admin/items/${id}`)).data;
