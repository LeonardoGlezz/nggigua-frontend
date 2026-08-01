import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { registro } from '../services/authService';
import aldeaFondo from '../assets/aldea-fondo.jpeg';
import exploradorNeutral from '../assets/ahorcado/explorador-feliz.png';
import exploradorCelebrando from '../assets/ahorcado/explorador-celebrando.png';

const PREVIEWS = {
    Niño: { icon: '🧒', text: 'Modo Niño: letras grandes, colores vivos y mensajes simples.', color: '#E9C46A' },
    Joven: { icon: '🧑', text: 'Modo Joven: experiencia estándar, ritmo ágil.', color: '#52B788' },
    Adulto: { icon: '👨', text: 'Modo Adulto: interfaz clara con más contexto y detalle.', color: '#4A90D9' },
};

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
            setError(err.response?.data?.mensaje || 'No se pudo completar el registro. Intenta de nuevo.');
        } finally {
            setCargando(false);
        }
    };

    const perfiles = [
        { valor: 'Niño', emoji: '🧒', desc: 'Letras grandes y colores vibrantes' },
        { valor: 'Joven', emoji: '🧑', desc: 'Modo estándar de aprendizaje' },
        { valor: 'Adulto', emoji: '👨', desc: 'Modo detallado con más información' },
    ];

    const inputStyle = {
        width: '100%', boxSizing: 'border-box', padding: '17px 20px', borderRadius: '18px',
        border: '2px solid rgba(var(--terracota-rgb),0.22)', background: 'var(--input-bg)', color: 'var(--input-text)',
        fontFamily: "'Nunito', sans-serif", fontSize: '17px', outline: 'none',
    };
    const focusHandlers = {
        onFocus: (e) => { e.target.style.borderColor = 'var(--terracota)'; e.target.style.boxShadow = '0 0 0 4px rgba(var(--terracota-rgb),0.15)'; },
        onBlur: (e) => { e.target.style.borderColor = 'rgba(var(--terracota-rgb),0.22)'; e.target.style.boxShadow = 'none'; },
    };

    const preview = PREVIEWS[form.tipo_perfil] || PREVIEWS['Joven'];

    return (
        <div className="min-h-screen flex items-center justify-center p-5"
            style={{ background: 'linear-gradient(180deg, var(--bg-from) 0%, var(--bg-to) 100%)', fontFamily: "'Nunito', sans-serif" }}>

            <div className="flex flex-wrap w-full rounded-[36px] overflow-hidden"
                style={{ maxWidth: '1040px', boxShadow: '0 24px 60px rgba(var(--shadow-rgb),0.18)', animation: 'popIn 0.5s ease both' }}>

                {/* Columna imagen */}
                <div className="relative"
                    style={{
                        flex: '1 1 380px', minHeight: '600px',
                        backgroundImage: `url(${aldeaFondo})`, backgroundSize: 'cover', backgroundPosition: 'center',
                    }}>
                    <div className="absolute inset-0"
                        style={{ background: 'linear-gradient(to top, rgba(27,42,74,0.78), rgba(27,42,74,0.05) 55%)' }} />

                    {paso === 1 ? (
                        <img src={exploradorNeutral} alt="explorador" className="absolute"
                            style={{ left: '26px', bottom: '22px', width: '135px', animation: 'floatMascot 4s ease-in-out infinite', filter: 'drop-shadow(0 10px 14px rgba(0,0,0,0.35))' }} />
                    ) : (
                        <img src={exploradorCelebrando} alt="explorador celebrando" className="absolute"
                            style={{ left: '18px', bottom: '16px', width: '168px', animation: 'floatMascot 3.5s ease-in-out infinite', filter: 'drop-shadow(0 10px 14px rgba(0,0,0,0.35))' }} />
                    )}

                    <div className="absolute left-7 top-7 right-7" style={{ color: 'var(--on-photo)' }}>
                        <p style={{ fontSize: '15px', margin: 0, opacity: 0.85 }}>Únete al pueblo que mantiene viva su lengua</p>
                    </div>
                </div>

                {/* Columna formulario */}
                <div className="flex flex-col justify-center"
                    style={{ flex: '1 1 420px', background: 'var(--card-bg)', padding: '52px 48px' }}>

                    {/* Indicador de pasos */}
                    <div className="flex items-center justify-center gap-3.5 mb-8">
                        <div className="flex items-center justify-center font-bold"
                            style={{
                                width: '38px', height: '38px', borderRadius: '50%', fontSize: '16px', color: 'white',
                                fontFamily: "'Nunito', sans-serif",
                                background: paso >= 1 ? 'linear-gradient(135deg, var(--terracota), var(--gold))' : 'var(--dot-inactive)',
                                ...(paso < 1 ? { color: 'var(--locked)' } : {}),
                            }}>1</div>
                        <div style={{ width: '44px', height: '2px', background: paso >= 2 ? 'var(--gold)' : 'var(--dot-inactive)' }} />
                        <div className="flex items-center justify-center font-bold"
                            style={{
                                width: '38px', height: '38px', borderRadius: '50%', fontSize: '16px',
                                fontFamily: "'Nunito', sans-serif",
                                background: paso >= 2 ? 'linear-gradient(135deg, var(--terracota), var(--gold))' : 'var(--dot-inactive)',
                                color: paso >= 2 ? 'white' : 'var(--locked)',
                            }}>2</div>
                    </div>

                    {paso === 1 ? (
                        <div>
                            <h1 style={{ fontFamily: "'Baloo 2', sans-serif", fontWeight: 800, fontSize: '30px', margin: '0 0 6px', color: 'var(--heading)' }}>
                                Crea tu cuenta
                            </h1>
                            <p style={{ fontSize: '17px', margin: '0 0 24px', color: 'var(--body-muted)' }}>
                                Paso 1 de 2 — Acceso seguro
                            </p>

                            <div className="flex flex-col gap-4">
                                <input type="email" placeholder="Correo electrónico" value={form.correo}
                                    onChange={e => actualizar('correo', e.target.value)} style={inputStyle} {...focusHandlers} />
                                <input type="password" placeholder="Contraseña (mín. 6 caracteres)" value={form.contrasena}
                                    onChange={e => actualizar('contrasena', e.target.value)} style={inputStyle} {...focusHandlers} />
                                <input type="password" placeholder="Confirmar contraseña" value={form.confirmar}
                                    onChange={e => actualizar('confirmar', e.target.value)} style={inputStyle} {...focusHandlers} />
                            </div>

                            {error && <p className="text-center mt-3.5" style={{ fontSize: '15px', color: 'var(--error)', fontWeight: 700 }}>{error}</p>}

                            <button
                                onClick={() => validarPaso1() && setPaso(2)}
                                className="w-full mt-6"
                                style={{
                                    padding: '19px', border: 'none', borderRadius: '20px',
                                    fontFamily: "'Baloo 2', sans-serif", fontWeight: 800, fontSize: '20px', color: 'white',
                                    cursor: 'pointer', background: 'linear-gradient(135deg, var(--terracota), var(--gold))',
                                    boxShadow: '0 10px 22px rgba(var(--terracota-rgb),0.35)',
                                }}
                                onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.02)'}
                                onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                            >
                                Continuar →
                            </button>

                            <p className="text-center mt-5" style={{ fontSize: '16px', color: 'var(--body-muted)' }}>
                                ¿Ya tienes cuenta?{' '}
                                <span className="cursor-pointer" style={{ color: 'var(--terracota)', fontWeight: 700 }} onClick={() => navigate('/')}>
                                    Inicia sesión
                                </span>
                            </p>
                        </div>
                    ) : (
                        <div>
                            <h1 style={{ fontFamily: "'Baloo 2', sans-serif", fontWeight: 800, fontSize: '30px', margin: '0 0 6px', color: 'var(--heading)' }}>
                                Tu perfil
                            </h1>
                            <p style={{ fontSize: '17px', margin: '0 0 20px', color: 'var(--body-muted)' }}>
                                Paso 2 de 2 — ¿Quién eres tú?
                            </p>

                            <input type="text" placeholder="Tu nombre o alias" value={form.nombre}
                                onChange={e => actualizar('nombre', e.target.value)}
                                style={{ ...inputStyle, marginBottom: '20px' }} {...focusHandlers} />

                            <p style={{ fontWeight: 800, fontSize: '16px', margin: '0 0 12px', color: 'var(--heading)' }}>
                                ¿Cómo quieres aprender?
                            </p>

                            <div className="flex flex-col gap-3 mb-3">
                                {perfiles.map(p => {
                                    const activo = form.tipo_perfil === p.valor;
                                    return (
                                        <div key={p.valor}
                                            onClick={() => actualizar('tipo_perfil', p.valor)}
                                            className="flex items-center gap-4 cursor-pointer transition-all"
                                            style={{
                                                padding: '16px 18px', borderRadius: '20px',
                                                background: activo ? 'rgba(var(--success-light-rgb),0.16)' : 'var(--input-bg)',
                                                border: activo ? '2px solid var(--success-light)' : '2px solid rgba(var(--terracota-rgb),0.15)',
                                            }}>
                                            <span style={{ fontSize: '36px' }}>{p.emoji}</span>
                                            <div className="flex-1">
                                                <p className="m-0 font-extrabold" style={{ fontSize: '17px', color: 'var(--heading)' }}>{p.valor}</p>
                                                <p className="m-0" style={{ fontSize: '14px', color: 'var(--body-muted)' }}>{p.desc}</p>
                                            </div>
                                            {activo && <span style={{ fontSize: '20px' }}>✅</span>}
                                        </div>
                                    );
                                })}
                            </div>

                            {form.tipo_perfil && (
                                <div className="flex items-center gap-3 mt-2"
                                    style={{
                                        padding: '14px 16px', borderRadius: '16px', color: 'var(--heading)',
                                        background: `${preview.color}22`, border: `1px solid ${preview.color}55`,
                                    }}>
                                    <span style={{ fontSize: '22px' }}>{preview.icon}</span>
                                    <p className="m-0" style={{ fontSize: '15px', fontWeight: 700 }}>{preview.text}</p>
                                </div>
                            )}

                            {error && <p className="text-center mt-3.5" style={{ fontSize: '15px', color: 'var(--error)', fontWeight: 700 }}>{error}</p>}

                            <button
                                onClick={handleRegistro}
                                disabled={cargando}
                                className="w-full mt-5"
                                style={{
                                    padding: '19px', border: 'none', borderRadius: '20px',
                                    fontFamily: "'Baloo 2', sans-serif", fontWeight: 800, fontSize: '20px', color: 'white',
                                    cursor: 'pointer', background: 'linear-gradient(135deg, var(--success-dark), var(--success-light))',
                                    boxShadow: '0 10px 22px rgba(var(--success-dark-rgb),0.35)',
                                    opacity: cargando ? 0.7 : 1,
                                }}>
                                {cargando ? 'Creando cuenta...' : '¡Comenzar aventura! 🌬️'}
                            </button>
                            <button onClick={() => setPaso(1)}
                                className="w-full mt-3" style={{ padding: '8px', border: 'none', background: 'none', fontSize: '15px', color: 'var(--body-muted)', cursor: 'pointer' }}>
                                ← Regresar
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default Registro;
