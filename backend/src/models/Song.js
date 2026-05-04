import { DataTypes } from 'sequelize';
import sequelize from '../database/index.js';

const Song = sequelize.define('Song', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  artistId: {
    type: DataTypes.INTEGER,
  },
}, {
  tableName: 'songs',
});

export default Song;
