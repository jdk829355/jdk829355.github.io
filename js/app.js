// app.js

document.addEventListener("DOMContentLoaded", () => {
	initNavigation();
	initScrollBehavior();
	initTypewriter();
	initEmailCopy();
	initLightbox();
	initProjectModal();
	initVaultLoading();
});

// Configure Marked.js options
if (window.marked) {
	window.marked.setOptions({
		breaks: true,
		gfm: true,
	});
} else {
	console.error("Marked.js not loaded");
}

function highlightMarkdown(container) {
	if (!window.hljs || !container) return;

	container.querySelectorAll("pre code").forEach((block) => {
		const languageClass = Array.from(block.classList).find((className) =>
			className.startsWith("language-"),
		);
		if (languageClass) {
			block.classList.replace(languageClass, languageClass.toLowerCase());
		}
		window.hljs.highlightElement(block);
	});
}

function escapeHtml(value) {
	return String(value).replace(
		/[&<>"']/g,
		(char) =>
			({
				"&": "&amp;",
				"<": "&lt;",
				">": "&gt;",
				'"': "&quot;",
				"'": "&#39;",
			})[char],
	);
}

function htmlToFragment(html) {
	const documentFromHtml = new DOMParser().parseFromString(
		String(html),
		"text/html",
	);
	documentFromHtml
		.querySelectorAll("script, object, embed")
		.forEach((element) => element.remove());
	const executableProtocol = ["java", "script:"].join("");
	documentFromHtml.querySelectorAll("*").forEach((element) => {
		for (const attribute of [...element.attributes]) {
			const value = attribute.value.trim().toLowerCase();
			if (
				attribute.name.toLowerCase().startsWith("on") ||
				value.startsWith(executableProtocol)
			) {
				element.removeAttribute(attribute.name);
			}
		}
	});

	const fragment = document.createDocumentFragment();
	fragment.append(...documentFromHtml.body.childNodes);
	return fragment;
}

function replaceHtml(container, html) {
	container.replaceChildren(htmlToFragment(html));
}

function appendHtml(container, html) {
	container.append(htmlToFragment(html));
}

// Navigation Handling
function initNavigation() {
	const links = document.querySelectorAll(".nav-link");
	const pages = document.querySelectorAll(".page");

	// Simple routing based on hash
	function handleRoute() {
		const hash = window.location.hash || "#about";
		const legacyAboutHashes = new Set([
			"#about-badge-b",
			"#about-badge-c",
			"#certifications",
		]);
		const pageHash = legacyAboutHashes.has(hash) ? "#about" : hash;
		const targetId = pageHash.replace("#", "") + "-page";

		links.forEach((link) => {
			if (link.getAttribute("href") === pageHash) {
				link.classList.add("active");
			} else {
				link.classList.remove("active");
			}
		});

		pages.forEach((page) => {
			if (page.id === targetId) {
				page.classList.add("active");
			} else {
				page.classList.remove("active");
			}
		});
	}

	window.addEventListener("hashchange", handleRoute);

	// Clean URL if no hash defaults to about
	if (!window.location.hash) {
		window.history.replaceState(null, null, "#about");
	}
	handleRoute();
}

function initScrollBehavior() {
	const nav = document.querySelector(".top-nav");
	const aboutPage = document.querySelector("#about-page");
	if (!nav || !aboutPage) return;

	let previousScrollY = window.scrollY;
	let ticking = false;

	function showNavigation() {
		nav.classList.remove("nav-hidden");
		document.body.classList.remove("nav-is-hidden");
	}

	function updateNavigation() {
		const currentScrollY = window.scrollY;
		const delta = currentScrollY - previousScrollY;
		const aboutIsActive = aboutPage.classList.contains("active");

		if (!aboutIsActive || currentScrollY < 48) {
			showNavigation();
		} else if (Math.abs(delta) >= 6) {
			const shouldHide = delta > 0;
			nav.classList.toggle("nav-hidden", shouldHide);
			document.body.classList.toggle("nav-is-hidden", shouldHide);
		}

		previousScrollY = currentScrollY;
		ticking = false;
	}

	window.addEventListener(
		"scroll",
		() => {
			if (ticking) return;
			ticking = true;
			window.requestAnimationFrame(updateNavigation);
		},
		{ passive: true },
	);
	window.addEventListener("hashchange", showNavigation);
}

// Fetch and load data
async function fetchVaultIndex() {
	const cacheBuster = `?t=${new Date().getTime()}`;
	try {
		const res = await fetch(`vault/index.json${cacheBuster}`);
		if (!res.ok) throw new Error("Cannot load vault/index.json");
		return await res.json();
	} catch (error) {
		console.error("Error loading vault data:", error);
		const container = document.querySelector("#about-markdown-container");
		const message = document.createElement("p");
		message.textContent = "데이터를 불러오는데 실패했습니다.";
		container.replaceChildren(message);
		return null;
	}
}

async function initVaultLoading() {
	const data = await fetchVaultIndex();
	if (!data) return;

	await Promise.all([
		loadAbout(data.about, data.profile_image),
		loadProjects(data.projects),
	]);

	let thoughtsLoaded = false;
	const loadThoughtsOnce = () => {
		if (thoughtsLoaded) return;
		thoughtsLoaded = true;
		loadThoughts(data.thoughts);
	};

	if (window.location.hash === "#thoughts") {
		loadThoughtsOnce();
	}

	window.addEventListener("hashchange", () => {
		if (window.location.hash === "#thoughts") {
			loadThoughtsOnce();
		}
	});

	if ("IntersectionObserver" in window) {
		const thoughtsSection = document.getElementById("thoughts-page");
		if (thoughtsSection) {
			const observer = new IntersectionObserver(
				(entries, obs) => {
					const isVisible = entries.some((entry) => entry.isIntersecting);
					if (isVisible) {
						loadThoughtsOnce();
						obs.disconnect();
					}
				},
				{ rootMargin: "200px" },
			);
			observer.observe(thoughtsSection);
		}
	}
}

async function fetchMarkdown(path) {
	const cacheBuster = `?t=${new Date().getTime()}`;
	try {
		// 경로의 마지막 슬래시 이후 부분(파일명)만 encodeURIComponent 처리
		const pathParts = path.split("/");
		const filename = pathParts.pop();
		const encodedPath =
			pathParts.join("/") + "/" + encodeURIComponent(filename);

		const res = await fetch(encodedPath + cacheBuster);
		if (!res.ok) throw new Error(`Failed to load ${path}`);
		let text = await res.text();

		// YAML Frontmatter 제거 (더 유연한 정규식)
		text = text.replace(/^---\s*[\s\S]*?---\s*/m, "");

		// Obsidian style image syntax ![[image.png]] 지원을 위한 전처리
		text = text.replace(
			/!\[\[(.*?)\]\]/g,
			(_match, p1) => `![${p1}](${encodeURI("vault/images/" + p1)})`,
		);

		// ![image.png] 형식 (뒤에 괄호 경로가 없는 순수 파일명 패턴) 지원을 위한 전처리
		text = text.replace(
			/!\[([^\]]+)\](?!\()/g,
			(_match, p1) => `![${p1}](${encodeURI("vault/images/" + p1)})`,
		);

		return window.marked.parse(text);
	} catch (e) {
		console.error(e);
		return `<p>내용을 불러올 수 없습니다. (${path})</p>`;
	}
}

async function loadAbout(aboutPath, profileImage) {
	if (!aboutPath) return;
	const html = await fetchMarkdown(`vault/${aboutPath}`);
	const container = document.querySelector("#about-markdown-container");
	const markdownBody = document.createElement("div");
	markdownBody.className = "markdown-body";
	markdownBody.append(htmlToFragment(html));
	container.replaceChildren(markdownBody);
	highlightMarkdown(container);

	if (profileImage) {
		const photoContainer = document.querySelector(".profile-photo");
		const image = document.createElement("img");
		image.src = `vault/images/${encodeURI(profileImage)}`;
		image.alt = "프로필 사진";
		photoContainer.replaceChildren(image);
		photoContainer.style.border = "none";
	}
}

async function loadProjects(projects) {
	const container = document.querySelector("#projects-container");
	if (!projects || projects.length === 0) {
		const message = document.createElement("p");
		message.className = "empty-message";
		message.textContent = "아직 프로젝트가 없습니다.";
		container.replaceChildren(message);
		return;
	}

	container.replaceChildren();

	const [firstProject, ...restProjects] = projects;
	if (firstProject) {
		const html = await renderProject(firstProject);
		appendHtml(container, html);
		initProjectCarousel(firstProject);
		highlightMarkdown(container);
	}

	if (restProjects.length > 0) {
		const placeholder = document.createElement("div");
		placeholder.className = "project-placeholder";
		container.appendChild(placeholder);

		const loadRemaining = async () => {
			for (const proj of restProjects) {
				const html = await renderProject(proj);
				appendHtml(container, html);
				initProjectCarousel(proj);
			}
			placeholder.remove();
			highlightMarkdown(container);
			checkDescriptions();
		};

		if ("IntersectionObserver" in window) {
			const observer = new IntersectionObserver(
				(entries, obs) => {
					const isVisible = entries.some(
						(entry) => entry.isIntersecting || entry.intersectionRatio > 0,
					);
					if (isVisible) {
						loadRemaining();
						obs.disconnect();
					}
				},
				{ rootMargin: "600px 0px" },
			);
			observer.observe(placeholder);
		} else {
			loadRemaining();
		}

		setTimeout(() => {
			if (placeholder.isConnected) {
				loadRemaining();
			}
		}, 1500);
	}

	checkDescriptions();
}

async function renderProject(proj) {
	const cacheBuster = `?t=${new Date().getTime()}`;
	const safeId = proj.id.replace(/[^a-z0-9]/gi, "_");
	let markdownHtml = "";

	try {
		const res = await fetch(
			`vault/projects/${encodeURIComponent(proj.markdown)}${cacheBuster}`,
		);
		if (res.ok) {
			let text = await res.text();
			text = text.replace(/^---\s*[\s\S]*?---\s*/m, "");
			text = text.replace(/^github:\s*.*$/gim, "");
			text = text.replace(/!\[\[(.*?)\]\]/g, "");
			text = text.replace(/!\[([^\]]*)\](?!\()/g, "");
			text = text.replace(/!\[.*?\]\((.*?)\)/g, "");

			if (!window.marked) {
				markdownHtml = `<p>Error: Marked.js not loaded.</p><pre>${text}</pre>`;
			} else {
				markdownHtml = (window.marked.parse || window.marked)(text);
			}
		} else {
			markdownHtml = `<p class="error-message">내용을 불러올 수 없습니다. (Status: ${res.status})</p>`;
			console.warn(
				`Fetch failed: ${res.status} for vault/projects/${proj.markdown}`,
			);
		}
	} catch (e) {
		markdownHtml = `<p class="error-message">내용 로드 중 오류가 발생했습니다.</p>`;
		console.error(`Error fetching project markdown: ${proj.markdown}`, e);
	}

	let imagesHtml = "";
	if (proj.images && proj.images.length > 0) {
		const firstImage = proj.images[0];
		imagesHtml += `<img src="vault/images/${encodeURI(firstImage)}" class="active" data-idx="0" alt="${proj.title} 이미지" loading="lazy" decoding="async" fetchpriority="low">`;
	} else {
		imagesHtml = '<div class="photo-placeholder">사진이 없습니다.</div>';
	}

	return `
    <article class="project-card" data-project-id="${safeId}">
      <div class="project-carousel" id="carousel-${safeId}" data-images="${encodeURIComponent(JSON.stringify(proj.images || []))}">
        ${imagesHtml}
        ${
					proj.images && proj.images.length > 1
						? `
          <button class="carousel-arrow carousel-arrow-prev" aria-label="이전 사진">
            <svg class="icon" aria-hidden="true"><use href="#icon-caret-left"></use></svg>
          </button>
          <button class="carousel-arrow carousel-arrow-next" aria-label="다음 사진">
            <svg class="icon" aria-hidden="true"><use href="#icon-caret-right"></use></svg>
          </button>
        `
						: ""
				}
      </div>
      <div class="project-content">
        <div class="project-header">
          <div class="project-title-area">
            <h3 class="project-title">${proj.title}</h3>
            ${
							proj.tags && proj.tags.length > 0
								? `
              <div class="project-tags">
                ${proj.tags.map((tag) => `<span class="project-tag">#${tag}</span>`).join("")}
              </div>
            `
								: ""
						}
          </div>
          ${
						proj.github
							? `
            <a href="${proj.github}" target="_blank" rel="noopener noreferrer" class="github-link">
              <svg class="icon" aria-hidden="true"><use href="#icon-github"></use></svg>
            </a>
          `
							: ""
					}
        </div>
        <div class="project-description markdown-body">
          ${markdownHtml}
        </div>
      </div>
    </article>
  `;
}

function initProjectCarousel(proj) {
	if (proj.images && proj.images.length > 1) {
		const safeId = proj.id.replace(/[^a-z0-9]/gi, "_");
		const carouselEl = document.getElementById(`carousel-${safeId}`);
		if (carouselEl) initCarousel(carouselEl);
	}
}

function checkDescriptions() {
	const descriptions = document.querySelectorAll(".project-description");
	descriptions.forEach((desc) => {
		// 렌더링 타이밍을 위해 약간의 지연 후 체크
		setTimeout(() => {
			if (desc.scrollHeight > 250) {
				desc.classList.add("clamped");
				if (!desc.parentNode.querySelector(".read-more-btn")) {
					const btn = document.createElement("button");
					btn.className = "read-more-btn";
					btn.textContent = "더보기";
					desc.parentNode.appendChild(btn);
				}
			}
		}, 100);
	});
}

function initCarousel(carouselElement) {
	let imagesData = [];
	if (carouselElement.dataset.images) {
		try {
			imagesData = JSON.parse(
				decodeURIComponent(carouselElement.dataset.images),
			);
		} catch (error) {
			console.error("Invalid carousel image data:", error);
		}
	}
	const totalImages = imagesData.length;
	const existingImages = carouselElement.querySelectorAll("img");
	existingImages.forEach((img, idx) => {
		if (idx !== 0) img.remove();
	});
	let current = 0;

	function showImage(idx) {
		const currentImages = carouselElement.querySelectorAll("img");
		currentImages.forEach((i) => i.classList.remove("active"));
		let target = carouselElement.querySelector(`img[data-idx="${idx}"]`);
		if (!target && imagesData[idx]) {
			target = document.createElement("img");
			target.src = `vault/images/${encodeURI(imagesData[idx])}`;
			target.alt = `${carouselElement.closest(".project-card")?.querySelector(".project-title")?.textContent || "프로젝트"} 이미지`;
			target.dataset.idx = idx;
			target.loading = "lazy";
			target.decoding = "async";
			target.fetchPriority = "low";
			target.className = "active";
			carouselElement.appendChild(target);
		}
		if (target) target.classList.add("active");
		current = idx;
	}

	const prev = carouselElement.querySelector(".carousel-arrow-prev");
	const next = carouselElement.querySelector(".carousel-arrow-next");

	if (prev) {
		prev.addEventListener("click", () => {
			if (totalImages === 0) return;
			showImage((current - 1 + totalImages) % totalImages);
		});
	}
	if (next) {
		next.addEventListener("click", () => {
			if (totalImages === 0) return;
			showImage((current + 1) % totalImages);
		});
	}
}

async function loadThoughts(thoughts) {
	const container = document.querySelector("#thoughts-container");
	if (!thoughts || thoughts.length === 0) {
		const message = document.createElement("p");
		message.className = "empty-message";
		message.textContent = "아직 사고창고가 비어있습니다.";
		container.replaceChildren(message);
		return;
	}

	container.replaceChildren();
	const categories = [
		...new Set(thoughts.map((thought) => thought.category || "기타")),
	];

	appendHtml(
		container,
		`
    <div class="thought-category-filter" role="group" aria-label="사고창고 카테고리 필터">
      <button class="thought-category-button active" type="button" data-category="all" aria-pressed="true">전체</button>
      ${categories
				.map(
					(category) => `
        <button class="thought-category-button" type="button" data-category="${escapeHtml(category)}" aria-pressed="false">${escapeHtml(category)}</button>
      `,
				)
				.join("")}
    </div>
  `,
	);

	for (const [index, thought] of thoughts.entries()) {
		const markdownHtml = await fetchMarkdown(
			`vault/thoughts/${thought.markdown}`,
		);
		const contentId = `thought-content-${index}`;
		const category = thought.category || "기타";

		const html = `
      <article class="thought-card" data-category="${escapeHtml(category)}">
        <button class="thought-toggle" type="button" aria-expanded="false" aria-controls="${contentId}">
          <span class="thought-title-group">
            <span class="thought-category-label">${escapeHtml(category)}</span>
            <span class="thought-title">${escapeHtml(thought.title)}</span>
          </span>
          <span class="thought-toggle-icon" aria-hidden="true"></span>
        </button>
        <div class="thought-content markdown-body" id="${contentId}" hidden>
          ${markdownHtml}
        </div>
      </article>
    `;

		appendHtml(container, html);
	}

	highlightMarkdown(container);

	container.addEventListener("click", (event) => {
		const toggle = event.target.closest(".thought-toggle");
		if (!toggle || !container.contains(toggle)) return;

		const content = document.getElementById(
			toggle.getAttribute("aria-controls"),
		);
		if (!content) return;

		const isExpanded = toggle.getAttribute("aria-expanded") === "true";
		toggle.setAttribute("aria-expanded", String(!isExpanded));
		content.hidden = isExpanded;
	});

	container.addEventListener("click", (event) => {
		const categoryButton = event.target.closest(".thought-category-button");
		if (!categoryButton || !container.contains(categoryButton)) return;

		const selectedCategory = categoryButton.dataset.category;
		container.querySelectorAll(".thought-category-button").forEach((button) => {
			const isActive = button === categoryButton;
			button.classList.toggle("active", isActive);
			button.setAttribute("aria-pressed", String(isActive));
		});

		container.querySelectorAll(".thought-card").forEach((card) => {
			card.hidden =
				selectedCategory !== "all" &&
				card.dataset.category !== selectedCategory;
		});
	});
}

// ===================== Project Detail Modal =====================
function initProjectModal() {
	const modal = document.getElementById("project-modal");
	const modalTitle = document.getElementById("modal-project-title");
	const modalBody = document.getElementById("modal-project-body");
	const closeBtn = document.getElementById("modal-close");

	if (!modal) return;

	function openModal(title, sourceElement) {
		modalTitle.textContent = title;
		modalBody.replaceChildren(
			...[...sourceElement.childNodes].map((node) => node.cloneNode(true)),
		);
		modal.classList.add("open");
		document.body.style.overflow = "hidden";
	}

	function closeModal() {
		modal.classList.remove("open");
		document.body.style.overflow = "";
		setTimeout(() => {
			modalBody.replaceChildren();
		}, 300);
	}

	// 더보기 버튼 클릭 감지 (위임)
	document.addEventListener("click", (e) => {
		if (e.target.classList.contains("read-more-btn")) {
			const card = e.target.closest(".project-card");
			if (card) {
				const title = card.querySelector(".project-title").textContent;
				const description = card.querySelector(".project-description");
				openModal(title, description);
			}
		}
	});

	closeBtn.addEventListener("click", closeModal);
	modal.addEventListener("click", (e) => {
		if (e.target === modal) closeModal();
	});
	document.addEventListener("keydown", (e) => {
		if (e.key === "Escape" && modal.classList.contains("open")) closeModal();
	});
}

// ===================== Lightbox =====================
function initLightbox() {
	const lightbox = document.getElementById("lightbox");
	const lightboxImg = document.getElementById("lightbox-img");
	const closeBtn = document.getElementById("lightbox-close");

	function openLightbox(src, alt) {
		lightboxImg.src = src;
		lightboxImg.alt = alt || "확대 이미지";
		lightbox.classList.add("open");
		document.body.style.overflow = "hidden";
	}

	function closeLightbox() {
		lightbox.classList.remove("open");
		document.body.style.overflow = "";
		lightboxImg.src = "";
	}

	// 클릭 이벤트 위임: .project-carousel img, .profile-photo img 전부 감지
	document.addEventListener("click", (e) => {
		const img = e.target.closest(".project-carousel img, .profile-photo img");
		if (img) {
			openLightbox(img.src, img.alt);
		}
	});

	// 닫기 버튼
	closeBtn.addEventListener("click", closeLightbox);

	// 배경 클릭 시 닫기
	lightbox.addEventListener("click", (e) => {
		if (e.target === lightbox) closeLightbox();
	});

	// ESC 키로 닫기
	document.addEventListener("keydown", (e) => {
		if (e.key === "Escape" && lightbox.classList.contains("open"))
			closeLightbox();
	});
}

function initEmailCopy() {
	const btn = document.getElementById("copy-email-btn");
	const toast = document.getElementById("copy-toast");
	if (!btn || !toast) return;

	let toastTimer;
	btn.addEventListener("click", () => {
		navigator.clipboard.writeText("jdk829355@gmail.com").then(() => {
			toast.classList.add("visible");
			clearTimeout(toastTimer);
			toastTimer = setTimeout(() => toast.classList.remove("visible"), 1500);
		});
	});
}

// ===================== Typewriter Effect =====================
function initTypewriter() {
	const elements = document.querySelectorAll(".typewriter-text");

	elements.forEach((titleElement) => {
		// HTML에 적힌 원본 텍스트를 저장하고 화면에서 지움
		const textToType = titleElement.textContent.trim();
		titleElement.textContent = "";

		let i = 0;
		function typeWriter() {
			if (i < textToType.length) {
				titleElement.textContent += textToType.charAt(i);
				i++;
				const speed = Math.random() * 50 + 70;
				setTimeout(typeWriter, speed);
			}
		}

		setTimeout(typeWriter, 400);
	});
}
