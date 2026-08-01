import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { guardarProgreso, getRankingMemorama } from '../services/progresoService';
import { getItemsActividad } from '../services/leccionService';
import { transformarItems } from '../utils/transformarItems';

const NOMBRE_NIVEL = ['Nivel 1 — Principiante', 'Nivel 2 — Intermedio', 'Nivel 3 — Avanzado'];

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
    const nivelIndex = location.state?.nivelIndex ?? 0;

    const [palabras, setPalabras] = useState([]);
    const [cargando, setCargando] = useState(() => !!actividad_id);
    const [errorCarga, setErrorCarga] = useState(() =>
        actividad_id ? null : 'No se especificó la actividad. Vuelve al mapa e intenta de nuevo.'
    );

    const [juegoIniciado, setJuegoIniciado] = useState(false);
    const [cartas, setCartas] = useState([]);
    const [volteadas, setVolteadas] = useState([]);
    const [encontradas, setEncontradas] = useState([]);
    const [puntaje, setPuntaje] = useState(0);
    const [intentos, setIntentos] = useState(0);
    const [juegoTerminado, setJuegoTerminado] = useState(false);
    const [ranking, setRanking] = useState([]);

    useEffect(() => {
        if (!actividad_id) return; // el estado inicial ya cubrió este caso
        getItemsActividad(actividad_id)
            .then(items => setPalabras(transformarItems(items)))
            .catch(() => setErrorCarga('No se pudo cargar el vocabulario. Intenta de nuevo más tarde.'))
            .finally(() => setCargando(false));
    }, [actividad_id]);

    useEffect(() => {
        getRankingMemorama()
            .then(data => setRanking(data))
            .catch(() => setRanking([]));
    }, [juegoTerminado]);

    const iniciarJuego = () => {
        setCartas(generarCartas(palabras));
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
                if (nuevasEncontradas.length === palabras.length) {
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

    const columnas = palabras.length <= 6 ? 4 : palabras.length <= 10 ? 4 : 5;

    const fondoPagina = { background: 'linear-gradient(180deg, var(--bg-from) 0%, var(--bg-to) 100%)', fontFamily: "'Nunito', sans-serif" };
    const gradienteNivel = nivelIndex === 0
        ? 'linear-gradient(135deg, var(--success-dark), var(--success-light))'
        : nivelIndex === 1
            ? 'linear-gradient(135deg, var(--terracota), var(--gold))'
            : 'linear-gradient(135deg, var(--purple-1), var(--purple-2))';

    if (cargando) {
        return (
            <div className="min-h-screen flex items-center justify-center" style={fondoPagina}>
                <p style={{ fontSize: '18px', color: 'var(--terracota)', fontWeight: 700 }}>Cargando vocabulario…</p>
            </div>
        );
    }

    if (errorCarga) {
        return (
            <div className="min-h-screen flex items-center justify-center" style={fondoPagina}>
                <div className="text-center mx-4" style={{ maxWidth: '440px', width: '100%', borderRadius: '30px', padding: '36px', background: 'var(--card-bg)', border: '2px solid var(--terracota)', boxShadow: '0 18px 40px rgba(var(--terracota-rgb),0.18)' }}>
                    <p className="mb-5" style={{ color: 'var(--terracota)', fontWeight: 700, fontSize: '16px' }}>{errorCarga}</p>
                    <button onClick={() => navigate('/dashboard')} className="w-full" style={{ padding: '15px', borderRadius: '18px', border: 'none', fontWeight: 800, fontSize: '16px', cursor: 'pointer', background: 'rgba(var(--terracota-rgb),0.08)', color: 'var(--heading)' }}>
                        🗺️ Volver al mapa
                    </button>
                </div>
            </div>
        );
    }

    if (!juegoIniciado) {
        return (
            <div className="min-h-screen flex items-center justify-center p-5" style={fondoPagina}>
                <div style={{ maxWidth: '560px', width: '100%', borderRadius: '30px', padding: '46px', background: 'var(--card-bg)', border: '2px solid var(--terracota)', boxShadow: '0 18px 40px rgba(var(--terracota-rgb),0.18)' }}>
                    <div className="text-center mb-6">
                        <div style={{ fontSize: '52px', marginBottom: '10px' }}>🃏</div>
                        <h1 style={{ margin: 0, fontFamily: "'Baloo 2', sans-serif", fontWeight: 800, fontSize: '30px', color: 'var(--heading)' }}>
                            Memorama Nggigua
                        </h1>
                        <p style={{ margin: '8px 0 0', fontSize: '15px', color: 'var(--body-muted)' }}>
                            Aprende el idioma Chocholteca jugando
                        </p>
                    </div>

                    <button onClick={iniciarJuego} className="w-full flex justify-between items-center text-left mb-5"
                        style={{ padding: '18px 22px', border: 'none', borderRadius: '18px', fontWeight: 800, fontSize: '16px', color: 'white', cursor: 'pointer', background: gradienteNivel }}>
                        <span>▶ {NOMBRE_NIVEL[nivelIndex]}</span>
                        <span style={{ fontSize: '14px', opacity: 0.85 }}>{palabras.length} pares</span>
                    </button>

                    <div style={{ borderRadius: '20px', padding: '20px', background: 'rgba(var(--terracota-rgb),0.08)', border: '1px solid rgba(var(--terracota-rgb),0.2)' }}>
                        <h2 style={{ margin: '0 0 10px', fontSize: '15px', fontWeight: 800, color: 'var(--terracota)' }}>📜 ¿Cómo jugar?</h2>
                        <p style={{ margin: '0 0 7px', fontSize: '14px', color: 'var(--tinted-text)' }}>• Voltea dos cartas por turno.</p>
                        <p style={{ margin: '0 0 7px', fontSize: '14px', color: 'var(--tinted-text)' }}>• Encuentra el par: imagen y su palabra en Nggigua.</p>
                        <p style={{ margin: '0 0 7px', fontSize: '14px', color: 'var(--tinted-text)' }}>• Par correcto: +20 pts. Error: -5 pts.</p>
                        <p style={{ margin: 0, fontSize: '14px', color: 'var(--tinted-text)' }}>• Completa todos los pares para avanzar.</p>
                    </div>

                    <button onClick={() => navigate('/dashboard')} className="w-full mt-5" style={{ padding: '10px', border: 'none', background: 'none', fontSize: '15px', color: 'var(--body-muted)', cursor: 'pointer' }}>
                        ← Volver al mapa
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex flex-wrap relative" style={fondoPagina}>

            {/* Panel izquierdo - Score y Ranking */}
            <div className="flex flex-col gap-5 p-7" style={{ flex: '1 1 270px', background: 'rgba(var(--card-bg-rgb),0.6)', borderRight: '1px solid rgba(var(--terracota-rgb),0.15)' }}>
                <div className="text-center" style={{ borderRadius: '20px', padding: '18px', background: 'rgba(var(--terracota-rgb),0.1)', border: '1px solid rgba(var(--terracota-rgb),0.3)' }}>
                    <p style={{ margin: 0, fontSize: '13px', fontWeight: 800, color: 'var(--terracota)' }}>MI PUNTAJE</p>
                    <p style={{ margin: '4px 0', fontSize: '46px', fontWeight: 800, color: 'var(--heading)' }}>{puntaje}</p>
                    <div className="flex justify-around mt-2">
                        <div><p style={{ margin: 0, fontSize: '13px', color: 'var(--body-muted)' }}>Intentos</p><p style={{ margin: 0, fontSize: '20px', fontWeight: 800, color: 'var(--heading)' }}>{intentos}</p></div>
                        <div><p style={{ margin: 0, fontSize: '13px', color: 'var(--body-muted)' }}>Pares</p><p style={{ margin: 0, fontSize: '20px', fontWeight: 800, color: 'var(--success-dark)' }}>{encontradas.length}/{palabras.length}</p></div>
                    </div>
                </div>

                <div style={{ borderRadius: '20px', padding: '16px', background: 'var(--card-bg)', border: '1px solid rgba(var(--gold-rgb),0.4)' }}>
                    <p className="text-center" style={{ margin: '0 0 12px', fontSize: '13px', fontWeight: 800, color: 'var(--terracota)' }}>🏆 TOP 5</p>
                    {ranking.map((jugador, i) => (
                        <div key={i} className="flex justify-between" style={{
                            padding: '7px 10px', borderRadius: '12px', marginBottom: '7px',
                            background: i === 0 ? 'rgba(var(--gold-rgb),0.18)' : 'transparent',
                        }}>
                            <span style={{ fontSize: '14px', fontWeight: 700, color: 'var(--heading)' }}>
                                {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `${i + 1}.`} {jugador.alias}
                            </span>
                            <span style={{ fontSize: '14px', fontWeight: 800, color: 'var(--terracota)' }}>{jugador.puntaje}</span>
                        </div>
                    ))}
                </div>

                <p className="text-center" style={{ fontSize: '15px', color: 'var(--terracota)' }}>{NOMBRE_NIVEL[nivelIndex]}</p>

                <button onClick={() => setJuegoIniciado(false)} className="mt-auto" style={{
                    padding: '12px', borderRadius: '14px', border: '1px solid rgba(var(--locked-rgb),0.25)', background: 'none', fontSize: '14px', color: 'var(--body-muted)', cursor: 'pointer',
                }}>
                    ← Salir
                </button>
            </div>

            {/* Tablero central */}
            <div className="flex flex-col items-center justify-center p-7" style={{ flex: '2 1 460px' }}>
                <h2 style={{ margin: '0 0 18px', fontFamily: "'Baloo 2', sans-serif", fontWeight: 800, fontSize: '21px', color: 'var(--heading)' }}>
                    🃏 {NOMBRE_NIVEL[nivelIndex]}
                </h2>
                <div className="grid gap-4 w-full" style={{ gridTemplateColumns: `repeat(${columnas}, 1fr)`, maxWidth: '600px' }}>
                    {cartas.map(carta => {
                        const encontrada = encontradas.includes(carta.id);
                        const volteadaAhora = estaVolteada(carta);
                        return (
                            <div key={carta.uid}
                                onClick={() => voltearCarta(carta)}
                                className="flex flex-col items-center justify-center cursor-pointer transition-transform"
                                style={{
                                    borderRadius: '18px', minHeight: '120px', gap: '3px',
                                    background: encontrada
                                        ? 'rgba(var(--success-light-rgb),0.18)'
                                        : volteadaAhora
                                            ? 'linear-gradient(135deg, var(--terracota), var(--gold))'
                                            : 'rgba(var(--locked-rgb),0.1)',
                                    border: encontrada
                                        ? '2px solid var(--success-light)'
                                        : volteadaAhora
                                            ? '2px solid var(--gold)'
                                            : '2px solid rgba(var(--locked-rgb),0.18)',
                                }}>
                                {volteadaAhora ? (
                                    carta.tipo === 'emoji' ? (
                                        <>
                                            <span style={{ fontSize: '32px' }}>{carta.contenido}</span>
                                            <span style={{ fontSize: '13px', fontWeight: 700, color: encontrada ? 'var(--heading)' : 'white' }}>{carta.traduccion}</span>
                                        </>
                                    ) : (
                                        <>
                                            <span style={{ fontSize: '22px', fontWeight: 800, color: encontrada ? 'var(--heading)' : 'white' }}>{carta.contenido}</span>
                                            <span style={{ fontSize: '12px', color: encontrada ? 'var(--body-muted)' : 'rgba(255,255,255,0.85)' }}>Nggigua</span>
                                        </>
                                    )
                                ) : (
                                    <span style={{ fontSize: '30px', color: 'rgba(var(--locked-rgb),0.55)' }}>🌬️</span>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Panel derecho - Palabras aprendidas */}
            <div className="flex flex-col gap-3 p-7" style={{ flex: '1 1 230px', background: 'rgba(var(--card-bg-rgb),0.6)', borderLeft: '1px solid rgba(var(--terracota-rgb),0.15)' }}>
                <p className="text-center" style={{ margin: '0 0 5px', fontSize: '13px', fontWeight: 800, color: 'var(--success-dark)' }}>📚 PALABRAS APRENDIDAS</p>
                <p className="text-center" style={{ margin: '0 0 5px', fontSize: '13px', color: 'var(--locked)' }}>{encontradas.length} de {palabras.length}</p>
                {palabras.map(par => {
                    const encontrada = encontradas.includes(par.id);
                    return (
                        <div key={par.id} className="text-center" style={{
                            borderRadius: '16px', padding: '12px',
                            background: encontrada ? 'rgba(var(--success-light-rgb),0.16)' : 'rgba(var(--locked-rgb),0.06)',
                            border: encontrada ? '1px solid var(--success-light)' : '1px dashed rgba(var(--locked-rgb),0.2)',
                        }}>
                            {encontrada ? (
                                <>
                                    <span style={{ fontSize: '24px' }}>{par.emoji}</span>
                                    <p style={{ margin: '3px 0 0', fontSize: '15px', fontWeight: 800, color: 'var(--heading)' }}>{par.palabra}</p>
                                    <p style={{ margin: 0, fontSize: '13px', color: 'var(--body-muted)' }}>{par.traduccion}</p>
                                </>
                            ) : (
                                <div className="flex items-center justify-center" style={{ height: '24px', color: 'var(--locked-soft)' }}>❓</div>
                            )}
                        </div>
                    );
                })}
            </div>

            {/* Pantalla de victoria */}
            {juegoTerminado && (
                <div className="fixed inset-0 flex items-center justify-center" style={{ background: 'rgba(var(--overlay-rgb),0.55)', backdropFilter: 'blur(3px)', zIndex: 60 }}>
                    <div className="text-center mx-4" style={{
                        maxWidth: '410px', width: '100%', borderRadius: '30px', padding: '46px',
                        background: 'var(--card-bg)', border: '2px solid var(--gold)', boxShadow: '0 20px 60px rgba(var(--terracota-rgb),0.3)',
                        animation: 'popIn 0.4s ease both',
                    }}>
                        <div style={{ fontSize: '56px' }}>{nivelIndex < 2 ? '⭐' : '🏆'}</div>
                        <h2 style={{ margin: '14px 0 3px', fontFamily: "'Baloo 2', sans-serif", fontWeight: 800, fontSize: '30px', color: 'var(--heading)' }}>
                            ¡Excelente!
                        </h2>
                        <p style={{ margin: '0 0 18px', fontSize: '15px', color: 'var(--body-muted)' }}>
                            {NOMBRE_NIVEL[nivelIndex]} completado
                        </p>
                        <div style={{ borderRadius: '20px', padding: '18px', background: 'rgba(var(--gold-rgb),0.16)', border: '1px solid rgba(var(--gold-rgb),0.4)' }}>
                            <p style={{ margin: 0, fontSize: '38px', fontWeight: 800, color: 'var(--terracota)' }}>{puntaje} pts</p>
                            <p style={{ margin: '3px 0 0', fontSize: '14px', color: 'var(--body-muted)' }}>en {intentos} intentos</p>
                        </div>

                        <div className="flex flex-col gap-3 mt-5">
                            <button onClick={iniciarJuego} style={{ padding: '15px', border: 'none', borderRadius: '18px', fontWeight: 800, fontSize: '16px', color: 'white', cursor: 'pointer', background: 'linear-gradient(135deg, var(--terracota), var(--gold))' }}>
                                🔄 Jugar de nuevo
                            </button>
                            <button onClick={() => navigate('/dashboard')} style={{ padding: '15px', border: '1px solid rgba(var(--locked-rgb),0.25)', borderRadius: '18px', fontWeight: 800, fontSize: '16px', color: 'var(--heading)', cursor: 'pointer', background: 'none' }}>
                                🗺️ Volver al mapa
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Memorama;
