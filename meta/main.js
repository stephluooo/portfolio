let data = [];
let commits = [];
let xScale, yScale;

async function loadData() {
  data = await d3.csv('loc.csv', (row) => ({
    ...row,
    line: Number(row.line), // or just +row.line
    depth: Number(row.depth),
    length: Number(row.length),
    date: new Date(row.date + 'T00:00' + row.timezone),
    datetime: new Date(row.datetime),
  }));

  displayStats();
  createScatterplot();
}

function processCommits() {
  commits = d3
    .groups(data, (d) => d.commit)
    .map(([commit, lines]) => {
      let first = lines[0];
      let { author, date, time, timezone, datetime } = first;
      let ret = {
        id: commit,
        url: 'https://github.com/stephluooo/portfolio/commit/' + commit,
        author,
        date,
        time,
        timezone,
        datetime,
        hourFrac: datetime.getHours() + datetime.getMinutes() / 60,
        totalLines: lines.length,
      };

      Object.defineProperty(ret, 'lines', {
        value: lines,
        writable: false, // Prevent modification
        enumerable: false, // Hide from console logs
        configurable: false, // What other options do we need to set?
      });

      return ret;
    });
}

function displayStats() {
  // Process commits first
  processCommits();

  // Add the title above the dl element
  d3.select('#stats').append('h2').text('Summary');

  // Create the dl element
  const dl = d3.select('#stats').append('dl').attr('class', 'stats');

  // Add total commits
  dl.append('dt').text('Total commits');
  dl.append('dd').text(commits.length);

  // Add total LOC
  dl.append('dt').html('Total LOC');
  dl.append('dd').text(data.length);

  // Add number of unique files in the codebase
  const uniqueFiles = new Set(data.map(d => d.file)).size;
  dl.append('dt').text('Files');
  dl.append('dd').text(uniqueFiles);

  // // Add maximum file length (in lines)
  // const maxFileLength = d3.max(d3.rollups(data, v => v.length, d => d.file), d => d[1]);
  // dl.append('dt').text('Max File Length');
  // dl.append('dd').text(maxFileLength);

  // Add longest line (by character length)
  const longestLine = d3.max(data, d => d.length);
  dl.append('dt').text('Longest Line');
  dl.append('dd').text(longestLine);

  // Add maximum depth
  const maxDepth = d3.max(data, d => d.depth);
  dl.append('dt').text('Max Depth');
  dl.append('dd').text(maxDepth);

  // Add average file length (in lines)
  const avgFileLength = d3.mean(d3.rollups(data, v => v.length, d => d.file), d => d[1]);
  dl.append('dt').text('Avg File Length');
  dl.append('dd').text(avgFileLength.toFixed(2));

}

document.addEventListener('DOMContentLoaded', async () => {
  await loadData();
});

