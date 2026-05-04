import { DataTypes } from 'sequelize';
import sequelize from '../database/index.js';

const Settings = sequelize.define('Settings', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  language: {
    type: DataTypes.STRING,
  },
  videoQuality: {
    type: DataTypes.STRING,
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
}, {
  tableName: 'settings',
});

export default Settings;
