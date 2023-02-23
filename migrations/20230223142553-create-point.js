'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Points', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      owner: {
        type: Sequelize.NUMBER
      },
      latitude: {
        type: Sequelize.NUMBER
      },
      longitude: {
        type: Sequelize.NUMBER
      },
      depth: {
        type: Sequelize.NUMBER
      },
      salinity: {
        type: Sequelize.NUMBER
      },
      temperature: {
        type: Sequelize.NUMBER
      },
      soundspeed: {
        type: Sequelize.NUMBER
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('Points');
  }
};