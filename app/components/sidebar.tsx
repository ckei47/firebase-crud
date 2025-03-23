// sidebar.tsx
"use client"; // Important: This makes it a Client Component

import React, { useState } from 'react';

interface SidebarProps {
  isOpen: boolean;
  setOpen: (open: boolean) => void;
}

export default function Sidebar({ isOpen, setOpen }: SidebarProps) {
  // Client-side state and logic here
  const sidebarStyle: React.CSSProperties = {
    width: '250px',
    backgroundColor: '#f0f0f0',
    padding: '20px',
    transition: 'transform 0.3s ease-in-out',
    transform: isOpen ? 'translateX(0)' : 'translateX(-100%)',
    position: 'fixed',
    top: 0,
    left: 0,
    height: '100%',
  };

  return (
    <div style={sidebarStyle}>
      <h2>Sidebar</h2>
      <ul>
        <li>Item 1</li>
        <li>Item 2</li>
        <li>Item 3</li>
      </ul>
      <button onClick={() => setOpen(!isOpen)}>
        {isOpen ? 'Close' : 'Open'}
      </button>
    </div>
  );
}