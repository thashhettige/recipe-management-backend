'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('user_follows', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      follower_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      following_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'users',
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

    // Prevent duplicate follows
    await queryInterface.addConstraint('user_follows', {
      fields: ['follower_id', 'following_id'],
      type: 'unique',
      name: 'unique_follower_following'
    });

    // Indexes
    await queryInterface.addIndex('user_follows', ['follower_id']);
    await queryInterface.addIndex('user_follows', ['following_id']);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('user_follows');
  }
};