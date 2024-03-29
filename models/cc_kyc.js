module.exports = (sequelize, DataTypes) => {
  const KYC = sequelize.define('cc-kyc', {
    stage: { type: DataTypes.INTEGER, required: false, defaultValue: 0 },
    step: { type: DataTypes.INTEGER, required: false, defaultValue: 0 },
    phone: { type: DataTypes.STRING, required: false },
    full_name: { type: DataTypes.STRING, required: false },
    dob: { type: DataTypes.STRING, required: false },
    gender: { type: DataTypes.STRING, required: false },
    email: { type: DataTypes.STRING, required: false },
    residential_address: { type: DataTypes.STRING, required: false },
    profile_picture: { type: DataTypes.STRING, required: false },
    bvn: { type: DataTypes.STRING, required: false },
    nin: { type: DataTypes.STRING, required: false },
    signature: { type: DataTypes.STRING, required: false },
    level: { type: DataTypes.INTEGER, required: false, defaultValue: 0 },
    confirmed: { type: DataTypes.INTEGER, required: false, defaultValue: 0 },
    delete: { type: DataTypes.INTEGER, required: false, defaultValue: 0 },
    nok_name: { type: DataTypes.STRING, required: false },
    nok_email: { type: DataTypes.STRING, required: false },
    nok_phone: { type: DataTypes.STRING, required: false },
    nok_address: { type: DataTypes.STRING, required: false },
    nok_relationship: { type: DataTypes.STRING, required: false },
    completed: { type: DataTypes.INTEGER, required: false, defaultValue: 0 }
  })

  return KYC;
}