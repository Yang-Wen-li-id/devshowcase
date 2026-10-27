const { DataTypes } = require('sequelize');
const { sequelize } = require('../../config/db.mariadb');

const Project = sequelize.define('Project', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  title: {
    type: DataTypes.STRING(255),
    allowNull: false,
    validate: {
      notEmpty: true,
    },
  },
  slug: {
    type: DataTypes.STRING(255),
    allowNull: false,
    unique: true,
    validate: {
      notEmpty: true,
    },
  },
  category: {
    type: DataTypes.ENUM('Web App', 'Network Topology', 'Game Dev', 'System Admin'),
    allowNull: false,
  },
  repo_url: {
    type: DataTypes.STRING(512),
    allowNull: true,
    validate: {
      isUrl: true,
    },
  },
  demo_url: {
    type: DataTypes.STRING(512),
    allowNull: true,
  },
  license: {
    type: DataTypes.STRING(64),
    allowNull: false,
    defaultValue: 'MIT',
  },
  featured: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
  },
}, {
  tableName: 'projects',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  indexes: [
    { unique: true, fields: ['slug'] },
    { fields: ['category'] },
    { fields: ['featured'] },
  ],
});

module.exports = Project;
