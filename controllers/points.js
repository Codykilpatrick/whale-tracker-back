const { Point } = require('../models')
// Testing array!
const depthsArray = [0, 10, 20]
// const depthsArray = [0, 10, 20, 30, 50, 75, 100, 125, 150, 200, 250, 300, 400, 500, 600, 700, 800, 900, 1000, 1100]
let coolValues

async function oceanDataFetch(req, res) {
  let coolPromiseArray = []
  let finalArray = []
  try {
    depthsArray.forEach(depth => {
      coolPromiseArray.push(fetch(`https://ocean.amentum.io/rtofs?latitude=${req.body.latitude}&longitude=${req.body.longitude}&depth=${depth}`, {headers: {"API-key": `${process.env.OCEAN_DATA_API_KEY}`}}))
    })
    const newCoolPromises = await Promise.all(coolPromiseArray)
    const coolValues = await Promise.all(newCoolPromises.map(value => value.json()))
    console.log(coolValues)
        for (let i = 0; i < coolValues.length; i++){
          if (coolValues[i].point.depth === null || coolValues[i].salinity.value === null|| !coolValues[i].point.temperature === null || coolValues[i].on_land === true) break
          let metrics = {}
          metrics.latitude = req.body.latitude
          metrics.longitude = req.body.longitude
          metrics.ownerId = req.user.profile.id
          //DEPTH IN FEET
          metrics.depth = (coolValues[i].point.depth *  3.280839895)
          //TEMP in F
          metrics.temperature = (coolValues[i].temperature.value * 1.8) + 32
          //Salinity in PPT
          metrics.salinity = coolValues[i].salinity.value
          //Sound Speed in Ft/Sec
          metrics.soundSpeed = (4427.2 + 11.962*(metrics.temperature) - 0.0553*(metrics.temperature * metrics.temperature) + 4.562*(metrics.salinity-35) + 0.016*(metrics.depth))
          // console.log("metrics", metrics);
          finalArray.push(metrics)
        }
        // console.log("finalARRAY", finalArray);
        return finalArray
  } catch (error) {
    console.log(error);
  }
}

async function createPoint(req, res) {
  try {
    console.log(req.body);
    req.body.ownerId = req.user.profile.id
    req.body.latitude = parseFloat(req.body.latitude)
    req.body.longitude = parseFloat(req.body.longitude)
    console.log("REQ.BODY", req.body);
    let finalObj = {
      latitude: req.body.latitude,
      longitude: req.body.longitude,
      ownerId: req.body.ownerId,
      depth: [],
      temperature: [],
      salinity: [],
      soundspeed: []
    }
    const measurements = await oceanDataFetch(req, res)
      for (let i = 0; i < measurements.length; i++){
        if (measurements[i].temperature === null) continue
        finalObj.depth.push(measurements[i].depth)
        finalObj.temperature.push(measurements[i].temperature)
        finalObj.salinity.push(measurements[i].salinity)
        finalObj.soundspeed.push(measurements[i].soundSpeed)
      }

    const createdPoint = await Point.create(finalObj)
    res.status(200).json(createdPoint)
  } catch (error) {
    console.log(error);
    res.status(500).json({ err: error })
  }
}

const index = async (req, res) => {
  try {
    const points = await Point.findAll({
      where: {
        ownerId: req.user.profile.id
      },
      order: [
        ['id', 'DESC']
      ]
    })
    res.status(200).json(points)
  } catch (error) {
    console.log(error)
    res.status(500).json(error)
  }
}

const deletePoint = async (req, res) => {
  try {
    const numberOfRowsRemoved = await
    Point.destroy(
      {where: {id: req.params.id}}
    )
    res.status(200).json(numberOfRowsRemoved)
  } catch (error) {
    console.log(error);
  }
}

module.exports = {
  createPoint,
  index,
  delete: deletePoint
}