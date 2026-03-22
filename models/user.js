'use strict';

const { Model } = require('sequelize');
const bcrypt = require('bcryptjs');

module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // User has many recipes
      User.hasMany(models.Recipe, {
        foreignKey: 'user_id',
        as: 'recipes'
      });

      // User has many likes
      User.hasMany(models.Like, {
        foreignKey: 'user_id',
        as: 'likes'
      });

      // User has many comments
      User.hasMany(models.Comment, {
        foreignKey: 'user_id',
        as: 'comments'
      });

      // User has many shared posts
      User.hasMany(models.SharedPost, {
        foreignKey: 'user_id',
        as: 'sharedPosts'
      });

      // Many-to-Many: User follows many users (following)
      User.belongsToMany(models.User, {
        through: models.UserFollow,
        as: 'following',
        foreignKey: 'follower_id',
        otherKey: 'following_id'
      });

      // Many-to-Many: User has many followers
      User.belongsToMany(models.User, {
        through: models.UserFollow,
        as: 'followers',
        foreignKey: 'following_id',
        otherKey: 'follower_id'
      });

      // Many-to-Many: User liked recipes
      User.belongsToMany(models.Recipe, {
        through: models.Like,
        as: 'likedRecipes',
        foreignKey: 'user_id',
        otherKey: 'recipe_id'
      });
    }

    // Instance Methods

    /**
     * Check if password is valid
     */
    async validatePassword(password) {
      return await bcrypt.compare(password, this.password);
    }

    /**
     * Check if user is following another user
     */
    async isFollowing(userId) {
      const following = await this.getFollowing({ where: { id: userId } });
      return following.length > 0;
    }

    /**
     * Check if user has liked a recipe
     */
    async hasLiked(recipeId) {
      const liked = await this.getLikedRecipes({ where: { id: recipeId } });
      return liked.length > 0;
    }

    /**
     * Get user's full name
     */
    getFullName() {
      return `${this.first_name} ${this.last_name}`;
    }

    /**
     * Convert to JSON (exclude password)
     */
    toJSON() {
      const values = { ...this.get() };
      delete values.password;
      return values;
    }
  }

  User.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      first_name: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notEmpty: true,
          len: [2, 50]
        }
      },
      last_name: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notEmpty: true,
          len: [2, 50]
        }
      },
      email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: {
          isEmail: true
        }
      },
      password: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notEmpty: true,
          len: [6, 100]
        }
      },
      email_verified_at: {
        type: DataTypes.DATE,
        allowNull: true
      },
      google_id: {
        type: DataTypes.STRING,
        allowNull: true,
        unique: true
      },
      auth_provider: {
        type: DataTypes.STRING,
        allowNull: true
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
      modelName: 'User',
      tableName: 'users',
      timestamps: true,
      underscored: true,
      createdAt: 'created_at',
      updatedAt: 'updated_at',
      hooks: {
        beforeCreate: async (user) => {
          if (user.password) {
            user.password = await bcrypt.hash(user.password, 10);
          }
        },
        beforeUpdate: async (user) => {
          if (user.changed('password')) {
            user.password = await bcrypt.hash(user.password, 10);
          }
        }
      }
    }
  );

  return User;
};