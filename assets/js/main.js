// assets/js/main.js
// ES module. Modern browsers supported by GitHub Pages.
// Responsibilities:
// - Load projects.json and render filterable/sortable project grid (max 8 shown)
// - Load posts.json and render blog teasers (latest 3 only)
// - Lightweight accessibility helpers and contact mailto fallback
// - Theme toggle support

const PROJECTS_JSON = 'assets/js/projects.json';
const POSTS_JSON = 'assets/js/posts.json';
const MAX_PROJECTS_DISPLAY = 8; // 4x2 grid

let allProjects = [];

document.addEventListener('DOMContentLoaded', () => {
  initNavToggle();
  initThemeToggle();
  loadProjects();
  loadBlogTeasers();
  initContactForm();
  initDynamicGreeting();
});

/* =============================================
   THEME TOGGLE
   ============================================= */
function initThemeToggle() {
  const btn = document.getElementById('themeToggle');
  if (!btn) return;

  // Check for saved preference or system preference
  const savedTheme = localStorage.getItem('theme');
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

  if (savedTheme) {
    document.body.className = savedTheme;
  } else if (prefersDark) {
    document.body.className = 'theme-dark';
  }

  updateThemeIcon(btn);

  btn.addEventListener('click', () => {
    const isDark = document.body.classList.contains('theme-dark');
    document.body.className = isDark ? 'theme-light' : 'theme-dark';
    localStorage.setItem('theme', document.body.className);
    updateThemeIcon(btn);
  });
}

function updateThemeIcon(btn) {
  const isDark = document.body.classList.contains('theme-dark');
  btn.innerHTML = isDark
    ? '<i class="fa-solid fa-sun" aria-hidden="true"></i>'
    : '<i class="fa-solid fa-moon" aria-hidden="true"></i>';
  btn.setAttribute('aria-label', isDark ? 'Switch to light mode' : 'Switch to dark mode');
}

/* =============================================
   NAV TOGGLE (mobile)
   ============================================= */
function initNavToggle() {
  const btn = document.querySelector('.nav-toggle');
  const nav = document.getElementById('mainnav');
  if (!btn || !nav) return;

  btn.addEventListener('click', () => {
    const expanded = btn.getAttribute('aria-expanded') === 'true';
    btn.setAttribute('aria-expanded', !expanded);
    nav.classList.toggle('open');
  });

  // Close menu when clicking outside
  document.addEventListener('click', (e) => {
    if (!btn.contains(e.target) && !nav.contains(e.target)) {
      btn.setAttribute('aria-expanded', 'false');
      nav.classList.remove('open');
    }
  });

  // Close menu when clicking a link
  nav.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      btn.setAttribute('aria-expanded', 'false');
      nav.classList.remove('open');
    });
  });
}

/* =============================================
   CONTACT form handler
   ============================================= */
function initContactForm() {
  window.handleContact = function (e) {
    e.preventDefault();
    const form = e.target;
    const name = form.name.value.trim();
    const email = form.email.value.trim();
    const message = form.message.value.trim();

    if (!name || !email || !message) {
      alert('Please complete the form.');
      return;
    }

    const subject = encodeURIComponent(`Portfolio inquiry from ${name}`);
    const body = encodeURIComponent(`${message}\n\n--\n${name}\n${email}`);
    window.location.href = `mailto:your.email@example.com?subject=${subject}&body=${body}`;
  };
}

/* =============================================
   PROJECTS: load, render, filter
   ============================================= */
async function loadProjects() {
  try {
    const res = await fetch(PROJECTS_JSON, { cache: 'no-cache' });
    allProjects = await res.json();
    renderProjects(allProjects.slice(0, MAX_PROJECTS_DISPLAY));
    buildTagFilters(allProjects);
    initProjectSearch();
    updateProjectsInfo(allProjects.length, Math.min(MAX_PROJECTS_DISPLAY, allProjects.length));
  } catch (err) {
    console.error('Failed to load projects:', err);
    const grid = document.getElementById('projectsGrid');
    if (grid) {
      grid.innerHTML = '<p class="no-results">Failed to load projects. Please try again later.</p>';
    }
  }
}

