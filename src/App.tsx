/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { Navbar } from './components/Navbar';
import { Home } from './pages/Home';
import { CreateRecipe } from './pages/CreateRecipe';
import { RecipeDetails } from './pages/RecipeDetails';
import { Profile } from './pages/Profile';
import { Contact } from './pages/Contact';

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen flex flex-col">
          <Navbar />
          <main className="flex-1">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/create" element={<CreateRecipe />} />
              <Route path="/recipe/:id" element={<RecipeDetails />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/contact" element={<Contact />} />
            </Routes>
          </main>
        </div>
      </Router>
    </AuthProvider>
  );
}
