import { DataTypes } from 'sequelize';
import sequelize from '../database/index.js';

const Favorite = sequelize.define('Favorite', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  songId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
}, {
  tableName: 'favorites',
});

export default Favorite;
