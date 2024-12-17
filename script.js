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

function mobileAndTabletCheck() {
  let check = false;
  (function(a){if(/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino|android|ipad|playbook|silk/i.test(a)||/1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0,4))) check = true;})(navigator.userAgent||navigator.vendor||window.opera);
  return check;
};

// The MemoryGame class
class MemoryGame {
  constructor() {
    // Initialize game parameters
    this.t = 0;
    this.s = 0;
    this.n = 0;
    this.attr = 0;
    this.seed = undefined;
    this.randomFunc = undefined;
    this.randomFuncSeed = undefined;
    this.squares = [];
    this.selectedIndices = [];
    this.mouseIsDown = false;
    this.hideSquaresTimeout = null;
    this.trials = 0;

    this.isMobile = mobileAndTabletCheck();
    // 'touchstart' if (this.isMobile) else 'mousedown';
    if (this.isMobile) {
      this.mouseDown = 'touchstart';
      this.mouseUp   = 'touchend';
      this.mouseOver = 'touchmove';
    } else {
      this.mouseDown = 'mousedown';
      this.mouseUp   = 'mouseup';
      this.mouseOver = 'mouseover';
    }

    // Initialize sound
    this.soundOn = true;

    // Initialize task counter and accuracy tracking
    this.tasksCompleted = 0;
    this.gameResults = [];

    // Confirm/play again buttons
    this.is_confirm = true;

    // Get DOM elements
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

    // Add event listeners
    this.startButton.addEventListener('click', this.handleStartButtonClick);
    this.confirmButton.addEventListener('click', this.handleConfirmButtonClick);
    this.backButton.addEventListener('click', this.backButtonHandler);
    document.addEventListener('keydown', this.handleBackButtonKey);
    this.soundButton.addEventListener('click', this.handleSoundButtonClick);
  }

  handleSoundButtonClick = () => {
    this.soundOn = !this.soundOn;
    this.soundButton.textContent = this.soundOn ? '🔈' : '🔇';
  }

  handleStartButtonClick = () => {

    // Get parameters from inputs
    this.t = parseFloat(document.getElementById('timeInput').value) * 1000;
    this.s = parseInt(document.getElementById('sizeInput').value);
    this.n = parseInt(document.getElementById('numberInput').value);
    this.attr = parseFloat(document.getElementById('attractionInput').value);
    this.tasksWindow = parseInt(document.getElementById('tasksWindow').value);
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
      const messageElement = document.getElementById('message');
      messageElement.textContent = 'Num of squares cannot exceed total squares in the grid';
      // no shadow:
      messageElement.style.textShadow = 'none';
      messageElement.style.display = 'block';
      setTimeout(() => {
        messageElement.style.display = 'none';
      }, 2000);
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

    this.selectedIndices = [];
    while (this.selectedIndices.length < this.n) {
      const index = Math.floor(this.getRandom() * this.squares.length);

      if (!this.selectedIndices.includes(index)) {

        // attraction logic
        const indexRow = Math.floor(index / this.s);
        const indexCol = index % this.s;
        const is_not_close = this.selectedIndices.every(i => {
          const iRow = Math.floor(i / this.s);
          const iCol = i % this.s;
          const distance = Math.abs(indexRow - iRow) + Math.abs(indexCol - iCol);
          return distance > 1; // True if index is not adjacent to i
        });
        const p_attr = this.getRandom();
        const skip_far = is_not_close && (p_attr < this.attr);
        const skip_close = !is_not_close && (p_attr > this.attr);
        if (skip_far || skip_close) {
          continue;
        }

        this.selectedIndices.push(index);
        this.squares[index].classList.add('active');
      }
    }

    // Set timeout to hide active squares
    this.hideSquaresTimeout = setTimeout(() => {
      this.squares.forEach(sq => sq.classList.remove('active'));
      this.enableUserInteraction();
    }, this.t);

    this.resultDiv.style.display = 'block';

    this.confirmButton.style.display = 'inline-block';
    this.backButton.style.display = 'inline-block';
  }

