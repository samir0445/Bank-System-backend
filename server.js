const app = require("./src/app");
const connectDB = require("./src/config/db");
const dotenv = require("dotenv");
dotenv.config();


connectDB();

const PORT = process.env.PORT;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});