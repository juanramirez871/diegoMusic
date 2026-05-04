'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {

    const tables = await queryInterface.showAllTables();
    if (tables.includes('favorites')) {
      await queryInterface.dropTable('favorites');
    }

    if (!tables.includes('favoriteSongs')) {
      await queryInterface.createTable('favoriteSongs', {
        id: {
          type: Sequelize.INTEGER,
          autoIncrement: true,
          primaryKey: true,
          allowNull: false,
        },
        userId: {
          type: Sequelize.INTEGER,
          allowNull: false,
          references: { model: 'users', key: 'id' },
          onUpdate: 'CASCADE',
          onDelete: 'CASCADE',
        },
        youtubeId: {
          type: Sequelize.STRING,
          allowNull: false,
        },
        title: {
          type: Sequelize.STRING,
          allowNull: false,
        },
        thumbnailUrl: {
          type: Sequelize.TEXT,
        },
        channelName: {
          type: Sequelize.STRING,
        },
        durationFormatted: {
          type: Sequelize.STRING,
        },
        createdAt: {
          type: Sequelize.DATE,
          allowNull: false,
        },
        updatedAt: {
          type: Sequelize.DATE,
          allowNull: false,
        },
      });

      await queryInterface.addIndex('favoriteSongs', ['userId', 'youtubeId'], {
        unique: true,
        name: 'favoriteSongs_user_youtube_unique',
      });
    }

    if (!tables.includes('favoriteArtists')) {
      await queryInterface.createTable('favoriteArtists', {
        id: {
          type: Sequelize.INTEGER,
          autoIncrement: true,
          primaryKey: true,
          allowNull: false,
        },
        userId: {
          type: Sequelize.INTEGER,
          allowNull: false,
          references: { model: 'users', key: 'id' },
          onUpdate: 'CASCADE',
          onDelete: 'CASCADE',
        },
        channelId: {
          type: Sequelize.STRING,
          allowNull: false,
        },
        name: {
          type: Sequelize.STRING,
          allowNull: false,
        },
        avatar: {
          type: Sequelize.TEXT,
        },
        createdAt: {
          type: Sequelize.DATE,
          allowNull: false,
        },
        updatedAt: {
          type: Sequelize.DATE,
          allowNull: false,
        },
      });

      await queryInterface.addIndex('favorite_artists', ['userId', 'channelId'], {
        unique: true,
        name: 'favorite_artists_user_channel_unique',
      });
    }
  },

  async down(queryInterface) {
    await queryInterface.dropTable('favorite_songs');
    await queryInterface.dropTable('favorite_artists');
  },
};
