const { Sequelize } = require('sequelize');
const dotenv = require('dotenv');

dotenv.config();

const dialect = process.env.DB_DIALECT || 'mariadb';

const sequelize = new Sequelize(
  process.env.DB_NAME || 'devshowcase_db',
  process.env.DB_USER || 'admin',
  process.env.DB_PASS || 'labbnbr@123',
  {
    host: process.env.DB_HOST || '127.0.0.1',
    port: parseInt(process.env.DB_PORT, 10) || 3306,
    dialect: dialect,
    dialectOptions: {
      connectTimeout: 15000,
      // Support for timezone
      timezone: '+00:00'
    },
    logging: process.env.NODE_ENV === 'development' ? (msg) => console.log(`[Sequelize] ${msg}`) : false,
    pool: {
      max: 15,
      min: 0,
      acquire: 30000,
      idle: 10000
    }
  }
);

/**
 * Test connection to MariaDB
 */
const connectMariaDB = async () => {
  try {
    await sequelize.authenticate();
    console.log(`[MariaDB] Connected successfully to ${process.env.DB_NAME} at ${process.env.DB_HOST}:${process.env.DB_PORT}`);
    return true;
  } catch (error) {
    console.error('[MariaDB] Connection error:', error.message);
    return false;
  }
};

/**
 * Synchronize tables with database
 * @param {boolean} alter - Whether to alter tables if schema changes
 */
const syncMariaDB = async (alter = false) => {
  try {
    await sequelize.sync({ alter });
    console.log('[MariaDB] All SQL models synchronized successfully.');
  } catch (error) {
    console.error('[MariaDB] Synchronization failed:', error.message);
    throw error;
  }
};

module.exports = {
  sequelize,
  connectMariaDB,
  syncMariaDB
};
