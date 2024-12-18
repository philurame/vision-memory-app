///////////////////////////
// UTILS
///////////////////////////

function arraysEqual(a1, a2) {
  return JSON.stringify(a1) === JSON.stringify(a2);
}

class PRNG {
  constructor(a, b, c, d) {
    this.a = a >>> 0;
    this.b = b >>> 0;
    this.c = c >>> 0;
    this.d = d >>> 0;
  }
  
  next() {
    let t = (this.a + this.b) | 0;
    this.a = this.b ^ (this.b >>> 9);
    this.b = (this.c + (this.c << 3)) | 0;
    this.c = (this.c << 21) | (this.c >>> 11);
    this.d = (this.d + 1) | 0;
    t = (t + this.d) | 0;
    this.c = (this.c + t) | 0;
    return (t >>> 0) / 4294967296;
  }
}
  
function cyrb128(str) {
  let h1 = 1779033703,
  h2 = 3144134277,
  h3 = 1013904242,
  h4 = 2773480762;
  for (let i = 0, k; i < str.length; i++) {
    k = str.charCodeAt(i);
    h1 = h2 ^ Math.imul(h1 ^ k, 597399067);
    h2 = h3 ^ Math.imul(h2 ^ k, 2869860233);
    h3 = h4 ^ Math.imul(h3 ^ k, 951274213);
    h4 = h1 ^ Math.imul(h4 ^ k, 2716044179);
  }
  h1 = Math.imul(h3 ^ (h1 >>> 18), 597399067);
  h2 = Math.imul(h4 ^ (h2 >>> 22), 2869860233);
  h3 = Math.imul(h1 ^ (h3 >>> 17), 951274213);
  h4 = Math.imul(h2 ^ (h4 >>> 19), 2716044179);
  return [h1 >>> 0, h2 >>> 0, h3 >>> 0, h4 >>> 0];
}

///////////////////////////
// GAME CLASS
///////////////////////////

class MemoryGame {
  constructor() {
    // Initialize game parameters
    this.initGameParameters();
    
    // Cache DOM elements
    this.cacheDOMElements();
  
    // Bind event handlers
    this.bindEvents();
  }
  
  initGameParameters() {
    this.timeLimit = 0; // Time limit in milliseconds
    this.gridSize = 0;
    this.numActiveSquares = 0;
    this.attraction = 0;
    this.seed = undefined;
    this.randomFunc = undefined;
    this.randomFuncSeed = undefined;
    this.squares = [];
    this.activeIndices = [];
    this.mouseIsDown = false;
    this.hideSquaresTimeout = null;
    this.trials = 0;
    this.soundOn = true;
    this.tasksCompleted = 0;
    this.correctSelections = 0;
    this.isConfirmPhase = true;
  }
  
  cacheDOMElements() {
    this.grid = document.getElementById('grid');
    this.parametersDiv = document.getElementById('parameters');
    this.gameAreaDiv = document.getElementById('gameArea');
    this.startButton = document.getElementById('startButton');
    this.confirmButton = document.getElementById('confirmButton');
    this.resultDiv = document.getElementById('result');
    this.backButton = document.getElementById('backButton');
    this.taskCounterValue = document.getElementById('taskCounterValue');
    this.accuracyValue = document.getElementById('accuracyValue');
    this.soundButton = document.getElementById('soundButton');
    this.messageElement = document.getElementById('message');
  }
  
  bindEvents() {
    this.handleStartButtonClick = this.handleStartButtonClick.bind(this);
    this.handleConfirmButtonClick = this.handleConfirmButtonClick.bind(this);
    this.backButtonHandler = this.backButtonHandler.bind(this);
    this.handleBackButtonKey = this.handleBackButtonKey.bind(this);
    this.handleSoundButtonClick = this.handleSoundButtonClick.bind(this);
    
    this.startButton.addEventListener('click', this.handleStartButtonClick);
    this.confirmButton.addEventListener('click', this.handleConfirmButtonClick);
    this.backButton.addEventListener('click', this.backButtonHandler);
    this.soundButton.addEventListener('click', this.handleSoundButtonClick);

    document.addEventListener('keydown', this.handleBackButtonKey);
  }
  
  handleSoundButtonClick() {
    this.soundOn = !this.soundOn;
    this.soundButton.textContent = this.soundOn ? '🔈' : '🔇';
  }
  
  handleStartButtonClick() {
    this.getParameters();
    if (this.numActiveSquares > this.gridSize * this.gridSize) {
      this.displayMessage('Number of active squares cannot exceed total squares in the grid');
    return;
    }
    this.startGame();
  }
  
