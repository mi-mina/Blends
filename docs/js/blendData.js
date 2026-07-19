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
export function getLinearData(numberPoints, increment, testSize) {
  const data = [];
  d3.range(numberPoints).forEach((d, i, nodes) => {
    const point = i + 1;
    const step = increment ? increment : 100 / (nodes.length - 1);
    const percentages = {};
    percentages["1"] = 100 - step * i;
    percentages["2"] = step * i;
    const ml = {};
    ml["1"] = (percentages["1"] / 100) * testSize;
    ml["2"] = (percentages["2"] / 100) * testSize;

    data.push({ point, percentages, ml });
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
export function getTriaxialData(triaxialPoints, testSize) {
  const data = [];
  let pointIndex = 1;

  // Iterate through rows
  for (let row = 0; row < triaxialPoints; row++) {
    // Iterate through columns in the current row
    for (let col = 0; col <= row; col++) {
      const x = col; // Horizontal position
      const y = row; // Vertical position

      // Calculate percentages for each corner of the triangle
      const percentages = {};
      percentages["1"] =
        ((triaxialPoints - 1 - row) / (triaxialPoints - 1)) * 100;
      percentages["3"] = (col / (triaxialPoints - 1)) * 100;
      percentages["2"] = 100 - percentages["1"] - percentages["3"];

      // Calculate ml values based on percentages
      const ml = {};
      ml["1"] = (percentages["1"] / 100) * testSize;
      ml["2"] = (percentages["2"] / 100) * testSize;
      ml["3"] = (percentages["3"] / 100) * testSize;

      // Add the point to the data array
      data.push({
        point: pointIndex++, // Unique point index
        position: [x, y], // Position in the triangle
        percentages,
        ml,
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
export function getBiaxialData(biaxialRows, biaxialColumns, testSize) {
  const data = [];
  d3.range(biaxialRows).forEach((_, i, rows) => {
    d3.range(biaxialColumns).forEach((_, j, columns) => {
      const position = [j, i];
      const point = i * columns.length + j + 1;

      const percentages = {};

      const rowMaxAB = 100 - (100 / (rows.length - 1)) * i;
      const rowStepAB = rowMaxAB / (columns.length - 1);
      percentages["1"] = Math.max(0, rowMaxAB - rowStepAB * j);
      percentages["2"] = Math.max(0, rowStepAB * j);

      const rowMaxCD = (100 / (rows.length - 1)) * i;
      const rowStepCD = rowMaxCD / (columns.length - 1);
      percentages["3"] = Math.max(0, rowMaxCD - rowStepCD * j);
      percentages["4"] = Math.max(0, rowStepCD * j);

      const ml = {};
      ml["1"] = (percentages["1"] / 100) * testSize;
      ml["2"] = (percentages["2"] / 100) * testSize;
      ml["3"] = (percentages["3"] / 100) * testSize;
      ml["4"] = (percentages["4"] / 100) * testSize;

      data.push({
        position,
        point,
        percentages,
        ml,
      });
    });
  });
  return data;
}
