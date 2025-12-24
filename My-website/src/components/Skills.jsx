function Skills() {
  const skillCategories = [
    {
      title: 'Frontend Development',
      description: 'React, JavaScript, HTML5, CSS3, Responsive Design, UI/UX'
    },
    {
      title: 'Backend Development',
      description: 'Node.js, Express, RESTful APIs, Database Design'
    },
    {
      title: 'Tools & Technologies',
      description: 'Git, Vite, npm, VS Code, Chrome DevTools'
    },
    {
      title: 'Soft Skills',
      description: 'Problem Solving, Team Collaboration, Communication, Time Management'
    }
  ]

  return (
    <section className="section" id="skills">
      <div className="container">
        <h2 className="section-title">Skills & Expertise</h2>
        <div className="skills-grid">
          {skillCategories.map((skill, index) => (
            <div key={index} className="skill-card">
              <h3>{skill.title}</h3>
              <p>{skill.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default Skills
