import React from 'react';
import logo from './logo.svg';
import { Routes, Route } from 'react-router-dom';
import './App.css';
import Login from './Components/LoginPage/Login';
import HomePage from './Components/HomePage/HomePage';
import Courses from './Components/Courses';

function App() {
  return (
    <Routes>
      <Route path='/' element={<Login />}></Route>
      <Route path='/Homepage' element={<HomePage />}>
        <Route path='Users' />
        <Route path="Settings" />
        <Route path="Courses" element={<Courses />} />
        <Route path="Approvals" />
        <Route path="Dashboards" />
        <Route path="More" />
      </Route>
    </Routes>


  );
}

export default App;
