module.exports = (sequelize, DataTypes) => {
    const KYC = sequelize.define('cc-kyc', {
        stage: {type: DataTypes.INTEGER, required: false, defaultValue: 0},
        step: {type: DataTypes.INTEGER, required: false, defaultValue: 0},
        phone: {type: DataTypes.STRING, required: false}, 
        full_name: {type: DataTypes.STRING, required: false},
        dob: {type: DataTypes.STRING, required: false},
        gender: {type: DataTypes.STRING, required: false},
        email: {type: DataTypes.STRING, required: false},
        residential_address: {type: DataTypes.STRING, required: false},
        profile_picture: {type: DataTypes.STRING, required: false},
        bvn: {type: DataTypes.STRING, required: false},
        nin: {type: DataTypes.STRING, required: false},
        signature: {type: DataTypes.STRING, required: false},
    })

    return KYC;
}