import { createContext, useState, useContext, useEffect } from 'react';

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
    const [tema, setTema] = useState(() => localStorage.getItem('tema') || 'claro');

    useEffect(() => {
        document.documentElement.setAttribute('data-tema', tema);
        localStorage.setItem('tema', tema);
    }, [tema]);

    const toggleTema = () => setTema(prev => (prev === 'claro' ? 'oscuro' : 'claro'));

    return (
        <ThemeContext.Provider value={{ tema, toggleTema, esOscuro: tema === 'oscuro' }}>
            {children}
        </ThemeContext.Provider>
    );
};

export const useTheme = () => useContext(ThemeContext);
