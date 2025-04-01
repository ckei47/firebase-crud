"use client"

import React, { useState } from 'react';


export default function Home() {

  const [open, setOpen] = useState(true)

  return (
    <div className="">
      <Sidebar isOpen={open} setOpen={setOpen} />
    </div>
  );
}

interface SidebarProps {
  isOpen: boolean;
  setOpen: (open: boolean) => void;
}

function Sidebar({ isOpen, setOpen }: SidebarProps) {
  const sidebarStyle: React.CSSProperties = {
    width: '250px',
    backgroundColor: '#282A2C',
    padding: '20px',
    transition: 'transform 0.3s ease-in-out',
    transform: isOpen ? 'translateX(0)' : 'translateX(-70%)',
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
