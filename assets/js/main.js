// assets/js/main.js
// ES module. Modern browsers supported by GitHub Pages.
import { fixGrammar } from './grammer.js';
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
  initScrollProgress();
  initActiveNav();
  loadProjects();
  loadBlogTeasers();
  initContactForm();
  initDynamicGreeting();
  initFooter();
});

/* =============================================
   SCROLL PROGRESS BAR
   ============================================= */
function initScrollProgress() {
  const progressBar = document.getElementById('scrollProgress');
  if (!progressBar) return;

  window.addEventListener('scroll', () => {
    const winScroll = document.body.scrollTop || document.documentElement.scrollTop;
    const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
    const scrolled = (winScroll / height) * 100;
    progressBar.style.width = scrolled + '%';
  });
}

/* =============================================
   ACTIVE NAV HIGHLIGHTING
   ============================================= */
function initActiveNav() {
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav-list a');

  window.addEventListener('scroll', () => {
    let current = '';
    const scrollPos = window.scrollY + 100; // Offset for header height

    sections.forEach(section => {
      const sectionTop = section.offsetTop;
      const sectionHeight = section.offsetHeight;
      if (scrollPos >= sectionTop && scrollPos < sectionTop + sectionHeight) {
        current = section.getAttribute('id');
      }
    });

    navLinks.forEach(link => {
      link.classList.remove('active');
      if (link.getAttribute('href') === `#${current}`) {
        link.classList.add('active');
      }
    });

    // Special case for blog page link (don't highlight if on index unless it's a section)
  });
}

/* =============================================
   FOOTER: Date and Back to Top
   ============================================= */
function initFooter() {
  const yearEl = document.getElementById('year');
  if (yearEl) {
    yearEl.textContent = new Date().getFullYear();
  }

  const backToTopBtn = document.getElementById('backToTop');
  if (backToTopBtn) {
    backToTopBtn.addEventListener('click', () => {
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    });
  }
}

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
  const form = document.querySelector('.contact-form');
  const statusEl = document.createElement('div');
  statusEl.id = 'formStatus';
  statusEl.style.marginTop = '1rem';
  statusEl.style.padding = '0.75rem';
  statusEl.style.borderRadius = '4px';
  statusEl.style.display = 'none';
  if (form) form.appendChild(statusEl);

  function showStatus(msg, isError = false) {
    statusEl.textContent = msg;
    statusEl.style.display = 'block';
    statusEl.style.backgroundColor = isError ? 'rgba(239, 68, 68, 0.1)' : 'rgba(34, 197, 94, 0.1)';
    statusEl.style.color = isError ? '#ef4444' : '#22c55e';
    statusEl.style.border = `1px solid ${isError ? '#ef4444' : '#22c55e'}`;
    
    setTimeout(() => {
      statusEl.style.display = 'none';
    }, 5000);
  }

  window.handleContact = async function (e) {
    e.preventDefault();
    const formEl = e.target;
    const submitBtn = formEl.querySelector('button[type="submit"]');
    const originalBtnText = submitBtn.innerHTML;

    const name = formEl.name.value.trim();
    const email = formEl.email.value.trim();
    const message = formEl.message.value.trim();

    if (!name || !email || !message) {
      showStatus('Please complete all fields.', true);
      return;
    }

    // Disable button and show loading state
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Sending...';

    try {
      // Improved URL detection: Use localhost if on a local file or local server
      const isLocal = !window.location.hostname || 
                      window.location.hostname === 'localhost' || 
                      window.location.hostname === '127.0.0.1';
      
      const API_URL = isLocal ? 'http://localhost:5000/api/contact' : '/api/contact'; 

      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ name, email, message })
      });

      const result = await response.json();

      if (response.ok) {
        showStatus('Message sent successfully! I will get back to you soon.', false);
        formEl.reset();
      } else {
        showStatus(result.error || 'Failed to send message. Please try again.', true);
      }
    } catch (error) {
      console.error('Contact error:', error);
      showStatus('Network error. Is the backend server running?', true);
    } finally {
      submitBtn.disabled = false;
      submitBtn.innerHTML = originalBtnText;
    }
  };

  const fixBtn = document.getElementById('fixGrammarBtn');
  const messageArea = document.getElementById('message');
  if (fixBtn && messageArea) {
    fixBtn.addEventListener('click', async () => {
      const originalText = messageArea.value.trim();
      if (!originalText) return;

      fixBtn.disabled = true;
      const originalBtnText = fixBtn.innerHTML;
      fixBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Fixing...';

      try {
        const corrected = await fixGrammar(originalText);
        if (corrected && !corrected.startsWith('Error:')) {
          messageArea.value = corrected;
          fixBtn.innerHTML = '<i class="fa-solid fa-check"></i> Fixed!';
          setTimeout(() => {
            fixBtn.innerHTML = originalBtnText;
            fixBtn.disabled = false;
          }, 2000);
        } else {
          throw new Error(corrected);
        }
      } catch (err) {
        console.error('Grammar fix failed:', err);
        fixBtn.innerHTML = '<i class="fa-solid fa-triangle-exclamation"></i> Error';
        setTimeout(() => {
          fixBtn.innerHTML = originalBtnText;
          fixBtn.disabled = false;
        }, 2000);
      }
    });
  }
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
        <img loading="${index < 4 ? 'eager' : 'lazy'}" width="400" height="225" decoding="async" alt="${escapeHtml(p.imageAlt || p.title)}" src="${p.image || 'assets/images/placeholder-project.png'}" />
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
   DYNAMIC TYPEWRITER: Block cursor, synced badges & sub-headline
   ============================================= */
