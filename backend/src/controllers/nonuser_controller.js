import util from 'util'
import connection from "../connection.js"

const query = util.promisify(connection.query).bind(connection)

const getVehicles = async (req, res) => {

    const {fuel_type, transmission, seats, price_per_day, type} = req.body

    try {
        let queryStr = `SELECT * FROM vehicles WHERE 1=1`
        const queryParams = []

        if (fuel_type) {
            queryStr += ` AND fuel_type = ?`
            queryParams.push(fuel_type)
        }
        if (transmission) {
            queryStr += ` AND transmission = ?`
            queryParams.push(transmission)
        }
        if (seats) {
            queryStr += ` AND seats = ?`
            queryParams.push(seats)
        }
        if (price_per_day) {
            queryStr += ` AND price_per_day <= ?`
            queryParams.push(price_per_day)
        }
        if (type) {
            queryStr += ` AND type = ?`
            queryParams.push(type)
        }

        const results = await query(queryStr, queryParams)

        return res.status(200).json({ message: "Fetched Vehicles Successfully!", vehicles: results })
    } catch (error) {
        return res.status(500).json({ error: "Database query error" })
    }
}

const getDrivers = async (req,res) => {
    const { rating, price_per_day, preference } = req.body

    try {

        let queryStr = `SELECT * FROM drivers WHERE 1=1`
        const queryParams = []

        if (rating) {
            queryStr += ` AND rating >= ?`
            queryParams.push(rating)
        }
        if (price_per_day) {
            queryStr += ` AND price_per_day <= ?`
            queryParams.push(price_per_day)
        }
        if (preference && preference !== 'None') {
            queryStr += ` AND preference = ?`
            queryParams.push(preference)
        }

        const results = await query(queryStr,queryParams)

        return res.status(200).json({message: "Fetched Drivers Successfully!", drivers: results})
        
    } catch (error) {
        return res.status(500).json({ error: "Database query error" })
    }
}

const getLeaderboard = async (req,res) => {
    try {

        const results = await query(`SELECT * FROM leaderboard ORDER BY rating DESC`)

        return res.status(200).json({message: "Fetched Leaderboard Successfully!", leaderboard: results})

    } catch (error) {
        return res.status(500).json({ error: "Database query error" })
    }
}

export {getDrivers, getLeaderboard, getVehicles}