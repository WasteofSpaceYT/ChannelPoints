import React from 'react';
import logo from './logo.svg';
import './App.css';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import Home from './components/home';

function App() {
  
  return (
    <BrowserRouter>
          <Routes>
            <Route path="/" >
              <Route index element={<Home />} />
          </Route>
        </Routes>
      </BrowserRouter>
  );
}

export default App;
