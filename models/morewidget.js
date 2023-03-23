module.exports = (sequelize, DataTypes) => {
  const UTILITIES = sequelize.define("utilities", {
    name: { type: DataTypes.STRING, required: true },
    amount: { type: DataTypes.STRING, required: false },
    phone: { type: DataTypes.STRING, required: false },
    response_description: { type: DataTypes.STRING, required: false },
    requestId: { type: DataTypes.STRING, required: false },
    status: { type: DataTypes.STRING, required: false },
    product_name: { type: DataTypes.STRING, required: false },
    transactionId: { type: DataTypes.STRING, required: false },
    type: { type: DataTypes.STRING, required: false },
    unique_element: { type: DataTypes.STRING, required: false },
    smart_card_no: { type: DataTypes.STRING, required: false },
    subscription_type: { type: DataTypes.STRING, required: false },
    meter_number: { type: DataTypes.STRING, required: false },
    transactionId: { type: DataTypes.STRING, required: false },
    source: { type: DataTypes.STRING, required: true },
    merchant_id: { type: DataTypes.STRING, required: false },
    flw_ref: { type: DataTypes.STRING, required: true }
  });
  return UTILITIES;
};
