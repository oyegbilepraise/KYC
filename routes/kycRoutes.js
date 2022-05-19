const kycController = require('../controllers/kycController')
const ccKycController =require('../controllers/cc_kycController')

const router = require('express').Router();

router.post('/kyc', kycController.kyc)
router.post('/customer_kyc', ccKycController.customer_kyc)

module.exports = router;