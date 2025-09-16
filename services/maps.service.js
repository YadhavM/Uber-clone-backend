const axios = require('axios')
const captainModel = require('../models/captain.model')

module.exports.getCoordinates = async (address) => {
  if (!address) {
    throw new Error('Address is required');
  }
  try {
    console.log(address);
    const response = await axios.get(`https://photon.komoot.io/api/?q=${encodeURIComponent(address)}&limit=1`);
    console.log(response.data.features);
    if (response.status === 200 && response.data.features.length > 0) {
      const location = response.data.features[0];
      const [lon, lat] = location.geometry.coordinates;
      return {
        lat: lat,
        lon: lon,
      };
    } else {
      throw new Error('Unable to get Coordinates');
    }
  } catch (err) {
    console.log(err);
    throw err;
  }
};

module.exports.getDistanceTime = async (origin,destination) => {
    if(!origin || !destination) { 
        throw new Error('Origin and Destination are required')
    }
    try { 
        const response = await axios.get(`https://router.project-osrm.org/route/v1/driving/${origin};${destination}?overview=false`, {
            headers: {
                'User-Agent': 'Uber-clone/1.0 (yadhavmundekkat@gmail.com)'
            }
        });
        if(response.status == 200) { 
            const data = response.data.routes[0] 
            return { 
                distance : data.distance, //meter
                time : data.duration //seconds
            }
        }else { 
            throw new Error('Unable to get Distance and Time')
        }
    }catch(error){
        console.log(error)
        throw error
    }
}

module.exports.getSuggestions = async (address)=>{


    if(!address) { 
        throw  new Error('Address is required')
    }

    try { 
        const response = await axios.get(`https://photon.komoot.io/api/?q=${encodeURIComponent(address)}&limit=10`, {
            headers: {
                'User-Agent': 'Uber-clone/1.0 (yadhavmundekkat@gmail.com)'
            }
        });

        if(response.status == 200) { 
            const data = response.data
            return data
        }else { 
            throw new Error('Unable to get suggestions')
        }
    }catch(error){
        console.log(error)
        throw error
    }
}

module.exports.getCaptainsInTheRadius = async (lon,lat,radius)=>{

    //radius in KM
    
    if(!lat || !lon || !radius) { 
        throw new Error("Lattitude, Longitude and Radius are required")
    }
    const captains = await captainModel.find({
        location : {
            $geoWithin : {
                $centerSphere : [ [lon,lat], radius / 6371]
            }
        }
    })

    return captains
}