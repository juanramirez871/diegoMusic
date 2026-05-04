import { DataTypes } from 'sequelize';
import sequelize from '../database/index.js';

const FavoriteSong = sequelize.define('FavoriteSong', {
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
  tableName: 'favoriteSongs',
});

export default FavoriteSong;
