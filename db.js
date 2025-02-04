const mysql = require('mysql2/promise');
require('dotenv').config();  // Para manejar variables de entorno si lo necesitas


const db = mysql.createPool({
  host: 'localhost', 
  user: 'root',    
  password: 'A25bd1e23', 
  database: 'petmatch', 
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

module.exports = db;