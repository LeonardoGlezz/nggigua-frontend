import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Intro from './pages/Intro';
import Memorama from './pages/Memorama';
import Registro from './pages/Registro';

function App() {
  return (
  <AuthProvider>
            <BrowserRouter>
                <Routes>
                    <Route path="/" element={<Login />} />
                    <Route path="/dashboard" element={<Dashboard />} />
                    <Route path="/intro" element={<Intro />} />
                    <Route path="/memorama" element={<Memorama />} />
                    <Route path="/registro" element={<Registro />} />
                </Routes>
            </BrowserRouter>
        </AuthProvider>
    );
}

export default App