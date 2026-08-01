import { useTheme } from '../context/ThemeContext';

function InterruptorTema({ style }) {
    const { esOscuro, toggleTema } = useTheme();

    return (
        <button
            onClick={toggleTema}
            title={esOscuro ? 'Cambiar a modo día' : 'Cambiar a modo noche'}
            aria-label={esOscuro ? 'Cambiar a modo día' : 'Cambiar a modo noche'}
            className="flex items-center"
            style={{
                position: 'fixed',
                bottom: '24px',
                right: '24px',
                zIndex: 1000,
                gap: '12px',
                border: 'none',
                cursor: 'pointer',
                padding: '8px 20px 8px 8px',
                borderRadius: '999px',
                background: 'var(--card-bg)',
                boxShadow: '0 10px 26px rgba(var(--shadow-rgb),0.35)',
                border: '2px solid rgba(var(--terracota-rgb),0.35)',
                transition: 'background 0.3s ease, border-color 0.3s ease',
                ...style,
            }}>
            <span style={{
                position: 'relative',
                width: '58px',
                height: '32px',
                borderRadius: '999px',
                flexShrink: 0,
                background: esOscuro
                    ? 'linear-gradient(135deg, #2D3F6B, #1B2A4A)'
                    : 'linear-gradient(135deg, #E9C46A, #C4622D)',
                transition: 'background 0.3s ease',
            }}>
                <span style={{
                    position: 'absolute',
                    top: '3px',
                    left: esOscuro ? '29px' : '3px',
                    width: '26px',
                    height: '26px',
                    borderRadius: '50%',
                    background: '#FFFDF7',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '15px',
                    transition: 'left 0.3s ease',
                    boxShadow: '0 2px 6px rgba(0,0,0,0.3)',
                }}>
                    {esOscuro ? '🌙' : '☀️'}
                </span>
            </span>
            <span style={{
                fontWeight: 800,
                fontSize: '15px',
                color: 'var(--heading)',
                whiteSpace: 'nowrap',
            }}>
                {esOscuro ? 'Modo noche' : 'Modo día'}
            </span>
        </button>
    );
}

export default InterruptorTema;
