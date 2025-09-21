import React from 'react';
import { Link } from 'react-router-dom';
import './Home.css'; // Vi behåller denna för specifika justeringar, men mycket kan tas bort

const Home = () => {
  return (
    <div className="home-content">
      <h1>Välkommen till Lekplatsäventyret!</h1>
      <p className="lead">Hitta, utforska och betygsätt lekplatser nära dig.</p>
      <div className="home-actions">
        <Link to="/lekplatser" className="btn btn-primary">
          Hitta lekplatser
        </Link>
        <Link to="/login" className="btn btn-secondary">
          Logga in
        </Link>
      </div>
    </div>
  );
};

export default Home;