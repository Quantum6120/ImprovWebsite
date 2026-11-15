let carte = [];

document.getElementById("boutonCherche").addEventListener("click", function() {
    fetch("cartesSources.json")
    .then(response => response.json())
    .then(data => {
        let randomIndex = Math.floor(Math.random() * data.cartes.length);
        carte = data.cartes[randomIndex];
        document.getElementById("carteNature").innerHTML = carte.nature;
        document.getElementById("carteThème").innerHTML = carte.thème;
        document.getElementById("carteDurée").innerHTML = carte.durée;
        document.getElementById("carteCatégorie").innerHTML = carte.catégorie;
        
    });
     
});