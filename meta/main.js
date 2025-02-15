let data = [];
let commits = [];

async function loadData() {
  data = await d3.csv('./loc.csv');
}

document.addEventListener('DOMContentLoaded', async () => {
  await loadData();
});

async function loadData() {
  data = await d3.csv('loc.csv', (row) => ({
    ...row,
    line: Number(row.line), // or just +row.line
    depth: Number(row.depth),
    length: Number(row.length),
    date: new Date(row.date + 'T00:00' + row.timezone),
    datetime: new Date(row.datetime),
  }));
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

async function loadData() {
  data = await d3.csv('./loc.csv', (row) => ({
    ...row,
    line: Number(row.line), // Convert line to number
    depth: Number(row.depth), // Convert depth to number
    length: Number(row.length), // Convert length to number
    date: new Date(row.date + 'T00:00' + row.timezone), // Convert date with timezone
    datetime: new Date(row.datetime), // Convert datetime to JS Date object
  }));

  processCommits();
  console.log(commits);
}
