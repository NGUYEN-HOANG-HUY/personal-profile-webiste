function Projects() {
  const projects = [
    {
      title: 'Portfolio Website',
      description: 'A modern, responsive portfolio website built with React and Vite, featuring glassmorphism design and smooth animations.',
      icon: '🎨',
      link: '#'
    },
    {
      title: 'Web Application',
      description: 'Full-stack web application with user authentication, real-time updates, and responsive design.',
      icon: '💻',
      link: '#'
    },
    {
      title: 'Open Source Contribution',
      description: 'Contributing to open-source projects and sharing knowledge with the developer community.',
      icon: '🌟',
      link: '#'
    }
  ]

  return (
    <section className="section" id="projects">
      <div className="container">
        <h2 className="section-title">Featured Projects</h2>
        <div className="projects-grid">
          {projects.map((project, index) => (
            <div key={index} className="project-card">
              <div className="project-image">{project.icon}</div>
              <div className="project-content">
                <h3>{project.title}</h3>
                <p>{project.description}</p>
                <a href={project.link} className="project-link">Learn More →</a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default Projects
