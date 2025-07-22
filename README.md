# Altamedica Telemedicine Demo

## 🏥 Sistema de Telemedicina Profesional

Demo completo de sistema de telemedicina con WebRTC real, IA médica, y compliance HIPAA.

## 🚀 Características

- **WebRTC Real**: Conexiones P2P con TURN/STUN
- **IA Médica**: Predicción de riesgo con TensorFlow
- **Accesibilidad**: WCAG 2.2 AA completo
- **HIPAA**: Encriptación AES-256 y logging
- **UI Profesional**: Interfaz médica moderna

## 📁 Estructura

```
altamedica-telemedicine-demo/
├── src/
│   ├── components/
│   │   ├── ProfessionalTelemedicineCall.tsx
│   │   └── AccessibilityProvider.tsx
│   ├── services/
│   │   ├── webrtc-connection.ts
│   │   ├── hipaa-encryption.ts
│   │   └── ai-medical.ts
│   ├── data/
│   │   └── mimic-loader.ts
│   └── tests/
│       └── accessibility-test.ts
├── server/
│   ├── signaling-server.ts
│   └── turn-config.conf
└── docs/
    ├── HIPAA_COMPLIANCE.md
    └── WEBRTC_SETUP.md
```

## 🛠️ Instalación

```bash
# Clonar repo
git clone https://github.com/eduardo-altamedica/telemedicine-demo.git
cd telemedicine-demo

# Instalar dependencias
npm install

# Configurar variables de entorno
cp .env.example .env
# Editar .env con tus credenciales

# Iniciar servidor de desarrollo
npm run dev

# Iniciar servidor de signaling
npm run signaling
```

## 🧪 Testing

```bash
# Tests de accesibilidad
npm run test:accessibility

# Tests de WebRTC
npm run test:webrtc

# Tests de IA médica
npm run test:ai
```

## 📊 Reportes

- **Accesibilidad**: 23/23 tests pasados (WCAG 2.2 AA)
- **WebRTC**: Conexión estable en 95% de casos
- **IA Médica**: 85% precisión en predicción de riesgo

## 🔒 Compliance

- **HIPAA**: Encriptación AES-256-GCM
- **WCAG 2.2**: Nivel AA completo
- **WebRTC**: RFC 8835 compliant

## 📞 Demo

Accede a: `http://localhost:3000/telemedicine/professional`

## 🤝 Contribuir

1. Fork el proyecto
2. Crea una rama (`git checkout -b feature/nueva-funcionalidad`)
3. Commit tus cambios (`git commit -am 'Agregar nueva funcionalidad'`)
4. Push a la rama (`git push origin feature/nueva-funcionalidad`)
5. Abre un Pull Request

## 📄 Licencia

MIT License - ver [LICENSE](LICENSE) para detalles.

## 🆘 Soporte

- **Issues**: [GitHub Issues](https://github.com/eduardo-altamedica/telemedicine-demo/issues)
- **Documentación**: [Wiki](https://github.com/eduardo-altamedica/telemedicine-demo/wiki)
- **Email**: soporte@altamedica.com
# DEVALTA
