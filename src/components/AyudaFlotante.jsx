import { useState } from 'react';

// Guía rápida por minijuego: qué hay que hacer y cómo se gana. Se pidió
// explícitamente que la app tenga "más guía al usuario" — este botón
// flotante (?) está disponible en todo momento dentro de cada minijuego,
// no solo en la primera visita, para que el usuario pueda consultarlo
// cuando quiera sin perder su progreso de la partida.
const GUIAS = {
    general: {
        titulo: '🌬️ Cómo funciona Hablando Nggigua',
        pasos: [
            'La app tiene 3 niveles de dificultad. Completa todas las actividades de un nivel para desbloquear el siguiente.',
            'Cada nivel tiene varios minijuegos: Memorama, Ahorcado, Atrapa la Palabra, Empareja Columnas y Ruleta de Categorías.',
            'Dentro de cada minijuego hay un botón (?) como este para ver sus reglas específicas en cualquier momento.',
            'Juega todos los días para mantener tu racha 🔥 — se muestra junto a tu nombre y en tu perfil.',
            'En tu Perfil puedes ver tus puntos, actividades completadas e insignias ganadas.',
        ],
    },
    ahorcado: {
        titulo: '🔤 Cómo se juega Ahorcado',
        pasos: [
            'Se te muestra una palabra en Nggigua con espacios en blanco por cada letra.',
            'Toca las letras del teclado para adivinar cuáles la forman.',
            'Cada letra incorrecta acerca al explorador al peligro — tienes un número limitado de errores.',
            'Adivina toda la palabra antes de quedarte sin intentos para ganar puntos.',
        ],
    },
    atrapa_palabra: {
        titulo: '⚡ Cómo se juega Atrapa la Palabra',
        pasos: [
            'Van cayendo palabras en Nggigua y en español.',
            'Mueve al personaje (con el mouse, el dedo o las flechas) para atraparlas.',
            'Atrapa solo las palabras que sean traducción correcta de la categoría que se pide.',
            'Atrapar una palabra incorrecta resta puntos o vidas — hay que ser rápido y preciso.',
        ],
    },
    memorama: {
        titulo: '🃏 Cómo se juega Memorama',
        pasos: [
            'Todas las cartas están boca abajo.',
            'Volteas dos cartas por turno: buscas la pareja palabra en Nggigua ↔ su significado.',
            'Si aciertas, la pareja se queda descubierta. Si fallas, ambas se voltean de nuevo.',
            'Entre menos intentos uses para encontrar todas las parejas, mejor tu puntaje.',
        ],
    },
    empareja: {
        titulo: '🖼️ Cómo se juega Empareja Columnas',
        pasos: [
            'Hay dos columnas: una con palabras en Nggigua, otra con sus significados.',
            'Toca un elemento de la columna izquierda y luego su pareja correcta en la derecha.',
            'Se traza una línea conectando cada pareja correcta.',
            'Completa todas las parejas para terminar la actividad.',
        ],
    },
    ruleta: {
        titulo: '🎯 Cómo se juega Ruleta de Categorías',
        pasos: [
            'Gira la ruleta para que elija una categoría al azar.',
            'Aparecen palabras relacionadas con esa categoría.',
            'Selecciona las palabras que pertenezcan correctamente a esa categoría en Nggigua.',
            'Aciertas más puntos mientras más rápido y preciso seas.',
        ],
    },
};

function AyudaFlotante({ juego }) {
    const [abierta, setAbierta] = useState(false);
    const guia = GUIAS[juego];
    if (!guia) return null;

    return (
        <>
            <button
                onClick={() => setAbierta(true)}
                title="Ver ayuda de este juego"
                className="fixed flex items-center justify-center transition-transform"
                style={{
                    // El interruptor de modo día/noche (InterruptorTema) también es
                    // position:fixed en la esquina inferior derecha (bottom:24px,
                    // right:24px, ~52px de alto). Este botón se coloca justo encima
                    // de él (24 + 52 + 12px de separación) para que no se encimen.
                    bottom: '88px', right: '24px', zIndex: 900,
                    width: '52px', height: '52px', borderRadius: '50%', fontSize: '22px', fontWeight: 800,
                    color: 'white', border: 'none', cursor: 'pointer',
                    background: 'linear-gradient(135deg, var(--terracota), var(--gold))',
                    boxShadow: '0 8px 20px rgba(var(--terracota-rgb),0.4)',
                }}
                onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.08)'}
                onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
            >
                ?
            </button>

            {abierta && (
                <div className="fixed inset-0 flex items-center justify-center p-4"
                    style={{ background: 'rgba(0,0,0,0.55)', zIndex: 60 }}
                    onClick={() => setAbierta(false)}>
                    <div onClick={(e) => e.stopPropagation()} style={{
                        width: '100%', maxWidth: '440px', background: 'var(--card-bg)', borderRadius: '24px', padding: '30px',
                        boxShadow: '0 20px 50px rgba(0,0,0,0.3)',
                    }}>
                        <h3 style={{ margin: '0 0 16px', fontFamily: "'Baloo 2', sans-serif", fontWeight: 800, fontSize: '20px', color: 'var(--heading)' }}>
                            {guia.titulo}
                        </h3>
                        <ol style={{ margin: 0, padding: '0 0 0 20px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                            {guia.pasos.map((paso, i) => (
                                <li key={i} style={{ fontSize: '15px', color: 'var(--body-muted)', lineHeight: 1.5 }}>{paso}</li>
                            ))}
                        </ol>
                        <button onClick={() => setAbierta(false)} className="w-full mt-6" style={{
                            padding: '13px', borderRadius: '14px', border: 'none', cursor: 'pointer', fontWeight: 800, fontSize: '16px',
                            background: 'linear-gradient(135deg, var(--terracota), var(--gold))', color: 'white',
                        }}>
                            ¡Entendido! 🎮
                        </button>
                    </div>
                </div>
            )}
        </>
    );
}

export default AyudaFlotante;
