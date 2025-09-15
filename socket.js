const socketIo = require('socket.io');
const userModel = require('./models/user.model');
const captainModel = require('./models/captain.model');
const throttle = require('lodash.throttle');

let io;

function initialiseSocket(server) {
  io = socketIo(server, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST']
    }
  });

  io.on('connection', (socket) => {
    console.log(`Client connected : ${socket.id}`);

    // Join user or captain
    socket.on('join', async (data) => {
      const { userId, userType } = data;
      //console.log(`User ${userId} joined as ${userType}`);
      try {
        if (userType === 'user') {
          await userModel.findByIdAndUpdate(userId, { socketId: socket.id });
        } else if (userType === 'captain') {
          await captainModel.findByIdAndUpdate(userId, { socketId: socket.id });
        }
       // console.log(`Socket ID ${socket.id} saved for ${userType} ${userId}`);
      } catch (err) {
        console.error('Error saving socketId:', err.message);
      }
    });

    // Wrap the DB update logic in a throttled function (per socket)
    const throttledUpdateLocation = throttle(async (userId, location) => {
      try {
        await captainModel.findByIdAndUpdate(userId, {
          location: { lon: location.lon, lat: location.lat }
        });
        //console.log(`Updated captain ${userId} location to`, location);
      } catch (err) {
        console.error('Error updating location:', err.message);
      }
    }, 3000, { leading: true, trailing: true }); // once every 3s

    // Update captain location
    socket.on('update-location-captain', (data) => {
      const { userId, location } = data;
      //console.log(`Location update received from ${userId}`, location);

      // Validation
      if (!location || typeof location.lat !== 'number' || typeof location.lon !== 'number') {
        console.error('Invalid location data received:', data);
        return;
      }
      if (location.lat < -90 || location.lat > 90 || location.lon < -180 || location.lon > 180) {
        console.error('Location coordinates out of valid range:', location);
        return;
      }

      // Call the throttled update
      throttledUpdateLocation(userId, location);
    });

    // New ride event
    socket.on('new-ride', (data) => {
      console.log('New ride created:', data);
    });

    // Disconnect event
    socket.on('disconnect', () => {
      console.log(`Client disconnected : ${socket.id}`);
    });
  });
}

function sendMessageToSocketId(socketId, messageObject) {
  console.log(`Sending message to ${socketId}`, messageObject);
  if (io) {
    io.to(socketId).emit(messageObject.event, messageObject.data);
  } else {
    console.log('Socket.io not initialised.');
  }
}

module.exports = { initialiseSocket, sendMessageToSocketId };
