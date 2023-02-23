const { Point } = require('../models')

const depthsArray = [0, 10, 20, 30, 50, 75, 100, 125, 150, 200, 250, 300, 400, 500, 600, 700, 800, 900, 1000, 1100]
const coolPromiseArray = []
const finalArray = []


async function oceanDataFetch(req, res) {
  try {
      depthsArray.forEach(depth=> {
      coolPromiseArray.push(fetch(`https://ocean.amentum.io/rtofs?latitude=${req.body.lat}&longitude=${req.body.long}&depth=${depth}`, {headers: {"API-key": "YNFcwbuOA1FUZtjvhkniG4ZCTApanxMJ"}}))
    })
    return Promise.all(coolPromiseArray).then((values) => {
      const coolValues = values.map(value => value.json())
      return Promise.all(coolValues).then((coolvalues) => {
        for (let i = 0; i < coolValues.length; i++){
          if (coolvalues[0].point.on_land) return res.status(500).json("Invalid point!")
          // console.log(coolvalues[i].point.on_land);
          let metrics = {}
          metrics.latitude = req.body.lat
          metrics.longitude = req.body.long
          metrics.ownerId = req.user.profile.id
          //DEPTH IN FEET
          metrics.depth = (coolvalues[i].point.depth *  3.280839895)
          //TEMP in F
          metrics.temperature = (coolvalues[i].temperature.value * 1.8) + 32
          //Salinity in PPT
          metrics.salinity = coolvalues[i].salinity.value
          //Sound Speed in Ft/Sec
          metrics.soundSpeed = (4427.2 + 11.962*(metrics.temperature) - 0.0553*(metrics.temperature * metrics.temperature) + 4.562*(metrics.salinity-35) + 0.016*(metrics.depth))
          // console.log(metrics.soundSpeed);
          finalArray.push(metrics)
        }
        // console.log(finalArray);
        return finalArray
      })
    });
  } catch (error) {
    console.log(error);
  }
}

async function createPoint(req, res) {
  try {
    req.body.lat = 22.9
    req.body.long = -43.1
    req.body.ownerId = req.user.profile.id
    Promise.resolve(oceanDataFetch(req, res)).then(measurements => {
      let finalObj = {
        latitude: req.body.lat,
        longitude: req.body.long,
        ownerId: req.body.ownerId,
        depth: [],
        temperature: [],
        salinity: [],
        soundSpeed: []
      }
      for (let i = 0; i < measurements.length; i++){
        if (measurements[i].temperature === null) return
        finalObj.depth.push(measurements[i].depth)
        finalObj.temperature.push(measurements[i].temperature)
        finalObj.salinity.push(measurements[i].salinity)
        finalObj.soundSpeed.push(measurements[i].soundSpeed)
      }
      console.log(finalObj);
      Point.create(finalObj)
    })
  } catch (error) {
    console.log(error);
    res.status(500).json({ err: error })
  }
}

// async function createPoint(req, res) {
//   try {
//     req.body.lat = 22.9
//     req.body.long = -43.1
//     const data = await oceanDataFetch(req, res)
//     console.log(data);
//     // const point = await Point.create(req.body)
//     res.status(200).json(data)
//   } catch (error) {
//     res.status(500).json({ err: error })
//   }
// }

module.exports = {
  createPoint,
}