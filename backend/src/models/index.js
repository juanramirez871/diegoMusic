import sequelize from '../database/index.js';
import User from './User.js';
import Artist from './Artist.js';
import Song from './Song.js';
import Settings from './Settings.js';
import SongPlayed from './SongPlayed.js';
import Favorite from './Favorite.js';

Artist.hasMany(Song, { foreignKey: 'artistId' });
Song.belongsTo(Artist, { foreignKey: 'artistId' });

User.hasOne(Settings, { foreignKey: 'userId', onDelete: 'CASCADE' });
Settings.belongsTo(User, { foreignKey: 'userId' });

User.hasMany(SongPlayed, { foreignKey: 'userId', onDelete: 'CASCADE' });
SongPlayed.belongsTo(User, { foreignKey: 'userId' });
Song.hasMany(SongPlayed, { foreignKey: 'songId', onDelete: 'CASCADE' });
SongPlayed.belongsTo(Song, { foreignKey: 'songId' });

User.hasMany(Favorite, { foreignKey: 'userId', onDelete: 'CASCADE' });
Favorite.belongsTo(User, { foreignKey: 'userId' });
Song.hasMany(Favorite, { foreignKey: 'songId', onDelete: 'CASCADE' });
Favorite.belongsTo(Song, { foreignKey: 'songId' });

export { sequelize, User, Artist, Song, Settings, SongPlayed, Favorite };
