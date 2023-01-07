module.exports = (sequelize, DataTypes) => {
    const BOLT = sequelize.define("bolt", {
        first_name: { type: DataTypes.STRING, required: true },
        last_name: { type: DataTypes.STRING, required: true },
        phone: { type: DataTypes.STRING, required: true },
        email: { type: DataTypes.STRING, required: true },
        deactivated: { type: DataTypes.BOOLEAN, required: true, defaultValue: false },
    });
    return BOLT;
};
