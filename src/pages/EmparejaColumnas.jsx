import { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { guardarProgreso } from '../services/progresoService';
import { getItemsActividad } from '../services/leccionService';
import { transformarItems } from '../utils/transformarItems';

const NOMBRE_NIVEL = ['Nivel 1 — Básico', 'Nivel 2 — Intermedio', 'Nivel 3 — Avanzado'];

function mezclar(arr) {
    return [...arr].sort(() => Math.random() - 0.5);
}

function calcularEstrellas(errores) {
    if (errores <= 1) return 3;
    if (errores <= 3) return 2;
    return 1;
}
const TIPOS = ['nggigua', 'emoji', 'espanol'];

function tipoAleatorio(excluir) {
    let tipo = TIPOS[Math.floor(Math.random() * TIPOS.length)];
    while (tipo === excluir) {
        tipo = TIPOS[Math.floor(Math.random() * TIPOS.length)];
    }
    return tipo;
}

function asignarTipos(item) {
    const tipoIzq = TIPOS[Math.floor(Math.random() * TIPOS.length)];
    const tipoDer = tipoAleatorio(tipoIzq);
    return { ...item, tipoIzq, tipoDer };
}

function renderContenido(item, tipo) {
    if (tipo === 'emoji') return <span style={{ fontSize: '2.2rem' }}>{item.emoji}</span>;
    if (tipo === 'espanol') return <span>{item.traduccion}</span>;
    return <span>{item.palabra}</span>;
}

function EmparejaColumnas() {
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
    const [columnaIzq, setColumnaIzq] = useState([]);
    const [columnaDer, setColumnaDer] = useState([]);
    const [seleccionIzq, setSeleccionIzq] = useState(null);
    const [conectados, setConectados] = useState([]);
    const [lineas, setLineas] = useState([]);
    const [lineaError, setLineaError] = useState(null);
    const [puntaje, setPuntaje] = useState(0);
    const [combo, setCombo] = useState(0);
    const [errores, setErrores] = useState(0);
    const [intentos, setIntentos] = useState(0);
    const [juegoTerminado, setJuegoTerminado] = useState(false);

    const containerRef = useRef(null);
    const leftRefs = useRef({});
    const rightRefs = useRef({});

    useEffect(() => {
        if (!actividad_id) return; // el estado inicial ya cubrió este caso
        getItemsActividad(actividad_id)
            .then(items => setPalabras(transformarItems(items)))
            .catch(() => setErrorCarga('No se pudo cargar el vocabulario. Intenta de nuevo más tarde.'))
            .finally(() => setCargando(false));
    }, [actividad_id]);

    const iniciarJuego = () => {
        const palabrasConTipo = palabras.map(asignarTipos);
        setColumnaIzq(mezclar(palabrasConTipo));
        setColumnaDer(mezclar(palabrasConTipo));
        setSeleccionIzq(null);
        setConectados([]);
        setLineas([]);
        setLineaError(null);
        setPuntaje(0);
        setCombo(0);
        setErrores(0);
        setIntentos(0);
        setJuegoTerminado(false);
        setJuegoIniciado(true);
        leftRefs.current = {};
        rightRefs.current = {};
    };

    const obtenerCoords = useCallback((id, refsMap) => {
        const el = refsMap.current[id];
        const cont = containerRef.current;
        if (!el || !cont) return null;
        const elRect = el.getBoundingClientRect();
        const contRect = cont.getBoundingClientRect();
        return {
            x: elRect.left - contRect.left + elRect.width / 2,
            y: elRect.top - contRect.top + elRect.height / 2,
        };
    }, []);

    useEffect(() => {
        const recalcular = () => {
            const nuevas = conectados.map(id => {
                const p1 = obtenerCoords(id, leftRefs);
                const p2 = obtenerCoords(id, rightRefs);
                if (!p1 || !p2) return null;
                return { id, x1: p1.x, y1: p1.y, x2: p2.x, y2: p2.y };
            }).filter(Boolean);
            setLineas(nuevas);
        };
        recalcular();
        window.addEventListener('resize', recalcular);
        return () => window.removeEventListener('resize', recalcular);
    }, [conectados, obtenerCoords]);

    const manejarClickIzq = (id) => {
        if (conectados.includes(id)) return;
        setSeleccionIzq(id);
    };

    const manejarClickDer = async (parDerecho) => {
        if (seleccionIzq === null) return;
        if (conectados.includes(parDerecho.id)) return;

        setIntentos(prev => prev + 1);

        if (parDerecho.id === seleccionIzq) {
            const bonus = combo * 2;
            const nuevoPuntaje = puntaje + 20 + bonus;
            const nuevoCombo = combo + 1;
            const nuevosConectados = [...conectados, parDerecho.id];

            setPuntaje(nuevoPuntaje);
            setCombo(nuevoCombo);
            setConectados(nuevosConectados);
            setSeleccionIzq(null);

            if (nuevosConectados.length === palabras.length) {
                try {
                    await guardarProgreso(actividad_id, nuevoPuntaje);
                } catch (err) {
                    console.error('Error guardando progreso:', err);
                }
                setTimeout(() => setJuegoTerminado(true), 500);
            }
        } else {
            const p1 = obtenerCoords(seleccionIzq, leftRefs);
            const p2 = obtenerCoords(parDerecho.id, rightRefs);
            if (p1 && p2) {
                setLineaError({ x1: p1.x, y1: p1.y, x2: p2.x, y2: p2.y });
                setTimeout(() => setLineaError(null), 400);
            }
            setPuntaje(prev => Math.max(0, prev - 5));
            setCombo(0);
            setErrores(prev => prev + 1);
            setSeleccionIzq(null);
        }
    };

    const estrellas = calcularEstrellas(errores);
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
                        <div style={{ fontSize: '52px', marginBottom: '10px' }}>🔗</div>
                        <h1 style={{ margin: 0, fontFamily: "'Baloo 2', sans-serif", fontWeight: 800, fontSize: '30px', color: 'var(--heading)' }}>
                            Empareja Columnas
                        </h1>
                        <p style={{ margin: '8px 0 0', fontSize: '15px', color: 'var(--body-muted)' }}>
                            Conecta cada palabra con su traducción
                        </p>
                    </div>

                    <button onClick={iniciarJuego} className="w-full flex justify-between items-center text-left mb-5"
                        style={{ padding: '18px 22px', border: 'none', borderRadius: '18px', fontWeight: 800, fontSize: '16px', color: 'white', cursor: 'pointer', background: gradienteNivel }}>
                        <span>▶ {NOMBRE_NIVEL[nivelIndex]}</span>
                        <span style={{ fontSize: '14px', opacity: 0.85 }}>{palabras.length} pares</span>
                    </button>

                    <div style={{ borderRadius: '20px', padding: '20px', background: 'rgba(var(--terracota-rgb),0.08)', border: '1px solid rgba(var(--terracota-rgb),0.2)' }}>
                        <h2 style={{ margin: '0 0 10px', fontSize: '15px', fontWeight: 800, color: 'var(--terracota)' }}>📜 ¿Cómo jugar?</h2>
                        <p style={{ margin: '0 0 7px', fontSize: '14px', color: 'var(--tinted-text)' }}>• Toca una palabra en Nggigua, luego su traducción.</p>
                        <p style={{ margin: '0 0 7px', fontSize: '14px', color: 'var(--tinted-text)' }}>• Acierto: +20 pts, y suma bonus si llevas racha.</p>
                        <p style={{ margin: '0 0 7px', fontSize: '14px', color: 'var(--tinted-text)' }}>• Error: -5 pts y se reinicia tu racha.</p>
                        <p style={{ margin: 0, fontSize: '14px', color: 'var(--tinted-text)' }}>• Conecta todos los pares para ganar estrellas.</p>
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

            {/* Panel izquierdo - Score */}
            <div className="flex flex-col gap-4 p-7" style={{ flex: '1 1 250px', background: 'rgba(var(--card-bg-rgb),0.6)', borderRight: '1px solid rgba(var(--terracota-rgb),0.15)' }}>
                <div className="text-center" style={{ borderRadius: '20px', padding: '18px', background: 'rgba(var(--terracota-rgb),0.1)', border: '1px solid rgba(var(--terracota-rgb),0.3)' }}>
                    <p style={{ margin: 0, fontSize: '13px', fontWeight: 800, color: 'var(--terracota)' }}>MI PUNTAJE</p>
                    <p style={{ margin: '4px 0', fontSize: '46px', fontWeight: 800, color: 'var(--heading)' }}>{puntaje}</p>
                    <div className="flex justify-around mt-2">
                        <div><p style={{ margin: 0, fontSize: '13px', color: 'var(--body-muted)' }}>Combo</p><p style={{ margin: 0, fontSize: '20px', fontWeight: 800, color: 'var(--success-dark)' }}>🔥 {combo}</p></div>
                        <div><p style={{ margin: 0, fontSize: '13px', color: 'var(--body-muted)' }}>Pares</p><p style={{ margin: 0, fontSize: '20px', fontWeight: 800, color: 'var(--success-dark)' }}>{conectados.length}/{palabras.length}</p></div>
                    </div>
                </div>

                <p className="text-center" style={{ fontSize: '15px', color: 'var(--terracota)' }}>{NOMBRE_NIVEL[nivelIndex]}</p>

                <button onClick={() => setJuegoIniciado(false)} className="mt-auto" style={{ padding: '12px', borderRadius: '14px', border: '1px solid rgba(var(--locked-rgb),0.25)', background: 'none', fontSize: '14px', color: 'var(--body-muted)', cursor: 'pointer' }}>
                    ← Salir
                </button>
            </div>

            {/* Tablero central */}
            <div className="flex flex-col items-center p-7" style={{ flex: '3 1 500px' }}>
                <h2 style={{ margin: '0 0 22px', fontFamily: "'Baloo 2', sans-serif", fontWeight: 800, fontSize: '21px', color: 'var(--heading)' }}>
                    🔗 {NOMBRE_NIVEL[nivelIndex]}
                </h2>

                <div ref={containerRef} className="relative w-full flex justify-between gap-7" style={{ maxWidth: '620px' }}>
                    <svg className="absolute top-0 left-0 w-full h-full pointer-events-none" style={{ zIndex: 1 }}>
                        {lineas.map(l => (
                            <line key={l.id} x1={l.x1} y1={l.y1} x2={l.x2} y2={l.y2}
                                stroke="var(--success-light)" strokeWidth="3" strokeLinecap="round" />
                        ))}
                        {lineaError && (
                            <line x1={lineaError.x1} y1={lineaError.y1} x2={lineaError.x2} y2={lineaError.y2}
                                stroke="var(--error)" strokeWidth="3" strokeLinecap="round" />
                        )}
                    </svg>

                    {/* Columna Nggigua */}
                    <div className="relative flex flex-col gap-3" style={{ width: '45%', zIndex: 2 }}>
                        {columnaIzq.map(item => {
                            const conectado = conectados.includes(item.id);
                            const seleccionado = seleccionIzq === item.id;
                            return (
                                <div key={item.id}
                                    ref={el => (leftRefs.current[item.id] = el)}
                                    onClick={() => manejarClickIzq(item.id)}
                                    className="text-center font-extrabold transition-all"
                                    style={{
                                        borderRadius: '16px', padding: '15px', fontSize: '16px',
                                        background: conectado
                                            ? 'linear-gradient(135deg, var(--success-dark), var(--success-light))'
                                            : seleccionado
                                                ? 'linear-gradient(135deg, var(--terracota), var(--gold))'
                                                : 'var(--card-bg)',
                                        border: seleccionado ? '2px solid var(--gold)' : '2px solid rgba(var(--locked-rgb),0.15)',
                                        color: (conectado || seleccionado) ? 'white' : 'var(--heading)',
                                        opacity: conectado ? 0.7 : 1,
                                        cursor: conectado ? 'default' : 'pointer',
                                    }}>
                                    {renderContenido(item, item.tipoIzq)}
                                </div>
                            );
                        })}
                    </div>

                    {/* Columna Español (mezclada) */}
                    <div className="relative flex flex-col gap-3" style={{ width: '45%', zIndex: 2 }}>
                        {columnaDer.map(item => {
                            const conectado = conectados.includes(item.id);
                            return (
                                <div key={item.id}
                                    ref={el => (rightRefs.current[item.id] = el)}
                                    onClick={() => manejarClickDer(item)}
                                    className="text-center font-extrabold cursor-pointer transition-all flex items-center justify-center gap-2"
                                    style={{
                                        borderRadius: '16px', padding: '15px', fontSize: '16px',
                                        background: conectado ? 'linear-gradient(135deg, var(--success-dark), var(--success-light))' : 'var(--card-bg)',
                                        border: '2px solid rgba(var(--locked-rgb),0.15)',
                                        color: conectado ? 'white' : 'var(--heading)',
                                        opacity: conectado ? 0.7 : 1,
                                        cursor: conectado ? 'default' : 'pointer',
                                    }}>
                                    {renderContenido(item, item.tipoDer)}
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Pantalla de victoria */}
            {juegoTerminado && (
                <div className="fixed inset-0 flex items-center justify-center" style={{ background: 'rgba(var(--overlay-rgb),0.55)', backdropFilter: 'blur(3px)', zIndex: 60 }}>
                    <div className="text-center mx-4" style={{ maxWidth: '410px', width: '100%', borderRadius: '30px', padding: '46px', background: 'var(--card-bg)', border: '2px solid var(--gold)', boxShadow: '0 20px 60px rgba(var(--terracota-rgb),0.3)' }}>
                        <div style={{ fontSize: '42px' }}>
                            {'⭐'.repeat(estrellas)}{'☆'.repeat(3 - estrellas)}
                        </div>
                        <h2 style={{ margin: '14px 0 3px', fontFamily: "'Baloo 2', sans-serif", fontWeight: 800, fontSize: '30px', color: 'var(--heading)' }}>
                            ¡Excelente!
                        </h2>
                        <p style={{ margin: '0 0 18px', fontSize: '15px', color: 'var(--body-muted)' }}>
                            {NOMBRE_NIVEL[nivelIndex]} completado
                        </p>
                        <div style={{ borderRadius: '20px', padding: '18px', background: 'rgba(var(--gold-rgb),0.16)', border: '1px solid rgba(var(--gold-rgb),0.4)' }}>
                            <p style={{ margin: 0, fontSize: '38px', fontWeight: 800, color: 'var(--terracota)' }}>{puntaje} pts</p>
                            <p style={{ margin: '3px 0 0', fontSize: '14px', color: 'var(--body-muted)' }}>{intentos} intentos · {errores} errores</p>
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

export default EmparejaColumnas;
