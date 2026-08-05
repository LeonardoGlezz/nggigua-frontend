import { createContext, useState, useContext, useEffect } from 'react';
import { getPerfil } from '../services/authService';

const AuthContext = createContext();

// El JWT ya trae { id, rol } en su payload (authController.login lo firma
// así). Decodificarlo en el cliente evita un roundtrip extra a la API
// solo para saber si hay que mostrar el link al panel de admin — esto NO
// es una verificación de seguridad (el backend siempre revalida el rol en
// cada request vía verificarAdmin), es solo para decidir qué mostrar en la UI.
const decodificarRolDeToken = (token) => {
    try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        return payload.rol || null;
    } catch {
        return null;
    }
};

export const AuthProvider = ({ children }) => {
    const [usuario, setUsuario] = useState(null);
    const [token, setToken] = useState(() => localStorage.getItem('token'));
    const [rol, setRol] = useState(() => {
        const t = localStorage.getItem('token');
        return t ? decodificarRolDeToken(t) : null;
    });
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
        setRol(decodificarRolDeToken(tokenRecibido));
        const datos = await getPerfil();
        setUsuario(datos.usuario);
    };

    const cerrarSesion = () => {
        setUsuario(null);
        setToken(null);
        setRol(null);
        localStorage.removeItem('token');
    };

    const esAdmin = rol === 'ADMIN';

    return (
        <AuthContext.Provider value={{ usuario, token, rol, esAdmin, cargando, iniciarSesion, cerrarSesion }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);