import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { guardarProgreso } from '../services/progresoService';
import { getItemsActividad } from '../services/leccionService';
import { transformarItems } from '../utils/transformarItems';
import AyudaFlotante from '../components/AyudaFlotante';

import horca from '../assets/ahorcado/horca.jpg';
import exploFeliz from '../assets/ahorcado/explorador-feliz.png';
import exploAsustado from '../assets/ahorcado/explorador-asustado.png';
import exploMuyAsustado from '../assets/ahorcado/explorador-muy-asustado.png';
import exploroDesesperado from '../assets/ahorcado/explorador-desesperado.png';
import exploroDesmayado from '../assets/ahorcado/explorador-desmayado.png';
import exploroCelebrando from '../assets/ahorcado/explorador-celebrando.png';

const MAX_ERRORES = 6;
const META_PALABRAS = 5;

const ESTADOS = [
    { imagen: exploFeliz,          mensaje: '¡Puedes hacerlo!',        colorVar: '--success-dark' },
    { imagen: exploAsustado,       mensaje: '¡Ten cuidado!',           colorVar: '--terracota' },
    { imagen: exploAsustado,       mensaje: '¡Piensa bien!',           colorVar: '--terracota' },
    { imagen: exploMuyAsustado,    mensaje: '¡Estás en peligro!',      colorVar: '--error' },
    { imagen: exploroDesesperado,  mensaje: '¡No te rindas!',          colorVar: '--error' },
    { imagen: exploroDesmayado,    mensaje: '¡Última oportunidad!',    colorVar: '--error' },
    { imagen: exploroDesmayado,    mensaje: '¡Se acabó!',              colorVar: '--error' },
];

const TECLADO = [
    ['q','w','e','r','t','y','u','i','o','p'],
    ['a','s','d','f','g','h','j','k','l','ñ'],
    ['z','x','c','v','b','n','m'],
];

const NOMBRE_NIVEL = ['Nivel 1 — Básico', 'Nivel 2 — Intermedio', 'Nivel 3 — Avanzado'];

