const  rideService = require('../services/ride.service')
const {validationResult} = require('express-validator')
const mapService = require('../services/maps.service')
const {sendMessageToSocketId} = require('../socket') 
const rideModel = require('../models/ride.model')


module.exports.createRide = async (req,res)=>{
    const errors = validationResult(req)

    if(!errors.isEmpty()){
       return res.status(200).json({errors : errors.array()})
    }

    const {pickup,destination,vehicleType} = req.body ;
    try { 
        const ride = await rideService.createRide({
            user : req.user._id , 
            pickup,
            destination,
            vehicleType
        })

        const  pickupCoords = await mapService.getCoordinates(pickup)
        
        const captainsInRadius = await mapService.getCaptainsInTheRadius(pickupCoords.lon , pickupCoords.lat , 20)

        ride.otp=""


        const ridewithUser = await rideModel.findOne({_id : ride._id}).populate('user')


        captainsInRadius.map(captain =>{
            console.log(captain.socketId)
            sendMessageToSocketId(captain.socketId , {
                event : 'new-ride' , 
                data : ridewithUser
            })

        })


        console.log(captainsInRadius)

        return res.status(200).json(ride)

    }catch(err) { 
        return res.status(500).json({message : err.message})
    }
}


module.exports.getFare = async (req,res)=>{
    const errors = validationResult(req) ; 
    if(!errors.isEmpty()){ 
        return res.status(400).json({errors : errors.array()})
    }

    const {pickup,destination} = req.query ; 

    try{
        const fare = await rideService.getFare(pickup , destination)
        return res.status(200).json(fare)
    }catch(error) { 
        res.status(500).json({message : error.message})}
}

module.exports.confirmRide = async (req,res) => {
    const errors = validationResult(req) ; 
    if(!errors.isEmpty()){ 
        return res.status(400).json({errors : errors.array()})
    }

    const {rideId} = req.body

    try { 
        const ride = await rideService.confirmRide({rideId , captain : req.captain})

        sendMessageToSocketId(ride.user.socketId , {
            event : 'ride-confirmed' , 
            data : ride 
        })


        return res.status(200).json(ride)
    }catch(error) { 
        return res.status(500).json({message : errors.message})
    }

}

module.exports.startRide = async (req,res) => {

    const errors = validationResult(req) 

    if(!errors.isEmpty()) { 
        return res.status(400).json({errors : errors.array()})
    }

    const {rideId , otp} = req.query ; 

    try { 
        const ride = await rideService.startRide({rideId , otp , captain : req.captain})

        

        sendMessageToSocketId(ride.user.socketId , {
            event : 'ride-started' ,
            data  :ride
        })

        return res.status(200).json(ride)
    }catch(error) { 
        console.log(error)
        throw error
    }
    
}


module.exports.endRide = async (req,res) => {

    const errors = validationResult(req)

    if(!errors.isEmpty()){
        return res.status(500).json({errors : errors.array()})
    }

    const {rideId} = req.body

    try { 
        const ride = await rideService.endRide({rideId , captain : req.captain})

        sendMessageToSocketId(ride.user.socketId , {
            event : 'ride-ended' , 
            data : ride
        })

        return res.status(200).json(ride)
    }catch(error) { 
        return res.status(500).json({message : error.message})
    }
}