import React, { useState, useEffect } from 'react';
import { Link } from 'react-scroll';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowDown } from '@fortawesome/free-solid-svg-icons';
import './Hero.css';
import { useAuth } from '../context/AuthContext';
import { db } from '../firebase';
import { doc, getDoc } from 'firebase/firestore';

const Hero = () => {
  const [textIndex, setTextIndex] = useState(0);
  const [text, setText] = useState('');
  const { username } = useAuth();
  const [languages, setLanguages] = useState([{ language: 'Default', text: 'Hi There,' }]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setTextIndex((textIndex + 1) % languages.length);
      setText('');
    }, 5000);
    return () => clearTimeout(timer);
  }, [textIndex, languages]);

  useEffect(() => {
    const typewriterTimer = setTimeout(() => {
      const base = languages[textIndex]?.text || '';
      const target = username ? `${base}, ${username}!` : base;
      if (text.length < target.length) {
        setText(target.substring(0, text.length + 1));
      }
    }, 150);

    return () => clearTimeout(typewriterTimer);
  }, [text, textIndex, languages, username]);

  // Restart typing when username changes (login/logout)
  useEffect(() => {
    setText('');
  }, [username]);

  // Load custom welcome languages from Firestore profile
  useEffect(() => {
    const load = async () => {
      try {
        const prof = await getDoc(doc(db, 'content', 'profile'));
        if (prof.exists() && Array.isArray(prof.data().welcomeLanguages) && prof.data().welcomeLanguages.length) {
          const arr = prof.data().welcomeLanguages.map((t) => ({ language: 'Custom', text: t }));
          setLanguages(arr);
          setTextIndex(0);
          setText('');
        }
      } catch (_) {}
    };
    load();
  }, []);

  return (
    <section id="hero" className="h-screen flex flex-col justify-center items-center bg-hero-bg text-text-color relative">
      <div className="text-left max-w-3xl mx-auto px-4 absolute top-1/2 transform -translate-y-1/2">
        <div className="mb-2 h-12 margin-change">
          <h1 className="lang-change text-4xl font-overpass font-black">{text}</h1>
        </div>
        <div className="mb-4">
          <h2 className="text-change text-2xl font-merriweather">Check out below to know more about me!!</h2>
        </div>
      </div>
      <div className="flex justify-center absolute bottom-10">
        <Link to="about" smooth={true} duration={500} className="text-change sm:text-sm bg-button-bg text-text-color py-2 px-4 rounded cursor-pointer font-overpass animate-bounce flex items-center">
          Scroll Down
          <FontAwesomeIcon icon={faArrowDown} className="ml-2" />
        </Link>
      </div>
    </section>
  );
};

export default Hero;
