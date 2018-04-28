var Pass = require('../models/pass');

var async = require('async');

exports.pass_list = function (req, res, next) {

    Pass.find({})
        .sort([['price', 'descending']])
        .exec(function (err, list_passes) {
            if (err) {
                return next(err);
            }
            return res.json(list_passes);
        });
};

//TODO: add validations
exports.pass_create_post = [
    (req, res, next) => {
        //validate fields
        console.log('Create a new Pass for ', req.body);

        Pass.create(req.body, function (err, result) {
            if (err) {
                if (err) res.status(500).json({ error: 'Internal server error' });
            }
            res.json(result);
        });

    }
];

exports.update = function (req, res, next) {
    console.log(req.body)
    console.log(req.params)
    Pass.findByIdAndUpdate(req.params.postId, { $set: req.body }, { new: true }, function (err, pass) {
        if (err) res.status(500).json({ error: 'Internal server error' });
        console.log(pass);
        return res.json(pass);
    });
};

exports.delete = function (req, res, next) {
    Pass.deleteOne({ _id: req.params.postId }, function (err, result) {
        if (err) res.status(500).json({ error: 'Internal server error' });
        return res.json({ message: 'successfully deleted' });
    });
}