'use strict';

const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Like extends Model {
    /**
     * Helper method for defining associations.
     */
    static associate(models) {
      // Like belongs to a user
      Like.belongsTo(models.User, {
        foreignKey: 'user_id',
        as: 'user'
      });

      // Like belongs to a recipe
      Like.belongsTo(models.Recipe, {
        foreignKey: 'recipe_id',
        as: 'recipe'
      });
    }
  }

  Like.init(
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
      created_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW
      }
    },
    {
      sequelize,
      modelName: 'Like',
      tableName: 'likes',
      timestamps: false,
      underscored: true,
      indexes: [
        {
          unique: true,
          fields: ['user_id', 'recipe_id'],
          name: 'unique_user_recipe_like'
        }
      ]
    }
  );

  return Like;
};