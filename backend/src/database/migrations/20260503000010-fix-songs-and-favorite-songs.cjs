'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    // --- Fix songs table: add missing columns ---
    const songsCols = await queryInterface.describeTable('songs').catch(() => null);
    if (songsCols) {
      if (!songsCols.youtubeId) {
        await queryInterface.addColumn('songs', 'youtubeId', {
          type: Sequelize.STRING,
          allowNull: true,
        });
        await queryInterface.addIndex('songs', ['youtubeId'], {
          unique: true,
          name: 'songs_youtubeId_unique',
        });
      }
      if (!songsCols.thumbnailUrl) {
        await queryInterface.addColumn('songs', 'thumbnailUrl', {
          type: Sequelize.TEXT,
          allowNull: true,
        });
      }
      if (!songsCols.durationFormatted) {
        await queryInterface.addColumn('songs', 'durationFormatted', {
          type: Sequelize.STRING,
          allowNull: true,
        });
      }
      if (!songsCols.audioUrl) {
        await queryInterface.addColumn('songs', 'audioUrl', {
          type: Sequelize.TEXT,
          allowNull: true,
        });
      }
      if (!songsCols.audioUrlCachedAt) {
        await queryInterface.addColumn('songs', 'audioUrlCachedAt', {
          type: Sequelize.DATE,
          allowNull: true,
        });
      }
    }

    // --- Fix favoriteSongs table: drop old (wrong schema), recreate with songId FK ---
    const tables = await queryInterface.showAllTables();
    if (tables.includes('favoriteSongs')) {
      await queryInterface.dropTable('favoriteSongs');
    }

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
      songId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'songs', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
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

    await queryInterface.addIndex('favoriteSongs', ['userId', 'songId'], {
      unique: true,
      name: 'favoriteSongs_user_song_unique',
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('favoriteSongs');
    await queryInterface.removeColumn('songs', 'youtubeId').catch(() => {});
    await queryInterface.removeColumn('songs', 'thumbnailUrl').catch(() => {});
    await queryInterface.removeColumn('songs', 'durationFormatted').catch(() => {});
    await queryInterface.removeColumn('songs', 'audioUrl').catch(() => {});
    await queryInterface.removeColumn('songs', 'audioUrlCachedAt').catch(() => {});
  },
};
