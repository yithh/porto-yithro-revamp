import './App.css';
import React, { useEffect, useState } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import NavBar from './components/NavBar';
import Hero from './components/Hero';
import About from './components/About';
import Projects from './components/Projects';
import Contact from './components/Contact';
import Footer from './components/Footer';
import Skills from './components/Skills';
import Admin from './pages/Admin';
import { db } from './firebase';
import { collection, onSnapshot, orderBy, query } from 'firebase/firestore';

function Home({ projects }) {
  const location = useLocation();
  useEffect(() => {
    if (location.hash) {
      const id = location.hash.replace('#', '');
      // Delay to ensure sections render
      setTimeout(() => {
        const el = document.getElementById(id);
        if (el) {
          const navHeight = 80; // px
          const top = el.getBoundingClientRect().top + window.pageYOffset - navHeight;
          window.scrollTo({ top, behavior: 'smooth' });
        }
      }, 100);
    }
  }, [location.hash]);
  return (
    <>
      <NavBar />
      <Hero />
      <About />
      <Skills />
      <Projects projects={projects} />
      <Contact />
      <Footer />
    </>
  );
}

function App() {
  const [projects, setProjects] = useState([]);

  useEffect(() => {
    const q = query(collection(db, 'projects'), orderBy('date', 'desc'));
    const unsub = onSnapshot(q, (snapshot) => {
      const arr = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
      setProjects(arr);
    });
    return () => unsub();
  }, []);

  return (
    <div className="App">
      <Routes>
        <Route path="/" element={<Home projects={projects} />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="*" element={<Home projects={projects} />} />
      </Routes>
    </div>
  );
}

export default App;