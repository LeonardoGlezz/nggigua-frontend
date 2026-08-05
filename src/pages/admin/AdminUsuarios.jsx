import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { listarUsuarios, actualizarUsuario, eliminarUsuario } from '../../services/adminService';

const inputStyle = {
    boxSizing: 'border-box', width: '100%', padding: '10px 14px', borderRadius: '10px',
    border: '1px solid rgba(var(--terracota-rgb),0.25)', background: 'var(--card-bg)', color: 'var(--input-text)',
    fontFamily: "'Nunito', sans-serif", fontSize: '14px', outline: 'none',
};

function ModalEditar({ usuario, onCerrar, onGuardado }) {
    const [form, setForm] = useState({
        correo: usuario.correo,
        rol: usuario.rol,
        cuenta_activa: usuario.cuenta_activa,
        nombre: usuario.nombre || '',
        tipo_perfil: usuario.tipo_perfil || 'Joven',
    });
    const [guardando, setGuardando] = useState(false);
    const [error, setError] = useState('');

    const guardar = async () => {
        setGuardando(true);
        setError('');
        try {
            await actualizarUsuario(usuario.id, form);
            onGuardado();
        } catch (err) {
            setError(err.response?.data?.mensaje || 'No se pudo guardar.');
        } finally {
            setGuardando(false);
        }
    };

    return (
        <div className="fixed inset-0 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.5)', zIndex: 50 }}>
            <div style={{ width: '100%', maxWidth: '420px', background: 'var(--card-bg)', borderRadius: '20px', padding: '28px' }}>
                <h3 style={{ margin: '0 0 18px', fontFamily: "'Baloo 2', sans-serif", fontWeight: 800, fontSize: '19px', color: 'var(--heading)' }}>
                    Editar usuario
                </h3>

                <div className="flex flex-col gap-3">
                    <label style={{ fontSize: '13px', fontWeight: 700, color: 'var(--body-muted)' }}>Correo
                        <input style={{ ...inputStyle, marginTop: '4px' }} value={form.correo}
                            onChange={e => setForm(f => ({ ...f, correo: e.target.value }))} />
                    </label>
                    <label style={{ fontSize: '13px', fontWeight: 700, color: 'var(--body-muted)' }}>Nombre / alias
                        <input style={{ ...inputStyle, marginTop: '4px' }} value={form.nombre}
                            onChange={e => setForm(f => ({ ...f, nombre: e.target.value }))} />
                    </label>
                    <label style={{ fontSize: '13px', fontWeight: 700, color: 'var(--body-muted)' }}>Tipo de perfil
                        <select style={{ ...inputStyle, marginTop: '4px' }} value={form.tipo_perfil}
                            onChange={e => setForm(f => ({ ...f, tipo_perfil: e.target.value }))}>
                            <option value="Niño">Niño</option>
                            <option value="Joven">Joven</option>
                            <option value="Adulto">Adulto</option>
                        </select>
                    </label>
                    <label style={{ fontSize: '13px', fontWeight: 700, color: 'var(--body-muted)' }}>Rol
                        <select style={{ ...inputStyle, marginTop: '4px' }} value={form.rol}
                            onChange={e => setForm(f => ({ ...f, rol: e.target.value }))}>
                            <option value="USUARIO">USUARIO</option>
                            <option value="ADMIN">ADMIN</option>
                        </select>
                    </label>
                    <label className="flex items-center gap-2" style={{ fontSize: '13px', fontWeight: 700, color: 'var(--body-muted)' }}>
                        <input type="checkbox" checked={form.cuenta_activa}
                            onChange={e => setForm(f => ({ ...f, cuenta_activa: e.target.checked }))} />
                        Cuenta activa
                    </label>
                </div>

                {error && <p style={{ color: 'var(--error)', fontSize: '13px', marginTop: '12px' }}>{error}</p>}

                <div className="flex gap-3 mt-6">
                    <button onClick={onCerrar} style={{
                        flex: 1, padding: '11px', borderRadius: '12px', border: 'none', cursor: 'pointer', fontWeight: 700,
                        background: 'rgba(var(--heading-rgb),0.08)', color: 'var(--heading)',
                    }}>Cancelar</button>
                    <button onClick={guardar} disabled={guardando} style={{
                        flex: 1, padding: '11px', borderRadius: '12px', border: 'none', cursor: 'pointer', fontWeight: 800,
                        background: 'linear-gradient(135deg, var(--terracota), var(--gold))', color: 'white', opacity: guardando ? 0.7 : 1,
                    }}>{guardando ? 'Guardando...' : 'Guardar'}</button>
                </div>
            </div>
        </div>
    );
}