  getParameters() {
    this.timeLimit = parseFloat(document.getElementById('timeInput').value) * 1000;
    this.gridSize  = parseInt(document.getElementById('sizeInput').value);
    this.numActiveSquares = parseInt(document.getElementById('numberInput').value);
    this.attraction = parseFloat(document.getElementById('attractionInput').value);
    const seedInputValue = document.getElementById('seedInput').value.trim();
    this.seed = seedInputValue === '' ? undefined : seedInputValue;
    if (this.randomFunc && this.seed !== this.randomFuncSeed) {this.randomFunc = undefined;}
  }
  
  startGame() {
    // Hide parameters and show game area
    this.showGameArea();
    this.initializeGrid();
    this.initializeRandomFunction();
    this.selectActiveSquares();
    
    // Hide active squares after time limit
    this.hideSquaresTimeout = setTimeout(() => {
      this.hideActiveSquares();
      this.enableUserInteraction();
    }, this.timeLimit);
    
    // Update UI elements
    this.resultDiv.style.display = 'block';
    this.confirmButton.style.display = 'inline-block';
    this.backButton.style.display = 'inline-block';
  }
  
  showGameArea() {
    this.parametersDiv.style.display = 'none';
    this.gameAreaDiv.style.display = 'block';
  }
  
  initializeGrid() {
    // Clear existing grid
    this.grid.innerHTML = '';
    this.grid.style.gridTemplateColumns = `repeat(${this.gridSize}, 55px)`;
  
    // Create new grid squares
    this.squares = [];
    for (let i = 0; i < this.gridSize * this.gridSize; i++) {
      const square = document.createElement('div');
      square.classList.add('grid-square');
      this.grid.appendChild(square);
      this.squares.push(square);
    }
  }
  
  initializeRandomFunction() {
    if (!this.randomFunc) {
      if (this.seed !== undefined) {
        const seedNumbers = cyrb128(this.seed);
        this.randomFunc = new PRNG(...seedNumbers);
        this.randomFuncSeed = this.seed;
      } else {
        this.randomFunc = Math;
      }
    }
  }
  
  selectActiveSquares() {
    this.activeIndices = [];
    while (this.activeIndices.length < this.numActiveSquares) {
      const index = Math.floor(this.getRandom() * this.squares.length);
      if (this.activeIndices.includes(index)) continue;
      if (this.shouldSkipIndex(index)) continue;
      this.activeIndices.push(index);
      this.squares[index].classList.add('active');
    }
  }
  
  shouldSkipIndex(index) {
    const indexRow = Math.floor(index / this.gridSize);
    const indexCol = index % this.gridSize;
    
    const isNotClose = this.activeIndices.every((i) => {
      const iRow = Math.floor(i / this.gridSize);
      const iCol = i % this.gridSize;
      const distance = Math.abs(indexRow - iRow) + Math.abs(indexCol - iCol);
      return distance > 1;
    });
  
    const pAttr = this.getRandom();
    const skipFar = isNotClose && pAttr < this.attraction;
    const skipClose = !isNotClose && pAttr > this.attraction;
    return skipFar || skipClose;
  }
  
  hideActiveSquares() {
    this.squares.forEach((sq) => sq.classList.remove('active'));
  }
  
  enableUserInteraction() {
    this.squares.forEach((square) => {
      square.addEventListener('pointerdown', this.handleSquarePointerDown);
      square.addEventListener('pointerenter', this.handleSquarePointerEnter);
    });
    document.addEventListener('pointerup', this.handleDocumentPointerUp);
    document.addEventListener('keydown', this.handleUserInteractionKeyDown);
  }
  
  handleSquarePointerDown = (event) => {
    if (event.target.classList.contains('grid-square')) {
      this.mouseIsDown = true;
      event.preventDefault();
      event.target.classList.toggle('selected');
    }
  };
  
  handleSquarePointerEnter = (event) => {
    if (this.mouseIsDown && event.target.classList.contains('grid-square')) {
      event.target.classList.add('selected');
    }
  };
  
  handleDocumentPointerUp = () => {this.mouseIsDown = false;};
  
  handleConfirmButtonClick() {
    if (this.isConfirmPhase) {
      this.processUserSelections();
    } else {
      this.prepareForNextRound();
    }
  }
  
  processUserSelections() {
    const userSelections = this.getUserSelections();
    const selectionDifference = userSelections.length - this.numActiveSquares;
    
    if (this.trials === 0 && selectionDifference !== 0) {
      this.handleSelectionMismatch(selectionDifference);
      this.trials++;
      return;
    }
    this.trials = 0;
    this.hideMessage();
    this.cleanupAfterSelection();
    this.showResult(userSelections);
  }
  
  getUserSelections() {
    return this.squares.reduce((indices, square, idx) => {
      if (square.classList.contains('selected')) {
        indices.push(idx);
      }
      return indices;
      }, []);
  }
  
  handleSelectionMismatch(diff) {
    if (diff > 0) {
      this.displayMessage(`Remove ${diff} highlighted square(s).`);
    } else if (diff < 0) {
      this.displayMessage(`Highlight ${-diff} more square(s).`);
    }
  }
  
