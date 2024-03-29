import React from 'react';
import { Link } from 'react-router-dom';
import './HomePage.css';
const homepageVideo = require('./homepage.mp4');

const HomePage: React.FC = () => {
  return (
    <div className="homepage-container">
      <video className="video-background" autoPlay muted loop>
        <source src={homepageVideo} type="video/mp4" />
        Your browser does not support the video tag.
      </video>
      <div className="homepage-content">
        <h2>Welcome to EditorX</h2>
        <p>
          EditorX is a platform for real-time code collaboration. Collaborate with your team,
          write code together, and chat in real-time, all in one place.
        </p>
        <div className="homepage-links">
          <Link to="/editor" className="homepage-link">Start Coding</Link>
          <Link to="/about" className="homepage-link">About Us</Link>
          <Link to="/contactus" className="homepage-link">Contact Us</Link>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
