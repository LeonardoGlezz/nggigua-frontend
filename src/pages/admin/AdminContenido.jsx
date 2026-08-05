import { useState, useEffect } from 'react';
import {
    listarNivelesAdmin, crearNivel, actualizarNivel, eliminarNivel,
    listarActividadesAdmin, crearActividad, actualizarActividad, eliminarActividad,
    listarItems, crearItem, actualizarItem, eliminarItem,
} from '../../services/adminService';

const inputStyle = {
    boxSizing: 'border-box', width: '100%', padding: '10px 14px', borderRadius: '10px',
    border: '1px solid rgba(var(--terracota-rgb),0.25)', background: 'var(--card-bg)', color: 'var(--input-text)',
    fontFamily: "'Nunito', sans-serif", fontSize: '14px', outline: 'none',
};

const TIPOS_ACTIVIDAD = ['memorama', 'ahorcado', 'atrapa_palabra', 'empareja', 'ruleta'];

function Modal({ titulo, children, onCerrar }) {
    return (
        <div className="fixed inset-0 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.5)', zIndex: 50 }}>
            <div style={{ width: '100%', maxWidth: '480px', maxHeight: '85vh', overflowY: 'auto', background: 'var(--card-bg)', borderRadius: '20px', padding: '28px' }}>
                <h3 style={{ margin: '0 0 18px', fontFamily: "'Baloo 2', sans-serif", fontWeight: 800, fontSize: '19px', color: 'var(--heading)' }}>
                    {titulo}
                </h3>
                {children}
                <button onClick={onCerrar} style={{
                    marginTop: '16px', width: '100%', padding: '10px', borderRadius: '12px', border: 'none', cursor: 'pointer', fontWeight: 700,
                    background: 'rgba(var(--heading-rgb),0.08)', color: 'var(--heading)',
                }}>Cerrar</button>
            </div>
        </div>
    );
}

// ===================== Niveles =====================

