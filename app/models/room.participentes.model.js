module.exports = (sequelize, Sequelize) => {
    const RoomParticipant = sequelize.define("room_participants", {
    
        USER_ID: {
            type: Sequelize.STRING
        },
        USER_NAME: {
            type: Sequelize.STRING
        },
        ROOM_ID: {
            allowNull: false,
            unique: true,
            type: Sequelize.STRING
        },
        PASTOR_ID: {

            type: Sequelize.STRING
        },
        IS_FLAG:{
            type: Sequelize.INTEGER
        },
        CHAT_STATUS: {
            type: Sequelize.INTEGER
        },
        CHAT_COMMENT: {

            type: Sequelize.STRING
        },
        LAST_MESSAGE: {
            type: Sequelize.STRING
        },
        FLAG_COMMENT:{
            type : Sequelize.STRING
        },
        CREATED_BY: {
            type: Sequelize.STRING
        },
        MODIFY_BY: {
            type: Sequelize.STRING
        },
    });

    return RoomParticipant;
};