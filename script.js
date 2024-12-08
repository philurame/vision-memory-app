// Utility functions outside the class
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
    this.c = (this.c << 21 | this.c >>> 11);
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

// The MemoryGame class
class MemoryGame {
  constructor() {
    // Initialize game parameters
    this.t = 0;
    this.s = 0;
    this.n = 0;
    this.seed = undefined;
    this.randomFunc = undefined;
    this.randomFuncSeed = undefined;
    this.squares = [];
    this.selectedIndices = [];
    this.mouseIsDown = false;
    this.hideSquaresTimeout = null;

    // Get DOM elements
    this.grid = document.getElementById('grid');
    this.parametersDiv = document.getElementById('parameters');
    this.gameAreaDiv = document.getElementById('gameArea');
    this.startButton = document.getElementById('startButton');
    this.confirmButton = document.getElementById('confirmButton');
    this.resultDiv = document.getElementById('result');
    this.backButton = document.getElementById('backButton') || this.createBackButton();

    // Add event listeners
    this.startButton.addEventListener('click', this.handleStartButtonClick);
    this.backButton.addEventListener('click', this.backButtonHandler);
    document.addEventListener('keydown', this.handleBackButtonKey);
  }

  createBackButton() {
    const backButton = document.createElement('button');
    backButton.id = 'backButton';
    backButton.textContent = 'Back to Menu';
    this.gameAreaDiv.appendChild(backButton);
    return backButton;
  }

  handleStartButtonClick = () => {
    // Get parameters from inputs
    this.t = parseFloat(document.getElementById('timeInput').value) * 1000;
    this.s = parseInt(document.getElementById('sizeInput').value);
    this.n = parseInt(document.getElementById('numberInput').value);
    const seedInputValue = document.getElementById('seedInput').value;
    if (seedInputValue === '') {
      this.seed = undefined;
    } else {
      this.seed = seedInputValue;
      if (this.randomFunc && this.seed !== this.randomFuncSeed) {
        this.randomFunc = undefined;
      }
    }
    if (this.n > this.s * this.s) {
      alert('Number of squares to remember cannot exceed total squares in the grid.');
      return;
    }
    this.startGame();
  }

  startGame = () => {
    // Hide parameters and show game area
    this.parametersDiv.style.display = 'none';
    this.gameAreaDiv.style.display = 'block';

    // Clear grid and set up new grid
    this.grid.innerHTML = '';
    this.grid.style.gridTemplateColumns = `repeat(${this.s}, 55px)`;

    // Initialize squares
    this.squares = [];
    for (let i = 0; i < this.s * this.s; i++) {
      const square = document.createElement('div');
      square.classList.add('grid-square');
      this.grid.appendChild(square);
      this.squares.push(square);
    }

    // Initialize random function
    if (!this.randomFunc) {
      if (this.seed !== undefined) {
        const seedNumber = cyrb128(this.seed);
        this.randomFunc = new PRNG(...seedNumber);
        this.randomFuncSeed = this.seed;
      } else {
        this.randomFunc = Math;
      }
    }

    // Select random indices
    this.selectedIndices = [];
    while (this.selectedIndices.length < this.n) {
      const index = Math.floor(this.getRandom() * this.squares.length);
      if (!this.selectedIndices.includes(index)) {
        this.selectedIndices.push(index);
        this.squares[index].classList.add('active');
      }
    }

    // Set timeout to hide active squares
    this.hideSquaresTimeout = setTimeout(() => {
      this.squares.forEach(sq => sq.classList.remove('active'));
      this.enableUserInteraction();
    }, this.t);

    // Hide confirmButton and resultDiv
    this.confirmButton.style.display = 'none';
    this.resultDiv.style.display = 'none';
    this.resultDiv.innerHTML = '';

    // Show backButton
    this.backButton.style.display = 'block';
  }

  enableUserInteraction = () => {
    this.confirmButton.style.display = 'block';

    // Remove previous event listeners
    this.squares.forEach(square => {
      square.removeEventListener('mousedown', this.handleSquareMouseDown);
      square.removeEventListener('mouseover', this.handleSquareMouseOver);
    });

    // Add event listeners
    this.squares.forEach(square => {
      square.addEventListener('mousedown', this.handleSquareMouseDown);
      square.addEventListener('mouseover', this.handleSquareMouseOver);
    });
    document.addEventListener('mouseup', this.handleDocumentMouseUp);
    this.confirmButton.addEventListener('click', this.handleConfirmButtonClick);
    document.addEventListener('keydown', this.handleUserInteractionKeyDown);
  }

  handleSquareMouseDown = (event) => {
    if (event.target.classList.contains('grid-square')) {
      this.mouseIsDown = true;
      event.preventDefault();
      event.target.classList.toggle('selected');
    }
  }

  handleSquareMouseOver = (event) => {
    if (this.mouseIsDown && event.target.classList.contains('grid-square')) {
      event.target.classList.add('selected');
    }
  }

  handleDocumentMouseUp = () => {
    this.mouseIsDown = false;
  }

