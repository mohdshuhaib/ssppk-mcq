document.addEventListener('DOMContentLoaded', () => {
    // DOM Element References
    const questionTextEl = document.getElementById('question-text');
    const optionsContainerEl = document.getElementById('options-container');
    const nextBtn = document.getElementById('next-btn');
    const refreshBtn = document.getElementById('refresh-btn');
    const navDropdown = document.getElementById('question-nav-dropdown');
    const resultFeedbackEl = document.getElementById('result-feedback');
    const relatedTopicEl = document.getElementById('related-topic');

    // Quiz State
    let allQuestions = [];
    let shuffledQuestions = [];
    let currentQuestionIndex = 0;

    // --- 1. Initialization ---

    /**
     * Fetches quiz data from JSON file and initializes the quiz.
     */
    async function initQuiz() {
        try {
            const response = await fetch('quiz_data.json');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            allQuestions = await response.json();
            shuffleAndStart();
        } catch (error) {
            questionTextEl.textContent = "Failed to load quiz questions. Please try refreshing.";
            console.error("Error fetching quiz data:", error);
        }
    }

    /**
     * Shuffles the questions, populates navigation, and starts the quiz.
     */
    function shuffleAndStart() {
        // Create a shuffled copy of the questions
        shuffledQuestions = [...allQuestions].sort(() => Math.random() - 0.5);
        currentQuestionIndex = 0;
        
        populateNavDropdown();
        showQuestion(currentQuestionIndex);
        
        nextBtn.style.display = 'none';
        resultFeedbackEl.textContent = '';
        relatedTopicEl.style.display = 'none';
    }

    /**
     * Fills the "Go to" dropdown with question numbers.
     */
    function populateNavDropdown() {
        navDropdown.innerHTML = ''; // Clear previous options
        shuffledQuestions.forEach((_, index) => {
            const option = document.createElement('option');
            option.value = index;
            option.textContent = `Question ${index + 1}`;
            navDropdown.appendChild(option);
        });
    }

    // --- 2. Quiz Gameplay ---

    /**
     * Displays a specific question by its index in the shuffled array.
     * @param {number} index - The index of the question to show.
     */
    function showQuestion(index) {
        // Get the current question
        const question = shuffledQuestions[index];
        
        // Update question text
        questionTextEl.textContent = `Q${index + 1}: ${question.question}`;
        
        // Clear old options
        optionsContainerEl.innerHTML = '';
        
        // Create and append new option buttons
        for (const [key, text] of Object.entries(question.options)) {
            const li = document.createElement('li');
            const button = document.createElement('button');
            button.textContent = `${key}: ${text}`;
            button.dataset.key = key; // Store the option key (A, B, C, D)
            button.addEventListener('click', selectAnswer);
            li.appendChild(button);
            optionsContainerEl.appendChild(li);
        }
        
        // Reset feedback and hide next button
        navDropdown.value = index;
        nextBtn.style.display = 'none';
        resultFeedbackEl.textContent = '';
        relatedTopicEl.style.display = 'none';
    }

    /**
     * Handles the event when a user clicks an answer.
     * @param {Event} e - The click event from the option button.
     */
    function selectAnswer(e) {
        const selectedBtn = e.target;
        const selectedKey = selectedBtn.dataset.key;
        const question = shuffledQuestions[currentQuestionIndex];
        const correctKey = question.correct_answer_key;

        // Disable all option buttons
        Array.from(optionsContainerEl.children).forEach(li => {
            li.firstElementChild.disabled = true;
        });

        // Check if the answer is correct
        if (selectedKey === correctKey) {
            selectedBtn.classList.add('correct');
            resultFeedbackEl.textContent = "Correct!";
            resultFeedbackEl.style.color = "var(--correct-color)";
        } else {
            selectedBtn.classList.add('wrong');
            resultFeedbackEl.textContent = `Wrong. Correct answer: ${question.correct_answer_text}`;
            resultFeedbackEl.style.color = "var(--wrong-color)";
            
            // Highlight the correct answer as well
            const correctBtn = optionsContainerEl.querySelector(`[data-key="${correctKey}"]`);
            if (correctBtn) {
                correctBtn.classList.add('correct');
            }
        }
        
        // Show the related topic
        relatedTopicEl.textContent = `Topic: ${question.category}`;
        relatedTopicEl.style.display = 'inline-block';
        
        // Show the 'Next' button
        if (currentQuestionIndex < shuffledQuestions.length - 1) {
            nextBtn.textContent = "Next Question";
        } else {
            nextBtn.textContent = "Finish Quiz";
        }
        nextBtn.style.display = 'block';
    }

    /**
     * Moves to the next question or finishes the quiz.
     */
    function showNextQuestion() {
        currentQuestionIndex++;
        if (currentQuestionIndex < shuffledQuestions.length) {
            showQuestion(currentQuestionIndex);
        } else {
            // Quiz finished
            questionTextEl.textContent = "Quiz Complete! You've finished all 100 questions.";
            optionsContainerEl.innerHTML = '';
            nextBtn.style.display = 'none';
            resultFeedbackEl.textContent = 'Click "Shuffle & Reset" to play again!';
            relatedTopicEl.style.display = 'none';
        }
    }

    /**
     * Jumps to the question selected in the dropdown.
     */
    function jumpToQuestion() {
        currentQuestionIndex = parseInt(navDropdown.value);
        showQuestion(currentQuestionIndex);
    }

    // --- 3. Event Listeners ---

    refreshBtn.addEventListener('click', shuffleAndStart);
    nextBtn.addEventListener('click', showNextQuestion);
    navDropdown.addEventListener('change', jumpToQuestion);

    // --- Start the Quiz ---
    initQuiz();
});
