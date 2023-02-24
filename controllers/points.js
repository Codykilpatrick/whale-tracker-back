const { Point } = require('../models')
const depthsArray = [0, 10, 20, 30, 50, 75, 100, 125, 150, 200, 250, 300, 400, 500, 600, 700, 800, 900, 1000, 1100]
let coolPromiseArray = []
let finalArray = []

async function oceanDataFetch(req, res) {
  try {
      depthsArray.forEach(depth => {
      coolPromiseArray.push(fetch(`https://ocean.amentum.io/rtofs?latitude=${req.body.latitude}&longitude=${req.body.longitude}&depth=${depth}`, {headers: {"API-key": "ScgLjETZnRQjXVyuHaLp0Ji4Yg1JZtto"}}))
    })
    return Promise.all(coolPromiseArray).then((values) => {
      const coolValues = values.map(value => value.json())
      return Promise.all(coolValues).then((coolvalues) => {
        for (let i = 0; i < coolValues.length; i++){
          let metrics = {}
          metrics.latitude = req.body.latitude
          metrics.longitude = req.body.longitude
          metrics.ownerId = req.user.profile.id
          //DEPTH IN FEET
          metrics.depth = (coolvalues[i].point.depth *  3.280839895)
          //TEMP in F
          metrics.temperature = (coolvalues[i].temperature.value * 1.8) + 32
          //Salinity in PPT
          metrics.salinity = coolvalues[i].salinity.value
          //Sound Speed in Ft/Sec
          metrics.soundSpeed = (4427.2 + 11.962*(metrics.temperature) - 0.0553*(metrics.temperature * metrics.temperature) + 4.562*(metrics.salinity-35) + 0.016*(metrics.depth))
          console.log("metrics", metrics);
          finalArray.push(metrics)
        }
        console.log("finalARRAY", finalArray);
        return finalArray
      })
    });
  } catch (error) {
    console.log(error);
  }
}

async function createPoint(req, res) {
  try {
    req.body.ownerId = req.user.profile.id
    let finalObj = {
      latitude: req.body.latitude,
      longitude: req.body.longitude,
      ownerId: req.body.ownerId,
      depth: [],
      temperature: [],
      salinity: [],
      soundspeed: []
    }
    Promise.resolve(await oceanDataFetch(req, res)).then(measurements => {
      for (let i = 0; i < measurements.length; i++){
        if (measurements[i].temperature === null) return
        finalObj.depth.push(measurements[i].depth)
        finalObj.temperature.push(measurements[i].temperature)
        finalObj.salinity.push(measurements[i].salinity)
        finalObj.soundspeed.push(measurements[i].soundSpeed)
      }
    })
    const createdPoint = await Point.create(finalObj)
    res.status(200).json(createdPoint)
  } catch (error) {
    console.log(error);
    res.status(500).json({ err: error })
  }
}


module.exports = {
  createPoint,
}