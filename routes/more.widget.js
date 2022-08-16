const moreController = require("../controllers/more.widget");
const router = require("express").Router();

router.post("/airtime", moreController.airtime);
router.post("/data_variation_code", moreController.data_variation_codes);
router.post("/data_subscription", moreController.data_subscripton);
router.post("/cabletv_subscription", moreController.cabletv_variation_codes);
router.post("/verify_smartcard_number", moreController.verify_smartcard_number);
router.post("/renew_catbletv_sub", moreController.renew_catbletv_sub);
router.post("/verify_meter_number", moreController.verify_meter_number);
router.post("/renew_meter_subscription", moreController.renew_meter_subscription);

module.exports = router;