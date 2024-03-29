import React, { useRef, useEffect } from 'react';
import './AboutPage.css';

const AboutPage: React.FC = () => {
  const backgroundRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      if (backgroundRef.current) {
        const yPos = -(window.pageYOffset / 2);
        backgroundRef.current.style.backgroundPositionY = `${yPos}px`;
      }
    };

    window.addEventListener('scroll', handleScroll);

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return (
    <div className="about-page">
      <div className="background-image" ref={backgroundRef}></div>
      <div className="text-container">
        <h2>About EditorX</h2>
        <p>
          Imagine a workspace where teamwork flows effortlessly, where every keystroke and idea is shared in real-time. That's EditorX – a revolutionary platform built for collaborative coding. With EditorX, teams unite to code, edit, and refine together, all while staying connected in the moment. It's the place where collaboration feels natural, making coding together an experience like no other.
        </p>
        <h3>Key Features:</h3>
        <ul>
          <li>Real-time code collaboration</li>
          <li>Team chat functionality</li>
          <li>Code review and version control</li>
          <li>User-friendly interface</li>
          <li>Secure and reliable</li>
        </ul>
        <h3>Why Choose EditorX?</h3>
        <p>
          EditorX launches the development process by eliminating the need for multiple tools and platforms. With its intuitive interface and features, it provides teams with the tools they need to collaborate effectively and efficiently.
        </p>
        <h3>Get Started Today!</h3>
        <p>
          Ready to experience the future of code collaboration? Join EditorX today and take your team's productivity to the next level.
        </p>
      </div>
    </div>
  );
};

export default AboutPage;
