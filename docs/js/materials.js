import { state } from "./state.js";

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

function sortMaterialsByName(materials) {
  return [...materials].sort((a, b) =>
    a.materialName_es.localeCompare(b.materialName_es, "es")
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
