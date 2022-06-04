const Users = require("../models/User");
const Comments = require("../models/Comment");
const Reports = require("../models/Report");


// Get all the reports
// [GET] http://localhost:3500/report

exports.getAllReports = (req, res) => {
    
  Reports.findAll({ 
    include: [
      {model: Comments,
      attributes: [ "postId" ] },
      {model: Users,
      attributes: [ "profilePicture", "name" ]}
    ]
  })
  .then(( data )=>{
    return res.status( 200 ).json( data );
  })
  .catch(( err )=>{
    return res.status( 500 ).json({ "error":err.message });
  })        
};


// Change the state of a report
// [PUT] http://localhost:3500/report/:id

exports.updateReport = (req, res) => {
    
  const reportId = req.params.id;
  const state = req.body.state;
  const options = [ "Non lu", "En cours", "Accepté", "Rejeté", "Archivé" ];

  if ( !options.includes(state) ){
    return res.status( 400 ).json({ "error":"Les états acceptés sont Non lu, En cours, Accepté, Rejeté, Archivé" });
  }

  Reports.update({ state: state }, 
    {where : {id: reportId}
  })
  .then(()=>{
    return res.status( 200 ).json({ "message":"Etat du signalement modifié." });
  })
  .catch(( err )=>{
    return res.status( 500 ).json({ "error":err.message });
  })
    
};


// Create a report for a post with the post id
// [POST] http://localhost:3000/api/report

exports.addReport = (req, res) => {

  if ( !req.body.reason ) {
    return res.status( 400 ).json({ "error": "Pas de reason" });
  }

  let reportObject;

  if ( req.body.commentId ) {
    reportObject = {
      reason: req.body.reason,
      commentId: req.body.commentId,
      userId: req.userId
    }
  } else if ( req.body.postId ) {
    reportObject = {
      reason: req.body.reason,
      postId: req.body.postId,
      userId: req.userId
    }
  }else {
    return res.status( 400 ).json({ "error":"Pas de id" });
  }

  Reports.create(reportObject)
  .then(()=>{
    return res.status( 200 ).json({ "message": "Signalement realisé" })
  })
  .catch(( err )=> {
      return res.status( 500 ).json({ "DataBaseError": err.message });
  })

};

//TODO:
// Remove a post by Id
// [DELETE] http://localhost:3000/report/:id
exports.deleteReport = (req, res) => {};