export default function Ahorcado() {
    const navigate = useNavigate();
    const location = useLocation();
    const actividad_id = location.state?.actividad_id;
    const nivelIndex = location.state?.nivelIndex ?? 0;

    const [juegoIniciado, setJuegoIniciado] = useState(false);
    const [palabras, setPalabras] = useState([]);
    const [cargando, setCargando] = useState(() => !!actividad_id);
    const [errorCarga, setErrorCarga] = useState(() =>
        actividad_id ? null : 'No se especificó la actividad. Vuelve al mapa e intenta de nuevo.'
    );

    const [palabraObj, setPalabraObj] = useState(null);
    const [letrasUsadas, setLetrasUsadas] = useState([]);
    const [errores, setErrores] = useState(0);
    const [juegoTerminado, setJuegoTerminado] = useState(false);
    const [gano, setGano] = useState(false);
    const [puntaje, setPuntaje] = useState(0);
    const [palabrasCompletadas, setPalabrasCompletadas] = useState(0);
    const [shake, setShake] = useState(false);
    const [pantallaRoja, setPantallaRoja] = useState(false);

    useEffect(() => {
        if (!actividad_id) return; // el estado inicial ya cubrió este caso
        getItemsActividad(actividad_id)
            .then(items => {
                const lista = transformarItems(items);
                setPalabras(lista);
                if (lista.length > 0) {
                    setPalabraObj(lista[Math.floor(Math.random() * lista.length)]);
                }
            })
            .catch(() => setErrorCarga('No se pudo cargar el vocabulario. Intenta de nuevo más tarde.'))
            .finally(() => setCargando(false));
    }, [actividad_id]);

    const metaPalabras = palabras.length > 0 ? Math.min(META_PALABRAS, palabras.length) : META_PALABRAS;
    const palabra = palabraObj ? palabraObj.palabra.toLowerCase() : '';
    const palabraCompleta = palabraObj && palabra.split('').every(l => letrasUsadas.includes(l));
    const perdio = errores >= MAX_ERRORES;
    const estadoActual = ESTADOS[errores];

    const elegirSiguientePalabra = () => palabras[Math.floor(Math.random() * palabras.length)];

    useEffect(() => {
        if (!palabraObj) return;
        if (palabraCompleta && !juegoTerminado && letrasUsadas.length > 0) {
            const bonus = (MAX_ERRORES - errores) * 10;
            const puntosPalabra = 20 + bonus;
            const nuevoPuntaje = puntaje + puntosPalabra;
            setPuntaje(nuevoPuntaje);
            const completadas = palabrasCompletadas + 1;
            setPalabrasCompletadas(completadas);
            if (completadas >= metaPalabras) {
                setTimeout(async () => {
                    try { await guardarProgreso(actividad_id, nuevoPuntaje); } catch (err) { console.error('Error guardando progreso:', err); }
                    setGano(true);
                    setJuegoTerminado(true);
                }, 800);
            } else {
                setTimeout(() => {
                    setPalabraObj(elegirSiguientePalabra());
                    setLetrasUsadas([]);
                    setErrores(0);
                }, 1200);
            }
        }
        if (perdio && !juegoTerminado) {
            setPantallaRoja(true);
            setTimeout(() => setPantallaRoja(false), 600);
            setTimeout(async () => {
                try { await guardarProgreso(actividad_id, puntaje); } catch (err) { console.error('Error guardando progreso:', err); }
                setGano(false);
                setJuegoTerminado(true);
            }, 900);
        }
    }, [letrasUsadas]);

    const presionarLetra = (letra) => {
        if (letrasUsadas.includes(letra) || juegoTerminado) return;
        setLetrasUsadas(prev => [...prev, letra]);
        if (!palabra.includes(letra)) {
            setErrores(prev => prev + 1);
            setShake(true);
            setTimeout(() => setShake(false), 500);
        }
    };

    const reiniciar = () => {
        setPalabraObj(elegirSiguientePalabra());
        setLetrasUsadas([]);
        setErrores(0);
        setJuegoTerminado(false);
        setGano(false);
        setPuntaje(0);
        setPalabrasCompletadas(0);
        setShake(false);
        setPantallaRoja(false);
    };

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

    if (errorCarga || !palabraObj) {
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
                <div style={{ maxWidth: '560px', width: '100%', borderRadius: '30px', padding: '46px', background: 'var(--card-bg)', border: '2px solid var(--terracota)', boxShadow: '0 18px 40px rgba(var(--terracota-rgb),0.18)' }}>
                    <div className="text-center mb-6">
                        <div style={{ fontSize: '52px', marginBottom: '10px' }}>🔤</div>
                        <h1 style={{ margin: 0, fontFamily: "'Baloo 2', sans-serif", fontWeight: 800, fontSize: '30px', color: 'var(--heading)' }}>
                            Ahorcado Nggigua
                        </h1>
                        <p style={{ margin: '8px 0 0', fontSize: '15px', color: 'var(--body-muted)' }}>
                            Adivina la palabra en Nggigua letra por letra
                        </p>
                    </div>

                    <button onClick={() => setJuegoIniciado(true)} className="w-full flex justify-between items-center text-left mb-5"
                        style={{ padding: '18px 22px', border: 'none', borderRadius: '18px', fontWeight: 800, fontSize: '16px', color: 'white', cursor: 'pointer', background: gradienteNivel }}>
                        <span>▶ {NOMBRE_NIVEL[nivelIndex]}</span>
                        <span style={{ fontSize: '14px', opacity: 0.85 }}>{palabras.length} palabras</span>
                    </button>

                    <div style={{ borderRadius: '20px', padding: '20px', background: 'rgba(var(--terracota-rgb),0.08)', border: '1px solid rgba(var(--terracota-rgb),0.2)' }}>
                        <h2 style={{ margin: '0 0 10px', fontSize: '15px', fontWeight: 800, color: 'var(--terracota)' }}>📜 ¿Cómo jugar?</h2>
                        <p style={{ margin: '0 0 7px', fontSize: '14px', color: 'var(--tinted-text)' }}>• Verás una pista en español y un emoji — adivina la palabra en Nggigua.</p>
                        <p style={{ margin: '0 0 7px', fontSize: '14px', color: 'var(--tinted-text)' }}>• Tienes {MAX_ERRORES} vidas: cada letra incorrecta te quita una.</p>
                        <p style={{ margin: '0 0 7px', fontSize: '14px', color: 'var(--tinted-text)' }}>• Entre menos errores, más puntos ganas por palabra.</p>
                        <p style={{ margin: 0, fontSize: '14px', color: 'var(--tinted-text)' }}>• Completa {metaPalabras} palabras para terminar el nivel.</p>
                    </div>

                    <button onClick={() => navigate('/dashboard')} className="w-full mt-5" style={{ padding: '10px', border: 'none', background: 'none', fontSize: '15px', color: 'var(--body-muted)', cursor: 'pointer' }}>
                        ← Volver al mapa
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex flex-col relative" style={fondoPagina}>
            <AyudaFlotante juego="ahorcado" />

            {/* Flash de error */}
            <AnimatePresence>
                {pantallaRoja && (
                    <motion.div
                        initial={{ opacity: 0 }} animate={{ opacity: 0.3 }} exit={{ opacity: 0 }}
                        className="fixed inset-0 pointer-events-none"
                        style={{ background: 'var(--error)', zIndex: 100 }} />
                )}
            </AnimatePresence>

            {/* HEADER */}
            <div className="flex justify-between items-center flex-wrap gap-3" style={{ padding: '16px 28px', background: 'rgba(var(--card-bg-rgb),0.75)', borderBottom: '1px solid rgba(var(--terracota-rgb),0.2)' }}>
                <button onClick={() => navigate('/dashboard')} style={{ fontSize: '14px', padding: '9px 16px', borderRadius: '14px', border: 'none', background: 'rgba(var(--heading-rgb),0.08)', color: 'var(--heading)', fontWeight: 700, cursor: 'pointer' }}>
                    ← Mapa
                </button>

                <div className="flex flex-col items-center">
                    <h1 style={{ margin: 0, fontFamily: "'Baloo 2', sans-serif", fontWeight: 800, fontSize: '18px', color: 'var(--heading)' }}>🔤 Ahorcado Nggigua</h1>
                    <div className="flex gap-0.5 mt-1">
                        {Array.from({ length: MAX_ERRORES }).map((_, i) => (
                            <motion.span key={i}
                                animate={i === errores - 1 ? { scale: [1.4, 1] } : {}}
                                transition={{ duration: 0.3 }}
                                style={{ fontSize: '1.25rem', opacity: i < errores ? 0.25 : 1 }}>
                                ❤️
                            </motion.span>
                        ))}
                    </div>
                </div>

                <div className="flex gap-2.5">
                    <div className="text-center" style={{ borderRadius: '14px', padding: '5px 14px', background: 'rgba(var(--terracota-rgb),0.12)', border: '1px solid rgba(var(--terracota-rgb),0.3)' }}>
                        <p style={{ margin: 0, fontSize: '12px', color: 'var(--body-muted)' }}>Pts</p>
                        <p style={{ margin: 0, fontWeight: 800, fontSize: '17px', color: 'var(--terracota)' }}>{puntaje}</p>
                    </div>
                    <div className="text-center" style={{ borderRadius: '14px', padding: '5px 14px', background: 'rgba(var(--success-light-rgb),0.14)', border: '1px solid rgba(var(--success-light-rgb),0.35)' }}>
                        <p style={{ margin: 0, fontSize: '12px', color: 'var(--body-muted)' }}>Palabras</p>
                        <p style={{ margin: 0, fontWeight: 800, fontSize: '17px', color: 'var(--success-dark)' }}>{palabrasCompletadas}/{metaPalabras}</p>
                    </div>
                </div>
            </div>

            {/* CONTENIDO PRINCIPAL */}
            <div className="flex flex-wrap flex-1">

                {/* PANEL IZQUIERDO — Pista + Guiones */}
                <div className="flex flex-col items-center justify-center gap-6" style={{ flex: '1 1 360px', padding: '36px' }}>

                    <motion.div
                        key={palabraObj.palabra}
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex flex-col items-center gap-2 w-full"
                        style={{ borderRadius: '26px', padding: '28px', maxWidth: '340px', background: 'rgba(var(--terracota-rgb),0.08)', border: '1px solid rgba(var(--terracota-rgb),0.25)' }}>
                        <span style={{ fontSize: '64px' }}>{palabraObj.emoji}</span>
                        <p style={{ margin: 0, fontSize: '16px', fontWeight: 700, color: 'var(--body-muted)' }}>En español:</p>
                        <p style={{ margin: 0, fontSize: '30px', fontWeight: 800, color: 'var(--heading)' }}>{palabraObj.traduccion}</p>
                        <p style={{ margin: 0, fontSize: '14px', color: 'var(--locked)' }}>{palabra.length} letras en Nggigua</p>
                    </motion.div>

                    <div className="flex gap-3 justify-center flex-wrap" style={{ maxWidth: '340px' }}>
                        {palabra.split('').map((letra, i) => {
                            const revelada = letrasUsadas.includes(letra);
                            return (
                                <motion.div key={i}
                                    animate={revelada ? { scale: [1.4, 1] } : {}}
                                    transition={{ duration: 0.3 }}
                                    className="flex flex-col items-center">
                                    <span style={{ fontSize: '26px', fontWeight: 800, width: '30px', textAlign: 'center', color: revelada ? 'var(--heading)' : 'transparent' }}>
                                        {revelada ? letra : '·'}
                                    </span>
                                    <div style={{ width: '30px', height: '3px', marginTop: '5px', borderRadius: '2px', background: revelada ? 'var(--terracota)' : 'rgba(var(--locked-rgb),0.3)' }} />
                                </motion.div>
                            );
                        })}
                    </div>

                    {letrasUsadas.filter(l => !palabra.includes(l)).length > 0 && (
                        <div className="text-center">
                            <p style={{ margin: '0 0 7px', fontSize: '13px', color: 'var(--locked)' }}>Letras incorrectas:</p>
                            <div className="flex gap-2 justify-center flex-wrap" style={{ maxWidth: '340px' }}>
                                {letrasUsadas.filter(l => !palabra.includes(l)).map(l => (
                                    <motion.span key={l}
                                        initial={{ scale: 0, opacity: 0 }}
                                        animate={{ scale: 1, opacity: 1 }}
                                        style={{ padding: '4px 11px', borderRadius: '9px', fontSize: '15px', fontWeight: 800, background: 'rgba(var(--error-rgb),0.14)', color: 'var(--error)', border: '1px solid rgba(var(--error-rgb),0.3)' }}>
                                        {l.toUpperCase()}
                                    </motion.span>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* PANEL DERECHO — Horca + Personaje */}
                <div className="flex flex-col items-center justify-center relative" style={{ flex: '1 1 360px', padding: '28px' }}>
                    <div className="relative flex items-end justify-center" style={{ width: '320px', height: '340px' }}>
                        <img src={horca} alt="horca" className="absolute bottom-0 left-0 w-full h-full object-contain" style={{ opacity: 0.9 }} />
                        <motion.img
                            key={`personaje-${errores}`}
                            src={estadoActual.imagen}
                            alt="explorador"
                            initial={{ opacity: 0, scale: 0.85 }}
                            animate={shake
                                ? { opacity: 1, scale: 1, x: [-6, 6, -6, 6, 0] }
                                : { opacity: 1, scale: 1, x: 0 }
                            }
                            transition={{ duration: 0.35 }}
                            className="relative z-10 object-contain"
                            style={{ height: '220px' }} />
                    </div>

                    <motion.p
                        key={`msg-${errores}`}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        style={{ marginTop: '12px', fontSize: '15px', fontWeight: 800, color: `var(${estadoActual.colorVar})` }}>
                        {estadoActual.mensaje}
                    </motion.p>
                </div>
            </div>

            {/* TECLADO */}
            <div className="flex flex-col items-center gap-2" style={{ padding: '20px 8px', background: 'rgba(var(--card-bg-rgb),0.7)', borderTop: '1px solid rgba(var(--terracota-rgb),0.15)' }}>
                {TECLADO.map((fila, fi) => (
                    <div key={fi} className="flex gap-2 flex-wrap justify-center">
                        {fila.map(letra => {
                            const usada = letrasUsadas.includes(letra);
                            const correcta = usada && palabra.includes(letra);
                            const incorrecta = usada && !palabra.includes(letra);
                            return (
                                <motion.button key={letra}
                                    whileTap={{ scale: 0.82 }}
                                    onClick={() => presionarLetra(letra)}
                                    disabled={usada || juegoTerminado}
                                    className="disabled:cursor-not-allowed"
                                    style={{
                                        width: '44px', height: '46px', borderRadius: '12px', fontWeight: 800, fontSize: '16px',
                                        background: correcta
                                            ? 'linear-gradient(135deg, var(--success-dark), var(--success-light))'
                                            : incorrecta
                                                ? 'rgba(var(--error-rgb),0.16)'
                                                : 'rgba(var(--locked-rgb),0.1)',
                                        color: correcta ? 'white' : incorrecta ? 'var(--error)' : 'var(--heading)',
                                        border: correcta
                                            ? 'none'
                                            : incorrecta
                                                ? '1px solid rgba(var(--error-rgb),0.35)'
                                                : '1px solid rgba(var(--locked-rgb),0.2)',
                                        opacity: usada ? 0.5 : 1,
                                    }}>
                                    {letra.toUpperCase()}
                                </motion.button>
                            );
                        })}
                    </div>
                ))}
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
                            <motion.img
                                src={gano ? exploroCelebrando : exploroDesmayado}
                                alt="resultado"
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ type: 'spring', bounce: 0.5, delay: 0.1 }}
                                className="mx-auto mb-3 object-contain"
                                style={{ width: '150px', height: '150px' }} />
                            <h2 style={{ margin: '0 0 3px', fontFamily: "'Baloo 2', sans-serif", fontWeight: 800, fontSize: '30px', color: 'var(--heading)' }}>
                                {gano ? '¡Lo lograste!' : '¡Se acabó!'}
                            </h2>
                            <p style={{ margin: '0 0 18px', fontSize: '15px', color: 'var(--body-muted)' }}>
                                {gano ? `${metaPalabras} palabras completadas` : `La palabra era: ${palabraObj.palabra}`}
                            </p>
                            <div style={{ borderRadius: '20px', padding: '18px', background: 'rgba(var(--gold-rgb),0.16)', border: '1px solid rgba(var(--gold-rgb),0.4)' }}>
                                <p style={{ margin: 0, fontSize: '38px', fontWeight: 800, color: 'var(--terracota)' }}>{puntaje} pts</p>
                                <p style={{ margin: '3px 0 0', fontSize: '14px', color: 'var(--body-muted)' }}>{palabrasCompletadas}/{metaPalabras} palabras</p>
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
