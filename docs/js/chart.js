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
 * Draws a linear blend chart using D3.js.
 * @param {Array} data - The blend data to visualize.
 * @description Each object in the data array should contain the point index, percentages for each corner, and milliliters for each corner.
 */
export function drawLinearBlend(data) {
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
      return blendColors(colors, Object.values(d.percentages));
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
    .text(d => formatPercentage(d.percentages["1"]));

  pointContainer
    .append("text")
    .attr("x", pointSide * 0.45)
    .attr("y", pointSide * 0.85)
    .attr("dy", "0.35em")
    .attr("text-anchor", "end")
    .style("font-size", "0.6em")
    .text(d => formatPercentage(d.percentages["2"]));

  // ml text
  pointContainer
    .append("text")
    .attr("x", 0)
    .attr("y", -pointSide * 0.5)
    .attr("dy", "0.35em")
    .attr("text-anchor", "middle")
    .style("font-size", "1.2em")
    .html(d => formatNumber(d.mlA));

  pointContainer
    .append("text")
    .attr("x", 0)
    .attr("y", pointSide * 0.5)
    .attr("dy", "0.35em")
    .attr("text-anchor", "middle")
    .style("font-size", "1.2em")
    .html(d => formatNumber(d.mlB));
}

/**
 * Draws a triaxial blend chart using D3.js.
 * @param {Array} data - The triaxial blend data to visualize.
 * @description Each object in the data array should contain the point index, position in the triangle, percentages for each corner, and milliliters for each corner.
 */
