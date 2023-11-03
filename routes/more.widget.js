const moreController = require("../controllers/more.widget");
const router = require("express").Router();

router.post("/get_airtime", moreController.airtime);
router.post("/get_airtime_rerun", moreController.rerunAirtime);
router.post("/airtime/international", moreController.international);
router.post("/data_variation_code", moreController.data_variation_codes);
router.post("/get_data_subscription", moreController.data_subscripton);
router.post("/cabletv_subscription", moreController.cabletv_variation_codes);
router.post("/verify_smartcard_number", moreController.verify_smartcard_number);
router.post("/renew_catbletv_sub", moreController.renew_catbletv_sub);
router.post("/verify_meter_number", moreController.verify_meter_number);
router.post("/renew_meter_subscription", moreController.renew_meter_subscription);
router.post("/query_status", moreController.query_status);
router.get('/get_utilities', moreController.get_utilities);
router.get('/get_flutterwave_bills_categories', moreController.get_flutterwave_bills_categories);
router.post('/getUtilsByPhone', moreController.getUtilsByPhone);
router.post('/getUtilsbyFilters', moreController.getUtilsbyFilters);

module.exports = router;