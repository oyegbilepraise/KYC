const kycController = require('../controllers/kycController')
const ccKycController =require('../controllers/cc_kycController')

const router = require('express').Router();

router.post('/field', kycController.kyc)
router.post('/customer_kyc', ccKycController.customer_kyc)
router.get('/get_all', ccKycController.getAll)
router.post('/delete', ccKycController.deleteOne)
router.post('/agent', ccKycController.Agent)
router.post('/fetch', kycController.hygeia)
router.post('/hegeia_schedule', kycController.hygeia_schedule)

module.exports = router;