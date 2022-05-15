module.exports = (sequelize, DataTypes) => {
    const KYC = sequelize.define('kyc', {
        stage: {type: DataTypes.INTEGER, required: false, defaultValue: 0},
        step: {type: DataTypes.INTEGER, required: false, defaultValue: 0},
        phone: {type: DataTypes.STRING, required: false}, 
        location: {type: DataTypes.STRING, required: false},
        picture: {type: DataTypes.STRING, required: false},
        other_name: {type: DataTypes.STRING, required: false},
        house_type: {type: DataTypes.STRING, required: false},
        landmark: {type: DataTypes.STRING, required: false},
        landmark_picture: {type: DataTypes.STRING, required: false},
        address: {type: DataTypes.STRING, required: false},
    })

    return KYC;
}