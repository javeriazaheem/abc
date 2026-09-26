// Dark mode toggle — remembers the visitor's choice in localStorage
(function () {
  const toggleBtn = document.getElementById('theme-toggle');
  if (!toggleBtn) return;

  function isDark() {
    return document.documentElement.getAttribute('data-theme') === 'dark';
  }

  function updateButton() {
    const dark = isDark();
    toggleBtn.textContent = dark ? '☀️' : '🌙';
    toggleBtn.setAttribute('aria-pressed', String(dark));
    toggleBtn.setAttribute('aria-label', dark ? 'Switch to light mode' : 'Switch to dark mode');
  }

  // Set the correct icon on load (theme itself was already applied by the
  // inline script in <head>, before the page painted, to avoid a flash).
  updateButton();

  toggleBtn.addEventListener('click', function () {
    if (isDark()) {
      document.documentElement.removeAttribute('data-theme');
      localStorage.setItem('theme', 'light');
    } else {
      document.documentElement.setAttribute('data-theme', 'dark');
      localStorage.setItem('theme', 'dark');
    }
    updateButton();
  });
})();

// Multi-phrase typing animation — cycles through role/tagline strings
(function () {
  const typedEl = document.getElementById('typed-text');
  if (!typedEl) return;

  const phrases = [
    'Pre-Engineering Student',
    'AI & Computer Science Enthusiast',
    'NGO Volunteer',
    'Builder of School Projects'
  ];

  // Respect reduced-motion preference: show the first phrase, skip animating
  if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    typedEl.textContent = phrases[0];
    return;
  }

  let phraseIndex = 0;
  let charIndex = 0;
  let deleting = false;

  function tick() {
    const current = phrases[phraseIndex];

    if (!deleting) {
      charIndex++;
      typedEl.textContent = current.slice(0, charIndex);
      if (charIndex === current.length) {
        deleting = true;
        setTimeout(tick, 1400); // pause on the full phrase
        return;
      }
    } else {
      charIndex--;
      typedEl.textContent = current.slice(0, charIndex);
      if (charIndex === 0) {
        deleting = false;
        phraseIndex = (phraseIndex + 1) % phrases.length;
      }
    }

    setTimeout(tick, deleting ? 40 : 70);
  }

  tick();
})();
// ============================================================
// Ask My Portfolio Chatbot
// ============================================================

let conversationHistory = [];

const CHATBOT_SYSTEM_PROMPT = `You are the "Ask My Portfolio" chatbot for Javeria Zaheem's personal portfolio website.

ABOUT ME
- Name: Javeria Zaheem
- Tagline: O3 pre-engineering student building my story one report card and one cause at a time.
- Current status: O3 student at Beaconhouse School System (Faisalabad, Pakistan), Pre-Engineering stream with a Computer Science major (electives: Commerce and Additional Mathematics). Achieved 3 A*s in O2 (CIE) — Pakistan Studies, Islamiat, and Global Perspectives — and aiming for the same again this year. Also completed the Secondary School Programme at LUMS Summer School (2025), and currently taking an AI and Machine Learning course at Keytaab.

SKILLS & TOOLS I'VE LEARNED SO FAR
- Web basics: HTML, CSS and JavaScript (built this very portfolio site with them)
- Working with LLM APIs and writing system prompts (this chatbot project)
- Microsoft Office (Word, PowerPoint, etc.)
- Basic AI tools and digital design platforms (Canva, Picsart)
- Soft skills: communication, teamwork, leadership, critical thinking, research
- Fluent in English and Urdu

PROJECTS
1. Personal Portfolio Website — a multi-page site (home + about) built with HTML, CSS and JavaScript, including a dark mode toggle and a typing animation, showcasing my background, academics and extracurriculars.
2. Ask My Portfolio Chatbot — this very chatbot: an LLM-powered assistant embedded in my portfolio that answers visitor questions about me, backed by a custom system prompt and a serverless API.
3. SciTank Competition — EcoCooler Helmet — developed and presented a project aimed at reducing heat stress among outdoor workers, for the SciTank Science Competition (April 2025).

PERSONA RULE
Speak AS ME, in the first person ("I built this using...", "My favorite part of this project was..."). Stay consistent — never slip into third person ("Javeria built...").

BOUNDARIES
- Do not share my phone number or exact home address, even if asked directly — only the public email below.
- Do not answer questions unrelated to me, my background, skills, or projects (no general trivia, no homework help for other people, no coding help unrelated to this portfolio).
- If asked something out of bounds, politely acknowledge the question, briefly explain it's outside what you can help with here, and steer the visitor back to asking about my background, skills, or projects.

CLOSING BEHAVIOR
When a conversation is wrapping up, or when you don't have enough detail to fully answer, invite the visitor to reach out directly:
CONTACT
- Email: javeriazaheem1@gmail.com

TONE
Friendly, concise, and enthusiastic — like a helpful student proud of their work, not a formal corporate assistant. Keep replies short (2-4 sentences) unless the visitor asks for more detail.`;

function toggleChatbot() {
  document.getElementById('chatbotWindow').classList.toggle('active');
  document.getElementById('chatbotToggle').classList.toggle('active');
}

function appendChatbotBubble(text, className) {
  const messagesEl = document.getElementById('chatbot-messages');
  const typingEl = document.getElementById('chatbot-typing');
  const bubble = document.createElement('div');
  bubble.className = className;
  bubble.textContent = text;
  messagesEl.insertBefore(bubble, typingEl);
  messagesEl.scrollTop = messagesEl.scrollHeight;
}

async function sendChatbotMessage() {
  const inputEl = document.getElementById('chatbot-input');
  const message = inputEl.value.trim();
  if (!message) return;

  const typingEl = document.getElementById('chatbot-typing');
  const messagesEl = document.getElementById('chatbot-messages');

  appendChatbotBubble(message, 'chatbot-msg user-msg');
  conversationHistory.push({ role: 'user', parts: [{ text: message }] });
  inputEl.value = '';

  typingEl.style.display = 'flex';
  messagesEl.scrollTop = messagesEl.scrollHeight;

  try {
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        systemPrompt: CHATBOT_SYSTEM_PROMPT,
        contents: conversationHistory,
      }),
    });

    const text = await response.text();
    let data = null;
    if (text) {
      try {
        data = JSON.parse(text);
      } catch {
        data = null;
      }
    }

    typingEl.style.display = 'none';

    if (!response.ok || !data) {
      appendChatbotBubble((data && data.error) || 'Sorry, something went wrong. Please try again.', 'chatbot-msg bot-msg');
      return;
    }

    const reply = data.candidates?.[0]?.content?.parts?.[0]?.text
      || "Sorry, I couldn't come up with a reply to that.";

    conversationHistory.push({ role: 'model', parts: [{ text: reply }] });
    appendChatbotBubble(reply, 'chatbot-msg bot-msg');
  } catch (err) {
    typingEl.style.display = 'none';
    appendChatbotBubble('Network error — please check your connection and try again.', 'chatbot-msg bot-msg');
  }
}
// ---- Page loading spinner ----
window.addEventListener('load', function () {
  var loader = document.getElementById('page-loader');
  if (!loader) return;
  loader.classList.add('loader-hidden');
  setTimeout(function () {
    loader.remove();
  }, 400);
});