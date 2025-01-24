console.log('IT’S ALIVE!');

function $$(selector, context = document) {
  return Array.from(context.querySelectorAll(selector));
}

// navLinks = $$('nav a');

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
    { url: 'https://github.com/stephluooo', title: 'GitHub', external: true },
  ];

  let nav = document.createElement('nav');
  document.body.prepend(nav);

  for (let p of pages) {
    let url = p.url;
    let title = p.title;
    if (url.startsWith('https://github.com')){
        nav.insertAdjacentHTML('beforeend', `<a href="${url}">${title}</a>`);
        continue;
    }
    url = 'https://github.com/stephluooo' + url;
    nav.insertAdjacentHTML('beforeend', `<a href="${url}">${title}</a>`);
  }