
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



app.post("/api/cards", async (req, res) => {

    try {

        // Receive the six characteristics
        const {
            nature,
            duration,
            numberofplayers,
            category,
            theme,
            difficulty
        } = req.body || {};

        // Organize and clean the information
        const card = {
            nature: String(nature ?? "").trim().toLowerCase(),
            duration: String(duration ?? "").trim(),
            numberofplayers: String(numberofplayers ?? "").trim(),
            category: String(category ?? "").trim(),
            theme: String(theme ?? "").trim(),
            difficulty: String(difficulty ?? "").trim().toLowerCase()
        };

        // Check that all fields are filled
        if (Object.values(card).some(value => !value)) {
            return res.status(400).json({
                error: "Please complete all fields."
            });
        }
        


        // Check that nature is valid
        if (!["mixte", "comparée"].includes(card.nature)) {
            return res.status(400).json({
                error: "Invalid nature."
            });
        }

        // Allowed durations
        const allowedDurations = [
            "1 min",
            "1 min 30",
            "2 min",
            "2 min 30",
            "3 min"
        ];

        if (!allowedDurations.includes(card.duration)) {
            return res.status(400).json({
                error: "Invalid duration."
            });
        }

        // Allowed numbers of players
        const allowedPlayers = [
            "1 par équipe",
            "2 par équipe",
            "3 par équipe",
            "4 par équipe",
            "Illimité"
        ];

        if (!allowedPlayers.includes(card.numberofplayers)) {
            return res.status(400).json({
                error: "Invalid number of players."
            });
        }

        // Allowed difficulties
        if (!["easy", "medium", "hard"].includes(card.difficulty)) {
            return res.status(400).json({
                error: "Invalid difficulty."
            });
        }

        // Save the card in Neon
        const result = await sql`
            INSERT INTO cards (
                nature,
                duration,
                numberofplayers,
                category,
                theme,
                difficulty
            )
            VALUES (
                ${card.nature},
                ${card.duration},
                ${card.numberofplayers},
                ${card.category},
                ${card.theme},
                ${card.difficulty}
            )
            RETURNING *
        `;

        // Confirm that the card was saved
        res.status(201).json({
            success: true,
            message: "Card successfully saved!",
            card: result[0]
        });

    } catch (error) {

        console.error("Error saving card:", error);

        res.status(500).json({
            error: error.message
        });

    }

});



app.get("/api/cards/random", async (req, res) => {

    try {

        // Read the filters from the URL
        const cleanFilter = value => {
            if (typeof value !== "string") return null;

            const cleaned = value.trim();

            return cleaned ? cleaned : null;
        };

        const nature = cleanFilter(req.query.nature);
        const duration = cleanFilter(req.query.duration);
        const numberofplayers = cleanFilter(req.query.numberofplayers);
        const difficulty = cleanFilter(req.query.difficulty);
        const category = cleanFilter(req.query.category);

        // Prepare the category search
        const categoryPattern = category
            ? `%${category}%`
            : null;

        // Retrieve a random card matching the filters
        const cards = await sql`
            SELECT
                id,
                nature,
                duration,
                numberofplayers,
                category,
                theme,
                difficulty
            FROM cards

            WHERE
                (${nature}::text IS NULL OR nature = ${nature})

            AND (${duration}::text IS NULL OR duration = ${duration})

            AND (
                ${numberofplayers}::text IS NULL
                OR numberofplayers = ${numberofplayers}
            )

            AND (
                ${difficulty}::text IS NULL
                OR difficulty = ${difficulty}
            )

            AND (
                ${categoryPattern}::text IS NULL
                OR category ILIKE ${categoryPattern}
            )

            ORDER BY RANDOM()
            LIMIT 1
        `;

        // Check whether a matching card exists
        if (cards.length === 0) {
            return res.status(404).json({
                error: "Aucune carte ne correspond aux filtres."
            });
        }

        // Send the selected card
        res.json(cards[0]);

    } catch (error) {

        console.error("Error drawing card:", error);

        res.status(500).json({
            error: "Impossible de tirer une carte."
        });

    }

});


app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
