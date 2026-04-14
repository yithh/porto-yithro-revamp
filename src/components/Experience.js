import React, { useEffect, useState } from 'react';
import { db } from '../firebase';
import { collection, onSnapshot, orderBy, query } from 'firebase/firestore';
import Timeline from './Timeline';

const Experience = () => {
  const [items, setItems] = useState([]);

  useEffect(() => {
    const q = query(collection(db, 'experience'), orderBy('startDate', 'desc'));
    const unsub = onSnapshot(q, (snapshot) => {
      const arr = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
      setItems(arr);
    }, () => setItems([]));
    return () => unsub();
  }, []);

  const toMMMYYYY = (s) => {
    if (!s) return '';
    const lower = String(s).toLowerCase();
    if (lower.includes('present')) return 'Present';
    // Handle YYYY or YYYY-MM or YYYY-MM-DD
    const isoMatch = /^\d{4}(-\d{1,2}){0,2}$/;
    let d;
    if (isoMatch.test(s)) {
      const parts = s.split('-').map((p) => parseInt(p, 10));
      const year = parts[0];
      const month = parts[1] ? Math.min(Math.max(parts[1], 1), 12) - 1 : 0;
      d = new Date(Date.UTC(year, month, 1));
    } else {
      d = new Date(s);
    }
    if (isNaN(d.getTime())) return s; // fallback to raw
    return d.toLocaleString('en-US', { month: 'short', year: 'numeric', timeZone: 'UTC' });
  };

  const timelineItems = items.map((exp) => ({
    id: exp.id,
    title: exp.role || 'Role',
    subtitle: exp.company || 'Company',
    // Minimal meta: location left, date right
    metaLeft: exp.location || '',
    metaRight: exp.startDate ? `${toMMMYYYY(exp.startDate)} — ${exp.endDate ? toMMMYYYY(exp.endDate) : 'Present'}` : '',
    description: exp.description || '',
    bullets: Array.isArray(exp.highlights) ? exp.highlights : [],
    icon: 'briefcase',
  }));

  return (
    <section id="experience" className="pt-24 pb-14 bg-hero-bg text-text-color">
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-4xl font-overpass font-black text-center">Experience</h2>
        <div className="w-24 h-1 bg-accent-color mx-auto mt-3 mb-6 rounded" />
        <Timeline items={timelineItems} variant="line-left" />
      </div>
    </section>
  );
};

export default Experience;
