import React from 'react';
import { Link } from 'react-router-dom';
import './NavigationBar.css';

function NavigationBar() {
    return (
        <nav className="navbar navbar-expand-lg nav-cool mb-4">
            <div className="container">
                <Link className="navbar-brand" to="/">STT App</Link>
                <div className="collapse navbar-collapse" id="navbarNav">
                    <ul className="navbar-nav ms-auto mb-2 mb-lg-0">
                        <li className="nav-item">
                            {/* <Link className="nav-link nav-cool-link" to="/">Accueil</Link> */}
                            <Link className="btn btn-outline-light nav-btn me-2" to="/">Accueil</Link>
                        </li>
                        <li className="nav-item">
                            <Link className="btn btn-outline-light nav-btn me-2" to="/n1">N1</Link>
                        </li>
                        <li className="nav-item">
                            <Link className="btn btn-outline-light nav-btn me-2" to="/n2">N2</Link>
                        </li>
                    </ul>
                </div>
            </div>
        </nav>
    );
}

export default NavigationBar;