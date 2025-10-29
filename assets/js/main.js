// assets/js/main.js
// ES module. Modern browsers supported by GitHub Pages.
// Responsibilities:
// - Load projects.json and render filterable/sortable project grid
// - Load posts.json and render blog teasers
// - Lightweight accessibility helpers and contact mailto fallback

const PROJECTS_JSON = 'assets/js/projects.json';
const POSTS_JSON = 'assets/js/posts.json';

document.addEventListener('DOMContentLoaded', () => {
  initNavToggle();
  loadProjects();
  loadBlogTeasers();
  initContactForm();
});

/* NAV TOGGLE (mobile) */
function initNavToggle(){
  const btn = document.querySelector('.nav-toggle');
  const nav = document.getElementById('mainnav');
  if(!btn || !nav) return;
  btn.addEventListener('click', () => {
    const expanded = btn.getAttribute('aria-expanded') === 'true';
    btn.setAttribute('aria-expanded', !expanded);
    nav.style.display = expanded ? '' : 'flex';
  });
}

/* CONTACT form handler: sends using mailto (fallback)
   For production use consider Formspree, Netlify Forms, or a simple serverless function.
*/
function initContactForm(){
  window.handleContact = function (e){
    e.preventDefault();
    const form = e.target;
    const name = form.name.value.trim();
    const email = form.email.value.trim();
    const message = form.message.value.trim();
    if(!name || !email || !message){ alert('Please complete the form.'); return; }
    const subject = encodeURIComponent(`Portfolio inquiry from ${name}`);
    const body = encodeURIComponent(`${message}\n\n--\n${name}\n${email}`);
    // Open user's mail client with prefilled content
    window.location.href = `mailto:your.email@example.com?subject=${subject}&body=${body}`;
  }
}

/* PROJECTS: load, render, filter */
async function loadProjects(){
  try{
    const res = await fetch(PROJECTS_JSON, {cache: 'no-cache'});
    const projects = await res.json();
    renderProjects(projects);
    buildTagFilters(projects);
    initProjectSearch(projects);
  }catch(err){
    console.error('Failed to load projects:', err);
  }
}

/* RENDER PROJECTS: accessible grid */
function renderProjects(projects){
  const grid = document.getElementById('projectsGrid');
  grid.innerHTML = '';
  if(!projects.length){
    grid.innerHTML = '<p>No projects yet.</p>'; return;
  }
  projects.forEach(p => {
    const card = document.createElement('article');
    card.className = 'project-card';
    card.tabIndex = 0;
    card.innerHTML = `
      <a class="project-media" href="${p.url || '#'}" aria-label="${escapeHtml(p.title)} - open project" target="${p.external ? '_blank' : '_self'}" rel="noopener">
        <img loading="lazy" alt="${escapeHtml(p.imageAlt||p.title)}" src="${p.image||'assets/images/placeholder-project.jpg'}" />
      </a>
      <div class="project-body">
        <h3>${escapeHtml(p.title)}</h3>
        <p class="proj-desc">${escapeHtml(p.description)}</p>
        <div class="project-meta">
          <div class="tags">${(p.tech || []).map(t => `<button class="tag" data-tag="${escapeHtml(t)}" aria-label="Filter by ${escapeHtml(t)}">${escapeHtml(t)}</button>`).join('')}</div>
          <div class="proj-links">
            ${p.repo ? `<a href="${p.repo}" target="_blank" rel="noopener" aria-label="View source repo"><i class="fa-brands fa-github"></i></a>` : ''}
          </div>
        </div>
      </div>
    `;
    grid.appendChild(card);
  });

  // Add event delegation for tag clicks
  grid.addEventListener('click', e => {
    const t = e.target.closest('.tag');
    if(t) applyTagFilter(t.dataset.tag);
  });
}

/* Build tag filter UI from project list */
function buildTagFilters(projects){
  const unique = new Set(projects.flatMap(p => p.tech || []));
  const container = document.getElementById('tagFilters');
  container.innerHTML = '';
  Array.from(unique).sort().forEach(tag => {
    const btn = document.createElement('button');
    btn.className = 'tag';
    btn.textContent = tag;
    btn.setAttribute('data-tag', tag);
    btn.type = 'button';
    btn.addEventListener('click', () => applyTagFilter(tag));
    container.appendChild(btn);
  });
}

/* Apply tag filter: highlights tag and filters grid */
function applyTagFilter(tag){
  const search = document.getElementById('project-search');
  // Simple: set search box to tag and filter
  search.value = tag;
  filterProjects(search.value);
}

/* Project search input handler */
function initProjectSearch(projects){
  const input = document.getElementById('project-search');
  input.addEventListener('input', () => filterProjects(input.value, projects));
  // initial render (no filter)
  filterProjects('', projects);
}

/* Filter logic */
function filterProjects(query = '', projectsCache){
  // If projectsCache not passed, fetch again (rare)
  (async ()=>{
    const projects = projectsCache || (await (await fetch(PROJECTS_JSON)).json());
    const normalized = query.trim().toLowerCase();
    const filtered = normalized ? projects.filter(p => {
      const hay = [p.title, p.description, ...(p.tech||[]), ...(p.domains||[])].join(' ').toLowerCase();
      return hay.includes(normalized);
    }) : projects;
    renderProjects(filtered);
  })();
}

  
/* BLOG teasers loader — show 3 posts, then expand to all */
async function loadBlogTeasers(){
  try {
    const res = await fetch(POSTS_JSON, {cache: 'no-cache'});
    const posts = await res.json();
    const el = document.getElementById('blogList');

    // Render first 3 posts initially
    el.innerHTML = renderPosts(posts.slice(0,3));
  } catch(err) {
    console.error('Failed to load posts:', err);
  }
}

/* helper to render posts */
function renderPosts(list){
  return list.map(p => `
    <article class="blog-teaser" aria-labelledby="post-${p.slug}">
      <h3 id="post-${p.slug}">
        <a href="post.html?slug=${encodeURIComponent(p.slug)}">${escapeHtml(p.title)}</a>
      </h3>
      <p class="meta">${escapeHtml(p.date)} • ${escapeHtml(p.readingTime || '')}</p>
      <p>${escapeHtml(p.excerpt)}</p>
    </article>
  `).join('');
}

/* Utility: escape HTML (very small helper) */
function escapeHtml(str = ''){
  return String(str).replace(/[&<>"']/g, (m) => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
}
