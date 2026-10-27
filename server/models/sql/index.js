const { sequelize } = require('../../config/db.mariadb');
const User = require('./User');
const Project = require('./Project');
const Tag = require('./Tag');

// Define Many-to-Many relationship between Project and Tag
Project.belongsToMany(Tag, {
  through: 'project_tags',
  foreignKey: 'project_id',
  otherKey: 'tag_id',
  as: 'tags',
  timestamps: false,
});

Tag.belongsToMany(Project, {
  through: 'project_tags',
  foreignKey: 'tag_id',
  otherKey: 'project_id',
  as: 'projects',
  timestamps: false,
});

module.exports = {
  sequelize,
  User,
  Project,
  Tag,
};
