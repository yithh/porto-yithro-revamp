import React, { useEffect, useMemo, useState, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { db } from '../firebase';
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  orderBy,
  query,
  setDoc,
  updateDoc,
} from 'firebase/firestore';
// removed local JSON import to clean pre-migration data
import NavBar from '../components/NavBar';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { getChipStyle } from '../constants/skillColors';

// Small tag input component
const TagInput = ({ placeholder = 'Add item and press Enter', tags, onAdd, onRemove }) => {
  const [value, setValue] = useState('');
  const add = () => {
    const v = value.trim();
    if (v && !tags.includes(v)) onAdd(v);
    setValue('');
  };
  return (
    <div>
      <div className="flex flex-wrap gap-2 mb-2">
        {tags.map((t) => (
          <span key={t} className="inline-flex items-center bg-gray-600 text-white px-2 py-1 rounded-full">
            {t}
            <button className="ml-2 text-sm" onClick={() => onRemove(t)}>×</button>
          </span>
        ))}
      </div>
      <div className="flex gap-2">
        <input
          className="flex-1 p-2 rounded bg-gray-800 text-white"
          placeholder={placeholder}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); add(); } }}
        />
        <button className="bg-button-bg text-white px-3 rounded" onClick={add}>Add</button>
      </div>
    </div>
  );
};

const defaultProject = {
  thumbnail: '',
  title: '',
  description: '',
  githubLink: '',
  figmaLink: '',
  documentationLink: '',
  webLink: '',
  status: 'ongoing',
  date: '',
  skills: [],
};

