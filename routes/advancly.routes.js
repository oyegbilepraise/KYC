const advanclyController = require('../controllers/advancly.controller')
const router = require("express").Router();


router.post('/get_country_state', advanclyController.get_country_state);
router.post('/get_country_bank_list', advanclyController.get_country_bank_list);
router.post('/loan_application', advanclyController.loan_application);
router.get('/get_sectors', advanclyController.get_sectors);
router.get('/get_query_product_by_aggregator', advanclyController.get_query_product_by_aggregator);
router.get('/get_seccurity_questions', advanclyController.get_seccurity_questions);
router.get('/get_signed_banks', advanclyController.get_signed_banks);
router.post('/get_default_wallet', advanclyController.get_default_wallet);
router.post('/get_loan_by_refrence', advanclyController.get_loan_by_refrence);
router.post('/save_security_question', advanclyController.save_security_question);
router.post('/set_pin', advanclyController.set_pin);
router.post('/reset_pin', advanclyController.reset_pin);
router.post('/get_wallet_transactions', advanclyController.get_wallet_transactions);
router.post('/withdraw_funds', advanclyController.withdraw_funds);


module.exports = router;