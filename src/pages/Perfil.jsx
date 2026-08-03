import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import aldeaFondo from '../assets/aldea-fondo.jpeg';
import { useAuth } from '../context/AuthContext';
import { getPerfil } from '../services/authService';
import { getNiveles, getActividades } from '../services/leccionService';
import { obtenerProgreso } from '../services/progresoService';
import { getInsignias } from '../services/insigniaService';

function TarjetaStat({ icono, etiqueta, valor, colorVar }) {
    return (
        <div className="text-center" style={{
            flex: '1 1 160px', padding: '22px', borderRadius: 'calc(22px * var(--perfil-radius-mult))',
            background: 'var(--card-bg)', border: `1px solid var(${colorVar})`,
        }}>
            <div style={{ fontSize: '26px', marginBottom: '6px' }}>{icono}</div>
            <p style={{ margin: 0, fontSize: '28px', fontWeight: 800, color: `var(${colorVar})` }}>{valor}</p>
            <p style={{ margin: '6px 0 0', fontSize: '13px', color: 'var(--body-muted)' }}>{etiqueta}</p>
        </div>
    );
}

function TarjetaInsignia({ insignia }) {
    const obtenida = insignia.obtenida;
    return (
        <div className="flex flex-col items-center text-center transition-all" style={{
            gap: '8px', padding: '22px', borderRadius: 'calc(22px * var(--perfil-radius-mult))',
            background: obtenida ? 'rgba(var(--gold-rgb),0.16)' : 'rgba(var(--locked-rgb),0.06)',
            border: obtenida ? '2px solid var(--gold)' : '2px solid rgba(var(--locked-rgb),0.15)',
            filter: obtenida ? 'none' : 'grayscale(70%)',
            opacity: obtenida ? 1 : 0.7,
        }}>
            <div style={{ fontSize: '40px' }}>{insignia.es_oculta && !obtenida ? '❓' : insignia.icono_url}</div>
            <p style={{ margin: 0, fontWeight: 800, fontSize: '15px', color: obtenida ? 'var(--heading)' : 'var(--locked-soft)' }}>
                {insignia.es_oculta && !obtenida ? 'Insignia secreta' : insignia.nombre}
            </p>
            <p style={{ margin: 0, fontSize: '13px', color: obtenida ? 'var(--body-muted)' : 'var(--locked-soft)' }}>
                {insignia.es_oculta && !obtenida ? '¿Qué tendrás que hacer para desbloquearla?' : insignia.descripcion}
            </p>
            {!obtenida && <span style={{ fontSize: '13px', color: 'var(--terracota)', fontWeight: 700 }}>🔒 Bloqueada</span>}
            {obtenida && insignia.fecha_obtenida && (
                <span style={{ fontSize: '13px', color: 'var(--success-dark)', fontWeight: 700 }}>
                    ✓ {new Date(insignia.fecha_obtenida).toLocaleDateString('es-MX')}
                </span>
            )}
        </div>
    );
}

// Mismas descripciones que se muestran al elegir el perfil en Registro.jsx,
// repetidas aquí para que el usuario vea que su elección sí tiene un efecto real.
const DESCRIPCION_PERFIL = {
    'Niño': 'Letras grandes y colores vibrantes',
    'Joven': 'Modo estándar de aprendizaje',
    'Adulto': 'Modo detallado con más información',
};

