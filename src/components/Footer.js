import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faLinkedin, faGithub, faInstagram } from '@fortawesome/free-brands-svg-icons';
import './Footer.css';

const Footer = () => {
  return (
    <footer className="py-8 bg-dark-bg text-text-color">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center">
        <p className="font-worksans text-xl font-bold mb-4">© 2024 Yithro Paulus Tjendra. All rights reserved.</p>
        <div className="flex space-x-10">
        <a  href="https://www.linkedin.com/in/yithro-paulus-tjendra"
            target="_blank"
            rel="noopener noreferrer"
            className="social-link">
        <FontAwesomeIcon icon={faLinkedin} />
      </a>
      <a  href="https://github.com/yithh"
          target="_blank"
          rel="noopener noreferrer"
          className="social-link">
        <FontAwesomeIcon icon={faGithub} />
      </a>
      <a  href="https://www.instagram.com/yithh_"
          target="_blank"
          rel="noopener noreferrer"
          className="social-link">
        <FontAwesomeIcon icon={faInstagram} />
      </a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
