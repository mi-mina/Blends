import { state } from "./state.js";
import { roundTo } from "./utils.js";

///////////////////////////////////////////////////////////////////////////////
// Functions to draw blends ///////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////

/**
 * Populates the recipe material selects with options from the provided materials array.
 * @param {Array} materials - An array of material objects, each containing materialId and materialName.
 * @description This function updates all recipe material selects with the available materials.
 */

export function populateRecipeMaterialSelects() {
  // Get all selects for recipe materials
  const selects = document.querySelectorAll(".recipe-material-select");
  // Build options HTML
  let options = '<option value="">Selecciona un material</option>';
  state.loadedMaterials.forEach(mat => {
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
      state.recipes["1"] = getRecipeData("recipe1");
      renderRecipesTable();
    });
  });

const recipe2Container = document.getElementById("recipe2");
recipe2Container
  .querySelectorAll('.recipe-material-select, input[type="text"]')
  .forEach(el => {
    el.addEventListener("change", () => {
      state.recipes["2"] = getRecipeData("recipe2");
      renderRecipesTable();
    });
  });

const recipe3Container = document.getElementById("recipe3");
recipe3Container
  .querySelectorAll('.recipe-material-select, input[type="text"]')
  .forEach(el => {
    el.addEventListener("change", () => {
      state.recipes["3"] = getRecipeData("recipe3");
      renderRecipesTable();
    });
  });

const recipe4Container = document.getElementById("recipe4");
recipe4Container
  .querySelectorAll('.recipe-material-select, input[type="text"]')
  .forEach(el => {
    el.addEventListener("change", () => {
      state.recipes["4"] = getRecipeData("recipe4");
      renderRecipesTable();
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

export function getRecipeData(recipeId) {
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

///////////////////////////////////////////////////////////////////////////////
// Recipes Table  functions ///////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////

/**
 * Computes what percentage of a given material ends up in the blend at a
 * specific point, by combining each recipe's material percentage with how
 * much of that recipe's corner is present at that point.
 * @param {number} point - Point number, as in blendData[].point.
 * @param {string} materialId
 * @returns {number}
 */
export function getMaterialPercentageAtPoint(point, materialId) {
  const blend = state.blendData.filter(bd => bd.point === point)[0];
  const percentages = blend ? blend.percentages : {};

  let materialPercentage = 0;

  Object.entries(state.recipes).forEach(([key, recipe]) => {
    const recipePercentage = percentages[key];

    const a = recipe.filter(mat => mat.materialId === materialId);
    // TODO handle case where materialId is not found
    // TODO ver qué pasa cuando aparece el mismo material dos veces en la misma receta
    // TODO ver qué pasa si los porcentajes de la receta no suman 100

    materialPercentage +=
      a.length > 0 ? (recipePercentage * a[0].percentage) / 100 : 0;
  });

  return materialPercentage;
}

/**
 * Renders the recipes table based on the selected materials and blend type.
 * @description This function generates a table with the selected materials as columns and the number of rows based on the blend type.
 */
export function renderRecipesTable() {
  // Clear previous table
  document.getElementById("recipes-table-container").innerHTML = "";

  const selectedMaterials = getSelectedMaterials();
  console.log("Recipes:", state.recipes);
  console.log("blendData:", state.blendData);

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
              `<th class="border px-2 py-1">${state.materialsById[mat].materialName_es}</th>`
          )
          .join("")}
      </tr>
    </thead>
    <tbody>
  `;

  for (let i = 0; i < numRows; i++) {
    const recipeNumber = i + 1;
    html += `
      <tr>
        <td class="border px-2 py-1 text-center">${recipeNumber}</td>
        ${selectedMaterials
          .map(materialId => {
            const materialPercentage = getMaterialPercentageAtPoint(
              recipeNumber,
              materialId
            );
            return `<td class="border px-2 py-1">${roundTo(
              materialPercentage
            )}%</td>`;
          })
          .join("")}
      </tr>
    `;
  }
  html += `</tbody></table>`;

  container.innerHTML = html;
}

export function getSelectedMaterials() {
  const selects = document.querySelectorAll(".recipe-material-select");
  const materials = Array.from(selects)
    .map(select => select.value)
    .filter(value => value && value !== "");
  // Return unique materials
  return [...new Set(materials)];
}
