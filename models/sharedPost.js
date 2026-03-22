'use strict';

const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class SharedPost extends Model {
    /**
     * Helper method for defining associations.
     */
    static associate(models) {
      // SharedPost belongs to a user
      SharedPost.belongsTo(models.User, {
        foreignKey: 'user_id',
        as: 'user'
      });

      // SharedPost belongs to a recipe
      SharedPost.belongsTo(models.Recipe, {
        foreignKey: 'recipe_id',
        as: 'recipe'
      });
    }
  }

  SharedPost.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id'
        }
      },
      recipe_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'recipes',
          key: 'id'
        }
      },
      shared_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW
      }
    },
    {
      sequelize,
      modelName: 'SharedPost',
      tableName: 'shared_posts',
      timestamps: false,
      underscored: true
    }
  );

  return SharedPost;
};