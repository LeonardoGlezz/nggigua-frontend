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
    { primary: '#C4622D', secondary: '#E9C46A', glow: 'rgba(196,98,45,0.4)', icono: '🌱' },
    { primary: '#2D6A4F', secondary: '#52B788', glow: 'rgba(45,106,79,0.4)', icono: '🌿' },
    { primary: '#4A6FA5', secondary: '#A8DADC', glow: 'rgba(74,111,165,0.4)', icono: '🌬️' },
];


function CaminoZigzag({ actividades, color, progreso }) {
    const navigate = useNavigate();

    const estaCompletada = (actId) =>
        progreso.some(p => p.actividad_id === actId && p.completado);

    return (
        <div className="relative w-full px-4 py-4">
            <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ zIndex: 0 }}>
                {actividades.map((_, i) => {
                    if (i === actividades.length - 1) return null;
                    const izqActual = i % 2 === 0;
                    const x1 = izqActual ? '30%' : '70%';
                    const x2 = izqActual ? '70%' : '30%';
                    const y1 = `${(i * (100 / actividades.length)) + (50 / actividades.length)}%`;
                    const y2 = `${((i + 1) * (100 / actividades.length)) + (50 / actividades.length)}%`;
                    return (
                        <line key={i} x1={x1} y1={y1} x2={x2} y2={y2}
                            stroke={color.primary} strokeWidth="3"
                            strokeDasharray="6,4" opacity="0.6" />
                    );
                })}
            </svg>

            {actividades.map((act, i) => {
                const izquierda = i % 2 === 0;
                const completada = estaCompletada(act.id);
                const bloqueada = i > 0 && !estaCompletada(actividades[i - 1].id);
                const esJugable = act.tipo === 'memorama';

                return (
                    <div key={act.id}
                        className="relative z-10 flex items-center mb-4"
                        style={{
                            justifyContent: izquierda ? 'flex-start' : 'flex-end',
                            paddingLeft: izquierda ? '8%' : '0',
                            paddingRight: izquierda ? '0' : '8%',
                            animation: `aparecer 0.4s ease ${i * 0.12}s both`
                        }}>
                        <div className="flex flex-col items-center">
                            <div className="relative">
                                <div
                                    className="w-20 h-20 rounded-2xl flex items-center justify-center text-3xl shadow-xl transition-all cursor-pointer hover:scale-105"
                                    onClick={() => {
                                        if (!bloqueada && esJugable) {
                                            navigate('/memorama', { state: { actividad_id: act.id } });
                                        }
                                    }}
                                    style={{
                                        background: completada
                                            ? 'linear-gradient(135deg, #2D6A4F, #52B788)'
                                            : bloqueada
                                                ? 'rgba(30,30,50,0.6)'
                                                : `linear-gradient(135deg, ${color.primary}, ${color.secondary})`,
                                        border: completada
                                            ? '2px solid #52B788'
                                            : bloqueada
                                                ? '2px solid rgba(255,255,255,0.15)'
                                                : `2px solid ${color.secondary}`,
                                        boxShadow: bloqueada ? 'none' : `0 6px 20px ${color.glow}`,
                                        filter: bloqueada ? 'grayscale(80%)' : 'none',
                                    }}>
                                    {completada ? '✅' : ICONOS_TIPO[act.tipo] || '🎮'}
                                </div>
                                {bloqueada && (
                                    <div className="absolute -top-2 -right-2 w-7 h-7 rounded-full flex items-center justify-center text-sm"
                                        style={{ background: '#1B2A4A', border: '2px solid rgba(255,255,255,0.2)' }}>
                                        🔒
                                    </div>
                                )}
                            </div>
                            <p className="text-xs mt-2 text-center max-w-24 font-medium"
                                style={{ color: bloqueada ? 'rgba(255,255,255,0.35)' : completada ? '#52B788' : color.secondary }}>
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

    return (
        <div className="w-full mb-5 rounded-3xl overflow-hidden transition-all duration-500"
            style={{
                border: `1.5px solid ${abierto ? color.primary : 'rgba(255,255,255,0.06)'}`,
                boxShadow: abierto ? `0 0 40px ${color.glow}` : 'none',
                background: 'rgba(13, 20, 40, 0.85)',
                backdropFilter: 'blur(10px)',
            }}>

            {/* Header */}
            <div
                className="flex items-center justify-between p-6 cursor-pointer transition-all"
                onClick={() => !bloqueado && onClick(index)}
                style={{
                    background: abierto
                        ? `linear-gradient(135deg, rgba(${index === 0 ? '196,98,45' : index === 1 ? '45,106,79' : '74,111,165'},0.2), transparent)`
                        : 'transparent'
                }}>
                <div className="flex items-center gap-5">
                    <div
                        className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl shadow-lg"
                        style={{
                            background: bloqueado
                                ? 'rgba(20,20,40,0.8)'
                                : `linear-gradient(135deg, ${color.primary}, ${color.secondary})`,
                            border: `2px solid ${bloqueado ? '#333' : color.primary}`,
                            boxShadow: !bloqueado && index === 0 ? `0 0 20px ${color.glow}` : 'none',
                            animation: index === 0 && !abierto && !bloqueado ? 'saltar 1.5s ease-in-out infinite' : 'none',
                        }}
                    >
                        {bloqueado ? '🔒' : color.icono}
                    </div>
                    <div>
                        <h3 className="font-bold text-xl mb-1"
                            style={{ color: bloqueado ? '#555' : color.secondary }}>
                            {nivel.nombre}
                        </h3>
                        <p className="text-sm" style={{ color: bloqueado ? '#444' : '#8899BB' }}>
                            {bloqueado ? 'Completa el nivel anterior' : nivel.descripcion}
                        </p>
                        {!bloqueado && (
                            <div className="flex items-center gap-2 mt-2">
                                <div className="h-1.5 w-24 rounded-full" style={{ background: 'rgba(255,255,255,0.1)' }}>
                                    <div className="h-1.5 rounded-full" style={{ width: `${(completadas / (actividades.length || 5)) * 100}%`, background: color.primary }} />
                                </div>
                                <div className="h-1.5 rounded-full" style={{ width: `${(completadas / (actividades.length || 5)) * 100}%`, background: color.primary }} />
                            </div>
                        )}
                    </div>
                </div>
                {!bloqueado && (
                    <div style={{
                        color: color.secondary,
                        fontSize: '1.2rem',
                        transition: 'transform 0.4s',
                        transform: abierto ? 'rotate(180deg)' : 'rotate(0deg)'
                    }}>▼</div>
                )}
            </div>

            {/* Camino zigzag desplegable */}
            {abierto && !bloqueado && (
                <div className="px-4 pb-6" style={{ background: 'rgba(0,0,0,0.2)' }}>
                    <div className="w-full h-px mb-4"
                        style={{ background: `linear-gradient(to right, transparent, ${color.primary}, transparent)` }} />
                    <CaminoZigzag actividades={actividades} color={color} progreso={progreso} />
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
        <div className="min-h-screen text-white relative overflow-hidden"
            style={{
                backgroundImage: `url(${aldeaFondo})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center top',
                backgroundAttachment: 'fixed'
            }}>
            <div className="absolute inset-0"
                style={{ background: 'rgba(13, 27, 42, 0.65)' }} />

            {/* Patrón geométrico zapoteco de fondo */}
            <div className="absolute inset-0 pointer-events-none opacity-5">
                <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
                    <defs>
                        <pattern id="zapoteco" x="0" y="0" width="60" height="60" patternUnits="userSpaceOnUse">
                            <rect x="0" y="0" width="60" height="60" fill="none" />
                            <path d="M0,30 L30,0 L60,30 L30,60 Z" fill="none" stroke="#C4622D" strokeWidth="1" />
                            <path d="M15,30 L30,15 L45,30 L30,45 Z" fill="none" stroke="#E9C46A" strokeWidth="0.5" />
                            <circle cx="30" cy="30" r="3" fill="#C4622D" />
                        </pattern>
                    </defs>
                    <rect width="100%" height="100%" fill="url(#zapoteco)" />
                </svg>
            </div>

            {/* Luces de ambiente */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute w-96 h-96 rounded-full -top-32 -left-32 opacity-10"
                    style={{ background: '#C4622D', filter: 'blur(80px)' }} />
                <div className="absolute w-96 h-96 rounded-full -bottom-32 -right-32 opacity-10"
                    style={{ background: '#E9C46A', filter: 'blur(80px)' }} />
            </div>

            {/* Header */}
            <div className="relative z-10 flex justify-between items-center px-8 py-5"
                style={{ borderBottom: '1px solid rgba(196,98,45,0.15)', backdropFilter: 'blur(10px)' }}>
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl"
                        style={{ background: 'linear-gradient(135deg, #C4622D, #E9C46A)' }}>
                        🌬️
                    </div>
                    <div>
                        <h1 className="font-bold text-xl" style={{ color: '#E9C46A' }}>Nggigua</h1>
                        <p className="text-xs" style={{ color: '#8899BB' }}>Lengua viva del pueblo Chocholteca</p>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <div className="text-right">
                        <p className="font-semibold" style={{ color: '#E9C46A' }}>{perfil?.usuario?.nombre || 'Usuario'}</p>
                        <p className="text-xs flex items-center justify-end gap-1" style={{ color: '#C4622D' }}>
                            🔥 <span>🔥 {perfil?.usuario?.racha_actual || 0} día{perfil?.usuario?.racha_actual !== 1 ? 's' : ''} de racha</span>
                        </p>
                    </div>
                    <div className="w-12 h-12 rounded-full flex items-center justify-center font-bold text-xl cursor-pointer"
                        style={{
                            background: 'linear-gradient(135deg, #C4622D, #E9C46A)',
                            border: '3px solid rgba(233,196,106,0.5)',
                            boxShadow: '0 0 20px rgba(196,98,45,0.4)'
                        }}>

                    </div>
                    <button onClick={handleLogout}
                        className="text-sm px-4 py-2 rounded-xl transition-all hover:opacity-80"
                        style={{ background: 'rgba(196,98,45,0.15)', border: '1px solid rgba(196,98,45,0.3)', color: '#C4622D' }}>
                        Salir
                    </button>
                </div>
            </div>

            {/* Contenido */}
            <div className="relative z-10 max-w-2xl mx-auto px-6 pt-10 pb-16">

                <div className="text-center mb-10">
                    <h2 className="text-3xl font-bold mb-2" style={{ color: '#F4ECD8' }}>
                        Tu camino de aprendizaje
                    </h2>
                    <p className="text-base" style={{ color: '#8899BB' }}>
                        Cada palabra que aprendes es una raíz que permanece
                    </p>
                </div>

                {/* Origen */}
                <div className="flex flex-col items-center mb-8">
                    <div className="w-16 h-16 rounded-full flex items-center justify-center text-3xl shadow-2xl"
                        style={{
                            background: 'linear-gradient(135deg, #C4622D, #E9C46A)',
                            boxShadow: '0 0 40px rgba(233,196,106,0.4)'
                        }}>
                        🌬️
                    </div>
                    <p className="text-sm mt-3 font-medium" style={{ color: '#E9C46A' }}>
                        Inicio de tu camino
                    </p>
                    <div className="w-px h-10 mt-3"
                        style={{ background: 'linear-gradient(to bottom, #C4622D, transparent)' }} />
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

            <style>{`
                @keyframes saltar {
                    0%, 100% { transform: translateY(0px); }
                    50% { transform: translateY(-8px); }
                }
                @keyframes aparecer {
                    from { opacity: 0; transform: translateY(-15px); }
                    to { opacity: 1; transform: translateY(0); }
                }
            `}</style>
        </div>
    );
}

export default Dashboard;