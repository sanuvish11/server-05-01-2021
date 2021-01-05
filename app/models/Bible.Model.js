module.exports = (sequelize, Sequelize) => {
    const Bible = sequelize.define('Bible', {
        type: {
            type: Sequelize.STRING
        },
        book: {
            type: Sequelize.STRING
        },
        chapter: {
            type: Sequelize.STRING
        },
        verse: {
            type: Sequelize.STRING
        },
        text: {
            type: Sequelize.STRING
        }
    });

    return Bible;
}