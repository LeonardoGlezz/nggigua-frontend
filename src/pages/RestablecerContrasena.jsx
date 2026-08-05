import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { restablecerPassword } from '../services/authService';
import aldeaFondo from '../assets/aldea-fondo.jpeg';

function RestablecerContrasena() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const token = searchParams.get('token');

    const [contrasena, setContrasena] = useState('');
    const [confirmar, setConfirmar] = useState('');
    const [error, setError] = useState('');
    const [listo, setListo] = useState(false);
    const [cargando, setCargando] = useState(false);

    const handleRestablecer = async () => {
        if (!contrasena || !confirmar) {
            setError('Completa ambos campos.');
            return;
        }
        if (contrasena.length < 6) {
            setError('La contraseña debe tener al menos 6 caracteres.');
            return;
        }
        if (contrasena !== confirmar) {
            setError('Las contraseñas no coinciden.');
            return;
        }
        setCargando(true);
        setError('');
        try {
            await restablecerPassword(token, contrasena);
            setListo(true);
        } catch (err) {
            setError(err.response?.data?.mensaje || 'No se pudo restablecer la contraseña.');
        } finally {
            setCargando(false);
        }
    };

    const inputStyle = {
        boxSizing: 'border-box', padding: '17px 20px', borderRadius: '18px',
        border: '2px solid rgba(var(--terracota-rgb),0.22)', background: 'var(--input-bg)',
        color: 'var(--input-text)', fontFamily: "'Nunito', sans-serif", fontSize: '17px', outline: 'none',
    };
    const focusHandlers = {
        onFocus: (e) => { e.target.style.borderColor = 'var(--terracota)'; e.target.style.boxShadow = '0 0 0 4px rgba(var(--terracota-rgb),0.15)'; },
        onBlur: (e) => { e.target.style.borderColor = 'rgba(var(--terracota-rgb),0.22)'; e.target.style.boxShadow = 'none'; },
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-5"
            style={{ background: 'linear-gradient(180deg, var(--bg-from) 0%, var(--bg-to) 100%)', fontFamily: "'Nunito', sans-serif" }}>

            <div className="flex flex-wrap w-full rounded-[36px] overflow-hidden"
                style={{ maxWidth: '1040px', boxShadow: '0 24px 60px rgba(var(--shadow-rgb),0.18)', animation: 'popIn 0.5s ease both' }}>

                <div className="relative"
                    style={{
                        flex: '1 1 420px', minHeight: '520px',
                        backgroundImage: `url(${aldeaFondo})`, backgroundSize: 'cover', backgroundPosition: 'center',
                    }}>
                    <div className="absolute inset-0"
                        style={{ background: 'linear-gradient(to top, rgba(27,42,74,0.8), rgba(27,42,74,0.05) 60%)' }} />
                    <div className="absolute left-7 bottom-7 right-7" style={{ color: 'var(--on-photo)' }}>
                        <p style={{ fontFamily: "'Baloo 2', sans-serif", fontWeight: 800, fontSize: '26px', margin: '0 0 6px', color: 'var(--gold)' }}>Nggigua</p>
                        <p style={{ fontSize: '16px', margin: 0, opacity: 0.9 }}>Lengua viva del pueblo Chocholteca</p>
                    </div>
                </div>

                <div className="flex flex-col justify-center"
                    style={{ flex: '1 1 420px', background: 'var(--card-bg)', padding: '64px 52px' }}>

                    <div className="flex items-center justify-center rounded-2xl mb-5"
                        style={{
                            width: '64px', height: '64px', fontSize: '32px',
                            background: 'linear-gradient(135deg, var(--terracota), var(--gold))',
                            boxShadow: '0 8px 18px rgba(var(--terracota-rgb),0.35)',
                        }}>🔐</div>

                    {!token ? (
                        <>
                            <h1 style={{ fontFamily: "'Baloo 2', sans-serif", fontWeight: 800, fontSize: '28px', margin: '0 0 10px', color: 'var(--heading)' }}>
                                Enlace inválido
                            </h1>
                            <p style={{ fontSize: '16px', margin: '0 0 20px', color: 'var(--body-muted)' }}>
                                Este enlace no incluye un token de recuperación. Solicita uno nuevo desde la pantalla de inicio de sesión.
                            </p>
                        </>
                    ) : listo ? (
                        <>
                            <h1 style={{ fontFamily: "'Baloo 2', sans-serif", fontWeight: 800, fontSize: '28px', margin: '0 0 10px', color: 'var(--heading)' }}>
                                ¡Listo! ✅
                            </h1>
                            <p style={{ fontSize: '16px', margin: '0 0 26px', color: 'var(--body-muted)' }}>
                                Tu contraseña se actualizó correctamente. Ya puedes iniciar sesión con ella.
                            </p>
                            <button
                                onClick={() => navigate('/')}
                                className="w-full transition-transform"
                                style={{
                                    padding: '19px', border: 'none', borderRadius: '20px',
                                    fontFamily: "'Baloo 2', sans-serif", fontWeight: 800, fontSize: '20px',
                                    color: 'white', cursor: 'pointer',
                                    background: 'linear-gradient(135deg, var(--terracota), var(--gold))',
                                    boxShadow: '0 10px 22px rgba(var(--terracota-rgb),0.35)',
                                }}>
                                Iniciar sesión
                            </button>
                        </>
                    ) : (
                        <>
                            <h1 style={{ fontFamily: "'Baloo 2', sans-serif", fontWeight: 800, fontSize: '28px', margin: '0 0 6px', color: 'var(--heading)' }}>
                                Elige tu nueva contraseña
                            </h1>
                            <p style={{ fontSize: '16px', margin: '0 0 24px', color: 'var(--body-muted)' }}>
                                Mínimo 6 caracteres.
                            </p>

                            <div className="flex flex-col gap-4 mb-5">
                                <input type="password" placeholder="Nueva contraseña" value={contrasena}
                                    onChange={(e) => setContrasena(e.target.value)} style={inputStyle} {...focusHandlers} />
                                <input type="password" placeholder="Confirmar nueva contraseña" value={confirmar}
                                    onChange={(e) => setConfirmar(e.target.value)} style={inputStyle} {...focusHandlers} />
                            </div>

                            {error && (
                                <p className="text-center mb-4" style={{ fontSize: '15px', color: 'var(--error)', fontWeight: 700 }}>
                                    {error}
                                </p>
                            )}

                            <button
                                onClick={handleRestablecer}
                                disabled={cargando}
                                className="w-full transition-transform"
                                style={{
                                    padding: '19px', border: 'none', borderRadius: '20px',
                                    fontFamily: "'Baloo 2', sans-serif", fontWeight: 800, fontSize: '20px',
                                    color: 'white', cursor: 'pointer',
                                    background: 'linear-gradient(135deg, var(--terracota), var(--gold))',
                                    boxShadow: '0 10px 22px rgba(var(--terracota-rgb),0.35)',
                                    opacity: cargando ? 0.7 : 1,
                                }}>
                                {cargando ? 'Guardando...' : 'Restablecer contraseña'}
                            </button>
                        </>
                    )}

                    <p className="text-center mt-5" style={{ fontSize: '16px', color: 'var(--body-muted)' }}>
                        <span className="cursor-pointer" style={{ color: 'var(--terracota)', fontWeight: 700 }}
                            onClick={() => navigate('/')}>
                            ← Volver a iniciar sesión
                        </span>
                    </p>
                </div>
            </div>
        </div>
    );
}

export default RestablecerContrasena;
