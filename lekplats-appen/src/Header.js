// src/Header.js
import React from 'react';
import { Link } from 'react-router-dom';

function Header() {
  return (
    <header className="app-header">
      <Link to="/lekplatser" className="title">
        Lekplatsäventyr
      </Link>
      {/* Här kan du lägga till fler navigeringslänkar senare */}
    </header>
  );
}

export default Header;