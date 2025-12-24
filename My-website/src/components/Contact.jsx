import React from 'react'

function Contact() {
  return (
    <section className="section" id="contact">
      <div className="container">
        <h2 className="section-title">Get In Touch</h2>
        <div className="contact-content">
          <p style={{ color: 'var(--text-secondary)', fontSize: '1.2rem', marginBottom: '2rem' }}>
            I'm always open to new opportunities and collaborations. 
            Feel free to reach out if you'd like to connect!
          </p>
          <div className="contact-links">
            <a href="mailto:your.email@example.com" className="contact-link">
              📧 Email
            </a>
            <a href="https://github.com/yourusername" target="_blank" rel="noopener noreferrer" className="contact-link">
              💼 GitHub
            </a>
            <a href="https://linkedin.com/in/yourusername" target="_blank" rel="noopener noreferrer" className="contact-link">
              🔗 LinkedIn
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}

export default Contact