function PanelNiveles({ niveles, nivelSeleccionado, onSeleccionar, onCambio }) {
    const [modal, setModal] = useState(null); // 'crear' | nivel-a-editar | null
    const [form, setForm] = useState({ nombre: '', descripcion: '', orden: niveles.length + 1 });
    const [error, setError] = useState('');

    const abrirCrear = () => {
        setForm({ nombre: '', descripcion: '', orden: niveles.length + 1 });
        setModal('crear');
    };
    const abrirEditar = (n) => {
        setForm({ nombre: n.nombre, descripcion: n.descripcion || '', orden: n.orden });
        setModal(n);
    };

    const guardar = async () => {
        setError('');
        try {
            if (modal === 'crear') await crearNivel(form);
            else await actualizarNivel(modal.id, form);
            setModal(null);
            onCambio();
        } catch (err) {
            setError(err.response?.data?.mensaje || 'No se pudo guardar.');
        }
    };

    const eliminar = async (n) => {
        if (!confirm(`¿Eliminar el nivel "${n.nombre}"?`)) return;
        try {
            await eliminarNivel(n.id);
            onCambio();
        } catch (err) {
            alert(err.response?.data?.mensaje || 'No se pudo eliminar.');
        }
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-3">
                <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 800, color: 'var(--heading)' }}>Niveles</h3>
                <button onClick={abrirCrear} style={{
                    fontSize: '13px', padding: '6px 12px', borderRadius: '10px', border: 'none', cursor: 'pointer', fontWeight: 700,
                    background: 'rgba(var(--terracota-rgb),0.1)', color: 'var(--terracota)',
                }}>+ Nuevo</button>
            </div>
            <div className="flex flex-col gap-2">
                {niveles.map(n => (
                    <div key={n.id} onClick={() => onSeleccionar(n)}
                        className="cursor-pointer"
                        style={{
                            padding: '12px 14px', borderRadius: '12px',
                            background: nivelSeleccionado?.id === n.id ? 'rgba(var(--terracota-rgb),0.12)' : 'var(--input-bg)',
                            border: nivelSeleccionado?.id === n.id ? '2px solid var(--terracota)' : '2px solid transparent',
                        }}>
                        <div className="flex justify-between items-start">
                            <div>
                                <p style={{ margin: 0, fontWeight: 800, fontSize: '14px', color: 'var(--heading)' }}>{n.orden}. {n.nombre}</p>
                                {n.descripcion && <p style={{ margin: '2px 0 0', fontSize: '12px', color: 'var(--body-muted)' }}>{n.descripcion}</p>}
                            </div>
                            <div className="flex gap-1 flex-shrink-0">
                                <span onClick={(e) => { e.stopPropagation(); abrirEditar(n); }} style={{ cursor: 'pointer', fontSize: '13px' }}>✏️</span>
                                <span onClick={(e) => { e.stopPropagation(); eliminar(n); }} style={{ cursor: 'pointer', fontSize: '13px' }}>🗑️</span>
                            </div>
                        </div>
                    </div>
                ))}
                {niveles.length === 0 && <p style={{ color: 'var(--body-muted)', fontSize: '13px' }}>Sin niveles aún.</p>}
            </div>

            {modal && (
                <Modal titulo={modal === 'crear' ? 'Nuevo nivel' : 'Editar nivel'} onCerrar={() => setModal(null)}>
                    <div className="flex flex-col gap-3">
                        <input placeholder="Nombre" style={inputStyle} value={form.nombre}
                            onChange={e => setForm(f => ({ ...f, nombre: e.target.value }))} />
                        <input placeholder="Descripción" style={inputStyle} value={form.descripcion}
                            onChange={e => setForm(f => ({ ...f, descripcion: e.target.value }))} />
                        <input type="number" placeholder="Orden" style={inputStyle} value={form.orden}
                            onChange={e => setForm(f => ({ ...f, orden: Number(e.target.value) }))} />
                        {error && <p style={{ color: 'var(--error)', fontSize: '13px' }}>{error}</p>}
                        <button onClick={guardar} style={{
                            padding: '11px', borderRadius: '12px', border: 'none', cursor: 'pointer', fontWeight: 800,
                            background: 'linear-gradient(135deg, var(--terracota), var(--gold))', color: 'white',
                        }}>Guardar</button>
                    </div>
                </Modal>
            )}
        </div>
    );
}

// ===================== Actividades =====================

