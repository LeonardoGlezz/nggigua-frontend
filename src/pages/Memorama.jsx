import { useState, useEffect } from 'react';
import { useNavigate, useLocation  } from 'react-router-dom';
import { guardarProgreso, getRankingMemorama } from '../services/progresoService';

const TODAS_LAS_PALABRAS = [
    { id: 1, emoji: '🐕', palabra: 'kunia', traduccion: 'Perro' },
    { id: 2, emoji: '🐱', palabra: 'kumichin', traduccion: 'Gato' },
    { id: 3, emoji: '🌽', palabra: 'nua', traduccion: 'Maíz' },
    { id: 4, emoji: '💧', palabra: 'jinda', traduccion: 'Agua' },
    { id: 5, emoji: '🏠', palabra: 'nchia', traduccion: 'Casa' },
    { id: 6, emoji: '🌸', palabra: 'tsjo', traduccion: 'Flor' },
    { id: 7, emoji: '🐔', palabra: 'kuchia', traduccion: 'Gallina' },
    { id: 8, emoji: '🐴', palabra: 'kunxin', traduccion: 'Caballo' },
    { id: 9, emoji: '🌳', palabra: 'nthaa', traduccion: 'Árbol' },
    { id: 10, emoji: '🌍', palabra: 'nunthe', traduccion: 'Tierra' },
    { id: 11, emoji: '🍲', palabra: 'ndaxra', traduccion: 'Comida' },
    { id: 12, emoji: '🫓', palabra: 'nio', traduccion: 'Tortilla' },
    { id: 13, emoji: '✋', palabra: 'raa', traduccion: 'Mano' },
    { id: 14, emoji: '👁️', palabra: 'kon', traduccion: 'Ojo' },
    { id: 15, emoji: '🦶', palabra: 'ruthee', traduccion: 'Pie' },
    { id: 16, emoji: '❤️', palabra: 'anseen', traduccion: 'Corazón' },
    { id: 17, emoji: '👩', palabra: 'nchrii', traduccion: 'Mujer' },
    { id: 18, emoji: '👨', palabra: 'tathiita', traduccion: 'Hombre' },
    { id: 19, emoji: '🌿', palabra: 'kane', traduccion: 'Tallo' },
    { id: 20, emoji: '🫙', palabra: 'chi', traduccion: 'Olla' },
];

const CATEGORIAS = {
    1: 'animal', 2: 'animal', 7: 'animal', 8: 'animal',
    3: 'naturaleza', 9: 'naturaleza', 10: 'naturaleza', 19: 'naturaleza',
    4: 'hogar', 5: 'hogar', 11: 'hogar', 12: 'hogar', 20: 'hogar',
    13: 'cuerpo', 14: 'cuerpo', 15: 'cuerpo', 16: 'cuerpo',
    6: 'naturaleza', 17: 'persona', 18: 'persona',
};

const COLOR_CATEGORIA = {
    animal: 'rgba(45,106,79,0.4)',
    naturaleza: 'rgba(30,80,30,0.4)',
    hogar: 'rgba(100,60,20,0.4)',
    cuerpo: 'rgba(80,20,80,0.4)',
    persona: 'rgba(20,60,100,0.4)',
};

const BORDE_CATEGORIA = {
    animal: 'rgba(82,183,136,0.3)',
    naturaleza: 'rgba(100,180,100,0.3)',
    hogar: 'rgba(196,98,45,0.3)',
    cuerpo: 'rgba(180,100,180,0.3)',
    persona: 'rgba(100,150,220,0.3)',
};

const RONDAS = [
    { numero: 1, nombre: 'Ronda 1 — Principiante', pares: 6, palabras: TODAS_LAS_PALABRAS.slice(0, 6) },
    { numero: 2, nombre: 'Ronda 2 — Intermedio', pares: 10, palabras: TODAS_LAS_PALABRAS.slice(0, 10) },
    { numero: 3, nombre: 'Ronda 3 — Avanzado', pares: 20, palabras: TODAS_LAS_PALABRAS },
];

const RANKING_MOCK = [
    { alias: 'XochitlN', puntaje: 115, intentos: 7 },
    { alias: 'TehuaMax', puntaje: 100, intentos: 8 },
    { alias: 'NggiguaPro', puntaje: 85, intentos: 10 },
    { alias: 'Tlaco22', puntaje: 60, intentos: 14 },
    { alias: 'MazatecaX', puntaje: 40, intentos: 18 },
];

