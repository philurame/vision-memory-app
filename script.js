// Declare the parameters and randomFunc globally
let t, s, n, seed, randomFunc;

// Event listener for startButton
document.getElementById('startButton').addEventListener('click', () => {
  t = parseFloat(document.getElementById('timeInput').value) * 1000;
  s = parseInt(document.getElementById('sizeInput').value);
  n = parseInt(document.getElementById('numberInput').value);
  seed = document.getElementById('seedInput').value;
  if (seed === '') {
    seed = undefined;
  } else if (randomFunc) {
    // If seed has changed, reset randomFunc
    if (seed !== randomFunc.seed) {
      randomFunc = undefined;
    }
  }

  if (n > s * s) {
    alert('Number of squares to remember cannot exceed total squares in the grid.');
    return;
  }

  startGame(); // Call the startGame function
});

function startGame() {
  // Hide parameters and show game area
  document.getElementById('parameters').style.display = 'none';
  document.getElementById('gameArea').style.display = 'block';

  const grid = document.getElementById('grid');
  grid.innerHTML = '';
  grid.style.gridTemplateColumns = `repeat(${s}, 55px)`;

  const squares = [];
  for (let i = 0; i < s * s; i++) {
    const square = document.createElement('div');
    square.classList.add('grid-square');
    grid.appendChild(square);
    squares.push(square);
  }

  // Initialize random number generator if not already initialized
  if (!randomFunc) {
    if (seed !== undefined) {
      // Use seeded PRNG
      const seedNumber = cyrb128(seed);
      randomFunc = new PRNG(seedNumber[0], seedNumber[1], seedNumber[2], seedNumber[3]);
      randomFunc.seed = seed; // Store the seed
    } else {
      // Use Math.random()
      randomFunc = Math;
    }
  }

  const selectedIndices = [];
  while (selectedIndices.length < n) {
    const index = Math.floor(getRandom() * squares.length);
    if (!selectedIndices.includes(index)) {
      selectedIndices.push(index);
      squares[index].classList.add('active');
    }
  }

  setTimeout(() => {
    squares.forEach(sq => sq.classList.remove('active'));
    enableUserInteraction(squares, selectedIndices);
  }, t);

  // Hide confirmButton and result in case they were visible from previous game
  const confirmButton = document.getElementById('confirmButton');
  confirmButton.style.display = 'none';
  const result = document.getElementById('result');
  result.style.display = 'none';
  result.innerHTML = ''; // Clear previous result content
}

function enableUserInteraction(squares, correctIndices) {
  const confirmButton = document.getElementById('confirmButton');
  confirmButton.style.display = 'block';

  // Remove previous event listeners from squares
  squares.forEach((square, index) => {
    const newSquare = square.cloneNode(true);
    square.parentNode.replaceChild(newSquare, square);
    squares[index] = newSquare;
  });

  squares.forEach((square) => {
    square.addEventListener('click', () => {
      square.classList.toggle('selected');
    });
  });

  // Remove previous event listener from confirmButton
  const newConfirmButton = confirmButton.cloneNode(true);
  confirmButton.parentNode.replaceChild(newConfirmButton, confirmButton);

  newConfirmButton.style.display = 'block';
  newConfirmButton.addEventListener('click', () => {
    const userSelections = [];
    squares.forEach((square, idx) => {
      if (square.classList.contains('selected')) {
        userSelections.push(idx);
      }
    });
    showResult(squares, correctIndices, userSelections);
  });
}

function showResult(squares, correctIndices, userSelections) {
  squares.forEach((square, index) => {
    if (correctIndices.includes(index)) {
      square.classList.add('active');
    } else if (userSelections.includes(index)) {
      square.classList.add('incorrect');
    }
  });

  const result = document.getElementById('result');
  result.style.display = 'block';

  const correct = arraysEqual(correctIndices.sort(), userSelections.sort());
  const num_correct = intersectionNum(correctIndices.sort(), userSelections.sort());

  if (correct) {
    result.textContent = 'NICE 💅🏻💅🏻💅🏻';
    result.classList.remove('incorrect');
    result.classList.add('correct');
  } else {
    result.textContent = `NOT NICE 🚽🚽🚽 ${num_correct}/${correctIndices.length}`;
    result.classList.remove('correct');
    result.classList.add('incorrect');
  }

  const playAgainButton = document.createElement('button');
  playAgainButton.textContent = 'Play Again';
  result.appendChild(playAgainButton);

  const backMenuButton = document.createElement('button');
  backMenuButton.textContent = 'back to menu';
  result.appendChild(backMenuButton);

  playAgainButton.addEventListener('click', () => {
    // Start game again with same parameters and same randomFunc
    startGame();
  });

  backMenuButton.addEventListener('click', () => {
    // Reset seed, randomFunc, and show parameters
    seed = undefined; // Reset the seed
    randomFunc = undefined; // Reset the random function
    document.getElementById('parameters').style.display = 'block';
    document.getElementById('gameArea').style.display = 'none';
    document.getElementById('result').style.display = 'none';
  });

  // Hide the confirmButton after showing result
  const confirmButton = document.getElementById('confirmButton');
  confirmButton.style.display = 'none';
}

function arraysEqual(a1, a2) {
  return JSON.stringify(a1) === JSON.stringify(a2);
}

function intersectionNum(a1, a2) {
  const intersectionCount = a2.filter(item => a1.includes(item)).length;
  return intersectionCount;
}

// Seedable random number generator functions

// PRNG class to maintain state
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

// Function to get random number
function getRandom() {
  if (randomFunc === Math) {
    return Math.random();
  } else {
    return randomFunc.next();
  }
}

function cyrb128(str) {
  let h1 = 1779033703, h2 = 3144134277,
    h3 = 1013904242, h4 = 2773480762;
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
