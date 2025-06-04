import * as THREE from 'three';
import { Game } from './game.js';
import { NetworkManager } from './network.js';

class App {
  constructor() {
    this.game = new Game();
    this.network = new NetworkManager();
    // Make network instance globally accessible
    window.network = this.network;
    this.setupEventListeners();
    this.setupNetworkCallbacks();
  }

  setupEventListeners() {
    const hostBtn = document.getElementById('host-btn');
    const joinBtn = document.getElementById('join-btn');
    const playerNameInput = document.getElementById('player-name');
    const joinCodeInput = document.getElementById('join-code');
    const colorOptions = document.querySelectorAll('.color-option');

    let selectedColor = '#ff0000';
    colorOptions.forEach(option => {
      option.addEventListener('click', () => {
        colorOptions.forEach(opt => opt.classList.remove('selected'));
        option.classList.add('selected');
        selectedColor = option.dataset.color;
      });
    });

    hostBtn.addEventListener('click', () => this.hostGame(playerNameInput.value, selectedColor));
    joinBtn.addEventListener('click', () => this.joinGame(joinCodeInput.value, playerNameInput.value, selectedColor));
  }

  setupNetworkCallbacks() {
    this.network.onPlayerJoined = (playerId, playerData) => {
      console.log('Player joined:', playerId, playerData);
      this.game.addPlayer(playerId, playerData);
    };

    this.network.onPlayerLeft = (playerId) => {
      console.log('Player left:', playerId);
      this.game.removePlayer(playerId);
    };

    this.network.onConnectionStatusChanged = (status) => {
      console.log('Connection status changed:', status);
    };

    this.network.onPositionUpdate = (playerId, position) => {
      console.log('Position update from player:', playerId, position);
      this.game.updatePlayerPosition(playerId, position);
    };
  }

  async hostGame(playerName, color) {
    if (!playerName) {
      alert('Please enter your name');
      return;
    }

    try {
      const roomCode = await this.network.hostGame();
      this.network.playerData = { name: playerName, color };
      
      document.getElementById('ui-container').classList.add('hidden');
      document.getElementById('game-ui').classList.remove('hidden');
      document.getElementById('room-code').textContent = `Room Code: ${roomCode}`;
      
      this.game.addPlayer(this.network.peer.id, { name: playerName, color });
      this.game.setLocalPlayerId(this.network.peer.id);
      this.game.start();
    } catch (error) {
      console.error('Failed to host game:', error);
      alert('Failed to host game. Please try again.');
    }
  }

  async joinGame(roomCode, playerName, color) {
    if (!roomCode || !playerName) {
      alert('Please enter both room code and your name');
      return;
    }

    try {
      await this.network.joinGame(roomCode, { name: playerName, color });
      
      document.getElementById('ui-container').classList.add('hidden');
      document.getElementById('game-ui').classList.remove('hidden');
      document.getElementById('room-code').textContent = `Room Code: ${roomCode}`;
      
      this.game.addPlayer(this.network.peer.id, { name: playerName, color });
      this.game.setLocalPlayerId(this.network.peer.id);
      this.game.start();
    } catch (error) {
      console.error('Failed to join game:', error);
      alert('Failed to join game. Please check the room code and try again.');
    }
  }
}

// Start the app when the page loads
window.addEventListener('load', () => {
  new App();
}); 