export function drawTriaxialBlend(data) {
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
    .style("fill-opacity", d => d.percentages["1"] / 100)
    .style("stroke", "black")
    .style("stroke-width", 1);

  pointContainer
    .append("rect")
    .attr("x", -pointSide)
    .attr("y", 0)
    .attr("width", pointSide)
    .attr("height", pointSide)
    .style("fill", colorB)
    .style("fill-opacity", d => d.percentages["2"] / 100)
    .style("stroke", "black")
    .style("stroke-width", 1);

  pointContainer
    .append("rect")
    .attr("x", 0)
    .attr("y", 0)
    .attr("width", pointSide)
    .attr("height", pointSide)
    .style("fill", colorC)
    .style("fill-opacity", d => d.percentages["3"] / 100)
    .style("stroke", "black")
    .style("stroke-width", 1);

  pointContainer
    .append("circle")
    .attr("r", pointR)
    .style("fill", d => {
      const colors = [colorA, colorB, colorC];
      return blendColors(colors, Object.values(d.percentages));
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
    .text(d => formatPercentage(d.percentages["1"]));

  pointContainer
    .append("text")
    .attr("x", -pointSide * 0.95)
    .attr("y", pointSide * 0.85)
    .attr("dy", "0.35em")
    .style("font-size", "0.6em")
    .text(d => formatPercentage(d.percentages["2"]));

  pointContainer
    .append("text")
    .attr("x", pointSide * 0.95)
    .attr("y", pointSide * 0.85)
    .attr("dy", "0.35em")
    .attr("text-anchor", "end")
    .style("font-size", "0.6em")
    .text(d => formatPercentage(d.percentages["3"]));

  // Add text labels for milliliters
  pointContainer
    .append("text")
    .attr("x", 0)
    .attr("y", -pointSide * 0.5)
    .attr("dy", "0.35em")
    .attr("text-anchor", "middle")
    .style("font-size", "1.2em")
    .text(d => formatNumber(d.mlA));

  pointContainer
    .append("text")
    .attr("x", -pointSide * 0.5)
    .attr("y", pointSide * 0.5)
    .attr("dy", "0.35em")
    .attr("text-anchor", "middle")
    .style("font-size", "1.2em")
    .text(d => formatNumber(d.mlB));

  pointContainer
    .append("text")
    .attr("x", pointSide * 0.5)
    .attr("y", pointSide * 0.5)
    .attr("dy", "0.35em")
    .attr("text-anchor", "middle")
    .style("font-size", "1.2em")
    .text(d => formatNumber(d.mlC));
}

/**
 * Draws a biaxial blend chart using D3.js.
 * @param {Array} data - The biaxial blend data to visualize.
 * @description Each object in the data array should contain the position, point index, percentages for each corner, and milliliters for each corner.
 */
export function drawBiaxialBlend(data) {
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
    .style("fill-opacity", d => d.percentages["1"] / 100)
    .style("stroke", "black")
    .style("stroke-width", 1);

  pointContainer
    .append("rect")
    .attr("x", 0)
    .attr("y", -pointSide)
    .attr("width", pointSide)
    .attr("height", pointSide)
    .style("fill", colorB)
    .style("fill-opacity", d => d.percentages["2"] / 100)
    .style("stroke", "black")
    .style("stroke-width", 1);

  pointContainer
    .append("rect")
    .attr("x", -pointSide)
    .attr("y", 0)
    .attr("width", pointSide)
    .attr("height", pointSide)
    .style("fill", colorC)
    .style("fill-opacity", d => d.percentages["3"] / 100)
    .style("stroke", "black")
    .style("stroke-width", 1);

  pointContainer
    .append("rect")
    .attr("x", 0)
    .attr("y", 0)
    .attr("width", pointSide)
    .attr("height", pointSide)
    .style("fill", colorD)
    .style("fill-opacity", d => d.percentages["4"] / 100)
    .style("stroke", "black")
    .style("stroke-width", 1);

  pointContainer
    .append("circle")
    .attr("r", pointR)
    .style("fill", d => {
      const colors = [colorA, colorB, colorC, colorD];
      return blendColors(colors, Object.values(d.percentages));
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
    .text(d => formatPercentage(d.percentages["1"]));

  pointContainer
    .append("text")
    .attr("x", pointSide * 0.95)
    .attr("y", -pointSide * 0.85)
    .attr("dy", "0.35em")
    .attr("text-anchor", "end")
    .style("font-size", "0.6em")
    .text(d => formatPercentage(d.percentages["2"]));

  pointContainer
    .append("text")
    .attr("x", -pointSide * 0.95)
    .attr("y", pointSide * 0.85)
    .attr("dy", "0.35em")
    .style("font-size", "0.6em")
    .text(d => formatPercentage(d.percentages["3"]));

  pointContainer
    .append("text")
    .attr("x", pointSide * 0.95)
    .attr("y", pointSide * 0.85)
    .attr("dy", "0.35em")
    .attr("text-anchor", "end")
    .style("font-size", "0.6em")
    .text(d => formatPercentage(d.percentages["4"]));

  // Add text labels for milliliters
  pointContainer
    .append("text")
    .attr("x", -pointSide * 0.5)
    .attr("y", -pointSide * 0.5)
    .attr("dy", "0.35em")
    .attr("text-anchor", "middle")
    .style("font-size", "1.2em") // Font size for the number
    .text(d => formatNumber(d.mlA));

  pointContainer
    .append("text")
    .attr("x", pointSide * 0.5)
    .attr("y", -pointSide * 0.5)
    .attr("dy", "0.35em")
    .attr("text-anchor", "middle")
    .style("font-size", "1.2em") // Font size for the number
    .text(d => formatNumber(d.mlB));

  pointContainer
    .append("text")
    .attr("x", -pointSide * 0.5)
    .attr("y", pointSide * 0.5)
    .attr("dy", "0.35em")
    .attr("text-anchor", "middle")
    .style("font-size", "1.2em") // Font size for the number
    .text(d => formatNumber(d.mlC));

  pointContainer
    .append("text")
    .attr("x", pointSide * 0.5)
    .attr("y", pointSide * 0.5)
    .attr("dy", "0.35em")
    .attr("text-anchor", "middle")
    .style("font-size", "1.2em") // Font size for the number
    .text(d => formatNumber(d.mlD));
}
