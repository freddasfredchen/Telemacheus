let hatchTimer = null;

function beginPhoenixSequence() {
  phoenixPending = true;
  clearInterval(messageRotateInterval);
  updatePetState();
  updateStatusMsg();
  showSpeech(rand(MESSAGES.phoenixWarn));
  saveState();

  setTimeout(() => {
    showSpeech('🔥 Ich... verwandle mich...!! 🔥');
    spawnFireParticles();
  }, 2000);

  setTimeout(() => {
    triggerFlash();
    brunoEl.style.animation = 'phoenixVanish 0.7s ease-out forwards';
    setTimeout(() => {
      brunoEl.style.display = 'none';
      brunoEl.style.animation = '';
      phoenixPending = false;
      isEgg = true;
      state.isEgg = true;
      saveState();
      updatePetState();
      updateStatusMsg();
      showSpeech('🥚 Ein Ei! Warte auf das Schlüpfen, Lea! 🔥');
      spawnFireParticles();
      showToast('🔥 Bruno verwandelt sich! Phönix-Modus!');
      scheduleHatch();
    }, 700);
  }, 4000);
}

function scheduleHatch() {
  clearTimeout(hatchTimer);
  hatchTimer = setTimeout(() => {
    const egg = $('egg');
    ['c1', 'c2', 'c3'].forEach(c => {
      const el = document.createElement('div');
      el.className = `egg-crack ${c}`;
      egg.appendChild(el);
    });
    egg.classList.add('wobbling');
    showSpeech('🥚 Es bewegt sich!! Fast da!! 🐣');
    setTimeout(hatchEgg, 2000);
  }, HATCH_DELAY_MS - 2000);
}

function hatchEgg() {
  const egg = $('egg');
  egg.classList.remove('wobbling');
  egg.classList.add('hatching');
  triggerFlash();
  spawnFireParticles();

  setTimeout(() => {
    $('eggWrap').classList.remove('show');
    egg.classList.remove('hatching');
    egg.innerHTML = '';
    isEgg = false;
    state.isEgg = false;
    state.generation = (state.generation || 1) + 1;
    state.water    = 90;
    state.food     = 90;
    state.exercise = 80;
    state.age      = 0;
    saveState();

    brunoEl.style.display = '';
    brunoEl.style.animation = 'newBrunoAppear 0.9s ease-out forwards';
    setTimeout(() => { brunoEl.style.animation = ''; updatePetState(); }, 900);

    updateBars();
    updatePetState();
    updateStatusMsg();
    spawnFireParticles();

    const g = state.generation;
    showSpeech(`✨ ICH BIN WIEDER DA!! Generation ${g} – stärker als je zuvor! 🐣🔥`);
    showToast(`🐣 Bruno Gen.${g} ist geschlüpft!`);
    startMessageRotation();
  }, 700);
}
