import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { guardarProgreso } from '../services/progresoService';
import { getItemsActividad } from '../services/leccionService';
import { transformarItems } from '../utils/transformarItems';
import AyudaFlotante from '../components/AyudaFlotante';

const WHEEL_COLORS = {
    animal: '#52B788',
    naturaleza: '#2D6A4F',
    hogar: '#C4622D',
    cuerpo: '#8B4A8B',
    persona: '#4A90D9',
};

const CATEGORIA_LABEL = {
    animal: 'Animales',
    naturaleza: 'Naturaleza',
    hogar: 'Hogar',
    cuerpo: 'Cuerpo',
    persona: 'Personas',
};

const CATEGORIA_EMOJI = {
    animal: '🐾', naturaleza: '🌿', hogar: '🏠', cuerpo: '✋', persona: '👤',
};

const ORDEN_CATEGORIAS_RUEDA = ['animal', 'naturaleza', 'hogar', 'cuerpo', 'persona'];

const NOMBRE_NIVEL = ['Nivel 1 — Básico', 'Nivel 2 — Intermedio', 'Nivel 3 — Avanzado'];
const RONDAS_POR_NIVEL = [
    ['animal', 'hogar'],
    ['animal', 'naturaleza', 'hogar'],
    ['animal', 'naturaleza', 'hogar', 'cuerpo', 'persona'],
];

function mezclar(arr) {
    return [...arr].sort(() => Math.random() - 0.5);
}

function calcularEstrellas(errores) {
    if (errores <= 1) return 3;
    if (errores <= 3) return 2;
    return 1;
}

function generarTarjetasRonda(categoria, poolPalabras) {
    const correctas = mezclar(poolPalabras.filter(p => p.categoria === categoria));
    const incorrectas = mezclar(poolPalabras.filter(p => p.categoria !== categoria));
    const totalDeseado = Math.min(6, poolPalabras.length);
    const nCorrectas = Math.min(correctas.length, Math.ceil(totalDeseado / 2));
    const nIncorrectas = Math.min(incorrectas.length, totalDeseado - nCorrectas);
    const tarjetas = [
        ...correctas.slice(0, nCorrectas).map(p => ({ ...p, correcta: true })),
        ...incorrectas.slice(0, nIncorrectas).map(p => ({ ...p, correcta: false })),
    ];
    return mezclar(tarjetas);
}

function calcularAnguloDestino(categoria, anguloActual) {
    const index = ORDEN_CATEGORIAS_RUEDA.indexOf(categoria);
    const centro = index * 72 + 36;
    const vueltasActuales = Math.floor(anguloActual / 360);
    const vueltasExtra = 5;
    return (vueltasActuales + vueltasExtra) * 360 + (360 - centro);
}

