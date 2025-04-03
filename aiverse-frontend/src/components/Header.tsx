import React from 'react';

const headerStyle: React.CSSProperties = {
  backgroundColor: '#282c34', // Dark background
  padding: '1rem 2rem',
  color: 'white',
  textAlign: 'center', // Center title for now
  boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
};

const titleStyle: React.CSSProperties = {
  margin: 0,
  fontSize: '2rem',
  fontWeight: 'bold',
};

const Header: React.FC = () => {
  return (
    <header style={headerStyle}>
      <h1 style={titleStyle}>AIVerse</h1>
        {/* Add navigation links here later if needed */}
      {/* <nav> ... </nav> */}
    </header>
  );
};

export default Header;