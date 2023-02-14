const ores = require('../config/ores');

exports.index = function(req, res) {
    const isLoggedIn = req.session.user !== undefined;
    res.render('index', {ores, isLoggedIn});
}