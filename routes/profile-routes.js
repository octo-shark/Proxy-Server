const router = require('express').Router();
const { mongoURL } = require("../config");

router.get("/:userID/timestamps",(req, res) => {
    request.get(
      `http://${mongoURL}/api/db/${req.params.userID}`,
      (err, data) => {
        if (err) {
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
            res.status(500).send(err);
          } else {
            res.status(200).send(JSON.parse(data.body));
          }
        }
      );
    }
  );

module.exports = router;