  enableUserInteraction = () => {
    // Remove previous event listeners
    this.squares.forEach(square => {
      square.removeEventListener(this.mouseDown, this.handleSquareMouseDown);
      square.removeEventListener(this.mouseOver, this.handleSquareMouseOver);
    });

    // Add event listeners
    this.squares.forEach(square => {
      square.addEventListener(this.mouseDown, this.handleSquareMouseDown);
      square.addEventListener(this.mouseOver, this.handleSquareMouseOver);
    });
    document.addEventListener(this.mouseUp, this.handleDocumentMouseUp);
    this.confirmButton.removeEventListener('click', this.handleConfirmButtonClick);
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
    if (this.is_confirm===true) {
      const userSelections = [];
      this.squares.forEach((square, idx) => {
        if (square.classList.contains('selected')) {
          userSelections.push(idx);
        }
      });

      const diff = userSelections.length - this.n;
      const messageElement = document.getElementById('message');
      if (this.trials === 0) {
        if (diff > 0) {
          messageElement.textContent = `Remove ${diff} highlighted squares.`;
          messageElement.style.textShadow = 'none';
          messageElement.style.display = 'block'; // Show message
          setTimeout(() => {
            messageElement.style.display = 'none'; // Hide message after 2 seconds
          }, 2000);
          this.trials++;
          return;
        } else if (diff < 0) {
          messageElement.textContent = `Highlight ${-diff} more squares.`;
          messageElement.style.textShadow = 'none';
          messageElement.style.display = 'block'; // Show message
          setTimeout(() => {
            messageElement.style.display = 'none'; // Hide message after 2 seconds
          }, 2000);
          this.trials++;
          return;
        }
      } else this.trials = 0;

      messageElement.style.display = 'none';

      // Remove event listeners
      document.removeEventListener(this.mouseUp, this.handleDocumentMouseUp);
      this.squares.forEach(square => {
        square.removeEventListener(this.mouseDown, this.handleSquareMouseDown);
        square.removeEventListener(this.mouseOver, this.handleSquareMouseOver);
      });
      document.removeEventListener('keydown', this.handleUserInteractionKeyDown);

      this.showResult(userSelections);
    } else {
      document.removeEventListener('keydown', this.handleResultKeyDown);
      this.is_confirm = true;
      this.confirmButton.textContent = 'Confirm';
      this.handlePlayAgainClick();
    }
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
          square.classList.remove('selected');
          square.classList.add('active');
        } else {
          square.classList.add('missed');
        }
      } else if (userSelections.includes(index)) {
        square.classList.add('incorrect');
      }
    });

    this.resultDiv.style.display = 'block';

    const correct = this.arraysEqual(correctIndices.sort(), userSelections.sort());

    // Update tasksCompleted and gameResults
    this.tasksCompleted += 1;
    this.gameResults.push(correct);
    if (this.gameResults.length > this.tasksWindow) {
      this.gameResults.shift(); // Keep last N results
    }

    this.updateTaskCounter();
    this.updateAccuracyDisplay();

    if (this.soundOn) {
      const sound_path = correct ? "extras/correct.wav" : "extras/wrong.wav";
      var snd = new Audio(sound_path);
      snd.play();
    }

    // Create 'Play Again' button
    this.is_confirm = false;
    this.confirmButton.textContent = 'Play Again';
    
    // Keydown handler
    document.addEventListener('keydown', this.handleResultKeyDown);
  }

  updateTaskCounter = () => {
    this.taskCounterValue.textContent = this.tasksCompleted;
  }

  updateAccuracyDisplay = () => {
    const totalGames = this.gameResults.length;
    const correctGames = this.gameResults.filter(result => result).length;
    const accuracy = totalGames > 0 ? Math.round((correctGames / totalGames) * 100) : 0;
    this.accuracyValue.textContent = accuracy + '%';
  }

  handlePlayAgainClick = () => {
    this.is_confirm = true;
    this.confirmButton.textContent = 'Confirm';
    // Reset resultDiv
    this.resultDiv.style.display = 'none';
    // Start game again with same parameters
    this.startGame();
    document.removeEventListener('keydown', this.handleUserInteractionKeyDown);
    document.removeEventListener('keydown', this.handleResultKeyDown);
  }

  handleResultKeyDown = (event) => {
    if (event.key === 'Enter' || event.key === ' ' || event.code === 'Space') {
      event.preventDefault();
      this.handlePlayAgainClick();
    } else if (event.key === 'Escape') {
      event.preventDefault();
      this.backButtonHandler(); // Use backButtonHandler for consistency
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
    this.is_confirm = true;
    this.confirmButton.textContent = 'Confirm';
    this.tasksCompleted = 0;
    this.gameResults = [];
    this.updateTaskCounter();
    this.updateAccuracyDisplay();

    // Remove event listeners
    document.removeEventListener(this.mouseUp, this.handleDocumentMouseUp);
    this.squares.forEach(square => {
      square.removeEventListener(this.mouseDown, this.handleSquareMouseDown);
      square.removeEventListener(this.mouseOver, this.handleSquareMouseOver);
    });
    this.confirmButton.removeEventListener('click', this.handleConfirmButtonClick);
    document.removeEventListener('keydown', this.handleUserInteractionKeyDown);
    document.removeEventListener('keydown', this.handleResultKeyDown);

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

    // Reset grid and resultDiv
    this.grid.innerHTML = '';
    this.resultDiv.style.display = 'none';

    document.getElementById('message').style.display = 'none';
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
}

// Initialize the game when the DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  new MemoryGame();
});
