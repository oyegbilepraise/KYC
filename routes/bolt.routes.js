const router = require("express").Router();
const boltController = require('../controllers/bolt.controller');

router.get('/getActivePeople', boltController.getActivePeople)
router.post('/deactivatePeople', boltController.deactivatePeople)
router.post('/updatePeopleProfile', boltController.updatePeopleProfile)
router.post('/addPeopleProfile', boltController.addPeopleProfile)
router.get('/login', boltController.login)

module.exports = router;