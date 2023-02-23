'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Point extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Point.belongsTo(models.Profile, {
        foreignKey: 'ownerId'
      })
    }
  }
  Point.init({
    ownerId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      onDelete: 'CASCADE',
      references: {
        model: 'Profiles',
        key: 'id'
      }
    },
    latitude: DataTypes.FLOAT,
    longitude: DataTypes.FLOAT,
    depth: DataTypes.ARRAY(DataTypes.FLOAT),
    salinity: DataTypes.ARRAY(DataTypes.FLOAT),
    temperature: DataTypes.ARRAY(DataTypes.FLOAT),
    soundspeed: DataTypes.ARRAY(DataTypes.FLOAT),
  }, {
    sequelize,
    modelName: 'Point',
  });
  return Point;
};