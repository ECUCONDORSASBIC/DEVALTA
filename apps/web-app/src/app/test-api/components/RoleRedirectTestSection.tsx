      expectedApp: 'companies-app', 
      expectedPort: 3004,
      description: 'Empresas deberían ser redirigidas a companies-app'
    },
    {
      role: 'ADMIN',
      expectedApp: 'admin-app',
      expectedPort: 3005,
      description: 'Administradores deberían ser redirigidos a admin-app'
    }
  ];

  const testRoleRedirect = async (roleTest: RoleRedirectTest) => {
    try {
      // Simular proceso de autenticación y redirección
      console.log(`🔄 Testing role redirect for: ${roleTest.role}`);
      
      // Probar conectividad a la app esperada
      const targetUrl = `http://localhost:${roleTest.expectedPort}`;
      const response = await fetch(targetUrl, {
        method: 'HEAD', // Solo verificar conectividad
        mode: 'no-cors' // Evitar problemas CORS
      });
      
      return {
        role: roleTest.role,
        expectedApp: roleTest.expectedApp,
        targetUrl,
        status: 'reachable',
        message: `✅ ${roleTest.expectedApp} está disponible en puerto ${roleTest.expectedPort}`
      };
    } catch (error: any) {
      return {
        role: roleTest.role,
        expectedApp: roleTest.expectedApp,
        targetUrl: `http://localhost:${roleTest.expectedPort}`,
        status: 'error',
        message: `❌ Error conectando a ${roleTest.expectedApp}: ${error.message}`
      };
    }
  };

  const testAllRoleRedirects = async () => {
    setIsTestingRedirects(true);
    setRedirectResults([]);

    const results = [];
    for (const roleTest of roleTests) {
      const result = await testRoleRedirect(roleTest);
      results.push(result);
      setRedirectResults([...results]);
      await new Promise(resolve => setTimeout(resolve, 300));
    }

    setIsTestingRedirects(false);
  };

  const testAuthenticationFlow = async () => {
    try {
      console.log('🔄 Testing authentication flow with different roles...');
      
      // Test 1: Verificar si web-app maneja redirecciones
      const webAppResponse = await fetch('http://localhost:3000/auth/login');
      console.log('Web app login page accessible:', webAppResponse.ok);
      
      // Test 2: Verificar endpoints de autenticación
      const authCheckUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/auth/test-me`;
      const authResponse = await fetch(authCheckUrl, {
        credentials: 'include'
      });
      
      return {
        webAppLoginAccessible: webAppResponse.ok,
        authEndpointWorking: authResponse.status === 401 || authResponse.ok, // 401 es esperado sin auth
        message: 'Authentication flow endpoints verified'
      };
    } catch (error: any) {
      throw new Error(`Authentication flow test failed: ${error.message}`);
    }
  };

  return (
    <div className="bg-purple-50 border border-purple-200 rounded-lg p-6">
      <h3 className="text-lg font-semibold text-purple-900 mb-4">
        🔄 Role-Based Redirect Testing
      </h3>

      <div className="space-y-4">
        {/* Descripción */}
        <div className="bg-purple-100 border border-purple-300 rounded p-3">
          <h4 className="font-medium text-purple-900 mb-2">Flujo de Autenticación Esperado:</h4>
          <ol className="text-sm text-purple-800 space-y-1">
            <li>1. Usuario hace login en web-app (puerto 3000)</li>
            <li>2. Sistema identifica el rol del usuario</li>
            <li>3. Usuario es redirigido automáticamente a su aplicación correspondiente</li>
            <li>4. La aplicación específica carga con la sesión autenticada</li>
          </ol>
        </div>

        {/* Expected Role Mappings */}
        <div className="bg-white border border-purple-200 rounded p-3">
          <h4 className="font-medium text-purple-900 mb-2">Mapeo de Roles Esperado:</h4>
          <div className="grid grid-cols-2 gap-2 text-sm">
            {roleTests.map((test, index) => (
              <div key={index} className="flex justify-between">
                <span className="font-medium text-purple-700">{test.role}:</span>
                <span className="text-purple-600">:{test.expectedPort}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Test Button */}
        <div className="flex gap-3">
          <button
            onClick={testAllRoleRedirects}
            disabled={isTestingRedirects}
            className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 disabled:opacity-50"
          >
            {isTestingRedirects ? 'Testing Redirects...' : 'Test Role Redirects'}
          </button>
          
          <button
            onClick={async () => {
              const result = await testAuthenticationFlow();
              console.log('Auth flow result:', result);
            }}
            className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
          >
            Test Auth Flow
          </button>
        </div>

        {/* Results */}
        {redirectResults.length > 0 && (
          <div className="space-y-3">
            <h4 className="font-medium text-purple-900">Redirect Test Results:</h4>
            {redirectResults.map((result, index) => (
              <div
                key={index}
                className={`border rounded p-3 ${
                  result.status === 'reachable'
                    ? 'border-green-200 bg-green-50'
                    : 'border-red-200 bg-red-50'
                }`}
              >
                <div className="flex justify-between items-start mb-1">
                  <span className="font-medium">
                    {result.role} → {result.expectedApp}
                  </span>
                  <span className="text-sm text-gray-600">{result.targetUrl}</span>
                </div>
                <p className={`text-sm ${
                  result.status === 'reachable' ? 'text-green-700' : 'text-red-700'
                }`}>
                  {result.message}
                </p>
              </div>
            ))}
          </div>
        )}

        {/* Manual Testing Instructions */}
        <div className="bg-blue-50 border border-blue-200 rounded p-3">
          <h4 className="font-medium text-blue-900 mb-2">Prueba Manual de Redirecciones:</h4>
          <ol className="text-sm text-blue-800 space-y-1">
            <li>1. Asegúrate de que todas las apps estén corriendo en sus puertos</li>
            <li>2. Ve a <code>http://localhost:3000</code> e inicia sesión</li>
            <li>3. Observa si eres redirigido automáticamente basado en tu rol</li>
            <li>4. Verifica que la sesión se mantiene en la nueva aplicación</li>
          </ol>
        </div>
      </div>
    </div>
  );
}