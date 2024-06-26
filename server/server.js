import app from "./App.js";
import connectionToDB from "./config/dbConnection.js";

const PORT = process.env.PORT || 5500

app.listen(PORT, async () => {
    await connectionToDB()
    console.log("App is running at port :" + PORT)
})