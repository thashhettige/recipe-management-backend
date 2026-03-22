'use strict';

const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Recipe extends Model {
    /**
     * Helper method for defining associations.
     */
    static associate(models) {
      // Recipe belongs to a user
      Recipe.belongsTo(models.User, {
        foreignKey: 'user_id',
        as: 'user'
      });

      // Recipe has many likes
      Recipe.hasMany(models.Like, {
        foreignKey: 'recipe_id',
        as: 'likes'
      });

      // Recipe has many comments
      Recipe.hasMany(models.Comment, {
        foreignKey: 'recipe_id',
        as: 'comments'
      });

      // Recipe has many shared posts
      Recipe.hasMany(models.SharedPost, {
        foreignKey: 'recipe_id',
        as: 'shares'
      });

      // Many-to-Many: Users who liked this recipe
      Recipe.belongsToMany(models.User, {
        through: models.Like,
        as: 'likedBy',
        foreignKey: 'recipe_id',
        otherKey: 'user_id'
      });

      // Many-to-Many: Users who shared this recipe
      Recipe.belongsToMany(models.User, {
        through: models.SharedPost,
        as: 'sharedBy',
        foreignKey: 'recipe_id',
        otherKey: 'user_id'
      });
    }

    // Instance Methods

    /**
     * Get total cooking time
     */
    getTotalTime() {
      return this.preparation_time + this.cooking_time;
    }

    /**
     * Get likes count
     */
    async getLikesCount() {
      return await this.countLikes();
    }

    /**
     * Get comments count
     */
    async getCommentsCount() {
      return await this.countComments();
    }

    /**
     * Get shares count
     */
    async getSharesCount() {
      return await this.countShares();
    }
  }

  Recipe.init(
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
      recipe_type: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notEmpty: true
        }
      },
      recipe_name: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notEmpty: true,
          len: [3, 200]
        }
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: false,
        validate: {
          notEmpty: true
        }
      },
      ingredients: {
        type: DataTypes.JSON,
        allowNull: false,
        validate: {
          notEmpty: true,
          isValidJSON(value) {
            if (!Array.isArray(value)) {
              throw new Error('Ingredients must be an array');
            }
          }
        }
      },
      preparation_steps: {
        type: DataTypes.TEXT,
        allowNull: false,
        validate: {
          notEmpty: true
        }
      },
      preparation_time: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
          min: 0
        }
      },
      cooking_time: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
          min: 0
        }
      },
      servings: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
          min: 1
        }
      },
      tips: {
        type: DataTypes.JSON,
        allowNull: true
      },
      is_shared: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false
      },
      created_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW
      },
      updated_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW
      }
    },
    {
      sequelize,
      modelName: 'Recipe',
      tableName: 'recipes',
      timestamps: true,
      underscored: true,
      createdAt: 'created_at',
      updatedAt: 'updated_at',
      scopes: {
        shared: {
          where: { is_shared: true }
        },
        byUser: (userId) => ({
          where: { user_id: userId }
        })
      }
    }
  );

  return Recipe;
};