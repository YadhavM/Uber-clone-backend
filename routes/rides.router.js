const express = require('express')
const router = express.Router()
const {body,query} = require('express-validator')
const rideController = require('../controllers/ride.controller')
const authMiddleware = require('../middlewares/auth.middleware')

router.post('/create',
    authMiddleware.authUser,
    body('pickup').isString().isLength({min : 3}).withMessage('Invalid Pickup address'),
    body('destination').isString().isLength({min:3}).withMessage('Invalid Destination '),
    body('vehicleType').isString().isIn(['auto','car','motorcycle']).withMessage('InvalidVehicle'),
    rideController.createRide
)

router.get('/get-fare',
    authMiddleware.authUser,
    query('pickup').isString().isLength({min : 3}).withMessage("Invalid pickup"),
    query('destination').isString().isLength({min : 3}).withMessage("Indalid destination"),
    rideController.getFare
)

router.post('/confirm' , 
    authMiddleware.authCaptain , 
    body('rideId').isMongoId().withMessage('Invalid ride id'),
    rideController.confirmRide
)

router.get('/start-ride' , 
    authMiddleware.authCaptain , 
    query('rideId').isMongoId().withMessage('Invalid ride Id') , 
    query('otp').isString().isLength({min : 6 , max: 6}).withMessage('Invalid OTP'),
    rideController.startRide
)

router.post('/end-ride' , 
    authMiddleware.authCaptain , 
    body('rideId').isMongoId().withMessage('Invalid Ride id'),
    rideController.endRide
)

module.exports = router 