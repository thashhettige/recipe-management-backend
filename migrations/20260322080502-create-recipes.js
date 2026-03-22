'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('recipes', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      user_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      recipe_type: {
        type: Sequelize.STRING,
        allowNull: false
      },
      recipe_name: {
        type: Sequelize.STRING,
        allowNull: false
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      ingredients: {
        type: Sequelize.JSON,
        allowNull: false
      },
      preparation_steps: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      preparation_time: {
        type: Sequelize.INTEGER,
        allowNull: false,
        comment: 'Time in minutes'
      },
      cooking_time: {
        type: Sequelize.INTEGER,
        allowNull: false,
        comment: 'Time in minutes'
      },
      servings: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      tips: {
        type: Sequelize.JSON,
        allowNull: true
      },
      is_shared: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updated_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP')
      }
    });

    // Add index for faster queries
    await queryInterface.addIndex('recipes', ['user_id']);
    await queryInterface.addIndex('recipes', ['is_shared']);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('recipes');
  }
};