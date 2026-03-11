/* ============================================
   Hyperstition For Animals — Essay Competition
   ============================================ */

// --- Supabase Configuration ---
const SUPABASE_URL = 'https://ioqerxfkaeojwqglpgat.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlvcWVyeGZrYWVvandxZ2xwZ2F0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMwOTc0ODcsImV4cCI6MjA4ODY3MzQ4N30.Xs77eZ3Go0taN7eU9aaFYrSJ5iyZHnCQqNJw0B3co1A';

const db = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// ─── Starfield Canvas ───
(function initStarfield() {
  const canvas = document.getElementById('starfield');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let width, height, stars;

  function resize() {
    width = canvas.width = canvas.offsetWidth;
    height = canvas.height = canvas.offsetHeight;
  }

  function createStars(count) {
    stars = [];
    for (let i = 0; i < count; i++) {
      stars.push({
        x: Math.random() * width,
        y: Math.random() * height,
        r: Math.random() * 1.4 + 0.2,
        a: Math.random() * 0.6 + 0.15,
        speed: Math.random() * 0.0004 + 0.0001,
        phase: Math.random() * Math.PI * 2,
      });
    }
  }

  function draw(time) {
    ctx.clearRect(0, 0, width, height);

    // Deep space gradient
    const grd = ctx.createRadialGradient(
      width * 0.4, height * 0.3, 0,
      width * 0.5, height * 0.5, Math.max(width, height) * 0.7
    );
    grd.addColorStop(0, '#151525');
    grd.addColorStop(0.4, '#0e0e18');
    grd.addColorStop(1, '#0d0d0f');
    ctx.fillStyle = grd;
    ctx.fillRect(0, 0, width, height);

    // Subtle nebula wash
    const neb = ctx.createRadialGradient(
      width * 0.7, height * 0.6, 0,
      width * 0.7, height * 0.6, width * 0.5
    );
    neb.addColorStop(0, 'rgba(90, 60, 140, 0.04)');
    neb.addColorStop(1, 'transparent');
    ctx.fillStyle = neb;
    ctx.fillRect(0, 0, width, height);

    // Stars with gentle twinkling
    for (const s of stars) {
      const twinkle = Math.sin(time * s.speed + s.phase) * 0.3 + 0.7;
      const alpha = s.a * twinkle;
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(220, 210, 195, ${alpha})`;
      ctx.fill();
    }

    requestAnimationFrame(draw);
  }

  resize();
  createStars(220);
  requestAnimationFrame(draw);

  window.addEventListener('resize', () => {
    resize();
    createStars(220);
  });
})();

// ─── DOM Elements ───
const form = document.getElementById('essayForm');
const essayText = document.getElementById('essayText');
const wordCountDisplay = document.getElementById('wordCount');
const submitBtn = document.getElementById('submitBtn');
const formMessage = document.getElementById('formMessage');

// ─── Word Count ───
function countWords(text) {
  const trimmed = text.trim();
  if (trimmed === '') return 0;
  return trimmed.split(/\s+/).length;
}

function updateWordCount() {
  const count = countWords(essayText.value);
  wordCountDisplay.textContent = count;

  const wordCountContainer = wordCountDisplay.parentElement;
  if (count > 2000) {
    wordCountContainer.classList.add('over-limit');
  } else {
    wordCountContainer.classList.remove('over-limit');
  }
}

essayText.addEventListener('input', updateWordCount);

// ─── Form Submission ───
form.addEventListener('submit', async (e) => {
  e.preventDefault();

  const wordCount = countWords(essayText.value);

  if (wordCount > 2000) {
    showMessage('Your essay exceeds the 2000-word limit. Please shorten it before submitting.', 'error');
    return;
  }

  if (wordCount === 0) {
    showMessage('Please write your essay before submitting.', 'error');
    return;
  }

  submitBtn.disabled = true;
  submitBtn.querySelector('span').textContent = 'Submitting...';
  hideMessage();

  const submission = {
    author_name: document.getElementById('authorName').value.trim(),
    email: document.getElementById('email').value.trim(),
    essay_title: document.getElementById('essayTitle').value.trim(),
    essay_text: essayText.value.trim(),
    word_count: wordCount,
    is_human_written_declaration: document.getElementById('humanWritten').checked,
  };

  try {
    const { error } = await db
      .from('submissions')
      .insert([submission]);

    if (error) throw error;

    showMessage(
      'Your essay has been submitted successfully. Thank you for contributing to a better future for animals.',
      'success'
    );
    form.reset();
    updateWordCount();
  } catch (err) {
    console.error('Submission error:', err);
    showMessage(
      'Something went wrong. Please try again or contact us if the problem persists.',
      'error'
    );
  } finally {
    submitBtn.disabled = false;
    submitBtn.querySelector('span').textContent = 'Submit Essay';
  }
});

// ─── Messages ───
function showMessage(text, type) {
  formMessage.textContent = text;
  formMessage.className = `form-message ${type}`;
  formMessage.hidden = false;
  formMessage.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

function hideMessage() {
  formMessage.hidden = true;
}

// ─── Mobile Nav Toggle ───
const navToggle = document.querySelector('.nav-toggle');
const navLinks = document.querySelector('.nav-links');

navToggle.addEventListener('click', () => {
  navLinks.classList.toggle('open');
});

navLinks.querySelectorAll('a').forEach((link) => {
  link.addEventListener('click', () => {
    navLinks.classList.remove('open');
  });
});
