// src/Header.js (Uppdaterad fil)

import React from 'react';
import { Link } from 'react-router-dom';

function Header() {
  return (
    <header className="app-header">
      <div className="header-content">
        <Link to="/lekplatser" className="title">
          Lekplatsäventyr
        </Link>
        <Link to="/ny-lekplats" className="header-button">
          + Lägg till lekplats
        </Link>
      </div>
    </header>
  );
}

export default Header;