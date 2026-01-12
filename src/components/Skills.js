import React, { useEffect, useState } from 'react';
import SkillsWheel from "./SkillsWheel";
import { db } from '../firebase';
import { collection, onSnapshot } from 'firebase/firestore';

function SkillsSection() {
  const [skillsData, setSkillsData] = useState(null);

  useEffect(() => {
    const ref = collection(db, 'skills');
    const unsub = onSnapshot(ref, (snap) => {
      const arr = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      setSkillsData(arr.length ? arr : null);
    }, () => {
      // ignore errors, fallback to defaults inside wheel
      setSkillsData(null);
    });
    return () => unsub();
  }, []);

  return (
    <section id="skills" className="h-[620px] md:h-max pt-24 bg-hero-bg text-text-color overflow-hidden">
      <h2 className="text-4xl font-overpass md:mb-6 font-black">Skills</h2>
      <SkillsWheel skillsData={skillsData} />
    </section>
  );
}

export default SkillsSection;