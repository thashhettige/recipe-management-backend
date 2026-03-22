'use strict';

const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class UserFollow extends Model {
    /**
     * Helper method for defining associations.
     */
    static associate(models) {
      // UserFollow belongs to follower (user)
      UserFollow.belongsTo(models.User, {
        foreignKey: 'follower_id',
        as: 'follower'
      });

      // UserFollow belongs to following (user)
      UserFollow.belongsTo(models.User, {
        foreignKey: 'following_id',
        as: 'following'
      });
    }
  }

  UserFollow.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      follower_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id'
        }
      },
      following_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'users',
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
      modelName: 'UserFollow',
      tableName: 'user_follows',
      timestamps: false,
      underscored: true,
      indexes: [
        {
          unique: true,
          fields: ['follower_id', 'following_id'],
          name: 'unique_follower_following'
        }
      ],
      validate: {
        noSelfFollow() {
          if (this.follower_id === this.following_id) {
            throw new Error('Users cannot follow themselves');
          }
        }
      }
    }
  );

  return UserFollow;
};