function PanelActividades({ nivel, actividades, actividadSeleccionada, onSeleccionar, onCambio }) {
    const [modal, setModal] = useState(null);
    const [form, setForm] = useState({ nombre: '', descripcion: '', tipo: TIPOS_ACTIVIDAD[0], orden: 1, icono_url: '' });
    const [error, setError] = useState('');

    const abrirCrear = () => {
        setForm({ nombre: '', descripcion: '', tipo: TIPOS_ACTIVIDAD[0], orden: actividades.length + 1, icono_url: '' });
        setModal('crear');
    };
    const abrirEditar = (a) => {
        setForm({ nombre: a.nombre, descripcion: a.descripcion || '', tipo: a.tipo, orden: a.orden, icono_url: a.icono_url || '' });
        setModal(a);
    };

    const guardar = async () => {
        setError('');
        try {
            if (modal === 'crear') await crearActividad({ ...form, nivel_id: nivel.id });
            else await actualizarActividad(modal.id, form);
            setModal(null);
            onCambio();
        } catch (err) {
            setError(err.response?.data?.mensaje || 'No se pudo guardar.');
        }
    };

    const eliminar = async (a) => {
        if (!confirm(`¿Eliminar la actividad "${a.nombre}"? También se borrará su progreso e ítems.`)) return;
        try {
            await eliminarActividad(a.id);
            onCambio();
        } catch (err) {
            alert(err.response?.data?.mensaje || 'No se pudo eliminar.');
        }
    };

    if (!nivel) return <p style={{ color: 'var(--body-muted)', fontSize: '13px' }}>Selecciona un nivel.</p>;

    return (
        <div>
            <div className="flex justify-between items-center mb-3">
                <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 800, color: 'var(--heading)' }}>Actividades de "{nivel.nombre}"</h3>
                <button onClick={abrirCrear} style={{
                    fontSize: '13px', padding: '6px 12px', borderRadius: '10px', border: 'none', cursor: 'pointer', fontWeight: 700,
                    background: 'rgba(var(--terracota-rgb),0.1)', color: 'var(--terracota)',
                }}>+ Nueva</button>
            </div>
            <div className="flex flex-col gap-2">
                {actividades.map(a => (
                    <div key={a.id} onClick={() => onSeleccionar(a)}
                        className="cursor-pointer"
                        style={{
                            padding: '12px 14px', borderRadius: '12px',
                            background: actividadSeleccionada?.id === a.id ? 'rgba(var(--terracota-rgb),0.12)' : 'var(--input-bg)',
                            border: actividadSeleccionada?.id === a.id ? '2px solid var(--terracota)' : '2px solid transparent',
                        }}>
                        <div className="flex justify-between items-start">
                            <div>
                                <p style={{ margin: 0, fontWeight: 800, fontSize: '14px', color: 'var(--heading)' }}>{a.orden}. {a.nombre}</p>
                                <p style={{ margin: '2px 0 0', fontSize: '12px', color: 'var(--body-muted)' }}>{a.tipo}</p>
                            </div>
                            <div className="flex gap-1 flex-shrink-0">
                                <span onClick={(e) => { e.stopPropagation(); abrirEditar(a); }} style={{ cursor: 'pointer', fontSize: '13px' }}>✏️</span>
                                <span onClick={(e) => { e.stopPropagation(); eliminar(a); }} style={{ cursor: 'pointer', fontSize: '13px' }}>🗑️</span>
                            </div>
                        </div>
                    </div>
                ))}
                {actividades.length === 0 && <p style={{ color: 'var(--body-muted)', fontSize: '13px' }}>Sin actividades en este nivel.</p>}
            </div>

            {modal && (
                <Modal titulo={modal === 'crear' ? 'Nueva actividad' : 'Editar actividad'} onCerrar={() => setModal(null)}>
                    <div className="flex flex-col gap-3">
                        <input placeholder="Nombre" style={inputStyle} value={form.nombre}
                            onChange={e => setForm(f => ({ ...f, nombre: e.target.value }))} />
                        <input placeholder="Descripción" style={inputStyle} value={form.descripcion}
                            onChange={e => setForm(f => ({ ...f, descripcion: e.target.value }))} />
                        <select style={inputStyle} value={form.tipo} onChange={e => setForm(f => ({ ...f, tipo: e.target.value }))}>
                            {TIPOS_ACTIVIDAD.map(t => <option key={t} value={t}>{t}</option>)}
                        </select>
                        <input type="number" placeholder="Orden" style={inputStyle} value={form.orden}
                            onChange={e => setForm(f => ({ ...f, orden: Number(e.target.value) }))} />
                        <input placeholder="Icono (emoji o URL, opcional)" style={inputStyle} value={form.icono_url}
                            onChange={e => setForm(f => ({ ...f, icono_url: e.target.value }))} />
                        {error && <p style={{ color: 'var(--error)', fontSize: '13px' }}>{error}</p>}
                        <button onClick={guardar} style={{
                            padding: '11px', borderRadius: '12px', border: 'none', cursor: 'pointer', fontWeight: 800,
                            background: 'linear-gradient(135deg, var(--terracota), var(--gold))', color: 'white',
                        }}>Guardar</button>
                    </div>
                </Modal>
            )}
        </div>
    );
}

// ===================== Items de actividad =====================
// contenido es JSONB con forma distinta según el tipo de juego, así que se
// edita como texto JSON crudo — es lo más flexible sin construir 5
// formularios distintos (uno por minijuego).

