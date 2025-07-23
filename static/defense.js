// Tower Defense Game for AntEmpire
document.addEventListener('DOMContentLoaded', function() {
  // Cargar la imagen de la torre básica o usar un fallback
  const torreBasica = new Image();
  torreBasica.src = 'static/images/torreBasica.png';
  
  // Variable para controlar si la imagen se cargó correctamente
  let imagenCargada = false;
  
  // Debug image loading
  torreBasica.onload = function() {
    console.log('Torre básica cargada correctamente');
    imagenCargada = true;
  };
  
  torreBasica.onerror = function() {
    console.error('Error al cargar la imagen de la torre básica - usando fallback');
    // No intentar usar la imagen si hay error
    imagenCargada = false;
  };
  
  // Configuración simple para torres
  const towerSize = 40; // Tamaño fijo para todas las torres
  
  // Tower image is loaded at the top of the file: torreBasica
  
  // Game Canvas Setup
  const canvas = document.getElementById('gameCanvas');
  const ctx = canvas.getContext('2d');
  const gameOverlay = document.getElementById('gameOverlay');
  const gameMessage = document.getElementById('gameMessage');
  const startGameBtn = document.getElementById('startGameBtn');
  const startWaveBtn = document.getElementById('startWaveBtn');
  const speedBtn = document.getElementById('speedBtn');
  const sellTowerBtn = document.getElementById('sellTowerBtn');
  const upgradeTowerBtn = document.getElementById('upgradeTowerBtn');
  const battleLog = document.getElementById('battleLog');
  const healthValue = document.getElementById('healthValue');
  const healthBarFill = document.getElementById('healthBarFill');
  
  // Game State
  let gameState = {
    isPlaying: false,
    isPaused: false,
    isWaveActive: false,
    gameSpeed: 1,
    resources: 50,
    score: 0,
    wave: 1,
    maxWaves: 10,
    health: 100,
    maxHealth: 100,
    selectedTower: null,
    selectedTowerType: null, // Para la selección de torres
    towers: [],
    enemies: [],
    projectiles: [],
    lastFrameTime: 0,
    enemySpawnTimer: 0,
    enemiesSpawned: 0,
    enemiesPerWave: 10,
    waveCompleted: false,
    waveTimer: 30, // Temporizador para la próxima oleada
    showRangePreview: false, // Para mostrar la previsualización del rango
    rangePreviewX: 0,
    rangePreviewY: 0,
    rangePreviewRadius: 0
  };
  
  // Game Map
  const map = {
    width: canvas.width,
    height: canvas.height,
    tileSize: 40,
    path: [],
    startPoint: { x: 0, y: 5 },
    endPoint: { x: 14, y: 5 }
  };
  
  // Generate path from start to end
  function generatePath() {
    map.path = [];
    
    // Start with a simple path
    let currentX = map.startPoint.x;
    let currentY = map.startPoint.y;
    
    // Add start point
    map.path.push({ x: currentX * map.tileSize, y: currentY * map.tileSize });
    
    // Create a zigzag path
    const waypoints = [
      { x: 2, y: 5 },
      { x: 2, y: 2 },
      { x: 5, y: 2 },
      { x: 5, y: 8 },
      { x: 8, y: 8 },
      { x: 8, y: 3 },
      { x: 12, y: 3 },
      { x: 12, y: 5 },
      { x: map.endPoint.x, y: map.endPoint.y }
    ];
    
    waypoints.forEach(point => {
      map.path.push({ x: point.x * map.tileSize, y: point.y * map.tileSize });
    });
  }
  
  // Tower Types
  const towerTypes = {
    basic: {
      name: "Hormiga Soldado",
      cost: 10,
      damage: 10,
      range: 100,
      fireRate: 1, // shots per second
      projectileSpeed: 5,
      color: '#a3c644',
      upgradeCost: 5,
      upgradeMultiplier: 1.2
    },
    shooter: {
      name: "Hormiga Arquera",
      cost: 20,
      damage: 15,
      range: 150,
      fireRate: 0.8,
      projectileSpeed: 8,
      color: '#3498db',
      upgradeCost: 10,
      upgradeMultiplier: 1.3
    },
    bomber: {
      name: "Hormiga Bombardera",
      cost: 30,
      damage: 25,
      range: 120,
      fireRate: 0.5,
      projectileSpeed: 4,
      color: '#e67e22',
      areaEffect: true,
      areaRadius: 50,
      upgradeCost: 15,
      upgradeMultiplier: 1.4
    }
  };
  
  // Enemy Types
  const enemyTypes = {
    basic: {
      name: "Escarabajo",
      health: 50,
      speed: 1,
      reward: 5,
      damage: 5,
      color: '#e74c3c',
      size: 15
    },
    fast: {
      name: "Araña",
      health: 30,
      speed: 2,
      reward: 8,
      damage: 3,
      color: '#9b59b6',
      size: 12
    },
    scout: {
      name: "Hormiga Exploradora",
      health: 20,
      speed: 3,
      reward: 7,
      damage: 2,
      color: '#2ecc71',
      size: 10
    },
    soldier: {
      name: "Hormiga Soldado",
      health: 70,
      speed: 1.5,
      reward: 10,
      damage: 8,
      color: '#f39c12',
      size: 18
    },
    wasp: {
      name: "Avispa",
      health: 40,
      speed: 4,
      reward: 12,
      damage: 6,
      color: '#f1c40f',
      size: 14
    },
    beetle: {
      name: "Escarabajo Gigante",
      health: 150,
      speed: 0.7,
      reward: 15,
      damage: 10,
      color: '#8e44ad',
      size: 22
    },
    boss: {
      name: "Ciempiés",
      health: 200,
      speed: 0.5,
      reward: 20,
      damage: 15,
      color: '#34495e',
      size: 25
    }
  };
  
  // Initialize Game
  function initGame() {
    generatePath();
    updateResourceDisplay();
    updateHealthDisplay();
    
    // Setup drag and drop for towers
    setupTowerDragDrop();
    
    // Setup tower selection panel
    setupTowerSelectionPanel();
    
    // Setup tower context menu
    setupTowerContextMenu();
    
    // Hide wave timer initially
    document.getElementById('waveTimer').style.display = 'none';
    
    // Event listeners
    startGameBtn.addEventListener('click', startGame);
    startWaveBtn.addEventListener('click', startWave);
    speedBtn.addEventListener('click', toggleGameSpeed);
    sellTowerBtn.addEventListener('click', sellSelectedTower);
    upgradeTowerBtn.addEventListener('click', upgradeSelectedTower);
    document.getElementById('deselectTowerBtn').addEventListener('click', deselectTower);
    canvas.addEventListener('click', handleCanvasClick);
    
    // Mouse move for range preview
    canvas.addEventListener('mousemove', handleMouseMove);
    
    // Touch events for mobile
    canvas.addEventListener('touchstart', handleTouchStart);
    canvas.addEventListener('touchmove', handleTouchMove);
    canvas.addEventListener('touchend', handleTouchEnd);
    
    // Keyboard shortcuts
    document.addEventListener('keydown', function(e) {
      // Escape key to deselect tower and cancel tower placement
      if (e.key === 'Escape') {
        if (gameState.selectedTowerType) {
          // Cancel tower placement
          gameState.selectedTowerType = null;
          gameState.showRangePreview = false;
          document.querySelectorAll('.tower-select-btn').forEach(b => b.classList.remove('selected'));
        } else if (gameState.selectedTower) {
          // Deselect tower
          deselectTower();
        }
      }
    });
  }
  
  // Setup tower selection panel
  function setupTowerSelectionPanel() {
    const towerSelectBtns = document.querySelectorAll('.tower-select-btn');
    const cancelBtn = document.getElementById('cancelTowerSelection');
    
    towerSelectBtns.forEach(btn => {
      if (btn.id !== 'cancelTowerSelection') {
        btn.addEventListener('click', function() {
          // Deselect all buttons
          towerSelectBtns.forEach(b => b.classList.remove('selected'));
          
          // Select this button
          this.classList.add('selected');
          
          // Set selected tower type
          gameState.selectedTowerType = this.dataset.type;
          
          // Show range preview
          gameState.showRangePreview = true;
          gameState.rangePreviewRadius = towerTypes[gameState.selectedTowerType].range;
        });
      }
    });
    
    // Setup cancel button
    cancelBtn.addEventListener('click', function() {
      // Deselect all buttons
      towerSelectBtns.forEach(b => b.classList.remove('selected'));
      
      // Clear tower selection
      gameState.selectedTowerType = null;
      gameState.showRangePreview = false;
      
      // Also deselect any selected tower
      deselectTower();
    });
  }
  
  // Setup tower context menu
  function setupTowerContextMenu() {
    const contextMenu = document.getElementById('towerContextMenu');
    const upgradeBtn = document.getElementById('upgradeTowerContextBtn');
    const sellBtn = document.getElementById('sellTowerContextBtn');
    const cancelBtn = document.getElementById('cancelContextBtn');
    
    upgradeBtn.addEventListener('click', function() {
      if (gameState.selectedTower) {
        upgradeSelectedTower();
        hideContextMenu();
      }
    });
    
    sellBtn.addEventListener('click', function() {
      if (gameState.selectedTower) {
        sellSelectedTower();
        hideContextMenu();
      }
    });
    
    cancelBtn.addEventListener('click', hideContextMenu);
    
    function hideContextMenu() {
      contextMenu.style.display = 'none';
    }
    
    // Close context menu when clicking outside
    document.addEventListener('click', function(e) {
      if (!contextMenu.contains(e.target) && e.target !== contextMenu) {
        hideContextMenu();
      }
    });
  }
  
  // Show context menu for tower
  function showContextMenu(tower, x, y) {
    const contextMenu = document.getElementById('towerContextMenu');
    const upgradeBtn = document.getElementById('upgradeTowerContextBtn');
    
    // Update upgrade button text
    const upgradeCost = Math.floor(towerTypes[tower.type].upgradeCost * Math.pow(tower.level, 1.5));
    upgradeBtn.textContent = `Mejorar (${upgradeCost} 🍃)`;
    upgradeBtn.disabled = gameState.resources < upgradeCost;
    
    // Update sell button text
    const sellValue = Math.floor(getTowerTotalCost(tower) * 0.7);
    document.getElementById('sellTowerContextBtn').textContent = `Vender (+${sellValue} 🍃)`;
    
    // Position and show menu
    contextMenu.style.display = 'flex';
    
    // Adjust position to keep menu within viewport
    const rect = canvas.getBoundingClientRect();
    let menuX = x;
    let menuY = y;
    
    const menuWidth = contextMenu.offsetWidth;
    const menuHeight = contextMenu.offsetHeight;
    
    if (menuX + menuWidth > rect.right) {
      menuX = rect.right - menuWidth - 10;
    }
    
    if (menuY + menuHeight > rect.bottom) {
      menuY = rect.bottom - menuHeight - 10;
    }
    
    contextMenu.style.left = `${menuX}px`;
    contextMenu.style.top = `${menuY}px`;
  }
  
  // Setup tower drag and drop
  function setupTowerDragDrop() {
    const towerOptions = document.querySelectorAll('.tower-option');
    
    towerOptions.forEach(option => {
      option.addEventListener('dragstart', function(e) {
        e.dataTransfer.setData('towerType', this.dataset.type);
      });
    });
    
    canvas.addEventListener('dragover', function(e) {
      e.preventDefault();
    });
    
    canvas.addEventListener('drop', function(e) {
      e.preventDefault();
      const towerType = e.dataTransfer.getData('towerType');
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      placeTower(towerType, x, y);
    });
  }
  
  // Place tower on the map
  function placeTower(type, x, y) {
    // Check if tower type exists
    if (!towerTypes[type]) return;
    
    // Check if player has enough resources
    if (gameState.resources < towerTypes[type].cost) {
      logMessage(`No tienes suficientes hojas para construir ${towerTypes[type].name}`);
      return;
    }
    
    // Round to grid
    const gridX = Math.floor(x / map.tileSize) * map.tileSize + map.tileSize / 2;
    const gridY = Math.floor(y / map.tileSize) * map.tileSize + map.tileSize / 2;
    
    // Check if position is valid (not on path)
    if (isOnPath(gridX, gridY)) {
      logMessage("No puedes construir en el camino");
      return;
    }
    
    // Check if there's already a tower here
    if (isTowerAt(gridX, gridY)) {
      logMessage("Ya hay una torre en esta posición");
      return;
    }
    
    // Create tower
    const tower = {
      type: type,
      x: gridX,
      y: gridY,
      damage: towerTypes[type].damage,
      range: towerTypes[type].range,
      fireRate: towerTypes[type].fireRate,
      projectileSpeed: towerTypes[type].projectileSpeed,
      color: towerTypes[type].color,
      lastFired: 0,
      level: 1,
      target: null,
      areaEffect: towerTypes[type].areaEffect || false,
      areaRadius: towerTypes[type].areaRadius || 0,
      direction: 0 // 0: down, 1: left, 2: right, 3: up
    };
    
    // Add tower to game state
    gameState.towers.push(tower);
    
    // Deduct resources
    gameState.resources -= towerTypes[type].cost;
    updateResourceDisplay();
    
    logMessage(`${towerTypes[type].name} construida`);
  }
  
  // Check if position is on the enemy path
  function isOnPath(x, y) {
    const buffer = map.tileSize / 2;
    
    for (let i = 0; i < map.path.length - 1; i++) {
      const start = map.path[i];
      const end = map.path[i + 1];
      
      // Check if point is on horizontal segment
      if (start.y === end.y && y >= start.y - buffer && y <= start.y + buffer) {
        const minX = Math.min(start.x, end.x) - buffer;
        const maxX = Math.max(start.x, end.x) + buffer;
        if (x >= minX && x <= maxX) return true;
      }
      
      // Check if point is on vertical segment
      if (start.x === end.x && x >= start.x - buffer && x <= start.x + buffer) {
        const minY = Math.min(start.y, end.y) - buffer;
        const maxY = Math.max(start.y, end.y) + buffer;
        if (y >= minY && y <= maxY) return true;
      }
    }
    
    return false;
  }
  
  // Check if there's already a tower at position
  function isTowerAt(x, y) {
    return gameState.towers.some(tower => 
      Math.abs(tower.x - x) < map.tileSize / 2 && 
      Math.abs(tower.y - y) < map.tileSize / 2
    );
  }
  
  // Handle canvas click (select tower or place tower)
  function handleCanvasClick(e) {
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // Hide context menu
    document.getElementById('towerContextMenu').style.display = 'none';
    
    // If a tower type is selected, try to place it
    if (gameState.selectedTowerType) {
      placeTowerAtPosition(gameState.selectedTowerType, x, y);
      return;
    }
    
    // Check if clicked on a tower
    const tower = getTowerAtPosition(x, y);
    
    // If clicked on the currently selected tower, deselect it
    if (tower === gameState.selectedTower) {
      deselectTower();
      return;
    }
    
    // Otherwise, try to select a tower
    selectTowerAtPosition(x, y, e.clientX, e.clientY);
  }
  
  // Deselect current tower
  function deselectTower() {
    gameState.selectedTower = null;
    sellTowerBtn.disabled = true;
    upgradeTowerBtn.disabled = true;
    document.getElementById('towerInfo').innerHTML = '<p>Selecciona una torre para ver su información</p>';
    document.getElementById('upgradePanel').innerHTML = '<p>Selecciona una torre colocada para mejorarla</p>';
  }
  
  // Handle mouse move for range preview
  function handleMouseMove(e) {
    if (gameState.showRangePreview && gameState.selectedTowerType) {
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      // Round to grid
      gameState.rangePreviewX = Math.floor(x / map.tileSize) * map.tileSize + map.tileSize / 2;
      gameState.rangePreviewY = Math.floor(y / map.tileSize) * map.tileSize + map.tileSize / 2;
    }
  }
  
  // Handle touch start
  function handleTouchStart(e) {
    e.preventDefault(); // Prevent scrolling
    
    if (e.touches.length === 1) {
      const touch = e.touches[0];
      const rect = canvas.getBoundingClientRect();
      const x = touch.clientX - rect.left;
      const y = touch.clientY - rect.top;
      
      // Store touch start position and time for long press detection
      gameState.touchStartX = x;
      gameState.touchStartY = y;
      gameState.touchStartTime = Date.now();
      
      // Check if touching a tower for potential long press
      gameState.touchedTower = getTowerAtPosition(x, y);
      
      // If a tower type is selected, show range preview
      if (gameState.selectedTowerType) {
        gameState.showRangePreview = true;
        gameState.rangePreviewX = Math.floor(x / map.tileSize) * map.tileSize + map.tileSize / 2;
        gameState.rangePreviewY = Math.floor(y / map.tileSize) * map.tileSize + map.tileSize / 2;
      }
    }
  }
  
  // Handle touch move
  function handleTouchMove(e) {
    e.preventDefault(); // Prevent scrolling
    
    if (e.touches.length === 1 && gameState.showRangePreview && gameState.selectedTowerType) {
      const touch = e.touches[0];
      const rect = canvas.getBoundingClientRect();
      const x = touch.clientX - rect.left;
      const y = touch.clientY - rect.top;
      
      // Update range preview position
      gameState.rangePreviewX = Math.floor(x / map.tileSize) * map.tileSize + map.tileSize / 2;
      gameState.rangePreviewY = Math.floor(y / map.tileSize) * map.tileSize + map.tileSize / 2;
      
      // Cancel long press if moved too far
      if (gameState.touchedTower && 
          (Math.abs(x - gameState.touchStartX) > 10 || 
           Math.abs(y - gameState.touchStartY) > 10)) {
        gameState.touchedTower = null;
      }
    }
  }
  
  // Handle touch end
  function handleTouchEnd(e) {
    e.preventDefault(); // Prevent default behavior
    
    const now = Date.now();
    const rect = canvas.getBoundingClientRect();
    
    // Check for long press on tower (500ms)
    if (gameState.touchedTower && (now - gameState.touchStartTime) >= 500) {
      // Show context menu for tower
      const tower = gameState.touchedTower;
      gameState.selectedTower = tower;
      
      // Calculate position for context menu
      const menuX = rect.left + tower.x;
      const menuY = rect.top + tower.y;
      
      showContextMenu(tower, menuX, menuY);
      updateTowerInfoPanel(tower);
    } 
    // Normal tap
    else if (e.changedTouches.length === 1) {
      const touch = e.changedTouches[0];
      const x = touch.clientX - rect.left;
      const y = touch.clientY - rect.top;
      
      // If a tower type is selected, place it
      if (gameState.selectedTowerType) {
        placeTowerAtPosition(gameState.selectedTowerType, x, y);
      } 
      // Otherwise try to select a tower
      else {
        selectTowerAtPosition(x, y, touch.clientX, touch.clientY);
      }
    }
    
    // Reset touch data
    gameState.touchedTower = null;
  }
  
  // Place tower at position
  function placeTowerAtPosition(type, x, y) {
    // Round to grid
    const gridX = Math.floor(x / map.tileSize) * map.tileSize + map.tileSize / 2;
    const gridY = Math.floor(y / map.tileSize) * map.tileSize + map.tileSize / 2;
    
    // Try to place tower
    placeTower(type, gridX, gridY);
  }
  
  // Select tower at position
  function selectTowerAtPosition(x, y, clientX, clientY) {
    // Deselect current tower
    gameState.selectedTower = null;
    sellTowerBtn.disabled = true;
    upgradeTowerBtn.disabled = true;
    
    // Check if clicked on a tower
    const tower = getTowerAtPosition(x, y);
    
    if (tower) {
      gameState.selectedTower = tower;
      sellTowerBtn.disabled = false;
      
      // Enable upgrade button if player has enough resources
      const upgradeCost = Math.floor(towerTypes[tower.type].upgradeCost * Math.pow(tower.level, 1.5));
      upgradeTowerBtn.disabled = gameState.resources < upgradeCost;
      
      updateTowerInfoPanel(tower);
      
      // Show context menu on mobile
      if (window.innerWidth <= 768) {
        showContextMenu(tower, clientX, clientY);
      }
    } else {
      // If no tower selected, clear info panel
      document.getElementById('towerInfo').innerHTML = '<p>Selecciona una torre para ver su información</p>';
      document.getElementById('upgradePanel').innerHTML = '<p>Selecciona una torre colocada para mejorarla</p>';
    }
  }
  
  // Get tower at position
  function getTowerAtPosition(x, y) {
    for (let i = 0; i < gameState.towers.length; i++) {
      const tower = gameState.towers[i];
      const distance = Math.sqrt(Math.pow(tower.x - x, 2) + Math.pow(tower.y - y, 2));
      
      if (distance <= map.tileSize / 2) {
        return tower;
      }
    }
    
    return null;
  }
  
  // Update tower info panel
  function updateTowerInfoPanel(tower) {
    const towerInfo = document.getElementById('towerInfo');
    const upgradePanel = document.getElementById('upgradePanel');
    const type = towerTypes[tower.type];
    
    towerInfo.innerHTML = `
      <h3>${type.name} (Nivel ${tower.level})</h3>
      <div>Daño: ${tower.damage.toFixed(1)}</div>
      <div>Alcance: ${tower.range}</div>
      <div>Velocidad: ${tower.fireRate.toFixed(2)} disparos/s</div>
    `;
    
    const upgradeCost = Math.floor(type.upgradeCost * Math.pow(tower.level, 1.5));
    upgradePanel.innerHTML = `
      <h3>Mejora a Nivel ${tower.level + 1}</h3>
      <div>Coste: ${upgradeCost} 🍃</div>
      <div>Daño: +${(tower.damage * (type.upgradeMultiplier - 1)).toFixed(1)}</div>
      <div>Alcance: +${Math.floor(tower.range * 0.1)}</div>
    `;
    
    // Update upgrade button text
    upgradeTowerBtn.textContent = `Mejorar (${upgradeCost} 🍃)`;
    upgradeTowerBtn.disabled = gameState.resources < upgradeCost;
    
    // Update sell button text
    const sellValue = Math.floor(getTowerTotalCost(tower) * 0.7);
    sellTowerBtn.textContent = `Vender (+${sellValue} 🍃)`;
  }
  
  // Get total cost of tower including upgrades
  function getTowerTotalCost(tower) {
    const baseCost = towerTypes[tower.type].cost;
    let upgradeCost = 0;
    
    for (let i = 1; i < tower.level; i++) {
      upgradeCost += Math.floor(towerTypes[tower.type].upgradeCost * Math.pow(i, 1.5));
    }
    
    return baseCost + upgradeCost;
  }
  
  // Sell selected tower
  function sellSelectedTower() {
    if (!gameState.selectedTower) return;
    
    const tower = gameState.selectedTower;
    const sellValue = Math.floor(getTowerTotalCost(tower) * 0.7);
    
    // Remove tower from game state
    const index = gameState.towers.indexOf(tower);
    if (index !== -1) {
      gameState.towers.splice(index, 1);
    }
    
    // Add resources
    gameState.resources += sellValue;
    updateResourceDisplay();
    
    // Reset selection
    gameState.selectedTower = null;
    sellTowerBtn.disabled = true;
    upgradeTowerBtn.disabled = true;
    
    document.getElementById('towerInfo').innerHTML = '<p>Selecciona una torre para ver su información</p>';
    document.getElementById('upgradePanel').innerHTML = '<p>Selecciona una torre colocada para mejorarla</p>';
    
    logMessage(`Torre vendida por ${sellValue} hojas`);
  }
  
  // Upgrade selected tower
  function upgradeSelectedTower() {
    if (!gameState.selectedTower) return;
    
    const tower = gameState.selectedTower;
    const type = towerTypes[tower.type];
    const upgradeCost = Math.floor(type.upgradeCost * Math.pow(tower.level, 1.5));
    
    // Check if player has enough resources
    if (gameState.resources < upgradeCost) {
      logMessage("No tienes suficientes hojas para mejorar esta torre");
      return;
    }
    
    // Upgrade tower
    tower.level++;
    tower.damage *= type.upgradeMultiplier;
    tower.range += Math.floor(tower.range * 0.1);
    
    // Deduct resources
    gameState.resources -= upgradeCost;
    updateResourceDisplay();
    
    // Update tower info panel
    updateTowerInfoPanel(tower);
    
    logMessage(`${type.name} mejorada a nivel ${tower.level}`);
  }
  
  // Start the game
  function startGame() {
    gameState.isPlaying = true;
    gameOverlay.style.display = 'none';
    logMessage("¡Juego iniciado! Coloca torres y prepárate para la primera oleada.");
    
    // Start game loop
    requestAnimationFrame(gameLoop);
  }
  
  // Start a wave of enemies
  function startWave() {
    if (gameState.isWaveActive) return;
    
    gameState.isWaveActive = true;
    gameState.enemiesSpawned = 0;
    gameState.enemySpawnTimer = 0;
    gameState.waveCompleted = false;
    
    // Disable start wave button
    startWaveBtn.disabled = true;
    
    // Hide wave timer
    document.getElementById('waveTimer').style.display = 'none';
    
    logMessage(`¡Oleada ${gameState.wave} iniciada!`);
  }
  
  // Toggle game speed
  function toggleGameSpeed() {
    const speeds = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
    const currentIndex = speeds.indexOf(gameState.gameSpeed);
    gameState.gameSpeed = speeds[(currentIndex + 1) % speeds.length];
    
    speedBtn.textContent = `Velocidad: x${gameState.gameSpeed}`;
  }
  
  // Spawn enemy
  function spawnEnemy() {
    let enemyType;
    
    // Determine enemy type based on wave and randomness
    const rand = Math.random();
    
    if (gameState.wave >= 9 && rand < 0.2) {
      enemyType = 'boss';
    } else if (gameState.wave >= 8 && rand < 0.3) {
      enemyType = 'beetle';
    } else if (gameState.wave >= 6 && rand < 0.3) {
      enemyType = 'wasp';
    } else if (gameState.wave >= 5 && rand < 0.4) {
      enemyType = 'soldier';
    } else if (gameState.wave >= 3 && rand < 0.4) {
      enemyType = 'scout';
    } else if (gameState.wave >= 2 && rand < 0.5) {
      enemyType = 'fast';
    } else {
      enemyType = 'basic';
    }
    
    // Scale enemy health based on wave
    const healthMultiplier = 1 + (gameState.wave - 1) * 0.2;
    
    const enemy = {
      type: enemyType,
      x: map.path[0].x,
      y: map.path[0].y,
      health: enemyTypes[enemyType].health * healthMultiplier,
      maxHealth: enemyTypes[enemyType].health * healthMultiplier,
      speed: enemyTypes[enemyType].speed,
      reward: enemyTypes[enemyType].reward,
      damage: enemyTypes[enemyType].damage,
      color: enemyTypes[enemyType].color,
      size: enemyTypes[enemyType].size,
      pathIndex: 0,
      progress: 0,
      direction: 0 // Will be updated based on movement
    };
    
    gameState.enemies.push(enemy);
    gameState.enemiesSpawned++;
  }
  
  // Move enemies along the path
  function moveEnemies(deltaTime) {
    for (let i = gameState.enemies.length - 1; i >= 0; i--) {
      const enemy = gameState.enemies[i];
      
      // Calculate movement
      const currentPoint = map.path[enemy.pathIndex];
      const nextPoint = map.path[enemy.pathIndex + 1];
      
      if (!nextPoint) {
        // Enemy reached the end
        gameState.health -= enemy.damage;
        gameState.enemies.splice(i, 1);
        
        updateHealthDisplay();
        logMessage(`¡Un ${enemyTypes[enemy.type].name} alcanzó el hormiguero! (-${enemy.damage} salud)`);
        
        // Check if game over
        if (gameState.health <= 0) {
          gameOver(false);
        }
        
        continue;
      }
      
      // Calculate direction and distance
      const dx = nextPoint.x - currentPoint.x;
      const dy = nextPoint.y - currentPoint.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      
      // Update enemy direction based on movement
      if (Math.abs(dx) > Math.abs(dy)) {
        enemy.direction = dx < 0 ? 1 : 2; // left or right
      } else {
        enemy.direction = dy < 0 ? 3 : 0; // up or down
      }
      
      // Move enemy along path
      enemy.progress += (enemy.speed * gameState.gameSpeed * deltaTime) / distance;
      
      if (enemy.progress >= 1) {
        // Move to next path segment
        enemy.pathIndex++;
        enemy.progress = 0;
      } else {
        // Update position
        enemy.x = currentPoint.x + dx * enemy.progress;
        enemy.y = currentPoint.y + dy * enemy.progress;
      }
    }
  }
  
  // Tower targeting and firing
  function updateTowers(deltaTime) {
    for (const tower of gameState.towers) {
      // Find target if none
      if (!tower.target || !isEnemyAlive(tower.target)) {
        tower.target = findNearestEnemy(tower);
      }
      
      // Check if target is in range
      if (tower.target && isEnemyInRange(tower, tower.target)) {
        // Update tower direction to face the target
        updateTowerDirection(tower);
        
        // Fire at target if cooldown elapsed
        tower.lastFired += deltaTime;
        if (tower.lastFired >= 1 / tower.fireRate) {
          fireTower(tower);
          tower.lastFired = 0;
        }
      } else {
        tower.target = null;
      }
    }
  }
  
  // Función vacía para mantener compatibilidad
  function updateTowerDirection(tower) {
    // Ya no necesitamos actualizar la dirección de la torre
    return;
  }
  
  // Check if enemy is still alive
  function isEnemyAlive(enemy) {
    return gameState.enemies.includes(enemy);
  }
  
  // Find nearest enemy in range
  function findNearestEnemy(tower) {
    let nearestEnemy = null;
    let nearestDistance = Infinity;
    
    for (const enemy of gameState.enemies) {
      const distance = Math.sqrt(
        Math.pow(tower.x - enemy.x, 2) + 
        Math.pow(tower.y - enemy.y, 2)
      );
      
      if (distance <= tower.range && distance < nearestDistance) {
        nearestEnemy = enemy;
        nearestDistance = distance;
      }
    }
    
    return nearestEnemy;
  }
  
  // Check if enemy is in tower range
  function isEnemyInRange(tower, enemy) {
    const distance = Math.sqrt(
      Math.pow(tower.x - enemy.x, 2) + 
      Math.pow(tower.y - enemy.y, 2)
    );
    
    return distance <= tower.range;
  }
  
  // Fire tower at target
  function fireTower(tower) {
    if (!tower.target) return;
    
    if (tower.areaEffect) {
      // Area effect tower (bomber)
      damageEnemiesInArea(tower.target.x, tower.target.y, tower.areaRadius, tower.damage);
    } else {
      // Create projectile
      const projectile = {
        x: tower.x,
        y: tower.y,
        targetX: tower.target.x,
        targetY: tower.target.y,
        target: tower.target,
        speed: tower.projectileSpeed * gameState.gameSpeed,
        damage: tower.damage,
        color: tower.color,
        size: 5
      };
      
      gameState.projectiles.push(projectile);
    }
  }
  
  // Damage enemies in area
  function damageEnemiesInArea(x, y, radius, damage) {
    for (const enemy of gameState.enemies) {
      const distance = Math.sqrt(
        Math.pow(x - enemy.x, 2) + 
        Math.pow(y - enemy.y, 2)
      );
      
      if (distance <= radius) {
        // Apply damage with falloff based on distance
        const falloff = 1 - (distance / radius);
        const actualDamage = damage * falloff;
        damageEnemy(enemy, actualDamage);
      }
    }
  }
  
  // Update projectiles
  function updateProjectiles(deltaTime) {
    for (let i = gameState.projectiles.length - 1; i >= 0; i--) {
      const projectile = gameState.projectiles[i];
      
      // Calculate direction
      const dx = projectile.targetX - projectile.x;
      const dy = projectile.targetY - projectile.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      
      if (distance < 5 || !isEnemyAlive(projectile.target)) {
        // Projectile hit target or target is gone
        if (isEnemyAlive(projectile.target)) {
          damageEnemy(projectile.target, projectile.damage);
        }
        
        gameState.projectiles.splice(i, 1);
        continue;
      }
      
      // Move projectile
      const speed = projectile.speed * deltaTime;
      projectile.x += (dx / distance) * speed;
      projectile.y += (dy / distance) * speed;
    }
  }
  
  // Apply damage to enemy
  function damageEnemy(enemy, damage) {
    enemy.health -= damage;
    
    if (enemy.health <= 0) {
      // Enemy defeated
      const index = gameState.enemies.indexOf(enemy);
      if (index !== -1) {
        gameState.enemies.splice(index, 1);
        
        // Add resources and score
        gameState.resources += enemy.reward;
        gameState.score += enemy.reward;
        
        updateResourceDisplay();
        logMessage(`${enemyTypes[enemy.type].name} derrotado (+${enemy.reward} hojas)`);
      }
    }
  }
  
  // Check if wave is complete
  function checkWaveCompletion() {
    if (gameState.isWaveActive && 
        gameState.enemiesSpawned >= gameState.enemiesPerWave * gameState.wave && 
        gameState.enemies.length === 0 &&
        !gameState.waveCompleted) {
      
      gameState.waveCompleted = true;
      gameState.isWaveActive = false;
      gameState.wave++;
      
      // Enable start wave button
      startWaveBtn.disabled = false;
      
      // Update wave display
      document.querySelector('#wave .resource-value').textContent = `${gameState.wave}/${gameState.maxWaves}`;
      
      // Wave completion bonus
      const bonus = 10 + (gameState.wave - 1) * 5;
      gameState.resources += bonus;
      gameState.score += bonus * 2;
      updateResourceDisplay();
      
      logMessage(`¡Oleada completada! Bonus: +${bonus} hojas`);
      
      // Check if game is won
      if (gameState.wave > gameState.maxWaves) {
        gameOver(true);
      } else {
        // Reset wave timer for next wave
        gameState.waveTimer = 30;
        document.getElementById('waveTimerValue').textContent = gameState.waveTimer;
        document.getElementById('waveTimer').style.display = 'block';
      }
    }
  }
  
  // Game over
  function gameOver(isVictory) {
    gameState.isPlaying = false;
    gameOverlay.style.display = 'flex';
    
    if (isVictory) {
      gameMessage.textContent = `¡Victoria! Has completado todas las oleadas. Puntuación: ${gameState.score}`;
      
      // Save rewards to main game
      const mainGameReward = Math.floor(gameState.score / 10);
      localStorage.setItem('towerDefenseReward', mainGameReward);
      
      logMessage(`¡Victoria! Has ganado ${mainGameReward} hojas para el juego principal.`);
    } else {
      gameMessage.textContent = `¡Derrota! Tu hormiguero ha sido destruido. Puntuación: ${gameState.score}`;
      
      // Save partial rewards to main game
      const mainGameReward = Math.floor(gameState.score / 20);
      localStorage.setItem('towerDefenseReward', mainGameReward);
      
      logMessage(`¡Derrota! Has ganado ${mainGameReward} hojas para el juego principal.`);
    }
    
    startGameBtn.textContent = "Jugar de nuevo";
  }
  
  // Update resource display
  function updateResourceDisplay() {
    document.querySelector('#leaves .resource-value').textContent = gameState.resources;
    document.querySelector('#score .resource-value').textContent = gameState.score;
    document.querySelector('#wave .resource-value').textContent = `${gameState.wave}/${gameState.maxWaves}`;
    
    // Update mobile panel
    document.getElementById('mobileLeaves').textContent = gameState.resources;
    document.getElementById('mobileWave').textContent = `${gameState.wave}/${gameState.maxWaves}`;
  }
  
  // Update health display
  function updateHealthDisplay() {
    const healthPercent = Math.max(0, Math.min(100, (gameState.health / gameState.maxHealth) * 100));
    healthValue.textContent = gameState.health;
    healthBarFill.style.width = `${healthPercent}%`;
    
    // Change color based on health
    if (healthPercent < 25) {
      healthBarFill.style.backgroundColor = 'var(--health-bar-low)';
    } else {
      healthBarFill.style.backgroundColor = 'var(--health-bar)';
    }
    
    // Update mobile panel
    document.getElementById('mobileHealth').textContent = gameState.health;
  }
  
  // Log message to battle log
  function logMessage(message) {
    const logEntry = document.createElement('div');
    logEntry.textContent = message;
    battleLog.prepend(logEntry);
    
    // Limit log entries
    while (battleLog.children.length > 20) {
      battleLog.removeChild(battleLog.lastChild);
    }
  }
  
  // Game Loop
  function gameLoop(timestamp) {
    if (!gameState.isPlaying) return;
    
    // Calculate delta time
    const deltaTime = (timestamp - gameState.lastFrameTime) / 1000;
    gameState.lastFrameTime = timestamp;
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw map
    drawMap();
    
    // Update wave timer if not active
    if (!gameState.isWaveActive && !gameState.waveCompleted) {
      gameState.waveTimer -= deltaTime;
      if (gameState.waveTimer <= 0) {
        startWave();
      } else {
        // Update timer display
        document.getElementById('waveTimerValue').textContent = Math.ceil(gameState.waveTimer);
        document.getElementById('waveTimer').style.display = 'block';
      }
    } else {
      document.getElementById('waveTimer').style.display = 'none';
    }
    
    // Spawn enemies
    if (gameState.isWaveActive && gameState.enemiesSpawned < gameState.enemiesPerWave * gameState.wave) {
      gameState.enemySpawnTimer += deltaTime * gameState.gameSpeed;
      
      // Spawn rate based on wave - more spaced out enemies
      const spawnInterval = 2 / (0.3 + gameState.wave * 0.08);
      
      if (gameState.enemySpawnTimer >= spawnInterval) {
        spawnEnemy();
        gameState.enemySpawnTimer = 0;
      }
    }
    
    // Update game entities
    moveEnemies(deltaTime);
    updateTowers(deltaTime);
    updateProjectiles(deltaTime);
    
    // Draw game entities
    drawTowers();
    drawEnemies();
    drawProjectiles();
    
    // Draw range preview if active
    if (gameState.showRangePreview && gameState.selectedTowerType) {
      drawRangePreview();
    }
    
    // Check wave completion
    checkWaveCompletion();
    
    // Continue game loop
    requestAnimationFrame(gameLoop);
  }
  
  // Draw range preview
  function drawRangePreview() {
    const x = gameState.rangePreviewX;
    const y = gameState.rangePreviewY;
    const radius = gameState.rangePreviewRadius;
    
    // Check if position is valid
    const isValid = !isOnPath(x, y) && !isTowerAt(x, y);
    
    // Draw tower placeholder
    ctx.globalAlpha = 0.6;
    ctx.fillStyle = isValid ? towerTypes[gameState.selectedTowerType].color : 'red';
    ctx.beginPath();
    ctx.arc(x, y, map.tileSize / 3, 0, Math.PI * 2);
    ctx.fill();
    
    // Draw range circle
    ctx.strokeStyle = isValid ? 'rgba(255, 255, 255, 0.5)' : 'rgba(255, 0, 0, 0.5)';
    ctx.lineWidth = 2;
    ctx.setLineDash([5, 5]);
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.globalAlpha = 1.0;
  }
  
  // Draw map
  function drawMap() {
    // Draw grid
    ctx.strokeStyle = '#ddd';
    ctx.lineWidth = 0.5;
    
    for (let x = 0; x < map.width; x += map.tileSize) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, map.height);
      ctx.stroke();
    }
    
    for (let y = 0; y < map.height; y += map.tileSize) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(map.width, y);
      ctx.stroke();
    }
    
    // Draw path
    ctx.strokeStyle = 'var(--path-color)';
    ctx.lineWidth = map.tileSize - 4;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    
    ctx.beginPath();
    ctx.moveTo(map.path[0].x, map.path[0].y);
    
    for (let i = 1; i < map.path.length; i++) {
      ctx.lineTo(map.path[i].x, map.path[i].y);
    }
    
    ctx.stroke();
    
    // Draw start and end points
    ctx.fillStyle = 'green';
    ctx.beginPath();
    ctx.arc(map.path[0].x, map.path[0].y, 10, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.fillStyle = 'red';
    ctx.beginPath();
    ctx.arc(map.path[map.path.length - 1].x, map.path[map.path.length - 1].y, 10, 0, Math.PI * 2);
    ctx.fill();
  }
  
  // Draw towers
  function drawTowers() {
    for (const tower of gameState.towers) {
      if (tower.type === 'basic' && imagenCargada && torreBasica.complete) {
        try {
          // Dibujar la imagen de la torre sin rotación
          ctx.drawImage(
            torreBasica,
            tower.x - towerSize/2,
            tower.y - towerSize/2,
            towerSize,
            towerSize
          );
          
          // Indicador de nivel de la torre
          ctx.fillStyle = 'white';
          ctx.font = '10px Arial';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(tower.level, tower.x, tower.y - towerSize/2 - 5);
        } catch (error) {
          console.error('Error al dibujar la torre:', error);
          dibujarTorreFallback(tower);
        }
      } else {
        // Fallback para otros tipos de torre o si la imagen no se cargó
        dibujarTorreFallback(tower);
      }
      
      // Indicador de rango para la torre seleccionada
      if (tower === gameState.selectedTower) {
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(tower.x, tower.y, tower.range, 0, Math.PI * 2);
        ctx.stroke();
      }
    }
  }
  
  // Función para dibujar torre fallback
  function dibujarTorreFallback(tower) {
    ctx.fillStyle = tower.color;
    ctx.beginPath();
    ctx.arc(tower.x, tower.y, map.tileSize / 3, 0, Math.PI * 2);
    ctx.fill();
    
    // Indicador de nivel de la torre
    ctx.fillStyle = 'white';
    ctx.font = '10px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(tower.level, tower.x, tower.y);
  }
  
  // Draw enemies
  function drawEnemies() {
    for (const enemy of gameState.enemies) {
      // Draw enemy
      ctx.fillStyle = enemy.color;
      ctx.beginPath();
      ctx.arc(enemy.x, enemy.y, enemy.size, 0, Math.PI * 2);
      ctx.fill();
      
      // Draw health bar
      const healthPercent = enemy.health / enemy.maxHealth;
      const barWidth = enemy.size * 2;
      const barHeight = 4;
      
      ctx.fillStyle = 'red';
      ctx.fillRect(enemy.x - barWidth / 2, enemy.y - enemy.size - 8, barWidth, barHeight);
      
      ctx.fillStyle = 'green';
      ctx.fillRect(enemy.x - barWidth / 2, enemy.y - enemy.size - 8, barWidth * healthPercent, barHeight);
    }
  }
  
  // Draw projectiles
  function drawProjectiles() {
    for (const projectile of gameState.projectiles) {
      ctx.fillStyle = projectile.color;
      ctx.beginPath();
      ctx.arc(projectile.x, projectile.y, projectile.size, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  
  // Initialize the game
  initGame();
});