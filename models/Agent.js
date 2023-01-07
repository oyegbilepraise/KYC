const { Sequelize } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  const AGENT = sequelize.define("ercan_agent", {
    id: {
      type: Sequelize.UUID,
      defaultValue: Sequelize.UUIDV4,
      primaryKey: true,
    },
    phoneNumber: { type: DataTypes.STRING, required: false },
    keyword: { type: DataTypes.STRING, required: false },
    name: { type: DataTypes.STRING, required: false },
    referal_phone: { type: DataTypes.STRING, required: false }
  });

  return AGENT;
};
