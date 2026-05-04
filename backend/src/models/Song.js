import { DataTypes } from 'sequelize';
import sequelize from '../database/index.js';

const Song = sequelize.define('Song', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  youtubeId: {
    type: DataTypes.STRING,
    allowNull: true,
    unique: true,
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  thumbnailUrl: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  durationFormatted: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  artistId: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  audioUrl: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  audioUrlCachedAt: {
    type: DataTypes.DATE,
    allowNull: true,
  },
}, {
  tableName: 'songs',
});

export default Song;
