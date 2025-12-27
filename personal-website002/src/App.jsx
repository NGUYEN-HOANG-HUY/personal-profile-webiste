import React from 'react';
import Header from './components/Header';
import Hero from './components/Hero';
import Portfolio from './components/Portfolio';
import Contact from './components/Contact';
import Chatbot from './components/Chatbot';

function App() {
  return (
    <div className="app">
      <Header />
      <main>
        <Hero />
        <Portfolio />
        <Contact />
      </main>
      <Chatbot />
      
      <footer style={{ 
        textAlign: 'center', 
        padding: '2rem', 
        borderTop: '1px solid var(--border-color)',
        color: '#6b7280',
        fontSize: '0.875rem'
      }}>
        <div className="container">
          &copy; {new Date().getFullYear()} Nguyen Hoang Huy. Built with React & Vite.
        </div>
      </footer>
    </div>
  );
}

export default App;
