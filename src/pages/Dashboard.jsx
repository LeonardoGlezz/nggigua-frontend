import aldeaFondo from '../assets/aldea-fondo.jpeg';
import AyudaFlotante from '../components/AyudaFlotante';
import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { getNiveles, getActividades } from '../services/leccionService';
import { obtenerProgreso } from '../services/progresoService';
import { getPerfil } from '../services/authService';

const ICONOS_TIPO = {
    memorama: '🃏',
    ahorcado: '🔤',
    atrapa_palabra: '⚡',
    empareja: '🖼️',
    ruleta: '🎯',
};

const coloresNivel = [
    { primary: 'var(--terracota)', secondary: 'var(--gold)', glow: 'rgba(var(--terracota-rgb),0.3)', icono: '🌱' },
    { primary: 'var(--success-dark)', secondary: 'var(--success-light)', glow: 'rgba(var(--success-dark-rgb),0.3)', icono: '🌿' },
    { primary: 'var(--info)', secondary: '#A8DADC', glow: 'rgba(var(--info-rgb),0.3)', icono: '🌬️' },
];

const RUTAS_JUGABLES = {
    memorama: '/memorama',
    ahorcado: '/ahorcado',
    atrapa_palabra: '/atrapa-palabra',
    empareja: '/empareja-columnas',
    ruleta: '/ruleta-categorias',
};

const estaCompletada = (progreso, actId) =>
    progreso.some(p => p.actividad_id === actId && p.completado);

const puntajeDe = (progreso, actId) => {
    const p = progreso.find(p => p.actividad_id === actId);
    return p?.mejor_puntaje ?? null;
};

