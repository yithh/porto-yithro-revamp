import React, { useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Leadership from '../assets/Leadership.png';
import Organizing from '../assets/Organizing.png';
import Thinking from '../assets/Thinking.png';
import Language from '../assets/Language.png';
import Communication from '../assets/Communication.png';
import Technical from '../assets/Technical.png';
import { getChipStyle, getBorderStyle } from '../constants/skillColors';

const skillLogos = {
  Leadership: Leadership,
  Organizing: Organizing,
  Thinking: Thinking,
  Language: Language,
  Communication: Communication,
  Technical: Technical,
};

const SkillsWheel = ({ skillsData }) => {
  const skills = useMemo(() => {
    if (skillsData && skillsData.length) {
      return skillsData.map((d) => ({
        name: d.name,
        logo: skillLogos[d.name] || Technical,
        details: Array.isArray(d.details) ? d.details : [],
      }));
    }
    // If no data yet, show categories with logos and empty details
    return Object.keys(skillLogos).map((name) => ({ name, logo: skillLogos[name], details: [] }));
  }, [skillsData]);
  const [selectedSkill, setSelectedSkill] = useState(null);
  const [rotation, setRotation] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  // hover state removed as it's unused

  // Refs for precise control and performance
  const wheelRef = useRef(null);
  const lastAngleRef = useRef(null);
  const lastTsRef = useRef(null);
  const velocityRef = useRef(0); // deg/sec
  const rafRef = useRef(null);
  const dragMovedRef = useRef(false);

  // Derived paused flag: pause on drag, hover, or when description is open
  // Keep spinning on hover and when a skill is selected; pause only while dragging
  const isPaused = isDragging;

  // Config: enable snapping to the nearest skill at the top on release
  const SNAP_ON_RELEASE = true;

  const handleSkillClick = (skill) => {
    setSelectedSkill(selectedSkill === skill ? null : skill); // Toggle selection
  };

  const getAngleFromCenter = (clientX, clientY) => {
    if (!wheelRef.current) return 0;
    const rect = wheelRef.current.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const dx = clientX - cx;
    const dy = clientY - cy;
    return Math.atan2(dy, dx) * (180 / Math.PI);
  };

  const normalizeDiff = (diff) => {
    // Keep angular difference within [-180, 180] for smoothness
    let d = diff;
    while (d > 180) d -= 360;
    while (d < -180) d += 360;
    return d;
  };

  const handlePointerDown = (e) => {
    dragMovedRef.current = false;
    const angle = getAngleFromCenter(e.clientX, e.clientY);
    lastAngleRef.current = angle;
    lastTsRef.current = performance.now();
    velocityRef.current = 0;
    setIsDragging(true);
  };

  const handlePointerMove = (e) => {
    if (!isDragging || lastAngleRef.current == null) return;
    const currentAngle = getAngleFromCenter(e.clientX, e.clientY);
    const rawDiff = currentAngle - lastAngleRef.current;
    const angleDiff = normalizeDiff(rawDiff);
    if (Math.abs(angleDiff) > 0.5) dragMovedRef.current = true;

    const now = performance.now();
    const dt = Math.max(1, now - (lastTsRef.current || now)) / 1000; // seconds
    const instVel = angleDiff / dt; // deg/sec
    velocityRef.current = instVel;
    lastTsRef.current = now;
    lastAngleRef.current = currentAngle;

    setRotation((prev) => prev + angleDiff);
  };

  const handlePointerUp = (e) => {
    lastAngleRef.current = null;
    lastTsRef.current = null;
    setIsDragging(false); // inertia and/or auto-rotate resumes in rAF

    if (SNAP_ON_RELEASE) {
      // Compute the displayed skills and snap the closest one to the top (-90deg)
      const displayed = skills
        .filter((skill) => selectedSkill !== skill.name)
        .slice(0, selectedSkill ? 5 : 6);
      const N = selectedSkill ? 5 : 6;
      const targetDeg = -90; // top position

      let best = { idx: 0, diff: Number.POSITIVE_INFINITY };
      for (let i = 0; i < displayed.length; i++) {
        const baseDeg = (i / N) * 360; // position without rotation
        const effectiveDeg = baseDeg + rotation; // current position
        const diff = normalizeDiff(effectiveDeg - targetDeg);
        const adiff = Math.abs(diff);
        if (adiff < best.diff) best = { idx: i, diff };
      }
      // Adjust rotation so the best item lands at the top
      setRotation((r) => r - best.diff);
      velocityRef.current = 0; // stop inertia once snapped
    }
  };

  const handlePointerCancel = (e) => {
    lastAngleRef.current = null;
    lastTsRef.current = null;
    setIsDragging(false);
  };

  // Auto-rotate + inertia using requestAnimationFrame
  useEffect(() => {
    const BASE_SPEED = 12; // deg/sec when idle
    const FRICTION = 0.96; // inertial decay per frame (~60fps)

    const tick = (ts) => {
      // simple dt tracking inside tick to keep spin consistent even if tab throttles
      if (!lastTsRef.current) lastTsRef.current = ts;
      const dt = (ts - lastTsRef.current) / 1000; // seconds
      lastTsRef.current = ts;

      if (!isPaused) {
        let vel = velocityRef.current;
        if (Math.abs(vel) > 0.1) {
          setRotation((r) => r + vel * dt);
          // apply friction to gradually slow down
          velocityRef.current = vel * Math.pow(FRICTION, Math.max(1, dt * 60));
        } else {
          setRotation((r) => r + BASE_SPEED * dt);
        }
      }

      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
      lastTsRef.current = null;
    };
  }, [isPaused]);

  const handleCloseDescription = () => {
    setSelectedSkill(null);
  };

  const handleSkillItemClick = (e, name) => {
    setSelectedSkill((prev) => (prev === name ? null : name));
  };

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        handleCloseDescription();
      }
    };
  
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  return (
    <div className="scale-[.6] md:scale-80 lg:scale-[.85] xl:scale-100 md:mb-10 w-full h-[550px] flex items-center justify-center flex-col lg:flex-row">
      <div className="flex items-center justify-center">
        {/* Skills Wheel */}
        <div
          ref={wheelRef}
          className="relative w-96 h-96 select-none"
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerCancel}
          
        >
          <svg
          className="absolute top-1/2 left-1/2 w-28 h-28 -mt-14 -ml-14"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          style={{ transform: `rotate(${rotation}deg)` }}>

          <path d="M12 15C13.6569 15 15 13.6569 15 12C15 10.3431 13.6569 9 12 9C10.3431 9 9 10.3431 9 12C9 13.6569 10.3431 15 12 15Z" stroke="#4A5568" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M19.4 15C19.2669 15.3016 19.2272 15.6362 19.286 15.9606C19.3448 16.285 19.4995 16.5843 19.73 16.82L19.79 16.88C19.976 17.0657 20.1235 17.2863 20.2241 17.5291C20.3248 17.7719 20.3766 18.0322 20.3766 18.295C20.3766 18.5578 20.3248 18.8181 20.2241 19.0609C20.1235 19.3037 19.976 19.5243 19.79 19.71C19.6043 19.896 19.3837 20.0435 19.1409 20.1441C18.8981 20.2448 18.6378 20.2966 18.375 20.2966C18.1122 20.2966 17.8519 20.2448 17.6091 20.1441C17.3663 20.0435 17.1457 19.896 16.96 19.71L16.9 19.65C16.6643 19.4195 16.365 19.2648 16.0406 19.206C15.7162 19.1472 15.3816 19.1869 15.08 19.32C14.7842 19.4468 14.532 19.6572 14.3543 19.9255C14.1766 20.1938 14.0813 20.5082 14.08 20.83V21C14.08 21.5304 13.8693 22.0391 13.4942 22.4142C13.1191 22.7893 12.6104 23 12.08 23C11.5496 23 11.0409 22.7893 10.6658 22.4142C10.2907 22.0391 10.08 21.5304 10.08 21V20.91C10.0723 20.579 9.96512 20.258 9.77251 19.9887C9.5799 19.7194 9.31074 19.5143 9 19.4C8.69838 19.2669 8.36381 19.2272 8.03941 19.286C7.71502 19.3448 7.41568 19.4995 7.18 19.73L7.12 19.79C6.93425 19.976 6.71368 20.1235 6.47088 20.2241C6.22808 20.3248 5.96783 20.3766 5.705 20.3766C5.44217 20.3766 5.18192 20.3248 4.93912 20.2241C4.69632 20.1235 4.47575 19.976 4.29 19.79C4.10405 19.6043 3.95653 19.3837 3.85588 19.1409C3.75523 18.8981 3.70343 18.6378 3.70343 18.375C3.70343 18.1122 3.75523 17.8519 3.85588 17.6091C3.95653 17.3663 4.10405 17.1457 4.29 16.96L4.35 16.9C4.58054 16.6643 4.73519 16.365 4.794 16.0406C4.85282 15.7162 4.81312 15.3816 4.68 15.08C4.55324 14.7842 4.34276 14.532 4.07447 14.3543C3.80618 14.1766 3.49179 14.0813 3.17 14.08H3C2.46957 14.08 1.96086 13.8693 1.58579 13.4942C1.21071 13.1191 1 12.6104 1 12.08C1 11.5496 1.21071 11.0409 1.58579 10.6658C1.96086 10.2907 2.46957 10.08 3 10.08H3.09C3.42099 10.0723 3.742 9.96512 4.0113 9.77251C4.28059 9.5799 4.48572 9.31074 4.6 9C4.73312 8.69838 4.77282 8.36381 4.714 8.03941C4.65519 7.71502 4.50054 7.41568 4.27 7.18L4.21 7.12C4.02405 6.93425 3.87653 6.71368 3.77588 6.47088C3.67523 6.22808 3.62343 5.96783 3.62343 5.705C3.62343 5.44217 3.67523 5.18192 3.77588 4.93912C3.87653 4.69632 4.02405 4.47575 4.21 4.29C4.39575 4.10405 4.61632 3.95653 4.85912 3.85588C5.10192 3.75523 5.36217 3.70343 5.625 3.70343C5.88783 3.70343 6.14808 3.75523 6.39088 3.85588C6.63368 3.95653 6.85425 4.10405 7.04 4.29L7.1 4.35C7.33568 4.58054 7.63502 4.73519 7.95941 4.794C8.28381 4.85282 8.61838 4.81312 8.92 4.68H9C9.29577 4.55324 9.54802 4.34276 9.72569 4.07447C9.90337 3.80618 9.99872 3.49179 10 3.17V3C10 2.46957 10.2107 1.96086 10.5858 1.58579C10.9609 1.21071 11.4696 1 12 1C12.5304 1 13.0391 1.21071 13.4142 1.58579C13.7893 1.96086 14 2.46957 14 3V3.09C14.0013 3.41179 14.0966 3.72618 14.2743 3.99447C14.452 4.26276 14.7042 4.47324 15 4.6C15.3016 4.73312 15.6362 4.77282 15.9606 4.714C16.285 4.65519 16.5843 4.50054 16.82 4.27L16.88 4.21C17.0657 4.02405 17.2863 3.87653 17.5291 3.77588C17.7719 3.67523 18.0322 3.62343 18.295 3.62343C18.5578 3.62343 18.8181 3.67523 19.0609 3.77588C19.3037 3.87653 19.5243 4.02405 19.71 4.21C19.896 4.39575 20.0435 4.61632 20.1441 4.85912C20.2448 5.10192 20.2966 5.36217 20.2966 5.625C20.2966 5.88783 20.2448 6.14808 20.1441 6.39088C20.0435 6.63368 19.896 6.85425 19.71 7.04L19.65 7.1C19.4195 7.33568 19.2648 7.63502 19.206 7.95941C19.1472 8.28381 19.1869 8.61838 19.32 8.92V9C19.4468 9.29577 19.6572 9.54802 19.9255 9.72569C20.1938 9.90337 20.5082 9.99872 20.83 10H21C21.5304 10 22.0391 10.2107 22.4142 10.5858C22.7893 10.9609 23 11.4696 23 12C23 12.5304 22.7893 13.0391 22.4142 13.4142C22.0391 13.7893 21.5304 14 21 14H20.91C20.5882 14.0013 20.2738 14.0966 20.0055 14.2743C19.7372 14.452 19.5268 14.7042 19.4 15Z" stroke="#4A5568" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>

          <motion.div
            className="absolute w-full h-full"
            animate={{ rotate: rotation }}
            transition={{ duration: 0, ease: 'linear' }}
          >
            {(() => {
              const displayed = skills
                .filter((skill) => selectedSkill !== skill.name)
                .slice(0, selectedSkill ? 5 : 6);
              const N = selectedSkill ? 5 : 6;

              return displayed.map((skill, index) => {
                const angle = (index / N) * (2 * Math.PI); // Adjust circle division based on number of skills
                const radius = 200; // Distance from center
                const x = Math.cos(angle) * radius;
                const y = Math.sin(angle) * radius;

                return (
                  <motion.div
                    key={skill.name}
                    className={`absolute flex items-center justify-center cursor-pointer focus:outline-none ${
                      selectedSkill ? 'filter blur-sm' : '' // Apply blur when a skill is selected
                    }`}
                    style={{
                      left: `calc(50% + ${x}px - 3.75rem)`, // Adjust to accommodate larger size
                      top: `calc(50% + ${y}px - 3.75rem)`,
                      width: '7.5rem',
                      height: '7.5rem',
                      transform: `rotate(${-rotation}deg)`, // Counter rotation to keep logo upright
                    }}
                    role="button"
                    tabIndex={0}
                    aria-pressed={selectedSkill === skill.name}
                    onClick={(e) => handleSkillItemClick(e, skill.name)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        handleSkillItemClick(e, skill.name);
                      }
                    }}
                    >
                    <img
                      src={skill.logo}
                      alt={skill.name}
                      className={`w-full h-full rounded-full object-contain select-none shadow-lg transition-transform duration-200 hover:scale-110 active:scale-90`}
                      draggable="false"/>
                  </motion.div>
                );
              });
            })()}
          </motion.div>

          {/* Center the selected skill's logo and increase its size */}
          {selectedSkill && (
            <motion.div
              key={selectedSkill}
              className="flex flex-col absolute top-1/2 left-1/2 flex items-center justify-center cursor-pointer"
              style={{
                zIndex: 10,
                width: '10rem',
                height: '10rem',
                marginTop: '-4.5rem',
                marginLeft: '-4.5rem',
              }}
              onClick={() => handleSkillClick(selectedSkill)} // Allow unselecting the skill
            >
              <img
                src={skills.find((skill) => skill.name === selectedSkill).logo}
                alt={selectedSkill}
                className="w-full h-full object-contain pointer-events-none select-none rounded-full"
                style={getBorderStyle(selectedSkill, 4)}
                draggable="false" // Disable drag and drop
              />
              <h2 className="text-white text-2xl font-semibold border-t-2 mt-3 px-3">{selectedSkill}</h2>
            </motion.div>
          )}
        </div>
      </div>

      {/* Description Box */}
      <AnimatePresence>
        {selectedSkill && (
          <motion.div
            className={`lg:ml-36 mt-10 lg:mt-0 w-full lg:w-128 bg-gray-800 p-4 rounded-lg`}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
          >
            <h2 className="text-white font-bold text-justify m-2 pb-2 text-2xl border-b-2">{selectedSkill}</h2>
            <div className="flex flex-wrap gap-2 mx-2 mt-3 w-full">
              {skills
                .find((skill) => skill.name === selectedSkill)
                .details.map((detail, idx) => (
                  <span key={idx} className="inline-flex items-center px-2 py-1 rounded-full font-semibold" style={getChipStyle(selectedSkill)}>
                    {detail}
                  </span>
                ))}
            </div>
            <button
              className="mt-4 py-1 px-8 border-red-400 rounded-lg text-white bg-red-400 hover:scale-105 active:scale-95 active:bg-white active:text-red-400 transition-transform duration-200 font-bold"
              onClick={handleCloseDescription}>
              Close
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SkillsWheel;
