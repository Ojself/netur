class Game {
    constructor(){
        this.allowInput = true;
        this.isPlaying = false;
        this.employees = [];
        this.employeesLeft = [];
        this.lives = 15;
        this.score = 0;
        this.highScore = 0
        this.currentName = "";
        this.usedLetters = [];
        this.correctLetters = [];
    }
    async setup(){
      showMenu();
      this.highScore = getLocalHighScore();
      const fetchedEmployees = await fetchEmployees();
      this.employees = fetchedEmployees;
      this.employeesLeft = fetchedEmployees;
      renderGameState(this.score, this.lives)
    }
    
    init(){
      this.resetGame()
      this.isPlaying = true
      this.changeEmployee()  
    }
  
    changeEmployee(){
        this.usedLetters = []
        this.correctLetters = [];

        const randomEmployee = this.employeesLeft[Math.floor(Math.random() * this.employeesLeft.length)]
        this.currentName = randomEmployee && randomEmployee.name ? randomEmployee.name : '';
        if (!this.currentName)return renderError("No employees to be found")

        $('#employeeImage').attr('src', randomEmployee.img);


  // letters
  const letters = [...this.currentName].map((letter) => {
    
    let id = ""
    let className = "";
    let hidden = "";

    // Assign class based on letter to apply styles
    if ([' ', '-', '.'].includes(letter)) {
        className = 'symbol';
    } else {
      id = normalizeLetters(letter).toLowerCase();
      className = 'letterContainer';
      hidden = "hidden"
    }
    return `<div class="${className}"><div class="${hidden} letter ${id}">${letter.toUpperCase()}</div></div>`;
  });
  $('#nameSection').append(letters);

    }
    increaseScore(){
        this.score++;
    }
    decreaseLives(){
        this.lives--;
    }
    resetGame(){
        this.score = 0;
        this.lives = 15;
        this.employeesLeft = this.employees.slice();
        this.isPlaying = true
        this.highScore = getLocalHighScore();
        resetImageRender();
        resetGameView();
    }


 checkLetter (letter) {
  if (this.correctLetters.includes(letter) || this.usedLetters.includes(letter)) {
    scaleLetter(letter);
    return;
  }
  for (const c of normalizeLetters(this.currentName).toLowerCase()) {
    if (letter === c) {
      this.correctLetters.push(letter);
      showCorrectLetter(letter);
      return;
    }
  }
  this.usedLetters.push(letter);
  showWrongLetter(letter);
  this.decreaseLives();
  return;
};

 updateGameState () {
  if (this.lives <= 0) {
    $('#endButton').removeClass('red');
    this.allowInput = false;
    showWrongName();
    setTimeout(function () {
      gameOver();
      this.allowInput = true;
      $('#endButton').addClass('red');
    }, 4000);
  } else {
    let win = true;
    const nameIter = normalizeLetters(this.currentName)
      .toLowerCase()
      .split(' ')
      .join('')
      .split('-')
      .join('')
      .split('.')
      .join('');
    for (const c of nameIter) {
      if (!this.correctLetters.includes(c)) {
        win = false;
        break;
      }
    }
    if (win) {
      $('#endButton').removeClass('red');
      showCorrectName();
      this.increaseScore();
      this.allowInput = false;
      setTimeout(() => {
        if (this.employeesLeft.length === 0) {
          this.gameOver(true);
        } else {
          this.roundWin();
        }
        $('#endButton').addClass('red');
        this.allowInput = true;
      }, 2500);
    }
  }
};

// Game navigation
roundWin () {
  resetGameView();
  this.changeEmployee();
};

gameOver (gameWin = false) {
  if (this.score > this.highScore) {
    setNewHighScore(this.score, this.highScore);
  }
  this.isPlaying = false;
  this.showFinish();
  this.renderFinish(gameWin, this.score, this.employees.length, this.highScore);
};

exitGame () {
  hideAll();
};
}

// Render functions
 const showWrongLetter = (letter) => {
  $('#alphabet').append(
    `<div class="letterContainer wrong"><div class="letter ${letter}">${letter.toUpperCase()}</div></div>`
  );
};

 const showCorrectLetter = (letter) => {
  $(`.letter.${letter.toLowerCase()}`).removeClass('hidden');
};

 const showCorrectName = () => {
  $('#nameSection .letterContainer').addClass('isCorrectName');
  $('#nameSection .letterContainer').addClass('no-underline');
};

 const showWrongName = () => {
  $('.letter.hidden').css('font-weight', 'bold');
  $(`.letter.hidden`).addClass('isWrongName');
  $(`.letter.hidden`).removeClass('hidden');
  $('#nameSection .letterContainer').addClass('no-underline');
};

 const scaleLetter = (letter) => {
  $(`.${letter}`).addClass('letter-scale');
  setTimeout(() => {
    $(`.${letter}`).removeClass('letter-scale');
  }, 200);
};

 const resetGameView = () => {
  $('#nameSection').empty();
  $('#alphabet').empty();
};

 const resetImageRender = () => {
  $('#employeeImage').attr('src', '');
};

 const renderGameState = (score, lives) => {
  $('#scoreLabel').html('Poeng: ' + score);
  $('#livesLabel').html('Antall liv: ' + lives);
};

 const renderFinish = (win, score, numOfEmployees, highScore) => {
  if (win) {
    $('#finishTitle').html('Gratulerer, du vant!');
  } else {
    $('#finishTitle').html('Du tapte!');
  }
  $('#score').html(score + ' av ' + numOfEmployees);
  $('#highScore').html('Din rekord: ' + highScore);
};

 const fetchEmployees = async () => {
  $('#loading').show();
  $('#loadingFinished').hide();
  $('#loadingError').hide();
  try {
    const result = await getEmployees()
    $('#loading').hide();
    $('#loadingFinished').show();
    $('#loadingError').hide();
    return result
  } catch (error) {
    renderError(error)
  }
};

const renderError = (error) => {
  console.error(error)
  showMenu()
  $('#loading').hide();
  $('#loadingFinished').hide();
  $('#loadingError').show();
  $('#loadingError').html(
    'Feil ved innlasting av spill. Sørg for at du er logget inn på enturas.atlassian.net, og last inn spillet på nytt.'
  );
}


 const showMenu = () => {
  $('#menu').show();
  $('#play').hide();
  $('#finish').hide();
};
 const showPlay = () => {
  $('#menu').hide();
  $('#play').show();
  $('#finish').hide();
  $('#play').focus();
};
 const showFinish = () => {
  $('#menu').hide();
  $('#play').hide();
  $('#finish').show();
};
 const hideAll = () => {
  $('#menu').hide();
  $('#play').hide();
  $('#finish').hide();
};


// helpers
 const getLocalHighScore =  () => {
  const highScore = localStorage.getItem('neTurNameGameScore');
  return highScore || 0
};

 const setNewHighScore =  (currentScore, highScore) => {
  if (currentScore > highScore) {
    localStorage.setItem('neTurNameGameScore', score);
  }
};

const normalizeLetters = (letters) => {
  return letters
    .normalize('NFD')
    .replace(/(a)([\u0300-\u036f])/g, 'å')
    .replace(/(A)([\u0300-\u036f])/g, 'Å')
    .replace(/[\u0300-\u036f]/g, '');
};

