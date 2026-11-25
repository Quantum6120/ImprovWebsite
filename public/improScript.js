
// ===================================
// ADD A CARD
// ===================================

// Find the HTML form
const cardForm = document.getElementById("card-form");

// Listen for form submissions
cardForm.addEventListener("submit", async (event) => {

    // Stop the page from refreshing
    event.preventDefault();

    // Collect the six card characteristics
    const card = {

        nature: document.getElementById("nature").value,

        duration: document.getElementById("duration").value,

        numberofplayers: document.getElementById("numberofplayers").value,

        difficulty: document.getElementById("difficulty").value,

        category: document.getElementById("category").value,

        theme: document.getElementById("theme").value,
    };


    const status = document.getElementById("card-status");

    try {

        status.textContent = "Sauvegarde en cours...";

        // Send the card to the backend
        const response = await fetch("/api/cards", {

            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify(card)

        });

        // Read the server response
        const result = await response.json();

        // Handle errors
        if (!response.ok) {
            throw new Error(result.error || "Erreur de sauvegarde.");
        }

        // Confirm success
        status.textContent = "Carte sauvegardée!";
        setTimeout(() => {
            status.textContent = "";
        }, 2000);
        // Clear the form
        cardForm.reset();

    } catch (error) {

        status.textContent = error.message;

        console.error(error);

    }

});


// ===================================
// DRAW A RANDOM CARD
// ===================================

// Find the random-card button
const boutonCherche = document.getElementById("boutonCherche");

// Listen for clicks
boutonCherche.addEventListener("click", async () => {

    const status = document.getElementById("tirage-status");

    try {

        boutonCherche.disabled = true;

        status.textContent = "Tirage en cours...";

        // Create a collection of filters
        const filters = new URLSearchParams();

        // Read the selected filters
        const filterValues = {

            nature: document.getElementById("filter-nature").value,

            duration: document.getElementById("filter-duration").value,

            numberofplayers:
                document.getElementById("filter-numberofplayers").value,

            difficulty:
                document.getElementById("filter-difficulty").value,

            category:
                document.getElementById("filter-category").value.trim()

        };

        // Add non-empty filters to the URL
        for (const [key, value] of Object.entries(filterValues)) {

            if (value !== "") {
                filters.set(key, value);
            }

        }

        // Build the request address
        const url = `/api/cards/random?${filters.toString()}`;

        // Ask the backend for a matching random card
        const response = await fetch(url);

        // Read the result
        const card = await response.json();

        // Check for errors
        if (!response.ok) {
            throw new Error(card.error || "Aucune carte trouvée.");
        }

        // Display the selected card
        document.getElementById("carteNature").textContent =
            "Nature : " + card.nature;

        document.getElementById("carteThème").textContent =
            card.theme;

        document.getElementById("carteDurée").textContent =
            "Durée : " + card.duration;

        document.getElementById("carteJoueurs").textContent =
            "Nombre de joueurs : " + card.numberofplayers;

        document.getElementById("carteCatégorie").textContent =
            "Catégorie : " + card.category;


        status.textContent = "";

    } catch (error) {

        status.textContent = error.message;

        console.error("Error drawing card:", error);

    } finally {

        // Reactivate the button
        boutonCherche.disabled = false;

    }

});
