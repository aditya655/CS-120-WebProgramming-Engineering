// Wordle Game Script

class WordleGame {
    constructor() {
        this.dictionary = ["apple", "brave", "candy", "delta", "eagle", "fable", "globe", "house", "jumpy",
                           "koala", "lemon", "mango", "night", "ocean", "pearl", "query", "rocky", "snail", 
                           "tiger", "uncle", "vivid", "whale", "xenon", "yacht", "zebra", "frost", "grape", 
                           "harsh", "index", "joker"]; // Dictionary for the answer
        this.answer = ""; // The answer word
        this.currentRow = 0; // Track the current row for guesses
        this.initGame();
    }

    // Selects a random word from the dictionary as the answer
    selectAnswer() {
        this.answer = this.dictionary[Math.floor(Math.random() * this.dictionary.length)];
        console.log("Answer for debugging:", this.answer); // Display the answer in the console for debugging
    }

    setCookie(name, value, days) {
        const expires = new Date(Date.now() + days * 86400000).toUTCString();
        document.cookie = `${name}=${value}; expires=${expires}; path=/`;
    }
    
    getCookie(name) {
        const cookies = document.cookie.split("; ");
        const cookie = cookies.find(c => c.startsWith(name + "="));
        return cookie ? cookie.split("=")[1] : null;
    }

    updateAverageGuesses(newGuesses) {
        const totalGames = Number(this.getCookie("totalGames") || 0) + 1;
        const totalGuesses = Number(this.getCookie("totalGuesses") || 0) + newGuesses;
        this.setCookie("totalGames", totalGames, 30);
        this.setCookie("totalGuesses", totalGuesses, 30);
        return (totalGuesses / totalGames).toFixed(2);
    }
    


    initGame() {
        this.selectAnswer();

        // Create the game board
        const gameBoard = document.getElementById('game-board');
        for (let i = 0; i < 6; i++) {
            const row = document.createElement('div');
            row.className = 'row';
            for (let j = 0; j < 5; j++) {
                const cell = document.createElement('div');
                cell.className = 'cell';
                row.appendChild(cell);
            }
            gameBoard.appendChild(row);
        }

        // Set up event listeners
        this.setupEventListeners();
    }

    setupEventListeners() {
        const submitButton = document.getElementById('submit-guess');
        const guessInput = document.getElementById('guess-input');
        const restartButton = document.getElementById('restart-game');
        
        if (submitButton) {
            submitButton.addEventListener('click', () => this.handleGuess());
        }
        if (guessInput) {
            guessInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') this.handleGuess();
            });
        }
        if (restartButton) {
            restartButton.addEventListener('click', () => this.restartGame());
        }
    }

    // Validates if the guessed word is a real English word using an API
    async validateWord(word) {
        try {
            const response = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${word}`);
            return response.ok; // Returns true if the word is valid, false otherwise
        } catch (error) {
            console.error("Error validating word:", error);
            return false; // Assume invalid if there's an error
        }
    }

    async handleGuess() {
        const guessInput = document.getElementById('guess-input');
        const guess = guessInput.value.toLowerCase();
        
        if (guess.length !== 5) {
            alert('Please enter a 5-letter word.');
            return;
        }
    
        const isValid = await this.validateWord(guess);
        if (!isValid) {
            alert('Please enter a valid 5-letter English word.');
            return;
        }
    
        const row = document.getElementsByClassName('row')[this.currentRow];
        const answerLetters = this.answer.split('');
        const matchedIndices = Array(5).fill(false);
        const feedback = []; // Array to store feedback for each letter
    
        // First pass: Check for letters in the correct position (green)
        for (let i = 0; i < 5; i++) {
            const cell = row.children[i];
            cell.textContent = guess[i];
            if (guess[i] === this.answer[i]) {
                cell.classList.add('correct');
                matchedIndices[i] = true;
                feedback.push(`The letter ${guess[i].toUpperCase()} is in the correct place.`);
            }
        }
    
        // Second pass: Check for correct letters in the wrong position (yellow)
        for (let i = 0; i < 5; i++) {
            const cell = row.children[i];
            if (!cell.classList.contains('correct')) {
                const matchIndex = answerLetters.findIndex(
                    (letter, index) => letter === guess[i] && !matchedIndices[index]
                );
                if (matchIndex !== -1) {
                    cell.classList.add('present');
                    matchedIndices[matchIndex] = true;
                    feedback.push(`The letter ${guess[i].toUpperCase()} is in the wrong place.`);
                } else {
                    cell.classList.add('absent');
                    feedback.push(`The letter ${guess[i].toUpperCase()} is not in the word.`);
                }
            }
        }
    
        // Display feedback in console or as an alert
        console.log(`Guess: ${guess.toUpperCase()}`);
        feedback.forEach(line => console.log(line)); // Print each feedback line to the console
    
        this.trackUsedLetters(guess);
    
        if (guess === this.answer) {
            alert('Congratulations! You guessed the word!');
            document.getElementById('restart-game').style.display = 'block';
            return;
        } else if (this.currentRow === 5) {
            alert(`Game over! The word was: ${this.answer}`);
            document.getElementById('restart-game').style.display = 'block';
            return;
        }
    
        this.currentRow++;
        guessInput.value = ''; // Clear input field for the next guess
    }
    

    trackUsedLetters(guess) {
        const usedLetterBoard = document.getElementById('used-letters');
        if (usedLetterBoard) {
            guess.split('').forEach(letter => {
                if (!document.getElementById(`used-${letter}`)) {
                    const letterElement = document.createElement('div');
                    letterElement.textContent = letter.toUpperCase();
                    letterElement.className = 'used-letter';
                    letterElement.id = `used-${letter}`;
                    usedLetterBoard.appendChild(letterElement);
                }
            });
        }
    }

    
    

    restartGame() {
        this.currentRow = 0;
        this.selectAnswer();
        
        const cells = document.querySelectorAll('.cell');
        cells.forEach(cell => {
            cell.textContent = '';
            cell.classList.remove('correct', 'present', 'absent');
        });

        document.getElementById('restart-game').style.display = 'none';
        const usedLetterBoard = document.getElementById('used-letters');
        if (usedLetterBoard) usedLetterBoard.innerHTML = '';
        document.getElementById('guess-input').value = '';
    }
}
// Initialize the game when the script loads
new WordleGame();
