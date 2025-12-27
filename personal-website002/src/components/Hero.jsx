import React from 'react';
import { profileData } from '../data/profileData';
import { ArrowRight } from 'lucide-react';

const Hero = () => {
  return (
    <section id="home" style={{ minHeight: '80vh', display: 'flex', alignItems: 'center' }}>
      <div className="container">
        <span style={{ color: 'var(--accent-color)', fontWeight: 600, marginBottom: '1rem', display: 'block' }}>
          Hello, I'm
        </span>
        <h1 style={{ fontSize: 'clamp(2.5rem, 5vw, 4rem)', marginBottom: '1.5rem', lineHeight: 1.1 }}>
          {profileData.name} <br />
          <span style={{ color: '#6b7280' }}>{profileData.occupation}</span>
        </h1>
        <p style={{ maxWidth: '600px', fontSize: '1.125rem', color: '#4b5563', marginBottom: '2.5rem' }}>
          {profileData.bio}
        </p>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <a href="#portfolio" style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            backgroundColor: 'var(--text-color)',
            color: 'white',
            padding: '0.75rem 1.5rem',
            borderRadius: '0.5rem',
            fontWeight: 500
          }}>
            View My Work <ArrowRight size={20} />
          </a>
          <a href="#contact" style={{
             display: 'inline-flex',
             alignItems: 'center',
             justifyContent: 'center',
             padding: '0.75rem 1.5rem',
             borderRadius: '0.5rem',
             fontWeight: 500,
             border: '1px solid var(--border-color)'
          }}>
            Contact Me
          </a>
        </div>
      </div>
    </section>
  );
};

export default Hero;
