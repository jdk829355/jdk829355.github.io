// app.js

document.addEventListener('DOMContentLoaded', () => {
  initNavigation();
  loadVaultData();
});

// Configure Marked.js options
marked.setOptions({
  breaks: true,
  gfm: true
});

// Navigation Handling
function initNavigation() {
  const links = document.querySelectorAll('.nav-link');
  const pages = document.querySelectorAll('.page');

  // Simple routing based on hash
  function handleRoute() {
    let hash = window.location.hash || '#about';
    const targetId = hash.replace('#', '') + '-page';

    links.forEach(link => {
      if (link.getAttribute('href') === hash) {
        link.classList.add('active');
      } else {
        link.classList.remove('active');
      }
    });

    pages.forEach(page => {
      if (page.id === targetId) {
        page.classList.add('active');
      } else {
        page.classList.remove('active');
      }
    });
  }

  window.addEventListener('hashchange', handleRoute);

  // Clean URL if no hash defaults to about
  if (!window.location.hash) {
    window.history.replaceState(null, null, '#about');
  }
  handleRoute();
}

// Fetch and load data
async function loadVaultData() {
  try {
    const res = await fetch('vault/index.json');
    if (!res.ok) throw new Error('Cannot load vault/index.json');
    const data = await res.json();

    await Promise.all([
      loadAbout(data.about, data.profile_image),
      loadProjects(data.projects),
      loadThoughts(data.thoughts)
    ]);
  } catch (error) {
    console.error('Error loading vault data:', error);
    document.getElementById('about-markdown-container').innerHTML = '<p>데이터를 불러오는데 실패했습니다.</p>';
  }
}

async function fetchMarkdown(path) {
  try {
    const res = await fetch(path);
    if (!res.ok) throw new Error(`Failed to load ${path}`);
    let text = await res.text();

    // Obsidian style image syntax ![[image.png]] 지원을 위한 전처리
    text = text.replace(/!\[\[(.*?)\]\]/g, (match, p1) => `![${p1}](${encodeURI('vault/images/' + p1)})`);

    // ![image.png] 형식 (뒤에 괄호 경로가 없는 순수 파일명 패턴) 지원을 위한 전처리
    text = text.replace(/!\[([^\]]+)\](?!\()/g, (match, p1) => `![${p1}](${encodeURI('vault/images/' + p1)})`);

    return marked.parse(text);
  } catch (e) {
    console.error(e);
    return `<p>내용을 불러올 수 없습니다. (${path})</p>`;
  }
}

async function loadAbout(aboutPath, profileImage) {
  if (!aboutPath) return;
  const html = await fetchMarkdown(`vault/${aboutPath}`);
  const container = document.getElementById('about-markdown-container');
  container.innerHTML = `<div class="markdown-body">${html}</div>`;

  if (profileImage) {
    const photoContainer = document.querySelector('.profile-photo');
    photoContainer.innerHTML = `<img src="vault/images/${encodeURI(profileImage)}" alt="프로필 사진" style="width:100%;height:100%;object-fit:cover;">`;
    photoContainer.style.border = "none";
  }
}

async function loadProjects(projects) {
  const container = document.getElementById('projects-container');
  if (!projects || projects.length === 0) {
    container.innerHTML = '<p class="empty-message">아직 프로젝트가 없습니다.</p>';
    return;
  }

  container.innerHTML = '';

  for (const proj of projects) {
    // 미리 markdown 내용을 가져옴 (이미지와 github 헤더를 제거하기 위함)
    let markdownHtml = '';
    try {
      const res = await fetch(`vault/projects/${proj.markdown}`);
      if (res.ok) {
        let text = await res.text();
        // 프로젝트 텍스트 본문에서는 이 메타데이터들을 지운다
        text = text.replace(/^github:\s*.*$/gim, '');
        text = text.replace(/!\[\[(.*?)\]\]/g, '');
        text = text.replace(/!\[([^\]]*)\](?!\()/g, '');
        text = text.replace(/!\[.*?\]\((.*?)\)/g, '');
        markdownHtml = marked.parse(text);
      }
    } catch (e) { }

    // Create Carousel HTML
    let imagesHtml = '';
    let dotsHtml = '';
    if (proj.images && proj.images.length > 0) {
      proj.images.forEach((img, idx) => {
        const activeClass = idx === 0 ? 'active' : '';
        // Handle images, assuming they are inside vault/images/
        imagesHtml += `<img src="vault/images/${encodeURI(img)}" class="${activeClass}" data-idx="${idx}" alt="${proj.title} 이미지">`;
        dotsHtml += `<div class="carousel-dot ${activeClass}" data-idx="${idx}"></div>`;
      });
    } else {
      imagesHtml = '<div class="photo-placeholder">사진이 없습니다.</div>';
    }

    const html = `
      <article class="project-card">
        <div class="project-carousel" id="carousel-${proj.id}">
          ${imagesHtml}
          ${proj.images && proj.images.length > 1 ? `<div class="carousel-controls">${dotsHtml}</div>` : ''}
        </div>
        <div class="project-content">
          <div class="project-header">
            <h3 class="project-title">${proj.title}</h3>
            ${proj.github ? `
              <a href="${proj.github}" target="_blank" rel="noopener noreferrer" class="github-link">
                <i class="ph ph-github-logo"></i>
              </a>
            ` : ''}
          </div>
          <div class="project-description markdown-body">
            ${markdownHtml}
          </div>
        </div>
      </article>
    `;

    container.insertAdjacentHTML('beforeend', html);

    // Init Carousel interactions
    if (proj.images && proj.images.length > 1) {
      const carouselEl = document.getElementById(`carousel-${proj.id}`);
      initCarousel(carouselEl);
    }
  }
}

function initCarousel(carouselElement) {
  const images = carouselElement.querySelectorAll('img');
  const dots = carouselElement.querySelectorAll('.carousel-dot');

  dots.forEach((dot, dotIdx) => {
    dot.addEventListener('click', () => {
      // Deactivate all
      images.forEach(i => i.classList.remove('active'));
      dots.forEach(d => d.classList.remove('active'));

      // Activate selected
      images[dotIdx].classList.add('active');
      dots[dotIdx].classList.add('active');
    });
  });
}

async function loadThoughts(thoughts) {
  const container = document.getElementById('thoughts-container');
  if (!thoughts || thoughts.length === 0) {
    container.innerHTML = '<p class="empty-message">아직 사고창고가 비어있습니다.</p>';
    return;
  }

  container.innerHTML = '';

  for (const thought of thoughts) {
    const markdownHtml = await fetchMarkdown(`vault/thoughts/${thought.markdown}`);

    const html = `
      <article class="thought-card">
        <h3 class="thought-title">${thought.title}</h3>
        <div class="thought-content markdown-body">
          ${markdownHtml}
        </div>
      </article>
    `;

    container.insertAdjacentHTML('beforeend', html);
  }
}
