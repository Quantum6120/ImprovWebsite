
const express = require("express");
const { neon } = require("@neondatabase/serverless");
require("dotenv").config();

const app = express();
const sql = neon(process.env.DATABASE_URL);

app.use(express.json());
app.use(express.static("public"));

// Homepage
app.get("/", (req, res) => {
    res.redirect("/index.html");
});

// Test Neon connection
app.get("/api/test", async (req, res) => {
    try {
        const result = await sql`SELECT NOW() AS current_time`;
        res.json({
            success: true,
            message: "Neon connected!",
            time: result[0].current_time
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
});

// Test Express
app.get("/hello", (req, res) => {
    res.send("Hello! Express is working!");
});

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
