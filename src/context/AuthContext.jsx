import { createContext, useState, useContext, useEffect } from 'react';
import { getPerfil } from '../services/authService';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [usuario, setUsuario] = useState(null);
    const [token, setToken] = useState(() => localStorage.getItem('token'));
    // Si no hay token guardado, no hay nada que esperar.
    const [cargando, setCargando] = useState(() => !!localStorage.getItem('token'));

    // Al recargar la página, si hay token → recupera el perfil
    useEffect(() => {
        if (!token) return;
        getPerfil()
            .then(datos => setUsuario(datos.usuario))
            .catch(() => {
                localStorage.removeItem('token');
                setToken(null);
            })
            .finally(() => setCargando(false));
    }, []);

    const iniciarSesion = async (tokenRecibido) => {
        localStorage.setItem('token', tokenRecibido);
        setToken(tokenRecibido);
        const datos = await getPerfil();
        setUsuario(datos.usuario);
    };

    const cerrarSesion = () => {
        setUsuario(null);
        setToken(null);
        localStorage.removeItem('token');
    };

    return (
        <AuthContext.Provider value={{ usuario, token, cargando, iniciarSesion, cerrarSesion }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);