function CaminoZigzag({ actividades, color, progreso, nivelIndex, tipoPerfil }) {
    const navigate = useNavigate();
    // Niño: hover más exagerado para reforzar que el elemento es interactivo.
    // Adulto: hover casi imperceptible, más sobrio.
    const escalaHover = tipoPerfil === 'Niño' ? 1.12 : tipoPerfil === 'Adulto' ? 1.03 : 1.06;

    return (
        <div className="relative w-full" style={{ padding: '10px 4%' }}>
            <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ zIndex: 0 }}>
                {actividades.map((_, i) => {
                    if (i === actividades.length - 1) return null;
                    const izqActual = i % 2 === 0;
                    const x1 = izqActual ? '26%' : '74%';
                    const x2 = izqActual ? '74%' : '26%';
                    const y1 = `${(i * (100 / actividades.length)) + (50 / actividades.length)}%`;
                    const y2 = `${((i + 1) * (100 / actividades.length)) + (50 / actividades.length)}%`;
                    return (
                        <line key={i} x1={x1} y1={y1} x2={x2} y2={y2}
                            stroke={color.primary} strokeWidth="3"
                            strokeDasharray="6,5" opacity="0.45" />
                    );
                })}
            </svg>

            {actividades.map((act, i) => {
                const izquierda = i % 2 === 0;
                const completada = estaCompletada(progreso, act.id);
                const bloqueada = i > 0 && !estaCompletada(progreso, actividades[i - 1].id);
                const esJugable = !!RUTAS_JUGABLES[act.tipo];
                const ruta = RUTAS_JUGABLES[act.tipo];
                const esSiguienteJugable = !bloqueada && !completada && esJugable;

                return (
                    <div key={act.id}
                        className="relative"
                        style={{
                            display: 'flex',
                            justifyContent: izquierda ? 'flex-start' : 'flex-end',
                            paddingLeft: izquierda ? '6%' : '0',
                            paddingRight: izquierda ? '0' : '6%',
                            marginBottom: i === actividades.length - 1 ? 0 : '22px',
                            animation: `aparecer 0.4s ease ${i * 0.12}s both`,
                        }}>
                        <div className="flex flex-col items-center" style={{ gap: '9px' }}>
                            <div className="relative">
                                <div
                                    onClick={() => {
                                        if (!bloqueada && esJugable) {
                                            navigate(ruta, { state: { actividad_id: act.id, nivelIndex } });
                                        }
                                    }}
                                    className="flex items-center justify-center transition-transform"
                                    style={{
                                        width: esSiguienteJugable ? '96px' : '90px',
                                        height: esSiguienteJugable ? '96px' : '90px',
                                        borderRadius: 'calc(24px * var(--perfil-radius-mult))',
                                        fontSize: esSiguienteJugable ? '38px' : '35px',
                                        cursor: (!bloqueada && esJugable) ? 'pointer' : 'default',
                                        background: completada
                                            ? 'linear-gradient(135deg, var(--success-dark), var(--success-light))'
                                            : bloqueada
                                                ? 'rgba(var(--locked2-rgb),0.14)'
                                                : `linear-gradient(135deg, ${color.primary}, ${color.secondary})`,
                                        border: bloqueada ? '2px solid rgba(var(--locked-rgb),0.2)' : 'none',
                                        boxShadow: completada
                                            ? '0 10px 22px rgba(var(--success-dark-rgb),0.3)'
                                            : esSiguienteJugable
                                                ? `0 0 0 7px ${color.glow}, 0 10px 22px ${color.glow}`
                                                : 'none',
                                        filter: bloqueada ? 'grayscale(60%)' : 'none',
                                        opacity: bloqueada ? 0.75 : 1,
                                    }}
                                    onMouseEnter={(e) => { if (esSiguienteJugable) e.currentTarget.style.transform = `scale(${escalaHover})`; }}
                                    onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)'; }}
                                >
                                    {completada ? '✅' : ICONOS_TIPO[act.tipo] || '🎮'}
                                </div>
                                {bloqueada && (
                                    <div className="absolute flex items-center justify-center"
                                        style={{
                                            top: '-7px', right: '-7px', width: '28px', height: '28px', borderRadius: '50%',
                                            fontSize: '14px', background: 'var(--card-bg)', border: '2px solid rgba(var(--locked-rgb),0.25)',
                                        }}>
                                        🔒
                                    </div>
                                )}
                            </div>
                            <p className="text-center" style={{
                                margin: 0, fontSize: '14px', maxWidth: '112px',
                                fontWeight: esSiguienteJugable ? 800 : 700,
                                color: bloqueada ? 'var(--locked)' : completada ? 'var(--success-dark)' : color.primary,
                            }}>
                                {act.nombre}
                            </p>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}

function CaminoNivel({ nivel, index, abierto, onClick, bloqueado, actividades, progreso, completadas, tipoPerfil }) {
    const color = coloresNivel[index];

    if (bloqueado) {
        return (
            <div className="w-full mb-5" style={{
                borderRadius: 'calc(30px * var(--perfil-radius-mult))', padding: '24px 26px',
                background: 'rgba(var(--card-bg-rgb),0.65)', border: '2px solid rgba(var(--locked-rgb),0.15)',
            }}>
                <div className="flex items-center" style={{ gap: '18px' }}>
                    <div className="flex items-center justify-center" style={{
                        width: '60px', height: '60px', borderRadius: 'calc(18px * var(--perfil-radius-mult))', fontSize: '26px',
                        background: 'rgba(var(--locked-rgb),0.12)', border: '2px solid rgba(var(--locked-rgb),0.2)',
                    }}>🔒</div>
                    <div>
                        <h3 style={{ margin: '0 0 3px', fontFamily: 'var(--perfil-heading-font)', fontWeight: 800, fontSize: '19px', color: 'var(--locked)' }}>
                            {nivel.nombre}
                        </h3>
                        <p style={{ margin: 0, fontSize: '14px', color: 'var(--locked-soft)' }}>Completa el nivel anterior</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="w-full mb-6 transition-all duration-500" style={{
            borderRadius: 'calc(30px * var(--perfil-radius-mult))', overflow: 'hidden',
            border: `2px solid ${abierto ? color.primary : 'rgba(var(--locked-rgb),0.15)'}`,
            background: 'var(--card-bg)',
            boxShadow: abierto ? `0 18px 40px ${color.glow}` : 'none',
        }}>
            {/* Header */}
            <div
                className="flex items-center justify-between cursor-pointer"
                onClick={() => onClick(index)}
                style={{
                    padding: '26px',
                    background: abierto ? `linear-gradient(135deg, ${color.glow}, transparent)` : 'transparent',
                }}>
                <div className="flex items-center" style={{ gap: '18px' }}>
                    <div className="flex items-center justify-center" style={{
                        width: '68px', height: '68px', borderRadius: 'calc(20px * var(--perfil-radius-mult))', fontSize: '32px',
                        background: `linear-gradient(135deg, ${color.primary}, ${color.secondary})`,
                        boxShadow: `0 8px 18px ${color.glow}`,
                    }}>
                        {color.icono}
                    </div>
                    <div>
                        <h3 style={{ margin: '0 0 4px', fontFamily: 'var(--perfil-heading-font)', fontWeight: 800, fontSize: '22px', color: 'var(--heading)' }}>
                            {nivel.nombre}
                        </h3>
                        <p style={{ margin: '0 0 9px', fontSize: '15px', color: 'var(--body-muted)' }}>
                            {nivel.descripcion}
                        </p>
                        <div style={{ height: '7px', width: '116px', borderRadius: '999px', background: 'rgba(var(--terracota-rgb),0.15)' }}>
                            <div style={{
                                height: '7px', borderRadius: '999px',
                                width: `${(completadas / (actividades.length || 5)) * 100}%`,
                                background: `linear-gradient(90deg, ${color.primary}, ${color.secondary})`,
                            }} />
                        </div>
                    </div>
                </div>
                <div style={{ color: color.primary, fontSize: '1.25rem', transition: 'transform 0.4s', transform: abierto ? 'rotate(180deg)' : 'rotate(0deg)' }}>▼</div>
            </div>

            {/* Camino zigzag desplegable */}
            {abierto && (
                <div style={{ padding: '8px 22px 32px' }}>
                    <div style={{ height: '1px', marginBottom: '22px', background: `linear-gradient(to right, transparent, ${color.primary}66, transparent)` }} />
                    <CaminoZigzag actividades={actividades} color={color} progreso={progreso} nivelIndex={index} tipoPerfil={tipoPerfil} />
                </div>
            )}
        </div>
    );
}

// ===================== Layout para perfil "Niño" =====================
// Sin líneas ni distribución en zigzag: una tarjeta enorme con la siguiente
// actividad para jugar ya, y debajo los niveles como cuadrícula de botones
// grandes y simples. Menos información en pantalla, más foco.
function RutaNino({ niveles, actividadesPorNivel, progreso, nivelBloqueado }) {
    const navigate = useNavigate();

    let siguiente = null;
    for (let i = 0; i < niveles.length && !siguiente; i++) {
        if (nivelBloqueado(i)) continue;
        const acts = actividadesPorNivel[niveles[i].id] || [];
        for (let j = 0; j < acts.length; j++) {
            const bloqueada = j > 0 && !estaCompletada(progreso, acts[j - 1].id);
            if (bloqueada) continue;
            if (!estaCompletada(progreso, acts[j].id) && RUTAS_JUGABLES[acts[j].tipo]) {
                siguiente = { actividad: acts[j], nivelIndex: i };
                break;
            }
        }
    }

    return (
        <div>
            {siguiente ? (
                <div
                    onClick={() => navigate(RUTAS_JUGABLES[siguiente.actividad.tipo], { state: { actividad_id: siguiente.actividad.id, nivelIndex: siguiente.nivelIndex } })}
                    className="cursor-pointer transition-transform text-center"
                    style={{
                        borderRadius: 'calc(36px * var(--perfil-radius-mult))', padding: '36px', marginBottom: '40px',
                        background: 'linear-gradient(135deg, var(--perfil-accent), var(--perfil-accent-2))',
                        boxShadow: '0 16px 36px rgba(var(--perfil-accent-rgb),0.4)',
                        animation: 'floatMascot 2.4s ease-in-out infinite',
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.03)'}
                    onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}>
                    <div style={{ fontSize: '64px', marginBottom: '10px' }}>{ICONOS_TIPO[siguiente.actividad.tipo] || '🎮'}</div>
                    <p style={{ margin: '0 0 6px', fontSize: '15px', fontWeight: 700, color: 'white', opacity: 0.9 }}>¡Tu próxima aventura!</p>
                    <h3 style={{ margin: '0 0 18px', fontFamily: 'var(--perfil-heading-font)', fontWeight: 800, fontSize: '26px', color: 'white' }}>
                        {siguiente.actividad.nombre}
                    </h3>
                    <span style={{
                        display: 'inline-block', padding: '14px 34px', borderRadius: '999px', fontWeight: 800, fontSize: '18px',
                        background: 'white', color: 'var(--perfil-accent)',
                    }}>¡Jugar ahora! 🎮</span>
                </div>
            ) : (
                <div className="text-center" style={{ marginBottom: '40px', fontSize: '20px', fontWeight: 800, color: 'var(--perfil-accent)' }}>
                    🎉 ¡Completaste todas las actividades! 🎉
                </div>
            )}

            {niveles.map((nivel, index) => {
                const bloqueado = nivelBloqueado(index);
                const acts = actividadesPorNivel[nivel.id] || [];
                const color = coloresNivel[index];

                if (bloqueado) {
                    return (
                        <div key={nivel.id} className="text-center" style={{
                            borderRadius: 'calc(28px * var(--perfil-radius-mult))', padding: '20px', marginBottom: '20px',
                            background: 'rgba(var(--card-bg-rgb),0.6)', border: '2px dashed rgba(var(--locked-rgb),0.35)',
                            fontWeight: 800, fontSize: '17px', color: 'var(--locked)',
                        }}>
                            🔒 {nivel.nombre} — ¡completa el nivel anterior!
                        </div>
                    );
                }

                return (
                    <div key={nivel.id} style={{ marginBottom: '32px' }}>
                        <h3 className="text-center" style={{ fontFamily: 'var(--perfil-heading-font)', fontWeight: 800, fontSize: '22px', margin: '0 0 16px', color: color.primary }}>
                            {color.icono} {nivel.nombre}
                        </h3>
                        <div className="flex flex-wrap justify-center" style={{ gap: '20px' }}>
                            {acts.map((act, i) => {
                                const completada = estaCompletada(progreso, act.id);
                                const bloqueada = i > 0 && !estaCompletada(progreso, acts[i - 1].id);
                                const esJugable = !!RUTAS_JUGABLES[act.tipo];
                                const ruta = RUTAS_JUGABLES[act.tipo];
                                return (
                                    <div key={act.id} className="flex flex-col items-center" style={{ gap: '8px', width: '124px' }}>
                                        <div
                                            onClick={() => { if (!bloqueada && esJugable) navigate(ruta, { state: { actividad_id: act.id, nivelIndex: index } }); }}
                                            className="flex items-center justify-center transition-transform"
                                            style={{
                                                width: '104px', height: '104px', borderRadius: 'calc(32px * var(--perfil-radius-mult))', fontSize: '44px',
                                                cursor: (!bloqueada && esJugable) ? 'pointer' : 'default',
                                                background: completada
                                                    ? 'linear-gradient(135deg, var(--success-dark), var(--success-light))'
                                                    : bloqueada
                                                        ? 'rgba(var(--locked2-rgb),0.14)'
                                                        : `linear-gradient(135deg, ${color.primary}, ${color.secondary})`,
                                                boxShadow: bloqueada ? 'none' : `0 10px 22px ${color.glow}`,
                                                filter: bloqueada ? 'grayscale(60%)' : 'none',
                                                opacity: bloqueada ? 0.7 : 1,
                                            }}
                                            onMouseEnter={(e) => { if (!bloqueada && esJugable) e.currentTarget.style.transform = 'scale(1.12)'; }}
                                            onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}>
                                            {completada ? '✅' : bloqueada ? '🔒' : (ICONOS_TIPO[act.tipo] || '🎮')}
                                        </div>
                                        <p className="text-center" style={{ margin: 0, fontSize: '14px', fontWeight: 700, color: bloqueada ? 'var(--locked)' : color.primary }}>
                                            {act.nombre}
                                        </p>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                );
            })}
        </div>
    );
}

// ===================== Layout para perfil "Adulto" =====================
// Sin ilustraciones ni camino: lista/tabla compacta por nivel con estado y
// puntaje siempre visibles, pensada como panel de seguimiento más que juego.
function TablaAdulto({ niveles, actividadesPorNivel, progreso, nivelBloqueado, nivelAbierto, toggleNivel }) {
    const navigate = useNavigate();

    return (
        <div>
            {niveles.map((nivel, index) => {
                const bloqueado = nivelBloqueado(index);
                const acts = actividadesPorNivel[nivel.id] || [];
                const completadas = acts.filter(a => estaCompletada(progreso, a.id)).length;
                const abierto = nivelAbierto === index;
                const color = coloresNivel[index];
                const porcentaje = acts.length ? Math.round((completadas / acts.length) * 100) : 0;

                return (
                    <div key={nivel.id} style={{
                        borderRadius: 'calc(14px * var(--perfil-radius-mult))', marginBottom: '12px', overflow: 'hidden',
                        border: '1px solid rgba(var(--perfil-accent-rgb),0.25)', background: 'var(--card-bg)',
                        opacity: bloqueado ? 0.65 : 1,
                    }}>
                        <div className="flex items-center justify-between"
                            onClick={() => !bloqueado && toggleNivel(index)}
                            style={{ padding: '15px 20px', cursor: bloqueado ? 'default' : 'pointer' }}>
                            <div className="flex items-center" style={{ gap: '12px' }}>
                                <span style={{ fontSize: '13px' }}>{bloqueado ? '🔒' : color.icono}</span>
                                <span style={{ fontFamily: 'var(--perfil-heading-font)', fontWeight: 700, fontSize: '15px', color: 'var(--heading)' }}>
                                    {nivel.nombre}
                                </span>
                            </div>
                            <div className="flex items-center" style={{ gap: '16px' }}>
                                <span style={{ fontSize: '13px', color: 'var(--body-muted)' }}>
                                    {completadas}/{acts.length || 0} · {porcentaje}%
                                </span>
                                {!bloqueado && (
                                    <span style={{ fontSize: '0.85rem', transition: 'transform 0.3s', transform: abierto ? 'rotate(180deg)' : 'none', color: 'var(--perfil-accent)' }}>▼</span>
                                )}
                            </div>
                        </div>

                        {abierto && !bloqueado && (
                            <div style={{ borderTop: '1px solid rgba(var(--perfil-accent-rgb),0.15)' }}>
                                {acts.map((act, i) => {
                                    const completada = estaCompletada(progreso, act.id);
                                    const bloqueada = i > 0 && !estaCompletada(progreso, acts[i - 1].id);
                                    const esJugable = !!RUTAS_JUGABLES[act.tipo];
                                    const ruta = RUTAS_JUGABLES[act.tipo];
                                    const puntaje = puntajeDe(progreso, act.id);
                                    return (
                                        <div key={act.id}
                                            onClick={() => { if (!bloqueada && esJugable) navigate(ruta, { state: { actividad_id: act.id, nivelIndex: index } }); }}
                                            className="flex items-center justify-between"
                                            style={{
                                                padding: '10px 20px', fontSize: '14px',
                                                cursor: (!bloqueada && esJugable) ? 'pointer' : 'default',
                                                borderTop: i === 0 ? 'none' : '1px solid rgba(var(--perfil-accent-rgb),0.08)',
                                            }}>
                                            <span style={{ color: bloqueada ? 'var(--locked)' : 'var(--heading)', fontWeight: 600 }}>
                                                {bloqueada ? '🔒' : completada ? '✅' : '·'} {act.nombre}
                                            </span>
                                            <span className="flex items-center" style={{ gap: '18px', fontSize: '13px', color: 'var(--body-muted)' }}>
                                                <span>{completada ? 'Completada' : bloqueada ? 'Bloqueada' : 'Pendiente'}</span>
                                                <span style={{ minWidth: '32px', textAlign: 'right', fontWeight: 700, color: 'var(--perfil-accent)' }}>{puntaje ?? '—'}</span>
                                            </span>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                );
            })}
        </div>
    );
}

function Dashboard() {
    const { cerrarSesion, esAdmin } = useAuth();
    const navigate = useNavigate();
    const [niveles, setNiveles] = useState([]);
    const [actividadesPorNivel, setActividadesPorNivel] = useState({});
    const [progreso, setProgreso] = useState([]);
    const [nivelAbierto, setNivelAbierto] = useState(null);
    const [perfil, setPerfil] = useState(null);


    useEffect(() => {
        const cargarDatos = async () => {
            try {
                const dataNiveles = await getNiveles();
                setNiveles(dataNiveles);

                const actMap = {};
                for (const nivel of dataNiveles) {
                    const acts = await getActividades(nivel.id);
                    actMap[nivel.id] = acts;
                }
                setActividadesPorNivel(actMap);

                const datosProgreso = await obtenerProgreso();
                setProgreso(datosProgreso);

                const dataPerfil = await getPerfil();
                setPerfil(dataPerfil);
            } catch (error) {
                console.log('Error cargando datos:', error);
            }
        };
        cargarDatos();
    }, []);

    const nivelBloqueado = (index) => {
        if (index === 0) return false;
        const nivelAnterior = niveles[index - 1];
        const actividadesAnterior = actividadesPorNivel[nivelAnterior?.id] || [];
        return actividadesAnterior.length > 0 && !actividadesAnterior.every(act =>
            progreso.some(p => p.actividad_id === act.id && p.completado)
        );
    };

    const toggleNivel = (index) => {
        if (nivelBloqueado(index)) return;
        setNivelAbierto(prev => prev === index ? null : index);
    };

    const handleLogout = () => {
        cerrarSesion();
        navigate('/');
    };

    const tipoPerfil = perfil?.usuario?.tipo_perfil || 'Joven';
    const esNino = tipoPerfil === 'Niño';
    const esAdulto = tipoPerfil === 'Adulto';
    const totalActividadesTodas = Object.values(actividadesPorNivel).flat().length;
    const totalCompletadasTodas = progreso.filter(p => p.completado).length;

    const tituloHero = esNino
        ? '¡Vamos a jugar y aprender! 🎉'
        : esAdulto
            ? 'Panel de aprendizaje'
            : 'Tu camino de aprendizaje';

    const subtituloHero = esNino
        ? '¡Cada palabra nueva que aprendes es una aventura!'
        : esAdulto
            ? `Progreso general: ${totalCompletadasTodas} de ${totalActividadesTodas} actividades completadas.`
            : 'Cada palabra que aprendes es una raíz que permanece';

    return (
        <div className="min-h-screen relative overflow-hidden" style={{ fontFamily: "'Nunito', sans-serif" }}>
            <AyudaFlotante juego="general" />
            <div className="absolute inset-0"
                style={{
                    backgroundImage: `url(${aldeaFondo})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center top',
                    opacity: 'var(--perfil-bg-opacity)',
                    filter: 'var(--perfil-bg-filter)',
                }} />
            <div className="absolute inset-0"
                style={{ background: 'linear-gradient(180deg, rgba(var(--bg-from-rgb),0.88), rgba(var(--bg-to-rgb),0.94))' }} />

            <div className="relative z-10">
                {/* Header */}
                <div className="flex justify-between items-center flex-wrap gap-3"
                    style={{ padding: '22px 36px', background: 'rgba(var(--card-bg-rgb),0.75)', backdropFilter: 'blur(6px)', borderBottom: '1px solid rgba(var(--terracota-rgb),0.15)' }}>
                    <div className="flex items-center gap-4 min-w-0">
                        <div className="flex items-center justify-center flex-shrink-0" style={{
                            width: '56px', height: '56px', borderRadius: 'calc(16px * var(--perfil-radius-mult))', fontSize: '28px',
                            background: 'linear-gradient(135deg, var(--perfil-accent), var(--perfil-accent-2))',
                        }}>🌬️</div>
                        <div className="min-w-0">
                            <h1 className="truncate" style={{ margin: 0, fontFamily: 'var(--perfil-heading-font)', fontWeight: 800, fontSize: '22px', color: 'var(--heading)' }}>Nggigua</h1>
                            <p style={{ margin: 0, fontSize: '14px', color: 'var(--body-muted)' }}>Lengua viva del pueblo Chocholteca</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-4 flex-shrink-0">
                        <div className="text-right hidden sm:block">
                            <p style={{ margin: 0, fontWeight: 800, color: 'var(--heading)', fontSize: '16px' }}>{perfil?.usuario?.nombre || 'Usuario'}</p>
                            <p style={{ margin: 0, fontSize: '14px', color: 'var(--terracota)' }}>
                                🔥 {perfil?.usuario?.racha_actual || 0} día{perfil?.usuario?.racha_actual !== 1 ? 's' : ''} de racha
                            </p>
                        </div>
                        <div onClick={() => navigate('/perfil')} title="Ver mi perfil"
                            className="flex items-center justify-center cursor-pointer transition-transform flex-shrink-0"
                            style={{
                                width: '54px', height: '54px', borderRadius: '50%', fontWeight: 800, fontSize: '22px', color: 'white',
                                background: 'linear-gradient(135deg, var(--perfil-accent), var(--perfil-accent-2))',
                                border: '3px solid rgba(var(--perfil-accent-rgb),0.7)', boxShadow: '0 6px 16px rgba(var(--perfil-accent-rgb),0.35)',
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                            onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}>
                            {(perfil?.usuario?.nombre || 'U').charAt(0).toUpperCase()}
                        </div>
                        {esAdmin && (
                            <button onClick={() => navigate('/admin')} className="flex-shrink-0" title="Panel de administrador" style={{
                                fontSize: '15px', padding: '11px 20px', borderRadius: '14px', border: 'none',
                                background: 'linear-gradient(135deg, var(--terracota), var(--gold))', color: 'white', fontWeight: 700, cursor: 'pointer',
                            }}>
                                🛠️ Admin
                            </button>
                        )}
                        <button onClick={handleLogout} className="flex-shrink-0" style={{
                            fontSize: '15px', padding: '11px 20px', borderRadius: '14px',
                            border: '1px solid rgba(var(--terracota-rgb),0.3)', background: 'rgba(var(--terracota-rgb),0.08)', color: 'var(--terracota)', fontWeight: 700, cursor: 'pointer',
                        }}>
                            Salir
                        </button>
                    </div>
                </div>

                {/* Contenido */}
                <div className="mx-auto" style={{ maxWidth: '800px', padding: '42px 22px 70px' }}>
                    <div className="text-center mb-10">
                        <h2 style={{ fontFamily: 'var(--perfil-heading-font)', fontWeight: 800, fontSize: '33px', margin: '0 0 8px', color: 'var(--heading)' }}>
                            {tituloHero}
                        </h2>
                        <p style={{ margin: 0, fontSize: '16px', color: 'var(--body-muted)' }}>
                            {subtituloHero}
                        </p>
                    </div>

                    {/* Origen: solo tiene sentido con la metáfora de "camino", se omite en el panel de Adulto */}
                    {!esAdulto && (
                        <div className="flex flex-col items-center mb-7">
                            <div className="flex items-center justify-center" style={{
                                width: '70px', height: '70px', borderRadius: '50%', fontSize: '30px',
                                background: 'linear-gradient(135deg, var(--perfil-accent), var(--perfil-accent-2))', boxShadow: '0 0 30px rgba(var(--perfil-accent-rgb),0.45)',
                            }}>🌬️</div>
                            <p style={{ margin: '12px 0 0', fontSize: '15px', fontWeight: 700, color: 'var(--perfil-accent)' }}>Inicio de tu camino</p>
                            <div style={{ width: '2px', height: '36px', marginTop: '8px', background: 'linear-gradient(to bottom, var(--perfil-accent), transparent)' }} />
                        </div>
                    )}

                    {/* Niveles: layout completamente distinto según el perfil de edad */}
                    {esNino ? (
                        <RutaNino niveles={niveles} actividadesPorNivel={actividadesPorNivel} progreso={progreso} nivelBloqueado={nivelBloqueado} />
                    ) : esAdulto ? (
                        <TablaAdulto niveles={niveles} actividadesPorNivel={actividadesPorNivel} progreso={progreso} nivelBloqueado={nivelBloqueado} nivelAbierto={nivelAbierto} toggleNivel={toggleNivel} />
                    ) : (
                        niveles.map((nivel, index) => {
                            const acts = actividadesPorNivel[nivel.id] || [];
                            const completadas = acts.filter(a =>
                                progreso.some(p => p.actividad_id === a.id && p.completado)
                            ).length;

                            return (
                                <CaminoNivel
                                    key={nivel.id}
                                    nivel={nivel}
                                    index={index}
                                    abierto={nivelAbierto === index}
                                    onClick={toggleNivel}
                                    bloqueado={nivelBloqueado(index)}
                                    actividades={acts}
                                    progreso={progreso}
                                    completadas={completadas}
                                    tipoPerfil={tipoPerfil}
                                />
                            );
                        })
                    )}
                </div>
            </div>
        </div>
    );
}

export default Dashboard;