function PanelItems({ actividad, items, onCambio }) {
    const [modal, setModal] = useState(null);
    const [form, setForm] = useState({ orden: 1, contenidoTexto: '{}', respuesta_correcta: '', puntos_base: 10 });
    const [error, setError] = useState('');

    const abrirCrear = () => {
        setForm({ orden: items.length + 1, contenidoTexto: '{}', respuesta_correcta: '', puntos_base: 10 });
        setModal('crear');
    };
    const abrirEditar = (it) => {
        setForm({
            orden: it.orden,
            contenidoTexto: JSON.stringify(it.contenido, null, 2),
            respuesta_correcta: it.respuesta_correcta || '',
            puntos_base: it.puntos_base,
        });
        setModal(it);
    };

    const guardar = async () => {
        setError('');
        let contenido;
        try {
            contenido = JSON.parse(form.contenidoTexto);
        } catch {
            setError('El contenido debe ser JSON válido.');
            return;
        }
        const payload = { orden: form.orden, contenido, respuesta_correcta: form.respuesta_correcta || null, puntos_base: form.puntos_base };
        try {
            if (modal === 'crear') await crearItem({ ...payload, actividad_id: actividad.id });
            else await actualizarItem(modal.id, payload);
            setModal(null);
            onCambio();
        } catch (err) {
            setError(err.response?.data?.mensaje || 'No se pudo guardar.');
        }
    };

    const eliminar = async (it) => {
        if (!confirm(`¿Eliminar el ítem #${it.orden}?`)) return;
        try {
            await eliminarItem(it.id);
            onCambio();
        } catch (err) {
            alert(err.response?.data?.mensaje || 'No se pudo eliminar.');
        }
    };

    if (!actividad) return <p style={{ color: 'var(--body-muted)', fontSize: '13px' }}>Selecciona una actividad.</p>;

    return (
        <div>
            <div className="flex justify-between items-center mb-3">
                <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 800, color: 'var(--heading)' }}>Ítems de "{actividad.nombre}"</h3>
                <button onClick={abrirCrear} style={{
                    fontSize: '13px', padding: '6px 12px', borderRadius: '10px', border: 'none', cursor: 'pointer', fontWeight: 700,
                    background: 'rgba(var(--terracota-rgb),0.1)', color: 'var(--terracota)',
                }}>+ Nuevo</button>
            </div>
            <div className="flex flex-col gap-2">
                {items.map(it => (
                    <div key={it.id} style={{ padding: '12px 14px', borderRadius: '12px', background: 'var(--input-bg)' }}>
                        <div className="flex justify-between items-start">
                            <div style={{ minWidth: 0 }}>
                                <p style={{ margin: 0, fontWeight: 800, fontSize: '14px', color: 'var(--heading)' }}>#{it.orden} · {it.puntos_base} pts</p>
                                <p style={{ margin: '2px 0 0', fontSize: '12px', color: 'var(--body-muted)', wordBreak: 'break-all' }}>
                                    {JSON.stringify(it.contenido).slice(0, 90)}{JSON.stringify(it.contenido).length > 90 ? '…' : ''}
                                </p>
                            </div>
                            <div className="flex gap-1 flex-shrink-0">
                                <span onClick={() => abrirEditar(it)} style={{ cursor: 'pointer', fontSize: '13px' }}>✏️</span>
                                <span onClick={() => eliminar(it)} style={{ cursor: 'pointer', fontSize: '13px' }}>🗑️</span>
                            </div>
                        </div>
                    </div>
                ))}
                {items.length === 0 && <p style={{ color: 'var(--body-muted)', fontSize: '13px' }}>Sin ítems en esta actividad.</p>}
            </div>

            {modal && (
                <Modal titulo={modal === 'crear' ? 'Nuevo ítem' : 'Editar ítem'} onCerrar={() => setModal(null)}>
                    <div className="flex flex-col gap-3">
                        <label style={{ fontSize: '12px', fontWeight: 700, color: 'var(--body-muted)' }}>Orden
                            <input type="number" style={{ ...inputStyle, marginTop: '4px' }} value={form.orden}
                                onChange={e => setForm(f => ({ ...f, orden: Number(e.target.value) }))} />
                        </label>
                        <label style={{ fontSize: '12px', fontWeight: 700, color: 'var(--body-muted)' }}>Contenido (JSON)
                            <textarea rows={7} style={{ ...inputStyle, marginTop: '4px', fontFamily: 'monospace', fontSize: '12.5px' }}
                                value={form.contenidoTexto}
                                onChange={e => setForm(f => ({ ...f, contenidoTexto: e.target.value }))} />
                        </label>
                        <label style={{ fontSize: '12px', fontWeight: 700, color: 'var(--body-muted)' }}>Respuesta correcta (opcional)
                            <input style={{ ...inputStyle, marginTop: '4px' }} value={form.respuesta_correcta}
                                onChange={e => setForm(f => ({ ...f, respuesta_correcta: e.target.value }))} />
                        </label>
                        <label style={{ fontSize: '12px', fontWeight: 700, color: 'var(--body-muted)' }}>Puntos base
                            <input type="number" style={{ ...inputStyle, marginTop: '4px' }} value={form.puntos_base}
                                onChange={e => setForm(f => ({ ...f, puntos_base: Number(e.target.value) }))} />
                        </label>
                        {error && <p style={{ color: 'var(--error)', fontSize: '13px' }}>{error}</p>}
                        <button onClick={guardar} style={{
                            padding: '11px', borderRadius: '12px', border: 'none', cursor: 'pointer', fontWeight: 800,
                            background: 'linear-gradient(135deg, var(--terracota), var(--gold))', color: 'white',
                        }}>Guardar</button>
                    </div>
                </Modal>
            )}
        </div>
    );
}

