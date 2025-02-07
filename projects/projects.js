import { fetchJSON, renderProjects, countProjects } from '../global.js';
import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7.9.0/+esm";
const projects = await fetchJSON('../lib/projects.json')
const projectsContainer = document.querySelector('.projects');
renderProjects(projects, projectsContainer, 'h2');

const title = document.querySelector('h1');
countProjects(projects, title)

let arc = d3.arc().innerRadius(0).outerRadius(50)({
    startAngle: 0,
    endAngle: 2 * Math.PI,
  });

let data = [1, 2];

let total = 0;
for (let d of data) {
  total += d;
}

let angle = 0;
let arcData = [];
for (let d of data) {
  let endAngle = angle + (d / total) * 2 * Math.PI;
  arcData.push({ startAngle: angle, endAngle });
  angle = endAngle;
}

let arcGenerator = d3.arc()
    .innerRadius(0)
    .outerRadius(50); // Radius of 50, adjust as needed.

let arcs = arcData.map((d) => arcGenerator(d));

let svg = d3.select("#projects-pie-plot");

arcs.forEach(arc => {
    svg.append("path")
        .attr("d", arc)
        .attr("fill", "red") // Adjust color as needed
        .attr("stroke", "black") // Optional: for stroke/border
        .attr("stroke-width", 1);
});