const rideModel = require('../models/ride.model')
const mapService = require('../services/maps.service')
const crypto = require('crypto');
const { sendMessageToSocketId } = require('../socket');

async function getFare(pickup, destination) {
    if (!pickup || !destination) { 
        throw new Error('Pickup and destination are required');
    }

    const pickupLocation = await mapService.getCoordinates(pickup);
    const destinationLocation = await mapService.getCoordinates(destination);

    const pickupCoord = {
        coords: `${pickupLocation.lon},${pickupLocation.lat}`
    };
    const destinationCoord = {
        coords: `${destinationLocation.lon},${destinationLocation.lat}`
    };

    const distanceTime = await mapService.getDistanceTime(
        pickupCoord.coords,
        destinationCoord.coords
    );

    const baseFare = {
        auto: 30,
        car: 50,
        motorcycle: 20,
        premium: 70,
    };

    const perKmRate = {
        auto: 10,
        car: 15,
        motorcycle: 8,
        premium: 22
    };

    const perMinuteRate = {
        auto: 2,
        car: 3,
        motorcycle: 1.5,
        premium: 4,
    };

    const distance = distanceTime.distance / 1000; // in km
    const time = distanceTime.time / 60; // in minutes

    const fare = {
        auto: baseFare.auto + Math.floor((distance * perKmRate.auto) + (time * perMinuteRate.auto)),
        car: baseFare.car + Math.floor((distance * perKmRate.car) + (time * perMinuteRate.car)),
        motorcycle: baseFare.motorcycle + Math.floor((distance * perKmRate.motorcycle) + (time * perMinuteRate.motorcycle)),
        premium: baseFare.premium + Math.floor((distance * perKmRate.premium) + (time * perMinuteRate.premium)),
    };

    
    return { fare, distance, time };
}

function getOtp(num) { 
    const otp = crypto.randomInt(Math.pow(10 , num-1) , Math.pow(10 , num)).toString()
    return otp 
}

module.exports.getFare = getFare 

module.exports.createRide = async ({ user, pickup, destination, vehicleType }) => {
    if (!user || !pickup || !destination || !vehicleType) {
        throw new Error('All fields are required');
    }

    const { fare, distance, time } = await getFare(pickup, destination);

    const ride = rideModel.create({
        user,
        pickup,
        destination,
        otp : getOtp(6) , 
        fare: fare[vehicleType],
        distance,
        duration : time ,    
    })

    return ride;
};

module.exports.confirmRide = async ({ rideId, captain }) => {
    try {
        if (!rideId) {
            throw new Error('Ride id is required');
        }

        await rideModel.findOneAndUpdate(
            { _id: rideId },
            {
                status: 'accepted',
                captain: captain._id,
            }
        ) 

        const ride = await rideModel.findOne({ _id: rideId })
            .populate('user').populate('captain').select('+otp')

        if (!ride) {
            throw new Error('Ride not found');
        }

        return ride;
    } catch (err) {
        console.error('confirmRide error:', err.message);
        throw err; // Re-throw or respond with custom error
    }
};

module.exports.startRide = async ({rideId , otp , captain})=> { 

    if(!rideId || !otp || !captain) { 
        throw new Error('All fields are required')
    }

    const ride = await rideModel.findOne({_id : rideId}).populate('user').populate('captain').select('+otp')

    if(!ride) { 
        throw new Error('Ride not found')
    }

    if(ride.status !== "accepted") { 
        throw new error('Ride not accepted')
    }

    if(ride.otp != otp) {
        throw new Error('Invalid otp')
    }

    await rideModel.findOneAndUpdate({_id : rideId}, 
        {
            status : "ongoing"
        }
    )

    sendMessageToSocketId(ride.user.socketId , {
        event : 'ride-started' , 
        data : ride
    })

    return ride 
}

module.exports.endRide = async ({rideId , captain}) => {
    
    if(!rideId || !captain) { 
        throw new Error('Captain and Ride id is required ')
    }

    const ride = await rideModel.findOne({
        _id : rideId,
        captain : captain._id
    }).populate('user').populate('captain')

    if(!ride) { 
        throw new Error('Ride not found')
    }


    if(ride.status !== 'ongoing') { 
        throw new Error('Ride not ongoing')
    }



    await rideModel.findOneAndUpdate({_id : rideId} , {
        status : 'completed'
    })

    return ride 

}
