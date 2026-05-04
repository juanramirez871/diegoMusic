'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    const tableDesc = await queryInterface.describeTable('songsPlayed');
    if (!tableDesc.lastPlayedAt) {
      await queryInterface.addColumn('songsPlayed', 'lastPlayedAt', {
        type: Sequelize.DATE,
        allowNull: true,
      });
    }
  },

  async down(queryInterface) {
    await queryInterface.removeColumn('songsPlayed', 'lastPlayedAt');
  },
};
