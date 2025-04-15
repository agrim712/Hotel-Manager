import React, { useState } from 'react';
import axios from 'axios';

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await axios.post('/api/contact', formData);
      setSubmitStatus({ 
        success: true, 
        message: 'Message sent successfully!' 
      });
      setFormData({ name: '', email: '', phone: '', message: '' });
    } catch (error) {
      let errorMessage = 'Failed to send message. Please try again.';
      if (axios.isAxiosError && error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }
      setSubmitStatus({ 
        success: false, 
        message: errorMessage 
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-10 bg-gray-100 mt-10 rounded-md shadow-md max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold mb-6">Contact Us</h2>
      {submitStatus && (
        <div className={`mb-4 p-3 rounded-md ${
          submitStatus.success ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
        }`}>
          {submitStatus.message}
        </div>
      )}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <input
            type="text"
            name="name"
            placeholder="Your Name"
            className="w-full p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
            value={formData.name}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <input
            type="email"
            name="email"
            placeholder="Your Email"
            className="w-full p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
            value={formData.email}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <input
            type="tel"
            name="phone"
            placeholder="Phone Number (Optional)"
            className="w-full p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
            value={formData.phone}
            onChange={handleChange}
          />
        </div>
        <div>
          <textarea
            name="message"
            placeholder="Your Message"
            rows={5}
            className="w-full p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
            value={formData.message}
            onChange={handleChange}
            required
          />
        </div>
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-red-500 hover:bg-red-600 text-white font-bold py-3 px-4 rounded-md transition duration-300 flex items-center justify-center disabled:opacity-70"
        >
          {isSubmitting ? (
            <>
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Sending...
            </>
          ) : 'Send Message'}
        </button>
      </form>
    </div>
  );
};

export default Contact;
