// Game State
const gameState = {
    isRunning: false,
    currentPhase: 'day',
    dayCount: 1,
    groups: {
        1: { players: [], maxPlayers: 15, werewolves: 0, villagers: 0 },
        2: { players: [], maxPlayers: 15, werewolves: 0, villagers: 0 },
        3: { players: [], maxPlayers: 15, werewolves: 0, villagers: 0 },
        4: { players: [], maxPlayers: 15, werewolves: 0, villagers: 0 }
    },
    currentPlayer: null
};

const ROLES = {
    VILLAGER: 'Villager',
    WEREWOLF: 'Werewolf',
    SEER: 'Seer',
    DOCTOR: 'Doctor'
};

function showMenu() {
    document.getElementById('mainMenu').classList.remove('hidden');
    document.getElementById('setupSection').classList.add('hidden');
    document.getElementById('gameBoard').classList.add('hidden');
    document.getElementById('rulesSection').classList.add('hidden');
}

function startGame() {
    document.getElementById('mainMenu').classList.add('hidden');
    document.getElementById('setupSection').classList.remove('hidden');
}

function joinGame() {
    document.getElementById('mainMenu').classList.add('hidden');
    document.getElementById('setupSection').classList.remove('hidden');
}

function showRules() {
    document.getElementById('mainMenu').classList.add('hidden');
    document.getElementById('rulesSection').classList.remove('hidden');
}

function backToMenu() {
    showMenu();
}

function joinSelectedGroup() {
    const playerName = document.getElementById('playerName').value.trim();
    const groupSelect = parseInt(document.getElementById('groupSelect').value);
    
    if (!playerName) {
        alert('Please enter your name');
        return;
    }
    
    const group = gameState.groups[groupSelect];
    if (group.players.length >= group.maxPlayers) {
        alert('Group is full! Max 15 players per group');
        return;
    }
    
    const role = assignRole(group);
    
    const player = {
        id: Date.now() + Math.random(),
        name: playerName,
        role: role,
        group: groupSelect,
        alive: true
    };
    
    group.players.push(player);
    gameState.currentPlayer = player;
    
    if (role === ROLES.WEREWOLF) {
        group.werewolves++;
    } else {
        group.villagers++;
    }
    
    document.getElementById('setupSection').classList.add('hidden');
    document.getElementById('gameBoard').classList.remove('hidden');
    gameState.isRunning = true;
    
    updateGameBoard();
}

function assignRole(group) {
    const rand = Math.random();
    if (rand < 0.33) return ROLES.WEREWOLF;
    if (rand < 0.66) return ROLES.VILLAGER;
    if (rand < 0.83) return ROLES.SEER;
    return ROLES.DOCTOR;
}

function updateGameBoard() {
    for (let i = 1; i <= 4; i++) {
        updateGroup(i);
    }
    
    document.getElementById('phase').textContent = gameState.currentPhase === 'day' ? 'Day' : 'Night';
    document.getElementById('dayNight').textContent = gameState.dayCount;
    
    const totalAlive = Object.values(gameState.groups)
        .reduce((sum, group) => sum + group.players.filter(p => p.alive).length, 0);
    document.getElementById('playersAlive').textContent = totalAlive;
}

function updateGroup(groupNum) {
    const group = gameState.groups[groupNum];
    const groupElement = document.getElementById(`group${groupNum}`);
    const playersListElement = document.getElementById(`group${groupNum}-players`);
    const aliveCount = group.players.filter(p => p.alive).length;
    
    groupElement.querySelector('h3').textContent = `Group ${groupNum} (${aliveCount}/${group.maxPlayers})`;
    
    playersListElement.innerHTML = '';
    group.players.forEach(player => {
        const playerDiv = document.createElement('div');
        playerDiv.className = `player ${player.alive ? 'alive' : 'dead'}`;
        playerDiv.innerHTML = `
            <span>${player.name}</span>
            <span class="player-role">${player.role}${!player.alive ? ' ☠️' : ''}</span>
        `;
        playersListElement.appendChild(playerDiv);
    });
}

function nextPhase() {
    if (!gameState.isRunning) {
        alert('Game is not running');
        return;
    }
    
    if (gameState.currentPhase === 'day') {
        gameState.currentPhase = 'night';
    } else {
        gameState.currentPhase = 'day';
        gameState.dayCount++;
    }
    
    updateGameBoard();
    checkWinCondition();
}

function castVote(isVoting) {
    if (!gameState.isRunning) {
        alert('Game is not running');
        return;
    }
    
    if (gameState.currentPhase !== 'day') {
        alert('Voting only happens during the day phase');
        return;
    }
    
    const group = gameState.groups[gameState.currentPlayer.group];
    const votablePlayers = group.players.filter(p => p.alive && p.id !== gameState.currentPlayer.id);
    
    if (votablePlayers.length === 0) {
        alert('No one to vote for!');
        return;
    }
    
    let message = 'Vote out which player?\n\n';
    votablePlayers.forEach((player, index) => {
        message += `${index + 1}. ${player.name} (${player.role})\n`;
    });
    
    const index = prompt(message) - 1;
    
    if (index >= 0 && index < votablePlayers.length) {
        votablePlayers[index].alive = false;
        alert(`${votablePlayers[index].name} has been voted out!`);
        updateGameBoard();
    }
}

function checkWinCondition() {
    for (let groupNum = 1; groupNum <= 4; groupNum++) {
        const group = gameState.groups[groupNum];
        const werewolvesAlive = group.players.filter(p => p.alive && p.role === ROLES.WEREWOLF).length;
        const villagersAlive = group.players.filter(p => p.alive && p.role !== ROLES.WEREWOLF).length;
        
        if (werewolvesAlive === 0 && villagersAlive > 0) {
            alert(`Group ${groupNum}: Villagers Win!`);
        } else if (werewolvesAlive >= villagersAlive && villagersAlive > 0) {
            alert(`Group ${groupNum}: Werewolves Win!`);
        }
    }
}

function endGame() {
    if (confirm('Are you sure you want to end the game?')) {
        gameState.isRunning = false;
        gameState.currentPhase = 'day';
        gameState.dayCount = 1;
        gameState.groups = {
            1: { players: [], maxPlayers: 15, werewolves: 0, villagers: 0 },
            2: { players: [], maxPlayers: 15, werewolves: 0, villagers: 0 },
            3: { players: [], maxPlayers: 15, werewolves: 0, villagers: 0 },
            4: { players: [], maxPlayers: 15, werewolves: 0, villagers: 0 }
        };
        showMenu();
    }
}

window.addEventListener('load', () => {
    showMenu();
});