function createScatterplot() {
  const width = 1000;
  const height = 600;
  const sortedCommits = d3.sort(commits, (d) => -d.totalLines);

  const svg = d3
    .select('#chart')
    .append('svg')
    .attr('width', width)
    .attr('height', height)
    .append('g')
    .attr('viewBox', `0 0 ${width} ${height}`)
    .style('overflow', 'visible');

  const xScale = d3
    .scaleTime()
    .domain(d3.extent(commits, (d) => d.datetime))
    .range([0, width])
    .nice();

  const yScale = d3.scaleLinear().domain([0, 24]).range([height, 0]);

  const margin = { top: 20, right: 30, bottom: 50, left: 50 };

  const usableArea = {
    top: margin.top,
    right: width - margin.right,
    bottom: height - margin.bottom,
    left: margin.left,
    width: width - margin.left - margin.right,
    height: height - margin.top - margin.bottom,
  };
  
  // Update scales with new ranges
  xScale.range([usableArea.left, usableArea.right]);
  yScale.range([usableArea.bottom, usableArea.top]);

  // Add gridlines BEFORE the axes
  const gridlines = svg
  .append('g')
  .attr('class', 'gridlines')
  .attr('transform', `translate(${usableArea.left}, 0)`);


  // Create gridlines as an axis with no labels and full-width ticks
  gridlines.call(d3.axisLeft(yScale).tickFormat('').tickSize(-usableArea.width));

  const [minLines, maxLines] = d3.extent(commits, (d) => d.totalLines);
  const rScale = d3
  .scaleSqrt() // Change only this line
  .domain([minLines, maxLines])
  .range([6, 50]);

  // Create the axes
  const xAxis = d3.axisBottom(xScale);
  const yAxis = d3.axisLeft(yScale).tickFormat((d) => String(d % 24).padStart(2, '0') + ':00');

// Add X axis
  svg
    .append('g')
    .attr('transform', `translate(0, ${usableArea.bottom})`)
    .call(xAxis);

// Add Y axis
  svg
    .append('g')
    .attr('transform', `translate(${usableArea.left}, 0)`)
    .call(yAxis);
  
  const dots = svg.append('g').attr('class', 'dots');
    
  dots
    .selectAll('circle')
    .data(sortedCommits)
    .join('circle')
    .attr('cx', (d) => xScale(d.datetime))
    .attr('cy', (d) => yScale(d.hourFrac))
    .attr('r', (d) => rScale(d.totalLines))
    .attr('fill', 'steelblue')
    .style('fill-opacity', 0.7)
    .on('mouseenter', function (event, d) {
      d3.select(event.currentTarget).style('fill-opacity', 1); // Full opacity on hover
      updateTooltipContent(d);
      updateTooltipVisibility(true);
      updateTooltipPosition(event);
    })
    .on('mouseleave', function () {
      d3.select(event.currentTarget).style('fill-opacity', 0.7); // Restore transparency
      updateTooltipContent({});
      updateTooltipVisibility(false);
    })
    .on('mousemove', (event) => {
      updateTooltipPosition(event);
    });

  // dots
  //   .selectAll('circle')
  //   .data(sortedCommits)
  //   .join('circle')
  //   .attr('cx', (d) => xScale(d.datetime))
  //   .attr('cy', (d) => yScale(d.hourFrac))
  //   .attr('r', (d) => rScale(d.totalLines))
  //   // .attr('r', 5)
  //   .attr('fill', 'steelblue')
  //   .style('fill-opacity', 0.7) // Add transparency for overlapping dots
  //   .on('mouseenter', function (event, commit) {
  //     d3.select(event.currentTarget).style('fill-opacity', 1).attr('r', (d) => rScale(d.totalLines) * 1.2);
  //     updateTooltipContent(commit);
  //     updateTooltipVisibility(true);
  //     updateTooltipPosition(event);
  //   })
  //   .on('mousemove', updateTooltipPosition)
  //   .on('mouseleave', function () {
  //     d3.select(event.currentTarget).style('fill-opacity', 0.7).attr('r', (d) => rScale(d.totalLines));
  //     updateTooltipContent({});
  //     updateTooltipVisibility(false);
  //   });
}


function updateTooltipContent(commit) {
  const link = document.getElementById('commit-link');
  const date = document.getElementById('commit-date');
  const time = document.getElementById('commit-time');
  const author = document.getElementById('commit-author');
  const lines = document.getElementById('commit-lines');

  if (Object.keys(commit).length === 0) return;

  link.href = commit.url;
  link.textContent = commit.id;
  date.textContent = commit.datetime?.toLocaleString('en', {
    dateStyle: 'full',
  });
  time.textContent = commit.datetime?.toLocaleString('en', {
    timeStyle: 'short',
  });
  author.textContent = commit.author;
  lines.textContent = commit.totalLines;
}

function updateTooltipVisibility(isVisible) {
  const tooltip = document.getElementById('commit-tooltip');
  tooltip.hidden = !isVisible;
}

function updateTooltipPosition(event) {
  const tooltip = document.getElementById('commit-tooltip');
  const tooltipWidth = tooltip.offsetWidth;
  const tooltipHeight = tooltip.offsetHeight;

  let x = event.clientX + 20; // Default position to right of cursor
  let y = event.clientY + 20; // Default position slightly below cursor

  // Prevent tooltip from going off the right edge
  if (x + tooltipWidth > window.innerWidth) {
    x = event.clientX - tooltipWidth - 20; // Move left if overflow
  }

  // Prevent tooltip from going off the bottom
  if (y + tooltipHeight > window.innerHeight) {
    y = event.clientY - tooltipHeight - 20; // Move up if overflow
  }

  tooltip.style.left = `${x}px`;
  tooltip.style.top = `${y}px`;
}

