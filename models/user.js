'use strict';

const { Model } = require('sequelize');
const bcrypt = require('bcryptjs');

module.exports = (sequelize, DataTypes) => {
  class User extends Model {
     static associate(models) {
    
      //relationships
      User.hasMany(models.Recipe, {
        foreignKey: 'user_id',
        as: 'recipes'
      });

      User.hasMany(models.Like, {
        foreignKey: 'user_id',
        as: 'likes'
      });

      User.hasMany(models.Comment, {
        foreignKey: 'user_id',
        as: 'comments'
      });

      User.hasMany(models.SharedPost, {
        foreignKey: 'user_id',
        as: 'sharedPosts'
      });

      User.belongsToMany(models.User, {
        through: models.UserFollow,
        as: 'following',
        foreignKey: 'follower_id',
        otherKey: 'following_id'
      });

      User.belongsToMany(models.User, {
        through: models.UserFollow,
        as: 'followers',
        foreignKey: 'following_id',
        otherKey: 'follower_id'
      });

      User.belongsToMany(models.Recipe, {
        through: models.Like,
        as: 'likedRecipes',
        foreignKey: 'user_id',
        otherKey: 'recipe_id'
      });
    }

    //instance methods
    async validatePassword(password) {
      return await bcrypt.compare(password, this.password);
    }

    //check if user is following another user
    async isFollowing(userId) {
      const following = await this.getFollowing({ where: { id: userId } });
      return following.length > 0;
    }

    //check if user has liked a recipe
    async hasLiked(recipeId) {
      const liked = await this.getLikedRecipes({ where: { id: recipeId } });
      return liked.length > 0;
    }

    //get user's full name
    getFullName() {
      return `${this.first_name} ${this.last_name}`;
    }

    //convert to json (exclude password)
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