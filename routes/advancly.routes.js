const advanclyController = require('../controllers/advancly.controller')
const router = require("express").Router();


router.post('/get_country_state', advanclyController.get_country_state);
router.post('/get_country_bank_list', advanclyController.get_country_bank_list);
router.post('/loan_application', advanclyController.loan_application);
router.get('/get_sectors', advanclyController.get_sectors);
router.get('/get_query_product_by_aggregator', advanclyController.get_query_product_by_aggregator);


module.exports = router;