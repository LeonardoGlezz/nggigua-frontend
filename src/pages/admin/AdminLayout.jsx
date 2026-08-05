import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

// Guarda de acceso + navegación del panel de administrador. El chequeo de
// rol aquí es solo de UI (esconder/mostrar); la seguridad real vive en el
// backend, en verificarAdmin — cada request al panel se revalida ahí sin
// importar lo que diga el frontend.
const SECCIONES = [
    { ruta: '/admin', etiqueta: 'Resumen', icono: '📊' },
    { ruta: '/admin/usuarios', etiqueta: 'Usuarios', icono: '👥' },
    { ruta: '/admin/contenido', etiqueta: 'Niveles y actividades', icono: '📚' },
];

function AdminLayout() {
    const { usuario, esAdmin, cargando, cerrarSesion } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    if (cargando) {
        return (
            <div className="min-h-screen flex items-center justify-center" style={{ fontFamily: "'Nunito', sans-serif" }}>
                <p style={{ color: 'var(--terracota)', fontWeight: 700, fontSize: '18px' }}>Cargando…</p>
            </div>
        );
    }

    if (!esAdmin) {
        return (
            <div className="min-h-screen flex items-center justify-center p-6" style={{ fontFamily: "'Nunito', sans-serif", background: 'var(--bg-from)' }}>
                <div className="text-center" style={{
                    maxWidth: '420px', padding: '36px', borderRadius: '24px',
                    background: 'var(--card-bg)', border: '2px solid var(--terracota)',
                }}>
                    <p style={{ fontSize: '40px', marginBottom: '12px' }}>🚫</p>
                    <p style={{ fontWeight: 800, fontSize: '18px', color: 'var(--heading)', marginBottom: '8px' }}>Acceso restringido</p>
                    <p style={{ color: 'var(--body-muted)', marginBottom: '20px' }}>Esta sección es solo para administradores.</p>
                    <button onClick={() => navigate('/dashboard')} style={{
                        padding: '13px 24px', borderRadius: '14px', border: 'none', fontWeight: 800, cursor: 'pointer',
                        background: 'linear-gradient(135deg, var(--terracota), var(--gold))', color: 'white',
                    }}>Volver a la app</button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen" style={{ fontFamily: "'Nunito', sans-serif", background: 'var(--bg-from)' }}>
            {/* Header */}
            <div className="flex justify-between items-center flex-wrap gap-3" style={{
                padding: '18px 32px', background: 'rgba(var(--card-bg-rgb),0.9)', backdropFilter: 'blur(6px)',
                borderBottom: '1px solid rgba(var(--terracota-rgb),0.2)',
            }}>
                <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center" style={{
                        width: '44px', height: '44px', borderRadius: '14px', fontSize: '22px',
                        background: 'linear-gradient(135deg, var(--terracota), var(--gold))',
                    }}>🛠️</div>
                    <div>
                        <h1 style={{ margin: 0, fontFamily: "'Baloo 2', sans-serif", fontWeight: 800, fontSize: '19px', color: 'var(--heading)' }}>
                            Panel de administrador
                        </h1>
                        <p style={{ margin: 0, fontSize: '13px', color: 'var(--body-muted)' }}>{usuario?.nombre || 'Admin'}</p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <button onClick={() => navigate('/dashboard')} style={{
                        fontSize: '14px', padding: '10px 18px', borderRadius: '12px', border: 'none', cursor: 'pointer',
                        background: 'rgba(var(--heading-rgb),0.08)', color: 'var(--heading)', fontWeight: 700,
                    }}>← Volver a la app</button>
                    <button onClick={() => { cerrarSesion(); navigate('/'); }} style={{
                        fontSize: '14px', padding: '10px 18px', borderRadius: '12px', cursor: 'pointer', fontWeight: 700,
                        border: '1px solid rgba(var(--terracota-rgb),0.3)', background: 'rgba(var(--terracota-rgb),0.08)', color: 'var(--terracota)',
                    }}>Salir</button>
                </div>
            </div>

            {/* Nav de secciones */}
            <div className="flex gap-2 flex-wrap" style={{ padding: '18px 32px 0' }}>
                {SECCIONES.map(sec => {
                    const activo = location.pathname === sec.ruta;
                    return (
                        <div key={sec.ruta} onClick={() => navigate(sec.ruta)}
                            className="cursor-pointer"
                            style={{
                                padding: '10px 20px', borderRadius: '14px 14px 0 0', fontWeight: 700, fontSize: '14.5px',
                                color: activo ? 'var(--terracota)' : 'var(--body-muted)',
                                background: activo ? 'var(--card-bg)' : 'transparent',
                                borderBottom: activo ? '3px solid var(--terracota)' : '3px solid transparent',
                            }}>
                            {sec.icono} {sec.etiqueta}
                        </div>
                    );
                })}
            </div>

            <div style={{ background: 'var(--card-bg)', minHeight: 'calc(100vh - 130px)', padding: '32px' }}>
                <div className="mx-auto" style={{ maxWidth: '1100px' }}>
                    <Outlet />
                </div>
            </div>
        </div>
    );
}

export default AdminLayout;
