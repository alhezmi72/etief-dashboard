import React from 'react';

export default function HomeLink() {
  return (
    <a
      href="/"
      style={{
        position: 'fixed',
        top: '10px',
        left: '10px',
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        backgroundColor: 'rgba(255,255,255,0.8)',
        padding: '6px 10px',
        borderRadius: '12px',
        textDecoration: 'none',
        color: '#333',
        fontWeight: 'bold',
        boxShadow: '0 2px 5px rgba(0,0,0,0.2)',
        zIndex: 999,
      }}
      title="Back to Home"
    >
      🏠 Home
    </a>
  );
}
