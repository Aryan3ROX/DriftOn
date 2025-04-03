import connection from "../connection.js"
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"
import util from 'util'

const options = {
    httpOnly: true,
    // secure: true
}

const query = util.promisify(connection.query).bind(connection);

const registerUser = async (req,res) => {

    const { username, fullname, email, password } = req.body

    if ([username,fullname,email,password].some((item) => item?.trim() === "")) {
        throw Error("All Fields Required!")
    }

    try {
        const results = await query(`SELECT * FROM users WHERE username = ? OR email = ?`, [username, email])
        if (results.length > 0) {
            return res.status(400).json({ error: "Username or Email Already Exists!" });
        }

        const lastUser = await query('SELECT userID FROM users ORDER BY userID DESC LIMIT 1')
        let total = lastUser.length > 0 ? lastUser[0].userID : 0

        const encryptedPassword = await bcrypt.hash(password, 10)

        await query(`INSERT INTO users (userID, fullname, username, email, password) VALUES (?, ?, ?, ?, ?)`, [total + 1, fullname, username, email, encryptedPassword])

        return res.status(201).json({ message: "User Registered Successfully!" })
    } catch (error) {
        return res.status(500).json({ error: "Database query error" })
    }

}

const loginUser = async (req,res) => {
    const { username, password } = req.body

    if (!username && !password) {
        throw Error("All Fields Required!")
    }

    try {

        const results = await query(`SELECT * FROM users WHERE username = ? OR email = ?`,[username,username])
        if (results.length === 0) return res.status(400).json({error: "User Not Found"})

        const user = results[0]
        const isPasswordValid = await bcrypt.compare(password,user['password'])

        if (!isPasswordValid) return res.status(400).json({error: "Incorrect Password!"})
            
        const token = jwt.sign({userID: user['userID'], email: user['email'], username: user['username']}, process.env.JWT_SECRET)

        return res.status(200).cookie("token", token).json({message: "Login Successful!", user})
    } catch (error){
        return res.status(500).json({ error: "Database query error" })
    }
    
}

const logoutUser = async (req,res) => {

    const token = req.cookies?.token || req.header("Authorization")?.replace("Bearer ", "")
    console.log(token)
    if (!token) return res.status(401).json({error: "Unauthorized Request!"})
    
    const decodedToken = jwt.verify(token, process.env.JWT_SECRET)

    return res.status(200).clearCookie("token", options).json({error: "User Logged Out!"})
}

export {registerUser, loginUser, logoutUser}