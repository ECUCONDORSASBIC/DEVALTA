    try {
      const loginData = {
        email: selectedUser,
        password: 'test123456'
      };

      console.log(`🔐 Testing login for role: ${selectedUser}`);
      
      const loginResponse = await testApi.auth.login(loginData);
      console.log('✅ Role login response:', loginResponse);

      // Obtener información del usuario autenticado
      const userResponse = await testApi.auth.me();
      console.log('✅ User info for role:', userResponse);

      setCurrentUser(userResponse);
      setAuthStatus('authenticated');
      onAuthStateChange(true, userResponse);

    } catch (err: any) {
      console.error('❌ Role auth error:', err.message);
      setError(err.message);
      setAuthStatus('error');
      onAuthStateChange(false);
    }
  };

  const testLogout = async () => {
    try {
      await testApi.auth.logout();
      setAuthStatus('idle');
      setCurrentUser(null);
      setError('');
      onAuthStateChange(false);
      console.log('✅ Logout successful');
    } catch (err: any) {
      console.error('❌ Logout error:', err.message);
    }
  };

  return (
    <div className="bg-green-50 border border-green-200 rounded-lg p-6">
      <h3 className="text-lg font-semibold text-green-900 mb-4">
        🎭 Multi-Role Authentication Testing
      </h3>

      <div className="space-y-4">
        {/* Selector de Usuarios de Prueba */}
        <div>
          <label className="block text-sm font-medium text-green-900 mb-2">
            Seleccionar Usuario de Prueba:
          </label>
          <select
            value={selectedUser}
            onChange={(e) => setSelectedUser(e.target.value)}
            disabled={authStatus === 'logging-in'}
            className="w-full p-2 border border-green-300 rounded focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            {testUsers.map((user) => (
              <option key={user.email} value={user.email}>
                {user.role} - {user.name} ({user.email})
              </option>
            ))}
          </select>
        </div>

        {/* Información del Usuario Seleccionado */}
        {selectedUser && testUsers.length > 0 && (
          <div className="bg-green-100 border border-green-300 rounded p-3">
            {(() => {
              const user = testUsers.find(u => u.email === selectedUser);
              return user ? (
                <div>
                  <h4 className="font-medium text-green-900 mb-2">Usuario Seleccionado:</h4>
                  <div className="text-sm text-green-800">
                    <div><strong>Rol:</strong> {user.role}</div>
                    <div><strong>Nombre:</strong> {user.name}</div>
                    <div><strong>Email:</strong> {user.email}</div>
                    <div><strong>Redirección Esperada:</strong> {user.redirectUrl}</div>
                    <div><strong>Password:</strong> test123456</div>
                  </div>
                </div>
              ) : null;
            })()}
          </div>
        )}

        {/* Estado de Autenticación */}
        <div className="flex items-center gap-3">
          <span className="font-medium">Estado:</span>
          {authStatus === 'idle' && (
            <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">
              No autenticado
            </span>
          )}
          {authStatus === 'logging-in' && (
            <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">
              Iniciando sesión...
            </span>
          )}
          {authStatus === 'authenticated' && (
            <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm">
              ✅ Autenticado
            </span>
          )}
          {authStatus === 'error' && (
            <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm">
              ❌ Error
            </span>
          )}
        </div>

        {/* Usuario Autenticado */}
        {currentUser && (
          <div className="bg-green-100 border border-green-300 rounded p-3">
            <h4 className="font-medium text-green-900 mb-2">Usuario Autenticado:</h4>
            <pre className="text-xs text-green-800 overflow-auto">
              {JSON.stringify(currentUser, null, 2)}
            </pre>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded p-3">
            <h4 className="font-medium text-red-900 mb-1">Error:</h4>
            <p className="text-red-800 text-sm">{error}</p>
          </div>
        )}

        {/* Botones de Acción */}
        <div className="flex gap-3">
          {authStatus !== 'authenticated' && (
            <button
              onClick={testRoleLogin}
              disabled={authStatus === 'logging-in' || !selectedUser}
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
            >
              {authStatus === 'logging-in' ? 'Iniciando...' : 'Test Role Login'}
            </button>
          )}
          
          {authStatus === 'authenticated' && (
            <button
              onClick={testLogout}
              className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
            >
              Cerrar Sesión
            </button>
          )}
          
          {currentUser && (
            <button
              onClick={() => {
                if (currentUser.redirectUrl) {
                  window.open(currentUser.redirectUrl, '_blank');
                }
              }}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              🔗 Probar Redirección
            </button>
          )}
        </div>

        {/* Instrucciones de Prueba Manual */}
        <div className="bg-blue-50 border border-blue-200 rounded p-3">
          <h4 className="font-medium text-blue-900 mb-2">Prueba Manual de Redirecciones:</h4>
          <ol className="text-sm text-blue-800 space-y-1">
            <li>1. <strong>Selecciona un rol diferente</strong> en el dropdown</li>
            <li>2. <strong>Haz login</strong> con las credenciales del rol seleccionado</li>
            <li>3. <strong>Usa el botón "Probar Redirección"</strong> para abrir la app correspondiente</li>
            <li>4. <strong>Verifica</strong> que la sesión se mantiene en la nueva aplicación</li>
            <li>5. <strong>Repite</strong> con diferentes roles para probar todas las redirecciones</li>
          </ol>
        </div>
      </div>
    </div>
  );
}