import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { guardarProgreso } from '../services/progresoService';
import { getItemsActividad } from '../services/leccionService';
import { transformarItems } from '../utils/transformarItems';
import exploradorCanasta from '../assets/explorador-canasta.png';
import AyudaFlotante from '../components/AyudaFlotante';

const ANCHO_PERSONAJE = 80;
const VELOCIDAD_CAIDA_INICIAL = 0.16;
const VELOCIDAD_CAIDA_VARIACION = 0.14;
const META_ACIERTOS = 10;

function generarPalabrasCayendo(correcta, todas) {
    const trampas = todas
        .filter(p => p.palabra !== correcta.palabra)
        .sort(() => Math.random() - 0.5)
        .slice(0, 5);

    const opciones = [correcta, ...trampas].sort(() => Math.random() - 0.5);

    return opciones.map((p, i) => ({
        id: Date.now() + i,
        texto: p.palabra,
        esCorrecta: p.palabra === correcta.palabra,
        x: 5 + (i * 16),
        y: -15 - (i * 25),
        velocidad: VELOCIDAD_CAIDA_INICIAL + Math.random() * VELOCIDAD_CAIDA_VARIACION,
        capturada: false,
        fallida: false,
    }));
}

export default function AtrapaPalabra() {
    const navigate = useNavigate();
    const location = useLocation();
    const actividad_id = location.state?.actividad_id;
    const areaRef = useRef(null);
    const animRef = useRef(null);
    const palabrasCayendoRef = useRef([]);
    const personajeXRef = useRef(50);
    const personajeRef = useRef(null);

    const [palabras, setPalabras] = useState([]);
    const [cargando, setCargando] = useState(() => !!actividad_id);
    const [errorCarga, setErrorCarga] = useState(() =>
        actividad_id ? null : 'No se especificó la actividad. Vuelve al mapa e intenta de nuevo.'
    );

    const [palabrasCayendo, setPalabrasCayendo] = useState([]);
    const [puntajeActual, setPuntajeActual] = useState(null);
    const [aciertos, setAciertos] = useState(0);
    const [vidas, setVidas] = useState(3);
    const [puntaje, setPuntaje] = useState(0);
    const [juegoTerminado, setJuegoTerminado] = useState(false);
    const [gano, setGano] = useState(false);
    const [feedback, setFeedback] = useState(null);
    const [juegoIniciado, setJuegoIniciado] = useState(false);
    const [conteo, setConteo] = useState(null);

    const [indicePalabra, setIndicePalabra] = useState(0);
    const palabraActual = palabras.length > 0 ? palabras[indicePalabra % palabras.length] : null;

    useEffect(() => {
        if (!actividad_id) return; // el estado inicial ya cubrió este caso
        getItemsActividad(actividad_id)
            .then(items => setPalabras(transformarItems(items)))
            .catch(() => setErrorCarga('No se pudo cargar el vocabulario. Intenta de nuevo más tarde.'))
            .finally(() => setCargando(false));
    }, [actividad_id]);

    const terminarJuego = useCallback(async (victoria, puntajeFinal) => {
        cancelAnimationFrame(animRef.current);
        setJuegoTerminado(true);
        setGano(victoria);
        try { await guardarProgreso(actividad_id, puntajeFinal); } catch (err) { console.error('Error guardando progreso:', err); }
    }, [actividad_id]);

    const lanzarNuevaspalabras = useCallback(() => {
        if (!palabraActual) return;
        const nuevas = generarPalabrasCayendo(palabraActual, palabras);
        palabrasCayendoRef.current = nuevas;
        setPalabrasCayendo([...nuevas]);
    }, [palabraActual, palabras]);

    // Ref que siempre apunta a la versión más reciente de lanzarNuevaspalabras
    // (que a su vez está atada a palabraActual). El loop de animación de más
    // abajo programa un setTimeout que puede disparar varios cientos de ms
    // después de que la ronda ya cambió; si llamara directo a la función
    // cerrada en ese momento, seguiría generando palabras contra el objetivo
    // VIEJO (la palabra de la ronda anterior), aunque la pista en pantalla ya
    // muestre la nueva — eso es lo que causaba que capturas correctas se
    // marcaran como error de forma intermitente. Leer siempre por la ref
    // elimina esa condición de carrera.
    const lanzarNuevaspalabrasRef = useRef(lanzarNuevaspalabras);
    lanzarNuevaspalabrasRef.current = lanzarNuevaspalabras;

    // Solo lanza la primera oleada al iniciar la partida. Las siguientes
    // oleadas las dispara el propio loop de animación (más abajo) cuando
    // corresponde, para no competir con él.
    useEffect(() => {
        if (!juegoIniciado || juegoTerminado) return;
        lanzarNuevaspalabrasRef.current();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [juegoIniciado]);

    useEffect(() => {
        if (!juegoIniciado || juegoTerminado || conteo !== null) return;

        const loop = () => {
            const area = areaRef.current;
            if (!area) return;
            const anchoArea = area.clientWidth;
            let necesitaNuevas = false;

            palabrasCayendoRef.current = palabrasCayendoRef.current.map(p => {
                if (p.capturada || p.fallida) return p;
                const nuevaY = p.y + p.velocidad;

                const pxX = (p.x / 100) * anchoArea;
                const pxPersonaje = (personajeXRef.current / 100) * anchoArea;
                const colision =
                    nuevaY >= 78 &&
                    nuevaY <= 95 &&
                    Math.abs(pxX - pxPersonaje) < ANCHO_PERSONAJE;

                if (colision) {
                    if (p.esCorrecta) {
                        setPuntaje(prev => {
                            const nuevo = prev + 20;
                            setPuntajeActual({ valor: '+20', correcto: true });
                            setTimeout(() => setPuntajeActual(null), 800);
                            return nuevo;
                        });
                        setAciertos(prev => {
                            const nuevo = prev + 1;
                            if (nuevo >= META_ACIERTOS) {
                                setPuntaje(actual => {
                                    terminarJuego(true, actual + 20);
                                    return actual;
                                });
                            }
                            return nuevo;
                        });
                        setIndicePalabra(prev => prev + 1);
                        necesitaNuevas = true;
                    } else {
                        setPuntajeActual({ valor: '-10', correcto: false });
                        setTimeout(() => setPuntajeActual(null), 800);
                        setPuntaje(prev => Math.max(0, prev - 10));
                        setVidas(prev => {
                            const nuevo = prev - 1;
                            if (nuevo <= 0) {
                                setPuntaje(actual => {
                                    terminarJuego(false, actual);
                                    return actual;
                                });
                            }
                            return nuevo;
                        });
                        necesitaNuevas = true;
                    }
                    return { ...p, capturada: true };
                }

                if (nuevaY > 100) {
                    if (p.esCorrecta) {
                        setFeedback('¡Se escapó la correcta!');
                        setTimeout(() => setFeedback(null), 1000);
                        necesitaNuevas = true;
                    }
                    return { ...p, fallida: true };
                }

                return { ...p, y: nuevaY };
            });

            setPalabrasCayendo([...palabrasCayendoRef.current]);

            const todasTerminadas = palabrasCayendoRef.current.every(
                p => p.capturada || p.fallida
            );
            if (todasTerminadas || necesitaNuevas) {
                setTimeout(() => lanzarNuevaspalabrasRef.current(), 600);
            }

            animRef.current = requestAnimationFrame(loop);
        };

        animRef.current = requestAnimationFrame(loop);
        return () => cancelAnimationFrame(animRef.current);
    }, [juegoIniciado, juegoTerminado, lanzarNuevaspalabras, terminarJuego, conteo]);

    const moverPersonaje = useCallback((e) => {
        const area = areaRef.current;
        if (!area || juegoTerminado || conteo !== null) return;
        const rect = area.getBoundingClientRect();
        const clientX = e.touches ? e.touches[0].clientX : e.clientX;
        const porcentaje = ((clientX - rect.left) / rect.width) * 100;
        const clampedX = Math.max(5, Math.min(95, porcentaje));
        personajeXRef.current = clampedX;

        if (personajeRef.current) {
            personajeRef.current.style.left = `${clampedX}%`;
        }
    }, [juegoTerminado, conteo]);

    const reiniciar = () => {
        setPalabrasCayendo([]);
        palabrasCayendoRef.current = [];
        personajeXRef.current = 50;
        setAciertos(0);
        setVidas(3);
        setPuntaje(0);
        setIndicePalabra(0);
        setJuegoTerminado(false);
        setGano(false);
        setFeedback(null);
        setPuntajeActual(null);
        setJuegoIniciado(false);
    };

    const fondoPagina = { background: 'linear-gradient(180deg, var(--bg-from) 0%, var(--bg-to) 100%)', fontFamily: "'Nunito', sans-serif" };

    if (cargando) {
        return (
            <div className="min-h-screen flex items-center justify-center" style={fondoPagina}>
                <p style={{ fontSize: '18px', color: 'var(--terracota)', fontWeight: 700 }}>Cargando vocabulario…</p>
            </div>
        );
    }

    if (errorCarga || !palabraActual) {
        return (
            <div className="min-h-screen flex items-center justify-center" style={fondoPagina}>
                <div className="text-center mx-4" style={{ maxWidth: '440px', width: '100%', borderRadius: '30px', padding: '36px', background: 'var(--card-bg)', border: '2px solid var(--terracota)', boxShadow: '0 18px 40px rgba(var(--terracota-rgb),0.18)' }}>
                    <p className="mb-5" style={{ color: 'var(--terracota)', fontWeight: 700, fontSize: '16px' }}>{errorCarga || 'No hay vocabulario disponible para esta actividad.'}</p>
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
                <div className="text-center" style={{ maxWidth: '480px', width: '100%', borderRadius: '30px', padding: '46px', background: 'var(--card-bg)', border: '2px solid var(--terracota)', boxShadow: '0 18px 40px rgba(var(--terracota-rgb),0.18)' }}>
                    <span style={{ fontSize: '46px' }}>⚡</span>
                    <h1 style={{ margin: '12px 0 8px', fontFamily: "'Baloo 2', sans-serif", fontWeight: 800, fontSize: '30px', color: 'var(--heading)' }}>
                        Atrapa la Palabra
                    </h1>
                    <p style={{ margin: '0 0 20px', fontSize: '15px', color: 'var(--body-muted)' }}>
                        Mueve al explorador y atrapa la palabra correcta en Nggigua
                    </p>

                    <img src={exploradorCanasta} alt="explorador" className="mx-auto mb-5 object-contain" style={{ width: '135px', height: '135px' }} />

                    <div className="text-left mb-5" style={{ borderRadius: '20px', padding: '20px', background: 'rgba(var(--terracota-rgb),0.08)', border: '1px solid rgba(var(--terracota-rgb),0.2)' }}>
                        <p style={{ margin: '0 0 7px', fontSize: '15px', fontWeight: 800, color: 'var(--terracota)' }}>📜 Cómo jugar:</p>
                        <p style={{ margin: '0 0 5px', fontSize: '14px', color: 'var(--tinted-text)' }}>• Mueve el cursor o tu dedo para mover al explorador.</p>
                        <p style={{ margin: '0 0 5px', fontSize: '14px', color: 'var(--tinted-text)' }}>• Atrapa la palabra en Nggigua que corresponde a la pista.</p>
                        <p style={{ margin: '0 0 5px', fontSize: '14px', color: 'var(--tinted-text)' }}>• Evita las palabras incorrectas — cuestan una vida.</p>
                        <p style={{ margin: 0, fontSize: '14px', color: 'var(--tinted-text)' }}>• Atrapa {META_ACIERTOS} palabras correctas para ganar.</p>
                    </div>

                    <button
                        onClick={() => {
                            setJuegoIniciado(true);
                            setConteo(3);
                            let c = 3;
                            const intervalo = setInterval(() => {
                                c -= 1;
                                if (c <= 0) {
                                    clearInterval(intervalo);
                                    setConteo(null);
                                } else {
                                    setConteo(c);
                                }
                            }, 1000);
                        }}
                        className="w-full"
                        style={{ padding: '18px', border: 'none', borderRadius: '20px', fontFamily: "'Baloo 2', sans-serif", fontWeight: 800, fontSize: '19px', color: 'white', cursor: 'pointer', background: 'linear-gradient(135deg, var(--terracota), var(--gold))' }}>
                        ¡Comenzar! ⚡
                    </button>

                    <button onClick={() => navigate('/dashboard')} className="w-full mt-3" style={{ padding: '10px', border: 'none', background: 'none', fontSize: '15px', color: 'var(--body-muted)', cursor: 'pointer' }}>
                        ← Volver al mapa
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex flex-col select-none" style={fondoPagina}>
            <AyudaFlotante juego="atrapa_palabra" />

            {/* HEADER */}
            <div className="flex justify-between items-center flex-wrap gap-3 flex-shrink-0" style={{ padding: '14px 26px', background: 'rgba(var(--card-bg-rgb),0.75)', borderBottom: '1px solid rgba(var(--terracota-rgb),0.2)' }}>
                <button onClick={() => navigate('/dashboard')} style={{ fontSize: '14px', padding: '8px 14px', borderRadius: '14px', border: 'none', background: 'rgba(var(--heading-rgb),0.08)', color: 'var(--heading)', fontWeight: 700, cursor: 'pointer' }}>
                    ← Mapa
                </button>

                <div className="flex flex-col items-center">
                    <h1 style={{ margin: 0, fontFamily: "'Baloo 2', sans-serif", fontWeight: 800, fontSize: '17px', color: 'var(--heading)' }}>⚡ Atrapa la Palabra</h1>
                    <div className="flex gap-0.5 mt-1">
                        {Array.from({ length: 3 }).map((_, i) => (
                            <span key={i} style={{ fontSize: '1.1rem', opacity: i < (3 - vidas) ? 0.2 : 1 }}>❤️</span>
                        ))}
                    </div>
                </div>

                <div className="flex gap-2.5">
                    <div className="text-center" style={{ borderRadius: '14px', padding: '5px 12px', background: 'rgba(var(--terracota-rgb),0.12)', border: '1px solid rgba(var(--terracota-rgb),0.3)' }}>
                        <p style={{ margin: 0, fontSize: '12px', color: 'var(--body-muted)' }}>Pts</p>
                        <p style={{ margin: 0, fontWeight: 800, fontSize: '16px', color: 'var(--terracota)' }}>{puntaje}</p>
                    </div>
                    <div className="text-center" style={{ borderRadius: '14px', padding: '5px 12px', background: 'rgba(var(--success-light-rgb),0.14)', border: '1px solid rgba(var(--success-light-rgb),0.35)' }}>
                        <p style={{ margin: 0, fontSize: '12px', color: 'var(--body-muted)' }}>Meta</p>
                        <p style={{ margin: 0, fontWeight: 800, fontSize: '16px', color: 'var(--success-dark)' }}>{aciertos}/{META_ACIERTOS}</p>
                    </div>
                </div>
            </div>

            {/* PISTA */}
            <div className="flex flex-col items-center justify-center gap-1 flex-shrink-0" style={{ padding: '20px', background: 'rgba(var(--terracota-rgb),0.06)', borderBottom: '2px solid rgba(var(--terracota-rgb),0.2)' }}>
                <p style={{ margin: 0, fontSize: '15px', fontWeight: 700, color: 'var(--body-muted)' }}>
                    Atrapa la palabra en Nggigua para:
                </p>
                <div className="flex items-center gap-3">
                    <span style={{ fontSize: '48px' }}>{palabraActual.emoji}</span>
                    <p style={{ margin: 0, fontSize: '48px', fontWeight: 800, color: 'var(--terracota)' }}>{palabraActual.traduccion}</p>
                </div>
            </div>

            {/* ÁREA DE JUEGO */}
            <div
                ref={areaRef}
                className="relative flex-1 overflow-hidden cursor-none"
                onMouseMove={moverPersonaje}
                onTouchMove={(e) => { e.preventDefault(); moverPersonaje(e); }}
                style={{ touchAction: 'none', minHeight: '360px', background: 'linear-gradient(180deg, var(--bg-from), var(--bg-to))' }}>

                <AnimatePresence>
                    {conteo !== null && (
                        <motion.div
                            key={conteo}
                            initial={{ scale: 0.5, opacity: 0 }}
                            animate={{ scale: 1.2, opacity: 1 }}
                            exit={{ scale: 2, opacity: 0 }}
                            transition={{ duration: 0.5 }}
                            className="absolute inset-0 flex items-center justify-center z-30 pointer-events-none"
                            style={{ background: 'rgba(var(--overlay-rgb),0.5)' }}>
                            <span style={{ fontSize: '11rem', fontWeight: 800, color: 'var(--gold)', textShadow: '0 0 40px rgba(var(--terracota-rgb),0.6)' }}>
                                {conteo}
                            </span>
                        </motion.div>
                    )}
                </AnimatePresence>

                <AnimatePresence>
                    {puntajeActual && (
                        <motion.div
                            initial={{ opacity: 1, y: 0, scale: 0.8 }}
                            animate={{ opacity: 0, y: -60, scale: 1.3 }}
                            transition={{ duration: 0.8 }}
                            className="absolute pointer-events-none z-20"
                            style={{
                                left: '50%', bottom: '20%', transform: 'translateX(-50%)',
                                fontSize: '2.2rem', fontWeight: 'bold',
                                color: puntajeActual.correcto ? 'var(--success-dark)' : 'var(--error)',
                                textShadow: '0 0 10px rgba(255,255,255,0.8)',
                            }}>
                            {puntajeActual.valor}
                        </motion.div>
                    )}
                </AnimatePresence>

                <AnimatePresence>
                    {feedback && (
                        <motion.p
                            initial={{ opacity: 1, y: 0 }}
                            animate={{ opacity: 0, y: -30 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 1 }}
                            className="absolute top-4 left-1/2 -translate-x-1/2 z-20"
                            style={{ fontSize: '15px', fontWeight: 800, color: 'var(--terracota)' }}>
                            {feedback}
                        </motion.p>
                    )}
                </AnimatePresence>

                {palabrasCayendo.map(p => (
                    !p.capturada && !p.fallida && (
                        <div key={p.id}
                            className="absolute pointer-events-none"
                            style={{
                                left: `${p.x}%`, top: `${p.y}%`, transform: 'translateX(-50%)',
                                background: 'var(--card-bg)', border: '2px solid rgba(var(--gold-rgb),0.6)',
                                color: 'var(--heading)', zIndex: 10, fontSize: '23px', fontWeight: 800,
                                padding: '9px 20px', borderRadius: '16px',
                                boxShadow: '0 4px 10px rgba(var(--shadow-rgb),0.12)',
                            }}>
                            {p.texto}
                        </div>
                    )
                ))}

                <img
                    ref={personajeRef}
                    src={exploradorCanasta}
                    alt="explorador"
                    className="absolute pointer-events-none"
                    style={{
                        width: '160px', bottom: '6%', left: '50%', transform: 'translateX(-50%)',
                        zIndex: 15, filter: 'drop-shadow(0 8px 12px rgba(0,0,0,0.2))',
                    }} />

                <div className="absolute bottom-0 left-0 right-0" style={{ height: '4px', background: 'linear-gradient(to right, transparent, var(--terracota), transparent)', opacity: 0.4 }} />
            </div>

            {/* MODAL RESULTADO */}
            <AnimatePresence>
                {juegoTerminado && (
                    <motion.div
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                        className="fixed inset-0 flex items-center justify-center"
                        style={{ background: 'rgba(var(--overlay-rgb),0.55)', backdropFilter: 'blur(3px)', zIndex: 60 }}>
                        <motion.div
                            initial={{ scale: 0.7, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ type: 'spring', bounce: 0.4 }}
                            className="text-center mx-4"
                            style={{ maxWidth: '410px', width: '100%', borderRadius: '30px', padding: '46px', background: 'var(--card-bg)', border: `2px solid ${gano ? 'var(--gold)' : 'var(--terracota)'}`, boxShadow: '0 20px 60px rgba(var(--terracota-rgb),0.3)' }}>
                            <img src={exploradorCanasta} alt="resultado" className="mx-auto mb-3 object-contain" style={{ width: '125px', height: '125px' }} />
                            <h2 style={{ margin: '0 0 3px', fontFamily: "'Baloo 2', sans-serif", fontWeight: 800, fontSize: '30px', color: 'var(--heading)' }}>
                                {gano ? '¡Excelente!' : '¡Sin vidas!'}
                            </h2>
                            <p style={{ margin: '0 0 18px', fontSize: '15px', color: 'var(--body-muted)' }}>
                                {gano ? `¡Atrapaste ${META_ACIERTOS} palabras!` : `Atrapaste ${aciertos} palabras`}
                            </p>
                            <div style={{ borderRadius: '20px', padding: '18px', background: 'rgba(var(--gold-rgb),0.16)', border: '1px solid rgba(var(--gold-rgb),0.4)' }}>
                                <p style={{ margin: 0, fontSize: '38px', fontWeight: 800, color: 'var(--terracota)' }}>{puntaje} pts</p>
                            </div>
                            <div className="flex flex-col gap-3 mt-5">
                                <button onClick={reiniciar} style={{ padding: '15px', border: 'none', borderRadius: '18px', fontWeight: 800, fontSize: '16px', color: 'white', cursor: 'pointer', background: 'linear-gradient(135deg, var(--terracota), var(--gold))' }}>
                                    🔄 Jugar de nuevo
                                </button>
                                <button onClick={() => navigate('/dashboard')} style={{ padding: '15px', border: '1px solid rgba(var(--locked-rgb),0.25)', borderRadius: '18px', fontWeight: 800, fontSize: '16px', color: 'var(--heading)', cursor: 'pointer', background: 'none' }}>
                                    🗺️ Volver al mapa
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
