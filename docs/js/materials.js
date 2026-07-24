import { state } from "./state.js";
import { getLang, materialName } from "./i18n.js";

/**
 * Loads materials.json and populates the shared state with the loaded
 * materials and a lookup indexed by materialId.
 */
export function loadMaterials() {
  return d3.json("data/materials.json").then(data => {
    state.loadedMaterials = sortMaterialsByName(data);
    state.materialsById = getMaterialsById(state.loadedMaterials);
  });
}

/**
 * Re-sorts and re-indexes the already-loaded materials for the active
 * language. Call this after a language switch, before repopulating any
 * material selects.
 */
export function resortMaterials() {
  state.loadedMaterials = sortMaterialsByName(state.loadedMaterials);
  state.materialsById = getMaterialsById(state.loadedMaterials);
}

function sortMaterialsByName(materials) {
  const lang = getLang();
  return [...materials].sort((a, b) =>
    materialName(a).localeCompare(materialName(b), lang)
  );
}

export function getMaterialsById(loadedMaterials) {
  const materialsById = {};
  loadedMaterials.forEach(material => {
    !materialsById[material.materialId]
      ? (materialsById[material.materialId] = material)
      : console.warn(`Duplicate material ID found: ${material.materialId}`);
  });
  return materialsById;
}
