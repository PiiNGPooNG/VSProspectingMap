const Sample = require('../models/Sample.js');

exports.get = async function (req, res) {
    const area = getArea(req.body);
    if (!area) {
        res.json({success: false});
        return;
    }
    const samples = await Sample.find({
        x: {$gte: area.x0, $lt: area.x1}, y: {$gte: area.y0, $lt: area.y1}
    }, {_id: 0});
    res.json({success: true, samples: samples});
}

exports.add = async function (req, res) {
    const isLoggedIn = req.session.user !== undefined;
    if (!isLoggedIn) {
        res.json({success: false});
        return;
    }
    let sample = {
        user: req.session.user,
        ...req.body
    }
    await Sample.create(sample, function (err, sample) {
        res.json({success: !err});
    });
}

function getArea(reqBody) {
    const area = {
        x0: parseInt(reqBody.x0),
        y0: parseInt(reqBody.y0),
        x1: parseInt(reqBody.x1),
        y1: parseInt(reqBody.y1)
    }
    if (isNaN(area.x0) || isNaN(area.y0) || isNaN(area.x1) || isNaN(area.y1)) return null;
    if (area.x1 < area.x0 || area.y1 < area.y0) return null;
    if (area.x1 - area.x0 > 8192 || area.y1 - area.y0 > 8192) return null;
    return area;
}