function Perfil() {
    const navigate = useNavigate();
    const { cerrarSesion } = useAuth();

    const [perfil, setPerfil] = useState(null);
    const [progreso, setProgreso] = useState([]);
    const [insignias, setInsignias] = useState([]);
    const [totalActividades, setTotalActividades] = useState(0);
    const [nivelesCompletados, setNivelesCompletados] = useState(0);
    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const cargarDatos = async () => {
            try {
                const [dataPerfil, dataProgreso, dataInsignias, dataNiveles] = await Promise.all([
                    getPerfil(),
                    obtenerProgreso(),
                    getInsignias(),
                    getNiveles(),
                ]);

                setPerfil(dataPerfil);
                setProgreso(dataProgreso);
                setInsignias(dataInsignias);

                const actividadesPorNivel = await Promise.all(
                    dataNiveles.map(nivel => getActividades(nivel.id))
                );

                const total = actividadesPorNivel.reduce((sum, acts) => sum + acts.length, 0);
                setTotalActividades(total);

                const completados = actividadesPorNivel.filter(acts =>
                    acts.length > 0 && acts.every(act =>
                        dataProgreso.some(p => p.actividad_id === act.id && p.completado)
                    )
                ).length;
                setNivelesCompletados(completados);
            } catch (err) {
                console.error('Error cargando perfil:', err);
                setError('No se pudo cargar tu perfil. Intenta de nuevo más tarde.');
            } finally {
                setCargando(false);
            }
        };
        cargarDatos();
    }, []);

    const handleLogout = () => {
        cerrarSesion();
        navigate('/');
    };

    const puntosTotales = progreso.reduce((sum, p) => sum + (p.mejor_puntaje || 0), 0);
    const actividadesCompletadas = progreso.filter(p => p.completado).length;
    const racha = perfil?.usuario?.racha_actual || 0;

    if (cargando) {
        return (
            <div className="min-h-screen flex items-center justify-center"
                style={{ background: 'linear-gradient(180deg, var(--bg-from) 0%, var(--bg-to) 100%)', fontFamily: "'Nunito', sans-serif" }}>
                <p style={{ fontSize: '18px', color: 'var(--terracota)', fontWeight: 700 }}>Cargando tu perfil…</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center"
                style={{ background: 'linear-gradient(180deg, var(--bg-from) 0%, var(--bg-to) 100%)', fontFamily: "'Nunito', sans-serif" }}>
                <div className="text-center mx-4" style={{
                    maxWidth: '440px', width: '100%', borderRadius: '30px', padding: '36px',
                    background: 'var(--card-bg)', border: '2px solid var(--terracota)', boxShadow: '0 18px 40px rgba(var(--terracota-rgb),0.18)',
                }}>
                    <p className="mb-5" style={{ color: 'var(--terracota)', fontWeight: 700, fontSize: '16px' }}>{error}</p>
                    <button onClick={() => navigate('/dashboard')} className="w-full transition-all" style={{
                        padding: '15px', borderRadius: '18px', border: 'none', fontWeight: 800, fontSize: '16px', cursor: 'pointer',
                        background: 'rgba(var(--terracota-rgb),0.08)', color: 'var(--heading)',
                    }}>
                        🗺️ Volver al mapa
                    </button>
                </div>
            </div>
        );
    }

    const nombre = perfil?.usuario?.nombre || 'Explorador';
    const inicial = nombre.charAt(0).toUpperCase();
    const tipoPerfil = perfil?.usuario?.tipo_perfil || 'Joven';
    const esNino = tipoPerfil === 'Niño';
    const esAdulto = tipoPerfil === 'Adulto';
    const promedioPorActividad = actividadesCompletadas > 0 ? Math.round(puntosTotales / actividadesCompletadas) : 0;

    return (
        <div className="min-h-screen relative overflow-hidden" style={{ fontFamily: "'Nunito', sans-serif" }}>
            <div className="absolute inset-0" style={{
                backgroundImage: `url(${aldeaFondo})`, backgroundSize: 'cover', backgroundPosition: 'center top',
                opacity: 'var(--perfil-bg-opacity)', filter: 'var(--perfil-bg-filter)',
            }} />
            <div className="absolute inset-0" style={{ background: 'linear-gradient(180deg, rgba(var(--bg-from-rgb),0.9), rgba(var(--bg-to-rgb),0.95))' }} />

            <div className="relative z-10">
                {/* Header */}
                <div className="flex justify-between items-center flex-wrap gap-3" style={{
                    padding: '22px 36px', background: 'rgba(var(--card-bg-rgb),0.75)', backdropFilter: 'blur(6px)',
                    borderBottom: '1px solid rgba(var(--perfil-accent-rgb),0.2)',
                }}>
                    <button onClick={() => navigate('/dashboard')} style={{
                        fontSize: '15px', padding: '11px 20px', borderRadius: 'calc(14px * var(--perfil-radius-mult))', border: 'none',
                        background: 'rgba(var(--heading-rgb),0.08)', color: 'var(--heading)', fontWeight: 700, cursor: 'pointer',
                    }}>
                        ← Mapa
                    </button>
                    <h1 className="truncate" style={{ margin: 0, fontFamily: 'var(--perfil-heading-font)', fontWeight: 800, fontSize: '22px', color: 'var(--heading)' }}>
                        Mi Perfil
                    </h1>
                    <button onClick={handleLogout} style={{
                        fontSize: '15px', padding: '11px 20px', borderRadius: '14px',
                        border: '1px solid rgba(var(--terracota-rgb),0.3)', background: 'rgba(var(--terracota-rgb),0.08)', color: 'var(--terracota)', fontWeight: 700, cursor: 'pointer',
                    }}>
                        Salir
                    </button>
                </div>

                {/* Contenido */}
                <div className="mx-auto" style={{ maxWidth: '800px', padding: '42px 22px 70px' }}>

                    {/* Tarjeta de identidad */}
                    <div className="flex flex-col items-center text-center mb-9">
                        <div className="flex items-center justify-center mb-4" style={{
                            width: '108px', height: '108px', borderRadius: '50%', fontWeight: 800, fontSize: '44px', color: 'white',
                            background: 'linear-gradient(135deg, var(--perfil-accent), var(--perfil-accent-2))',
                            border: '4px solid rgba(var(--perfil-accent-rgb),0.7)', boxShadow: '0 10px 26px rgba(var(--perfil-accent-rgb),0.3)',
                        }}>
                            {inicial}
                        </div>
                        <h2 style={{ margin: 0, fontFamily: 'var(--perfil-heading-font)', fontWeight: 800, fontSize: '28px', color: 'var(--heading)' }}>{nombre}</h2>
                        <p style={{ margin: '5px 0 0', fontSize: '15px', fontWeight: 700, color: 'var(--perfil-accent)' }}>
                            Perfil {tipoPerfil}
                        </p>
                        <p style={{ margin: '2px 0 0', fontSize: '13px', color: 'var(--body-muted)' }}>
                            {DESCRIPCION_PERFIL[tipoPerfil] || ''}
                        </p>
                        <p style={{ margin: '9px 0 0', fontSize: '15px', color: 'var(--terracota)' }}>
                            🔥 {racha} día{racha !== 1 ? 's' : ''} de racha
                        </p>
                        {esNino && (
                            <p style={{
                                margin: '14px 0 0', padding: '10px 18px', borderRadius: 'calc(16px * var(--perfil-radius-mult))',
                                fontSize: '15px', fontWeight: 700, color: 'var(--perfil-accent)',
                                background: 'rgba(var(--perfil-accent-rgb),0.12)',
                            }}>
                                ¡Sigue así, {nombre}! 🌟 Cada día aprendes algo nuevo.
                            </p>
                        )}
                    </div>

                    {/* Estadísticas */}
                    <div className="flex flex-wrap gap-4 mb-10">
                        <TarjetaStat icono="⭐" etiqueta="Puntos totales" valor={puntosTotales} colorVar="--terracota" />
                        <TarjetaStat icono="✅" etiqueta="Actividades" valor={`${actividadesCompletadas}/${totalActividades}`} colorVar="--success-dark" />
                        <TarjetaStat icono="🗺️" etiqueta="Niveles" valor={`${nivelesCompletados}/3`} colorVar="--info" />
                        {esAdulto && (
                            <TarjetaStat icono="📊" etiqueta="Promedio por actividad" valor={promedioPorActividad} colorVar="--purple-2" />
                        )}
                    </div>

                    {/* Vitrina de insignias */}
                    <div>
                        <h3 style={{ fontFamily: 'var(--perfil-heading-font)', fontWeight: 800, fontSize: '19px', margin: '0 0 18px', color: 'var(--heading)' }}>
                            🏅 Vitrina de insignias
                        </h3>
                        <div className="grid gap-4" style={{ gridTemplateColumns: esAdulto ? 'repeat(auto-fit, minmax(140px, 1fr))' : 'repeat(auto-fit, minmax(175px, 1fr))' }}>
                            {insignias.map(ins => (
                                <TarjetaInsignia key={ins.id} insignia={ins} />
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Perfil;
