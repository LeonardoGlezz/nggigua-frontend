import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import aldeaFondo from '../assets/aldea-fondo.jpeg';
import exploradorNeutral from '../assets/ahorcado/explorador-feliz.png';

const historia = [
    'En un valle entre montañas rojizas, vive un pueblo con una lengua muy antigua.',
    'Se llama Nggigua, y la hablan los abuelos, las madres, los niños que juegan en la calle.',
    'Pero cada año, menos voces la recuerdan.',
    'Tú puedes ser parte de quienes la mantienen viva.',
    'Cada palabra que aprendes es una semilla que vuelve a crecer.',
    'Un joven explorador te acompañará en el camino.',
    '¿Estás listo para comenzar tu camino? 🌬️'
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
                }, 300);
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
                fontFamily: "'Nunito', sans-serif",
            }}>
            <div className="absolute inset-0" style={{ background: 'linear-gradient(180deg, rgba(27,42,74,0.35), rgba(45,24,16,0.72) 65%)' }} />

            <div className="relative z-10 flex flex-col items-center px-8 max-w-3xl text-center">
                <img src={exploradorNeutral} alt="explorador" className="mb-8"
                    style={{ width: '150px', animation: 'floatMascot 4s ease-in-out infinite', filter: 'drop-shadow(0 14px 18px rgba(0,0,0,0.4))' }} />

                <p style={{
                    fontFamily: "'Baloo 2', sans-serif", fontWeight: 700, fontSize: '30px', lineHeight: 1.45,
                    color: 'var(--on-photo)', margin: 0, minHeight: '130px',
                    opacity: visible ? 1 : 0, transition: 'opacity 0.3s ease',
                }}>
                    {historia[lineaActual]}
                </p>

                <div className="flex gap-2" style={{ margin: '26px 0 34px' }}>
                    {historia.map((_, i) => (
                        <div key={i} style={{
                            width: '10px', height: '10px', borderRadius: '50%',
                            background: i <= lineaActual ? 'var(--gold)' : 'rgba(244,236,216,0.35)',
                            transition: 'background 0.3s ease',
                        }} />
                    ))}
                </div>

                {lineaActual === historia.length - 1 && (
                    <button
                        onClick={() => navigate('/dashboard')}
                        className="transition-transform"
                        style={{
                            padding: '20px 48px', border: 'none', borderRadius: '22px',
                            fontFamily: "'Baloo 2', sans-serif", fontWeight: 800, fontSize: '22px', color: 'white',
                            cursor: 'pointer', background: 'linear-gradient(135deg, var(--terracota), var(--gold))',
                            boxShadow: '0 0 34px rgba(var(--gold-rgb),0.55)',
                            animation: 'popIn 0.4s ease both',
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.03)'}
                        onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                    >
                        Comenzar mi camino ✨
                    </button>
                )}
            </div>
        </div>
    );
}

export default Intro;
