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
  youtubeId: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  thumbnailUrl: {
    type: DataTypes.TEXT,
  },
  channelName: {
    type: DataTypes.STRING,
  },
  durationFormatted: {
    type: DataTypes.STRING,
  },
}, {
  tableName: 'favoriteSongs',
});

export default FavoriteSong;
