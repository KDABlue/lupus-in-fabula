let players = [];
let playerStatus = [];
let roles = ['Werewolf', 'Seer', 'Villager', 'Prostitute', 'Vigilant'];
let currentActionIndex = 0;
let wolvesVictim = null;
let protectedPlayer = null;
let blockedPlayer = null;

const actions = [
    "Night falls: Everyone close your eyes.",
    "Werewolves, open your eyes and choose a victim.",
    "Werewolves, close your eyes.",
    "Seer, open your eyes and choose someone to reveal.",
    "Seer, close your eyes.",
    "Prostitute, open your eyes and choose someone to block.",
    "Prostitute, close your eyes.",
    "Vigilant, open your eyes and choose someone to protect.",
    "Vigilant, close your eyes.",
    "Everyone wake up."
];

document.addEventListener("DOMContentLoaded", () => {
    if (localStorage.getItem('players')) {
        players = JSON.parse(localStorage.getItem('players'));
        playerStatus = JSON.parse(localStorage.getItem('playerStatus'));
        currentActionIndex = parseInt(localStorage.getItem('currentActionIndex'));
        document.getElementById('player-form').style.display = 'none';
        document.getElementById('player-inputs').style.display = 'none';
        document.getElementById('actions').style.display = 'block';
        document.getElementById('player-status').style.display = 'block';
        document.getElementById('reset-buttons').style.display = 'block';
        updateAction();
        updatePlayerStatus();
    }
});

function generatePlayerInputs() {
    const numPlayers = document.getElementById('num-players').value;
    const playerInputsDiv = document.getElementById('player-inputs');
    const playersForm = document.getElementById('players-form');

    playersForm.innerHTML = '';
    for (let i = 0; i < numPlayers; i++) {
        const input = document.createElement('input');
        input.type = 'text';
        input.placeholder = `Player ${i + 1} name`;
        input.className = 'player-name';
        input.required = true;
        playersForm.appendChild(input);
    }
    
    playerInputsDiv.style.display = 'block';
}

function startGame() {
    const playerInputs = document.querySelectorAll('.player-name');
    players = Array.from(playerInputs).map(input => input.value);
    
    if (players.length > 0) {
        assignRoles();
        document.getElementById('player-form').style.display = 'none';
        document.getElementById('player-inputs').style.display = 'none';
        document.getElementById('actions').style.display = 'block';
        document.getElementById('player-status').style.display = 'block';
        document.getElementById('reset-buttons').style.display = 'block';
        
        currentActionIndex = 0;
        updateAction();
        updatePlayerStatus();
        saveGameState();
    }
}

function assignRoles() {
    const numPlayers = players.length;
    let allRoles = [];
    for (let i = 0; i < numPlayers; i++) {
        allRoles.push(roles[i % roles.length]);
    }
    allRoles = shuffle(allRoles);
    
    playerStatus = players.map((player, index) => {
        return { name: player, role: allRoles[index], alive: true };
    });
}

function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

function updateAction() {
    document.getElementById('current-action').textContent = actions[currentActionIndex];
    document.getElementById('action-inputs').style.display = (currentActionIndex === 1 || currentActionIndex === 7 || currentActionIndex === 5) ? 'block' : 'none';
    if (currentActionIndex === 1) {
        document.getElementById('wolves-victim').style.display = 'block';
        document.getElementById('villagers-victim').style.display = 'none';
        document.getElementById('prostitute-block').style.display = 'none';
    } else if (currentActionIndex === 5) {
        document.getElementById('wolves-victim').style.display = 'none';
        document.getElementById('villagers-victim').style.display = 'none';
        document.getElementById('prostitute-block').style.display = 'block';
    } else if (currentActionIndex === 7) {
        document.getElementById('wolves-victim').style.display = 'none';
        document.getElementById('villagers-victim').style.display = 'block';
        document.getElementById('prostitute-block').style.display = 'none';
    } else {
        document.getElementById('wolves-victim').style.display = 'none';
        document.getElementById('villagers-victim').style.display = 'none';
        document.getElementById('prostitute-block').style.display = 'none';
    }
}

function nextAction() {
    if (currentActionIndex === 1 && !document.getElementById('wolves-victim').value) {
        alert("Please input the Werewolves' victim.");
        return;
    } else if (currentActionIndex === 7 && !document.getElementById('villagers-victim').value) {
        alert("Please input the Villager to protect.");
        return;
    } else if (currentActionIndex === 5 && !document.getElementById('prostitute-block').value) {
        alert("Please input the Prostitute's block.");
        return;
    }

    if (currentActionIndex === 1) {
        wolvesVictim = document.getElementById('wolves-victim').value;
    } else if (currentActionIndex === 5) {
        blockedPlayer = document.getElementById('prostitute-block').value;
    } else if (currentActionIndex === 7) {
        protectedPlayer = document.getElementById('villagers-victim').value;
    }

    currentActionIndex = (currentActionIndex + 1) % actions.length;

    if (currentActionIndex === 0) {
        if (wolvesVictim && wolvesVictim !== protectedPlayer && wolvesVictim !== blockedPlayer) {
            killPlayer(wolvesVictim);
        }
        wolvesVictim = null;
        protectedPlayer = null;
        blockedPlayer = null;
    }

    updateAction();
    updatePlayerStatus();
    saveGameState();
}

function killPlayer(playerName) {
    const player = playerStatus.find(p => p.name === playerName && p.alive);
    if (player) {
        player.alive = false;
    }
}

function updatePlayerStatus() {
    const playersStatusList = document.getElementById('players-status-list');
    playersStatusList.innerHTML = '';
    playerStatus.forEach(player => {
        const playerEntry = document.createElement('div');
        playerEntry.className = 'player-entry';
        playerEntry.textContent = `${player.name} (${player.role}) - ${player.alive ? 'Alive' : 'Dead'}`;
        if (!player.alive) {
            playerEntry.classList.add('dead-player');
        }
        playersStatusList.appendChild(playerEntry);
    });
}

function saveGameState() {
    localStorage.setItem('players', JSON.stringify(players));
    localStorage.setItem('playerStatus', JSON.stringify(playerStatus));
    localStorage.setItem('currentActionIndex', currentActionIndex.toString());
}

function resetCurrentGame() {
    assignRoles();
    playerStatus.forEach(player => player.alive = true);
    currentActionIndex = 0;
    updateAction();
    updatePlayerStatus();
    saveGameState();
}

function resetAll() {
    localStorage.removeItem('players');
    localStorage.removeItem('playerStatus');
    localStorage.removeItem('currentActionIndex');
    window.location.reload();
}
