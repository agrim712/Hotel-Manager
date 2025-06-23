import React, { useState } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { FaPaperPlane, FaCheck, FaExclamationTriangle } from 'react-icons/fa';

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
        message: 'Your message has been sent successfully!' 
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
    <motion.div 
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
      className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-3xl shadow-2xl p-8 md:p-12"
    >
      <div className="max-w-2xl mx-auto">
        <h2 className="text-3xl font-bold text-center mb-2 text-gray-800">Get In Touch</h2>
        <p className="text-center text-gray-600 mb-8">
          Have questions? Our team is ready to help you transform your hotel operations.
        </p>
        
        {submitStatus && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`mb-6 p-4 rounded-xl flex items-center ${
              submitStatus.success 
                ? 'bg-green-100 text-green-800' 
                : 'bg-red-100 text-red-800'
            }`}
          >
            {submitStatus.success ? (
              <FaCheck className="mr-3 text-green-600" />
            ) : (
              <FaExclamationTriangle className="mr-3 text-red-600" />
            )}
            {submitStatus.message}
          </motion.div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <input
              type="text"
              name="name"
              placeholder="Your Name"
              className="w-full p-4 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: -10 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <input
              type="email"
              name="email"
              placeholder="Your Email"
              className="w-full p-4 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: -10 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <input
              type="tel"
              name="phone"
              placeholder="Phone Number (Optional)"
              className="w-full p-4 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={formData.phone}
              onChange={handleChange}
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: -10 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <textarea
              name="message"
              placeholder="How can we help you?"
              rows={5}
              className="w-full p-4 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={formData.message}
              onChange={handleChange}
              required
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold py-4 px-6 rounded-xl shadow-lg transition-all duration-300 flex items-center justify-center disabled:opacity-70"
            >
              {isSubmitting ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Sending...
                </>
              ) : (
                <>
                  <FaPaperPlane className="mr-3" />
                  Send Message
                </>
              )}
            </button>
          </motion.div>
        </form>
      </div>
    </motion.div>
  );
};

export default Contact;