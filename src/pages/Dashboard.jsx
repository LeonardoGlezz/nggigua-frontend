import aldeaFondo from '../assets/aldea-fondo.jpeg';
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

function CaminoZigzag({ actividades, color, progreso, nivelIndex }) {
    const navigate = useNavigate();

    const estaCompletada = (actId) =>
        progreso.some(p => p.actividad_id === actId && p.completado);

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
                const completada = estaCompletada(act.id);
                const bloqueada = i > 0 && !estaCompletada(actividades[i - 1].id);
                const RUTAS_JUGABLES = {
                    memorama: '/memorama',
                    ahorcado: '/ahorcado',
                    atrapa_palabra: '/atrapa-palabra',
                    empareja: '/empareja-columnas',
                    ruleta: '/ruleta-categorias',
                };
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
                                        borderRadius: '24px',
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
                                    onMouseEnter={(e) => { if (esSiguienteJugable) e.currentTarget.style.transform = 'scale(1.06)'; }}
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

function CaminoNivel({ nivel, index, abierto, onClick, bloqueado, actividades, progreso, completadas }) {
    const color = coloresNivel[index];

    if (bloqueado) {
        return (
            <div className="w-full mb-5" style={{
                borderRadius: '30px', padding: '24px 26px',
                background: 'rgba(var(--card-bg-rgb),0.65)', border: '2px solid rgba(var(--locked-rgb),0.15)',
            }}>
                <div className="flex items-center" style={{ gap: '18px' }}>
                    <div className="flex items-center justify-center" style={{
                        width: '60px', height: '60px', borderRadius: '18px', fontSize: '26px',
                        background: 'rgba(var(--locked-rgb),0.12)', border: '2px solid rgba(var(--locked-rgb),0.2)',
                    }}>🔒</div>
                    <div>
                        <h3 style={{ margin: '0 0 3px', fontFamily: "'Baloo 2', sans-serif", fontWeight: 800, fontSize: '19px', color: 'var(--locked)' }}>
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
            borderRadius: '30px', overflow: 'hidden',
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
                        width: '68px', height: '68px', borderRadius: '20px', fontSize: '32px',
                        background: `linear-gradient(135deg, ${color.primary}, ${color.secondary})`,
                        boxShadow: `0 8px 18px ${color.glow}`,
                    }}>
                        {color.icono}
                    </div>
                    <div>
                        <h3 style={{ margin: '0 0 4px', fontFamily: "'Baloo 2', sans-serif", fontWeight: 800, fontSize: '22px', color: 'var(--heading)' }}>
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
                    <CaminoZigzag actividades={actividades} color={color} progreso={progreso} nivelIndex={index} />
                </div>
            )}
        </div>
    );
}

function Dashboard() {
    const { cerrarSesion } = useAuth();
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

    return (
        <div className="min-h-screen relative overflow-hidden" style={{ fontFamily: "'Nunito', sans-serif" }}>
            <div className="absolute inset-0"
                style={{
                    backgroundImage: `url(${aldeaFondo})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center top',
                }} />
            <div className="absolute inset-0"
                style={{ background: 'linear-gradient(180deg, rgba(var(--bg-from-rgb),0.88), rgba(var(--bg-to-rgb),0.94))' }} />

            <div className="relative z-10">
                {/* Header */}
                <div className="flex justify-between items-center flex-wrap gap-3"
                    style={{ padding: '22px 36px', background: 'rgba(var(--card-bg-rgb),0.75)', backdropFilter: 'blur(6px)', borderBottom: '1px solid rgba(var(--terracota-rgb),0.15)' }}>
                    <div className="flex items-center gap-4 min-w-0">
                        <div className="flex items-center justify-center flex-shrink-0" style={{
                            width: '56px', height: '56px', borderRadius: '16px', fontSize: '28px',
                            background: 'linear-gradient(135deg, var(--terracota), var(--gold))',
                        }}>🌬️</div>
                        <div className="min-w-0">
                            <h1 className="truncate" style={{ margin: 0, fontFamily: "'Baloo 2', sans-serif", fontWeight: 800, fontSize: '22px', color: 'var(--heading)' }}>Nggigua</h1>
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
                                background: 'linear-gradient(135deg, var(--terracota), var(--gold))',
                                border: '3px solid rgba(var(--gold-rgb),0.6)', boxShadow: '0 6px 16px rgba(var(--terracota-rgb),0.35)',
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                            onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}>
                            {(perfil?.usuario?.nombre || 'U').charAt(0).toUpperCase()}
                        </div>
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
                        <h2 style={{ fontFamily: "'Baloo 2', sans-serif", fontWeight: 800, fontSize: '33px', margin: '0 0 8px', color: 'var(--heading)' }}>
                            Tu camino de aprendizaje
                        </h2>
                        <p style={{ margin: 0, fontSize: '16px', color: 'var(--body-muted)' }}>
                            Cada palabra que aprendes es una raíz que permanece
                        </p>
                    </div>

                    {/* Origen */}
                    <div className="flex flex-col items-center mb-7">
                        <div className="flex items-center justify-center" style={{
                            width: '70px', height: '70px', borderRadius: '50%', fontSize: '30px',
                            background: 'linear-gradient(135deg, var(--terracota), var(--gold))', boxShadow: '0 0 30px rgba(var(--gold-rgb),0.45)',
                        }}>🌬️</div>
                        <p style={{ margin: '12px 0 0', fontSize: '15px', fontWeight: 700, color: 'var(--terracota)' }}>Inicio de tu camino</p>
                        <div style={{ width: '2px', height: '36px', marginTop: '8px', background: 'linear-gradient(to bottom, var(--terracota), transparent)' }} />
                    </div>

                    {/* Niveles */}
                    {niveles.map((nivel, index) => {
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
                            />
                        );
                    })}
                </div>
            </div>
        </div>
    );
}

export default Dashboard;
