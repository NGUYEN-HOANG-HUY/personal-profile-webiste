import React from 'react'

function Footer() {
  const currentYear = new Date().getFullYear()
  
  return (
    <footer className="footer">
      <p>© {currentYear} Personal Portfolio. Built with React & Vite.</p>
    </footer>
  )
}

export default Footer