const Admin = () => {
  const { isAdmin, user } = useAuth();
  const [about, setAbout] = useState('');
  // removed savingAbout state as it's unused in UI

  const [skills, setSkills] = useState([]); // [{id,name,details:[]}] 
  const [projects, setProjects] = useState([]);
  const [experiences, setExperiences] = useState([]);

  // Profile (details)
  const [profile, setProfile] = useState({
    welcomeLanguages: [],
    about: '',
    social: { linkedin: '', github: '', instagram: '' },
  });
  const [savingProfile, setSavingProfile] = useState(false);

  const [projectForm, setProjectForm] = useState(defaultProject);
  const [editingProjectId, setEditingProjectId] = useState(null);

  const [activeTab, setActiveTab] = useState('details'); // 'details' | 'skills' | 'projects' | 'experience'

  // Loading and update notification refs
  const skillsInitRef = useRef(false);
  const projectsInitRef = useRef(false);
  const profileInitRef = useRef(false);
  const experienceInitRef = useRef(false);
  
  const loadingToastId = useRef(null);

  

  useEffect(() => {
    const maybeDone = () => {
      if (skillsInitRef.current && projectsInitRef.current && profileInitRef.current && experienceInitRef.current) {
        if (loadingToastId.current) {
          toast.dismiss(loadingToastId.current);
          toast.success('Data loaded');
          loadingToastId.current = null;
        } else {
          toast.dismiss('admin-load');
        }
      }
    };
    // About
    const loadAbout = async () => {
      try {
        const ref = doc(db, 'content', 'about');
        const snap = await getDoc(ref);
        if (snap.exists()) {
          setAbout(snap.data().text || '');
        }
      } catch (_) {}
    };

    // Show loading toast while initial snapshots resolve
    loadingToastId.current = toast.loading('Loading admin data...', { id: 'admin-load' });

    // Skills live
    const skillsQ = query(collection(db, 'skills'));
    const unsubSkills = onSnapshot(skillsQ, (snapshot) => {
      const arr = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
      setSkills(arr);
      if (!skillsInitRef.current) {
        skillsInitRef.current = true;
      } else {
        const changes = snapshot.docChanges().map((c) => c.type);
        if (changes.length > 0) {
          const summary = Array.from(new Set(changes)).join(', ');
          toast.info(`Skills ${summary}`);
        }
      }
      maybeDone();
    });

    // Projects live
    const projQ = query(collection(db, 'projects'), orderBy('date', 'desc'));
    const unsubProjects = onSnapshot(projQ, (snapshot) => {
      const arr = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
      setProjects(arr);
      if (!projectsInitRef.current) {
        projectsInitRef.current = true;
      } else {
        const changes = snapshot.docChanges().map((c) => c.type);
        if (changes.length > 0) {
          const summary = Array.from(new Set(changes)).join(', ');
          toast.info(`Projects ${summary}`);
        }
      }
      maybeDone();
    });

    // Profile live
    const unsubProfile = onSnapshot(doc(db, 'content', 'profile'), (snap) => {
      if (snap.exists()) {
        const data = snap.data();
        setProfile({
          welcomeLanguages: Array.isArray(data.welcomeLanguages) ? data.welcomeLanguages : [],
          about: data.about || '',
          social: {
            linkedin: data.social?.linkedin || '',
            github: data.social?.github || '',
            instagram: data.social?.instagram || '',
          },
        });
      }

      if (!profileInitRef.current) {
        profileInitRef.current = true;
      } else if (snap.exists()) {
        toast.info('Profile updated');
      }
      maybeDone();
    });

    // Experience live
    const expQ = query(collection(db, 'experience'), orderBy('startDate', 'desc'));
    const unsubExperience = onSnapshot(expQ, (snapshot) => {
      const arr = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
      setExperiences(arr);
      if (!experienceInitRef.current) {
        experienceInitRef.current = true;
      } else {
        const changes = snapshot.docChanges().map((c) => c.type);
        if (changes.length > 0) {
          const summary = Array.from(new Set(changes)).join(', ');
          toast.info(`Experience ${summary}`);
        }
      }
      maybeDone();
    });

    // Education removed

    loadAbout();
    return () => {
      unsubSkills();
      unsubProjects();
      unsubProfile();
      unsubExperience();
      
    };
  }, []);

  const saveAbout = async () => {
    try {
      await setDoc(doc(db, 'content', 'about'), { text: about });
      toast.success('About saved');
    } catch (e) {
      console.error(e);
      toast.error('Failed to save About');
    }
  };

  const saveProfile = async () => {
    setSavingProfile(true);
    try {
      await setDoc(doc(db, 'content', 'profile'), profile, { merge: true });
      toast.success('Profile saved');
    } finally {
      setSavingProfile(false);
    }
  };

  const saveSkill = async (skill) => {
    try {
      // Use category name as document ID consistently
      const ref = doc(db, 'skills', skill.name);
      await setDoc(ref, { name: skill.name, details: skill.details || [] }, { merge: true });
      toast.success(`Saved ${skill.name}`);
      await cascadeSkillCleanup(skill.name, new Set(skill.details || []));
    } catch (e) {
      console.error(e);
      toast.error('Failed to save skill');
    }
  };

  // deleteSkill removed as unused

  const startEditProject = (p) => {
    setEditingProjectId(p.id);
    setProjectForm({ ...p });
  };

  const resetProjectForm = () => {
    setEditingProjectId(null);
    setProjectForm(defaultProject);
  };

  const saveProject = async () => {
    // Basic validations
    if (!projectForm.title || projectForm.title.trim().length === 0) {
      toast.error('Please enter a project title');
      return;
    }
    const skillsCount = Array.isArray(projectForm.skills)
      ? projectForm.skills.reduce((acc, g) => acc + (Array.isArray(g.details) ? g.details.length : 0), 0)
      : 0;
    if (skillsCount < 1) {
      toast.error('Please select at least one skill');
      return;
    }

    const payload = { ...projectForm };
    if (!Array.isArray(payload.skills)) payload.skills = [];
    // Ensure skill items have shape {parent, details: []} and only include valid details from Skills tab
    const validMap = new Map(skills.map((s) => [s.name, new Set(Array.isArray(s.details) ? s.details : [])]));
    payload.skills = payload.skills.map((s) => {
      const validSet = validMap.get(s.parent) || new Set();
      const filtered = (Array.isArray(s.details) ? s.details : []).filter((d) => validSet.has(d));
      return { parent: s.parent, details: filtered };
    }).filter((g) => g.details.length > 0);

    try {
      if (editingProjectId) {
        await updateDoc(doc(db, 'projects', editingProjectId), payload);
        toast.success('Project updated');
      } else {
        await addDoc(collection(db, 'projects'), payload);
        toast.success('Project added');
      }
      resetProjectForm();
    } catch (e) {
      console.error(e);
      toast.error('Failed to save project');
    }
  };

  // removed Imgur upload; using link-only for thumbnails

  const removeProject = async (id) => {
    try {
      if (!window.confirm('Delete this project?')) return;
      await deleteDoc(doc(db, 'projects', id));
      if (editingProjectId === id) resetProjectForm();
      toast.success('Project deleted');
    } catch (e) {
      console.error(e);
      toast.error('Failed to delete project');
    }
  };

  const skillParents = useMemo(() => ['Communication','Leadership','Thinking','Organizing','Technical','Language'], []);

  // Experience state + helpers
  const defaultExp = useMemo(() => ({
    company: '',
    role: '',
    location: '',
    startDate: '',
    endDate: '',
    description: '',
    highlights: [],
  }), []);
  const [experienceForm, setExperienceForm] = useState({
    company: '', role: '', location: '', startDate: '', endDate: '', description: '', highlights: [],
  });
  const [editingExpId, setEditingExpId] = useState(null);

  const startEditExperience = (e) => {
    setEditingExpId(e.id);
    setExperienceForm({ ...defaultExp, ...e });
  };
  const resetExperienceForm = () => {
    setEditingExpId(null);
    setExperienceForm(defaultExp);
  };
  const saveExperience = async () => {
    if (!experienceForm.role || !experienceForm.company) {
      toast.error('Role and Company are required');
      return;
    }
    const payload = { ...experienceForm };
    try {
      if (editingExpId) {
        await updateDoc(doc(db, 'experience', editingExpId), payload);
        toast.success('Experience updated');
      } else {
        await addDoc(collection(db, 'experience'), payload);
        toast.success('Experience added');
      }
      resetExperienceForm();
    } catch (e) {
      console.error(e);
      toast.error('Failed to save experience');
    }
  };
  const removeExperience = async (id) => {
    try {
      if (!window.confirm('Delete this experience?')) return;
      await deleteDoc(doc(db, 'experience', id));
      if (editingExpId === id) resetExperienceForm();
      toast.success('Experience deleted');
    } catch (e) {
      console.error(e);
      toast.error('Failed to delete experience');
    }
  };

  // Education removed

  if (!isAdmin) {
    return (
      <>
      <NavBar />
      <section id="admin" className="pt-24 pb-14 bg-about-bg text-text-color">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-overpass mb-6 font-black">Admin</h2>
          <p className="font-merriweather">You are not authorized to view this page.</p>
        </div>
      </section>
      </>
    );
  }

  return (
    <>
      <NavBar />
      <section id="admin" className="pt-12 bg-gray-900 text-white h-screen overflow-hidden flex flex-col">
        {/* Sticky page header under main navbar */}
        <div className="sticky top-20 bg-gray-900 border-b border-gray-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center">
            <h2 className="text-2xl md:text-3xl font-overpass font-black text-white">Admin Panel</h2>
            <div className="ml-auto text-sm text-gray-300">Signed in as <span className="text-white">{user?.email || 'Guest'}</span> {isAdmin ? '(Admin)' : ''}</div>
          </div>
          <ToastContainer position="top-right" autoClose={2000} hideProgressBar theme="dark" />
        </div>

        {/* Admin sub-navbar (sticky under header) */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex gap-3 border-b border-gray-700 pb-2 sticky top-36 z-10 bg-gray-900">
            {['details','skills','projects','experience'].map((tab) => (
              <button
                key={tab}
                className={`px-4 py-2 rounded-t ${activeTab===tab ? 'bg-button-bg text-white' : 'bg-gray-800 text-gray-200 hover:bg-gray-700'}`}
                onClick={() => setActiveTab(tab)}
              >
                {tab.charAt(0).toUpperCase()+tab.slice(1)}
              </button>
            ))}
            <div className="flex-1" />
          </div>
        </div>

        {/* Scrollable content area (container width follows form width) */}
        <div className="flex-1 overflow-y-auto my-6">
          <div className="w-11/12 sm:w-5/6 md:w-4/5 lg:w-3/4 xl:w-7/12 2xl:w-1/2 mx-auto px-4 pt-4">
          {/* DETAILS TAB */}
          {activeTab === 'details' && (
            <div className="bg-gray-800 p-6 rounded-lg shadow-md space-y-6">
              <div>
                <h3 className="text-2xl font-bold mb-3 text-white">Welcome Languages</h3>
                <TagInput
                  tags={profile.welcomeLanguages || []}
                  onAdd={(v) => setProfile((p) => ({...p, welcomeLanguages: [...(p.welcomeLanguages||[]), v]}))}
                  onRemove={(v) => setProfile((p) => ({...p, welcomeLanguages: (p.welcomeLanguages||[]).filter((x)=>x!==v)}))}
                />
              </div>

              <div>
                <h3 className="text-2xl font-bold mb-3 text-white">About Me Content (HTML allowed)</h3>
                <textarea
                  className="w-full h-40 p-3 rounded bg-gray-700 text-white placeholder-gray-400"
                  value={profile.about}
                  onChange={(e) => setProfile((p) => ({...p, about: e.target.value}))}
                />
              </div>

              <div>
                <h3 className="text-2xl font-bold mb-3 text-white">Social Links</h3>
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <label className="block text-sm text-gray-300 mb-1">LinkedIn URL</label>
                    <input className="w-full p-2 rounded bg-gray-700 text-white placeholder-gray-400" placeholder="https://..." value={profile.social.linkedin}
                      onChange={(e) => setProfile((p)=> ({...p, social: {...p.social, linkedin: e.target.value}}))} />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-300 mb-1">GitHub URL</label>
                    <input className="w-full p-2 rounded bg-gray-700 text-white placeholder-gray-400" placeholder="https://..." value={profile.social.github}
                      onChange={(e) => setProfile((p)=> ({...p, social: {...p.social, github: e.target.value}}))} />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-300 mb-1">Instagram URL</label>
                    <input className="w-full p-2 rounded bg-gray-700 text-white placeholder-gray-400" placeholder="https://..." value={profile.social.instagram}
                      onChange={(e) => setProfile((p)=> ({...p, social: {...p.social, instagram: e.target.value}}))} />
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <button onClick={saveProfile} className="bg-button-bg text-white py-2 px-4 rounded hover:scale-105 active:scale-95">{savingProfile ? 'Saving...' : 'Save Details'}</button>
                <button onClick={saveAbout} className="bg-gray-600 text-white py-2 px-4 rounded hover:bg-gray-500">Save About (Legacy)</button>
              </div>
            </div>
          )}

          {/* SKILLS TAB */}
          {activeTab === 'skills' && (
            <div className="bg-gray-800 p-6 rounded-lg shadow-md">
              <h3 className="text-2xl font-bold mb-5">Skills</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {skillParents.map((parent) => {
                  const s = skills.find((x) => x.name === parent) || { name: parent, details: [] };
                  return (
                    <div key={parent} className="p-4 bg-gray-700 rounded">
                      <h4 className="text-xl font-semibold mb-3 text-white">{parent}</h4>
                      <TagInput
                        tags={s.details || []}
                        onAdd={(v) => {
                          const updated = { ...s, details: [...(s.details||[]), v] };
                          setSkills((prev) => {
                            const found = prev.find((x) => x.name === parent);
                            if (found) return prev.map((x) => x.name===parent? updated : x);
                            return [...prev, updated];
                          });
                        }}
                        onRemove={(v) => {
                          const updated = { ...s, details: (s.details||[]).filter((x)=>x!==v) };
                          setSkills((prev) => prev.map((x) => x.name===parent? updated : x));
                        }}
                      />
                      <button onClick={() => saveSkill(s)} className="mt-3 bg-button-bg text-white py-2 px-4 rounded hover:scale-105">Save {parent}</button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* PROJECTS TAB */}
          {activeTab === 'projects' && (
            <div className="bg-gray-800 p-6 rounded-lg shadow-md">
              <h3 className="text-2xl font-bold mb-3">Projects</h3>

              <div className="overflow-x-auto">
                <table className="min-w-full text-sm text-white">
                  <thead>
                    <tr className="text-center">
                      <th className="py-2 pr-4 text-center">Title</th>
                      <th className="py-2 pr-4 text-center">Status</th>
                      <th className="py-2 pr-4 text-center">Date</th>
                      <th className="py-2 pr-4 text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {projects.map((p) => (
                      <tr key={p.id} className="border-t border-gray-700">
                        <td className="py-2 pr-4">{p.title}</td>
                        <td className="py-2 pr-4">{p.status}</td>
                        <td className="py-2 pr-4">{p.date}</td>
                        <td className="py-2 pr-4 flex gap-2">
                          <button onClick={() => startEditProject(p)} className="bg-button-bg text-white py-1 px-3 rounded hover:scale-105">Edit</button>
                          <button onClick={() => removeProject(p.id)} className="bg-red-500 text-white py-1 px-3 rounded hover:bg-red-400">Delete</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="mt-6 p-4 bg-gray-700 rounded">
                <h4 className="text-xl font-semibold mb-2">{editingProjectId ? 'Edit Project' : 'Add Project'}</h4>
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <label className="block text-sm text-gray-300 mb-1">Title</label>
                    <input
                      className="w-full p-2 rounded bg-gray-800 text-white placeholder-gray-400"
                      placeholder="Title (required)"
                      value={projectForm.title}
                      onChange={(e) => setProjectForm({ ...projectForm, title: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-300 mb-1">Thumbnail URL</label>
                    <input className="w-full p-2 rounded bg-gray-800 text-white placeholder-gray-400" placeholder="https://..." value={projectForm.thumbnail} onChange={(e) => setProjectForm({ ...projectForm, thumbnail: e.target.value })} />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-300 mb-1">Status</label>
                    <select className="w-full p-2 rounded bg-gray-800 text-white" value={projectForm.status} onChange={(e) => setProjectForm({ ...projectForm, status: e.target.value })}>
                      <option value="Done">Done</option>
                      <option value="ongoing">ongoing</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm text-gray-300 mb-1">Date</label>
                    <input
                      type="date"
                      className="w-full p-2 rounded bg-gray-800 text-white placeholder-gray-400 disabled:opacity-50 disabled:cursor-not-allowed"
                      placeholder="Date"
                      value={projectForm.date}
                      onChange={(e) => setProjectForm({ ...projectForm, date: e.target.value })}
                      disabled={projectForm.status === 'ongoing'}
                    />
                    {projectForm.status === 'ongoing' && (
                      <p className="mt-1 text-xs text-gray-300">Date is disabled while status is ongoing.</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm text-gray-300 mb-1">GitHub Link</label>
                    <input className="w-full p-2 rounded bg-gray-800 text-white placeholder-gray-400" placeholder="https://..." value={projectForm.githubLink} onChange={(e) => setProjectForm({ ...projectForm, githubLink: e.target.value })} />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-300 mb-1">Figma Link</label>
                    <input className="w-full p-2 rounded bg-gray-800 text-white placeholder-gray-400" placeholder="https://..." value={projectForm.figmaLink} onChange={(e) => setProjectForm({ ...projectForm, figmaLink: e.target.value })} />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-300 mb-1">Documentation Link</label>
                    <input className="w-full p-2 rounded bg-gray-800 text-white placeholder-gray-400" placeholder="https://..." value={projectForm.documentationLink} onChange={(e) => setProjectForm({ ...projectForm, documentationLink: e.target.value })} />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-300 mb-1">Demo (App) Link</label>
                    <input className="w-full p-2 rounded bg-gray-800 text-white placeholder-gray-400" placeholder="https://..." value={projectForm.webLink} onChange={(e) => setProjectForm({ ...projectForm, webLink: e.target.value })} />
                  </div>
                </div>
                <div className="mt-3">
                  <label className="block text-sm text-gray-300 mb-1">Description</label>
                  <textarea className="w-full h-28 p-2 rounded bg-gray-800 text-white placeholder-gray-400" placeholder="Description" value={projectForm.description} onChange={(e) => setProjectForm({ ...projectForm, description: e.target.value })} />
                </div>

                {/* Skills UI for project */}
                <div className="mt-4">
                  <h5 className="font-semibold mb-2">Skills</h5>
                  <ProjectSkillsEditor
                    skillParents={skillParents}
                    skillsAll={skills}
                    value={projectForm.skills || []}
                    onChange={(skillsVal) => setProjectForm((prev) => ({ ...prev, skills: skillsVal }))}
                  />
                </div>

                <div className="mt-4 flex gap-3">
                  <button onClick={saveProject} className="bg-button-bg text-white py-2 px-4 rounded hover:scale-105 active:scale-95">{editingProjectId ? 'Update Project' : 'Add Project'}</button>
                  {editingProjectId && (
                    <button onClick={resetProjectForm} className="bg-gray-600 text-white py-2 px-4 rounded hover:bg-gray-500">Cancel</button>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* EXPERIENCE TAB */}
          {activeTab === 'experience' && (
            <div className="bg-gray-800 p-6 rounded-lg shadow-md">
              <h3 className="text-2xl font-bold mb-3">Experience</h3>
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm text-white">
                  <thead>
                    <tr className="text-center">
                      <th className="py-2 pr-4 text-center">Role</th>
                      <th className="py-2 pr-4 text-center">Company</th>
                      <th className="py-2 pr-4 text-center">Period</th>
                      <th className="py-2 pr-4 text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {experiences.map((e) => (
                      <tr key={e.id} className="border-t border-gray-700">
                        <td className="py-2 pr-4">{e.role}</td>
                        <td className="py-2 pr-4">{e.company}</td>
                        <td className="py-2 pr-4">{e.startDate} {e.endDate ? `— ${e.endDate}` : ''}</td>
                        <td className="py-2 pr-4 flex gap-2">
                          <button onClick={() => startEditExperience(e)} className="bg-button-bg text-white py-1 px-3 rounded hover:scale-105">Edit</button>
                          <button onClick={() => removeExperience(e.id)} className="bg-red-500 text-white py-1 px-3 rounded hover:bg-red-400">Delete</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="mt-6 p-4 bg-gray-700 rounded">
                <h4 className="text-xl font-semibold mb-2">{editingExpId ? 'Edit Experience' : 'Add Experience'}</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-gray-300 mb-1">Role</label>
                    <input className="w-full p-2 rounded bg-gray-800 text-white placeholder-gray-400" value={experienceForm.role} onChange={(e)=>setExperienceForm({...experienceForm, role: e.target.value})} placeholder="e.g. Software Engineer" />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-300 mb-1">Company</label>
                    <input className="w-full p-2 rounded bg-gray-800 text-white placeholder-gray-400" value={experienceForm.company} onChange={(e)=>setExperienceForm({...experienceForm, company: e.target.value})} placeholder="e.g. Acme Inc." />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-300 mb-1">Location</label>
                    <input className="w-full p-2 rounded bg-gray-800 text-white placeholder-gray-400" value={experienceForm.location} onChange={(e)=>setExperienceForm({...experienceForm, location: e.target.value})} placeholder="City, Country" />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-300 mb-1">Start Date</label>
                    <input type="text" className="w-full p-2 rounded bg-gray-800 text-white placeholder-gray-400" value={experienceForm.startDate} onChange={(e)=>setExperienceForm({...experienceForm, startDate: e.target.value})} placeholder="YYYY-MM" />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-300 mb-1">End Date</label>
                    <input type="text" className="w-full p-2 rounded bg-gray-800 text-white placeholder-gray-400" value={experienceForm.endDate} onChange={(e)=>setExperienceForm({...experienceForm, endDate: e.target.value})} placeholder="YYYY-MM or Present" />
                  </div>
                </div>
                <div className="mt-3">
                  <label className="block text-sm text-gray-300 mb-1">Description</label>
                  <textarea className="w-full h-24 p-2 rounded bg-gray-800 text-white placeholder-gray-400" value={experienceForm.description} onChange={(e)=>setExperienceForm({...experienceForm, description: e.target.value})} placeholder="Brief description" />
                </div>
                <div className="mt-3">
                  <label className="block text-sm text-gray-300 mb-1">Highlights</label>
                  <TagInput
                    placeholder="Add highlight and press Enter"
                    tags={experienceForm.highlights || []}
                    onAdd={(v)=> setExperienceForm((f)=> ({...f, highlights: [...(f.highlights||[]), v]}))}
                    onRemove={(v)=> setExperienceForm((f)=> ({...f, highlights: (f.highlights||[]).filter((x)=>x!==v)}))}
                  />
                </div>
                <div className="mt-4 flex gap-3">
                  <button onClick={saveExperience} className="bg-button-bg text-white py-2 px-4 rounded hover:scale-105 active:scale-95">{editingExpId ? 'Update Experience' : 'Add Experience'}</button>
                  {editingExpId && (
                    <button onClick={resetExperienceForm} className="bg-gray-600 text-white py-2 px-4 rounded hover:bg-gray-500">Cancel</button>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Education removed */}
          </div>
        </div>
      </section>
    </>
  );
};

export default Admin;

const cascadeSkillCleanup = async (parentName, validSet) => {
  try {
    const snap = await getDocs(collection(db, 'projects'));
    let updatedCount = 0;
    await Promise.all(snap.docs.map(async (d) => {
      const p = d.data();
      const groups = Array.isArray(p.skills) ? p.skills : [];
      let changed = false;
      const newGroups = groups.map((g) => {
        if (g.parent !== parentName) return g;
        const filtered = (Array.isArray(g.details) ? g.details : []).filter((det) => validSet.has(det));
        if ((g.details ? g.details.length : 0) !== filtered.length) changed = true;
        return { parent: parentName, details: filtered };
      }).filter((g) => g.details && g.details.length > 0);
      if (changed) {
        await updateDoc(d.ref, { skills: newGroups });
        updatedCount += 1;
      }
    }));
    if (updatedCount > 0) toast.info(`Updated ${updatedCount} project(s) due to ${parentName} changes`);
  } catch (e) {
    console.error('Cascade update failed', e);
  }
};

// Editor for selecting parent skill and adding detail tags
const ProjectSkillsEditor = ({ skillParents, skillsAll, value, onChange }) => {
  const [parent, setParent] = useState(skillParents[0]);
  const group = value.find((g) => g.parent === parent) || { parent, details: [] };

  const availableDetails = useMemo(() => {
    const s = (skillsAll || []).find((x) => x.name === parent);
    return Array.isArray(s?.details) ? s.details : [];
  }, [skillsAll, parent]);

  const toggleDetail = (detail) => {
    const exists = group.details.includes(detail);
    const nextDetails = exists
      ? group.details.filter((d) => d !== detail)
      : [...group.details, detail];
    const others = value.filter((g) => g.parent !== parent);
    const next = [...others, { parent, details: nextDetails }].filter((g) => (g.details && g.details.length > 0) || g.parent === parent);
    onChange(next);
  };

  const removeDetailGlobal = (parentName, detail) => {
    const next = value
      .map((g) => g.parent === parentName ? { ...g, details: g.details.filter((x) => x !== detail) } : g)
      .filter((g) => g.details && g.details.length > 0);
    onChange(next);
  };

  return (
    <div className="p-3 bg-gray-700 rounded">
      <div className="flex gap-3 items-center mb-4">
        <label className="text-sm">Category</label>
        <select className="p-2 rounded bg-gray-800 text-white" value={parent} onChange={(e) => setParent(e.target.value)}>
          {skillParents.map((p) => <option key={p} value={p}>{p}</option>)}
        </select>
      </div>

      <div className="mb-3 text-sm text-gray-300">Pick from the existing skills for this category.</div>
      <div className="flex flex-wrap gap-2">
        {availableDetails.length === 0 ? (
          <span className="text-gray-300 text-sm">No skills available under {parent}. Add them in the Skills tab.</span>
        ) : (
          availableDetails.map((detail) => (
            <button
              key={detail}
              type="button"
              onClick={() => toggleDetail(detail)}
              className={`inline-flex items-center px-2 py-1 rounded-full border transition ${
                group.details.includes(detail)
                  ? 'border-transparent'
                  : 'bg-gray-600 text-white border-gray-500 hover:bg-gray-500'
              }`}
              style={group.details.includes(detail) ? getChipStyle(parent) : {}}
            >
              {detail}
            </button>
          ))
        )}
      </div>

      <div className="mt-4">
        <h6 className="font-semibold mb-2">All Selected Skills</h6>
        <div className="flex flex-wrap gap-2">
          {value.flatMap((g) => g.details.map((d) => ({ parent: g.parent, d }))).map(({ parent, d }) => (
            <span key={parent+':'+d} className="inline-flex items-center px-2 py-1 rounded-full" style={getChipStyle(parent)}>
              {parent}: {d}
              <button className="ml-2 text-sm" onClick={() => removeDetailGlobal(parent, d)}>×</button>
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};
