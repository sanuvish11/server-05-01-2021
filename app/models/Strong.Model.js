module.exports = (sequelize, Sequelize) => {
    const STRONG = sequelize.define("Strong", {
        code: {
            type: Sequelize.STRING,
        },
        word: {
            type: Sequelize.STRING
        },
        meaning: {
            type: Sequelize.STRING
        },
        type:{
            type:Sequelize.STRING
        },
        chapter:{
            type:Sequelize.INTEGER  
        },
        verse:{
            type:Sequelize.STRING 
        },
        bibleId:{
            type:Sequelize.INTEGER
        },
    });
    return STRONG;
};