function initDynamicGreeting() {
  const nounEl = document.getElementById('dynamic-noun');
  if (!nounEl) return;


  // Phrase config: noun, color, subtitle, active badge index
  const phrases = [
    {
      noun: "Data Scientist",
      color: "#3b82f6",
      subtitle: "Building production-ready ML systems and data-driven insights.",
      badgeIndex: 0,
      badgeIcon: "fa-solid fa-brain",
      badgeText: "End-to-End MLOps"
    },
    {
      noun: "ML Engineer",
      color: "#a855f7",
      subtitle: "Designing scalable machine learning pipelines for production.",
      badgeIndex: 1,
      badgeIcon: "fa-solid fa-robot",
      badgeText: "RAG & LLM Apps"
    },
    {
      noun: "Problem Solver",
      color: "#22c55e",
      subtitle: "Turning complex data challenges into measurable business value.",
      badgeIndex: 2,
      badgeIcon: "fa-solid fa-cloud",
      badgeText: "AWS Cloud"
    },
    {
      noun: "Agent Builder",
      color: "#f97316",
      subtitle: "Building autonomous AI agents for complex workflows.",
      badgeIndex: 0,
      badgeIcon: "fa-solid fa-robot",
      badgeText: "Agent Builder"
    },
    {
      noun: "Data Analyst",
      color: "#3b82f6",
      subtitle: "Transforming complex data into actionable business insights.",
      badgeIndex: 0,
      badgeIcon: "fa-solid fa-chart-line",
      badgeText: "Data Visualization"
    },
  ];

  const typeSpeed = 70;
  const deleteSpeed = 35;
  const pauseAfterType = 2500;
  const pauseBeforeDelete = 400;

  let phraseIndex = 0;
  let charIndex = 0;
  let isDeleting = false;
  let isPaused = false;

  // Set up DOM: typewriter text + block cursor
  nounEl.innerHTML = '<span class="typewriter-text"></span><span class="block-cursor"></span>';
  const textEl = nounEl.querySelector('.typewriter-text');

  const subtitleEl = document.getElementById('heroSubtitle');
  const badgeGrid = document.getElementById('heroBadgeGrid');

  // Initially sync to first phrase
  syncPhrase(0);

  function syncPhrase(index) {
    const phrase = phrases[index];

    // Update accent color
    nounEl.style.color = phrase.color;

    // Sync subtitle with fade effect
    if (subtitleEl) {
      subtitleEl.style.opacity = '0';
      subtitleEl.style.transform = 'translateY(10px)';
      setTimeout(() => {
        subtitleEl.textContent = phrase.subtitle;
        subtitleEl.style.opacity = '1';
        subtitleEl.style.transform = 'translateY(0)';
      }, 200);
    }

    // Sync badge grid — highlight active, update icon+text
    if (badgeGrid) {
      const badges = badgeGrid.querySelectorAll('.hero-badge-item');
      badges.forEach((badge, i) => {
        badge.classList.remove('active');
        if (i === phrase.badgeIndex) {
          badge.classList.add('active');
          // Update icon and text
          const icon = badge.querySelector('i');
          const span = badge.querySelector('span');
          if (icon) icon.className = phrase.badgeIcon;
          if (span) span.textContent = phrase.badgeText;
        }
      });
    }
  }

  function typeWriter() {
    const currentPhrase = phrases[phraseIndex];

    if (isPaused) return;

    if (!isDeleting) {
      if (charIndex < currentPhrase.noun.length) {
        textEl.textContent = currentPhrase.noun.substring(0, charIndex + 1);
        charIndex++;
        setTimeout(typeWriter, typeSpeed);
      } else {
        isPaused = true;
        setTimeout(() => {
          isPaused = false;
          isDeleting = true;
          setTimeout(typeWriter, pauseBeforeDelete);
        }, pauseAfterType);
      }
    } else {
      if (charIndex > 0) {
        textEl.textContent = currentPhrase.noun.substring(0, charIndex - 1);
        charIndex--;
        setTimeout(typeWriter, deleteSpeed);
      } else {
        isDeleting = false;
        phraseIndex = (phraseIndex + 1) % phrases.length;
        syncPhrase(phraseIndex);
        setTimeout(typeWriter, typeSpeed);
      }
    }
  }

  typeWriter();
}
