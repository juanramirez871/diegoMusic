'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    const tableDesc = await queryInterface.describeTable('users');

    if (!tableDesc.googleId) {
      await queryInterface.addColumn('users', 'googleId', {
        type: Sequelize.STRING,
        unique: true,
        allowNull: true,
      });
    }

    if (!tableDesc.email) {
      await queryInterface.addColumn('users', 'email', {
        type: Sequelize.STRING,
        unique: true,
        allowNull: true,
      });
    }

    if (tableDesc.token) {
      await queryInterface.removeColumn('users', 'token');
    }
  },

  async down(queryInterface, Sequelize) {
    const tableDesc = await queryInterface.describeTable('users');

    if (tableDesc.googleId) {
      await queryInterface.removeColumn('users', 'googleId');
    }

    if (tableDesc.email) {
      await queryInterface.removeColumn('users', 'email');
    }

    if (!tableDesc.token) {
      await queryInterface.addColumn('users', 'token', {
        type: Sequelize.STRING,
      });
    }
  },
};
