import { useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

const PERFILES_VALIDOS = ['Niño', 'Joven', 'Adulto'];

/**
 * Componente "headless" (no renderiza nada visible): su único trabajo es
 * reflejar el tipo_perfil del usuario logueado (Niño/Joven/Adulto) como el
 * atributo data-perfil en <html>, igual que ThemeContext hace con data-tema.
 * Eso permite que index.css adapte tamaños, colores de acento y radios de
 * borde según el perfil, sin tener que pasar esa info por props a cada
 * componente.
 *
 * Sin sesión iniciada (Login/Registro) usa "Joven" como perfil por defecto,
 * que es el diseño base de la app.
 */
function SincronizarPerfil() {
    const { usuario } = useAuth();

    useEffect(() => {
        const tipo = usuario?.tipo_perfil;
        const perfilValido = PERFILES_VALIDOS.includes(tipo) ? tipo : 'Joven';
        document.documentElement.setAttribute('data-perfil', perfilValido);
    }, [usuario]);

    return null;
}

export default SincronizarPerfil;
