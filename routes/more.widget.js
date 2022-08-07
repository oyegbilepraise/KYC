const moreController = require("../controllers/more.widget");
const router = require('express').Router();

router.post('/airtime', moreController.airtime);
router.post('/data_variation_code', moreController.data_variation_codes);
router.post('/data_subscription', moreController.data_subscripton);


module.exports = router;