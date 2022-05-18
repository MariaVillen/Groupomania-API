const Posts = require("../models/Post");
const Users = require("../models/User");
const Comments = require("../models/Comment");
const Reports = require(".../models/Report");

// Get all the reports
// [GET] http://localhost:3000/reports
exports.getAllReports = (req, res) => {};

// Get one report by id
// [GET] http://localhost:3000/reports/:id
exports.getReportById = (req, res) => {};

// Change the state of a report
// [PUT] http://localhost:3000/reports/:id
exports.updateReport = (req, res) => {};

// Remove a post by Id
// [DELETE] http://localhost:3000/reports/:id
exports.deleteReport = (req, res) => {};

// Create a report for a post with the post id
// [POST] http://localhost:3000/api/reports/post/:id
exports.addReportOnPost = (req, res) => {};

// Create a report for a comment with the comment id
// [POST] http://localhost:3000/api/reports/comments/:id
exports.addReportOnComment = (req, res) => {};
