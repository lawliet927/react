import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Navbar from './components/Navbar';
import Edificaciones from './pages/Edificaciones';
import Tiendas from './pages/Tiendas';
import Propietarios from './pages/Propietarios';
import FechasEntrega from './pages/FechasEntrega';
import './App.css';

function App() {
    return (
        <Router>
            <Navbar />
            <div className="container mt-4">
                <Routes>
                    <Route path="/edificaciones" element={<Edificaciones />} />
                    <Route path="/tiendas" element={<Tiendas />} />
                    <Route path="/propietarios" element={<Propietarios />} />
                    <Route path="/fechas-entrega" element={<FechasEntrega />} />
                </Routes>
            </div>
        </Router>
    );
}

export default App;
