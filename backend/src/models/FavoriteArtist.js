import { DataTypes } from 'sequelize';
import sequelize from '../database/index.js';

const FavoriteArtist = sequelize.define('FavoriteArtist', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  channelId: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  avatar: {
    type: DataTypes.TEXT,
  },
}, {
  tableName: 'favoriteArtists',
});

export default FavoriteArtist;
