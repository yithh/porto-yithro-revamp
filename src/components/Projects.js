import React, { useState } from 'react';
import './Project.css';
import { skillHex } from '../constants/skillColors';

const Projects = ({ projects }) => {
  const [selectedFilters, setSelectedFilters] = useState([]);

  const skillsList = ['Communication', 'Leadership', 'Thinking', 'Organizing', 'Technical', 'Language'];

  const moreColor = '#C3BABA';

  const toggleFilter = (filter) => {
    let newSelectedFilters = [...selectedFilters];
    if (newSelectedFilters.includes(filter)) {
      newSelectedFilters = newSelectedFilters.filter((f) => f !== filter);
    } else {
      newSelectedFilters.push(filter);
    }
    setSelectedFilters(newSelectedFilters);
  };

  const handleShowAll = () => {
    setSelectedFilters([]);
  };

  const filteredProjects = selectedFilters.length === 0
    ? projects
    : projects.filter((project) =>
        selectedFilters.every((filter) =>
          project.skills.some(skill => skill.parent === filter || skill.details.includes(filter))
        )
      );

  // Sort projects by date
  const sortedProjects = filteredProjects.sort((a, b) => {
    if (!a.date && b.date) {
      return -1; // a has an empty date, b does not, so a comes first
    }
    if (a.date && !b.date) {
      return 1; // b has an empty date, a does not, so b comes first
    }
    const dateA = new Date(a.date.replace(/[()]/g, '')); // Remove parentheses and convert to Date
    const dateB = new Date(b.date.replace(/[()]/g, ''));
    return dateB - dateA; // Sort in descending order
  });

  // Helper function to limit skills for the front card
  const getLimitedSkills = (skills) => {
    let displayedSkills = [];
    let remainingSkills = [];

    skills.forEach((skillGroup) => {
      const parent = skillGroup.parent;
      const color = skillHex[parent] || '#ccc';

      if (skillGroup.details.length > 0) {
        displayedSkills.push({
          parent,
          color,
          details: [skillGroup.details[0]],
        });

        skillGroup.details.slice(1).forEach((detail) => {
          remainingSkills.push({
            parent,
            color,
            details: [detail],
          });
        });
      }
    });

    while (displayedSkills.length < 8 && remainingSkills.length > 0) {
      displayedSkills.push(remainingSkills.shift());
    }

    return {
      displayedSkills,
      remainingSkills,
    };
  };

  const [openCardIndex, setOpenCardIndex] = useState(null);

  const handleCardClick = (index) => {
    setOpenCardIndex(openCardIndex === index ? null : index);
  };

  return (
    <section id="projects" className="py-12 md:py-20 bg-about-bg text-text-color">
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-4xl font-overpass md:mb-6 font-black">Projects</h2>

        {/* Filter buttons */}
        <div className="scale-[.7] md:scale-[.8] xl:scale-100 filter-buttons">
          <label className={`rounded-md filter-button button-hover-effect ${selectedFilters.length === 0 ? 'active' : ''}`}>
            <input
              type="checkbox"
              name="showAll"
              checked={selectedFilters.length === 0}
              onChange={handleShowAll}
            />
            Show All
          </label>
          {skillsList.map((skill) => (
            <label key={skill} className={`rounded-md filter-button button-hover-effect ${selectedFilters.includes(skill) ? 'active' : ''}`}>
              <input
                type="checkbox"
                name={skill}
                checked={selectedFilters.includes(skill)}
                onChange={() => toggleFilter(skill)}
              />
              {skill}
            </label>
          ))}
        </div>

        {/* Projects display */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 justify-items-center">
          {sortedProjects.map((project, index) => {
            const { displayedSkills, remainingSkills } = getLimitedSkills(project.skills);
            const showAndMore = remainingSkills.length > 0;

            return (
              <div
                key={project.id}
                className={`flip-card w-full max-w-md ${openCardIndex === index ? 'open' : ''}`}
                onClick={() => handleCardClick(index)}
              >
                <div className="flip-card-inner w-[392px]">
                  <div className="flip-card-front">
                    <div className="thumbnail-container">
                      <img
                        src={project.thumbnail ? project.thumbnail : 'https://developers.elementor.com/docs/assets/img/elementor-placeholder-image.png'}
                        alt={project.title}
                        className="thumbnail-overlay"
                      />
                    </div>
                    <h3 className="text-2xl xl:text-3xl font-bold my-2">{project.title}</h3>
                    <p
                      className={`status-button text-md lg:text-lg lg:text-xl font-semibold ${project.status === 'Done' ? 'status-done' : 'status-ongoing'}`}
                    >
                      {project.status === 'Done'
                        ? `Done, ${project.date}`
                        : 'On Going'}
                    </p>
                    <div className="scale-[.8] xl:scale-100 skill-grid mt-6 border-t-2 border-black mx-6 pt-2">
                      {/* Display up to 8 skills */}
                      {displayedSkills.map((skillGroup, index) => (
                        <span
                          key={index}
                          className="scale-[.9] xl:scale-100 skill-tag"
                          style={{ backgroundColor: skillHex[skillGroup.parent] || '#ccc', color: '#fff' }}
                        >
                          {skillGroup.details[0]}
                        </span>
                      ))}
                      {/* Show "and more..." if there are more than 8 skills */}
                      {showAndMore && (
                        <span className="scale-[.9] xl:scale-100 skill-tag and-more-tag" style={{ backgroundColor: moreColor, color: '#000' }}>and more...</span>
                      )}
                    </div>
                  </div>
                  <div className="scale-[.9] xl:scale-100 flip-card-back">
                    <h3 className="text-xl md:text-2xl xl:text-3xl font-bold border-b-2 mb-2 mt-2 px-2">{project.title}</h3>
                    <div className="scale-[.8] xl:scale-100 skill-grid-back">
                      {project.skills.map((skillGroup) =>
                        skillGroup.details.map((subSkill) => (
                          <span
                            key={subSkill}
                            className="skill-tag"
                            style={{ backgroundColor: skillHex[skillGroup.parent] || '#ccc', color: '#fff' }}
                          >
                            {subSkill}
                          </span>
                        ))
                      )}
                    </div>
                    <div className="text-xs md:text-sm mx-5 mb-4 text-justify max-h-40">
                      <p className='text-lg mb-2 font-bold underline underline-offset-2'>Description:</p>
                      {project.description}
                    </div>
                    <div className='scale-[.8] md:scale-90 lg:scale-100 flex flex-wrap gap-2 my-2 justify-center text-sm'>
                      {project.githubLink && (
                        <a
                          href={project.githubLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="h-10 w-40 bg-button-bg text-text-color py-2 px-4 rounded block text-center button-hover-effect"
                        >
                          View GitHub
                        </a>
                      )}
                      {project.figmaLink && (
                        <a
                          href={project.figmaLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="h-10 w-40 bg-button-bg text-text-color py-2 px-4 rounded block text-center button-hover-effect"
                        >
                          View Prototype
                        </a>
                      )}
                      {project.documentationLink && (
                        <a
                          href={project.documentationLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="h-10 w-40 bg-button-bg text-text-color py-2 px-4 rounded block text-center button-hover-effect"
                        >
                          View Documents
                        </a>
                      )}
                      {project.webLink && (
                        <a
                          href={project.webLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="h-10 w-40 bg-button-bg text-text-color py-2 px-4 rounded block text-center button-hover-effect"
                        >
                          View Demo
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};


export default Projects;
