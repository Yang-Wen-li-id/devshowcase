const { DataTypes } = require('sequelize');
const { sequelize } = require('../../config/db.mariadb');

const Tag = sequelize.define('Tag', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING(64),
    allowNull: false,
    unique: true,
    validate: {
      notEmpty: true,
    },
  },
  icon_class: {
    type: DataTypes.STRING(64),
    allowNull: true,
    defaultValue: 'code',
  },
}, {
  tableName: 'tags',
  timestamps: false,
  indexes: [
    { unique: true, fields: ['name'] },
  ],
});

module.exports = Tag;
