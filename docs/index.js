// Published in https://mi-mina.github.io/Blends/

// TODO

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
  const linePointsInput = document.getElementById("linePoints");
  const triaxialPointsInput = document.getElementById("triaxialPoints");
  const biaxialRowsInput = document.getElementById("biaxialRows");
  const biaxialColumnsInput = document.getElementById("biaxialColumns");

  const increment = document.getElementById("increments")
    ? document.getElementById("increments").value
    : 0;

  if (blendType === "line") {
    if (!meetsMinimum(linePointsInput, "puntos")) return;
    state.blendData = getLinearData(
      linePointsInput.value,
      increment,
      testSize
    );
    console.log("Linear Blend Data:", state.blendData);
    drawLinearBlend(state.blendData);
  } else if (blendType === "triaxial") {
    if (!meetsMinimum(triaxialPointsInput, "puntos")) return;
    state.blendData = getTriaxialData(triaxialPointsInput.value, testSize);
    drawTriaxialBlend(state.blendData);
  } else if (blendType === "biaxial") {
    if (
      !meetsMinimum(biaxialRowsInput, "filas") ||
      !meetsMinimum(biaxialColumnsInput, "columnas")
    )
      return;
    state.blendData = getBiaxialData(
      biaxialRowsInput.value,
      biaxialColumnsInput.value,
      testSize
    );
    drawBiaxialBlend(state.blendData);
  }

  renderRecipesTable();
}

/**
 * Checks an input against its own `min` attribute. If it fails, shows a
 * warning in the graph panel instead of letting invalid data (e.g. a
 * division by zero producing NaN) reach the draw functions.
 * @param {HTMLInputElement} input
 * @param {string} label - Plural noun used in the warning message.
 * @returns {boolean}
 */
function meetsMinimum(input, label) {
  const value = Number(input.value);
  const min = Number(input.min);

  if (Number.isNaN(value) || value < min) {
    document.getElementById(
      "graph"
    ).innerHTML = `<p class="p-4 text-gray-600">Introduce al menos ${min} ${label} para dibujar el diagrama.</p>`;
    return false;
  }
  return true;
}