function RuletaCategorias() {
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
    const [rondaActual, setRondaActual] = useState(0);
    const [categoriaRonda, setCategoriaRonda] = useState(null);
    const [tarjetasRonda, setTarjetasRonda] = useState([]);
    const [seleccionadas, setSeleccionadas] = useState([]);
    const [confirmado, setConfirmado] = useState(false);
    const [ruletaGirando, setRuletaGirando] = useState(false);
    const [anguloRuleta, setAnguloRuleta] = useState(0);
    const [puntaje, setPuntaje] = useState(0);
    const [combo, setCombo] = useState(0);
    const [errores, setErrores] = useState(0);
    const [intentos, setIntentos] = useState(0);
    const [juegoTerminado, setJuegoTerminado] = useState(false);

    const rondas = RONDAS_POR_NIVEL[nivelIndex] || RONDAS_POR_NIVEL[0];

    useEffect(() => {
        if (!actividad_id) return; // el estado inicial ya cubrió este caso
        getItemsActividad(actividad_id)
            .then(items => setPalabras(transformarItems(items)))
            .catch(() => setErrorCarga('No se pudo cargar el vocabulario. Intenta de nuevo más tarde.'))
            .finally(() => setCargando(false));
    }, [actividad_id]);

    const iniciarRonda = (rondaIdx, poolPalabras) => {
        const categoria = rondas[rondaIdx];
        setCategoriaRonda(categoria);
        setRuletaGirando(true);
        setTarjetasRonda([]);
        setSeleccionadas([]);
        setConfirmado(false);
        setAnguloRuleta(prev => calcularAnguloDestino(categoria, prev));
        setTimeout(() => {
            setRuletaGirando(false);
            setTarjetasRonda(generarTarjetasRonda(categoria, poolPalabras));
        }, 1800);
    };

    const iniciarJuego = () => {
        setRondaActual(0);
        setPuntaje(0);
        setCombo(0);
        setErrores(0);
        setIntentos(0);
        setJuegoTerminado(false);
        setAnguloRuleta(0);
        setJuegoIniciado(true);
        iniciarRonda(0, palabras);
    };

    const toggleSeleccion = (id) => {
        if (confirmado) return;
        setSeleccionadas(prev =>
            prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
        );
    };

    const confirmarRonda = () => {
        if (confirmado) return;
        setConfirmado(true);
        setIntentos(prev => prev + 1);

        let puntosRonda = 0;
        let comboLocal = combo;
        let erroresRonda = 0;

        tarjetasRonda.forEach(t => {
            const marcada = seleccionadas.includes(t.id);
            if (t.correcta && marcada) {
                comboLocal += 1;
                puntosRonda += 20 + (comboLocal - 1) * 2;
            } else if (!t.correcta && marcada) {
                puntosRonda -= 5;
                erroresRonda += 1;
                comboLocal = 0;
            } else if (t.correcta && !marcada) {
                puntosRonda -= 5;
                erroresRonda += 1;
                comboLocal = 0;
            }
        });

        const nuevoPuntaje = Math.max(0, puntaje + puntosRonda);
        setPuntaje(nuevoPuntaje);
        setCombo(comboLocal);
        setErrores(prev => prev + erroresRonda);

        setTimeout(async () => {
            const siguienteRonda = rondaActual + 1;
            if (siguienteRonda < rondas.length) {
                setRondaActual(siguienteRonda);
                iniciarRonda(siguienteRonda, palabras);
            } else {
                try {
                    await guardarProgreso(actividad_id, nuevoPuntaje);
                } catch (err) {
                    console.error('Error guardando progreso:', err);
                }
                setJuegoTerminado(true);
            }
        }, 1400);
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
                        <div style={{ fontSize: '52px', marginBottom: '10px' }}>🎡</div>
                        <h1 style={{ margin: 0, fontFamily: "'Baloo 2', sans-serif", fontWeight: 800, fontSize: '30px', color: 'var(--heading)' }}>
                            Ruleta de Categorías
                        </h1>
                        <p style={{ margin: '8px 0 0', fontSize: '15px', color: 'var(--body-muted)' }}>
                            Identifica las palabras de cada categoría
                        </p>
                    </div>

                    <button onClick={iniciarJuego} className="w-full flex justify-between items-center text-left mb-5"
                        style={{ padding: '18px 22px', border: 'none', borderRadius: '18px', fontWeight: 800, fontSize: '16px', color: 'white', cursor: 'pointer', background: gradienteNivel }}>
                        <span>▶ {NOMBRE_NIVEL[nivelIndex]}</span>
                        <span style={{ fontSize: '14px', opacity: 0.85 }}>{rondas.length} rondas</span>
                    </button>

                    <div style={{ borderRadius: '20px', padding: '20px', background: 'rgba(var(--terracota-rgb),0.08)', border: '1px solid rgba(var(--terracota-rgb),0.2)' }}>
                        <h2 style={{ margin: '0 0 10px', fontSize: '15px', fontWeight: 800, color: 'var(--terracota)' }}>📜 ¿Cómo jugar?</h2>
                        <p style={{ margin: '0 0 7px', fontSize: '14px', color: 'var(--tinted-text)' }}>• La ruleta gira y elige una categoría.</p>
                        <p style={{ margin: '0 0 7px', fontSize: '14px', color: 'var(--tinted-text)' }}>• Selecciona todas las palabras que pertenezcan a ella.</p>
                        <p style={{ margin: '0 0 7px', fontSize: '14px', color: 'var(--tinted-text)' }}>• Acierto: +20 pts y suma bonus si llevas racha.</p>
                        <p style={{ margin: 0, fontSize: '14px', color: 'var(--tinted-text)' }}>• Error u omisión: -5 pts y se reinicia tu racha.</p>
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
            <AyudaFlotante juego="ruleta" />

            {/* Panel izquierdo - Score */}
            <div className="flex flex-col gap-4 p-7" style={{ flex: '1 1 250px', background: 'rgba(var(--card-bg-rgb),0.6)', borderRight: '1px solid rgba(var(--terracota-rgb),0.15)' }}>
                <div className="text-center" style={{ borderRadius: '20px', padding: '18px', background: 'rgba(var(--terracota-rgb),0.1)', border: '1px solid rgba(var(--terracota-rgb),0.3)' }}>
                    <p style={{ margin: 0, fontSize: '13px', fontWeight: 800, color: 'var(--terracota)' }}>MI PUNTAJE</p>
                    <p style={{ margin: '4px 0', fontSize: '46px', fontWeight: 800, color: 'var(--heading)' }}>{puntaje}</p>
                    <div className="flex justify-around mt-2">
                        <div><p style={{ margin: 0, fontSize: '13px', color: 'var(--body-muted)' }}>Combo</p><p style={{ margin: 0, fontSize: '20px', fontWeight: 800, color: 'var(--success-dark)' }}>🔥 {combo}</p></div>
                        <div><p style={{ margin: 0, fontSize: '13px', color: 'var(--body-muted)' }}>Ronda</p><p style={{ margin: 0, fontSize: '20px', fontWeight: 800, color: 'var(--success-dark)' }}>{rondaActual + 1}/{rondas.length}</p></div>
                    </div>
                </div>

                <p className="text-center" style={{ fontSize: '15px', color: 'var(--terracota)' }}>{NOMBRE_NIVEL[nivelIndex]}</p>

                <button onClick={() => setJuegoIniciado(false)} className="mt-auto" style={{ padding: '12px', borderRadius: '14px', border: '1px solid rgba(var(--locked-rgb),0.25)', background: 'none', fontSize: '14px', color: 'var(--body-muted)', cursor: 'pointer' }}>
                    ← Salir
                </button>
            </div>

            {/* Tablero central */}
            <div className="flex flex-col items-center p-7" style={{ flex: '3 1 500px' }}>
                <h2 style={{ margin: '0 0 18px', fontFamily: "'Baloo 2', sans-serif", fontWeight: 800, fontSize: '21px', color: 'var(--heading)' }}>
                    🎡 {NOMBRE_NIVEL[nivelIndex]}
                </h2>

                {/* Ruleta */}
                <div className="relative flex flex-col items-center mb-6">
                    <div style={{ position: 'relative', width: '85vw', height: '85vw', maxWidth: 230, maxHeight: 230 }}>
                        <div style={{
                            position: 'absolute', top: -15, left: '50%', transform: 'translateX(-50%)',
                            width: 0, height: 0,
                            borderLeft: '15px solid transparent',
                            borderRight: '15px solid transparent',
                            borderTop: '20px solid var(--terracota)',
                            zIndex: 3,
                        }} />
                        <div style={{
                            width: '100%', height: '100%', borderRadius: '50%',
                            background: `conic-gradient(${WHEEL_COLORS.animal} 0deg 72deg, ${WHEEL_COLORS.naturaleza} 72deg 144deg, ${WHEEL_COLORS.hogar} 144deg 216deg, ${WHEEL_COLORS.cuerpo} 216deg 288deg, ${WHEEL_COLORS.persona} 288deg 360deg)`,
                            border: '4px solid var(--gold)',
                            transform: `rotate(${anguloRuleta}deg)`,
                            transition: 'transform 1.8s cubic-bezier(0.17, 0.67, 0.12, 0.99)',
                            boxShadow: '0 10px 30px rgba(var(--terracota-rgb),0.25)',
                        }} />
                        <div style={{
                            position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)',
                            width: 40, height: 40, borderRadius: '50%',
                            background: 'var(--card-bg)', border: '3px solid var(--gold)', zIndex: 3,
                        }} />
                    </div>
                    {ruletaGirando ? (
                        <p style={{ marginTop: '16px', fontSize: '15px', color: 'var(--body-muted)' }}>Girando...</p>
                    ) : (
                        <p style={{ marginTop: '16px', fontSize: '18px', fontWeight: 800, color: 'var(--heading)' }}>
                            {CATEGORIA_EMOJI[categoriaRonda]} Categoría: {CATEGORIA_LABEL[categoriaRonda]}
                        </p>
                    )}
                </div>

                {/* Tarjetas */}
                {!ruletaGirando && tarjetasRonda.length > 0 && (
                    <>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3.5 w-full mb-5" style={{ maxWidth: '580px' }}>
                            {tarjetasRonda.map(t => {
                                const marcada = seleccionadas.includes(t.id);
                                let estilo = {
                                    background: 'var(--card-bg)',
                                    border: marcada ? '2px solid var(--gold)' : '2px solid rgba(var(--locked-rgb),0.15)',
                                };
                                if (confirmado) {
                                    if (t.correcta && marcada) {
                                        estilo = { background: 'rgba(var(--success-light-rgb),0.2)', border: '2px solid var(--success-light)' };
                                    } else if (!t.correcta && marcada) {
                                        estilo = { background: 'rgba(var(--error-rgb),0.16)', border: '2px solid var(--error)' };
                                    } else if (t.correcta && !marcada) {
                                        estilo = { background: 'rgba(var(--gold-rgb),0.18)', border: '2px dashed var(--gold)' };
                                    }
                                }
                                return (
                                    <div key={t.id}
                                        onClick={() => toggleSeleccion(t.id)}
                                        className="flex flex-col items-center gap-1 transition-all"
                                        style={{ ...estilo, borderRadius: '18px', padding: '16px', cursor: confirmado ? 'default' : 'pointer' }}>
                                        <span style={{ fontSize: '18px', fontWeight: 800, color: 'var(--heading)' }}>{t.palabra}</span>
                                    </div>
                                );
                            })}
                        </div>

                        {!confirmado && (
                            <button onClick={confirmarRonda} style={{ padding: '15px 36px', border: 'none', borderRadius: '18px', fontWeight: 800, fontSize: '16px', color: 'white', cursor: 'pointer', background: 'linear-gradient(135deg, var(--terracota), var(--gold))' }}>
                                ✅ Confirmar selección
                            </button>
                        )}
                    </>
                )}
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
                            <p style={{ margin: '3px 0 0', fontSize: '14px', color: 'var(--body-muted)' }}>{intentos} rondas · {errores} errores</p>
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

export default RuletaCategorias;
