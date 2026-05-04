'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('songsPlayed', {
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
      times: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 1,
      },
      lyricsQuery: {
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
  },

  async down(queryInterface) {
    await queryInterface.dropTable('songsPlayed');
  },
};
