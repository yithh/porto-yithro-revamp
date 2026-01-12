import React, { useState, useRef, useEffect } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import emailjs from '@emailjs/browser';
import './Contact.css'
import { useAuth } from '../context/AuthContext';

const SUBMISSION_LIMIT = 3;
const SUBMISSION_TIMEOUT = 30 * 60 * 1000; // 30 minutes in milliseconds

const Contact = () => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    user_name: '',
    user_email: '',
    message: '',
    phone: ''
  });

  const [errors, setErrors] = useState({});
  const [submissionCount, setSubmissionCount] = useState(0);
  const [lastSubmissionTime, setLastSubmissionTime] = useState(0);
  const form = useRef();

  useEffect(() => {
    const savedSubmissionCount = parseInt(localStorage.getItem('submissionCount'), 10) || 0;
    const savedLastSubmissionTime = parseInt(localStorage.getItem('lastSubmissionTime'), 10) || 0;
    const now = Date.now();
    const timeSinceLastSubmission = now - savedLastSubmissionTime;

    if (timeSinceLastSubmission > SUBMISSION_TIMEOUT) {
      localStorage.setItem('submissionCount', '0');
      setSubmissionCount(0);
    } else {
      setSubmissionCount(savedSubmissionCount);
      setLastSubmissionTime(savedLastSubmissionTime);
    }
  }, []);

  // Autofill name and email from logged-in Google account
  useEffect(() => {
    if (user) {
      setFormData((prev) => ({
        ...prev,
        user_name: user.displayName || prev.user_name || '',
        user_email: user.email || prev.user_email || '',
      }));
    } else {
      // Clear autofilled fields on logout
      setFormData((prev) => ({ ...prev, user_name: '', user_email: '' }));
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });

    validateField(name, value);
  };

  const validateField = (name, value) => {
    const newErrors = {};
    const phoneRegex = /^\d{8,16}$/;

    if (name === 'user_name' && value.length <= 8) {
      newErrors.user_name = 'Name must be more than 8 characters';
    }

    if (name === 'user_email' && (!value.includes('@') || !value.includes('.'))) {
      newErrors.user_email = 'Email must contain @ and .';
    }

    if (name === 'phone' && !phoneRegex.test(value)) {
      newErrors.phone = 'Phone number must be between 8 to 16 digits';
    }

    if (name === 'message' && value.length <= 30) {
      newErrors.message = 'Message must have more than 30 characters';
    }

    setErrors((prevErrors) => ({
      ...prevErrors,
      [name]: newErrors[name] || ''
    }));
  };

  const validate = () => {
    const newErrors = {};
    Object.keys(formData).forEach((key) => {
      validateField(key, formData[key]);
      if (errors[key]) {
        newErrors[key] = errors[key];
      }
    });
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const sendEmail = (e) => {
    e.preventDefault();

    if (!validate()) {
      toast.error('Please fix the errors in the form before submitting.');
      return;
    }

    const now = Date.now();
    const timeSinceLastSubmission = now - lastSubmissionTime;

    if (timeSinceLastSubmission > SUBMISSION_TIMEOUT) {
      localStorage.setItem('submissionCount', '0');
      setSubmissionCount(0);
    }

    if (submissionCount >= SUBMISSION_LIMIT && timeSinceLastSubmission <= SUBMISSION_TIMEOUT) {
      const minutesLeft = Math.ceil((SUBMISSION_TIMEOUT - timeSinceLastSubmission) / 60000);
      toast.error(`You have reached the submission limit. Please wait for ${minutesLeft} more minutes.`);
      return;
    }

    emailjs
      .sendForm('service_rif7a2h', 'template_xos2jif', form.current, '9SMEsFsyUkDO--t0j')
      .then(
        () => {
          toast.success("Your message has been sent");
          setFormData({
            user_name: user?.displayName || '',
            user_email: user?.email || '',
            message: '',
            phone: ''
          });
          setErrors({});
          form.current.reset();

          const newCount = submissionCount + 1;
          localStorage.setItem('submissionCount', newCount.toString());
          localStorage.setItem('lastSubmissionTime', now.toString());
          setSubmissionCount(newCount);
          setLastSubmissionTime(now);
        },
        (error) => {
          console.error('Error:', error);
          toast.error('Failed to send message. Please try again later.');
        }
      );
  };

  return (
    <section id="contact" className="pt-24 pb-14 bg-hero-bg text-text-color flex justify-center items-center">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <h2 className="text-4xl font-overpass mb-8 font-black pb-2">Contact Me</h2>
        <form ref={form} onSubmit={sendEmail} className="text-change space-y-4 max-w-lg mx-auto bg-box-bg p-6 rounded-lg shadow-md relative">
          <div className="relative">
            <label htmlFor="user_name" className="block font-black font-worksans text-box-text text-lg text-left pl-0.5 pt-2">Name: </label>
            <input
              type="text"
              id="user_name"
              name="user_name"
              placeholder="Your Name"
              value={formData.user_name}
              onChange={handleChange}
              required
              className={`mb-5 mt-1 block w-full border rounded-md p-2 pl-3 bg-field-bg text-box-text placeholder-hint-color ${errors.user_name ? 'border-red-500' : 'border-gray-300'}`}
              autoComplete="off"
            />
            {errors.user_name && <p className="absolute text-red-500 text-sm top-16 left-0 z-10">{errors.user_name}</p>}
          </div>
          <div className="mt-6 relative">
            <label htmlFor="user_email" className="block font-black font-worksans text-box-text text-lg text-left pl-0.5 pt-2">Email :</label>
            <input
              type="email"
              id="user_email"
              name="user_email"
              placeholder="Your Email"
              value={formData.user_email}
              onChange={handleChange}
              required
              className={`mb-5 mt-1 block w-full border rounded-md p-2 pl-3 bg-field-bg text-box-text placeholder-hint-color ${errors.user_email ? 'border-red-500' : 'border-gray-300'}`}
              autoComplete="off"
            />
            {errors.user_email && <p className="absolute text-red-500 text-sm top-16 left-0 z-10">{errors.user_email}</p>}
          </div>
          <div className="mt-6 relative">
            <label htmlFor="phone" className="block font-black font-worksans text-box-text text-lg text-left pl-0.5 pt-2">Phone :</label>
            <input
              type="tel"
              id="phone"
              name="phone"
              placeholder="Your Phone"
              value={formData.phone}
              onChange={handleChange}
              required
              className={`mb-5 mt-1 block w-full border rounded-md p-2 pl-3 bg-field-bg text-box-text placeholder-hint-color ${errors.phone ? 'border-red-500' : 'border-gray-300'}`}
              autoComplete="off"
            />
            {errors.phone && <p className="absolute text-red-500 text-sm top-16 left-0 z-10">{errors.phone}</p>}
          </div>
          <div className="mt-6 relative">
            <label htmlFor="message" className="block font-black font-worksans text-box-text text-lg text-left pl-0.5 pt-2">Message :</label>
            <textarea
              id="message"
              name="message"
              placeholder="Your Message"
              value={formData.message}
              onChange={handleChange}
              required
              className={`mt-1 block w-full border rounded-md p-2 pl-3 bg-field-bg text-box-text placeholder-hint-color mb-14 h-28 ${errors.message ? 'border-red-500' : 'border-gray-300'}`}
              autoComplete="off"
            />
            {errors.message && <p className="absolute text-red-500 text-sm top-32 left-0 z-10">{errors.message}</p>}
          </div>
          <button type="submit" className="bg-button-bg text-text-color py-2 px-4 rounded block text-center mt-4 font-overpass mx-auto w-60 button-hover-effect">
            Submit
          </button>
        </form>
      </div>
      <ToastContainer />
    </section>
  );
};

export default Contact;