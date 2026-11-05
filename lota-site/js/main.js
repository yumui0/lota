/* ═══════════════════════════════════════════════════════════════
   League of the Ancients  –  main.js
   ═══════════════════════════════════════════════════════════════ */

// ── Nav toggle (mobile) ────────────────────────────────────────
const navToggle = document.querySelector('.nav-toggle');
const navLinks  = document.querySelector('.navbar-links');
if (navToggle && navLinks) {
  navToggle.addEventListener('click', () => {
    navLinks.classList.toggle('open');
  });
}

// ── Active nav link ────────────────────────────────────────────
document.querySelectorAll('.navbar-links a').forEach(link => {
  if (link.href === window.location.href) link.classList.add('active');
});

// ── Upload zone drag & drop ────────────────────────────────────
const uploadZone = document.querySelector('.upload-zone');
const fileInput  = document.querySelector('#csv_file');
if (uploadZone && fileInput) {
  uploadZone.addEventListener('dragover', e => {
    e.preventDefault();
    uploadZone.classList.add('drag-over');
  });
  uploadZone.addEventListener('dragleave', () => {
    uploadZone.classList.remove('drag-over');
  });
  uploadZone.addEventListener('drop', e => {
    e.preventDefault();
    uploadZone.classList.remove('drag-over');
    if (e.dataTransfer.files.length) {
      fileInput.files = e.dataTransfer.files;
      updateFileLabel(e.dataTransfer.files[0].name);
    }
  });
  fileInput.addEventListener('change', () => {
    if (fileInput.files.length) updateFileLabel(fileInput.files[0].name);
  });
}
function updateFileLabel(name) {
  const label = document.querySelector('.upload-file-name');
  if (label) label.textContent = name;
}

// ── Animate votes bars on result page ─────────────────────────
window.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.votes-bar-inner[data-width]').forEach(bar => {
    setTimeout(() => {
      bar.style.width = bar.dataset.width + '%';
    }, 300);
  });
});

// ── Form validation hints ──────────────────────────────────────
document.querySelectorAll('input[type="number"]').forEach(input => {
  input.addEventListener('input', () => {
    const val = parseFloat(input.value);
    const min = parseFloat(input.min);
    const max = parseFloat(input.max);
    if (!isNaN(min) && val < min) input.style.borderColor = '#e74c3c';
    else if (!isNaN(max) && val > max) input.style.borderColor = '#e67e22';
    else input.style.borderColor = '';
  });
});

// ── Particle shimmer on hero ───────────────────────────────────
const heroContent = document.querySelector('.hero-content');
if (heroContent) {
  heroContent.querySelectorAll('*').forEach((el, i) => {
    el.style.animationDelay = (i * 0.12) + 's';
    el.classList.add('animate-fade-up');
  });
}

// ── Results table search filter ────────────────────────────────
const tableSearch = document.querySelector('#table-search');
if (tableSearch) {
  tableSearch.addEventListener('input', () => {
    const q = tableSearch.value.toLowerCase();
    document.querySelectorAll('.results-table tbody tr').forEach(row => {
      row.style.display = row.textContent.toLowerCase().includes(q) ? '' : 'none';
    });
  });
}