/* RENDER PROJECTS: accessible grid with compact cards */
function renderProjects(projects) {
  const grid = document.getElementById('projectsGrid');
  if (!grid) return;

  grid.innerHTML = '';

  if (!projects.length) {
    grid.innerHTML = `
      <div class="no-results">
        <i class="fa-solid fa-search" style="font-size: 2rem; margin-bottom: 1rem; opacity: 0.5;"></i>
        <p>No projects found matching your search.</p>
        <button class="btn secondary" onclick="clearSearch()">Clear Search</button>
      </div>
    `;
    return;
  }

  projects.forEach((p, index) => {
    const card = document.createElement('article');
    card.className = 'project-card';
    card.tabIndex = 0;
    card.style.animationDelay = `${index * 0.05}s`;
    card.innerHTML = `
      <a class="project-media" href="${p.url || '#'}" aria-label="${escapeHtml(p.title)} - open project" target="${p.external ? '_blank' : '_self'}" rel="noopener">
        <img loading="lazy" alt="${escapeHtml(p.imageAlt || p.title)}" src="${p.image || 'assets/images/placeholder-project.jpg'}" />
      </a>
      <div class="project-body">
        <h3>${escapeHtml(p.title)}</h3>
        <p class="proj-desc">${escapeHtml(p.description)}</p>
        <div class="project-meta">
          <div class="tags">${(p.tech || []).slice(0, 3).map(t =>
      `<button class="tag" data-tag="${escapeHtml(t)}" aria-label="Filter by ${escapeHtml(t)}">${escapeHtml(t)}</button>`
    ).join('')}</div>
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
    if (t) {
      e.preventDefault();
      applyTagFilter(t.dataset.tag);
    }
  });
}

/* Build tag filter UI from project list */
function buildTagFilters(projects) {
  const unique = new Set(projects.flatMap(p => p.tech || []));
  const container = document.getElementById('tagFilters');
  if (!container) return;

  container.innerHTML = '';

  // Only show top 6 tags to keep it clean
  const sortedTags = Array.from(unique).sort().slice(0, 6);

  sortedTags.forEach(tag => {
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
function applyTagFilter(tag) {
  const search = document.getElementById('project-search');
  if (search) {
    search.value = tag;
    filterProjects(tag);
  }
}

/* Clear search */
window.clearSearch = function () {
  const search = document.getElementById('project-search');
  if (search) {
    search.value = '';
    filterProjects('');
  }
};

/* Project search input handler */
function initProjectSearch() {
  const input = document.getElementById('project-search');
  if (!input) return;

  let debounceTimer;

  input.addEventListener('input', () => {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
      filterProjects(input.value);
    }, 200);
  });

  // Allow Enter key to search
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      filterProjects(input.value);
    }
  });
}

/* Filter logic - shows max 8 matching projects */
function filterProjects(query = '') {
  const normalized = query.trim().toLowerCase();

  let filtered;
  if (normalized) {
    filtered = allProjects.filter(p => {
      const hay = [p.title, p.description, ...(p.tech || []), ...(p.domains || [])].join(' ').toLowerCase();
      return hay.includes(normalized);
    });
  } else {
    filtered = allProjects;
  }

  const displayed = filtered.slice(0, MAX_PROJECTS_DISPLAY);
  renderProjects(displayed);
  updateProjectsInfo(filtered.length, displayed.length, normalized);
}

/* Update projects info text */
function updateProjectsInfo(total, shown, searchTerm = '') {
  const infoEl = document.getElementById('projectsInfo');
  if (!infoEl) return;

  if (searchTerm) {
    infoEl.innerHTML = `<span>Showing ${shown} of ${total} matching projects</span>`;
  } else {
    infoEl.innerHTML = `<span>Showing ${shown} of ${total} projects</span>`;
  }
}

/* =============================================
   BLOG teasers loader — shows latest 3 posts only
   ============================================= */
async function loadBlogTeasers() {
  try {
    const res = await fetch(POSTS_JSON, { cache: 'no-cache' });
    const posts = await res.json();

    // Sort by date descending to get latest posts
    const sortedPosts = posts.sort((a, b) => new Date(b.date) - new Date(a.date));

    const el = document.getElementById('blogList');
    if (!el) return;

    // Render only latest 3 posts
    el.innerHTML = renderPosts(sortedPosts.slice(0, 3));
  } catch (err) {
    console.error('Failed to load posts:', err);
    const el = document.getElementById('blogList');
    if (el) {
      el.innerHTML = '<p class="no-results">Failed to load blog posts.</p>';
    }
  }
}

/* helper to render posts */
function renderPosts(list) {
  return list.map((p, index) => `
    <article class="blog-teaser" aria-labelledby="post-${p.slug}" style="animation: fadeInUp 0.5s ease-out ${index * 0.1}s backwards;">
      <h3 id="post-${p.slug}">
        <a href="post.html?slug=${encodeURIComponent(p.slug)}">${escapeHtml(p.title)}</a>
      </h3>
      <p class="meta">${escapeHtml(p.date)} • ${escapeHtml(p.readingTime || '')}</p>
      <p>${escapeHtml(p.excerpt)}</p>
    </article>
  `).join('');
}

/* =============================================
   UTILITY FUNCTIONS
   ============================================= */
function escapeHtml(str = '') {
  return String(str).replace(/[&<>"']/g, (m) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  }[m]));
}

/* =============================================
   DYNAMIC GREETING: Typewriter animation with blinking cursor
   ============================================= */
function initDynamicGreeting() {
  const el = document.getElementById('dynamic-greeting');
  if (!el) return;

  const phrases = [
    "I am Avijit",
    "Hello there!",
    "Welcome to my portfolio",
    "Crafting clarity through code",
    "Turning ideas into impact"
  ];

  // Typewriter configuration
  const typeSpeed = 80;      // ms per character when typing
  const deleteSpeed = 40;    // ms per character when deleting
  const pauseAfterType = 2000; // ms to pause after typing complete phrase
  const pauseBeforeDelete = 500; // ms before starting to delete

  let phraseIndex = 0;
  let charIndex = 0;
  let isDeleting = false;
  let isPaused = false;

  // Clear initial text and add cursor wrapper
  el.innerHTML = '<span class="typewriter-text"></span><span class="typewriter-cursor">|</span>';
  const textEl = el.querySelector('.typewriter-text');

  function typeWriter() {
    const currentPhrase = phrases[phraseIndex];

    if (isPaused) {
      return;
    }

    if (!isDeleting) {
      // Typing phase
      if (charIndex < currentPhrase.length) {
        textEl.textContent = currentPhrase.substring(0, charIndex + 1);
        charIndex++;
        setTimeout(typeWriter, typeSpeed);
      } else {
        // Finished typing, pause before deleting
        isPaused = true;
        setTimeout(() => {
          isPaused = false;
          isDeleting = true;
          setTimeout(typeWriter, pauseBeforeDelete);
        }, pauseAfterType);
      }
    } else {
      // Deleting phase
      if (charIndex > 0) {
        textEl.textContent = currentPhrase.substring(0, charIndex - 1);
        charIndex--;
        setTimeout(typeWriter, deleteSpeed);
      } else {
        // Finished deleting, move to next phrase
        isDeleting = false;
        phraseIndex = (phraseIndex + 1) % phrases.length;
        setTimeout(typeWriter, typeSpeed);
      }
    }
  }

  // Start the typewriter effect
  typeWriter();
}
