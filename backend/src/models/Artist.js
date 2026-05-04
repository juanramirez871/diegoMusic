import { DataTypes } from 'sequelize';
import sequelize from '../database/index.js';

const Artist = sequelize.define('Artist', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
}, {
  tableName: 'artists',
});

export default Artist;
