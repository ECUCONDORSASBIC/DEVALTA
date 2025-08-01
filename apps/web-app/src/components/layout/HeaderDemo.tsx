'use client';

import React, { useState } from 'react';
import { Header } from './Header';

/**
 * Demo component to showcase the new Header component with different states
 * This component demonstrates:
 * - Authenticated vs unauthenticated states
 * - Transparent vs normal backgrounds
 * - Mobile menu functionality
 * - User dropdown menu
 * - Keyboard navigation
 * - ARIA attributes
 */
export function HeaderDemo() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isTransparent, setIsTransparent] = useState(false);
  const [user, setUser] = useState({
    name: 'Dr. María González',
    email: 'maria.gonzalez@altamedica.com',
    avatar: undefined as string | undefined,
  });

  const handleLogin = () => {
    setIsAuthenticated(true);
    console.log('Login action triggered');
  };

  const handleRegister = () => {
    console.log('Register action triggered');
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    console.log('Logout action triggered');
  };

  const handleProfileClick = () => {
    console.log('Profile click action triggered');
  };

  const toggleTransparency = () => {
    setIsTransparent(!isTransparent);
  };

  const toggleUserAvatar = () => {
    setUser(prev => ({
      ...prev,
      avatar: prev.avatar 
        ? undefined 
        : 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=64&h=64&fit=crop&crop=face&auto=format&q=80'
    }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Demo Controls */}
      <div className="fixed bottom-4 left-4 bg-white p-4 rounded-lg shadow-lg border border-neutral-200 z-50">
        <h3 className="text-sm font-semibold text-neutral-900 mb-3">Demo Controls</h3>
        <div className="space-y-2">
          <button
            onClick={() => setIsAuthenticated(!isAuthenticated)}
            className={`w-full px-3 py-2 rounded-md text-sm font-medium transition-colors ${
              isAuthenticated
                ? 'bg-red-100 text-red-700 hover:bg-red-200'
                : 'bg-green-100 text-green-700 hover:bg-green-200'
            }`}
          >
            {isAuthenticated ? 'Logout' : 'Login'}
          </button>
          
          <button
            onClick={toggleTransparency}
            className={`w-full px-3 py-2 rounded-md text-sm font-medium transition-colors ${
              isTransparent
                ? 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {isTransparent ? 'Solid' : 'Transparent'}
          </button>
          
          <button
            onClick={toggleUserAvatar}
            className="w-full px-3 py-2 rounded-md text-sm font-medium bg-purple-100 text-purple-700 hover:bg-purple-200 transition-colors"
          >
            {user.avatar ? 'Remove Avatar' : 'Add Avatar'}
          </button>
        </div>
      </div>

      {/* Header Component */}
      <Header
        transparent={isTransparent}
        isAuthenticated={isAuthenticated}
        user={isAuthenticated ? user : undefined}
        onLogin={handleLogin}
        onRegister={handleRegister}
        onLogout={handleLogout}
        onProfileClick={handleProfileClick}
      />

      {/* Content */}
      <main className="pt-16 lg:pt-20">
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h1 className="text-4xl font-bold text-neutral-900 mb-4">
                Header Component Demo
              </h1>
              <p className="text-lg text-neutral-600 max-w-2xl mx-auto">
                This page demonstrates the new accessible Header component with semantic navigation,
                mobile menu support, and comprehensive keyboard navigation.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              {/* Features */}
              <div className="bg-white p-6 rounded-lg shadow-sm border border-neutral-200">
                <h2 className="text-xl font-semibold text-neutral-900 mb-4">Features</h2>
                <ul className="space-y-3">
                  <li className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span className="text-neutral-700">Semantic HTML with proper landmark roles</span>
                  </li>
                  <li className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span className="text-neutral-700">WCAG AA compliant keyboard navigation</span>
                  </li>
                  <li className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span className="text-neutral-700">Responsive mobile-first design</span>
                  </li>
                  <li className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span className="text-neutral-700">Slide-in mobile navigation drawer</span>
                  </li>
                  <li className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span className="text-neutral-700">Radix UI dropdown menu integration</span>
                  </li>
                  <li className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span className="text-neutral-700">Support for authenticated/unauthenticated states</span>
                  </li>
                </ul>
              </div>

              {/* Accessibility */}
              <div className="bg-white p-6 rounded-lg shadow-sm border border-neutral-200">
                <h2 className="text-xl font-semibold text-neutral-900 mb-4">Accessibility</h2>
                <ul className="space-y-3">
                  <li className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span className="text-neutral-700">
                      <code className="text-sm bg-neutral-100 px-1 rounded">role="banner"</code> for header
                    </span>
                  </li>
                  <li className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span className="text-neutral-700">
                      <code className="text-sm bg-neutral-100 px-1 rounded">aria-label</code> for navigation
                    </span>
                  </li>
                  <li className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span className="text-neutral-700">
                      <code className="text-sm bg-neutral-100 px-1 rounded">aria-expanded</code> for menu states
                    </span>
                  </li>
                  <li className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span className="text-neutral-700">
                      <code className="text-sm bg-neutral-100 px-1 rounded">aria-current="page"</code> for active links
                    </span>
                  </li>
                  <li className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span className="text-neutral-700">Focus management with visible focus indicators</span>
                  </li>
                  <li className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span className="text-neutral-700">Screen reader friendly labels and descriptions</span>
                  </li>
                </ul>
              </div>

              {/* Usage Instructions */}
              <div className="bg-white p-6 rounded-lg shadow-sm border border-neutral-200 md:col-span-2">
                <h2 className="text-xl font-semibold text-neutral-900 mb-4">Usage Instructions</h2>
                <div className="space-y-4">
                  <div>
                    <h3 className="font-medium text-neutral-900 mb-2">Keyboard Navigation:</h3>
                    <div className="text-sm text-neutral-700 space-y-1">
                      <p>• Use <kbd className="px-2 py-1 bg-neutral-100 rounded">Tab</kbd> to navigate through interactive elements</p>
                      <p>• Use <kbd className="px-2 py-1 bg-neutral-100 rounded">Enter</kbd> or <kbd className="px-2 py-1 bg-neutral-100 rounded">Space</kbd> to activate buttons</p>
                      <p>• Use <kbd className="px-2 py-1 bg-neutral-100 rounded">Escape</kbd> to close mobile menu or dropdown</p>
                      <p>• Use <kbd className="px-2 py-1 bg-neutral-100 rounded">Arrow Keys</kbd> to navigate dropdown menu items</p>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="font-medium text-neutral-900 mb-2">Mobile Experience:</h3>
                    <div className="text-sm text-neutral-700 space-y-1">
                      <p>• Tap the hamburger menu icon to open the mobile drawer</p>
                      <p>• The drawer slides in from the right with a backdrop overlay</p>
                      <p>• Tap outside the drawer or the close button to dismiss it</p>
                      <p>• All navigation links and user actions are available in the mobile menu</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default HeaderDemo;
