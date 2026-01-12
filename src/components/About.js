import React, { useEffect, useState } from 'react';
import pp from '../assets/profpic.png';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faLinkedin, faGithub, faInstagram } from '@fortawesome/free-brands-svg-icons';
import './Footer.css';
import { db } from '../firebase';
import { doc, getDoc } from 'firebase/firestore';

const About = () => {
  const [aboutText, setAboutText] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        // Prefer profile.about if exists
        const prof = await getDoc(doc(db, 'content', 'profile'));
        if (prof.exists() && prof.data().about) {
          setAboutText(prof.data().about);
          return;
        }
      } catch (_) {}
      try {
        const snap = await getDoc(doc(db, 'content', 'about'));
        if (snap.exists()) {
          const t = snap.data().text;
          if (t) setAboutText(t);
        }
      } catch (_) {}
    };
    load();
  }, []);

  return (
    <section id="about" className="pt-24 pb-14 bg-about-bg text-text-color">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-4xl font-overpass mb-8 font-black pb-2">About Me</h2>
        <div className="scale-[.9] xl:scale-100 ">
          <div className="flex flex-col lg:flex-row justify-center items-center">
            <img src={pp} alt="Profile" className="rounded-full w-60 h-60 mb-12 lg:mb-0 lg:mr-12 lg:mt-0" />
            <div className="max-w-lg bg-box-bg p-6 rounded-lg shadow-md">
              <p className="text-lg font-merriweather text-box-text font-regular mr-6 ml-5 w-auto text-justify leading-loose tracking-wide">
                {aboutText ? (
                  <span dangerouslySetInnerHTML={{ __html: aboutText }} />
                ) : (
                  'Add your About content in the Admin page.'
                )}
              </p>
            </div>
          </div>
          <div className="flex justify-center mt-8 space-x-4 gap-8">
            {/* <a
              href="/path/to/your/cv.pdf"
              download="Yithro_Paulus_Tjendra_CV.pdf"
              draggable="false"
            >
              <button className="bg-button-bg text-white font-bold py-2 px-8 w-44 ring-2 ring-hint-color rounded-md hover:scale-105 active:scale-95 active:bg-white active:bg-accent-color active:text-button-bg active:ring-0 transition-transform duration-200">
                Download CV
              </button>
            </a> */}
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
        </div>
      </div>
    </section>
  );
};

export default About;
