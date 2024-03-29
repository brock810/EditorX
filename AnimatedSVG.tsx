import React from 'react';

const AnimatedSVG = () => {
  const generateRandomCoordinates = (min, max) => {
    return Math.floor(Math.random() * (max - min + 1) + min);
  };

  const stars = Array.from({ length: 500 }, (_, index) => (
    <circle
      key={index}
      cx={generateRandomCoordinates(0, 700)}
      cy={generateRandomCoordinates(0, 700)}
      r={Math.random()}
      fill="#fff"
    />
  ));

  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 700 700" width="300" height="800" style={{ borderRadius: "60%", backgroundColor: "#000" }}>
      {/* Stars */}
      {stars}

      {/* Sun */}
      <circle cx="350" cy="350" r="60" fill="#ffcc00" />

      {/* Earth */}
      <g id="earth">
        <circle cx="400" cy="240" r="20" fill="#00d9ff">
          <animateTransform attributeName="transform" type="rotate" from="0 350 350" to="360 350 350" dur="20s" repeatCount="indefinite" />
        </circle>
        <circle cx="400" cy="240" r="4" fill="#fff" />
      </g>

      {/* Moon */}
      <g id="moon">
        <circle cx="500" cy="140" r="10" fill="#aaa" />
        <circle cx="500" cy="140" r="2" fill="#fff" />
      </g>

      {/* Planet gradient */}
      <defs>
        <linearGradient id="planetGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style={{ stopColor: "#00d9ff", stopOpacity: 1 }} />
          <stop offset="100%" style={{ stopColor: "#003399", stopOpacity: 1 }} />
        </linearGradient>
      </defs>
    </svg>
  );
};

export default AnimatedSVG;
