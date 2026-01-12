import React, { useState } from 'react';
import { Link as ScrollLink } from 'react-scroll';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBars, faTimes } from '@fortawesome/free-solid-svg-icons';
import './NavBar.css';
import { useAuth } from '../context/AuthContext';
import { useLocation, useNavigate } from 'react-router-dom';

const NavBar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, isAdmin, login, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const onHome = location.pathname === (process.env.PUBLIC_URL || '/') || location.pathname === '/';
  const onAdmin = location.pathname.includes('/admin');

  // Navbar stays visible; no hide-on-scroll behavior

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const goAdmin = () => {
    navigate('/admin');
  };

  const goHomeAndHash = (hash) => {
    if (onHome) return; // Home will use scroll links
    navigate({ pathname: '/', hash });
  };

  return (
    <nav className="navbar">
      <div className="max-w-7xl md:mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-20 items-center">
          <div className="flex-shrink-0">
            {onHome ? (
              <ScrollLink
                to="hero"
                smooth={true}
                duration={500}
                offset={-80}
                className="text-xl font-worksans font-bold cursor-pointer logo-link"
                activeClass="active"
              >
                YithroPaulusTjendra
              </ScrollLink>
            ) : (
              <button
                onClick={() => navigate('/')}
                className="text-xl font-worksans font-bold cursor-pointer logo-link"
              >
                YithroPaulusTjendra
              </button>
            )}
          </div>
          <div className="hidden md:flex space-x-8">
            {onHome ? (
            <ScrollLink 
              to="about" 
              smooth={true} 
              duration={500}
              offset={-80}
              className="relative cursor-pointer font-overpass nav-link transition-transform duration-200"
              activeClass="active"
            >
              About Me
            </ScrollLink>
            ) : (
              <button onClick={() => goHomeAndHash('#about')} className="relative cursor-pointer font-overpass nav-link transition-transform duration-200">About Me</button>
            )}
            {onHome ? (
            <ScrollLink 
              to="skills" 
              smooth={true} 
              duration={500}
              offset={-80}
              className="relative cursor-pointer font-overpass nav-link transition-transform duration-200"
              activeClass="active"
            >
              Skills
            </ScrollLink>
            ) : (
              <button onClick={() => goHomeAndHash('#skills')} className="relative cursor-pointer font-overpass nav-link transition-transform duration-200">Skills</button>
            )}
            {onHome ? (
            <ScrollLink 
              to="projects" 
              smooth={true} 
              duration={500}
              offset={-80}
              className="relative cursor-pointer font-overpass nav-link transition-transform duration-200"
              activeClass="active"
            >
              Projects
            </ScrollLink>
            ) : (
              <button onClick={() => goHomeAndHash('#projects')} className="relative cursor-pointer font-overpass nav-link transition-transform duration-200">Projects</button>
            )}
            {onHome ? (
            <ScrollLink 
              to="contact" 
              smooth={true} 
              duration={500}
              offset={-80}
              className="relative cursor-pointer font-overpass nav-link transition-transform duration-200"
              activeClass="active"
            >
              Contact Me
            </ScrollLink>
            ) : (
              <button onClick={() => goHomeAndHash('#contact')} className="relative cursor-pointer font-overpass nav-link transition-transform duration-200">Contact Me</button>
            )}
            {isAdmin && (
              <button onClick={goAdmin} className="ml-4 bg-button-bg text-white py-1 px-3 rounded">
                Admin
              </button>
            )}
            {!user ? (
              <button onClick={login} className="ml-4 bg-button-bg text-white py-1 px-3 rounded">Login</button>
            ) : (
              <button onClick={logout} className="ml-4 bg-red-600 hover:bg-red-700 text-white py-1 px-3 rounded">Logout</button>
            )}
          </div>
          <div className="md:hidden">
            <button onClick={toggleMenu} className="text-xl text-white">
              <FontAwesomeIcon icon={isMenuOpen ? faTimes : faBars} />
            </button>
          </div>
        </div>
        <div className={`mobile-menu md:hidden ${isMenuOpen ? 'show' : ''}`}>
          {onHome ? (
          <ScrollLink 
            to="about" 
            smooth={true} 
            duration={500}
            offset={-80}
            className="block py-2 cursor-pointer font-overpass nav-link" 
            onClick={toggleMenu}
            activeClass="active"
          >
            About Me
          </ScrollLink>
          ) : (
            <button onClick={() => { toggleMenu(); goHomeAndHash('#about'); }} className="block py-2 cursor-pointer font-overpass nav-link">About Me</button>
          )}
          {onHome ? (
          <ScrollLink 
            to="skills" 
            smooth={true} 
            duration={500}
            offset={-80}
            className="block py-2 cursor-pointer font-overpass nav-link" 
            onClick={toggleMenu}
            activeClass="active"
          >
            Skills
          </ScrollLink>
          ) : (
            <button onClick={() => { toggleMenu(); goHomeAndHash('#skills'); }} className="block py-2 cursor-pointer font-overpass nav-link">Skills</button>
          )}
          {onHome ? (
          <ScrollLink 
            to="projects" 
            smooth={true} 
            duration={500}
            offset={-80}
            className="block py-2 cursor-pointer font-overpass nav-link" 
            onClick={toggleMenu}
            activeClass="active"
          >
            Projects
          </ScrollLink>
          ) : (
            <button onClick={() => { toggleMenu(); goHomeAndHash('#projects'); }} className="block py-2 cursor-pointer font-overpass nav-link">Projects</button>
          )}
          {onHome ? (
          <ScrollLink 
            to="contact" 
            smooth={true} 
            duration={500}
            offset={-80}
            className="block py-2 cursor-pointer font-overpass nav-link" 
            onClick={toggleMenu}
            activeClass="active"
          >
            Contact Me
          </ScrollLink>
          ) : (
            <button onClick={() => { toggleMenu(); goHomeAndHash('#contact'); }} className="block py-2 cursor-pointer font-overpass nav-link">Contact Me</button>
          )}
          {isAdmin && (
            <button onClick={() => { toggleMenu(); goAdmin(); }} className="block py-2 cursor-pointer font-overpass bg-button-bg text-white rounded">
              Admin
            </button>
          )}
          {!user ? (
            <button onClick={() => { toggleMenu(); login(); }} className="block py-2 cursor-pointer font-overpass bg-button-bg text-white rounded">
              Login
            </button>
          ) : (
            <button onClick={() => { toggleMenu(); logout(); }} className="block py-2 cursor-pointer font-overpass bg-red-600 hover:bg-red-700 text-white rounded">
              Logout
            </button>
          )}
        </div>
      </div>
    </nav>
  );
};

export default NavBar;
