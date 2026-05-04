'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    const artistsCols = await queryInterface.describeTable('artists').catch(() => null);
    if (artistsCols) {
      if (!artistsCols.channelId) {
        await queryInterface.addColumn('artists', 'channelId', {
          type: Sequelize.STRING,
          allowNull: true,
        });
        await queryInterface.addIndex('artists', ['channelId'], {
          unique: true,
          name: 'artists_channelId_unique',
        });
      }
      if (!artistsCols.avatar) {
        await queryInterface.addColumn('artists', 'avatar', {
          type: Sequelize.TEXT,
          allowNull: true,
        });
      }
    }

    const tables = await queryInterface.showAllTables();
    if (tables.includes('favoriteArtists')) {
      await queryInterface.dropTable('favoriteArtists');
    }

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
      artistId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'artists', key: 'id' },
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

    await queryInterface.addIndex('favoriteArtists', ['userId', 'artistId'], {
      unique: true,
      name: 'favoriteArtists_user_artist_unique',
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('favoriteArtists');
    await queryInterface.removeColumn('artists', 'channelId').catch(() => {});
    await queryInterface.removeColumn('artists', 'avatar').catch(() => {});
  },
};
