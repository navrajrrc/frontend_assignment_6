document.addEventListener("DOMContentLoaded", function () {
	const form = document.getElementById("trivia-form");
	const questionContainer = document.getElementById("question-container");
	const usernameInput = document.getElementById("username");
	const newPlayerButton = document.getElementById("new-player");
	const submitButton = document.getElementById("submit-game");
	let currentScore = 0; 

	// Reset the score list every time the page is loaded 
	localStorage.removeItem("scores");

	// Starts the game
	checkUsername();
	fetchQuestions();
	displayScores();

	/**
	 * Fetches trivia questions from the API and displays them.
	 */
	function fetchQuestions() {
		showLoading(true); // Show loading state

		fetch("https://opentdb.com/api.php?amount=10&type=multiple")
			.then((response) => response.json())
			.then((data) => {
				displayQuestions(data.results);
				showLoading(false); // Hide loading state
			})
			.catch((error) => {
				console.error("Error fetching questions:", error);
				showLoading(false); // Hide loading state on error
			});
	}

	/**
	 * Show or hide loading state and ques container.
	 *
	 * @param {boolean} isLoading - Indicates whether the loading state should be shown.
	 */
	function showLoading(isLoading) {
		document.getElementById("loading-container").classList = isLoading
			? ""
			: "hidden";
		document.getElementById("question-container").classList = isLoading
			? "hidden"
			: "";
	}

	/**
	 * Displays fetched trivia questions.
	 * @param {Object[]} questions - Array of trivia questions.
	 */
	function displayQuestions(questions) {
		questionContainer.innerHTML = ""; // Clear existing questions
		questions.forEach((question, index) => {
			const questionDiv = document.createElement("div");
			questionDiv.innerHTML = `
                <p>${question.question}</p>
                ${createAnswerOptions(
					question.correct_answer,
					question.incorrect_answers,
					index
				)}
            `;
			questionContainer.appendChild(questionDiv);
		});
	}

	/**
	 * Creates HTML for answer options.
	 * @param {string} correctAnswer - The correct answer for the question.
	 * @param {string[]} incorrectAnswers - Array of incorrect answers.
	 * @param {number} questionIndex - The index of the current question.
	 * @returns {string} HTML string of answer options.
	 */
	function createAnswerOptions(
		correctAnswer,
		incorrectAnswers,
		questionIndex
	) {
		const allAnswers = [correctAnswer, ...incorrectAnswers].sort(
			() => Math.random() - 0.5
		);
		return allAnswers
			.map(
				(answer) => ` 
            <label>
                <input type="radio" name="answer${questionIndex}" value="${answer}" data-correct="${answer === correctAnswer}">
                ${answer}
            </label>
        `
			)
			.join("");
	}

	// Event listeners for form submission and new player button
	form.addEventListener("submit", handleFormSubmit);
	newPlayerButton.addEventListener("click", newPlayer);

	/**
	 * Handles the trivia form submission.
	 * @param {Event} event - The submit event.
	 */
	function handleFormSubmit(event) {
		event.preventDefault();
		const username = usernameInput.value.trim();
		if (username) {
			setCookie("username", username, 7); // Store username in cookie
			alert("Game finished! Your final score: " + currentScore); // Show final score
			saveScore(username, currentScore);
		}
	}

	// Cookie management functions
	function setCookie(name, value, days) {
		const date = new Date();
		date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
		const expires = "expires=" + date.toUTCString();
		document.cookie = name + "=" + value + ";" + expires + ";path=/";
	}

	function getCookie(name) {
		const nameEq = name + "=";
		const ca = document.cookie.split(";");
		for (let i = 0; i < ca.length; i++) {
			let c = ca[i];
			while (c.charAt(0) == " ") c = c.substring(1);
			if (c.indexOf(nameEq) == 0) return c.substring(nameEq.length, c.length);
		}
		return "";
	}

	/**
	 * Checks if a username cookie exists and updates the UI accordingly.
	 */
	function checkUsername() {
		const username = getCookie("username");
		if (username) {
			usernameInput.value = username;
			newPlayerButton.classList.remove("hidden");
		}
	}

	/**
	 * Clears the user session and resets the game.
	 */
	function newPlayer() {
		setCookie("username", "", -1); // Delete the username cookie
		usernameInput.value = "";
		currentScore = 0; // Reset score
		questionContainer.innerHTML = ""; // Clear questions
		fetchQuestions(); // Fetch new questions
	}

	/**
	 * Saves the player's score to localStorage (or a server in a real application).
	 * @param {string} username - Player's name.
	 * @param {number} score - Player's score.
	 */
	function saveScore(username, score) {
		let scores = JSON.parse(localStorage.getItem("scores")) || [];
		scores.push({ username, score });
		localStorage.setItem("scores", JSON.stringify(scores));
		displayScores();
	}

	/**
	 * Displays the scores from localStorage.
	 */
	function displayScores() {
		const scoreTableBody = document.querySelector("#score-table tbody");
		const scores = JSON.parse(localStorage.getItem("scores")) || [];
		scoreTableBody.innerHTML = scores
			.map(
				(score) => `
            <tr>
                <td>${score.username}</td>
                <td>${score.score}</td>
            </tr>
        `
			)
			.join("");
	}

	/**
	 * Handles the selection of answers and updates the score.
	 */
	document.addEventListener("change", function (event) {
		if (event.target.matches('input[type="radio"]')) {
			const isCorrect = event.target.dataset.correct === "true";
			if (isCorrect) {
				currentScore++;
			}
		}
	});
});
