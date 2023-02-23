const { Point } = require('../models')

const depthsArray = [0, 10, 20]
const coolPromiseArray = []
const finalArray = []


async function oceanDataFetch(req, res) {
  try {
      depthsArray.forEach(depth=> {
      coolPromiseArray.push(fetch(`https://ocean.amentum.io/rtofs?latitude=${req.body.lat}&longitude=${req.body.long}&depth=${depth}`, {headers: {"API-key": "YNFcwbuOA1FUZtjvhkniG4ZCTApanxMJ"}}))
    })
    Promise.all(coolPromiseArray).then((values) => {
      const coolValues = values.map(value => value.json())
      Promise.all(coolValues).then((coolvalues) => {
        for (let i = 0; i < coolValues.length; i++){
          if (coolvalues[i].point.on_land) return res.status(500).json("Invalid point!")
          // console.log(coolvalues[i].point.on_land);
          let metrics = {}
          //DEPTH IN FEET
          metrics.depth = (coolvalues[i].point.depth *  3.280839895)
          //TEMP in F
          metrics.temperature = (coolvalues[i].temperature.value * 1.8) + 32
          //Salinity in PPT
          metrics.salinity = coolvalues[i].salinity.value
          //Sound Speed in Ft/Sec
          metrics.soundSpeed = (4427.2 + 11.962*(metrics.temperature) - 0.0553*(metrics.temperature * metrics.temperature) + 4.562*(metrics.salinity-35) + 0.016*(metrics.depth))
          console.log(metrics.soundSpeed);
          finalArray.push(metrics)
        }
        res.status(200).json(finalArray)
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
    await oceanDataFetch(req, res)
  } catch (error) {
    res.status(500).json({ err: error })
  }
}

module.exports = {
  createPoint,
}