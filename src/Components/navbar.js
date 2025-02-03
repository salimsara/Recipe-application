import React from 'react';
import { Outlet, Link } from "react-router-dom";
import '../App.css';

const Navbar = () => {

  return (
    <nav style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginLeft: '10px' }}>
      <h1 className='brandi' ><Link to="/">Safkaa</Link></h1>
      <Outlet />
    </nav>
  );
};

export default Navbar;