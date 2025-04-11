document.addEventListener('DOMContentLoaded', function() {

    const body = document.body;
    const introShipContainer = document.getElementById('intro-ship-container');
    const introShip = document.getElementById('intro-ship');
    const introZap = document.getElementById('intro-zap-effect');
    const heroContent = document.querySelector('#hero .hero-content');
    const preloader = document.getElementById('preloader');

    // --- Preloader ---
    if (preloader) {
        window.addEventListener('load', () => { // Use 'load' to wait for images etc.
            preloader.classList.add('hidden');
            // Start intro animation *after* preloader is hidden
            setTimeout(startIntroAnimation, 50); // Short delay after preloader fades
        });
        // Fallback if load event fails
        setTimeout(() => {
             if (!preloader.classList.contains('hidden')) {
                 preloader.classList.add('hidden');
                 setTimeout(startIntroAnimation, 50);
             }
        }, 4000); // Max wait 4 seconds
    } else {
        // If no preloader, start animation almost immediately
        setTimeout(startIntroAnimation, 100);
    }

    // --- Intro Animation Trigger ---
    function startIntroAnimation() {
        if (!introShipContainer || !introShip || !heroContent) return; // Ensure elements exist

        body.classList.remove('preload'); // Allow scrolling later
        body.classList.add('intro-animation-active'); // Reveal ship container

        introShip.classList.add('ship-animate'); // Add class to trigger CSS animation

        // Listen for the end of the ship's animation
        introShip.addEventListener('animationend', handleShipAnimationEnd, { once: true });
    }

    function handleShipAnimationEnd() {
         // Trigger zap effect shortly after ship animation ends (near the end state)
         if (introZap) {
             introZap.classList.add('zap-effect-active');
             introZap.addEventListener('animationend', () => {
                // Reveal content after zap fades
                revealHeroContent();
             }, { once: true });
         } else {
            // If no zap effect element, reveal content directly
            revealHeroContent();
         }
    }

    function revealHeroContent() {
        if(heroContent) {
            heroContent.classList.add('content-reveal'); // Trigger content reveal
        }
        if (introShipContainer) {
             // Optionally hide the ship container after a delay
             setTimeout(() => {
                introShipContainer.style.display = 'none'; // Remove from layout
                body.classList.remove('intro-animation-active'); // Allow scrolling etc.
             }, 500); // Delay matches content reveal transition
        } else {
            body.classList.remove('intro-animation-active'); // Allow scrolling etc.
        }
    }


    // --- Reading Progress Bar ---
    const progressBar = document.getElementById('progress-bar');
    function updateProgressBar() {
        const totalScrollHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
        const scrolled = window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0;
        const scrollPercentage = totalScrollHeight > 0 ? (scrolled / totalScrollHeight) * 100 : 0;
        if(progressBar) progressBar.style.width = `${Math.min(100, Math.max(0, scrollPercentage))}%`;
    }

    // --- Update Footer Year ---
    const yearSpan = document.getElementById('year');
    if (yearSpan) { yearSpan.textContent = new Date().getFullYear(); }

    // --- Smooth Scrolling, Active Nav & MOBILE NAV TOGGLE ---
    const navElement = document.getElementById('main-nav');
    const navLinksContainer = document.getElementById('main-nav-links');
    const navLinks = navLinksContainer?.querySelectorAll('a[href^="#"]') || []; // Handle null container
    const mobileNavToggle = document.getElementById('mobile-nav-toggle');

    const progressBarHeight = document.getElementById('progress-container')?.offsetHeight || 0;
    let scrollOffset = 0;
    let activeLinkOffset = 0;

    function calculateOffsets() {
        const navHeight = (navElement ? navElement.offsetHeight : 0);
        scrollOffset = navHeight + progressBarHeight;
        activeLinkOffset = scrollOffset + 25;
    }
    calculateOffsets();

    // Mobile Nav Toggle Listener
    if (mobileNavToggle && navElement) {
        mobileNavToggle.addEventListener('click', () => {
            const isExpanded = mobileNavToggle.getAttribute('aria-expanded') === 'true';
            mobileNavToggle.setAttribute('aria-expanded', !isExpanded);
            navElement.classList.toggle('mobile-nav-active');
        });
    }

    // Close mobile menu & Smooth Scroll
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            if (navElement && navElement.classList.contains('mobile-nav-active')) {
                navElement.classList.remove('mobile-nav-active');
                if (mobileNavToggle) mobileNavToggle.setAttribute('aria-expanded', 'false');
            }
            const targetId = this.getAttribute('href');
            try {
                const targetElement = document.querySelector(targetId);
                if (targetElement) {
                    const targetPosition = targetElement.getBoundingClientRect().top + window.pageYOffset - scrollOffset;
                    window.scrollTo({ top: targetPosition, behavior: 'smooth' });
                } else { console.warn(`Target element not found: ${targetId}`); }
            } catch (error) { console.error(`Error scrolling to ${targetId}:`, error); }
        });
    });

    // Active Link Highlighting
    const sections = document.querySelectorAll('section[id]');
    function setActiveLink() {
        let currentSectionId = null;
        const currentScroll = window.pageYOffset;
        sections.forEach(section => {
            const sectionTop = section.offsetTop - activeLinkOffset;
            const sectionBottom = sectionTop + section.offsetHeight;
            if (currentScroll >= sectionTop && currentScroll < sectionBottom) { currentSectionId = section.getAttribute('id'); }
        });
        const bottomThreshold = document.documentElement.scrollHeight - window.innerHeight - 50;
        if (currentScroll >= bottomThreshold && sections.length > 0) { currentSectionId = sections[sections.length - 1].getAttribute('id'); }
        if (currentSectionId === null && currentScroll < (sections[0]?.offsetTop - activeLinkOffset) && sections.length > 0) { currentSectionId = sections[0].getAttribute('id'); }

        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${currentSectionId}`) { link.classList.add('active'); }
        });
    }

    // --- Scroll Animations (Intersection Observer) ---
    const observerOptions = { root: null, rootMargin: '0px', threshold: 0.15 };
    const observerCallback = (entries, observer) => { entries.forEach(entry => { if (entry.isIntersecting) { entry.target.classList.add('is-visible'); observer.unobserve(entry.target); } }); };
    const scrollObserver = new IntersectionObserver(observerCallback, observerOptions);
    const elementsToAnimate = document.querySelectorAll('.animate-on-scroll');
    elementsToAnimate.forEach(el => { scrollObserver.observe(el); });

    // --- Pink Bubble Animation ---
    const bubbleContainer = document.getElementById('bubble-container');
    if (bubbleContainer) {
        const bubbleColors = [ 'var(--bubble-pink-1)', 'var(--bubble-pink-2)', 'var(--bubble-pink-3)', 'rgba(253, 235, 242, 0.55)' ];
        function createBubble() {
            if (document.hidden) return;
            const bubble = document.createElement('div');
            bubble.classList.add('bubble');
            const size = Math.random() * 25 + 8; const duration = Math.random() * 8 + 10; const delay = Math.random() * 1.5;
            const leftPosition = Math.random() * 100; const color = bubbleColors[Math.floor(Math.random() * bubbleColors.length)];
            const drift = Math.random() * 40 - 20;
            bubble.style.width = `${size}px`; bubble.style.height = `${size}px`; bubble.style.left = `${leftPosition}%`;
            bubble.style.setProperty('--duration', `${duration}s`); bubble.style.setProperty('--delay', `${delay}s`); bubble.style.setProperty('--drift-x', `${drift}px`);
            bubble.style.backgroundColor = color;
            bubbleContainer.appendChild(bubble);
            setTimeout(() => { if (bubble.parentNode === bubbleContainer) { bubbleContainer.removeChild(bubble); } }, (duration + delay + 1.5) * 1000);
        }
        const bubbleInterval = setInterval(createBubble, 200);
    }

     // --- Chatbot Logic ---
    const chatToggleButton = document.getElementById('chat-toggle-button');
    const chatWindow = document.getElementById('chat-window');
    const chatCloseButton = document.getElementById('chat-close-button');
    const chatMessages = document.getElementById('chat-messages');
    const chatInput = document.getElementById('chat-input');
    const chatSendButton = document.getElementById('chat-send-button');

    const GROQ_API_KEY = 'YOUR_GROQ_API_KEY_HERE'; // <-- !!! REPLACE THIS !!!

    // ** UPDATED Context for Archana Ghei (Includes Personal Details) **
    const archanaGheiContext = `
        Archana Ghei is a Senior HR Specialist at Trilogy Innovations in Bengaluru, India (Joined Feb 2022, promoted Jul 2024). She's an AI Enthusiast focused on scaling people and processes. She previously worked in Training & Development at Turito, Talent Acquisition at WhiteHat Jr, and interned at Reliance Industries and HAL. Her education includes an MBA-HR from Cardiff Met Uni, PGDM-HR from Universal Business School, and a B.Eng in E&TC from MGM Nanded.

        **HR Philosophy & Mantra:** Engineer-turned-HR professional focused on scaling potential. Mantra: "Move fast, stay human, and build what lasts."

        **Key Responsibilities & Initiatives (Senior HR Specialist):** Strategic Workforce Planning, Data-Driven HR Analytics, Training & Perf Mgt., Leadership Development, Employee Relations, Process Standardization (Run Books).

        **HR Tech & Automation Projects (Senior Role):** Automated Attendance (GCal), AI Resume Shortlisting (ChatGPT, 60% accuracy), Predictive Hiring Analytics, Onboarding Automation (7d->3h).

        **Key Responsibilities & Initiatives (HR Specialist Role):** Campus recruitment (500+ unis), CodeAgon participation boost (50%), Dubai bootcamp redesign (42% cost save), Employee Awards, Onboarding (Atlassian), Recruitment (Salesforce), Global Hiring (Crossover), Partner Coordination (Scaler, Codeginal, Zamstars), Employee Grievances, Engagement activities.

        **HR Tech & Automation Projects (Specialist Role):** AI Video Creation, Staffing Doc Automation, Custom ATS (Google Sheets, 30-40% faster hire).

        **Core Skills:** HR Business Partnering, Org Performance Mgt, HR Analytics, Stakeholder Management, Global Talent Acquisition, L&D Strategy, Training Needs Analysis, HR Strategy, Problem Solving, Cross-functional Collab, Employee Engagement, Critical Thinking, D&I, Business Strategy, Strategic Planning, Attrition Analysis, Business Initiatives, Training & Development, Perf Mgt, Competency Analysis, Feedback Mgt, Onboarding Optimization.

        **Community Engagement & Insights:** Speaker at Manipal University Jaipur (AI, portfolios, communication for engineers), Participant at Games Gurukul UBS (skills via games), Met EPF Commissioner, Attended Think Tank at UBS.

        **Personal Notes:** She enjoys visiting Pune. She cares deeply for her mother and two siblings. Archana likes sharing photos and tweets reflecting her interests.

        **Contact:** LinkedIn (@archanaghei), Instagram (@archana_ghei).
    `;
    // --- End Archana Context ---

    function toggleChatWindow() {
        if(!chatWindow || !chatToggleButton) return;
        const isHidden = chatWindow.classList.toggle('hidden');
        chatToggleButton.classList.toggle('open', !isHidden);
        if (!isHidden && chatInput) { chatInput.focus(); }
    }

    function addMessage(text, sender) {
        if(!chatMessages) return;
        const messageDiv = document.createElement('div');
        messageDiv.classList.add('message', `${sender}-message`);
        const sanitizedText = text.replace(/</g, "<").replace(/>/g, ">");
        let formattedText = sanitizedText
            .replace(/\n\s*([\*\-])\s/g, '<br>• ')
            .replace(/^([\*\-])\s/g, '• ')
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*(.*?)\*/g, '<em>$1</em>')
            .replace(/\n/g, '<br>');
        messageDiv.innerHTML = formattedText;
        chatMessages.appendChild(messageDiv);
        requestAnimationFrame(() => { chatMessages.scrollTop = chatMessages.scrollHeight; });
     }

     function showTypingIndicator(show = true) {
        if(!chatMessages) return;
        let typingIndicator = chatMessages.querySelector('.typing');
        if (show && !typingIndicator) {
            typingIndicator = document.createElement('div');
            typingIndicator.classList.add('message', 'bot-message', 'typing');
            typingIndicator.innerHTML = 'Typing<span>.</span><span>.</span><span>.</span>';
            chatMessages.appendChild(typingIndicator);
            requestAnimationFrame(() => { chatMessages.scrollTop = chatMessages.scrollHeight; });
        } else if (!show && typingIndicator) { typingIndicator.remove(); }
    }

    async function sendMessageToGroq(message) {
        if (!GROQ_API_KEY || GROQ_API_KEY === 'YOUR_GROQ_API_KEY_HERE') { addMessage("Chatbot Error: API Key missing.", 'bot'); return; }
        if (!message || !message.trim()) return;
        if (!chatInput || !chatSendButton) return;

        addMessage(message, 'user');
        chatInput.value = ''; chatSendButton.disabled = true; showTypingIndicator(true);

        // ** UPDATED System Prompt **
        const systemPrompt = `You are a helpful AI assistant providing information ONLY based on the following context about Archana Ghei. Be concise and answer questions about her experience, skills, education, projects, and professional activities. Format lists clearly using bullet points ('• '). You can also briefly mention the personal notes provided if specifically asked (e.g., "Does she like Pune?", "Tell me about her family?"). If the question is outside the provided professional or personal context, politely state that you only have the information from her profile.

        Context:
        ${archanaGheiContext}`;

        try {
            const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
                method: "POST",
                headers: { "Authorization": `Bearer ${GROQ_API_KEY}`, "Content-Type": "application/json" },
                body: JSON.stringify({
                    model: "llama3-8b-8192",
                    messages: [ { role: "system", content: systemPrompt }, { role: "user", content: message } ],
                    temperature: 0.6, // Allow slightly more conversational tone
                    max_tokens: 350,
                })
            });
            showTypingIndicator(false);
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({ error: { message: 'Failed to parse error response' } }));
                console.error("Groq API Error:", response.status, errorData);
                addMessage(`Chatbot Error: ${errorData.error?.message || `HTTP ${response.status}`}`, 'bot');
            } else {
                const data = await response.json();
                const botReply = data.choices?.[0]?.message?.content;
                if (botReply) { addMessage(botReply.trim(), 'bot'); }
                else { addMessage("Sorry, I received an empty response.", 'bot'); console.error("Empty response content from Groq:", data); }
            }
        } catch (error) {
            showTypingIndicator(false); console.error("Error fetching Groq API:", error);
            addMessage("Chatbot Error: Could not connect. Please check console.", 'bot');
        } finally {
             if(chatSendButton) chatSendButton.disabled = false;
             if(chatInput) chatInput.focus();
        }
     }

    // Chatbot Event Listeners
    if(chatToggleButton) chatToggleButton.addEventListener('click', toggleChatWindow);
    if(chatCloseButton) chatCloseButton.addEventListener('click', toggleChatWindow);
    if(chatSendButton) chatSendButton.addEventListener('click', () => sendMessageToGroq(chatInput?.value));
    if(chatInput) chatInput.addEventListener('keypress', (e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessageToGroq(chatInput.value); } });

    // --- Initial calls and Event Listeners for Scroll & Resize ---
    updateProgressBar(); setActiveLink();
    let scrollTimeout;
    window.addEventListener('scroll', () => { if (!scrollTimeout) { scrollTimeout = setTimeout(() => { updateProgressBar(); setActiveLink(); scrollTimeout = null; }, 50); } }, { passive: true });
    window.addEventListener('resize', () => { calculateOffsets(); updateProgressBar(); setActiveLink(); });

}); // End DOMContentLoaded