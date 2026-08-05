import { useState, useEffect } from 'react';
import { getEstadisticas } from '../../services/adminService';

function TarjetaStat({ icono, etiqueta, valor }) {
    return (
        <div style={{
            flex: '1 1 180px', padding: '22px', borderRadius: '18px',
            background: 'var(--input-bg)', border: '1px solid rgba(var(--terracota-rgb),0.15)',
        }}>
            <div style={{ fontSize: '24px', marginBottom: '8px' }}>{icono}</div>
            <p style={{ margin: 0, fontSize: '28px', fontWeight: 800, color: 'var(--heading)' }}>{valor}</p>
            <p style={{ margin: '4px 0 0', fontSize: '13px', color: 'var(--body-muted)' }}>{etiqueta}</p>
        </div>
    );
}

function AdminDashboard() {
    const [stats, setStats] = useState(null);
    const [error, setError] = useState('');

    useEffect(() => {
        getEstadisticas()
            .then(setStats)
            .catch(() => setError('No se pudieron cargar las estadísticas.'));
    }, []);

    if (error) return <p style={{ color: 'var(--error)' }}>{error}</p>;
    if (!stats) return <p style={{ color: 'var(--body-muted)' }}>Cargando estadísticas…</p>;

    return (
        <div>
            <h2 style={{ fontFamily: "'Baloo 2', sans-serif", fontWeight: 800, fontSize: '24px', margin: '0 0 20px', color: 'var(--heading)' }}>
                Resumen general
            </h2>

            <div className="flex flex-wrap gap-4 mb-8">
                <TarjetaStat icono="👥" etiqueta="Usuarios totales" valor={stats.total_usuarios} />
                <TarjetaStat icono="🆕" etiqueta="Nuevos (30 días)" valor={stats.usuarios_ultimos_30_dias} />
                <TarjetaStat icono="✅" etiqueta="Actividades completadas" valor={stats.actividades_completadas} />
                <TarjetaStat icono="🔥" etiqueta="Racha promedio" valor={`${stats.promedio_racha} días`} />
            </div>

            <div className="flex flex-wrap gap-6">
                <div style={{ flex: '1 1 300px' }}>
                    <h3 style={{ fontSize: '16px', fontWeight: 800, color: 'var(--heading)', margin: '0 0 12px' }}>
                        Usuarios por tipo de perfil
                    </h3>
                    <div style={{ border: '1px solid rgba(var(--terracota-rgb),0.15)', borderRadius: '14px', overflow: 'hidden' }}>
                        {stats.usuarios_por_tipo_perfil.length === 0 && (
                            <p style={{ padding: '16px', color: 'var(--body-muted)', margin: 0 }}>Sin datos aún.</p>
                        )}
                        {stats.usuarios_por_tipo_perfil.map(row => (
                            <div key={row.tipo_perfil} className="flex justify-between" style={{
                                padding: '12px 16px', borderTop: '1px solid rgba(var(--terracota-rgb),0.1)',
                            }}>
                                <span style={{ color: 'var(--heading)', fontWeight: 700 }}>{row.tipo_perfil}</span>
                                <span style={{ color: 'var(--terracota)', fontWeight: 800 }}>{row.total}</span>
                            </div>
                        ))}
                    </div>
                </div>

                <div style={{ flex: '1 1 300px' }}>
                    <h3 style={{ fontSize: '16px', fontWeight: 800, color: 'var(--heading)', margin: '0 0 12px' }}>
                        Actividades más jugadas
                    </h3>
                    <div style={{ border: '1px solid rgba(var(--terracota-rgb),0.15)', borderRadius: '14px', overflow: 'hidden' }}>
                        {stats.actividades_mas_jugadas.length === 0 && (
                            <p style={{ padding: '16px', color: 'var(--body-muted)', margin: 0 }}>Sin datos aún.</p>
                        )}
                        {stats.actividades_mas_jugadas.map(row => (
                            <div key={row.nombre} className="flex justify-between" style={{
                                padding: '12px 16px', borderTop: '1px solid rgba(var(--terracota-rgb),0.1)',
                            }}>
                                <span style={{ color: 'var(--heading)', fontWeight: 700 }}>{row.nombre} <span style={{ color: 'var(--body-muted)', fontWeight: 400 }}>({row.tipo})</span></span>
                                <span style={{ color: 'var(--terracota)', fontWeight: 800 }}>{row.veces_jugada}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default AdminDashboard;