  displayMessage(text) {
    this.messageElement.textContent = text;
    this.messageElement.style.textShadow = 'none';
    this.messageElement.style.display = 'block';
    setTimeout(() => {
      this.hideMessage();
    }, 2000);
  }
  
  hideMessage() {
    this.messageElement.style.display = 'none';
  }
  
  cleanupAfterSelection() {
    // Remove event listeners
    document.removeEventListener('pointerup', this.handleDocumentPointerUp);
    this.squares.forEach((square) => {
      square.removeEventListener('pointerdown', this.handleSquarePointerDown);
      square.removeEventListener('pointerenter', this.handleSquarePointerEnter);
    });
    document.removeEventListener('keydown', this.handleUserInteractionKeyDown);
  }
  
  showResult(userSelections) {
    this.highlightResults(userSelections);
    this.updateStatistics(userSelections);
    this.playFeedbackSound(userSelections);
    this.prepareForNextPhase();
  }
  
  highlightResults(userSelections) {
    this.squares.forEach((square, index) => {
    if (this.activeIndices.includes(index)) {
      if (userSelections.includes(index)) {
        square.classList.remove('selected');
        square.classList.add('active');
      } else {
        square.classList.add('missed');
      }
    } else if (userSelections.includes(index)) {
      square.classList.add('incorrect');
    }
    });
  }
  
  updateStatistics(userSelections) {
    const isCorrect = arraysEqual(
      this.activeIndices.sort(),
      userSelections.sort()
    );
    this.tasksCompleted += 1;
    if (isCorrect) {this.correctSelections += 1;}
    this.updateTaskCounter();
    this.updateAccuracyDisplay();
  }
  
  updateTaskCounter() {
    this.taskCounterValue.textContent = this.tasksCompleted;
  }
  
  updateAccuracyDisplay() {
    const accuracy = this.tasksCompleted ? Math.round((this.correctSelections / this.tasksCompleted) * 100) : 0;
    this.accuracyValue.textContent = `${accuracy}%`;
  }
  
  playFeedbackSound(userSelections) {
    if (this.soundOn) {
      const isCorrect = arraysEqual(
        this.activeIndices.sort(),
        userSelections.sort()
      );
    const soundPath = isCorrect ? 'extras/correct.wav' : 'extras/wrong.wav';
    const snd = new Audio(soundPath);
    snd.play();
    }
  }
  
  prepareForNextPhase() {
    this.isConfirmPhase = false;
    this.confirmButton.textContent = 'Play Again';
    document.addEventListener('keydown', this.handleResultKeyDown);
  }
  
  prepareForNextRound() {
    document.removeEventListener('keydown', this.handleResultKeyDown);
    this.isConfirmPhase = true;
    this.confirmButton.textContent = 'Confirm';
    this.resetGameArea();
    this.startGame();
  }
  
  resetGameArea() {
    this.resultDiv.style.display = 'none';
    this.squares.forEach((square) => {
      square.classList.remove('active', 'missed', 'incorrect', 'selected');
    });
  }
  
  handleUserInteractionKeyDown = (event) => {
    if (event.key === 'Enter' || event.code === 'Space') {
      event.preventDefault();
      this.handleConfirmButtonClick();
    }
  };
  
  handleResultKeyDown = (event) => {
    if (event.key === 'Enter' || event.code === 'Space') {
      event.preventDefault();
      this.prepareForNextRound();
    } else if (event.key === 'Escape') {
      event.preventDefault();
      this.backButtonHandler();
    }
  };
  
  handleBackButtonKey(event) {
    if (event.key === 'Escape') {
      event.preventDefault();
      if (this.backButton.style.display !== 'none') {
        this.backButton.click();
      }
    }
  }
  
  backButtonHandler() {
    clearTimeout(this.hideSquaresTimeout);
    this.resetGameParameters();
    this.cleanupAfterSelection();
    this.resetGameArea();
    
    // Hide game area and show parameters
    this.gameAreaDiv.style.display = 'none';
    this.parametersDiv.style.display = 'block';
    
    // Hide buttons
    this.confirmButton.style.display = 'none';
    this.backButton.style.display = 'none';
  }
  
  resetGameParameters() {
    this.isConfirmPhase = true;
    this.confirmButton.textContent = 'Confirm';
    this.tasksCompleted = 0;
    this.correctSelections = 0;
    this.updateTaskCounter();
    this.updateAccuracyDisplay();
    this.seed = undefined;
    this.randomFunc = undefined;
    this.randomFuncSeed = undefined;
  }
  
  getRandom() {
    return this.randomFunc === Math ? Math.random() : this.randomFunc.next();
  }
}

// Initialize the game when the DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  new MemoryGame();
});
