'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('likes', {
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
      recipe_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'recipes',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      }
    });

    // Add unique constraint to prevent duplicate likes
    await queryInterface.addConstraint('likes', {
      fields: ['user_id', 'recipe_id'],
      type: 'unique',
      name: 'unique_user_recipe_like'
    });

    // Add indexes for faster queries
    await queryInterface.addIndex('likes', ['user_id']);
    await queryInterface.addIndex('likes', ['recipe_id']);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('likes');
  }
};