const express = require('express');
const cors = require('cors');
const sql = require('mssql');
const users = require('./routes/users.js'); 
const combos = require('./routes/combos.js'); 
const inventory = require('./routes/inventory.js'); 
const departments = require('./routes/departments.js'); 
const reports = require('./routes/reports.js'); 
const vales = require('./routes/vales.js'); 

const config = {
  user: 'dev',
  password: '123456789',
  server: 'inventec.cxcouucoof0v.us-east-1.rds.amazonaws.com',
  database: 'Inventec',
  port:1433,
  options: {
    encrypt: true, // Puedes probar estableciendo esto en false
    trustServerCertificate: true // Esta línea desactiva la verificación del certificado
  }
};

const app = express();
app.use(express.json());
app.use(cors());

app.use('/', users(config, sql));
app.use('/', combos(config, sql));
app.use('/', inventory(config, sql));
app.use('/', departments(config, sql));
app.use('/', reports(config, sql));
app.use('/', vales(config, sql));

const port = 1433;
app.listen(port, () => {
  console.log(`Servidor en ejecución en el puerto ${port}`);
});
