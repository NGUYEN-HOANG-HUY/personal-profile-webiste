import React from 'react';
import { Menu, X } from 'lucide-react';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);

  return (
    <header style={{
      position: 'sticky',
      top: 0,
      backgroundColor: 'rgba(255, 255, 255, 0.9)',
      backdropFilter: 'blur(10px)',
      borderBottom: '1px solid var(--border-color)',
      zIndex: 100
    }}>
      <div className="container" style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingTop: '1rem',
        paddingBottom: '1rem'
      }}>
        <div style={{ fontWeight: 'bold', fontSize: '1.25rem' }}>NHH.</div>
        
        {/* Desktop Menu */}
        <nav style={{ display: 'flex', gap: '2rem' }} className="desktop-nav">
          <a href="#home">Home</a>
          <a href="#portfolio">Portfolio</a>
          <a href="#contact">Contact</a>
        </nav>
      </div>
    </header>
  );
};

export default Header;
