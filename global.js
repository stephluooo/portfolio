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
