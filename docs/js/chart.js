import {
  pointSide,
  pointR,
  sep,
  margin,
  colorA,
  colorB,
  colorC,
  colorD,
} from "./constants.js";
import { blendColors, formatNumber, formatPercentage } from "./utils.js";

///////////////////////////////////////////////////////////////////////////////
// Functions to draw blends ///////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////

/**
 * Geometry for each corner count: where each corner's colored box sits
 * relative to the point center, and where its percentage/ml labels go.
 * `anchor` is only set when it differs from the SVG default ("start").
 */
const CORNER_LAYOUTS = {
  2: {
    boxes: [
      { corner: "1", x: -pointSide / 2, y: -pointSide, color: colorA },
      { corner: "2", x: -pointSide / 2, y: 0, color: colorB },
    ],
    percentageLabels: [
      { corner: "1", x: -pointSide * 0.45, y: -pointSide * 0.85 },
      { corner: "2", x: pointSide * 0.45, y: pointSide * 0.85, anchor: "end" },
    ],
    mlLabels: [
      { corner: "1", x: 0, y: -pointSide * 0.5 },
      { corner: "2", x: 0, y: pointSide * 0.5 },
    ],
  },
  3: {
    boxes: [
      { corner: "1", x: -pointSide * 0.5, y: -pointSide, color: colorA },
      { corner: "2", x: -pointSide, y: 0, color: colorB },
      { corner: "3", x: 0, y: 0, color: colorC },
    ],
    percentageLabels: [
      { corner: "1", x: -pointSide * 0.45, y: -pointSide * 0.85 },
      { corner: "2", x: -pointSide * 0.95, y: pointSide * 0.85 },
      { corner: "3", x: pointSide * 0.95, y: pointSide * 0.85, anchor: "end" },
    ],
    mlLabels: [
      { corner: "1", x: 0, y: -pointSide * 0.5 },
      { corner: "2", x: -pointSide * 0.5, y: pointSide * 0.5 },
      { corner: "3", x: pointSide * 0.5, y: pointSide * 0.5 },
    ],
  },
  4: {
    boxes: [
      { corner: "1", x: -pointSide, y: -pointSide, color: colorA },
      { corner: "2", x: 0, y: -pointSide, color: colorB },
      { corner: "3", x: -pointSide, y: 0, color: colorC },
      { corner: "4", x: 0, y: 0, color: colorD },
    ],
    percentageLabels: [
      { corner: "1", x: -pointSide * 0.95, y: -pointSide * 0.85 },
      { corner: "2", x: pointSide * 0.95, y: -pointSide * 0.85, anchor: "end" },
      { corner: "3", x: -pointSide * 0.95, y: pointSide * 0.85 },
      { corner: "4", x: pointSide * 0.95, y: pointSide * 0.85, anchor: "end" },
    ],
    mlLabels: [
      { corner: "1", x: -pointSide * 0.5, y: -pointSide * 0.5 },
      { corner: "2", x: pointSide * 0.5, y: -pointSide * 0.5 },
      { corner: "3", x: -pointSide * 0.5, y: pointSide * 0.5 },
      { corner: "4", x: pointSide * 0.5, y: pointSide * 0.5 },
    ],
  },
};

/**
 * Removes the previous diagram before measuring #graph, so a leftover
 * scrollbar from it can't skew the size measured for the new one.
 */
function clearGraph() {
  d3.select(`#graph`).selectAll("*").remove();
}

/**
 * Draws a blend chart: lays out one group per point using
 * `pointTransform`, and renders the corner boxes/circle/labels from
 * `corners` (one of CORNER_LAYOUTS[2|3|4]). The geometry that genuinely
 * differs between blend types (SVG size, point positions) is passed in by
 * each drawX function below instead of living here.
 * @param {Array} data - The blend data to visualize.
 * @param {Object} options
 * @param {Object} options.corners - Entry from CORNER_LAYOUTS.
 * @param {number} options.svgWidth
 * @param {number} options.svgHeight
 * @param {string} options.chartTransform
 * @param {Function} options.pointTransform - (d, i) => transform string.
 */
