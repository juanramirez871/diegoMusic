import { DataTypes } from 'sequelize';
import sequelize from '../database/index.js';

const User = sequelize.define('User', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  avatar: {
    type: DataTypes.STRING,
  },
  token: {
    type: DataTypes.STRING,
  },
}, {
  tableName: 'users',
});

export default User;
