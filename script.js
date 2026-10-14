
"use strict";

// Recipe API
const API_URL = "https://dummyjson.com/recipes";

// Recipe ID settings
let recipeId = 1;
const MIN_RECIPE_ID = 1;
const MAX_RECIPE_ID = 50;

// Get HTML elements
const lblTitle = document.getElementById("lblTitle");
const imgPreview = document.getElementById("imgPreview");
const details = document.getElementById("details");
const instructions = document.getElementById("instructions");

const prepTime = document.getElementById("prepTime");
const cookTime = document.getElementById("cookTime");
const servings = document.getElementById("servings");

const recipeCounter = document.getElementById("recipeCounter");
const recipeTags = document.getElementById("recipeTags");
const stepCount = document.getElementById("stepCount");
const stepsProgress = document.getElementById("stepsProgress");
const statusMessage = document.getElementById("statusMessage");

const prevBtn = document.getElementById("prevBtn");
const nextBtn = document.getElementById("nextBtn");

// Load first recipe when the page opens
document.addEventListener("DOMContentLoaded", function () {
    prevBtn.addEventListener("click", PrevClick);
    nextBtn.addEventListener("click", NextClick);

    LoadRecipie(recipeId);
});

// Fetch recipe using its ID
async function LoadRecipie(id) {
    recipeId = id;

    showStatus("", "");
    setLoading(true);

    try {
        const response = await fetch(`${API_URL}/${id}`);

        // Check for an unsuccessful response
        if (!response.ok) {
            throw new Error("Recipe not found");
        }

        const recipe = await response.json();

        // Display recipe details
        lblTitle.textContent = recipe.name || "Recipe";

        imgPreview.src = recipe.image || "";
        imgPreview.alt = recipe.name || "Recipe image";

        // Show preparation, cooking time and servings
        prepTime.textContent =
            `${recipe.prepTimeMinutes ?? 0} min`;

        cookTime.textContent =
            `${recipe.cookTimeMinutes ?? 0} min`;

        servings.textContent =
            recipe.servings ?? "N/A";

        // Show recipe description
        const cuisine = recipe.cuisine || "Delicious";
        const difficulty = recipe.difficulty || "Easy";

        details.textContent =
            `Enjoy this ${difficulty.toLowerCase()} ${cuisine} recipe. ` +
            `Follow the instructions below to prepare ${recipe.name}.`;

        // Show recipe number
        recipeCounter.textContent =
            `Recipe ${recipe.id} of ${MAX_RECIPE_ID}`;

        // Display recipe tags
        recipeTags.replaceChildren();

        const tags = [
            ...(recipe.tags || []),
            ...(recipe.cuisine ? [recipe.cuisine] : []),
            ...(recipe.difficulty ? [recipe.difficulty] : [])
        ];

        tags.forEach(function (tag) {
            const span = document.createElement("span");

            span.className = "recipe-tag";
            span.textContent = tag;

            recipeTags.appendChild(span);
        });

        // Display instructions
        instructions.replaceChildren();

        const recipeSteps = Array.isArray(recipe.instructions)
            ? recipe.instructions
            : [];

        recipeSteps.forEach(function (instruction, index) {
            const li = document.createElement("li");
            li.className = "list-group-item";

            const number = document.createElement("span");
            number.className = "step-number";
            number.textContent = index + 1;

            const text = document.createElement("span");
            text.textContent = instruction;

            li.append(number, text);
            instructions.appendChild(li);
        });

        if (recipeSteps.length === 0) {
            const li = document.createElement("li");

            li.className = "list-group-item";
            li.textContent = "No instructions available.";

            instructions.appendChild(li);
        }

        // Update instruction count and progress bar
        stepCount.textContent =
            `${recipeSteps.length} steps to follow`;

        stepsProgress.style.width =
            recipeSteps.length > 0 ? "100%" : "0%";

        stepsProgress.setAttribute(
            "aria-valuenow",
            recipeSteps.length > 0 ? "100" : "0"
        );

        // Enable or disable navigation
        prevBtn.disabled = recipe.id <= MIN_RECIPE_ID;
        nextBtn.disabled = recipe.id >= MAX_RECIPE_ID;

    } catch (error) {
        console.error("Error loading recipe:", error);

        lblTitle.textContent = "Unable to load recipe";

        imgPreview.src =
            "https://placehold.co/800x500?text=Recipe+Unavailable";

        imgPreview.alt = "Recipe unavailable";

        details.textContent =
            "Please check your internet connection and try again.";

        prepTime.textContent = "-- min";
        cookTime.textContent = "-- min";
        servings.textContent = "--";

        recipeTags.replaceChildren();
        instructions.replaceChildren();

        const li = document.createElement("li");
        li.className = "list-group-item";
        li.textContent = "Instructions could not be loaded.";

        instructions.appendChild(li);

        stepCount.textContent = "No steps available";
        stepsProgress.style.width = "0%";

        showStatus(
            "Unable to load the recipe. Please try again.",
            "danger"
        );

    } finally {
        setLoading(false);
    }
}

// Next recipe button
function NextClick() {
    if (recipeId < MAX_RECIPE_ID) {
        LoadRecipie(recipeId + 1);
    }
}

// Previous recipe button
function PrevClick() {
    if (recipeId > MIN_RECIPE_ID) {
        LoadRecipie(recipeId - 1);
    }
}

// Display loading status and manage buttons
function setLoading(isLoading) {
    prevBtn.disabled = isLoading || recipeId <= MIN_RECIPE_ID;
    nextBtn.disabled = isLoading || recipeId >= MAX_RECIPE_ID;

    if (isLoading) {
        lblTitle.textContent = "Loading recipe...";
        instructions.replaceChildren();

        const li = document.createElement("li");
        li.className = "list-group-item";

        const spinner = document.createElement("span");
        spinner.className =
            "spinner-border spinner-border-sm me-2";
        spinner.setAttribute("aria-hidden", "true");

        li.append(spinner, document.createTextNode(
            "Loading instructions..."
        ));

        instructions.appendChild(li);
        stepCount.textContent = "Please wait...";
    }
}

// Display status messages
function showStatus(message, type) {
    statusMessage.textContent = message;

    if (message) {
        statusMessage.className = `alert alert-${type}`;
    } else {
        statusMessage.className = "alert d-none";
    }
}
