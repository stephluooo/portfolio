import { fetchJSON, renderProjects, countProjects } from '../global.js';
import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7.9.0/+esm";
const projects = await fetchJSON('../lib/projects.json')
const projectsContainer = document.querySelector('.projects');
renderProjects(projects, projectsContainer, 'h2');

const title = document.querySelector('h1');
countProjects(projects, title)

// d3.select('svg').append('path').attr('d', arc).attr('fill', 'red');

// let data = [
//     { value: 1, label: 'apples' },
//     { value: 2, label: 'oranges' },
//     { value: 3, label: 'mangos' },
//     { value: 4, label: 'pears' },
//     { value: 5, label: 'limes' },
//     { value: 5, label: 'cherries' },
//   ];
// let rolledData = d3.rollups(
//     projects,
//     (v) => v.length,
//     (d) => d.year,
//   );
  
// // let data = rolledData.map(([year, count]) => {
// //     return { value: count, label: year };
// // });

// let colors = d3.scaleOrdinal(d3.schemeTableau10);

// let sliceGenerator = d3.pie().value((d) => d.value);

// let total = 0;
// for (let d of data) {
//   total += d;
// }

// let angle = 0;
// let arcData = sliceGenerator(data);
// for (let d of data) {
//   let endAngle = angle + (d / total) * 2 * Math.PI;
//   arcData.push({ startAngle: angle, endAngle });
//   angle = endAngle;
// }



// let arcs = arcData.map((d) => arcGenerator(d));

// arcs.forEach((arc, idx) => {
//     d3.select('svg')
//       .append('path')
//       .attr('d', arc)
//       .attr('fill', colors(idx)) 
// })

// let legend = d3.select('.legend');
// data.forEach((d, idx) => {
//     legend.append('li')
//           .attr('style', `--color:${colors(idx)}`) // set the style attribute while passing in parameters
//           .attr('class', 'legend-item') // Add a class for styling
//           .html(`<span class="swatch"></span> ${d.label} <em>(${d.value})</em>`); // set the inner html of <li>
// })

let arc = d3.arc().innerRadius(0).outerRadius(50)({
  startAngle: 0,
  endAngle: 2 * Math.PI,
});

let arcGenerator = d3.arc()
.innerRadius(0)
.outerRadius(50);

let filteredProjects = projects

let query = '';

let searchInput = document.querySelector('.searchBar');

let selectedIndex = -1;


function renderPieChart(projectsGiven) {
  // re-calculate rolled data
  let newRolledData = d3.rollups(
    projectsGiven,
    (v) => v.length,
    (d) => d.year,
  );
  // re-calculate data
  let newData = newRolledData.map(([year, count]) => {
    return { value: count, label: year }; // TODO
  });
  // re-calculate slice generator, arc data, arc, etc.
  let newSliceGenerator = d3.pie().value((d) => d.value);
  let newArcData = newSliceGenerator(newData);
  let newArcs = newArcData.map((d) => d3.arc().innerRadius(0).outerRadius(50)(d));
  // TODO: clear up paths and legends
  let newSVG = d3.select('svg'); 
  newSVG.selectAll('path').remove(); // Clear all existing paths in the SVG
  let legend = d3.select('.legend');
  legend.selectAll('li').remove(); // Clear all existing legend items
  let colors = d3.scaleOrdinal(d3.schemeTableau10);
  // update paths and legends, refer to steps 1.4 and 2.2
  newArcs.forEach((arc, idx) => {
    newSVG
      .append('path')
      .attr('d', arc)
      .attr('fill', colors(idx))
      .on('click', () => {
        selectedIndex = selectedIndex === idx ? -1 : idx; // Toggle selection
      
        // Update classes for all paths
        newSVG.selectAll('path')
          .attr('class', (_, idx) => (idx === selectedIndex ? 'selected' : ''));

        // Update legend to highlight selected item
        d3.select('.legend')
          .selectAll('li')
          .attr('class', (_, idx) => (idx === selectedIndex ? 'legend-selected legend-item' : 'legend-item'));
        
        // re render func
        filterAndRenderProjects(newData);
        });
  });


  newData.forEach((d, idx) => {
    legend.append('li')
      .attr('style', `--color:${d3.schemeTableau10[idx]}`)
      .attr('class', 'legend-item')
      .html(`<span class="swatch"></span> ${d.label} <em>${d.value}</em>`);
  });
}

renderPieChart(projects);

searchInput.addEventListener('change', (event) => {
  //update query value
  query = event.target.value.toLowerCase();
  //filter the projects
  filteredProjects = projects.filter((project) => {
        let values = Object.values(project).join('\n').toLowerCase();
        return values.includes(query.toLowerCase());
  });
  // re-render legends and pie chart when event triggers
  renderProjects(filteredProjects, projectsContainer, 'h2');
  renderPieChart(filteredProjects);
});

function filterAndRenderProjects(newData) {
  console.log('clicked and updating')

  filteredProjects = projects.filter((project) => {
        let values = Object.values(project).join('\n').toLowerCase();
        return values.includes(query.toLowerCase());
    });

  if (selectedIndex === -1) {
      // If no pie slice is selected, show all projects
      renderProjects(filteredProjects, projectsContainer, 'h2');
  } else {
      // Filter projects based on the selected pie slice's year
      let selectedYear = newData[selectedIndex].label; // Get the year label of the selected slice
      
      filteredProjects = filteredProjects.filter((project) => project.year === selectedYear);

      renderProjects(filteredProjects, projectsContainer, 'h2'); // Update the project list
  }
}