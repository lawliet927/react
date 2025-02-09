import React from 'react';
import { Link } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';

function Navbar() {
    return (
        <nav className="navbar navbar-expand-lg navbar-dark bg-dark">
            <div className="container">
                <Link className="navbar-brand" to="/">Proyectos Comerciales</Link>
                <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
                    <span className="navbar-toggler-icon"></span>
                </button>
                <div className="collapse navbar-collapse" id="navbarNav">
                    <ul className="navbar-nav">
                        <li className="nav-item"><Link className="nav-link" to="/edificaciones">Edificaciones</Link></li>
                        <li className="nav-item"><Link className="nav-link" to="/tiendas">Tiendas</Link></li>
                        <li className="nav-item"><Link className="nav-link" to="/propietarios">Propietarios</Link></li>
                        <li className="nav-item"><Link className="nav-link" to="/fechas-entrega">Fechas de Entrega</Link></li>
                    </ul>
                </div>
            </div>
        </nav>
    );
}

export default Navbar;
