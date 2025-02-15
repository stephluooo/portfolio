let data = [];
let commits = [];

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

  // Create the dl element
  const dl = d3.select('#stats').append('dl').attr('class', 'stats');

  // Add total LOC
  dl.append('dt').html('Total <abbr title="Lines of code">LOC</abbr>');
  dl.append('dd').text(data.length);

  // Add total commits
  dl.append('dt').text('Total commits');
  dl.append('dd').text(commits.length);

  // Add number of unique files in the codebase
  const uniqueFiles = new Set(data.map(d => d.file)).size;
  dl.append('dt').text('Files');
  dl.append('dd').text(uniqueFiles);

  // Add maximum file length (in lines)
  const maxFileLength = d3.max(d3.rollups(data, v => v.length, d => d.file), d => d[1]);
  dl.append('dt').text('Max File Length');
  dl.append('dd').text(maxFileLength);

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
  createScatterplot();
});

const width = 1000;
const height = 600;

const svg = d3
  .select('#chart')
  .append('svg')
  .attr('viewBox', `0 0 ${width} ${height}`)
  .style('overflow', 'visible');

const yScale = d3.scaleLinear().domain([0, 24]).range([height, 0]);

function createScatterplot() {
  const dots = svg.append('g').attr('class', 'dots');

  dots
    .selectAll('circle')
    .data(commits)
    .join('circle')
    .attr('cx', (d) => xScale(d.datetime))
    .attr('cy', (d) => yScale(d.hourFrac))
    .attr('r', 5)
    .attr('fill', 'steelblue');
}