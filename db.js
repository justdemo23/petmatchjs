const mysql = require('mysql2/promise');
require('dotenv').config();  // Para manejar variables de entorno si lo necesitas


const db = mysql.createPool({
  host: 'localhost', 
  user: 'root',    
  password: '71422400dmpb', 
  database: 'petmatch', 
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

module.exports = db;
