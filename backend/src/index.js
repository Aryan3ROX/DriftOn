import { app } from "./app.js"
import connection from "./connection.js"
import dotenv from "dotenv"

dotenv.config({
    path: "./.env"
})

app.listen(8000, () => {
  console.log("App is listening on http://localhost:8000");
})
