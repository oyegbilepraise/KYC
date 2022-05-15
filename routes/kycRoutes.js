const kycController = require('../controllers/kycController')

const router = require('express').Router();

router.post('/kyc', kycController.kyc)

module.exports = router