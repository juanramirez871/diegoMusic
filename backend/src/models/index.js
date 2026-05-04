import sequelize from '../database/index.js';
import User from './User.js';
import Artist from './Artist.js';
import Song from './Song.js';
import Settings from './Settings.js';
import SongPlayed from './SongPlayed.js';
import FavoriteSong from './FavoriteSong.js';
import FavoriteArtist from './FavoriteArtist.js';

Artist.hasMany(Song, { foreignKey: 'artistId' });
Song.belongsTo(Artist, { foreignKey: 'artistId' });

User.hasOne(Settings, { foreignKey: 'userId', onDelete: 'CASCADE' });
Settings.belongsTo(User, { foreignKey: 'userId' });

User.hasMany(SongPlayed, { foreignKey: 'userId', onDelete: 'CASCADE' });
SongPlayed.belongsTo(User, { foreignKey: 'userId' });

User.hasMany(FavoriteSong, { foreignKey: 'userId', onDelete: 'CASCADE' });
FavoriteSong.belongsTo(User, { foreignKey: 'userId' });

User.hasMany(FavoriteArtist, { foreignKey: 'userId', onDelete: 'CASCADE' });
FavoriteArtist.belongsTo(User, { foreignKey: 'userId' });

Artist.hasMany(FavoriteArtist, { foreignKey: 'artistId', onDelete: 'CASCADE' });
FavoriteArtist.belongsTo(Artist, { foreignKey: 'artistId' });

export { sequelize, User, Artist, Song, Settings, SongPlayed, FavoriteSong, FavoriteArtist };
