import React from 'react';
import { Mail, Linkedin, Github, Send } from 'lucide-react';
import { profileData } from '../data/profileData';

const Contact = () => {
  const handleSubmit = (e) => {
    e.preventDefault();
    alert('Message sent! (This is a demo)');
  };

  return (
    <section id="contact">
      <div className="container">
        <h2 className="section-title">Get In Touch</h2>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '4rem'
        }}>
          <div>
            <p style={{ fontSize: '1.25rem', marginBottom: '2rem', color: '#4b5563' }}>
              I'm essentially always interested in creating new things. Whether you have a question or just want to say hi, I'll try my best to get back to you!
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <a href={`mailto:${profileData.contact.email}`} style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{ padding: '0.75rem', backgroundColor: 'var(--secondary-bg)', borderRadius: '50%' }}>
                  <Mail size={24} />
                </div>
                <span>{profileData.contact.email}</span>
              </a>
              <a href={`https://${profileData.contact.linkedin}`} target="_blank" rel="noreferrer" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                 <div style={{ padding: '0.75rem', backgroundColor: 'var(--secondary-bg)', borderRadius: '50%' }}>
                  <Linkedin size={24} />
                </div>
                <span>LinkedIn</span>
              </a>
               <a href={`https://${profileData.contact.github}`} target="_blank" rel="noreferrer" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                 <div style={{ padding: '0.75rem', backgroundColor: 'var(--secondary-bg)', borderRadius: '50%' }}>
                  <Github size={24} />
                </div>
                <span>GitHub</span>
              </a>
            </div>
          </div>
          
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'flex', gap: '1rem' }}>
              <input type="text" placeholder="Name" required style={{
                flex: 1, padding: '1rem', borderRadius: '0.5rem', border: '1px solid var(--border-color)', fontSize: '1rem'
              }} />
              <input type="email" placeholder="Email" required style={{
                flex: 1, padding: '1rem', borderRadius: '0.5rem', border: '1px solid var(--border-color)', fontSize: '1rem'
              }} />
            </div>
            <input type="text" placeholder="Subject" style={{
               padding: '1rem', borderRadius: '0.5rem', border: '1px solid var(--border-color)', fontSize: '1rem'
            }} />
            <textarea placeholder="Message" rows={5} required style={{
               padding: '1rem', borderRadius: '0.5rem', border: '1px solid var(--border-color)', fontSize: '1rem', resize: 'vertical'
            }}></textarea>
            <button type="submit" style={{
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
              backgroundColor: 'var(--text-color)', color: 'white', padding: '1rem', borderRadius: '0.5rem',
              fontWeight: 600, border: 'none'
            }}>
              Send Message <Send size={18} />
            </button>
          </form>
        </div>
      </div>
    </section>
  );
};

export default Contact;
