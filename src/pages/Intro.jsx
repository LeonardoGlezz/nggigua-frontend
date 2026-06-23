import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import aldeaFondo from '../assets/aldea-fondo.jpeg';

const historia = [
    "En las tierras de la Sierra Chocholteca...",
    "Un explorador llegó perdido a una aldea misteriosa.",
    "Sus habitantes solo hablaban Nggigua.",
    "Para encontrar su camino de regreso...",
    "Debía aprender a hablar como ellos.",
    "Casa por casa. Palabra por palabra.",
    "¿Estás listo para comenzar tu camino? 🌬️"
];

function Intro() {
    const navigate = useNavigate();
    const [lineaActual, setLineaActual] = useState(0);
    const [visible, setVisible] = useState(true);

    useEffect(() => {
        if (lineaActual < historia.length - 1) {
            const timer = setTimeout(() => {
                setVisible(false);
                setTimeout(() => {
                    setLineaActual(prev => prev + 1);
                    setVisible(true);
                }, 500);
            }, 2500);
            return () => clearTimeout(timer);
        }
    }, [lineaActual]);

    return (
        <div className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden"
            style={{
                backgroundImage: `url(${aldeaFondo})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
            }}>
            <div className="absolute inset-0" style={{ background: 'rgba(10, 15, 30, 0.82)' }}/>

            <div className="relative z-10 flex flex-col items-center px-8 max-w-2xl text-center">
                <div className="text-6xl mb-8">🌬️</div>

                <p className="text-2xl font-bold mb-12 transition-all duration-500"
                    style={{
                        color: '#E9C46A',
                        opacity: visible ? 1 : 0,
                        transform: visible ? 'translateY(0)' : 'translateY(-10px)',
                        transition: 'opacity 0.5s ease, transform 0.5s ease',
                        minHeight: '80px',
                    }}>
                    {historia[lineaActual]}
                </p>

                {lineaActual === historia.length - 1 && (
                    <button
                        onClick={() => navigate('/dashboard')}
                        className="px-10 py-4 rounded-2xl font-bold text-xl transition-all hover:scale-105 active:scale-95"
                        style={{
                            background: 'linear-gradient(135deg, #C4622D, #E9C46A)',
                            color: 'white',
                            boxShadow: '0 0 30px rgba(196,98,45,0.5)',
                            animation: 'aparecer 0.6s ease both',
                        }}>
                        Comenzar mi camino ✨
                    </button>
                )}
            </div>

            <style>{`
                @keyframes aparecer {
                    from { opacity: 0; transform: translateY(20px); }
                    to { opacity: 1; transform: translateY(0); }
                }
            `}</style>
        </div>
    );
}

export default Intro;