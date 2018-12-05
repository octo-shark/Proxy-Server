const router = require('express').Router();
const { mongoURL } = require("../config");
const { postgresURL } = require("../config");


//Not used, left for reference
// const authCheck = (req, res, next) => {
//     if(!req.user){
//         res.redirect('/auth/login');
//     } else {
//         next();
//     }
// };

router.get("/:userID", (req, res) => {
    request.get(
      `http://${postgresURL}/users/${req.params.userID}`,        
      (err, data) => {
        if (err) {
          console.log('error in function app.get("/:userID") ',err)
          res.status(500).send(err);
        } else {
          res.status(200).send(JSON.parse(data.body));
        }
      }
    );
});

router.get("/:userID/timestamps",(req, res) => {
    request.get(
      `http://${mongoURL}/api/db/${req.params.userID}`,
      (err, data) => {
        if (err) {
          console.log('error in app.get("/:userID/timestamps")',err);
          res.status(500).send(err);
        } else {
          res.status(200).send(JSON.parse(data.body));
        }
      }
    );
});

router.post(
    "/:userID/timestamps", (req, res) => {
      request.post(
        {
          url: `http://${mongoURL}/api/db`,
          form: {
            user_id: req.body.user_id,
            activity_id: req.body.activity_id,
            timestamp_start: req.body.timestamp_start,
            timestamp_end: req.body.timestamp_end
          }
        },
        (err, data) => {
          if (err) {
            console.log('error in app.post("/:userID/timestamps"): ', err);
            res.status(500).send(err);
          } else {
            res.status(200).send(JSON.parse(data.body));
          }
        }
      );
    }
  );

  router.get(
    "/:userID/activities",   //Empty get request??
    (req, res) => {
      //Put stuff
    }
  );

module.exports = router;