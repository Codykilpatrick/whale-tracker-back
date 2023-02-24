const router = require('express').Router()
const pointsCtrl = require('../controllers/points.js')
const middleware = require('../middleware/auth.js')

const { decodeUserFromToken, checkAuth } = middleware

/*---------- Public Routes ----------*/


/*---------- Protected Routes ----------*/
router.use(decodeUserFromToken)
router.post('/', checkAuth, pointsCtrl.createPoint)
router.get('/', checkAuth, pointsCtrl.index)

module.exports = router