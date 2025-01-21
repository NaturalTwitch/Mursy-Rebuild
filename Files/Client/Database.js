const { Pool } = require('pg');
require('dotenv').config();
const currentDate = new Date()
const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'Mursy',
  password: process.env.DATABASE_PASS,
  port: 5432,
});
pool.query('SELECT NOW() as now;', (err) => {
  if (err) {
    console.log(`[${currentDate.toLocaleString()}][Mursy Systems] Couldn't connect to DataBase`, err.stack);
  } else {
    console.log(`[${currentDate.toLocaleString()}][Mursy Systems] Established Connection to DataBase`);
  }
});
pool.connect((err) => {
  if (err) {
    console.log('[Mursy Systems] Error while logging into DataBase', err.stack);
  }
});
pool.on('error', (err) => {
  console.log('[Mursy Systems] Unexpected error on idle pool client', err);
});

module.exports = pool;

/*
  🎒 Mursy | Norm Development 🧪
  🎨 @NaturalTwitch#8920 🔍
  🎋 Unauthorized Duplication is Prohibited 🥏
*/
