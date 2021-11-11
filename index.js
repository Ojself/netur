const game = new Game()
game.setup()

// Event listener
$(document).on('keypress', window, (e) => {
  if (game.allowInput) {
    const key = e.key.toLowerCase();
    if (
      ((key >= 'a' && key <= 'z') || 'æøå'.includes(key)) && e.keyCode != 13) {
      game.checkLetter(key);
      game.updateGameState();
      renderGameState(game.score, game.lives)
    }
  }
});

$('#playButton').click(() => {
  showPlay();
  game.init();
});

$('#endButton').click(() => {
  if (game.allowInput) {
    game.gameOver();
  }
});

$('#retryButton').click(() => {
  game.setup();
  showPlay();
});

$('#quitButton').click((e) => {
  e.preventDefault();
  $('#game').hide();
  $('#home').show();
  $('#mapmarker').show();
  game.exitGame();
});