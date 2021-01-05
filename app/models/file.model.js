module.exports = (sequelize, Sequelize) => {
    const File = sequelize.define('File', {
        type: {
            type: Sequelize.STRING
        },
        name: {
            type: Sequelize.STRING
        },
        data: {
            type: Sequelize.BLOB('long')
        }
    });

    return File;
}