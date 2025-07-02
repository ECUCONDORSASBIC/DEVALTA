const express = require('express');
const path = require('path');
const app = express();
const PORT = 3001;

// Servir archivos estáticos
app.use(express.static(path.join(__dirname, '..')));

// Ruta para el simulador
app.get('/hospital3d-simulator', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'public', 'simulator.html'));
});

app.listen(PORT, () => {
  console.log(`🏥 Hospital Simulator running at http://localhost:${PORT}/hospital3d-simulator`);
});
