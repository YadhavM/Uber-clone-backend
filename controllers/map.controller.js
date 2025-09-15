const mapsService = require('../services/maps.service')
const {validationResult} = require('express-validator')

module.exports.getCoordinates = async (req,res,next)=>{

    const errors  = validationResult(req)

    if(!errors.isEmpty()) { 
        return res.status(404).json({errors : errors.array()})
    }
    const {address} = req.query

    try { 
        const coordinates = await mapsService.getCoordinates(address)
        
        res.status(200).json(coordinates)
    }catch (err) { 
        res.status(404).json({message : 'Coordinate Not Found'})
    }

}

module.exports.getDistanceTime = async(req,res,next)=>{

    const errors  = validationResult(req)

    if(!errors.isEmpty()) { 
        return res.status(404).json({errors : errors.array()})
    }

    const {origin , destination} = req.query ;


    const originLocation = await mapsService.getCoordinates(origin)
    const destinationLocation = await mapsService.getCoordinates(destination)

    const originCoord = {
        coords : `${originLocation.lon},${originLocation.lat}`
    }
    const destinationCoord = {
        coords : `${destinationLocation.lon},${destinationLocation.lat}`
    }
    
    try{
        const DistanceTime = await mapsService.getDistanceTime(originCoord.coords,destinationCoord.coords)

        res.status(200).json(DistanceTime)
    }catch(err){
        console.log(err)
        res.status(500).json({message : 'Internal server error'})
    }
}

module.exports.getSuggestions = async (req,res,next) =>{
    
    const errors  = validationResult(req)

    if(!errors.isEmpty()) { 
        return res.json({errors : errors.array()})
    }
    const {address} = req.query

    try { 
        const suggestions = await mapsService.getSuggestions(address)
        res.status(200).json(suggestions)

    }catch (err){
        console.log(err)
        res.status(500).json({message : 'Internal server error'})

    }
}