  handleConfirmButtonClick = () => {
    const userSelections = [];
    this.squares.forEach((square, idx) => {
      if (square.classList.contains('selected')) {
        userSelections.push(idx);
      }
    });

    // const diff = userSelections.length - this.n;
    // if (diff > 0) {
    //   alert(`Remove ${diff} highlighted squares.`);
    //   return;
    // } else if (diff < 0) {
    //   alert(`Highlight ${-diff} more squares.`);
    //   return;
    // }
    const diff = userSelections.length - this.n;
    const messageElement = document.getElementById('message');

    if (diff > 0) {
      messageElement.textContent = `Remove ${diff} highlighted squares.`;
      messageElement.style.display = 'block';  // Show message
      setTimeout(() => {
        messageElement.style.display = 'none';  // Hide message after 3 seconds
      }, 2000);
      return;
    } else if (diff < 0) {
      messageElement.textContent = `Highlight ${-diff} more squares.`;
      messageElement.style.display = 'block';  // Show message
      setTimeout(() => {
        messageElement.style.display = 'none';  // Hide message after 3 seconds
      }, 2000);
      return;
    }

    messageElement.style.display = 'none'

    // Remove event listeners
    document.removeEventListener('mouseup', this.handleDocumentMouseUp);
    this.squares.forEach(square => {
      square.removeEventListener('mousedown', this.handleSquareMouseDown);
      square.removeEventListener('mouseover', this.handleSquareMouseOver);
    });
    this.confirmButton.removeEventListener('click', this.handleConfirmButtonClick);
    document.removeEventListener('keydown', this.handleUserInteractionKeyDown);

    this.showResult(userSelections);
  }

  handleUserInteractionKeyDown = (event) => {
    if (event.key === 'Enter' || event.key === ' ' || event.code === 'Space') {
      event.preventDefault();
      this.handleConfirmButtonClick();
    }
  }

  showResult = (userSelections) => {
    const correctIndices = this.selectedIndices;

    this.squares.forEach((square, index) => {
      if (correctIndices.includes(index)) {
        if (userSelections.includes(index)) {
          square.classList.add('correct');
        } else {
          square.classList.add('active');
        }
      } else if (userSelections.includes(index)) {
        square.classList.add('incorrect');
      }
    });

    this.resultDiv.style.display = 'block';

    // const correct = this.arraysEqual(correctIndices.sort(), userSelections.sort());
    // const num_correct = this.intersectionNum(correctIndices, userSelections);

    // if (correct) {
    //   this.resultDiv.textContent = 'OK!';
    //   this.resultDiv.classList.remove('incorrect');
    //   this.resultDiv.classList.add('correct');
    // } else {
    //   this.resultDiv.textContent = 'NOT OK!';
    //   this.resultDiv.classList.remove('correct');
    //   this.resultDiv.classList.add('incorrect');
    // }

    // Create 'Play Again' and 'Back to Menu' buttons
    const playAgainButton = document.createElement('button');
    playAgainButton.textContent = 'Play Again';
    this.resultDiv.appendChild(playAgainButton);

    const backMenuButton = document.createElement('button');
    backMenuButton.textContent = 'Back to Menu';
    this.resultDiv.appendChild(backMenuButton);

    // Add event listeners
    playAgainButton.addEventListener('click', this.handlePlayAgainClick);
    backMenuButton.addEventListener('click', this.handleBackMenuClick);

    // Keydown handler
    document.addEventListener('keydown', this.handleResultKeyDown);

    // Hide confirmButton and backButton
    this.confirmButton.style.display = 'none';
    this.backButton.style.display = 'none';
  }

  handlePlayAgainClick = () => {
    // Reset resultDiv
    this.resultDiv.style.display = 'none';
    this.resultDiv.innerHTML = '';
    // Start game again with same parameters
    this.startGame();
    document.removeEventListener('keydown', this.handleResultKeyDown);
  }

  handleBackMenuClick = () => {
    // Reset seed and randomFunc
    this.seed = undefined;
    this.randomFunc = undefined;
    this.randomFuncSeed = undefined;
    // Hide game area and show parameters
    this.gameAreaDiv.style.display = 'none';
    this.parametersDiv.style.display = 'block';
    this.resultDiv.style.display = 'none';
    this.resultDiv.innerHTML = '';
    // Hide backButton
    this.backButton.style.display = 'none';
    document.removeEventListener('keydown', this.handleResultKeyDown);
  }

  handleResultKeyDown = (event) => {
    if (event.key === 'Enter' || event.key === ' ' || event.code === 'Space') {
      event.preventDefault();
      this.handlePlayAgainClick();
    } else if (event.key === 'Escape') {
      event.preventDefault();
      this.handleBackMenuClick();
    }
  }

  handleBackButtonKey = (event) => {
    if (event.key === 'Escape') {
      event.preventDefault();
      if (this.backButton.style.display !== 'none') {
        this.backButton.click();
      }
    }
  }

  backButtonHandler = () => {
    clearTimeout(this.hideSquaresTimeout);

    // Remove event listeners
    document.removeEventListener('mouseup', this.handleDocumentMouseUp);
    this.squares.forEach(square => {
      square.removeEventListener('mousedown', this.handleSquareMouseDown);
      square.removeEventListener('mouseover', this.handleSquareMouseOver);
    });
    this.confirmButton.removeEventListener('click', this.handleConfirmButtonClick);
    document.removeEventListener('keydown', this.handleUserInteractionKeyDown);

    // Reset seed and randomFunc
    this.seed = undefined;
    this.randomFunc = undefined;
    this.randomFuncSeed = undefined;

    // Hide game area and show parameters
    this.gameAreaDiv.style.display = 'none';
    this.parametersDiv.style.display = 'block';

    // Hide confirmButton and backButton
    this.confirmButton.style.display = 'none';
    this.backButton.style.display = 'none';
      
    // Reset grid
    this.grid.innerHTML = '';
  }
      
    getRandom = () => {
      if (this.randomFunc === Math) {
        return Math.random();
      } else {
        return this.randomFunc.next();
      }
    }
      
    arraysEqual = (a1, a2) => {
      return JSON.stringify(a1) === JSON.stringify(a2);
    }
      
    // intersectionNum = (a1, a2) => {
    //   const setA = new Set(a1);
    //   const intersection = a2.filter(x => setA.has(x));
    //   return intersection.length;
    // }
  }
      
  
// Initialize the game when the DOM is ready
document.addEventListener('DOMContentLoaded', () => {
new MemoryGame();
});
