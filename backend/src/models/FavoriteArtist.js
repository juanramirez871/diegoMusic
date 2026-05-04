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
  artistId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
}, {
  tableName: 'favoriteArtists',
});

export default FavoriteArtist;
