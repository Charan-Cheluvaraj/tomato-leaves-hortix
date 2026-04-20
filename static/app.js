/**
 * HORTIX ENGINE v3.4 
 * Principal Architect: Antigravity
 * UI/UX: Vanguard_UI_Architect
 */

document.addEventListener('DOMContentLoaded', () => {
    // --- Phase 0: State Management ---
    const state = {
        selectedFile: null,
        detectedDisease: null,
        isScanning: false,
        isLoading: true
    };

    // --- Phase 1: DOM Elements ---
    const elements = {
        // Loading
        loadingScreen: document.getElementById('loading-screen'),
        loaderWord: document.getElementById('loader-word'),
        loaderCounter: document.getElementById('loader-counter'),
        loaderProgress: document.getElementById('loader-progress-bar'),
        
        // HUD
        heroHud: document.getElementById('hero-hud'),
        bgVideo: document.getElementById('bg-video'),
        currentTime: document.getElementById('current-time'),
        
        // Diagnostic
        dropZone: document.getElementById('drop-zone'),
        fileInput: document.getElementById('file-input'),
        previewContainer: document.getElementById('preview-container'),
        imagePreview: document.getElementById('image-preview'),
        resetBtn: document.getElementById('reset-btn'),
        scanBtn: document.getElementById('scan-btn'),
        scannerLine: document.getElementById('scanner-line'),
        
        // Intelligence
        intelligencePanel: document.getElementById('intelligence-panel'),
        systemFlow: document.getElementById('system-flow'),
        reportContainer: document.getElementById('report-container'),
        diseaseName: document.getElementById('disease-name'),
        confidenceFill: document.getElementById('confidence-fill'),
        confidenceValue: document.getElementById('confidence-value'),
        adviceContent: document.getElementById('advice-content'),
        
        // Chat
        chatMessages: document.getElementById('chat-messages'),
        chatInput: document.getElementById('chat-input'),
        chatSend: document.getElementById('chat-send'),
        suggestedQuestions: document.getElementById('suggested-questions')
    };

    // --- Phase 2: Loading Sequence ---
    const initLoader = () => {
        const words = ["INGEST", "ANALYZE", "ADVISE"];
        let wordIdx = 0;
        let start = null;
        const duration = 2700; // 2.7s for counter

        // Word cycling
        const wordInterval = setInterval(() => {
            wordIdx = (wordIdx + 1) % words.length;
            elements.loaderWord.style.opacity = 0;
            setTimeout(() => {
                elements.loaderWord.textContent = words[wordIdx];
                elements.loaderWord.style.opacity = 1;
            }, 200);
        }, 900);

        // Counter with rAF
        const step = (timestamp) => {
            if (!start) start = timestamp;
            const progress = timestamp - start;
            const percentage = Math.min((progress / duration) * 100, 100);
            
            const count = Math.floor(percentage);
            elements.loaderCounter.textContent = count.toString().padStart(3, '0');
            elements.loaderProgress.style.width = `${percentage}%`;

            if (progress < duration) {
                requestAnimationFrame(step);
            } else {
                clearInterval(wordInterval);
                finishLoading();
            }
        };
        requestAnimationFrame(step);
    };

    const finishLoading = () => {
        setTimeout(() => {
            elements.loadingScreen.style.opacity = '0';
            elements.heroHud.classList.remove('hidden');
            document.body.classList.remove('loading');
            
            setTimeout(() => {
                elements.loadingScreen.classList.add('hidden');
                initVideoEngine();
                updateTime();
                setInterval(updateTime, 1000);
            }, 600);
        }, 400);
    };

    // --- Phase 3: Video Engine ---
    const initVideoEngine = () => {
        const video = elements.bgVideo;
        video.play().catch(e => console.log("Video autoplay blocked:", e));

        // Custom Loop Fading Logic
        video.addEventListener('timeupdate', () => {
            const timeLeft = video.duration - video.currentTime;
            
            // Fade In at start
            if (video.currentTime < 0.25) {
                video.style.opacity = video.currentTime * 4;
            } 
            // Fade Out 0.55s before end
            else if (timeLeft < 0.55) {
                video.style.opacity = timeLeft / 0.55;
            } 
            else {
                video.style.opacity = 1;
            }
        });
    };

    const updateTime = () => {
        const now = new Date();
        elements.currentTime.textContent = now.toTimeString().split(' ')[0];
    };

    // --- Phase 4: Diagnostic Logic ---
    
    // File Selection
    elements.dropZone.addEventListener('click', () => elements.fileInput.click());
    elements.fileInput.addEventListener('change', (e) => handleFile(e.target.files[0]));

    // Drag & Drop
    elements.dropZone.addEventListener('dragover', (e) => {
        e.preventDefault();
        elements.dropZone.classList.add('dragover');
    });
    elements.dropZone.addEventListener('dragleave', () => {
        elements.dropZone.classList.remove('dragover');
    });
    elements.dropZone.addEventListener('drop', (e) => {
        e.preventDefault();
        elements.dropZone.classList.remove('dragover');
        handleFile(e.dataTransfer.files[0]);
    });

    const handleFile = (file) => {
        if (!file || !file.type.startsWith('image/')) return;
        
        state.selectedFile = file;
        const reader = new FileReader();
        reader.onload = (e) => {
            elements.imagePreview.src = e.target.result;
            elements.previewContainer.classList.remove('hidden');
            elements.scanBtn.classList.remove('disabled');
            elements.scanBtn.disabled = false;
        };
        reader.readAsDataURL(file);
    };

    elements.resetBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        state.selectedFile = null;
        elements.previewContainer.classList.add('hidden');
        elements.imagePreview.src = '';
        elements.scanBtn.classList.add('disabled');
        elements.scanBtn.disabled = true;
        elements.intelligencePanel.classList.add('hidden');
    });

    // --- Phase 5: Scanning Animation & Inference ---
    elements.scanBtn.addEventListener('click', async () => {
        if (!state.selectedFile || state.isScanning) return;
        
        state.isScanning = true;
        elements.scanBtn.disabled = true;
        elements.scannerLine.classList.add('active');
        
        // Show Intelligence Panel
        elements.intelligencePanel.classList.remove('hidden');
        elements.reportContainer.classList.remove('hidden');
        
        // Inject Skeleton Loaders (Phase 1: Diagnosis & Advisory)
        elements.diseaseName.innerHTML = `<div class="skeleton-line skeleton-title"></div>`;
        elements.confidenceFill.style.width = '0%';
        elements.confidenceValue.textContent = '...';
        
        elements.adviceContent.innerHTML = `
            <div class="skeleton-loader">
                <div class="skeleton-line long"></div>
                <div class="skeleton-line medium"></div>
                <div class="skeleton-line long"></div>
                <div class="skeleton-line short"></div>
                <div class="skeleton-line medium"></div>
            </div>
        `;
        
        // Clear old suggestions
        elements.suggestedQuestions.innerHTML = '';
        
        resetFlowSteps();

        try {
            // Step 1: Ingest
            updateFlowStep('INGESTION', 'active');
            const formData = new FormData();
            formData.append('file', state.selectedFile);

            // Immediate Ingestion
            updateFlowStep('INGESTION', 'complete');

            // Step 2: Inference (FAST)
            updateFlowStep('INFERENCE', 'active');
            const response = await fetch('/predict', {
                method: 'POST',
                body: formData
            });
            const data = await response.json();
            
            state.detectedDisease = data.disease_name;
            updateFlowStep('INFERENCE', 'complete');

            // Set Disease result
            elements.diseaseName.textContent = data.disease_name;
            
            // Animate confidence
            const confPerc = (data.confidence * 100).toFixed(1);
            elements.confidenceFill.style.width = `${confPerc}%`;
            elements.confidenceValue.textContent = `${confPerc}%`;

            // Step 3: Advisory (STREAMING)
            updateFlowStep('ADVISORY', 'active');
            
            // Clear chat and reset panel
            elements.chatMessages.innerHTML = '';
            
            // Initiate Streaming Advice
            const adviceResponse = await fetch(`/advice?disease_name=${encodeURIComponent(data.disease_name)}`);
            const reader = adviceResponse.body.getReader();
            const decoder = new TextDecoder();
            
            let adviceText = "";
            let hasClearedLoader = false;

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                // Clear loader only upon receiving first chunk of data
                if (!hasClearedLoader) {
                    elements.adviceContent.innerHTML = ""; 
                    hasClearedLoader = true;
                }
                
                const chunk = decoder.decode(value, { stream: true });
                adviceText += chunk;
                
                // Real-time render with minimal formatting
                elements.adviceContent.innerHTML = formatAdvice(adviceText) + '<span class="cursor-blink">_</span>';
                
                // Auto-scroll logic if needed (optional for this layout)
            }

            // Remove blinker when done
            elements.adviceContent.innerHTML = formatAdvice(adviceText);
            updateFlowStep('ADVISORY', 'complete');
            
            // Render Chat Suggestions (Visible and interactive)
            renderSuggestedQuestions();

        } catch (error) {
            console.error("Scan Error:", error);
            elements.adviceContent.innerHTML = '<div class="error-text">INTELLIGENCE TERMINATED: Signal parity error. Check hardware connectivity.</div>';
        } finally {
            state.isScanning = false;
            elements.scanBtn.disabled = false;
            elements.scannerLine.classList.remove('active');
        }
    });

    const resetFlowSteps = () => {
        const steps = elements.systemFlow.querySelectorAll('.flow-step');
        steps.forEach(s => {
            s.classList.remove('active', 'complete');
            s.querySelector('.step-status').textContent = 'PENDING';
        });
    };

    const updateFlowStep = (id, status) => {
        const step = elements.systemFlow.querySelector(`[data-step="${id}"]`);
        if (!step) return;
        
        step.classList.remove('active', 'complete');
        step.classList.add(status);
        step.querySelector('.step-status').textContent = status.toUpperCase();
    };

    const formatAdvice = (text) => {
        if (!text) return "";
        // Simple Markdown-to-HTML + Hardware-HUD line breaks
        return text
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\n/g, '<br>')
            .replace(/\[RESILIENCE MODE(.*?)\]/g, '<div class="resilience-alert">RECOVERY_PROTOCOL: $1</div>')
            .replace(/\[(.*?)\]/g, '<span class="status-tag">$1</span>')
            .replace(/(\d\.\s)/g, '<br><strong>$1</strong>'); // Highlight numbered lists
    };

    // --- Phase 6: Interactive Chat & Streaming ---
    
    elements.chatSend.addEventListener('click', () => sendChatMessage());
    elements.chatInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') sendChatMessage();
    });

    const renderSuggestedQuestions = () => {
        const qs = [
            "What is this disease?",
            "How can I treat it?",
            "How can I prevent it?"
        ];
        elements.suggestedQuestions.innerHTML = '';
        qs.forEach(q => {
            const chip = document.createElement('button');
            chip.className = 'chip';
            chip.textContent = q;
            chip.onclick = () => sendChatMessage(q);
            elements.suggestedQuestions.appendChild(chip);
        });
    };

    const sendChatMessage = async (presetMessage = null) => {
        const text = presetMessage || elements.chatInput.value.trim();
        if (!text || !state.detectedDisease) return;

        // Clear input
        elements.chatInput.value = '';
        elements.suggestedQuestions.innerHTML = '';

        // Add user message
        addMessage(text, 'user');

        // Add AI skeleton
        const aiMessageDiv = addMessage('', 'ai');
        const pulse = document.createElement('span');
        pulse.className = 'pulse-dot';
        aiMessageDiv.appendChild(pulse);

        try {
            const response = await fetch('/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    user_question: text,
                    detected_disease: state.detectedDisease
                })
            });

            const reader = response.body.getReader();
            const decoder = new TextDecoder();
            let aiText = "";
            aiMessageDiv.innerHTML = ""; // Clear pulse

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;
                
                const chunk = decoder.decode(value, { stream: true });
                aiText += chunk;
                
                // Real-time update (stripping potential JSON bloat if any)
                let cleanText = aiText;
                if (cleanText.includes('{"response":')) {
                    try {
                        const parsed = JSON.parse(cleanText + (cleanText.endsWith('}') ? '' : '}'));
                        cleanText = parsed.response;
                    } catch(e) {}
                }
                
                aiMessageDiv.innerHTML = formatAdvice(cleanText);
                elements.chatMessages.scrollTop = elements.chatMessages.scrollHeight;
            }
            
            // Re-render suggestions after AI finishes
            renderSuggestedQuestions();

        } catch (error) {
            console.error("Chat Error:", error);
            aiMessageDiv.textContent = "COMMUNICATION_FAULT: Signal lost.";
        }
    };

    const addMessage = (text, sender) => {
        const div = document.createElement('div');
        div.className = `message ${sender}`;
        div.textContent = text;
        elements.chatMessages.appendChild(div);
        elements.chatMessages.scrollTop = elements.chatMessages.scrollHeight;
        return div;
    };

    // --- Final Execution ---
    initLoader();
});