function AdminUsuarios() {
    const { usuario: sesionActual } = useAuth();
    const [usuarios, setUsuarios] = useState([]);
    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState('');
    const [editando, setEditando] = useState(null);
    const [busqueda, setBusqueda] = useState('');

    const cargar = async () => {
        try {
            const data = await listarUsuarios();
            setUsuarios(data);
        } catch {
            setError('No se pudieron cargar los usuarios.');
        } finally {
            setCargando(false);
        }
    };

    // La carga inicial se define localmente (aunque duplique la lógica de
    // arriba) porque así lo espera la regla de lint del proyecto para
    // efectos de "fetch on mount": una función definida e invocada dentro
    // del propio efecto. `cargar` de arriba se reutiliza desde botones/
    // modales (fuera de efectos), donde esa regla no aplica.
    useEffect(() => {
        const cargarInicial = async () => {
            try {
                const data = await listarUsuarios();
                setUsuarios(data);
            } catch {
                setError('No se pudieron cargar los usuarios.');
            } finally {
                setCargando(false);
            }
        };
        cargarInicial();
    }, []);

    const handleEliminar = async (u) => {
        if (!confirm(`¿Eliminar la cuenta de "${u.correo}"? Esta acción no se puede deshacer.`)) return;
        try {
            await eliminarUsuario(u.id);
            cargar();
        } catch (err) {
            alert(err.response?.data?.mensaje || 'No se pudo eliminar.');
        }
    };

    const usuariosFiltrados = usuarios.filter(u =>
        u.correo.toLowerCase().includes(busqueda.toLowerCase()) ||
        (u.nombre || '').toLowerCase().includes(busqueda.toLowerCase())
    );

    if (cargando) return <p style={{ color: 'var(--body-muted)' }}>Cargando usuarios…</p>;
    if (error) return <p style={{ color: 'var(--error)' }}>{error}</p>;

    return (
        <div>
            <div className="flex justify-between items-center flex-wrap gap-3 mb-5">
                <h2 style={{ fontFamily: "'Baloo 2', sans-serif", fontWeight: 800, fontSize: '24px', margin: 0, color: 'var(--heading)' }}>
                    Usuarios ({usuarios.length})
                </h2>
                <input placeholder="Buscar por correo o nombre..." value={busqueda}
                    onChange={e => setBusqueda(e.target.value)}
                    style={{ ...inputStyle, width: '260px' }} />
            </div>

            <div style={{ overflowX: 'auto', border: '1px solid rgba(var(--terracota-rgb),0.15)', borderRadius: '14px' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
                    <thead>
                        <tr style={{ background: 'rgba(var(--terracota-rgb),0.08)', textAlign: 'left' }}>
                            <th style={{ padding: '12px 16px' }}>Correo</th>
                            <th style={{ padding: '12px 16px' }}>Nombre</th>
                            <th style={{ padding: '12px 16px' }}>Perfil</th>
                            <th style={{ padding: '12px 16px' }}>Rol</th>
                            <th style={{ padding: '12px 16px' }}>Racha</th>
                            <th style={{ padding: '12px 16px' }}>Completadas</th>
                            <th style={{ padding: '12px 16px' }}>Activa</th>
                            <th style={{ padding: '12px 16px' }}></th>
                        </tr>
                    </thead>
                    <tbody>
                        {usuariosFiltrados.map(u => (
                            <tr key={u.id} style={{ borderTop: '1px solid rgba(var(--terracota-rgb),0.1)' }}>
                                <td style={{ padding: '12px 16px', color: 'var(--heading)', fontWeight: 700 }}>{u.correo}</td>
                                <td style={{ padding: '12px 16px', color: 'var(--body-muted)' }}>{u.nombre || '—'}</td>
                                <td style={{ padding: '12px 16px', color: 'var(--body-muted)' }}>{u.tipo_perfil || '—'}</td>
                                <td style={{ padding: '12px 16px' }}>
                                    <span style={{
                                        padding: '3px 10px', borderRadius: '999px', fontSize: '12px', fontWeight: 800,
                                        color: u.rol === 'ADMIN' ? 'var(--terracota)' : 'var(--body-muted)',
                                        background: u.rol === 'ADMIN' ? 'rgba(var(--terracota-rgb),0.15)' : 'rgba(var(--heading-rgb),0.06)',
                                    }}>{u.rol}</span>
                                </td>
                                <td style={{ padding: '12px 16px', color: 'var(--body-muted)' }}>🔥 {u.racha_actual ?? 0}</td>
                                <td style={{ padding: '12px 16px', color: 'var(--body-muted)' }}>{u.actividades_completadas ?? 0}</td>
                                <td style={{ padding: '12px 16px' }}>{u.cuenta_activa ? '✅' : '❌'}</td>
                                <td style={{ padding: '12px 16px' }}>
                                    <div className="flex gap-2">
                                        <button onClick={() => setEditando(u)} style={{
                                            padding: '7px 12px', borderRadius: '10px', border: 'none', cursor: 'pointer', fontSize: '13px', fontWeight: 700,
                                            background: 'rgba(var(--terracota-rgb),0.1)', color: 'var(--terracota)',
                                        }}>Editar</button>
                                        <button onClick={() => handleEliminar(u)} disabled={u.id === sesionActual?.cuenta_id}
                                            title={u.id === sesionActual?.cuenta_id ? 'No puedes eliminar tu propia cuenta' : ''}
                                            style={{
                                                padding: '7px 12px', borderRadius: '10px', border: 'none', cursor: 'pointer', fontSize: '13px', fontWeight: 700,
                                                background: 'rgba(220,53,69,0.1)', color: '#dc3545',
                                                opacity: u.id === sesionActual?.cuenta_id ? 0.4 : 1,
                                            }}>Eliminar</button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                        {usuariosFiltrados.length === 0 && (
                            <tr><td colSpan={8} style={{ padding: '20px', textAlign: 'center', color: 'var(--body-muted)' }}>Sin resultados.</td></tr>
                        )}
                    </tbody>
                </table>
            </div>

            {editando && (
                <ModalEditar usuario={editando} onCerrar={() => setEditando(null)}
                    onGuardado={() => { setEditando(null); cargar(); }} />
            )}
        </div>
    );
}

export default AdminUsuarios;
