// Helper to reset button styles
function default_choice(choices) {
    choices.forEach((choice) => {
        choice.classList.remove("clicked");
    });
}

fetch("data.json")
    .then((response) => response.json())
    .then((data) => {
        const timer = document.querySelector("#time");
        const acc = document.querySelector("#acc");
        const wpm = document.querySelector("#wpm");
        const p = document.querySelector("#p");
        const record = document.querySelector("#record");

        // Initialize record display
        let savedRecord = localStorage.getItem("record") || "0 WPM";
        record.textContent = savedRecord;

        let interval = null;
        let diff = "Hard";
        let mode = "Timed(60s)";
        let timeStarted = false;
        let remainingTime = 60; // Default for timed
        let elapsedTime = 0;

        // Typing State
        let text = "";
        let results = [];
        let i = 0;
        let correctChars = 0;
        let currentWordStart = 0;
        let currentWordEnd = 0;

        function updateCurrentWord() {
            let start = i;
            while (start > 0 && text[start - 1] !== " ") start--;
            let end = i;
            while (end < text.length && text[end] !== " ") end++;
            currentWordStart = start;
            currentWordEnd = end;
        }

        function render() {
            let output = "";
            for (let index = 0; index < text.length; index++) {
                let char = text[index];
                let style = "";
                if (results[index] === "correct") style += "color: green;";
                else if (results[index] === "wrong") style += "color: red;";

                if (index >= currentWordStart && index < currentWordEnd) {
                    style += "border-bottom: 2px solid hsl(240, 1%, 59%);";
                }
                output += `<span style="${style}">${char}</span>`;
            }
            p.innerHTML = output;
        }

        function loadText() {
            // Reset logic
            clearInterval(interval);
            interval = null;
            timeStarted = false;
            i = 0;
            correctChars = 0;
            elapsedTime = 0;
            
            // Set initial timer display based on mode
            if (mode === "Passage") {
                remainingTime = 0;
                timer.textContent = "0:00";
            } else {
                remainingTime = 60;
                timer.textContent = "0:60";
            }

            // Pick text
            let random_number = Math.floor(Math.random() * (data[diff.toLowerCase()]?.length || 1));
            text = data[diff.toLowerCase()][random_number].text;

            results = new Array(text.length).fill(null);
            acc.textContent = "100%";
            wpm.textContent = "0";
            updateCurrentWord();
            render();
        }

        function handleTimer() {
            if (interval) return;
            timeStarted = true;

            interval = setInterval(() => {
                if (mode === "Timed(60s)") {
                    remainingTime--;
                    elapsedTime++;
                    timer.textContent = `0:${remainingTime.toString().padStart(2, '0')}`;
                    if (remainingTime <= 0) finishTest();
                } else {
                    elapsedTime++;
                    timer.textContent = `0:${elapsedTime.toString().padStart(2, '0')}`;
                }

                // Update WPM every second
                if (elapsedTime > 0) {
                    let calculatedWPM = (correctChars / 5) / (elapsedTime / 60);
                    wpm.textContent = Math.max(0, Math.floor(calculatedWPM));
                }
            }, 1000);
        }

        function finishTest() {
            clearInterval(interval);
            interval = null;
            
            // Compare against numeric record
            let currentWPM = parseInt(wpm.textContent);
            let prevRecord = parseInt(localStorage.getItem("record") || "0");
            
            if (currentWPM > prevRecord) {
                localStorage.setItem("record", currentWPM + " WPM");
                record.textContent = currentWPM + " WPM";
            }
            
        }

        // Difficulty buttons
        document.querySelectorAll(".diff-choice").forEach((choice) => {
            choice.addEventListener("click", (e) => {
                diff = choice.textContent; 
                default_choice(document.querySelectorAll(".diff-choice"));
                choice.classList.add("clicked");
                loadText();
            });
        });

        // Mode buttons
        document.querySelectorAll(".mode-choice").forEach((choice) => {
            choice.addEventListener("click", (e) => {
                mode = choice.textContent;
                default_choice(document.querySelectorAll(".mode-choice"));
                choice.classList.add("clicked");
                loadText();
            });
        });

        // Keyboard logic
        document.addEventListener("keydown", (ev) => {
            // Prevent scrolling on spacebar
            if (ev.key === " " && ev.target === document.body) ev.preventDefault();
            
            if (i >= text.length || (mode === "Timed(60s)" && remainingTime <= 0)) return;

            // Start timer on first keypress
            if (!timeStarted && ev.key.length === 1) {
                handleTimer();
            }

            if (ev.key === text[i] && ev.key.length === 1) {
                results[i] = "correct";
                correctChars++;
                i++;
            } else if (ev.key === "Backspace") {
                if (i > 0) {
                    i--;
                    if (results[i] === "correct") correctChars--;
                    results[i] = null;
                }
            } else if (ev.key.length === 1) {
                results[i] = "wrong";
                i++;
            }

            updateCurrentWord();
            render();

            // Accuracy
            if (i > 0) {
                acc.textContent = Math.floor((correctChars / i) * 100) + "%";
            }

            // Finish if text completed
            if (i === text.length) {
                finishTest();
            }
        });

        loadText();
    })
    .catch((err) => console.error("Error loading JSON:", err));