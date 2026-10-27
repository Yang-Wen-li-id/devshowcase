const { DataTypes } = require('sequelize');
const { sequelize } = require('../../config/db.mariadb');

const User = sequelize.define('User', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  username: {
    type: DataTypes.STRING(64),
    allowNull: false,
    unique: true,
    validate: {
      notEmpty: true,
      len: [3, 64],
    },
  },
  email: {
    type: DataTypes.STRING(128),
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true,
      notEmpty: true,
    },
  },
  password_hash: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  role: {
    type: DataTypes.ENUM('admin', 'viewer'),
    allowNull: false,
    defaultValue: 'viewer',
  },
  created_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
}, {
  tableName: 'users',
  timestamps: false,
  indexes: [
    { unique: true, fields: ['username'] },
    { unique: true, fields: ['email'] },
  ],
});

module.exports = User;
