import { DataTypes } from 'sequelize';
import sequelize from '../database/index.js';

const SongPlayed = sequelize.define('SongPlayed', {
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
  times: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 1,
  },
  lyricsQuery: {
    type: DataTypes.STRING,
  },
}, {
  tableName: 'songsPlayed',
});

export default SongPlayed;
