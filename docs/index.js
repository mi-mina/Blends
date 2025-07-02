// Published in https://mi-mina.github.io/Blends/

// TODO

// Fix:
// - El diagrama de línea ajustarlo para que no quede como flotando
// - Hay veces que muestra un decimal aunque sea cero.

// Improve:
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

// Constants //////////////////////////////////////////////////////////////////
const pointSide = 54;
const pointR = 15;
const sep = 15;
const margin = {
  top: pointSide,
  right: pointSide,
  bottom: 0,
  left: pointSide,
};

const colorA = "#f15bb5";
const colorB = "#00bbf9";
const colorC = "#EAF25CFF";
// const colorD = "#424242FF";
const colorD = "#00f5d4";

const recipes = {};
let loadedMaterials = [];
let materialsById = {};

d3.json("data/materials.json")
  .then(data => {
    loadedMaterials = data;
    materialsById = getMaterialsById(loadedMaterials);
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
    showTab("graph");
  });
  document.getElementById("tab-recipes").addEventListener("click", function () {
    showTab("recipes");
  });

  // Event listeners for input validation
  document.getElementById("linePoints").addEventListener("input", () => {
    const numberPoints = pointsInput.value;

    // Check if the value is an integer
    if (!Number.isInteger(Number(numberPoints)) && numberPoints !== "") {
      alert("Please enter a valid integer for Points.");
      pointsInput.value = ""; // Clear the input if invalid
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

///////////////////////////////////////////////////////////////////////////////
// Functions to update UI elements ////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////
/**
 * Updates the visibility of blend inputs based on the selected blend type.
 * @param {string} blendType - The selected blend type ("line", "triaxial", or "biaxial").
 */
function updateBlendInputs(blendType = "line") {
  const lineInputs = document.getElementById("lineInputs");
  const triaxialInputs = document.getElementById("triaxialInputs");
  const biaxialInputs = document.getElementById("biaxialInputs");

  // Show/hide inputs based on the selected blend type
  if (blendType === "line") {
    lineInputs.classList.remove("hidden");
    triaxialInputs.classList.add("hidden");
    biaxialInputs.classList.add("hidden");
  } else if (blendType === "triaxial") {
    lineInputs.classList.add("hidden");
    triaxialInputs.classList.remove("hidden");
    biaxialInputs.classList.add("hidden");
  } else if (blendType === "biaxial") {
    lineInputs.classList.add("hidden");
    triaxialInputs.classList.add("hidden");
    biaxialInputs.classList.remove("hidden");
  }
}

/**
 * Updates the visibility of recipe cards based on the selected blend type.
 * @param {string} blendType - The selected blend type ("line", "triaxial", or "biaxial").
 * @description Shows 2 cards for "line", 3 cards for "triaxial", and 4 cards for "biaxial".
 * @example
 * @returns {void}
 */
function updateRecipeCards(blendType = "line") {
  const cards = [
    document.getElementById("recipe1"),
    document.getElementById("recipe2"),
    document.getElementById("recipe3"),
    document.getElementById("recipe4"),
  ];
  let showCount = 2;
  if (blendType === "triaxial") showCount = 3;
  if (blendType === "biaxial") showCount = 4;
  cards.forEach((card, idx) => {
    if (idx < showCount) {
      card.classList.remove("hidden");
    } else {
      card.classList.add("hidden");
    }
  });
}

/**
 * Shows the selected tab and hides the others.
 * @param {string} tab - The tab to show ("graph" or "recipes").
 * @description Updates the tab buttons and contents based on the selected tab.
 */
function showTab(tab) {
  // Tab buttons
  document
    .getElementById("tab-graph")
    .classList.toggle("border-blue-500", tab === "graph");
  document
    .getElementById("tab-graph")
    .classList.toggle("text-blue-600", tab === "graph");
  document
    .getElementById("tab-graph")
    .classList.toggle("border-transparent", tab !== "graph");
  document
    .getElementById("tab-graph")
    .classList.toggle("text-gray-600", tab !== "graph");
  document
    .getElementById("tab-recipes")
    .classList.toggle("border-blue-500", tab === "recipes");
  document
    .getElementById("tab-recipes")
    .classList.toggle("text-blue-600", tab === "recipes");
  document
    .getElementById("tab-recipes")
    .classList.toggle("border-transparent", tab !== "recipes");
  document
    .getElementById("tab-recipes")
    .classList.toggle("text-gray-600", tab !== "recipes");
  // Tab contents
  document
    .getElementById("tab-content-graph")
    .classList.toggle("hidden", tab !== "graph");
  document
    .getElementById("tab-content-recipes")
    .classList.toggle("hidden", tab !== "recipes");

  if (tab === "graph") {
    // If the graph tab is selected, redraw the blend
    drawBlend();
  }
}

///////////////////////////////////////////////////////////////////////////////
// Functions to draw blends ///////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////

/**
 * Populates the recipe material selects with options from the provided materials array.
 * @param {Array} materials - An array of material objects, each containing materialId and materialName.
 * @description This function updates all recipe material selects with the available materials.
 */

function populateRecipeMaterialSelects() {
  // Get all selects for recipe materials
  const selects = document.querySelectorAll(".recipe-material-select");
  // Build options HTML
  let options = '<option value="">Selecciona un material</option>';
  loadedMaterials.forEach(mat => {
    options += `<option value="${mat.materialId}">${mat.materialName_es}</option>`;
  });
  // Set options for each select
  selects.forEach(select => {
    select.innerHTML = options;
    // Set initial class based on value
    if (!select.value) {
      select.classList.add("text-gray-400");
    } else {
      select.classList.remove("text-gray-400");
    }

    // Upadate text color based on selection
    select.addEventListener("change", () => {
      if (select.value) {
        select.classList.remove("text-gray-400");
      } else {
        select.classList.add("text-gray-400");
      }
    });
  });
}

const recipe1Container = document.getElementById("recipe1");
recipe1Container
  .querySelectorAll('.recipe-material-select, input[type="text"]')
  .forEach(el => {
    el.addEventListener("change", () => {
      recipes["1"] = getRecipeData("recipe1");
      renderRecipesTable(recipes);
    });
  });

const recipe2Container = document.getElementById("recipe2");
recipe2Container
  .querySelectorAll('.recipe-material-select, input[type="text"]')
  .forEach(el => {
    el.addEventListener("change", () => {
      recipes["2"] = getRecipeData("recipe2");
      renderRecipesTable(recipes);
    });
  });

const recipe3Container = document.getElementById("recipe3");
recipe3Container
  .querySelectorAll('.recipe-material-select, input[type="text"]')
  .forEach(el => {
    el.addEventListener("change", () => {
      recipes["3"] = getRecipeData("recipe3");
      renderRecipesTable(recipes);
    });
  });

const recipe4Container = document.getElementById("recipe4");
recipe3Container
  .querySelectorAll('.recipe-material-select, input[type="text"]')
  .forEach(el => {
    el.addEventListener("change", () => {
      recipes["4"] = getRecipeData("recipe4");
      renderRecipesTable(recipes);
    });
  });

/**
 * Retrieves the recipe data from the specified recipe card.
 * @param {string} recipeId - The ID of the recipe card to retrieve data from.
 * @returns {Array} An array of objects containing material IDs, names, and percentages.
 * @description Each object in the array contains the material ID, name, and percentage from the recipe card.
 * @example
 * const recipeData = getRecipeData("recipe1");
 * console.log(recipeData);
 * // Output: [{ materialId: "mat1", materialName: "Material 1", percentage: "50" }, ...]
 */

function getRecipeData(recipeId) {
  const recipe = document.getElementById(recipeId);
  const selects = recipe.querySelectorAll(".recipe-material-select");
  const inputs = recipe.querySelectorAll('input[type="text"]');
  const data = [];

  for (let i = 0; i < selects.length; i++) {
    data.push({
      materialId: selects[i].value,
      materialName: selects[i].options[selects[i].selectedIndex]?.text || "",
      percentage: inputs[i]?.value || "",
    });
  }
  return data;
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
    const data = getLinearData(linePoints, increment, testSize);
    drawLinearBlend(data);
  } else if (blendType === "triaxial") {
    const data = getTriaxialData(triaxialPoints, testSize);
    drawTriaxialBlend(data);
  } else if (blendType === "biaxial") {
    const data = getBiaxialData(biaxialRows, biaxialColumns, testSize);
    drawBiaxialBlend(data);
  }
  renderRecipesTable();
}

/**
 * Draws a linear blend chart using D3.js.
 * @param {Array} data - The blend data to visualize.
 * @description Each object in the data array should contain the point index, percentages for each corner, and milliliters for each corner.
 */
function drawLinearBlend(data) {
  // Clear previous SVG elements
  d3.select(`#graph`).selectAll("*").remove();

  ///////////////////////////////////////////////////////////////////////////
  // Set up svg /////////////////////////////////////////////////////////////
  ///////////////////////////////////////////////////////////////////////////
  const container = document.getElementById("graph");
  const maxWidth =
    pointSide * data.length +
    sep * (data.length - 1) +
    margin.left +
    margin.right;

  const svgWidth = Math.max(container.clientWidth, maxWidth);
  const svgHeight = window.innerHeight;

  // Containers ///////////////////////////////////////////////////////////
  const svg = d3
    .select(`#graph`)
    .append("svg")
    .attr("width", svgWidth)
    .attr("height", svgHeight)
    .style("user-select", "none");

  const chartContainer = svg
    .append("g")
    .attr(
      "transform",
      d => `translate(${margin.left + pointSide / 2}, ${svgHeight / 2})`
    );

  const pointContainer = chartContainer
    .selectAll(".pointContainer")
    .data(data)
    .enter()
    .append("g")
    .attr("class", "pointContainer")
    .attr("transform", (d, i) => {
      const x = i * (pointSide + sep);
      const y = pointSide / 2;
      return `translate(${x}, ${y})`;
    });

  pointContainer
    .append("rect")
    .attr("x", -pointSide / 2)
    .attr("y", -pointSide)
    .attr("width", pointSide)
    .attr("height", pointSide)
    .style("fill", colorA)
    .style("fill-opacity", (d, i, nodes) => {
      const step = 1 / (nodes.length - 1);
      const opacity = 1 - step * i;
      return opacity;
    })
    .style("stroke", "black")
    .style("stroke-width", 1);
  pointContainer
    .append("rect")
    .attr("x", -pointSide / 2)
    .attr("y", 0)
    .attr("width", pointSide)
    .attr("height", pointSide)
    .style("fill", colorB)
    .style("fill-opacity", (d, i, nodes) => {
      const step = 1 / (nodes.length - 1);
      const opacity = step * i;
      return opacity;
    })
    .style("stroke", "black")
    .style("stroke-width", 1);

  pointContainer
    .append("circle")
    .attr("r", pointR)
    .style("fill", d => {
      const colors = [colorA, colorB];
      const percentages = [d.percentageA, d.percentageB];
      return blendColors(colors, percentages);
    })
    .style("stroke", "black")
    .style("stroke-width", 1);

  // Add text labels
  // point text
  pointContainer
    .append("text")
    .attr("x", 0)
    .attr("y", 0)
    .attr("dy", "0.35em")
    .attr("text-anchor", "middle")
    .text(d => d.point);

  // percentage text
  pointContainer
    .append("text")
    .attr("x", -pointSide * 0.45)
    .attr("y", -pointSide * 0.85)
    .attr("dy", "0.35em")
    .style("font-size", "0.6em")
    .text(d => {
      if (d.percentageA === 0) return "";
      return Number.isInteger(d.percentageA)
        ? `${d.percentageA.toFixed(0)}%` // No decimals for integers
        : `${d.percentageA.toFixed(1)}%`; // One decimal
    });

  pointContainer
    .append("text")
    .attr("x", pointSide * 0.45)
    .attr("y", pointSide * 0.85)
    .attr("dy", "0.35em")
    .attr("text-anchor", "end")
    .style("font-size", "0.6em")
    .text(d => {
      if (d.percentageB === 0) return "";
      return Number.isInteger(d.percentageB)
        ? `${d.percentageB.toFixed(0)}%` // No decimals for integers
        : `${d.percentageB.toFixed(1)}%`; // One decimal
    });

  // ml text
  pointContainer
    .append("text")
    .attr("x", 0)
    .attr("y", -pointSide * 0.5)
    .attr("dy", "0.35em")
    .attr("text-anchor", "middle")
    .style("font-size", "1.2em")
    .html(d => {
      if (d.mlA === 0) return "";
      return Number.isInteger(d.mlA) ? d.mlA.toFixed(0) : d.mlA.toFixed(1);
    });

  pointContainer
    .append("text")
    .attr("x", 0)
    .attr("y", pointSide * 0.5)
    .attr("dy", "0.35em")
    .attr("text-anchor", "middle")
    .style("font-size", "1.2em")
    .html(d => {
      if (d.mlB === 0) return "";
      return Number.isInteger(d.mlB) ? d.mlB.toFixed(0) : d.mlB.toFixed(1);
    });
}

/**
 * Draws a triaxial blend chart using D3.js.
 * @param {Array} data - The triaxial blend data to visualize.
 * @description Each object in the data array should contain the point index, position in the triangle, percentages for each corner, and milliliters for each corner.
 */
function drawTriaxialBlend(data) {
  // Clear previous SVG elements
  d3.select(`#graph`).selectAll("*").remove();

  ///////////////////////////////////////////////////////////////////////////
  // Set up SVG /////////////////////////////////////////////////////////////
  ///////////////////////////////////////////////////////////////////////////
  const numberOfRows = data[data.length - 1].position[1] + 1;

  const container = document.getElementById("graph");
  const maxWidth =
    pointSide * 2 * numberOfRows +
    sep * (numberOfRows - 1) +
    margin.left +
    margin.right;

  const svgWidth = Math.max(container.clientWidth, maxWidth);
  const svgHeight = Math.max(window.innerHeight, maxWidth);

  // Containers ///////////////////////////////////////////////////////////
  const svg = d3
    .select(`#graph`)
    .append("svg")
    .attr("width", svgWidth)
    .attr("height", svgHeight)
    .style("user-select", "none");

  const chartContainer = svg
    .append("g")
    .attr("transform", `translate(${margin.left}, ${margin.top})`);

  // Scale to position points in a triangular grid
  const xScale = pointSide * 2 + sep;
  const yScale = pointSide * 2 + sep;

  const pointContainer = chartContainer
    .selectAll(".pointContainer")
    .data(data)
    .enter()
    .append("g")
    .attr("class", "pointContainer")
    .attr("transform", d => {
      const t = ((numberOfRows - d.position[1]) * xScale) / 2;
      const x = t + d.position[0] * xScale;
      const y = d.position[1] * yScale;
      return `translate(${x}, ${y})`;
    });

  pointContainer
    .append("rect")
    .attr("x", -pointSide * 0.5)
    .attr("y", -pointSide)
    .attr("width", pointSide)
    .attr("height", pointSide)
    .style("fill", colorA)
    .style("fill-opacity", d => d.percentageA / 100)
    .style("stroke", "black")
    .style("stroke-width", 1);

  pointContainer
    .append("rect")
    .attr("x", -pointSide)
    .attr("y", 0)
    .attr("width", pointSide)
    .attr("height", pointSide)
    .style("fill", colorB)
    .style("fill-opacity", d => d.percentageB / 100)
    .style("stroke", "black")
    .style("stroke-width", 1);

  pointContainer
    .append("rect")
    .attr("x", 0)
    .attr("y", 0)
    .attr("width", pointSide)
    .attr("height", pointSide)
    .style("fill", colorC)
    .style("fill-opacity", d => d.percentageC / 100)
    .style("stroke", "black")
    .style("stroke-width", 1);

  pointContainer
    .append("circle")
    .attr("r", pointR)
    .style("fill", d => {
      const colors = [colorA, colorB, colorC];
      const percentages = [d.percentageA, d.percentageB, d.percentageC];
      return blendColors(colors, percentages);
    })
    .style("stroke", "black")
    .style("stroke-width", 1);

  // Add text labels
  // point text
  pointContainer
    .append("text")
    .attr("x", 0)
    .attr("y", 0)
    .attr("dy", "0.35em")
    .attr("text-anchor", "middle")
    .text(d => d.point);

  // Add text labels for percentages
  pointContainer
    .append("text")
    .attr("x", -pointSide * 0.45)
    .attr("y", -pointSide * 0.85)
    .attr("dy", "0.35em")
    .style("font-size", "0.6em")
    .text(d => {
      return d.percentageA === 0
        ? ""
        : Number.isInteger(d.percentageA)
        ? `${d.percentageA.toFixed(0)}%` // No decimals for integers
        : `${d.percentageA.toFixed(1)}%`; // One decimal
    });

  pointContainer
    .append("text")
    .attr("x", -pointSide * 0.95)
    .attr("y", pointSide * 0.85)
    .attr("dy", "0.35em")
    .style("font-size", "0.6em")
    .text(d => {
      return d.percentageB === 0
        ? ""
        : Number.isInteger(d.percentageB)
        ? `${d.percentageB.toFixed(0)}%` // No decimals for integers
        : `${d.percentageB.toFixed(1)}%`; // One decimal
    });

  pointContainer
    .append("text")
    .attr("x", pointSide * 0.95)
    .attr("y", pointSide * 0.85)
    .attr("dy", "0.35em")
    .attr("text-anchor", "end")
    .style("font-size", "0.6em")
    .text(d => {
      return d.percentageC === 0
        ? ""
        : Number.isInteger(d.percentageC)
        ? `${d.percentageC.toFixed(0)}%` // No decimals for integers
        : `${d.percentageC.toFixed(1)}%`; // One decimal
    });

  // Add text labels for milliliters
  pointContainer
    .append("text")
    .attr("x", 0)
    .attr("y", -pointSide * 0.5)
    .attr("dy", "0.35em")
    .attr("text-anchor", "middle")
    .style("font-size", "1.2em")
    .text(d => {
      if (d.mlA === 0) return "";
      return Number.isInteger(d.mlA) ? d.mlA.toFixed(0) : d.mlA.toFixed(1);
    });

  pointContainer
    .append("text")
    .attr("x", -pointSide * 0.5)
    .attr("y", pointSide * 0.5)
    .attr("dy", "0.35em")
    .attr("text-anchor", "middle")
    .style("font-size", "1.2em")
    .text(d => {
      if (d.mlB === 0) return "";
      return Number.isInteger(d.mlB) ? d.mlB.toFixed(0) : d.mlB.toFixed(1);
    });

  pointContainer
    .append("text")
    .attr("x", pointSide * 0.5)
    .attr("y", pointSide * 0.5)
    .attr("dy", "0.35em")
    .attr("text-anchor", "middle")
    .style("font-size", "1.2em")
    .text(d => {
      if (d.mlC === 0) return "";
      return Number.isInteger(d.mlC) ? d.mlC.toFixed(0) : d.mlC.toFixed(1);
    });
}

/**
 * Draws a biaxial blend chart using D3.js.
 * @param {Array} data - The biaxial blend data to visualize.
 * @description Each object in the data array should contain the position, point index, percentages for each corner, and milliliters for each corner.
 */
function drawBiaxialBlend(data) {
  console.log("Drawing Biaxial Blend with data:", data);

  // Clear previous SVG elements
  d3.select(`#graph`).selectAll("*").remove();

  ///////////////////////////////////////////////////////////////////////////
  // Set up svg /////////////////////////////////////////////////////////////
  ///////////////////////////////////////////////////////////////////////////
  const numberOfRows = Math.sqrt(data.length);

  const container = document.getElementById("graph");
  const maxSize =
    pointSide * 2 * numberOfRows +
    sep * (numberOfRows - 1) +
    margin.left +
    margin.right;

  const svgWidth = Math.max(container.clientWidth, maxSize);
  const svgHeight = Math.max(window.innerHeight, maxSize);

  // Containers ///////////////////////////////////////////////////////////
  const svg = d3
    .select(`#graph`)
    .append("svg")
    .attr("width", svgWidth)
    .attr("height", svgHeight)
    .style("user-select", "none");

  const chartContainer = svg
    .append("g")
    .attr("transform", d => `translate(${margin.left}, ${margin.top})`);

  const pointContainer = chartContainer
    .selectAll(".pointContainer")
    .data(data)
    .enter()
    .append("g")
    .attr("class", "pointContainer")
    .attr("transform", d => {
      const x = d.position[0] * (pointSide * 2 + sep);
      const y = d.position[1] * (pointSide * 2 + sep);
      return `translate(${x}, ${y})`;
    });

  pointContainer
    .append("rect")
    .attr("x", -pointSide)
    .attr("y", -pointSide)
    .attr("width", pointSide)
    .attr("height", pointSide)
    .style("fill", colorA)
    .style("fill-opacity", d => d.percentageA / 100)
    .style("stroke", "black")
    .style("stroke-width", 1);

  pointContainer
    .append("rect")
    .attr("x", 0)
    .attr("y", -pointSide)
    .attr("width", pointSide)
    .attr("height", pointSide)
    .style("fill", colorB)
    .style("fill-opacity", d => d.percentageB / 100)
    .style("stroke", "black")
    .style("stroke-width", 1);

  pointContainer
    .append("rect")
    .attr("x", -pointSide)
    .attr("y", 0)
    .attr("width", pointSide)
    .attr("height", pointSide)
    .style("fill", colorC)
    .style("fill-opacity", d => d.percentageC / 100)
    .style("stroke", "black")
    .style("stroke-width", 1);

  pointContainer
    .append("rect")
    .attr("x", 0)
    .attr("y", 0)
    .attr("width", pointSide)
    .attr("height", pointSide)
    .style("fill", colorD)
    .style("fill-opacity", d => d.percentageD / 100)
    .style("stroke", "black")
    .style("stroke-width", 1);

  pointContainer
    .append("circle")
    .attr("r", pointR)
    .style("fill", d => {
      const colors = [colorA, colorB, colorC, colorD];
      const percentages = [
        d.percentageA,
        d.percentageB,
        d.percentageC,
        d.percentageD,
      ];
      return blendColors(colors, percentages);
    })
    .style("stroke", "black")
    .style("stroke-width", 1);

  // Add text labels
  // point text
  pointContainer
    .append("text")
    .attr("x", 0)
    .attr("y", 0)
    .attr("dy", "0.35em")
    .attr("text-anchor", "middle")
    .text(d => d.point);

  // Add text labels for percentages
  pointContainer
    .append("text")
    .attr("x", -pointSide * 0.95)
    .attr("y", -pointSide * 0.85)
    .attr("dy", "0.35em")
    .style("font-size", "0.6em")
    .text(d => {
      return d.percentageA === 0
        ? ""
        : Number.isInteger(d.percentageA)
        ? `${d.percentageA.toFixed(0)}%` // No decimals for integers
        : `${d.percentageA.toFixed(1)}%`; // One decimal
    });

  pointContainer
    .append("text")
    .attr("x", pointSide * 0.95)
    .attr("y", -pointSide * 0.85)
    .attr("dy", "0.35em")
    .attr("text-anchor", "end")
    .style("font-size", "0.6em")
    .text(d => {
      return d.percentageB === 0
        ? ""
        : Number.isInteger(d.percentageB)
        ? `${d.percentageB.toFixed(0)}%` // No decimals for integers
        : `${d.percentageB.toFixed(1)}%`; // One decimal
    });

  pointContainer
    .append("text")
    .attr("x", -pointSide * 0.95)
    .attr("y", pointSide * 0.85)
    .attr("dy", "0.35em")
    .style("font-size", "0.6em")
    .text(d => {
      return d.percentageC === 0
        ? ""
        : Number.isInteger(d.percentageC)
        ? `${d.percentageC.toFixed(0)}%` // No decimals for integers
        : `${d.percentageC.toFixed(1)}%`; // One decimal
    });

  pointContainer
    .append("text")
    .attr("x", pointSide * 0.95)
    .attr("y", pointSide * 0.85)
    .attr("dy", "0.35em")
    .attr("text-anchor", "end")
    .style("font-size", "0.6em")
    .text(d => {
      return d.percentageD === 0
        ? ""
        : Number.isInteger(d.percentageD)
        ? `${d.percentageD.toFixed(0)}%` // No decimals for integers
        : `${d.percentageD.toFixed(1)}%`; // One decimal
    });

  // Add text labels for milliliters
  pointContainer
    .append("text")
    .attr("x", -pointSide * 0.5)
    .attr("y", -pointSide * 0.5)
    .attr("dy", "0.35em")
    .attr("text-anchor", "middle")
    .style("font-size", "1.2em") // Font size for the number
    .text(d => {
      if (d.mlA === 0) return "";
      return Number.isInteger(d.mlA) ? d.mlA.toFixed(0) : d.mlA.toFixed(1);
    });

  pointContainer
    .append("text")
    .attr("x", pointSide * 0.5)
    .attr("y", -pointSide * 0.5)
    .attr("dy", "0.35em")
    .attr("text-anchor", "middle")
    .style("font-size", "1.2em") // Font size for the number
    .text(d => {
      if (d.mlB === 0) return "";
      return Number.isInteger(d.mlB) ? d.mlB.toFixed(0) : d.mlB.toFixed(1);
    });

  pointContainer
    .append("text")
    .attr("x", -pointSide * 0.5)
    .attr("y", pointSide * 0.5)
    .attr("dy", "0.35em")
    .attr("text-anchor", "middle")
    .style("font-size", "1.2em") // Font size for the number
    .text(d => {
      if (d.mlC === 0) return "";
      return Number.isInteger(d.mlC) ? d.mlC.toFixed(0) : d.mlC.toFixed(1);
    });

  pointContainer
    .append("text")
    .attr("x", pointSide * 0.5)
    .attr("y", pointSide * 0.5)
    .attr("dy", "0.35em")
    .attr("text-anchor", "middle")
    .style("font-size", "1.2em") // Font size for the number
    .text(d => {
      if (d.mlD === 0) return "";
      return Number.isInteger(d.mlD) ? d.mlD.toFixed(0) : d.mlD.toFixed(1);
    });
}

///////////////////////////////////////////////////////////////////////////////
// Functions to generate blend data ///////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////
/**
 * Generates linear blend data based on the number of points, increment, and test size.
 * @param {number} numberPoints - The number of points in the blend.
 * @param {number} increment - The increment value for percentage calculation.
 * @param {number} testSize - The total test size in milliliters.
 * @returns {Array} An array of objects representing the blend data.
 * @description Each object contains the point index, percentages for each corner, and milliliters for each corner.
 */
function getLinearData(numberPoints, increment, testSize) {
  const data = [];
  d3.range(numberPoints).forEach((d, i, nodes) => {
    const point = i + 1;
    const step = increment ? increment : 100 / (nodes.length - 1);
    const percentageA = 100 - step * i;
    const percentageB = step * i;
    const mlA = (percentageA / 100) * testSize;
    const mlB = (percentageB / 100) * testSize;

    data.push({ point, percentageA, percentageB, mlA, mlB });
  });
  return data;
}

/**
 * Generates triaxial blend data based on the number of points and test size.
 * @param {number} triaxialPoints - The number of points in the triaxial blend.
 * @param {number} testSize - The total test size in milliliters.
 * @returns {Array} An array of objects representing the triaxial blend data.
 * @description Each object contains the point index, position in the triangle, percentages for each corner, and milliliters for each corner.
 */
function getTriaxialData(triaxialPoints, testSize) {
  const data = [];
  let pointIndex = 1;

  // Iterate through rows
  for (let row = 0; row < triaxialPoints; row++) {
    // Iterate through columns in the current row
    for (let col = 0; col <= row; col++) {
      const x = col; // Horizontal position
      const y = row; // Vertical position

      // Calculate percentages for each corner of the triangle
      const percentageA =
        ((triaxialPoints - 1 - row) / (triaxialPoints - 1)) * 100;
      const percentageC = (col / (triaxialPoints - 1)) * 100;
      const percentageB = 100 - percentageA - percentageC;

      // Calculate ml values based on percentages
      const mlA = (percentageA / 100) * testSize;
      const mlB = (percentageB / 100) * testSize;
      const mlC = (percentageC / 100) * testSize;

      // Add the point to the data array
      data.push({
        point: pointIndex++, // Unique point index
        position: [x, y], // Position in the triangle
        percentageA, // Percentage for corner A
        percentageB, // Percentage for corner B
        percentageC, // Percentage for corner C
        mlA, // Milliliters for corner A
        mlB, // Milliliters for corner B
        mlC, // Milliliters for corner C
      });
    }
  }

  return data;
}

/**
 * Generates biaxial blend data based on the number of rows, columns, and test size.
 * @param {number} biaxialRows - The number of rows in the biaxial blend.
 * @param {number} biaxialColumns - The number of columns in the biaxial blend.
 * @param {number} testSize - The total test size in milliliters.
 * @returns {Array} An array of objects representing the biaxial blend data.
 * @description Each object contains the position, point index, percentages for each corner, and milliliters for each corner.
 */
function getBiaxialData(biaxialRows, biaxialColumns, testSize) {
  const data = [];
  d3.range(biaxialRows).forEach((d, i, rows) => {
    d3.range(biaxialColumns).forEach((d, j, columns) => {
      const position = [j, i];
      const point = i * columns.length + j + 1;

      const rowMaxAB = 100 - (100 / (rows.length - 1)) * i;
      const rowStepAB = rowMaxAB / (columns.length - 1);
      const percentageA = Math.max(0, rowMaxAB - rowStepAB * j);
      const percentageB = Math.max(0, rowStepAB * j);

      const rowMaxCD = (100 / (rows.length - 1)) * i;
      const rowStepCD = rowMaxCD / (columns.length - 1);
      const percentageC = Math.max(0, rowMaxCD - rowStepCD * j);
      const percentageD = Math.max(0, rowStepCD * j);

      const mlA = (percentageA / 100) * testSize;
      const mlB = (percentageB / 100) * testSize;
      const mlC = (percentageC / 100) * testSize;
      const mlD = (percentageD / 100) * testSize;

      data.push({
        position,
        point,
        percentageA,
        percentageB,
        percentageC,
        percentageD,
        mlA,
        mlB,
        mlC,
        mlD,
      });
    });
  });
  return data;
}

///////////////////////////////////////////////////////////////////////////////
// Recipes Table  functions ///////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////
/**
 * Renders the recipes table based on the selected materials and blend type.
 * @description This function generates a table with the selected materials as columns and the number of rows based on the blend type.
 */
function renderRecipesTable() {
  // Clear previous table
  document.getElementById("recipes-table-container").innerHTML = "";

  console.log("loadedMaterials", loadedMaterials);

  const selectedMaterials = getSelectedMaterials();
  console.log("selectedMaterials", selectedMaterials);
  console.log("materialsById", materialsById);

  const blendType = document.getElementById("blendType").value;
  let numRows = 0;

  if (blendType === "line") {
    numRows = Number(document.getElementById("linePoints").value) || 0;
  } else if (blendType === "triaxial") {
    const n = Number(document.getElementById("triaxialPoints").value) || 0;
    numRows = (n * (n + 1)) / 2; // Triangular number
  } else if (blendType === "biaxial") {
    const rows = Number(document.getElementById("biaxialRows").value) || 0;
    const cols = Number(document.getElementById("biaxialColumns").value) || 0;
    numRows = rows * cols;
  }

  const container = document.getElementById("recipes-table-container");
  if (numRows === 0) {
    container.innerHTML = "";
    return;
  }

  if (selectedMaterials.length === 0) return;

  let html = `<table class="min-w-full border border-gray-300 text-sm">
    <thead>
      <tr>
        <th class="border px-2 py-1">#</th>
        ${selectedMaterials
          .map(
            mat =>
              `<th class="border px-2 py-1">${materialsById[mat].materialName_es}</th>`
          )
          .join("")}
      </tr>
    </thead>
    <tbody>
  `;

  for (let i = 1; i <= numRows; i++) {
    html += `
      <tr>
        <td class="border px-2 py-1 text-center">${i}</td>
        ${selectedMaterials
          .map(() => `<td class="border px-2 py-1"></td>`)
          .join("")}
      </tr>
    `;
  }
  html += `</tbody></table>`;

  container.innerHTML = html;
}

function getSelectedMaterials() {
  const selects = document.querySelectorAll(".recipe-material-select");
  const materials = Array.from(selects)
    .map(select => select.value)
    .filter(value => value && value !== "");
  // Return unique materials
  return [...new Set(materials)];
}

function getMaterialsById(loadedMaterials) {
  const materialsById = {};
  loadedMaterials.forEach(material => {
    !materialsById[material.materialId]
      ? (materialsById[material.materialId] = material)
      : console.warn(`Duplicate material ID found: ${material.materialId}`);
  });
  return materialsById;
}

///////////////////////////////////////////////////////////////////////////////
// Helper Functions ///////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////

/**
 * Blends multiple colors based on their percentages.
 * @param {Array} colors - An array of hex color strings to blend.
 * @param {Array} percentages - An array of percentages corresponding to each color.
 * @returns {string} The blended color as a hex string.
 */
function blendColors(colors, percentages) {
  const blendedColor = colors.reduce(
    (acc, color, index) => {
      const percentage = percentages[index] / 100;
      const r = parseInt(color.slice(1, 3), 16);
      const g = parseInt(color.slice(3, 5), 16);
      const b = parseInt(color.slice(5, 7), 16);

      acc.r += r * percentage;
      acc.g += g * percentage;
      acc.b += b * percentage;

      return acc;
    },
    { r: 0, g: 0, b: 0 }
  );

  // Convert blended RGB values back to a hex color
  const toHex = value => Math.round(value).toString(16).padStart(2, "0");
  return `#${toHex(blendedColor.r)}${toHex(blendedColor.g)}${toHex(
    blendedColor.b
  )}`;
}
