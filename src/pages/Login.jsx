import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { login } from '../services/authService';

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
            setError('Correo o contraseña incorrectos');
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, #1B2A4A 0%, #2D3F6B 50%, #1B2A4A 100%)' }}>
            
            {/* Decoración cultural de fondo */}
            <div className="absolute inset-0 overflow-hidden opacity-10">
                <div className="absolute top-10 left-10 w-32 h-32 rounded-full"
                    style={{ background: '#C4622D' }}/>
                <div className="absolute bottom-20 right-10 w-48 h-48 rounded-full"
                    style={{ background: '#E9C46A' }}/>
                <div className="absolute top-1/2 left-5 w-20 h-20 rounded-full"
                    style={{ background: '#2D6A4F' }}/>
            </div>

            <div className="relative z-10 p-8 rounded-3xl w-96 shadow-2xl"
                style={{ background: 'rgba(27, 42, 74, 0.85)', border: '1px solid rgba(196, 98, 45, 0.3)', backdropFilter: 'blur(10px)' }}>
                
                {/* Logo y título */}
                <div className="text-center mb-8">
                    <div className="text-6xl mb-3">🌬️</div>
                    <h1 className="text-3xl font-bold mb-1"
                        style={{ color: '#E9C46A' }}>
                        Nggigua
                    </h1>
                    <p className="text-sm" style={{ color: '#C4622D' }}>
                        Lengua viva del pueblo Chocholteca
                    </p>
                </div>

                {/* Inputs */}
                <div className="space-y-4 mb-6">
                    <input
                        type="email"
                        placeholder="Correo electrónico"
                        value={correo}
                        onChange={(e) => setCorreo(e.target.value)}
                        className="w-full p-4 rounded-xl text-white placeholder-gray-400 outline-none transition-all"
                        style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(233, 196, 106, 0.2)' }}
                    />
                    <input
                        type="password"
                        placeholder="Contraseña"
                        value={contrasena}
                        onChange={(e) => setContrasena(e.target.value)}
                        className="w-full p-4 rounded-xl text-white placeholder-gray-400 outline-none transition-all"
                        style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(233, 196, 106, 0.2)' }}
                    />
                </div>

                {error && (
                    <p className="text-center mb-4 text-sm" style={{ color: '#C4622D' }}>
                        {error}
                    </p>
                )}

                <button
                    onClick={handleLogin}
                    className="w-full p-4 rounded-xl font-bold text-white text-lg transition-all hover:opacity-90 active:scale-95"
                    style={{ background: 'linear-gradient(135deg, #C4622D, #E9C46A)' }}
                >
                    Iniciar mi camino ✨
                </button>

                <p className="text-center mt-4 text-sm" style={{ color: '#8899BB' }}>
                    ¿Es tu primera vez?
                    <span className="ml-1 cursor-pointer" style={{ color: '#E9C46A' }}
    onClick={() => navigate('/registro')}>
    Únete
</span>
                </p>
            </div>
        </div>
    );
}

export default Login;