function generarCartas(palabras) {
    const deck = [];
    palabras.forEach(par => {
        deck.push({ uid: `${par.id}-emoji`, id: par.id, tipo: 'emoji', contenido: par.emoji, traduccion: par.traduccion, palabra: par.palabra });
        deck.push({ uid: `${par.id}-palabra`, id: par.id, tipo: 'palabra', contenido: par.palabra, traduccion: par.traduccion, emoji: par.emoji });
    });
    return deck.sort(() => Math.random() - 0.5);
}

function Memorama() {
    const navigate = useNavigate();
    const location = useLocation();
const actividad_id = location.state?.actividad_id;
    const [juegoIniciado, setJuegoIniciado] = useState(false);
    const [rondaActual, setRondaActual] = useState(0);
    const [cartas, setCartas] = useState([]);
    const [volteadas, setVolteadas] = useState([]);
    const [encontradas, setEncontradas] = useState([]);
    const [puntaje, setPuntaje] = useState(0);
    const [intentos, setIntentos] = useState(0);
    const [juegoTerminado, setJuegoTerminado] = useState(false);
    const [ranking, setRanking] = useState([]);

    useEffect(() => {
    getRankingMemorama()
        .then(data => setRanking(data))
        .catch(() => setRanking([]));
}, [juegoTerminado]);

    const ronda = RONDAS[rondaActual];

    const iniciarJuego = (indiceRonda) => {
        setRondaActual(indiceRonda);
        setCartas(generarCartas(RONDAS[indiceRonda].palabras));
        setVolteadas([]);
        setEncontradas([]);
        setPuntaje(0);
        setIntentos(0);
        setJuegoTerminado(false);
        setJuegoIniciado(true);
    };

  const voltearCarta = async (carta) => {
    if (volteadas.length === 2) return;
    if (volteadas.find(c => c.uid === carta.uid)) return;
    if (encontradas.includes(carta.id)) return;

    const nuevasVolteadas = [...volteadas, carta];
    setVolteadas(nuevasVolteadas);

    if (nuevasVolteadas.length === 2) {
        setIntentos(prev => prev + 1);
        if (nuevasVolteadas[0].id === nuevasVolteadas[1].id) {
            const nuevasEncontradas = [...encontradas, nuevasVolteadas[0].id];
            setEncontradas(nuevasEncontradas);
            const nuevoPuntaje = puntaje + 20;
            setPuntaje(nuevoPuntaje);
            setVolteadas([]);
            if (nuevasEncontradas.length === ronda.palabras.length) {
                try {
                    await guardarProgreso(actividad_id, nuevoPuntaje);
                } catch (err) {
                    console.error('Error guardando progreso:', err);
                }
                setTimeout(() => setJuegoTerminado(true), 600);
            }
        } else {
            setPuntaje(prev => Math.max(0, prev - 5));
            setTimeout(() => setVolteadas([]), 1000);
        }
    }
};

    const estaVolteada = (carta) =>
        volteadas.find(c => c.uid === carta.uid) || encontradas.includes(carta.id);

    const columnas = ronda?.pares <= 6 ? 4 : ronda?.pares <= 10 ? 4 : 5;

    if (!juegoIniciado) {
        return (
            <div className="min-h-screen flex items-center justify-center"
                style={{ background: 'linear-gradient(135deg, #1B2A4A 0%, #2D1810 100%)' }}>
                <div className="max-w-lg w-full mx-4 rounded-3xl p-8"
                    style={{ background: 'rgba(20,10,5,0.9)', border: '2px solid #C4622D' }}>
                    <div className="text-center mb-6">
                        <div className="text-5xl mb-3">🃏</div>
                        <h1 className="text-3xl font-bold" style={{ color: '#E9C46A' }}>
                            Memorama Nggigua
                        </h1>
                        <p className="text-sm mt-1" style={{ color: '#C4622D' }}>
                            Aprende el idioma Chocholteca jugando
                        </p>
                    </div>

                    {/* Selección de ronda */}
                    <div className="mb-6">
                        <p className="text-sm font-bold mb-3" style={{ color: '#E9C46A' }}>
                            🎯 Elige tu nivel de dificultad:
                        </p>
                        <div className="flex flex-col gap-3">
                            {RONDAS.map((r, i) => (
                                <button key={i}
                                    onClick={() => iniciarJuego(i)}
                                    className="w-full py-3 px-4 rounded-xl font-bold text-left transition-all hover:scale-102 hover:opacity-90 flex justify-between items-center"
                                    style={{
                                        background: i === 0
                                            ? 'linear-gradient(135deg, #2D6A4F, #52B788)'
                                            : i === 1
                                                ? 'linear-gradient(135deg, #C4622D, #E9C46A)'
                                                : 'linear-gradient(135deg, #4A1A4A, #8B4A8B)',
                                        color: 'white',
                                    }}>
                                    <span>{r.nombre}</span>
                                    <span className="text-xs opacity-80">{r.pares} pares</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="rounded-2xl p-4 mb-4"
                        style={{ background: 'rgba(196,98,45,0.1)', border: '1px solid rgba(196,98,45,0.3)' }}>
                        <h2 className="font-bold mb-2 text-sm" style={{ color: '#E9C46A' }}>
                            📜 ¿Cómo jugar?
                        </h2>
                        <ul className="space-y-1">
                            {[
                                'Voltea dos cartas por turno.',
                                'Encuentra el par: imagen y su palabra en Nggigua.',
                                'Par correcto: +20 pts. Error: -5 pts.',
                                'Completa todos los pares para avanzar.',
                            ].map((regla, i) => (
                                <li key={i} className="flex items-start gap-2 text-xs"
                                    style={{ color: '#F4ECD8' }}>
                                    <span style={{ color: '#E9C46A' }}>•</span>
                                    {regla}
                                </li>
                            ))}
                        </ul>
                    </div>

                    <button onClick={() => navigate('/dashboard')}
                        className="w-full py-2 rounded-xl text-sm transition-all hover:opacity-80"
                        style={{ color: 'rgba(255,255,255,0.4)' }}>
                        ← Volver al mapa
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex"
            style={{ background: 'linear-gradient(135deg, #1B2A4A 0%, #2D1810 100%)' }}>

            {/* Panel izquierdo - Score y Ranking */}
            <div className="flex flex-col p-6 gap-4"
    style={{
        width: '22%',
        background: 'rgba(0,0,0,0.4)',
        borderRight: '1px solid rgba(196,98,45,0.2)',
        position: 'sticky',
        top: 0,
        height: '100vh',
        overflowY: 'auto',
    }}>

                {/* Mi puntaje */}
                <div className="rounded-2xl p-4 text-center"
                    style={{ background: 'rgba(196,98,45,0.15)', border: '1px solid rgba(196,98,45,0.4)' }}>
                    <p className="text-xs font-bold mb-1" style={{ color: '#C4622D' }}>MI PUNTAJE</p>
                    <p className="text-5xl font-bold" style={{ color: '#E9C46A' }}>{puntaje}</p>
                    <div className="flex justify-around mt-3">
                        <div>
                            <p className="text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>Intentos</p>
                            <p className="text-xl font-bold text-white">{intentos}</p>
                        </div>
                        <div>
                            <p className="text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>Pares</p>
                            <p className="text-xl font-bold" style={{ color: '#52B788' }}>
                                {encontradas.length}/{ronda.palabras.length}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Ranking */}
                <div className="rounded-2xl p-4"
                    style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(233,196,106,0.2)' }}>
                    <p className="text-xs font-bold mb-3 text-center" style={{ color: '#E9C46A' }}>
                        🏆 TOP 5 RANKING
                    </p>
                    {ranking.map((jugador, i) => (
                        <div key={i} className="flex items-center justify-between mb-2 rounded-lg px-2 py-1"
                            style={{
                                background: i === 0 ? 'rgba(233,196,106,0.15)' : 'rgba(255,255,255,0.03)',
                                border: i === 0 ? '1px solid rgba(233,196,106,0.3)' : 'none'
                            }}>
                            <div className="flex items-center gap-2">
                                <span className="text-sm" style={{
                                    color: i === 0 ? '#E9C46A' : i === 1 ? '#C0C0C0' : i === 2 ? '#CD7F32' : 'rgba(255,255,255,0.4)'
                                }}>
                                    {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `${i + 1}.`}
                                </span>
                                <span className="text-xs font-medium text-white">{jugador.alias}</span>
                            </div>
                            <span className="text-xs font-bold" style={{ color: '#E9C46A' }}>
                                {jugador.puntaje}
                            </span>
                        </div>
                    ))}
                </div>

                <p className="text-xs text-center" style={{ color: '#C4622D' }}>
                    {ronda.nombre}
                </p>

                <button onClick={() => setJuegoIniciado(false)}
                    className="mt-auto py-2 rounded-xl text-xs transition-all hover:opacity-80"
                    style={{ background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.4)', border: '1px solid rgba(255,255,255,0.1)' }}>
                    ← Salir
                </button>
            </div>

            {/* Tablero central */}
            <div className="flex flex-col items-center justify-center p-4"
                style={{ width: '56%' }}>
                <h2 className="text-lg font-bold mb-4" style={{ color: '#E9C46A' }}>
                    🃏 {ronda.nombre}
                </h2>
                <div className={`grid gap-3 w-full`}
                    style={{ gridTemplateColumns: `repeat(${columnas}, 1fr)` }}>
                    {cartas.map(carta => (
                        <div key={carta.uid}
                            onClick={() => voltearCarta(carta)}
                            className="rounded-2xl cursor-pointer transition-all duration-300 hover:scale-105 flex flex-col items-center justify-center"
                            style={{
                                background: estaVolteada(carta)
                                    ? encontradas.includes(carta.id)
                                        ? 'linear-gradient(135deg, #2D6A4F, #52B788)'
                                        : 'linear-gradient(135deg, #C4622D, #E9C46A)'
                                    : 'linear-gradient(135deg, #2D1810, #1B2A4A)',
                                border: estaVolteada(carta)
                                    ? '2px solid #E9C46A'
                                    : '2px solid rgba(255,255,255,0.1)',
                                boxShadow: estaVolteada(carta) ? '0 0 20px rgba(233,196,106,0.3)' : 'none',
                                minHeight: '110px',
                                padding: '10px 6px',
                            }}>
                            {estaVolteada(carta) ? (
                                carta.tipo === 'emoji' ? (
                                    <div className="flex flex-col items-center gap-1">
                                        <span style={{ fontSize: '2.5rem' }}>{carta.contenido}</span>
                                        <span className="text-xs font-medium text-center"
                                            style={{ color: 'rgba(255,255,255,0.95)' }}>
                                            {carta.traduccion}
                                        </span>
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center gap-1">
                                        <span className="text-xl font-bold text-center leading-tight"
                                            style={{ color: 'white' }}>
                                            {carta.contenido}
                                        </span>
                                        <span className="text-xs" style={{ color: 'rgba(255,255,255,0.6)' }}>
                                            Nggigua
                                        </span>
                                    </div>
                                )
                            ) : (
    <div className="flex flex-col items-center gap-1 w-full h-full justify-center rounded-xl"
        style={{
            background: rondaActual === 2
                ? COLOR_CATEGORIA[CATEGORIAS[carta.id]] || 'rgba(30,30,50,0.4)'
                : 'transparent',
            border: rondaActual === 2
                ? `1px solid ${BORDE_CATEGORIA[CATEGORIAS[carta.id]] || 'rgba(255,255,255,0.1)'}`
                : 'none',
            padding: '4px',
        }}>
        <span style={{ fontSize: '1.8rem' }}>🌬️</span>
        {rondaActual === 2 && (
            <span className="text-xs mt-1 font-medium" style={{ color: 'rgba(255,255,255,0.4)' }}>
                {CATEGORIAS[carta.id] || ''}
            </span>
        )}
    </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            {/* Panel derecho - Palabras aprendidas */}
            <div className="flex flex-col p-6 gap-3 overflow-y-auto"
    style={{
        width: '22%',
        background: 'rgba(0,0,0,0.4)',
        borderLeft: '1px solid rgba(196,98,45,0.2)',
        position: 'sticky',
        top: 0,
        height: '100vh',
        overflowY: 'auto',
    }}>
                <p className="text-xs font-bold text-center mb-2" style={{ color: '#52B788' }}>
                    📚 PALABRAS APRENDIDAS
                </p>
                <p className="text-xs text-center mb-2" style={{ color: 'rgba(255,255,255,0.3)' }}>
                    {encontradas.length} de {ronda.palabras.length}
                </p>
                {ronda.palabras.map(par => (
                    <div key={par.id}
                        className="rounded-xl p-3 text-center transition-all duration-700"
                        style={{
                            background: encontradas.includes(par.id)
                                ? 'rgba(45,106,79,0.4)'
                                : 'rgba(255,255,255,0.03)',
                            border: encontradas.includes(par.id)
                                ? '1px solid #52B788'
                                : '1px solid rgba(255,255,255,0.05)',
                        }}>
                        {encontradas.includes(par.id) ? (
                            <>
                                <span style={{ fontSize: '1.5rem' }}>{par.emoji}</span>
                                <p className="text-sm font-bold mt-1" style={{ color: '#E9C46A' }}>
                                    {par.palabra}
                                </p>
                                <p className="text-xs" style={{ color: 'rgba(255,255,255,0.6)' }}>
                                    {par.traduccion}
                                </p>
                            </>
                        ) : (
                            <div className="flex items-center justify-center h-12">
                                <span style={{ color: 'rgba(255,255,255,0.15)', fontSize: '1.5rem' }}>❓</span>
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {/* Pantalla de victoria */}
            {juegoTerminado && (
                <div className="fixed inset-0 flex items-center justify-center"
                    style={{ background: 'rgba(0,0,0,0.88)', zIndex: 50 }}>
                    <div className="text-center p-10 rounded-3xl max-w-sm w-full mx-4"
                        style={{
                            background: 'linear-gradient(135deg, #1B2A4A, #2D1810)',
                            border: '2px solid #E9C46A',
                            boxShadow: '0 0 60px rgba(233,196,106,0.4)',
                            animation: 'aparecer 0.5s ease both',
                        }}>
                        <div style={{ fontSize: '4rem' }}>
                            {rondaActual < RONDAS.length - 1 ? '⭐' : '🏆'}
                        </div>
                        <h2 className="text-3xl font-bold mt-3 mb-1" style={{ color: '#E9C46A' }}>
                            ¡Excelente!
                        </h2>
                        <p className="text-sm mb-4" style={{ color: 'rgba(255,255,255,0.5)' }}>
                            {ronda.nombre} completada
                        </p>
                        <div className="rounded-2xl p-4 mb-2"
                            style={{ background: 'rgba(233,196,106,0.1)', border: '1px solid rgba(233,196,106,0.3)' }}>
                            <p className="text-4xl font-bold" style={{ color: '#E9C46A' }}>{puntaje} pts</p>
                            <p className="text-sm mt-1" style={{ color: 'rgba(255,255,255,0.5)' }}>
                                en {intentos} intentos
                            </p>
                        </div>

                        <div className="flex flex-col gap-3 mt-4">
                            {rondaActual < RONDAS.length - 1 && (
                                <button
                                    onClick={() => iniciarJuego(rondaActual + 1)}
                                    className="w-full py-3 rounded-2xl font-bold transition-all hover:scale-105"
                                    style={{
                                        background: 'linear-gradient(135deg, #2D6A4F, #52B788)',
                                        color: 'white',
                                    }}>
                                    ⚡ Siguiente ronda →
                                </button>
                            )}
                            <button onClick={() => iniciarJuego(rondaActual)}
                                className="w-full py-3 rounded-2xl font-bold transition-all hover:scale-105"
                                style={{
                                    background: 'linear-gradient(135deg, #C4622D, #E9C46A)',
                                    color: 'white',
                                }}>
                                🔄 Jugar de nuevo
                            </button>
                            <button onClick={() => navigate('/dashboard')}
                                className="w-full py-3 rounded-2xl font-bold transition-all hover:opacity-80"
                                style={{
                                    background: 'rgba(255,255,255,0.08)',
                                    color: 'white',
                                    border: '1px solid rgba(255,255,255,0.15)',
                                }}>
                                🗺️ Volver al mapa
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <style>{`
                @keyframes aparecer {
                    from { opacity: 0; transform: scale(0.8); }
                    to { opacity: 1; transform: scale(1); }
                }
            `}</style>
        </div>
    );
}

export default Memorama;