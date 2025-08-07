'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from "@altamedica/auth";

interface DebugLog {
  timestamp: string;
  level: 'info' | 'warning' | 'error' | 'success';
  message: string;
  data?: any;
}

export const LoginDebugger: React.FC = () => {
  const [logs, setLogs] = useState<DebugLog[]>([]);
  const [isVisible, setIsVisible] = useState(true);
  const { user, userProfile, loading, error } = useAuth();

  const addLog = (level: DebugLog['level'], message: string, data?: any) => {
    const log: DebugLog = {
      timestamp: new Date().toLocaleTimeString(),
      level,
      message,
      data
    };
    setLogs(prev => [...prev, log]);
  };

  useEffect(() => {
    addLog('info', 'LoginDebugger inicializado');
    addLog('info', `Firebase User: ${user ? user.uid : 'null'}`);
    addLog('info', `User Profile: ${userProfile ? userProfile.role : 'null'}`);
    addLog('info', `Loading: ${loading}`);
    addLog('info', `Error: ${error || 'null'}`);
  }, [user, userProfile, loading, error]);

  useEffect(() => {
    // Interceptar console.log para capturar logs del AuthContext
    const originalLog = console.log;
    const originalError = console.error;

    console.log = (...args) => {
      const message = args.join(' ');
      if (message.includes('[AuthContext]')) {
        if (message.includes('❌')) {
          addLog('error', message);
        } else if (message.includes('⚠️')) {
          addLog('warning', message);
        } else if (message.includes('✅')) {
          addLog('success', message);
        } else {
          addLog('info', message);
        }
      }
      originalLog.apply(console, args);
    };

    console.error = (...args) => {
      const message = args.join(' ');
      if (message.includes('[AuthContext]')) {
        addLog('error', message, args[1]);
      }
      originalError.apply(console, args);
    };

    return () => {
      console.log = originalLog;
      console.error = originalError;
    };
  }, []);

  const testDirectRedirect = () => {
    addLog('info', 'Probando redirección directa...');
    try {
      window.location.href = 'http://localhost:3003';
      addLog('success', 'Redirección ejecutada');
    } catch (error) {
      addLog('error', 'Error en redirección directa', error);
    }
  };

  const clearLogs = () => {
    setLogs([]);
  };

  if (!isVisible) {
    return (
      <button
        onClick={() => setIsVisible(true)}
        className="fixed bottom-4 right-4 bg-blue-600 text-white px-4 py-2 rounded shadow z-50"
      >
        Mostrar Debug
      </button>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 w-96 max-h-96 bg-white border rounded shadow-lg z-50 overflow-hidden">
      <div className="flex items-center justify-between p-3 bg-gray-100 border-b">
        <h3 className="font-bold text-sm">Login Debugger</h3>
        <div className="flex space-x-2">
          <button
            onClick={clearLogs}
            className="text-xs bg-gray-500 text-white px-2 py-1 rounded"
          >
            Clear
          </button>
          <button
            onClick={testDirectRedirect}
            className="text-xs bg-blue-500 text-white px-2 py-1 rounded"
          >
            Test Redirect
          </button>
          <button
            onClick={() => setIsVisible(false)}
            className="text-xs bg-red-500 text-white px-2 py-1 rounded"
          >
            Ocultar
          </button>
        </div>
      </div>
      
      <div className="p-3">
        <div className="mb-2 text-xs">
          <div>User: {user ? `${user.email} (${user.uid.substring(0, 8)}...)` : 'No auth'}</div>
          <div>Profile: {userProfile ? `${userProfile.role}` : 'No profile'}</div>
          <div>Loading: {loading ? 'Sí' : 'No'}</div>
          <div>Error: {error || 'Ninguno'}</div>
          <div>URL: {typeof window !== 'undefined' ? window.location.href : 'N/A'}</div>
        </div>
      </div>
      
      <div className="max-h-48 overflow-y-auto border-t">
        {logs.map((log, index) => (
          <div
            key={index}
            className={`text-xs p-2 border-b ${
              log.level === 'error' ? 'bg-red-50 text-red-800' :
              log.level === 'warning' ? 'bg-yellow-50 text-yellow-800' :
              log.level === 'success' ? 'bg-green-50 text-green-800' :
              'bg-gray-50 text-gray-800'
            }`}
          >
            <div className="flex justify-between">
              <span className="font-mono">{log.timestamp}</span>
              <span className="font-bold">{log.level.toUpperCase()}</span>
            </div>
            <div className="mt-1">{log.message}</div>
            {log.data && (
              <div className="mt-1 font-mono text-xs opacity-75">
                {JSON.stringify(log.data, null, 2)}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};