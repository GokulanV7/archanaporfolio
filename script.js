document.addEventListener('DOMContentLoaded', function() {

    // --- Preloader ---
    const preloader = document.getElementById('preloader');
    if (preloader) {
        window.onload = () => { preloader.classList.add('hidden'); };
        setTimeout(() => { if (!preloader.classList.contains('hidden')) { preloader.classList.add('hidden'); } }, 3000);
    }

    // --- Reading Progress Bar ---
    const progressBar = document.getElementById('progress-bar');
    function updateProgressBar() {
        const totalScrollHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
        const scrolled = window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0;
        const scrollPercentage = totalScrollHeight > 0 ? (scrolled / totalScrollHeight) * 100 : 0;
        progressBar.style.width = `${Math.min(100, Math.max(0, scrollPercentage))}%`;
    }

    // --- Update Footer Year ---
    const yearSpan = document.getElementById('year');
    if (yearSpan) { yearSpan.textContent = new Date().getFullYear(); }

    // --- Smooth Scrolling, Active Nav & MOBILE NAV TOGGLE ---
    const navElement = document.getElementById('main-nav'); // Use ID for nav
    const navLinksContainer = document.getElementById('main-nav-links'); // Get the UL container
    const navLinks = navLinksContainer.querySelectorAll('a[href^="#"]'); // Target links within the UL
    const mobileNavToggle = document.getElementById('mobile-nav-toggle');

    const progressBarHeight = document.getElementById('progress-container')?.offsetHeight || 0;
    let scrollOffset = 0;
    let activeLinkOffset = 0;

    function calculateOffsets() {
        const navHeight = (navElement ? navElement.offsetHeight : 0);
        scrollOffset = navHeight + progressBarHeight;
        activeLinkOffset = scrollOffset + 25; // Add buffer for active link detection
    }
    calculateOffsets(); // Initial calculation

    // Mobile Nav Toggle Listener
    if (mobileNavToggle && navElement) { // Check if elements exist
        mobileNavToggle.addEventListener('click', () => {
            const isExpanded = mobileNavToggle.getAttribute('aria-expanded') === 'true';
            mobileNavToggle.setAttribute('aria-expanded', !isExpanded);
            navElement.classList.toggle('mobile-nav-active'); // Toggle class on NAV element
        });
    }

    // Close mobile menu when a link inside it is clicked & Smooth Scroll
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();

            // Close mobile menu if active
            if (navElement && navElement.classList.contains('mobile-nav-active')) {
                navElement.classList.remove('mobile-nav-active');
                if (mobileNavToggle) {
                    mobileNavToggle.setAttribute('aria-expanded', 'false');
                }
            }

            // Smooth Scroll Logic
            const targetId = this.getAttribute('href');
            try { // Add try-catch for robustness
                const targetElement = document.querySelector(targetId);
                if (targetElement) {
                    const targetPosition = targetElement.getBoundingClientRect().top + window.pageYOffset - scrollOffset;
                    window.scrollTo({ top: targetPosition, behavior: 'smooth' });
                } else {
                    console.warn(`Target element not found for selector: ${targetId}`);
                }
            } catch (error) {
                console.error(`Error finding or scrolling to element ${targetId}:`, error);
            }
        });
    });

    // Active Link Highlighting Logic
    const sections = document.querySelectorAll('section[id]');
    function setActiveLink() {
        let currentSectionId = null;
        const currentScroll = window.pageYOffset;

        sections.forEach(section => {
            const sectionTop = section.offsetTop - activeLinkOffset;
            const sectionBottom = sectionTop + section.offsetHeight;
             if (currentScroll >= sectionTop && currentScroll < sectionBottom) {
                 currentSectionId = section.getAttribute('id');
             }
        });

         const bottomThreshold = document.documentElement.scrollHeight - window.innerHeight - 50;
         if (currentScroll >= bottomThreshold && sections.length > 0) {
             currentSectionId = sections[sections.length - 1].getAttribute('id');
         }
         if (currentSectionId === null && currentScroll < (sections[0]?.offsetTop - activeLinkOffset) && sections.length > 0) {
             currentSectionId = sections[0].getAttribute('id');
         }

        // Update active class only on the links within the main nav list
        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${currentSectionId}`) {
                link.classList.add('active');
            }
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

    const GROQ_API_KEY = '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'; // <-- !!! REPLACE THIS !!!

    // Context for Archana Ghei (Keep the full context string here)
    const archanaGheiContext = ` Archana Ghei is a Senior HR Specialist at Trilogy Innovations, based in Bengaluru, Karnataka, India. She joined Trilogy Innovations in February 2022 and was promoted to Senior HR Specialist in July 2024 (total time at Trilogy: 3 yrs 3 mos+). She is an AI Enthusiast focused on hiring the future and building scalable people and processes. Her background includes a Bachelor of Engineering in Electronics and Telecommunications from MGM's College of Engineering, Nanded (2015-2019), a PGDM in HR from Universal Business School (2019-2020), and an MBA in HR from Cardiff Metropolitan University (2019-2020). **HR Philosophy & Mantra:** Engineer-turned-HR professional focused on scaling potential in people, processes, and performance. Mantra: "Move fast, stay human, and build what lasts." **Key Responsibilities & Initiatives at Trilogy Innovations (Senior HR Specialist Role):** *   Strategic Workforce Planning: Partnering with leadership on talent gaps, succession plans, aligning HR strategies. *   Data-Driven HR Analytics: Analyzing performance trends, attrition risks, engagement levels for decision-making. *   Training & Performance Management: Designing/conducting training (interns & FTEs), managing appraisals, project allocations. *   Leadership Development: Facilitating performance management training for leadership teams. *   Employee Relations & Crisis Management: Resolving complex ER issues, ensuring business continuity (e.g., during recession). *   Process Standardization: Developed Run Books for campus recruitment, internships, TI Bootcamp onboarding. **HR Tech & Automation Projects (Senior Role):** *   Automated Attendance System: Integrated with Google Calendar. *   AI-Powered Resume Shortlisting: ChatGPT-based tool (60% accuracy). *   Predictive Hiring Analytics: AI model for forecasting hiring needs. *   Onboarding Process Automation: Reduced admin time from 7 days to 3 hours. **Key Responsibilities & Initiatives at Trilogy Innovations (HR Specialist Role - Feb 2022 - Jun 2024):** *   Led end-to-end recruitment (500+ universities), increasing hires 2022-2023. *   Increased CodeAgon hackathon participation by 50% (1L to 1.5L). *   Redesigned Dubai onboarding bootcamp (42.51% cost-saving). *   Led Annual Employee Awards planning & execution. *   Managed onboarding (Atlassian), recruitment (Salesforce), global hiring (Crossover). *   Coordinated with partners: Scaler (InterviewBit), Codeginal, Zamstars. *   Primary contact for employee grievances, drove engagement activities. **HR Tech & Automation Projects (Specialist Role):** *   AI-Driven Video Creation for events/awards. *   Project Staffing Documentation Automation. *   Developed Custom ATS on Google Sheets (Reduced time-to-hire 30-40%). **Previous Experience:** *   Turito (Apr 2021 - Jan 2022): Training and Development Lead (L&D, induction, trainer onboarding/management, feedback). *   WhiteHat Jr (Aug 2020 - Mar 2021): Talent Acquisition Specialist. *   Reliance Industries Limited (Apr 2020 - Jul 2020): HR Intern (Research on Learning Academies, data analysis, stakeholder engagement). *   ExCoLearn Pvt. Ltd. (Jul 2019 - Mar 2020): Marketing Executive (Part-time). *   Hindustan Aeronautics Limited (Jun 2018 - Jul 2018): Internship Trainee. *   Superprof (Jan 2017 - May 2018): ESOL Instructor (Freelance). **Core Skills:** HR Business Partnering, Organizational Performance Management, HR Analytics, Stakeholder Management, Global Talent Acquisition, L&D Strategy, Training Needs Analysis, HR Strategy, Problem Solving, Cross-functional Collaborations, Employee Engagement, Critical Thinking, Diversity & Inclusion, Business Strategy, Strategic Planning, Attrition Analysis, Business Initiatives, Training & Development, Performance Management, Competency Analysis, Feedback Management, Onboarding Optimization. **Community Engagement & Insights:** *   Spoke at Manipal University Jaipur about AI in careers, portfolio importance, communication skills. Key message: Master AI collaboration, don't fear replacement. *   Participated in Games Gurukul at UBS (games for skill-building). *   Met EPF Commissioner Mr. R. K. Sahoo. *   Attended Think Tank session at UBS with Tarun Anand sir. **Contact:** LinkedIn (@archanaghei), Instagram (@archana_ghei). `;

    // --- Chatbot Functions (toggleChatWindow, addMessage, showTypingIndicator, sendMessageToGroq) ---
    // Keep these functions exactly as they were in the previous complete JS response.
    // They handle opening/closing the chat, adding messages, showing 'typing...', and calling the Groq API.
    // Make sure the sendMessageToGroq function includes the systemPrompt using the archanaGheiContext variable.

     function toggleChatWindow() {
        if(!chatWindow || !chatToggleButton) return; // Add checks
        const isHidden = chatWindow.classList.toggle('hidden');
        chatToggleButton.classList.toggle('open', !isHidden);
        if (!isHidden && chatInput) { chatInput.focus(); }
    }

    function addMessage(text, sender) {
        if(!chatMessages) return;
        const messageDiv = document.createElement('div');
        messageDiv.classList.add('message', `${sender}-message`);
        const sanitizedText = text.replace(/</g, "<").replace(/>/g, ">");
        // Improved list formatting and bold/italic handling
        let formattedText = sanitizedText
            .replace(/\n\s*([\*\-])\s/g, '<br>• ') // Handles both * and - list markers after newline
            .replace(/^([\*\-])\s/g, '• ')       // Handles list marker at the beginning
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*(.*?)\*/g, '<em>$1</em>')
            .replace(/\n/g, '<br>'); // Convert remaining newlines
        messageDiv.innerHTML = formattedText;
        chatMessages.appendChild(messageDiv);
        // Ensure scroll happens after message is potentially rendered
        requestAnimationFrame(() => {
            chatMessages.scrollTop = chatMessages.scrollHeight;
        });
     }

     function showTypingIndicator(show = true) {
        if(!chatMessages) return;
        let typingIndicator = chatMessages.querySelector('.typing');
        if (show && !typingIndicator) {
            typingIndicator = document.createElement('div');
            typingIndicator.classList.add('message', 'bot-message', 'typing');
            typingIndicator.innerHTML = 'Typing<span>.</span><span>.</span><span>.</span>';
            chatMessages.appendChild(typingIndicator);
            requestAnimationFrame(() => { // Scroll after adding
                 chatMessages.scrollTop = chatMessages.scrollHeight;
            });
        } else if (!show && typingIndicator) {
            typingIndicator.remove();
        }
    }

    async function sendMessageToGroq(message) {
        if (!GROQ_API_KEY || GROQ_API_KEY === 'YOUR_GROQ_API_KEY_HERE') {
            addMessage("Chatbot Error: API Key not configured.", 'bot');
            console.error("Groq API Key is missing!"); return;
        }
        if (!message || !message.trim()) return; // Check for message existence
        if (!chatInput || !chatSendButton) return; // Check for UI elements

        addMessage(message, 'user');
        chatInput.value = '';
        chatSendButton.disabled = true;
        showTypingIndicator(true);

        const systemPrompt = `You are a helpful AI assistant providing information ONLY based on the following context about Archana Ghei. Be concise and answer questions about her experience, skills, education, projects, and professional activities using the provided details. Format lists clearly using bullet points (e.g., using '• ' marker). If the question is outside this context, politely state that you only have information about Archana Ghei's professional profile presented here.

        Context:
        ${archanaGheiContext}`;

        try {
            const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
                method: "POST",
                headers: { "Authorization": `Bearer ${GROQ_API_KEY}`, "Content-Type": "application/json" },
                body: JSON.stringify({
                    model: "llama3-8b-8192",
                    messages: [ { role: "system", content: systemPrompt }, { role: "user", content: message } ],
                    temperature: 0.5,
                    max_tokens: 350,
                    // stream: false // Ensure streaming is off if not handled
                })
            });

            showTypingIndicator(false);

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({ error: { message: 'Failed to parse error response' } })); // Graceful error parsing
                console.error("Groq API Error:", response.status, errorData);
                addMessage(`Chatbot Error: ${errorData.error?.message || `HTTP ${response.status}`}`, 'bot');
            } else {
                const data = await response.json();
                const botReply = data.choices?.[0]?.message?.content;
                if (botReply) { addMessage(botReply.trim(), 'bot'); }
                else { addMessage("Sorry, I received an empty response.", 'bot'); console.error("Empty response content from Groq:", data); }
            }
        } catch (error) {
            showTypingIndicator(false);
            console.error("Error fetching Groq API:", error);
            addMessage("Chatbot Error: Could not connect. Please check console.", 'bot');
        } finally {
             if(chatSendButton) chatSendButton.disabled = false;
             if(chatInput) chatInput.focus();
        }
     }

    // Chatbot Event Listeners
    if(chatToggleButton) chatToggleButton.addEventListener('click', toggleChatWindow);
    if(chatCloseButton) chatCloseButton.addEventListener('click', toggleChatWindow);
    if(chatSendButton) chatSendButton.addEventListener('click', () => sendMessageToGroq(chatInput?.value)); // Add null check
    if(chatInput) chatInput.addEventListener('keypress', (e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessageToGroq(chatInput.value); } });

    // --- Initial calls and Event Listeners for Scroll & Resize ---
    updateProgressBar(); setActiveLink();
    let scrollTimeout;
    window.addEventListener('scroll', () => { if (!scrollTimeout) { scrollTimeout = setTimeout(() => { updateProgressBar(); setActiveLink(); scrollTimeout = null; }, 50); } }, { passive: true });
    window.addEventListener('resize', () => { calculateOffsets(); updateProgressBar(); setActiveLink(); });

}); // End DOMContentLoaded