function AdminContenido() {
    const [niveles, setNiveles] = useState([]);
    const [nivelSeleccionado, setNivelSeleccionado] = useState(null);
    const [actividades, setActividades] = useState([]);
    const [actividadSeleccionada, setActividadSeleccionada] = useState(null);
    const [items, setItems] = useState([]);
    const [cargando, setCargando] = useState(true);

    const cargarNiveles = async () => {
        const data = await listarNivelesAdmin();
        setNiveles(data);
        setCargando(false);
        return data;
    };

    const cargarActividades = async (nivel) => {
        if (!nivel) return;
        const data = await listarActividadesAdmin(nivel.id);
        setActividades(data);
    };

    const cargarItems = async (actividad) => {
        if (!actividad) return;
        const data = await listarItems(actividad.id);
        setItems(data);
    };

    useEffect(() => { cargarNiveles(); }, []);
    useEffect(() => {
        setActividadSeleccionada(null);
        setItems([]);
        if (nivelSeleccionado) cargarActividades(nivelSeleccionado);
        else setActividades([]);
    }, [nivelSeleccionado]);
    useEffect(() => {
        if (actividadSeleccionada) cargarItems(actividadSeleccionada);
        else setItems([]);
    }, [actividadSeleccionada]);

    if (cargando) return <p style={{ color: 'var(--body-muted)' }}>Cargando…</p>;

    return (
        <div>
            <h2 style={{ fontFamily: "'Baloo 2', sans-serif", fontWeight: 800, fontSize: '24px', margin: '0 0 20px', color: 'var(--heading)' }}>
                Niveles y actividades
            </h2>
            <div className="grid gap-6" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))' }}>
                <PanelNiveles niveles={niveles} nivelSeleccionado={nivelSeleccionado}
                    onSeleccionar={setNivelSeleccionado} onCambio={async () => {
                        const data = await cargarNiveles();
                        if (nivelSeleccionado) {
                            const actualizado = data.find(n => n.id === nivelSeleccionado.id);
                            setNivelSeleccionado(actualizado || null);
                        }
                    }} />
                <PanelActividades nivel={nivelSeleccionado} actividades={actividades} actividadSeleccionada={actividadSeleccionada}
                    onSeleccionar={setActividadSeleccionada} onCambio={() => cargarActividades(nivelSeleccionado)} />
                <PanelItems actividad={actividadSeleccionada} items={items}
                    onCambio={() => cargarItems(actividadSeleccionada)} />
            </div>
        </div>
    );
}

export default AdminContenido;
