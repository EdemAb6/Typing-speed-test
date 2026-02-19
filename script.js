// Helper to reset button styles
function default_choice(choices) {
    choices.forEach(choice => {
        choice.classList.remove("clicked");
    });
}

fetch("data.json")
    .then(response => response.json())
    .then(data => {

        const timer = document.querySelector("#time");
        const acc = document.querySelector("#acc");
        const wpm = document.querySelector("#wpm");
        const p = document.querySelector("#p");
        const record = document.querySelector("#record");

        // Load record (store only number)
        let savedRecord = parseInt(localStorage.getItem("record")) || 0;
        record.textContent = savedRecord + " WPM";

        let interval = null;
        let diff = "Hard";
        let mode = "Timed(60s)";
        let timeStarted = false;
        let remainingTime = 60;
        let elapsedTime = 0;

        let text = "";
        let results = [];
        let i = 0;
        let correctChars = 0;
        let wrongchars = 0;
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
                let style = "";

                if (results[index] === "correct") style += "color: green;";
                if (results[index] === "wrong") style += "color: red;";

                if (index >= currentWordStart && index < currentWordEnd) {
                    style += "border-bottom: 2px solid hsl(240,1%,59%);";
                }

                output += `<span style="${style}">${text[index]}</span>`;
            }

            p.innerHTML = output;
        }

        function formatTime(seconds) {
            let mins = Math.floor(seconds / 60);
            let secs = seconds % 60;
            return `${mins}:${secs.toString().padStart(2, "0")}`;
        }

        function loadText() {

            clearInterval(interval);
            interval = null;
            timeStarted = false;

            i = 0;
            correctChars = 0;
            wrongchars = 0;
            elapsedTime = 0;

            if (mode === "Timed(60s)") {
                remainingTime = 60;
                timer.textContent = formatTime(remainingTime);
            } else {
                remainingTime = 0;
                timer.textContent = formatTime(0);
            }

            let difficultyTexts = data[diff.toLowerCase()];
            if (!difficultyTexts) {
                console.error("Difficulty not found in JSON");
                return;
            }

            let random_number = Math.floor(Math.random() * difficultyTexts.length);
            text = difficultyTexts[random_number].text;

            results = new Array(text.length).fill(null);

            acc.textContent = "100%";
            wpm.textContent = "0";

            updateCurrentWord();
            render();
        }

        function updateWPM() {
            if (elapsedTime > 0) {
                let calculatedWPM = (correctChars / 5) / (elapsedTime / 60);
                wpm.textContent = Math.floor(calculatedWPM);
            }
        }

        function handleTimer() {
            if (interval) return;

            timeStarted = true;

            interval = setInterval(() => {

                if (mode === "Timed(60s)") {
                    remainingTime--;
                    elapsedTime++;
                    timer.textContent = formatTime(remainingTime);

                    if (remainingTime <= 0) {
                        finishTest();
                    }

                } else {
                    elapsedTime++;
                    timer.textContent = formatTime(elapsedTime);
                }

                updateWPM();

            }, 1000);
        }

        function finishTest() {

            clearInterval(interval);
            interval = null;
            const Resultimg = document.querySelector("#Resultimg")
            const ResultText = document.querySelector("#ResultText");
            const resultWPM = document.querySelector("#resultWPM");
            const resultACC = document.querySelector("#resultACC");
            const typeResult = document.querySelector("#typeResult");
            const correctCar = document.querySelector("#correctCar");
            const wrongCar = document.querySelector("#wrongCar");
            const textContainer = document.querySelector(".text-container");
            const secondContainer = document.querySelector(".second-container");
            const resultContainer = document.querySelector(".result-container");
            updateWPM();

            let currentWPM = parseInt(wpm.textContent);
            let prevRecord = parseInt(localStorage.getItem("record")) || 0;
            textContainer.style.display = "none";
            secondContainer.style.display ="none";
            resultContainer.style.display = "flex";
            correctCar.textContent = correctChars;


            if (currentWPM > prevRecord) {
                localStorage.setItem("record", currentWPM);
                typeResult.textContent = "High score Smashed"
                record.textContent = currentWPM + " WPM";
                Resultimg.src = "assets/images/icon-new-pb.svg"
                ResultText.textContent = "You're getting faster.That was incredible typing."
                resultWPM.textContent = currentWPM;
                resultACC.textContent = acc.textContent;
                correctCar.textContent = correctChars;
                wrongCar.textContent = wrongchars;
            }
            else if (prevRecord == 0){
                localStorage.setItem("record", currentWPM);
                record.textContent = currentWPM + " WPM";
                typeResult.textContent = "Baseline Established!"
                ResultText.textContent = "You've set the bar. Now the real challenge begins-time to beat it."
                resultWPM.textContent = currentWPM;
                resultACC.textContent = acc.textContent;
                
            }
            const tryAgain = document.querySelector(".tryAgain");
            tryAgain.addEventListener("click",()=>{
                textContainer.style.display = "flex";
            secondContainer.style.display ="flex";
            resultContainer.style.display = "none";
                    loadText();
            }) 
        }

        // Difficulty buttons
        document.querySelectorAll(".diff-choice").forEach(choice => {
            choice.addEventListener("click", () => {
                diff = choice.textContent.trim();
                default_choice(document.querySelectorAll(".diff-choice"));
                choice.classList.add("clicked");
                loadText();
            });
        });

        // Mode buttons
        document.querySelectorAll(".mode-choice").forEach(choice => {
            choice.addEventListener("click", () => {
                mode = choice.textContent.trim();
                default_choice(document.querySelectorAll(".mode-choice"));
                choice.classList.add("clicked");
                loadText();
            });
        });

        document.addEventListener("keydown", ev => {

            if (ev.key === " " && ev.target === document.body) {
                ev.preventDefault();
            }

            if (i >= text.length) return;
            if (mode === "Timed(60s)" && remainingTime <= 0) return;

            if (!timeStarted && ev.key.length === 1) {
                handleTimer();
            }

            if (ev.key === text[i] && ev.key.length === 1) {
                results[i] = "correct";
                correctChars++;
                i++;

            } else if (ev.key === "Backspace") {
                if (i > 0) {
                    if(text[i-1] != " "){
                    i--;
                    if (results[i] === "correct") correctChars--;
                    results[i] = null;
                }}

            } else if (ev.key.length === 1) {
                results[i] = "wrong";
                i++;
                wrongchars++;
            }

            updateCurrentWord();
            render();

            if (i > 0) {
                acc.textContent = Math.floor((correctChars / i) * 100) + "%";
            }

            if (i === text.length) {
                finishTest();
            }
        });

        loadText();

    })
    .catch(err => console.error("Error loading JSON:", err));
