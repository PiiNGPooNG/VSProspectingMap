const bcrypt = require('bcrypt');
const User = require('../models/User');

const mongoose = require('mongoose');

exports.login = async function(req, res) {
    const user = await User.findOne({'username': req.body.username});
    let validLogin = false;
    if (user) {
        validLogin = await bcrypt.compare(req.body.password, user.password)
    }
    if (validLogin) {
        req.session.user = user.username;
        res.json({success: true});
    } else {
        res.json({success: false});
    }
}