import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { registro } from '../services/authService';

function Registro() {
    const navigate = useNavigate();
    const [paso, setPaso] = useState(1);
    const [error, setError] = useState('');
    const [cargando, setCargando] = useState(false);

    const [form, setForm] = useState({
        correo: '',
        contrasena: '',
        confirmar: '',
        nombre: '',
        tipo_perfil: '',
    });

    const actualizar = (campo, valor) => {
        setForm(prev => ({ ...prev, [campo]: valor }));
        setError('');
    };

    const validarPaso1 = () => {
        if (!form.correo || !form.contrasena || !form.confirmar) {
            setError('Completa todos los campos.');
            return false;
        }
        if (!form.correo.includes('@')) {
            setError('Ingresa un correo válido.');
            return false;
        }
        if (form.contrasena.length < 6) {
            setError('La contraseña debe tener al menos 6 caracteres.');
            return false;
        }
        if (form.contrasena !== form.confirmar) {
            setError('Las contraseñas no coinciden.');
            return false;
        }
        return true;
    };

    const handleRegistro = async () => {
        if (!form.nombre || !form.tipo_perfil) {
            setError('Completa tu perfil.');
            return;
        }
        setCargando(true);
        try {
            await registro(form.correo, form.contrasena, form.nombre, form.tipo_perfil);
            navigate('/');
        } catch (err) {
            setError('Este correo ya está registrado.');
        } finally {
            setCargando(false);
        }
    };

    const perfiles = [
        { valor: 'Niño', emoji: '🧒', desc: 'Letras grandes y colores vibrantes' },
        { valor: 'Joven', emoji: '🧑', desc: 'Modo estándar de aprendizaje' },
        { valor: 'Adulto', emoji: '👨', desc: 'Modo detallado con más información' },
    ];

    return (
        <div className="min-h-screen flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, #1B2A4A 0%, #0D1B2A 100%)' }}>

            <div className="max-w-md w-full mx-4 rounded-3xl p-8"
                style={{ background: 'rgba(13,27,42,0.95)', border: '2px solid #C4622D' }}>

                {/* Indicador de pasos */}
                <div className="flex items-center justify-center gap-3 mb-8">
                    {[1, 2].map(n => (
                        <div key={n} className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm transition-all"
                                style={{
                                    background: paso >= n
                                        ? 'linear-gradient(135deg, #C4622D, #E9C46A)'
                                        : 'rgba(255,255,255,0.1)',
                                    color: 'white',
                                }}>
                                {n}
                            </div>
                            {n < 2 && (
                                <div className="w-12 h-0.5"
                                    style={{ background: paso > 1 ? '#C4622D' : 'rgba(255,255,255,0.15)' }}/>
                            )}
                        </div>
                    ))}
                </div>

                {paso === 1 ? (
                    <>
                        <div className="text-center mb-6">
                            <div className="text-4xl mb-2">🌬️</div>
                            <h1 className="text-2xl font-bold" style={{ color: '#E9C46A' }}>
                                Crea tu cuenta
                            </h1>
                            <p className="text-sm mt-1" style={{ color: '#C4622D' }}>
                                Paso 1 de 2 — Acceso seguro
                            </p>
                        </div>

                        <div className="flex flex-col gap-4">
                            <input
                                type="email"
                                placeholder="Correo electrónico"
                                value={form.correo}
                                onChange={e => actualizar('correo', e.target.value)}
                                className="w-full p-4 rounded-xl text-white placeholder-gray-500 outline-none"
                                style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(233,196,106,0.2)' }}
                            />
                            <input
                                type="password"
                                placeholder="Contraseña (mín. 6 caracteres)"
                                value={form.contrasena}
                                onChange={e => actualizar('contrasena', e.target.value)}
                                className="w-full p-4 rounded-xl text-white placeholder-gray-500 outline-none"
                                style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(233,196,106,0.2)' }}
                            />
                            <input
                                type="password"
                                placeholder="Confirmar contraseña"
                                value={form.confirmar}
                                onChange={e => actualizar('confirmar', e.target.value)}
                                className="w-full p-4 rounded-xl text-white placeholder-gray-500 outline-none"
                                style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(233,196,106,0.2)' }}
                            />
                        </div>

                        {error && <p className="text-sm mt-3 text-center" style={{ color: '#C4622D' }}>{error}</p>}

                        <button
                            onClick={() => validarPaso1() && setPaso(2)}
                            className="w-full py-4 rounded-2xl font-bold text-lg mt-6 transition-all hover:scale-105"
                            style={{ background: 'linear-gradient(135deg, #C4622D, #E9C46A)', color: 'white' }}>
                            Continuar →
                        </button>

                        <p className="text-center text-sm mt-4" style={{ color: 'rgba(255,255,255,0.3)' }}>
                            ¿Ya tienes cuenta?{' '}
                            <span className="cursor-pointer hover:opacity-80"
                                style={{ color: '#E9C46A' }}
                                onClick={() => navigate('/')}>
                                Inicia sesión
                            </span>
                        </p>
                    </>
                ) : (
                    <>
                        <div className="text-center mb-6">
                            <div className="text-4xl mb-2">👤</div>
                            <h1 className="text-2xl font-bold" style={{ color: '#E9C46A' }}>
                                Tu perfil
                            </h1>
                            <p className="text-sm mt-1" style={{ color: '#C4622D' }}>
                                Paso 2 de 2 — ¿Quién eres tú?
                            </p>
                        </div>

                        <input
                            type="text"
                            placeholder="Tu nombre o alias"
                            value={form.nombre}
                            onChange={e => actualizar('nombre', e.target.value)}
                            className="w-full p-4 rounded-xl text-white placeholder-gray-500 outline-none mb-5"
                            style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(233,196,106,0.2)' }}
                        />

                        <p className="text-sm font-bold mb-3" style={{ color: '#E9C46A' }}>
                            ¿Cómo quieres aprender?
                        </p>

                        <div className="flex flex-col gap-3 mb-6">
                            {perfiles.map(p => (
                                <div key={p.valor}
                                    onClick={() => actualizar('tipo_perfil', p.valor)}
                                    className="flex items-center gap-4 p-4 rounded-2xl cursor-pointer transition-all hover:scale-102"
                                    style={{
                                        background: form.tipo_perfil === p.valor
                                            ? 'rgba(196,98,45,0.25)'
                                            : 'rgba(255,255,255,0.05)',
                                        border: form.tipo_perfil === p.valor
                                            ? '2px solid #C4622D'
                                            : '2px solid rgba(255,255,255,0.08)',
                                    }}>
                                    <span style={{ fontSize: '2rem' }}>{p.emoji}</span>
                                    <div>
                                        <p className="font-bold text-white">{p.valor}</p>
                                        <p className="text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>
                                            {p.desc}
                                        </p>
                                    </div>
                                    {form.tipo_perfil === p.valor && (
                                        <span className="ml-auto text-lg">✅</span>
                                    )}
                                </div>
                            ))}
                        </div>

                        {error && <p className="text-sm mb-3 text-center" style={{ color: '#C4622D' }}>{error}</p>}

                        <button
                            onClick={handleRegistro}
                            disabled={cargando}
                            className="w-full py-4 rounded-2xl font-bold text-lg transition-all hover:scale-105"
                            style={{
                                background: 'linear-gradient(135deg, #2D6A4F, #52B788)',
                                color: 'white',
                                opacity: cargando ? 0.7 : 1,
                            }}>
                            {cargando ? 'Creando cuenta...' : '¡Comenzar aventura! 🌬️'}
                        </button>

                        <button onClick={() => setPaso(1)}
                            className="w-full py-2 mt-3 text-sm transition-all hover:opacity-80"
                            style={{ color: 'rgba(255,255,255,0.3)' }}>
                            ← Regresar
                        </button>
                    </>
                )}
            </div>
        </div>
    );
}

export default Registro;