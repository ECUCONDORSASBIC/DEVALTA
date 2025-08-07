// Script de depuración para ejecutar en la consola del navegador
// Copiar y pegar este código en la consola mientras estás en http://localhost:3000/login

console.log('🔍 === INICIANDO DEPURACIÓN DE LOGIN ===');

// 1. Verificar estado del formulario
const emailInput = document.querySelector('input[type="email"]');
const passwordInput = document.querySelector('input[type="password"]');
const submitButton = document.querySelector('button[type="submit"]');

console.log('📋 Estado del formulario:');
console.log('- Email input:', emailInput ? 'Encontrado' : 'NO ENCONTRADO');
console.log('- Password input:', passwordInput ? 'Encontrado' : 'NO ENCONTRADO');
console.log('- Submit button:', submitButton ? 'Encontrado' : 'NO ENCONTRADO');

if (submitButton) {
    console.log('- Botón deshabilitado:', submitButton.disabled);
    console.log('- Texto del botón:', submitButton.textContent);
}

// 2. Intentar acceder al estado de React (si es posible)
try {
    // Buscar el componente React en el DOM
    const reactFiber = submitButton?._reactInternalFiber || 
                      submitButton?._reactInternalInstance ||
                      Object.keys(submitButton || {}).find(key => key.startsWith('__reactInternalInstance'));
    
    if (reactFiber) {
        console.log('✅ Componente React encontrado');
    } else {
        console.log('⚠️ No se pudo acceder al estado interno de React');
    }
} catch (e) {
    console.log('⚠️ Error accediendo a React:', e.message);
}

// 3. Verificar Firebase
if (typeof firebase !== 'undefined') {
    console.log('✅ Firebase está cargado');
    
    // Verificar autenticación
    if (firebase.auth) {
        firebase.auth().onAuthStateChanged(user => {
            console.log('🔐 Estado de autenticación Firebase:', user ? user.email : 'No autenticado');
        });
    }
} else {
    console.log('❌ Firebase no está definido en el scope global');
}

// 4. Simular llenado y envío del formulario
console.log('\n📝 Intentando llenar el formulario...');

if (emailInput && passwordInput && submitButton) {
    // Llenar campos
    emailInput.value = 'eeecucondor@gmail.com';
    emailInput.dispatchEvent(new Event('change', { bubbles: true }));
    emailInput.dispatchEvent(new Event('input', { bubbles: true }));
    
    passwordInput.value = 'test123';
    passwordInput.dispatchEvent(new Event('change', { bubbles: true }));
    passwordInput.dispatchEvent(new Event('input', { bubbles: true }));
    
    console.log('✅ Campos llenados');
    console.log('- Email:', emailInput.value);
    console.log('- Password:', '***' + passwordInput.value.slice(-3));
    
    // Verificar si el botón se habilitó
    setTimeout(() => {
        console.log('- Botón habilitado después de llenar:', !submitButton.disabled);
        
        if (!submitButton.disabled) {
            console.log('🚀 El botón está habilitado. Puedes hacer clic para enviar.');
        } else {
            console.log('⚠️ El botón sigue deshabilitado. Posible problema con el estado del contexto.');
            
            // Intentar habilitar forzadamente
            console.log('🔧 Intentando habilitar el botón forzadamente...');
            submitButton.disabled = false;
            console.log('✅ Botón habilitado forzadamente. Intenta hacer clic ahora.');
        }
    }, 500);
} else {
    console.log('❌ No se pudieron encontrar todos los elementos del formulario');
}

// 5. Verificar cookies y localStorage
console.log('\n🍪 Estado del almacenamiento:');
console.log('LocalStorage keys:', Object.keys(localStorage));
console.log('Cookies:', document.cookie || 'Ninguna');

// 6. Verificar la URL actual y posibles redirecciones
console.log('\n🌐 Información de navegación:');
console.log('URL actual:', window.location.href);
console.log('Origin:', window.location.origin);

// 7. Monitorear eventos de red
console.log('\n📡 Monitoreando solicitudes de red...');
const originalFetch = window.fetch;
window.fetch = function(...args) {
    console.log('🔄 Fetch request:', args[0]);
    return originalFetch.apply(this, args).then(response => {
        console.log('✅ Fetch response:', response.status, response.url);
        return response;
    }).catch(error => {
        console.log('❌ Fetch error:', error);
        throw error;
    });
};

// 8. Función helper para hacer clic en el botón
window.tryLogin = function() {
    if (submitButton && !submitButton.disabled) {
        console.log('🖱️ Haciendo clic en el botón de login...');
        submitButton.click();
    } else {
        console.log('❌ No se puede hacer clic: botón no encontrado o deshabilitado');
    }
};

console.log('\n✅ Depuración completada');
console.log('💡 Tip: Usa tryLogin() para intentar enviar el formulario');
console.log('💡 Tip: Revisa la pestaña Network para ver las solicitudes HTTP');
console.log('🔍 === FIN DE DEPURACIÓN ===');