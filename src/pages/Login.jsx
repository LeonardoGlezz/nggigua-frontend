import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { login } from '../services/authService';
import aldeaFondo from '../assets/aldea-fondo.jpeg';

function Login() {
    const navigate = useNavigate();
    const [correo, setCorreo] = useState('');
    const [contrasena, setContrasena] = useState('');
    const [error, setError] = useState('');
    const { iniciarSesion } = useAuth();

    const handleLogin = async () => {
        try {
            const data = await login(correo, contrasena);
            await iniciarSesion(data.token);
            navigate('/intro');
        } catch (err) {
            setError(err.response?.data?.mensaje || 'Correo o contraseña incorrectos');
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-5"
            style={{ background: 'linear-gradient(180deg, var(--bg-from) 0%, var(--bg-to) 100%)', fontFamily: "'Nunito', sans-serif" }}>

            <div className="flex flex-wrap w-full rounded-[36px] overflow-hidden"
                style={{ maxWidth: '1040px', boxShadow: '0 24px 60px rgba(var(--shadow-rgb),0.18)', animation: 'popIn 0.5s ease both' }}>

                {/* Columna imagen */}
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

                {/* Columna formulario */}
                <div className="flex flex-col justify-center"
                    style={{ flex: '1 1 420px', background: 'var(--card-bg)', padding: '64px 52px' }}>

                    <div className="flex items-center justify-center rounded-2xl mb-5"
                        style={{
                            width: '64px', height: '64px', fontSize: '32px',
                            background: 'linear-gradient(135deg, var(--terracota), var(--gold))',
                            boxShadow: '0 8px 18px rgba(var(--terracota-rgb),0.35)',
                        }}>🌬️</div>

                    <h1 style={{ fontFamily: "'Baloo 2', sans-serif", fontWeight: 800, fontSize: '35px', margin: '0 0 6px', color: 'var(--heading)' }}>
                        Bienvenido de vuelta
                    </h1>
                    <p style={{ fontSize: '17px', margin: '0 0 30px', color: 'var(--body-muted)' }}>
                        Continúa aprendiendo Nggigua
                    </p>

                    <div className="flex flex-col gap-4 mb-6">
                        <input
                            type="email"
                            placeholder="Correo electrónico"
                            value={correo}
                            onChange={(e) => setCorreo(e.target.value)}
                            className="w-full outline-none"
                            style={{
                                boxSizing: 'border-box', padding: '17px 20px', borderRadius: '18px',
                                border: '2px solid rgba(var(--terracota-rgb),0.22)', background: 'var(--input-bg)',
                                color: 'var(--input-text)', fontFamily: "'Nunito', sans-serif", fontSize: '17px',
                            }}
                            onFocus={(e) => { e.target.style.borderColor = 'var(--terracota)'; e.target.style.boxShadow = '0 0 0 4px rgba(var(--terracota-rgb),0.15)'; }}
                            onBlur={(e) => { e.target.style.borderColor = 'rgba(var(--terracota-rgb),0.22)'; e.target.style.boxShadow = 'none'; }}
                        />
                        <input
                            type="password"
                            placeholder="Contraseña"
                            value={contrasena}
                            onChange={(e) => setContrasena(e.target.value)}
                            className="w-full outline-none"
                            style={{
                                boxSizing: 'border-box', padding: '17px 20px', borderRadius: '18px',
                                border: '2px solid rgba(var(--terracota-rgb),0.22)', background: 'var(--input-bg)',
                                color: 'var(--input-text)', fontFamily: "'Nunito', sans-serif", fontSize: '17px',
                            }}
                            onFocus={(e) => { e.target.style.borderColor = 'var(--terracota)'; e.target.style.boxShadow = '0 0 0 4px rgba(var(--terracota-rgb),0.15)'; }}
                            onBlur={(e) => { e.target.style.borderColor = 'rgba(var(--terracota-rgb),0.22)'; e.target.style.boxShadow = 'none'; }}
                        />
                    </div>

                    {error && (
                        <p className="text-center mb-4" style={{ fontSize: '15px', color: 'var(--error)', fontWeight: 700 }}>
                            {error}
                        </p>
                    )}

                    <button
                        onClick={handleLogin}
                        className="w-full transition-transform"
                        style={{
                            padding: '19px', border: 'none', borderRadius: '20px',
                            fontFamily: "'Baloo 2', sans-serif", fontWeight: 800, fontSize: '20px',
                            color: 'white', cursor: 'pointer',
                            background: 'linear-gradient(135deg, var(--terracota), var(--gold))',
                            boxShadow: '0 10px 22px rgba(var(--terracota-rgb),0.35)',
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.02)'}
                        onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                    >
                        Iniciar mi camino ✨
                    </button>

                    <p className="text-center mt-5" style={{ fontSize: '16px', color: 'var(--body-muted)' }}>
                        ¿Es tu primera vez?{' '}
                        <span className="cursor-pointer" style={{ color: 'var(--terracota)', fontWeight: 700 }}
                            onClick={() => navigate('/registro')}>
                            Únete aquí
                        </span>
                    </p>
                </div>
            </div>
        </div>
    );
}

export default Login;
