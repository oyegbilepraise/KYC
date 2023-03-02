const moreController = require("../controllers/opsflow.controller");
const router = require("express").Router();

router.post("/create_track", moreController.create_track);
router.post("/create_observer", moreController.create_observer);
router.post("/create_bucket", moreController.create_bucket);
router.post("/register_observer_to_track", moreController.register_observer_to_track);
router.post("/push_object_to_track", moreController.push_object_to_track);


module.exports = router;