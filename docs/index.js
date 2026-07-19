// Published in https://mi-mina.github.io/Blends/

// TODO

// *** Meter los ml también en un objeto igual que los porcentajes

// Fix:
// cuando el número de puntos es 1, se dibuja un punto pero pone NAN
// cuando el número de puntos es 0 o negativo no se dibuja nada, poner un mensaje de aviso para que el usuario añada más puntos

// Improve:
// - Calcular cuántos ml hacen falta de cada esmalte de los extremos
// - Calcular el número total de puntos
// - Nombrar con letras los esmaltes de las esquinas, por ejemplo A, B, C, D
// - Download blend as pdf or image
// - Hacer que se oculte la parte de la izquierda
// - Poder elegir los colores de las esquinas

// Recipes:
// - Añadir tabla con el cálculo de las recetas
// - Añadir automáticamente una fila nueva en las recetas cuando se rellena la última disponible
// - Añadir columna con checkbox para marcar los ingredientes que son aditivos
// - Complementar el listado de materiales con https://ceramica.name/calculos/aformula

// General:
// - Ver si se puede añadir google analytics para ver el uso de la web
// - Cambiar la url para que blends se escriba con minúscula

// Stuhl diagram desarrollado por Derek Philip Au en d3.js
// https://derekphilipau.github.io/ceramic-chemistry-visualization/charts/d3.html

import { state } from "./js/state.js";
import { loadMaterials } from "./js/materials.js";
import {
  getLinearData,
  getTriaxialData,
  getBiaxialData,
} from "./js/blendData.js";
import {
  drawLinearBlend,
  drawTriaxialBlend,
  drawBiaxialBlend,
} from "./js/chart.js";
import {
  populateRecipeMaterialSelects,
  renderRecipesTable,
} from "./js/recipes.js";
import { updateBlendInputs, updateRecipeCards, showTab } from "./js/ui.js";

loadMaterials()
  .then(() => {
    init();
  })
  .catch(error => {
    console.error("Error loading materials.json:", error);
  });

function init() {
  // Force "line" blend type to be selected on page load
  document.getElementById("blendType").value = "line";
  document.getElementById("blendType").dispatchEvent(new Event("change"));

  // Event listeners for blend type and tab changes
  document.getElementById("blendType").addEventListener("change", event => {
    const blendType = event.target.value;

    // Update blend inputs visibility
    updateBlendInputs(blendType);

    // Update recipe cards visibility
    updateRecipeCards(blendType);

    drawBlend();

    renderRecipesTable();
  });

  document.getElementById("tab-graph").addEventListener("click", function () {
    showTab("graph", drawBlend);
  });
  document.getElementById("tab-recipes").addEventListener("click", function () {
    showTab("recipes");
  });

  // Event listeners for input validation
  document.getElementById("linePoints").addEventListener("input", event => {
    const numberPoints = event.target.value;

    // Check if the value is an integer
    if (!Number.isInteger(Number(numberPoints)) && numberPoints !== "") {
      alert("Please enter a valid integer for Points.");
      event.target.value = ""; // Clear the input if invalid
    }
  });

  // Event listener for the "Recalculate" button
  document
    .getElementById("recalculateButton")
    .addEventListener("click", drawBlend);

  populateRecipeMaterialSelects();

  // Initial draw on page load
  drawBlend();
}

/**
 * Draws the blend chart based on the selected blend type and input values.
 * @description This function retrieves input values, generates blend data, and calls the appropriate draw function.
 */
function drawBlend() {
  const testSize = document.getElementById("size").value;
  const blendType = document.getElementById("blendType").value;
  const linePoints = document.getElementById("linePoints").value;
  const triaxialPoints = document.getElementById("triaxialPoints").value;
  const biaxialRows = document.getElementById("biaxialRows").value;
  const biaxialColumns = document.getElementById("biaxialColumns").value;

  const increment = document.getElementById("increments")
    ? document.getElementById("increments").value
    : 0;

  if (blendType === "line") {
    state.blendData = getLinearData(linePoints, increment, testSize);
    console.log("Linear Blend Data:", state.blendData);
    drawLinearBlend(state.blendData);
  } else if (blendType === "triaxial") {
    state.blendData = getTriaxialData(triaxialPoints, testSize);
    drawTriaxialBlend(state.blendData);
  } else if (blendType === "biaxial") {
    state.blendData = getBiaxialData(biaxialRows, biaxialColumns, testSize);
    drawBiaxialBlend(state.blendData);
  }

  renderRecipesTable();
}
