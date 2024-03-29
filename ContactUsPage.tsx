import React, { useState } from 'react';
import './ContactUsPage.css';
import AnimatedSVG from './AnimatedSVG'; // Import the SVG component

const ContactUsPage: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: '',
  });
  const [messageSent, setMessageSent] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // Add code to handle form submission here
    console.log(formData);
    setMessageSent(true);
    // Clear form fields after submission
    setFormData({
      name: '',
      email: '',
      message: '',
    });
  };

  return (
    <div className="contact-us-page">
      <h2>Contact Us</h2>
      <p>
        Have questions or feedback? We'd love to hear from you, we are available 24/7 day and night! Fill out the form below or use the contact information provided.
      </p>
      {messageSent && <p>Message sent!</p>}
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="name">Name:</label>
          <input type="text" id="name" name="name" value={formData.name} onChange={handleChange} required />
        </div>
        <div className="form-group">
          <label htmlFor="email">Email:</label>
          <input type="email" id="email" name="email" value={formData.email} onChange={handleChange} required />
        </div>
        <div className="form-group">
          <label htmlFor="message">Message:</label>
          <textarea id="message" name="message" value={formData.message} onChange={handleChange} required />
        </div>
        <button type="submit" name="contactButton">Submit</button> {/* Change button name to contactButton */}
      </form>
      <div className="contact-info">
        <p>Email: brockstanley810@hotmail.com</p>
        <p>Phone: 204-901-2481</p>
      </div>
      <AnimatedSVG /> {/* Render the SVG animation component */}
    </div>
  );
};

export default ContactUsPage;
