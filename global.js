console.log('IT’S ALIVE!');

function $$(selector, context = document) {
  return Array.from(context.querySelectorAll(selector));
}

const navLinks = $$('nav a');

// let currentLink = navLinks.find(
//     (a) => a.host === location.host && a.pathname === location.pathname
//   );

//   if (currentLink) {
//     currentLink?.classList.add('current');
//   }


let pages = [
    { url: '', title: 'Home' },
    { url: 'projects/', title: 'Projects' },
    { url: 'resume/', title: 'Resume' },
    { url: 'contact/', title: 'Contacts' },
    { url: 'https://github.com/stephluooo', title: 'GitHub'},
  ];

  let nav = document.createElement('nav');
  document.body.prepend(nav);

  const ARE_WE_HOME = document.documentElement.classList.contains('home');

  for (let p of pages) {
    let url = p.url;
    let title = p.title;
    // TODO create link and add it to nav


    console.log('adding to nav');
    if (url.startsWith('https://github.com')) {
        // github page
        url = url
    } else if (!ARE_WE_HOME && !url.startsWith('http')) {
        // non home page
        url = '../' + url;
    } else {
        // home page
        url = 'https://stephluooo.github.io/portfolio/' + url
    }
    
    let a = document.createElement('a');
    a.href = url;
    a.textContent = title;

    if (a.host === location.host && a.pathname === location.pathname) {
        a.classList.add('current');
    }

    if (a.host !== location.host){
        a.target = "_blank";
    }

    nav.append(a);

}

document.body.insertAdjacentHTML(
    'afterbegin',
    `
      <label class="color-scheme">
          Theme:
          <select id="color-scheme-select">
                <option value="light dark">Automatic</option>
                <option value="light">Light</option>
                <option value="dark">Dark</option>
          </select>
      </label>`
  );

  const select = document.getElementById('color-scheme-select');

  select.addEventListener('input', function (event) {
    console.log('color scheme changed to', event.target.value);
    document.documentElement.style.setProperty('color-scheme', event.target.value);
  });

  if (localStorage.colorScheme) {
    // if there is already a saved color
    const savedScheme = localStorage.colorScheme;
    document.documentElement.style.setProperty('color-scheme', savedScheme); // Apply the saved scheme
    select.value = savedScheme; // Update the dropdown to reflect the saved preference
}

select.addEventListener('input', function (event) {
    const selectedScheme = event.target.value;

    console.log('Color scheme changed to', selectedScheme);

    // Save the user's preference to localStorage
    localStorage.colorScheme = selectedScheme;

    console.log('color scheme changed to', event.target.value);
    
    document.documentElement.style.setProperty('color-scheme', selectedScheme);
});

export async function fetchJSON(url) {
    try {
        // Fetch the JSON file from the given URL
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Failed to fetch projects: ${response.statusText}`);
        }
        console.log(response);
        const data = await response.json();
        return data; 


    } catch (error) {
        console.error('Error fetching or parsing JSON data:', error);
    }
}

export function renderProjects(project, containerElement, headingLevel = 'h2') {
    if (!(containerElement instanceof HTMLElement)) {
        console.error('Invalid container element provided.');
        return;
    }

    const validHeadingLevels = ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'];
    if (!validHeadingLevels.includes(headingLevel)) {
        console.warn(`Invalid heading level "${headingLevel}" provided. Defaulting to "h2".`);
        headingLevel = 'h2';
    }

    containerElement.innerHTML = '';
    project.forEach(p => {
        const title = p.title || 'Untitled Project';
        const image = p.image || 'https://vis-society.github.io/labs/2/images/empty.svg';
        //image coming
        const description = p.description || 'No description available.';

        const article = document.createElement('article');
        article.innerHTML = `
        <${headingLevel}>${title}</${headingLevel}>
        <img src="${image}" alt="${title}" onerror="this.src='fallback-image.jpg';">
        <p>${description}</p >
        `;

        containerElement.appendChild(article);
    });
}