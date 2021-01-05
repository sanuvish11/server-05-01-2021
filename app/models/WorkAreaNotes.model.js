module.exports = (sequelize, Sequelize) => {
    const WorkAreaNotes = sequelize.define("workareanotes", {
        id: {
            type: Sequelize.INTEGER,
            primaryKey: true
        },
        Notes: {
            type: Sequelize.STRING
        },
        UserName: {
            type: Sequelize.STRING
        },
        Date_Time: {
            type: Sequelize.STRING
        },father_id:{
            type: Sequelize.STRING 
        }
    });

    return WorkAreaNotes;
};