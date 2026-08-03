import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import InterruptorTema from './components/InterruptorTema';
import SincronizarPerfil from './components/SincronizarPerfil';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Intro from './pages/Intro';
import Memorama from './pages/Memorama';
import Registro from './pages/Registro';
import Ahorcado from './pages/Ahorcado';
import AtrapaPalabra from './pages/AtrapaPalabra';
import EmparejaColumnas from './pages/EmparejaColumnas';
import RuletaCategorias from './pages/RuletaCategorias';
import Perfil from './pages/Perfil';

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <SincronizarPerfil />
          <InterruptorTema />
          <Routes>
            <Route path="/" element={<Login />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/intro" element={<Intro />} />
            <Route path="/memorama" element={<Memorama />} />
            <Route path="/registro" element={<Registro />} />
            <Route path="/ahorcado" element={<Ahorcado />} />
            <Route path="/atrapa-palabra" element={<AtrapaPalabra />} />
            <Route path="/empareja-columnas" element={<EmparejaColumnas />} />
            <Route path="/ruleta-categorias" element={<RuletaCategorias />} />
            <Route path="/perfil" element={<Perfil />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App
