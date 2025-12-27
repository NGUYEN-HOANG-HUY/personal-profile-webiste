import React from 'react';
import { profileData } from '../data/profileData';
import { ExternalLink, Github } from 'lucide-react';

const Portfolio = () => {
  return (
    <section id="portfolio" style={{ backgroundColor: 'var(--secondary-bg)' }}>
      <div className="container">
        <h2 className="section-title">Featured Projects</h2>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '2rem'
        }}>
          {profileData.projects.map((project, index) => (
            <div key={index} style={{
              backgroundColor: 'white',
              borderRadius: '1rem',
              padding: '2rem',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
            }}>
              <h3 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>{project.title}</h3>
              <p style={{ color: '#4b5563', marginBottom: '1.5rem', minHeight: '3rem' }}>
                {project.description}
              </p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '2rem' }}>
                {project.techStack.map((tech, i) => (
                  <span key={i} style={{
                    backgroundColor: 'var(--secondary-bg)',
                    padding: '0.25rem 0.75rem',
                    borderRadius: '2rem',
                    fontSize: '0.875rem',
                    fontWeight: 500
                  }}>
                    {tech}
                  </span>
                ))}
              </div>
              <div style={{ display: 'flex', gap: '1rem' }}>
                 {/* Placeholder links since not in data yet, can be added later */}
                 <button style={{
                   display: 'flex', alignItems: 'center', gap: '0.5rem',
                   background: 'none', border: 'none', fontWeight: 500
                 }}>
                   <Github size={18} /> Code
                 </button>
                 <button style={{
                   display: 'flex', alignItems: 'center', gap: '0.5rem',
                   background: 'none', border: 'none', fontWeight: 500, color: 'var(--accent-color)'
                 }}>
                   <ExternalLink size={18} /> Demo
                 </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Portfolio;
