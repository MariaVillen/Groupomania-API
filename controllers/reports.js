const Posts = require("../models/Post");
const Users = require("../models/User");
const Comments = require("../models/Comment");
const Reports = require("../models/Report");

// Get all the reports
// [GET] http://localhost:3000/reports
exports.getAllReports = (req, res) => {};

// Get one report by id
// [GET] http://localhost:3000/report/:id
exports.getReportById = (req, res) => {};

// Change the state of a report
// [PUT] http://localhost:3000/report/:id
exports.updateReport = (req, res) => {};

// Remove a post by Id
// [DELETE] http://localhost:3000/report/:id
exports.deleteReport = (req, res) => {};

// Create a report for a post with the post id
// [POST] http://localhost:3000/api/report
exports.addReport = (req, res) => {
    console.log("report ", req.body);
    if (!req.body.reason) {
        return res.status(400).json({"error": "Pas de reason"});
    }

    let reportObject;
    if (req.body.commentId) {
        reportObject = {
        reason: req.body.reason,
        commentId: req.body.commentId,
        userId: req.userId
        }
    } else if (req.body.postId) {
     reportObject = {
        reason: req.body.reason,
        postId: req.body.postId,
        userId: req.userId
        }

    }else {
        return res.status(400).json({"error":"Pas de message Id"});
    }

    Reports.create(
     reportObject
    ).then(()=>{
        return res.status(200).json({"message": "Signalement realisé"})
    }).catch((err)=> {
        return res.status(500).json({"DataBaseError": err.message});
    })

};