function renderBlendChart(
  data,
  { corners, svgWidth, svgHeight, chartTransform, pointTransform }
) {
  const svg = d3
    .select(`#graph`)
    .append("svg")
    .attr("width", svgWidth)
    .attr("height", svgHeight)
    .style("user-select", "none");

  const chartContainer = svg.append("g").attr("transform", chartTransform);

  const pointContainer = chartContainer
    .selectAll(".pointContainer")
    .data(data)
    .enter()
    .append("g")
    .attr("class", "pointContainer")
    .attr("transform", pointTransform);

  // Colored boxes, one per corner
  corners.boxes.forEach(box => {
    pointContainer
      .append("rect")
      .attr("x", box.x)
      .attr("y", box.y)
      .attr("width", pointSide)
      .attr("height", pointSide)
      .style("fill", box.color)
      .style("fill-opacity", d => d.percentages[box.corner] / 100)
      .style("stroke", "black")
      .style("stroke-width", 1);
  });

  // Circle with the blended color
  const colors = corners.boxes.map(box => box.color);
  pointContainer
    .append("circle")
    .attr("r", pointR)
    .style("fill", d => blendColors(colors, Object.values(d.percentages)))
    .style("stroke", "black")
    .style("stroke-width", 1);

  // Point number
  pointContainer
    .append("text")
    .attr("x", 0)
    .attr("y", 0)
    .attr("dy", "0.35em")
    .attr("text-anchor", "middle")
    .text(d => d.point);

  // Percentage labels
  corners.percentageLabels.forEach(label => {
    const text = pointContainer
      .append("text")
      .attr("x", label.x)
      .attr("y", label.y)
      .attr("dy", "0.35em")
      .style("font-size", "0.6em");
    if (label.anchor) text.attr("text-anchor", label.anchor);
    text.text(d => formatPercentage(d.percentages[label.corner]));
  });

  // Milliliter labels
  corners.mlLabels.forEach(label => {
    pointContainer
      .append("text")
      .attr("x", label.x)
      .attr("y", label.y)
      .attr("dy", "0.35em")
      .attr("text-anchor", "middle")
      .style("font-size", "1.2em")
      .text(d => formatNumber(d.ml[label.corner]));
  });
}

/**
 * Draws a linear blend chart using D3.js.
 * @param {Array} data - The blend data to visualize.
 * @description Each object in the data array should contain the point index, percentages for each corner, and milliliters for each corner.
 */
export function drawLinearBlend(data) {
  clearGraph();

  const container = document.getElementById("graph");
  const maxWidth =
    pointSide * data.length +
    sep * (data.length - 1) +
    margin.left +
    margin.right;

  const svgWidth = Math.max(container.clientWidth, maxWidth);
  const svgHeight = pointSide * 2 + margin.top + margin.bottom;

  renderBlendChart(data, {
    corners: CORNER_LAYOUTS[2],
    svgWidth,
    svgHeight,
    chartTransform: `translate(${margin.left + pointSide / 2}, ${
      svgHeight / 2
    })`,
    pointTransform: (d, i) => {
      const x = i * (pointSide + sep);
      const y = pointSide / 2;
      return `translate(${x}, ${y})`;
    },
  });
}

/**
 * Draws a triaxial blend chart using D3.js.
 * @param {Array} data - The triaxial blend data to visualize.
 * @description Each object in the data array should contain the point index, position in the triangle, percentages for each corner, and milliliters for each corner.
 */
export function drawTriaxialBlend(data) {
  clearGraph();

  const numberOfRows = data[data.length - 1].position[1] + 1;

  const container = document.getElementById("graph");
  const contentWidth =
    pointSide * 2 * numberOfRows +
    sep * (numberOfRows - 1) +
    margin.left +
    margin.right;
  const contentHeight =
    pointSide * 2 * numberOfRows +
    sep * (numberOfRows - 1) +
    margin.top +
    margin.bottom;

  const svgWidth = Math.max(container.clientWidth, contentWidth);
  const svgHeight = contentHeight;

  // Scale to position points in a triangular grid
  const xScale = pointSide * 2 + sep;
  const yScale = pointSide * 2 + sep;

  renderBlendChart(data, {
    corners: CORNER_LAYOUTS[3],
    svgWidth,
    svgHeight,
    chartTransform: `translate(${margin.left}, ${margin.top})`,
    pointTransform: d => {
      const t = ((numberOfRows - d.position[1]) * xScale) / 2;
      const x = t + d.position[0] * xScale;
      const y = d.position[1] * yScale;
      return `translate(${x}, ${y})`;
    },
  });
}

/**
 * Draws a biaxial blend chart using D3.js.
 * @param {Array} data - The biaxial blend data to visualize.
 * @description Each object in the data array should contain the position, point index, percentages for each corner, and milliliters for each corner.
 */
export function drawBiaxialBlend(data) {
  clearGraph();

  console.log("Drawing Biaxial Blend with data:", data);

  const numberOfRows = Math.max(...data.map(d => d.position[1])) + 1;
  const numberOfColumns = Math.max(...data.map(d => d.position[0])) + 1;

  const container = document.getElementById("graph");
  const contentWidth =
    pointSide * 2 * numberOfColumns +
    sep * (numberOfColumns - 1) +
    margin.left +
    margin.right;
  const contentHeight =
    pointSide * 2 * numberOfRows +
    sep * (numberOfRows - 1) +
    margin.top +
    margin.bottom;

  const svgWidth = Math.max(container.clientWidth, contentWidth);
  const svgHeight = contentHeight;

  renderBlendChart(data, {
    corners: CORNER_LAYOUTS[4],
    svgWidth,
    svgHeight,
    chartTransform: `translate(${margin.left}, ${margin.top})`,
    pointTransform: d => {
      const x = d.position[0] * (pointSide * 2 + sep);
      const y = d.position[1] * (pointSide * 2 + sep);
      return `translate(${x}, ${y})`;
    },
  });
}
