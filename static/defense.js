// Tower Defense Game for AntEmpire
document.addEventListener('DOMContentLoaded', function() {
  // Cargar imagen de tile básico
  const cespedBasico = new Image();
  cespedBasico.src = '/static/tile/cespedBasico.png';
  
  // Cargar imágenes de torres
  const hormigaFuego = new Image();
  hormigaFuego.src = '/static/images/hormigaFuego.png';
  
  const hormigaVeneno = new Image();
  hormigaVeneno.src = '/static/images/hormigaVeneno.png';
  
  const hormigaHielo = new Image();
  hormigaHielo.src = '/static/images/hormigaHielo.png';
  
  const hormigaCarnivora = new Image();
  hormigaCarnivora.src = '/static/images/hormigaCarnivora.png';
  
  const proyectilVeneno = new Image();
  proyectilVeneno.src = '/static/images/proyectilVeneno.png';
  
  const proyectilFuego = new Image();
  proyectilFuego.src = '/static/images/proyectilFuego.png';
  
  const proyectilHielo = new Image();
  proyectilHielo.src = '/static/images/proyectilHielo.png';
  
  const proyectilCarnivora = new Image();
  proyectilCarnivora.src = '/static/images/proyectilCarnivora.png';
  
  let cespedBasicoCargado = false;
  let imagenFuegoCargada = false;
  let imagenVenenoCargada = false;
  let imagenHieloCargada = false;
  let imagenCarnivoraCargada = false;
  let proyectilVenenoCargado = false;
  let proyectilFuegoCargado = false;
  let proyectilHieloCargado = false;
  let proyectilCarnivoraCargado = false;
  
  cespedBasico.onload = () => cespedBasicoCargado = true;
  cespedBasico.onerror = () => cespedBasicoCargado = false;
  
  hormigaFuego.onload = () => imagenFuegoCargada = true;
  hormigaFuego.onerror = () => imagenFuegoCargada = false;
  
  hormigaVeneno.onload = () => imagenVenenoCargada = true;
  hormigaVeneno.onerror = () => imagenVenenoCargada = false;
  
  hormigaHielo.onload = () => imagenHieloCargada = true;
  hormigaHielo.onerror = () => imagenHieloCargada = false;
  
  hormigaCarnivora.onload = () => imagenCarnivoraCargada = true;
  hormigaCarnivora.onerror = () => imagenCarnivoraCargada = false;
  
  proyectilVeneno.onload = () => proyectilVenenoCargado = true;
  proyectilVeneno.onerror = () => proyectilVenenoCargado = false;
  
  proyectilFuego.onload = () => proyectilFuegoCargado = true;
  proyectilFuego.onerror = () => proyectilFuegoCargado = false;
  
  proyectilHielo.onload = () => proyectilHieloCargado = true;
  proyectilHielo.onerror = () => proyectilHieloCargado = false;
  
  proyectilCarnivora.onload = () => proyectilCarnivoraCargado = true;
  proyectilCarnivora.onerror = () => proyectilCarnivoraCargado = false;
  
  // Configuración simple para torres
  const towerSize = 40; // Tamaño fijo para todas las torres
  
  // Tower image is loaded at the top of the file: torreBasica
  
  // Game Canvas Setup
  const canvas = document.getElementById('gameCanvas');
  const ctx = canvas.getContext('2d');
  const gameOverlay = document.getElementById('gameOverlay');
  const gameMessage = document.getElementById('gameMessage');
  const startGameBtn = document.getElementById('startGameBtn');
  const startWaveBtn = null; // Removed from DOM
  const speedBtn = document.getElementById('speedBtn');
  const sellTowerBtn = document.getElementById('sellTowerBtn');
  const upgradeTowerBtn = document.getElementById('upgradeTowerBtn');
  const battleLog = document.getElementById('battleLog');
  const healthValue = document.getElementById('mapHealth');
  const healthBarFill = null; // Removed from DOM
  
  // Weather System
  const weatherTypes = {
    normal: {
      name: "Normal",
      description: "Clima estándar sin efectos especiales",
      color: "#f5f5f5",
      duration: 120, // segundos
      effects: {}
    },
    sunny: {
      name: "Soleado",
      description: "Potencia torres de fuego (+30% daño) y escarabajos (+20% velocidad), debilita torres de hielo (-20% daño)",
      color: "#f39c12",
      duration: 60,
      effects: {
        towerBuffs: { fuego: 0.3 },
        towerDebuffs: { hielo: -0.2 },
        enemyBuffs: { "basic": { speed: 0.2 } }
      }
    },
    rainy: {
      name: "Lluvioso",
      description: "Potencia torres de veneno (+25% daño) y debilita torres de fuego (-20% daño)",
      color: "#3498db",
      duration: 60,
      effects: {
        towerBuffs: { veneno: 0.25 },
        towerDebuffs: { fuego: -0.2 }
      }
    },
    cold: {
      name: "Frío",
      description: "Potencia torres de hielo (+30% daño) y debilita torres de fuego (-15% daño)",
      color: "#2980b9",
      duration: 60,
      effects: {
        towerBuffs: { hielo: 0.3 },
        towerDebuffs: { fuego: -0.15 },
        enemyDebuffs: { global: { speed: -0.1 } }
      }
    },
    foggy: {
      name: "Niebla",
      description: "Reduce el rango de todas las torres (-15%) pero aumenta el daño (+10%)",
      color: "#bdc3c7",
      duration: 45,
      effects: {
        towerDebuffs: { global: { range: -0.15 } },
        towerBuffs: { global: { damage: 0.1 } }
      }
    }
  };
  
  // Game State
  let gameState = {
    isPlaying: false,
    isPaused: false,
    isWaveActive: false,
    gameSpeed: 10, // Velocidad 10 por defecto
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
    waveTimer: 3, // Temporizador reducido a 3 segundos
    waveTimeLimit: 27, // Límite de tiempo por oleada base
    showRangePreview: false, // Para mostrar la previsualización del rango
    rangePreviewX: 0,
    rangePreviewY: 0,
    rangePreviewRadius: 0,
    currentWeather: "normal",
    weatherTimer: 0,
    weatherDuration: 120,
    techPoints: 0,
    nestLevel: 1, // Nivel del hormiguero
    nest: {
      type: 'nest',
      name: 'Hormiguero',
      level: 1,
      damage: 0,
      range: 0,
      fireRate: 0,
      upgradeCost: 50,
      upgradeMultiplier: 1.2,
      element: 'normal',
      x: 0,
      y: 0
    },
    unlockedTowers: ["basic", "shooter", "bomber", "poison", "fire", "ice", "carnivore", "queen"],
    techTree: {
      damage: 0, // Nivel de mejora de daño
      range: 0,  // Nivel de mejora de rango
      speed: 0   // Nivel de mejora de velocidad de ataque
    },
    playerPerformance: {
      totalKills: 0,
      totalWaves: 0,
      flawlessWaves: 0,
      bossesDefeated: 0
    },
    specialEvents: {
      bossRaid: false,
      lastEventWave: 0
    }
  };
  
  // Cargar torres desbloqueadas desde localStorage (desactivado para mostrar todas)
  const loadUnlockedTowers = () => {
    // Función desactivada - usar torres por defecto
  };
  
  // Cargar torres desbloqueadas al inicio
  loadUnlockedTowers();
  
  // Game Map
  const map = {
    width: canvas.width,
    height: canvas.height,
    tileSize: 40,
    path: [],
    startPoint: { x: 0, y: 6 },
    endPoint: { x: 19, y: 6 },
    gridWidth: 20,
    gridHeight: 12
  };
  
  // Generate random path from start to end
  function generateRandomPath() {
    map.path = [];
    
    // 4 predefined map variants with long paths
    const variants = [
      // Variant 1: Left to right with curves
      { start: { x: 0, y: 6 }, end: { x: 19, y: 6 }, waypoints: [{ x: 5, y: 3 }, { x: 10, y: 9 }, { x: 15, y: 2 }] },
      // Variant 2: Top to bottom zigzag
      { start: { x: 10, y: 0 }, end: { x: 10, y: 11 }, waypoints: [{ x: 3, y: 3 }, { x: 17, y: 6 }, { x: 5, y: 9 }] },
      // Variant 3: Diagonal with multiple turns
      { start: { x: 0, y: 2 }, end: { x: 19, y: 10 }, waypoints: [{ x: 8, y: 8 }, { x: 12, y: 3 }, { x: 6, y: 10 }] },
      // Variant 4: Complex S-curve
      { start: { x: 19, y: 3 }, end: { x: 0, y: 9 }, waypoints: [{ x: 12, y: 7 }, { x: 8, y: 2 }, { x: 4, y: 8 }] }
    ];
    
    const variant = variants[Math.floor(Math.random() * variants.length)];
    map.startPoint = variant.start;
    map.endPoint = variant.end;
    
    // Generate path through waypoints
    const allPoints = [variant.start, ...variant.waypoints, variant.end];
    const waypoints = [];
    
    for (let i = 0; i < allPoints.length - 1; i++) {
      const segment = createPathSegment(allPoints[i], allPoints[i + 1]);
      waypoints.push(...(i === 0 ? segment : segment.slice(1)));
    }
    
    // Convert waypoints to pixel coordinates
    waypoints.forEach(point => {
      map.path.push({ x: point.x * map.tileSize + map.tileSize/2, y: point.y * map.tileSize + map.tileSize/2 });
    });
  }
  
  // Generate waypoints between start and end
  function generateWaypoints(start, end) {
    const waypoints = [start];
    let current = { ...start };
    
    // Create 2-4 intermediate waypoints for interesting paths
    const numWaypoints = Math.floor(Math.random() * 3) + 2;
    
    for (let i = 0; i < numWaypoints; i++) {
      const progress = (i + 1) / (numWaypoints + 1);
      
      // Interpolate towards end with some randomness
      const targetX = Math.floor(start.x + (end.x - start.x) * progress);
      const targetY = Math.floor(start.y + (end.y - start.y) * progress);
      
      // Add some randomness but keep within bounds
      const randomOffsetX = Math.floor(Math.random() * 4) - 2;
      const randomOffsetY = Math.floor(Math.random() * 4) - 2;
      
      const newX = Math.max(1, Math.min(map.gridWidth - 2, targetX + randomOffsetX));
      const newY = Math.max(1, Math.min(map.gridHeight - 2, targetY + randomOffsetY));
      
      // Create path from current to new waypoint
      const pathSegment = createPathSegment(current, { x: newX, y: newY });
      waypoints.push(...pathSegment.slice(1)); // Skip first point to avoid duplicates
      
      current = { x: newX, y: newY };
    }
    
    // Connect to end point
    const finalSegment = createPathSegment(current, end);
    waypoints.push(...finalSegment.slice(1));
    
    return waypoints;
  }
  
  // Create path segment between two points
  function createPathSegment(start, end) {
    const segment = [start];
    let current = { ...start };
    
    while (current.x !== end.x || current.y !== end.y) {
      // Move towards target
      if (current.x < end.x) current.x++;
      else if (current.x > end.x) current.x--;
      else if (current.y < end.y) current.y++;
      else if (current.y > end.y) current.y--;
      
      segment.push({ ...current });
    }
    
    return segment;
  }
  
  // Generate new random map
  function generateNewMap() {
    // Clear existing towers and enemies
    gameState.towers = [];
    gameState.enemies = [];
    gameState.projectiles = [];
    
    // Reset game state
    gameState.isWaveActive = false;
    gameState.waveCompleted = false;
    gameState.enemiesSpawned = 0;
    gameState.wave = 1;
    gameState.waveTimer = 3;
    
    // Generate new path
    generateRandomPath();
    
    // Set nest position for clicking
    gameState.nestPosition = {
      x: map.path[map.path.length - 1].x,
      y: map.path[map.path.length - 1].y,
      radius: 20
    };
    
    // Update displays
    updateResourceDisplay();
    logMessage('¡Nuevo mapa generado! Coloca tus torres estratégicamente.');
    logMessage(`Hormiguero Nv.${gameState.nestLevel} - Clic en 🏠 para mejorar (${gameState.nestLevel * 50} hojas)`);
    
    // Hide wave timer
    document.getElementById('waveTimer').style.display = 'none';
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
      upgradeMultiplier: 1.2,
      element: "normal",
      rarity: "común"
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
      upgradeMultiplier: 1.3,
      element: "normal",
      rarity: "común"
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
      upgradeMultiplier: 1.4,
      element: "normal",
      rarity: "rara"
    },
    poison: {
      name: "Hormiga Venenosa",
      cost: 25,
      damage: 8,
      range: 110,
      fireRate: 0.7,
      projectileSpeed: 6,
      color: '#2ecc71',
      upgradeCost: 12,
      upgradeMultiplier: 1.3,
      poisonEffect: true,
      poisonDamage: 2,
      poisonDuration: 3, // segundos
      element: "veneno",
      rarity: "rara"
    },
    fire: {
      name: "Hormiga de Fuego",
      cost: 35,
      damage: 20,
      range: 90,
      fireRate: 0.6,
      projectileSpeed: 7,
      color: '#e74c3c',
      upgradeCost: 18,
      upgradeMultiplier: 1.4,
      burnEffect: true,
      burnDamage: 5,
      burnDuration: 2, // segundos
      element: "fuego",
      rarity: "rara"
    },
    ice: {
      name: "Hormiga de Hielo",
      cost: 35,
      damage: 12,
      range: 100,
      fireRate: 0.7,
      projectileSpeed: 6,
      color: '#3498db',
      upgradeCost: 18,
      upgradeMultiplier: 1.3,
      freezeEffect: true,
      slowFactor: 0.5, // 50% más lento
      freezeDuration: 2, // segundos
      element: "hielo",
      rarity: "rara"
    },
    carnivore: {
      name: "Hormiga Carnívora",
      cost: 50,
      damage: 7.14,
      range: 80,
      fireRate: 2,
      projectileSpeed: 5,
      color: '#9b59b6',
      upgradeCost: 25,
      upgradeMultiplier: 1.5,
      devourChance: 0.1, // 10% de devorar al enemigo
      areaEffect: true,
      areaRadius: 38,
      element: "normal",
      rarity: "mítica"
    },
    queen: {
      name: "Hormiga Reina",
      cost: 100,
      damage: 15,
      range: 150,
      fireRate: 1.2,
      projectileSpeed: 8,
      color: '#f1c40f',
      upgradeCost: 50,
      upgradeMultiplier: 1.6,
      spawnRate: 0.05,
      auraRange: 120,
      auraBuff: 0.2,
      nestDamage: 25, // Daño del nido
      nestRange: 100, // Rango del nido
      element: "normal",
      rarity: "legendaria"
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
  
  // Setup Tech Tree
  function setupTechTree() {
    // Update tech points display
    document.getElementById('techPoints').textContent = `${gameState.techPoints} 🔮`;
    
    // Setup tech upgrade buttons
    document.getElementById('upgradeDamage').addEventListener('click', () => upgradeTech('damage'));
    document.getElementById('upgradeRange').addEventListener('click', () => upgradeTech('range'));
    document.getElementById('upgradeSpeed').addEventListener('click', () => upgradeTech('speed'));
    
    // Update tech level displays
    updateTechLevels();
  }
  
  // Update Tech Levels Display
  function updateTechLevels() {
    const maxLevel = 5;
    
    // Update damage level
    let damageLevel = '';
    for (let i = 0; i < maxLevel; i++) {
      damageLevel += i < gameState.techTree.damage ? '◉' : '○';
    }
    document.getElementById('techDamage').textContent = damageLevel;
    
    // Update range level
    let rangeLevel = '';
    for (let i = 0; i < maxLevel; i++) {
      rangeLevel += i < gameState.techTree.range ? '◉' : '○';
    }
    document.getElementById('techRange').textContent = rangeLevel;
    
    // Update speed level
    let speedLevel = '';
    for (let i = 0; i < maxLevel; i++) {
      speedLevel += i < gameState.techTree.speed ? '◉' : '○';
    }
    document.getElementById('techSpeed').textContent = speedLevel;
    
    // Update button states
    document.getElementById('upgradeDamage').disabled = gameState.techPoints < 1 || gameState.techTree.damage >= maxLevel;
    document.getElementById('upgradeRange').disabled = gameState.techPoints < 1 || gameState.techTree.range >= maxLevel;
    document.getElementById('upgradeSpeed').disabled = gameState.techPoints < 1 || gameState.techTree.speed >= maxLevel;
  }
  
  // Upgrade Tech
  function upgradeTech(techType) {
    if (gameState.techPoints < 1) return;
    
    // Check max level
    if (gameState.techTree[techType] >= 5) return;
    
    // Spend tech point
    gameState.techPoints--;
    
    // Upgrade tech
    gameState.techTree[techType]++;
    
    // Update displays
    document.getElementById('techPoints').textContent = `${gameState.techPoints} 🔮`;
    updateTechLevels();
    
    // Log upgrade
    const techNames = {
      damage: "Daño",
      range: "Alcance",
      speed: "Velocidad"
    };
    logMessage(`¡Tecnología ${techNames[techType]} mejorada al nivel ${gameState.techTree[techType]}!`);
  }
  
  // Initialize Game
  function initGame() {
    generateRandomPath();
    
    // Set nest position for clicking
    gameState.nestPosition = {
      x: map.path[map.path.length - 1].x,
      y: map.path[map.path.length - 1].y,
      radius: 20
    };
    
    // Update nest coordinates
    gameState.nest.x = map.path[map.path.length - 1].x;
    gameState.nest.y = map.path[map.path.length - 1].y;
    
    updateResourceDisplay();
    updateHealthDisplay();
    
    // Filtrar torres disponibles según las desbloqueadas
    filterAvailableTowers();
    
    // Ya no necesitamos drag and drop desde el sidebar
    // setupTowerDragDrop();
    
    // Setup tower selection panel
    setupTowerSelectionPanel();
    
    // Setup tower context menu
    setupTowerContextMenu();
    
    // Setup tech tree
    setupTechTree();
    
    // Hide wave timer initially
    const waveTimer = document.getElementById('waveTimer');
    if (waveTimer) waveTimer.style.display = 'none';
    
    // Initialize weather system
    initWeatherSystem();
    
    // Update mobile speed display
    const mobileSpeedValue = document.getElementById('mobileSpeedValue');
    if (mobileSpeedValue) mobileSpeedValue.textContent = gameState.gameSpeed;
    
    // Event listeners
    if (startGameBtn) {
      startGameBtn.addEventListener('click', startGame);
    }
    
    speedBtn.addEventListener('click', toggleGameSpeed);
    // Nest upgrade is now handled by clicking on the nest in the map
    sellTowerBtn.addEventListener('click', sellSelectedTower);
    upgradeTowerBtn.addEventListener('click', upgradeSelectedTower);
    document.getElementById('deselectTowerBtn').addEventListener('click', deselectTower);
    const mobileStartWaveBtn = document.getElementById('mobileStartWaveBtn');
    if (mobileStartWaveBtn) mobileStartWaveBtn.addEventListener('click', startWave);
    const newMapBtn = document.getElementById('newMapBtn');
    const mobileNewMapBtn = document.getElementById('mobileNewMapBtn');
    if (newMapBtn) newMapBtn.addEventListener('click', generateNewMap);
    if (mobileNewMapBtn) mobileNewMapBtn.addEventListener('click', generateNewMap);
    
    // Toolbar buttons
    const toolbarSellBtn = document.getElementById('toolbarSellBtn');
    const toolbarUpgradeBtn = document.getElementById('toolbarUpgradeBtn');
    if (toolbarSellBtn) toolbarSellBtn.addEventListener('click', sellSelectedTower);
    if (toolbarUpgradeBtn) toolbarUpgradeBtn.addEventListener('click', upgradeSelectedTower);
    
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
          document.querySelectorAll('.toolbar-btn').forEach(b => b.classList.remove('selected'));
        } else if (gameState.selectedTower) {
          // Deselect tower
          deselectTower();
        }
      }
    });
  }
  
  // Filtrar torres disponibles según las desbloqueadas
  function filterAvailableTowers() {
    // Filtrar torres en la barra de herramientas
    document.querySelectorAll('.toolbar-btn').forEach(element => {
      if (element.id === 'cancelTowerSelection') return; // No ocultar el botón de cancelar
      
      const towerType = element.dataset.type;
      if (!gameState.unlockedTowers.includes(towerType)) {
        element.style.display = 'none';
        element.classList.add('locked');
      } else {
        element.style.display = 'flex';
        element.classList.remove('locked');
      }
    });
    
    // Torres filtradas silenciosamente
  }
  
  // Setup tower selection panel
  function setupTowerSelectionPanel() {
    const toolbarBtns = document.querySelectorAll('.toolbar-btn');
    const cancelBtn = document.getElementById('cancelTowerSelection');
    
    toolbarBtns.forEach(btn => {
      if (btn.id !== 'cancelTowerSelection') {
        btn.addEventListener('click', function() {
          // Deselect all buttons
          toolbarBtns.forEach(b => b.classList.remove('selected'));
          
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
    if (cancelBtn) {
      cancelBtn.addEventListener('click', function() {
        // Deselect all buttons
        toolbarBtns.forEach(b => b.classList.remove('selected'));
        
        // Clear tower selection
        gameState.selectedTowerType = null;
        gameState.showRangePreview = false;
        
        // Also deselect any selected tower
        deselectTower();
      });
    }
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
    
    // Check if tower is unlocked
    if (!gameState.unlockedTowers.includes(type)) {
      logMessage(`La torre ${towerTypes[type].name} no está desbloqueada todavía`);
      return;
    }
    
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
      direction: 0, // 0: down, 1: left, 2: right, 3: up
      angle: 0, // Ángulo de rotación para seguir enemigos
      meleeAnimation: null // Animación de ataque cuerpo a cuerpo
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
    
    // Check if clicked on nest FIRST
    if (gameState.nestPosition) {
      const nestDist = Math.sqrt(
        Math.pow(x - gameState.nestPosition.x, 2) + 
        Math.pow(y - gameState.nestPosition.y, 2)
      );
      if (nestDist <= gameState.nestPosition.radius) {
        selectNest();
        return;
      }
    }
    
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
      
      // Disable sell/upgrade for temporary towers
      if (tower.isTemporary) {
        sellTowerBtn.disabled = true;
        upgradeTowerBtn.disabled = true;
      } else {
        sellTowerBtn.disabled = false;
        const upgradeCost = Math.floor(towerTypes[tower.type].upgradeCost * Math.pow(tower.level, 1.5));
        const canUpgrade = tower.type === 'queen' || canUpgradeTowers();
        upgradeTowerBtn.disabled = gameState.resources < upgradeCost || !canUpgrade;
      }
      
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
    const toolbarTowerInfo = document.getElementById('toolbarTowerInfo');
    
    // Handle nest info display
    if (tower.type === 'nest') {
      if (towerInfo && upgradePanel) {
        towerInfo.innerHTML = `
          <div style="background: rgba(0,0,0,0.1); padding: 10px; border-radius: 5px; margin-bottom: 10px;">
            <h3 style="margin: 0 0 8px 0; color: var(--text-title);">${tower.name} (Nivel ${tower.level})</h3>
            <div style="margin: 3px 0;">🏠 Centro de investigación</div>
            <div style="margin: 3px 0;">🔧 Permite mejorar torres</div>
            <div style="margin: 3px 0;">🎯 Límite de nivel: ${tower.level}</div>
          </div>
        `;
        
        const upgradeCost = Math.floor(tower.upgradeCost * Math.pow(tower.level, 1.5));
        upgradePanel.innerHTML = `
          <div style="background: rgba(163,198,68,0.1); padding: 10px; border-radius: 5px;">
            <h4 style="margin: 0 0 8px 0; color: var(--text-title);">Mejora a Nivel ${tower.level + 1}</h4>
            <div style="margin: 3px 0;">💰 Coste: ${upgradeCost} 🍃</div>
            <div style="margin: 3px 0;">🔄 Permite torres nivel ${tower.level + 1}</div>
          </div>
        `;
      }
      return;
    }
    
    const type = towerTypes[tower.type];
    
    // Update sidebar panel
    if (towerInfo && upgradePanel) {
      towerInfo.innerHTML = `
        <div style="background: rgba(0,0,0,0.1); padding: 10px; border-radius: 5px; margin-bottom: 10px;">
          <h3 style="margin: 0 0 8px 0; color: var(--text-title);">${type.name} (Nivel ${tower.level})</h3>
          <div style="margin: 3px 0;">💥 Daño: ${tower.damage.toFixed(1)}</div>
          <div style="margin: 3px 0;">🎯 Alcance: ${tower.range}</div>
          <div style="margin: 3px 0;">⚡ Velocidad: ${tower.fireRate.toFixed(2)} disparos/s</div>
          <div style="margin: 3px 0;">🏷️ Elemento: ${type.element}</div>
        </div>
      `;
      
      const upgradeCost = Math.floor(type.upgradeCost * Math.pow(tower.level, 1.5));
      upgradePanel.innerHTML = `
        <div style="background: rgba(163,198,68,0.1); padding: 10px; border-radius: 5px;">
          <h4 style="margin: 0 0 8px 0; color: var(--text-title);">Mejora a Nivel ${tower.level + 1}</h4>
          <div style="margin: 3px 0;">💰 Coste: ${upgradeCost} 🍃</div>
          <div style="margin: 3px 0;">📈 Daño: +${(tower.damage * (type.upgradeMultiplier - 1)).toFixed(1)}</div>
          <div style="margin: 3px 0;">📏 Alcance: +${Math.floor(tower.range * 0.1)}</div>
        </div>
      `;
    }
    
    // Update toolbar info
    if (toolbarTowerInfo) {
      const upgradeCost = Math.floor(type.upgradeCost * Math.pow(tower.level, 1.5));
      const sellValue = Math.floor(getTowerTotalCost(tower) * 0.7);
      
      // Current tower info
      const currentInfo = document.getElementById('currentTowerInfo');
      if (currentInfo) {
        currentInfo.innerHTML = `
          <div><strong>${type.name}</strong> Nv.${tower.level}</div>
          <div>💥${tower.damage.toFixed(1)} 🎯${tower.range} ⚡${tower.fireRate.toFixed(1)}/s</div>
        `;
      }
      
      // Upgrade info
      const upgradeInfo = document.getElementById('upgradeTowerInfo');
      if (upgradeInfo) {
        const newDamage = tower.damage * type.upgradeMultiplier;
        const newRange = tower.range + Math.floor(tower.range * 0.1);
        upgradeInfo.innerHTML = `
          <div><strong>${type.name}</strong> Nv.${tower.level + 1}</div>
          <div>💥${newDamage.toFixed(1)} 🎯${newRange} ⚡${tower.fireRate.toFixed(1)}/s</div>
          <div style="color: #a3c644;">💰 ${upgradeCost} 🍃</div>
        `;
      }
      
      const sellBtn = document.getElementById('toolbarSellBtn');
      const upgradeBtn = document.getElementById('toolbarUpgradeBtn');
      
      if (sellBtn) {
        sellBtn.textContent = `Vender (+${sellValue})`;
        sellBtn.disabled = false;
      }
      
      if (upgradeBtn) {
        upgradeBtn.textContent = `Mejorar`;
        upgradeBtn.disabled = gameState.resources < upgradeCost;
      }
    }
    
    // Update sidebar buttons
    if (upgradeTowerBtn) {
      const upgradeCost = Math.floor(type.upgradeCost * Math.pow(tower.level, 1.5));
      upgradeTowerBtn.textContent = `Mejorar (${upgradeCost} 🍃)`;
      upgradeTowerBtn.disabled = gameState.resources < upgradeCost;
    }
    
    if (sellTowerBtn) {
      const sellValue = Math.floor(getTowerTotalCost(tower) * 0.7);
      sellTowerBtn.textContent = `Vender (+${sellValue} 🍃)`;
    }
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
  
  // Check if upgrades are enabled
  function canUpgradeTowers() {
    return gameState.towers.some(tower => tower.type === 'queen');
  }
  
  // Upgrade selected tower
  function upgradeSelectedTower() {
    if (!gameState.selectedTower) return;
    
    const tower = gameState.selectedTower;
    
    // Handle nest upgrade
    if (tower.type === 'nest') {
      const upgradeCost = Math.floor(tower.upgradeCost * Math.pow(tower.level, 1.5));
      
      // Check if player has enough resources
      if (gameState.resources < upgradeCost) {
        logMessage("No tienes suficientes hojas para mejorar el hormiguero");
        return;
      }
      
      // Upgrade nest
      tower.level++;
      gameState.nestLevel = tower.level;
      
      // Deduct resources
      gameState.resources -= upgradeCost;
      updateResourceDisplay();
      
      // Update tower info panel
      updateTowerInfoPanel(tower);
      
      logMessage(`${tower.name} mejorado a nivel ${tower.level}`);
      return;
    }
    
    const type = towerTypes[tower.type];
    
    // Check if upgrades are enabled (except for queen towers)
    if (tower.type !== 'queen' && !canUpgradeTowers()) {
      logMessage("Necesitas una Hormiga Reina para mejorar otras torres");
      return;
    }
    
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
    try {
      gameState.isPlaying = true;
      gameOverlay.style.display = 'none';
      logMessage("¡Juego iniciado! Coloca torres rápido, la oleada comenzará en 5 segundos.");
      
      // Update speed button text to match default speed
      speedBtn.textContent = `Velocidad: x${gameState.gameSpeed}`;
      
      // Start first wave timer
      gameState.waveTimer = 5;
      gameState.waveCompleted = false;
      
      // Start game loop
      gameState.lastFrameTime = performance.now();
      requestAnimationFrame(gameLoop);
    } catch (error) {
      console.error('Error al iniciar el juego:', error);
    }
  }
  
  // Select nest function
  function selectNest() {
    gameState.selectedTower = gameState.nest;
    sellTowerBtn.disabled = true; // Can't sell nest
    
    const upgradeCost = Math.floor(gameState.nest.upgradeCost * Math.pow(gameState.nest.level, 1.5));
    upgradeTowerBtn.disabled = gameState.resources < upgradeCost;
    
    // Also update toolbar buttons
    const toolbarUpgradeBtn = document.getElementById('toolbarUpgradeBtn');
    if (toolbarUpgradeBtn) {
      toolbarUpgradeBtn.disabled = gameState.resources < upgradeCost;
    }
    
    updateTowerInfoPanel(gameState.nest);
    logMessage('Hormiguero seleccionado - Usa el botón Mejorar');
  }
  
  // Start a wave of enemies
  function startWave() {
    if (gameState.isWaveActive) return;
    
    gameState.isWaveActive = true;
    gameState.enemiesSpawned = 0;
    gameState.enemySpawnTimer = 0;
    gameState.waveCompleted = false;
    gameState.waveTimeLimit = 27 * Math.pow(1.015, gameState.wave - 1); // 27s base + 1.5% por nivel
    

    
    // Hide wave timer
    document.getElementById('waveTimer').style.display = 'none';
    
    logMessage(`¡Oleada ${gameState.wave} iniciada!`);
  }
  
  // Toggle game speed
  function toggleGameSpeed() {
    const speeds = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
    const currentIndex = speeds.indexOf(gameState.gameSpeed);
    gameState.gameSpeed = speeds[(currentIndex + 1) % speeds.length];
    
    // Update speed displays
    speedBtn.textContent = `Velocidad: x${gameState.gameSpeed}`;
    const mobileSpeedValue = document.getElementById('mobileSpeedValue');
    if (mobileSpeedValue) mobileSpeedValue.textContent = gameState.gameSpeed;
  }
  
  // Spawn enemy
  function spawnEnemy() {
    let enemyType;
    let healthMultiplier = 1 + (gameState.wave - 1) * 0.2;
    
    // Check for special events
    if (gameState.specialEvents.bossRaid) {
      enemyType = 'boss';
      healthMultiplier *= 1.4; // 40% stronger boss
      gameState.specialEvents.bossRaid = false; // Reset flag
      const enemy = createEnemy(enemyType, healthMultiplier);
      gameState.enemies.push(enemy);
      gameState.enemiesSpawned++;
      return enemy;
    }
    
    // Check for special wave types
    if (gameState.specialEvents.nextWaveType) {
      switch(gameState.specialEvents.nextWaveType) {
        case 'fast':
          enemyType = Math.random() < 0.7 ? 'wasp' : 'fast';
          break;
        case 'swarm':
          enemyType = 'scout';
          healthMultiplier *= 0.7; // Weaker enemies
          break;
        case 'mixed':
          // Random mix of all enemy types
          const types = ['basic', 'fast', 'scout', 'soldier', 'wasp', 'beetle'];
          enemyType = types[Math.floor(Math.random() * types.length)];
          break;
        default:
          // Use normal enemy selection
          enemyType = selectNormalEnemy();
      }
      
      // Only clear after all enemies are spawned
      if (gameState.enemiesSpawned >= gameState.enemiesPerWave * gameState.wave - 1) {
        gameState.specialEvents.nextWaveType = null;
      }
    } else {
      // Normal enemy selection
      enemyType = selectNormalEnemy();
    }
    
    const enemy = createEnemy(enemyType, healthMultiplier);
    gameState.enemies.push(enemy);
    gameState.enemiesSpawned++;
    return enemy;
  }
  
  // Select normal enemy based on wave and randomness
  function selectNormalEnemy() {
    const rand = Math.random();
    
    if (gameState.wave >= 9 && rand < 0.2) {
      return 'boss';
    } else if (gameState.wave >= 8 && rand < 0.3) {
      return 'beetle';
    } else if (gameState.wave >= 6 && rand < 0.3) {
      return 'wasp';
    } else if (gameState.wave >= 5 && rand < 0.4) {
      return 'soldier';
    } else if (gameState.wave >= 3 && rand < 0.4) {
      return 'scout';
    } else if (gameState.wave >= 2 && rand < 0.5) {
      return 'fast';
    } else {
      return 'basic';
    }
  }
  
  // Create enemy with given type and health multiplier
  function createEnemy(enemyType, healthMultiplier) {
    if (!enemyTypes[enemyType]) {
      enemyType = 'basic'; // Usar tipo básico como fallback
    }
    
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
      direction: 0,
      effects: []
    };
    
    // Apply weather effects to enemy
    const weatherEffects = applyWeatherEffectsToEnemy(enemy);
    if (weatherEffects && weatherEffects.speed !== undefined) {
      enemy.speed = weatherEffects.speed;
    }
    
    return enemy;
  }
  
  // Move enemies along the path
  function moveEnemies(deltaTime) {
    for (let i = gameState.enemies.length - 1; i >= 0; i--) {
      const enemy = gameState.enemies[i];
      
      // Update enemy effects (poison, burn, freeze, etc.)
      updateEnemyEffects(enemy, deltaTime);
      
      // Check if enemy died from effects
      if (enemy.health <= 0) {
        // Enemy defeated by effects
        gameState.enemies.splice(i, 1);
        
        // Add resources and score
        gameState.resources += enemy.reward;
        gameState.score += enemy.reward;
        
        updateResourceDisplay();
        logMessage(`${enemyTypes[enemy.type].name} derrotado por efectos (+${enemy.reward} hojas)`);
        continue;
      }
      
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
  
  // Actualizar dirección de la torre para que apunte al enemigo
  function updateTowerDirection(tower) {
    if (!tower.target) return;
    
    // Calcular ángulo hacia el objetivo
    const dx = tower.target.x - tower.x;
    const dy = tower.target.y - tower.y;
    tower.angle = Math.atan2(dy, dx);
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
    
    // Apply weather and tech effects to tower
    const towerEffects = applyWeatherEffects(tower);
    const damage = towerEffects.damage;
    
    // Check for special tower abilities
    const towerType = towerTypes[tower.type];
    
    // Carnivore tower melee attack
    if (tower.type === 'carnivore') {
      // Start melee animation
      tower.meleeAnimation = {
        active: true,
        timer: 0.2,
        frame: 0 // 0: normal, 1: attack
      };
      
      // Direct damage to target and area
      if (isEnemyAlive(tower.target)) {
        damageEnemy(tower.target, damage, {
          towerType: tower.type,
          devourChance: towerType.devourChance || 0
        });
      }
      
      // Area damage
      damageEnemiesInArea(tower.target.x, tower.target.y, tower.areaRadius, damage * 0.7);
      return;
    }
    
    if (tower.areaEffect) {
      // Area effect tower (bomber)
      damageEnemiesInArea(tower.target.x, tower.target.y, tower.areaRadius, damage);
    } else {
      // Calculate projectile spawn position
      let projectileX = tower.x;
      let projectileY = tower.y;
      
      // For fire, poison and ice towers, spawn projectile from the cannon/front
      if ((tower.type === 'fire' || tower.type === 'poison' || tower.type === 'ice') && tower.angle !== undefined) {
        const cannonLength = towerSize / 3;
        projectileX = tower.x + Math.cos(tower.angle) * cannonLength;
        projectileY = tower.y + Math.sin(tower.angle) * cannonLength;
      }
      
      // Create projectile with special effects
      const projectile = {
        x: projectileX,
        y: projectileY,
        targetX: tower.target.x,
        targetY: tower.target.y,
        target: tower.target,
        speed: tower.projectileSpeed * gameState.gameSpeed,
        damage: damage,
        color: tower.color,
        size: 5,
        towerType: tower.type,
        // Special effects
        poisonEffect: towerType.poisonEffect || false,
        poisonDamage: towerType.poisonDamage || 0,
        poisonDuration: towerType.poisonDuration || 0,
        burnEffect: towerType.burnEffect || false,
        burnDamage: towerType.burnDamage || 0,
        burnDuration: towerType.burnDuration || 0,
        freezeEffect: towerType.freezeEffect || false,
        slowFactor: towerType.slowFactor || 0,
        freezeDuration: towerType.freezeDuration || 0,
        devourChance: towerType.devourChance || 0
      };
      
      // Queen tower abilities
      if (tower.type === 'queen') {
        // Spawn temporary towers
        if (Math.random() < towerType.spawnRate) {
          spawnBasicTowerNear(tower);
        }
        // Nest damage
        if (isEnemyAlive(tower.target)) {
          damageEnemy(tower.target, towerType.nestDamage);
        }
      }
      
      gameState.projectiles.push(projectile);
    }
  }
  
  // Spawn a basic tower near the queen
  function spawnBasicTowerNear(queenTower) {
    // Try to find a valid position near the queen
    const radius = 80; // Search radius
    const attempts = 10; // Max attempts
    
    for (let i = 0; i < attempts; i++) {
      // Random angle
      const angle = Math.random() * Math.PI * 2;
      const distance = 40 + Math.random() * (radius - 40);
      
      // Calculate position
      const x = queenTower.x + Math.cos(angle) * distance;
      const y = queenTower.y + Math.sin(angle) * distance;
      
      // Check if position is valid
      if (x >= 0 && x <= map.width && y >= 0 && y <= map.height && 
          !isOnPath(x, y) && !isTowerAt(x, y)) {
        
        // Create a temporary basic tower
        const tower = {
          type: 'basic',
          x: x,
          y: y,
          damage: towerTypes.basic.damage * 0.7,
          range: towerTypes.basic.range * 0.8,
          fireRate: towerTypes.basic.fireRate,
          projectileSpeed: towerTypes.basic.projectileSpeed,
          color: towerTypes.basic.color,
          lastFired: 0,
          level: 1,
          target: null,
          direction: 0,
          angle: 0,
          meleeAnimation: null,
          isTemporary: true,
          lifeTimer: 12 // 12 seconds
        };
        
        // Add tower to game state
        gameState.towers.push(tower);
        
        logMessage(`¡La Reina ha generado una Hormiga Soldado!`);
        return;
      }
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
  
  // Update towers animations and temporary towers
  function updateTowerAnimations(deltaTime) {
    for (let i = gameState.towers.length - 1; i >= 0; i--) {
      const tower = gameState.towers[i];
      
      // Update melee animations
      if (tower.meleeAnimation && tower.meleeAnimation.active) {
        tower.meleeAnimation.timer -= deltaTime;
        if (tower.meleeAnimation.timer <= 0.1 && tower.meleeAnimation.frame === 0) {
          tower.meleeAnimation.frame = 1;
        }
        if (tower.meleeAnimation.timer <= 0) {
          tower.meleeAnimation.active = false;
          tower.meleeAnimation.frame = 0;
        }
      }
      
      // Update temporary towers
      if (tower.isTemporary) {
        tower.lifeTimer -= deltaTime;
        if (tower.lifeTimer <= 0) {
          gameState.towers.splice(i, 1);
          logMessage('Torre temporal desaparecida');
        }
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
          // Pass the projectile to apply special effects
          damageEnemy(projectile.target, projectile.damage, projectile);
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
  function damageEnemy(enemy, damage, projectile = null) {
    // Apply damage
    enemy.health -= damage;
    
    // Apply special effects if projectile is provided
    if (projectile) {
      // Poison effect
      if (projectile.poisonEffect && !enemy.effects.some(e => e.type === 'poison')) {
        const originalSpeed = enemy.speed;
        enemy.effects.push({
          type: 'poison',
          damage: projectile.poisonDamage,
          duration: projectile.poisonDuration,
          timer: projectile.poisonDuration,
          originalSpeed: originalSpeed
        });
        enemy.speed *= 0.9; // Reduce speed by 10%
      }
      
      // Burn effect
      if (projectile.burnEffect && !enemy.effects.some(e => e.type === 'burn')) {
        enemy.effects.push({
          type: 'burn',
          damage: projectile.burnDamage,
          duration: projectile.burnDuration,
          timer: projectile.burnDuration
        });
      }
      
      // Freeze effect
      if (projectile.freezeEffect && !enemy.effects.some(e => e.type === 'freeze')) {
        const originalSpeed = enemy.speed;
        enemy.effects.push({
          type: 'freeze',
          slowFactor: projectile.slowFactor,
          duration: projectile.freezeDuration,
          timer: projectile.freezeDuration,
          originalSpeed: originalSpeed
        });
        enemy.speed *= (1 - projectile.slowFactor);
      }
      
      // Devour chance (instant kill)
      if (projectile.devourChance && Math.random() < projectile.devourChance) {
        enemy.health = 0;
        logMessage(`¡Una Hormiga Carnívora ha devorado a un ${enemyTypes[enemy.type].name}!`);
      }
    }
    
    if (enemy.health <= 0) {
      // Enemy defeated
      const index = gameState.enemies.indexOf(enemy);
      if (index !== -1) {
        gameState.enemies.splice(index, 1);
        
        // Add resources and score
        gameState.resources += enemy.reward;
        gameState.score += enemy.reward;
        
        // Update player performance
        gameState.playerPerformance.totalKills++;
        if (enemy.type === 'boss') {
          gameState.playerPerformance.bossesDefeated++;
        }
        
        updateResourceDisplay();
        logMessage(`${enemyTypes[enemy.type].name} derrotado (+${enemy.reward} hojas)`);
      }
    }
  }
  
  // Update enemy effects
  function updateEnemyEffects(enemy, deltaTime) {
    if (!enemy.effects || enemy.effects.length === 0) return;
    
    for (let i = enemy.effects.length - 1; i >= 0; i--) {
      const effect = enemy.effects[i];
      effect.timer -= deltaTime;
      
      // Apply effect damage
      if (effect.type === 'poison' || effect.type === 'burn') {
        const effectDamage = effect.damage * deltaTime;
        enemy.health -= effectDamage;
      }
      
      // Remove expired effects
      if (effect.timer <= 0) {
        // Restore original speed for freeze and poison effects
        if (effect.type === 'freeze' || effect.type === 'poison') {
          enemy.speed = effect.originalSpeed;
        }
        enemy.effects.splice(i, 1);
      }
    }
  }
  
  // Check for Special Events
  function checkForSpecialEvents() {
    // Check player performance
    const performance = gameState.playerPerformance;
    const currentWave = gameState.wave;
    
    // Only trigger events if we're at least at wave 3
    if (currentWave < 3) return;
    
    // Only check for events every 2-3 waves
    if (currentWave - gameState.specialEvents.lastEventWave < 2) return;
    
    // Calculate player skill level (0-100)
    const skillLevel = calculatePlayerSkill();
    
    // High skill players get challenging events
    if (skillLevel > 75 && Math.random() < 0.25) {
      // 25% chance for boss raid for skilled players
      scheduleBossRaid();
      gameState.specialEvents.lastEventWave = currentWave;
      return;
    }
    
    // Medium skill players get random events
    if (skillLevel > 40 && Math.random() < 0.15) {
      // 15% chance for special wave
      scheduleSpecialWave();
      gameState.specialEvents.lastEventWave = currentWave;
      return;
    }
    
    // Low skill players get helpful events
    if (skillLevel < 30 && Math.random() < 0.3) {
      // 30% chance for resource bonus
      giveResourceBonus();
      gameState.specialEvents.lastEventWave = currentWave;
      return;
    }
  }
  
  // Calculate Player Skill Level
  function calculatePlayerSkill() {
    const p = gameState.playerPerformance;
    const healthPercent = gameState.health / gameState.maxHealth * 100;
    
    // Factors to consider:
    // 1. Flawless waves ratio
    // 2. Current health
    // 3. Tower efficiency (score per tower)
    // 4. Resource management (unused resources)
    
    const flawlessRatio = p.totalWaves > 0 ? (p.flawlessWaves / p.totalWaves) * 100 : 0;
    const towerEfficiency = gameState.towers.length > 0 ? gameState.score / gameState.towers.length : 0;
    const normalizedEfficiency = Math.min(towerEfficiency / 10, 100); // Cap at 100
    
    // Calculate skill score (0-100)
    const skillScore = (
      flawlessRatio * 0.4 +
      healthPercent * 0.3 +
      normalizedEfficiency * 0.3
    );
    
    return Math.min(Math.max(skillScore, 0), 100); // Ensure between 0-100
  }
  
  // Schedule Boss Raid
  function scheduleBossRaid() {
    gameState.specialEvents.bossRaid = true;
    
    // Create a stronger boss
    const bossMultiplier = 1.4; // 40% stronger
    
    logMessage(`¡ALERTA! Los exploradores informan de un Ciempiés Gigante acercándose. ¡Prepárate para un desafío!`);
    
    // Next wave will be a boss raid
    gameState.waveTimer = 10; // Give player 10 seconds to prepare
    document.getElementById('waveTimerValue').textContent = gameState.waveTimer;
    document.getElementById('waveTimer').style.display = 'block';
  }
  
  // Schedule Special Wave
  function scheduleSpecialWave() {
    // Choose a special wave type
    const waveTypes = ['fast', 'swarm', 'mixed'];
    const waveType = waveTypes[Math.floor(Math.random() * waveTypes.length)];
    
    switch(waveType) {
      case 'fast':
        logMessage(`¡ALERTA! Un grupo de avispas se acerca a gran velocidad. ¡Prepara tus defensas!`);
        break;
      case 'swarm':
        logMessage(`¡ALERTA! Una gran cantidad de hormigas exploradoras se aproxima. ¡Son muchas pero débiles!`);
        break;
      case 'mixed':
        logMessage(`¡ALERTA! Un grupo variado de enemigos se acerca. ¡Prepárate para todo tipo de amenazas!`);
        break;
    }
    
    // Store wave type for next wave
    gameState.specialEvents.nextWaveType = waveType;
    
    // Give player time to prepare
    gameState.waveTimer = 8; // 8 seconds
    document.getElementById('waveTimerValue').textContent = gameState.waveTimer;
    document.getElementById('waveTimer').style.display = 'block';
  }
  
  // Give Resource Bonus
  function giveResourceBonus() {
    const bonus = 20 + gameState.wave * 5;
    gameState.resources += bonus;
    updateResourceDisplay();
    
    logMessage(`¡Tus recolectoras han encontrado un tesoro! +${bonus} hojas`);
  }
  
  // Check if wave is complete
  function checkWaveCompletion() {
    if (gameState.isWaveActive && 
        gameState.enemiesSpawned >= gameState.enemiesPerWave * gameState.wave && 
        gameState.enemies.length === 0 &&
        !gameState.waveCompleted) {
      
      gameState.waveCompleted = false;
      gameState.isWaveActive = false;
      gameState.wave++;
      

      
      // Update wave display
      document.querySelector('#wave .resource-value').textContent = `${gameState.wave}/${gameState.maxWaves}`;
      
      // Wave completion bonus
      const bonus = 10 + (gameState.wave - 1) * 5;
      gameState.resources += bonus;
      gameState.score += bonus * 2;
      
      // Award tech point every 2 waves
      if (gameState.wave % 2 === 0) {
        gameState.techPoints++;
        logMessage(`¡Has ganado un punto de tecnología! (×${gameState.techPoints} 🔮)`);
        updateTechLevels();
      }
      
      // Update player performance
      gameState.playerPerformance.totalWaves++;
      if (gameState.health === gameState.maxHealth) {
        gameState.playerPerformance.flawlessWaves++;
      }
      
      // Check for special events
      checkForSpecialEvents();
      
      updateResourceDisplay();
      
      logMessage(`¡Oleada completada! Bonus: +${bonus} hojas`);
      
      // Check if game is won
      if (gameState.wave > gameState.maxWaves) {
        gameOver(true);
      } else {
        // Auto start next wave after 5 seconds
        gameState.waveTimer = 5;
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
    
    // Update map resources indicator
    const mapLeaves = document.getElementById('mapLeaves');
    if (mapLeaves) mapLeaves.textContent = gameState.resources;
    
    // Update mobile panel
    document.getElementById('mobileLeaves').textContent = gameState.resources;
    document.getElementById('mobileWave').textContent = `${gameState.wave}/${gameState.maxWaves}`;
  }
  
  // Update health display
  function updateHealthDisplay() {
    // Update map health indicator
    const mapHealth = document.getElementById('mapHealth');
    if (mapHealth) mapHealth.textContent = gameState.health;
    
    // Update mobile panel
    const mobileHealth = document.getElementById('mobileHealth');
    if (mobileHealth) mobileHealth.textContent = gameState.health;
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
  
  // Initialize Weather System
  function initWeatherSystem() {
    // Set random initial weather
    const weatherKeys = Object.keys(weatherTypes);
    const randomWeather = weatherKeys[Math.floor(Math.random() * weatherKeys.length)];
    gameState.currentWeather = randomWeather;
    gameState.weatherTimer = weatherTypes[randomWeather].duration;
    gameState.weatherDuration = weatherTypes[randomWeather].duration;
    
    // Update weather display
    updateWeatherDisplay();
  }
  
  // Update Weather Display
  function updateWeatherDisplay() {
    const weather = weatherTypes[gameState.currentWeather];
    const weatherIcon = document.getElementById('weatherIcon');
    const weatherName = document.getElementById('weatherName');
    
    if (!weatherIcon || !weatherName) return;
    
    // Set weather icon based on type
    switch(gameState.currentWeather) {
      case "sunny": weatherIcon.textContent = "☀️"; break;
      case "rainy": weatherIcon.textContent = "🌧️"; break;
      case "cold": weatherIcon.textContent = "❄️"; break;
      case "foggy": weatherIcon.textContent = "🌫️"; break;
      default: weatherIcon.textContent = "🌤️";
    }
    
    // Update name
    weatherName.textContent = weather.name;
    weatherName.style.color = weather.color;
  }
  
  // Change Weather
  function changeWeather() {
    // Get all weather types except current
    const weatherKeys = Object.keys(weatherTypes).filter(key => key !== gameState.currentWeather);
    
    // Select random weather
    const newWeather = weatherKeys[Math.floor(Math.random() * weatherKeys.length)];
    gameState.currentWeather = newWeather;
    gameState.weatherTimer = weatherTypes[newWeather].duration;
    gameState.weatherDuration = weatherTypes[newWeather].duration;
    
    // Update display
    updateWeatherDisplay();
    
    // Log weather change
    logMessage(`¡El clima ha cambiado a ${weatherTypes[newWeather].name}! ${weatherTypes[newWeather].description}`);
  }
  
  // Apply Weather Effects
  function applyWeatherEffects(tower) {
    const weather = weatherTypes[gameState.currentWeather];
    const effects = weather.effects;
    let damageMultiplier = 1;
    let rangeMultiplier = 1;
    let fireRateMultiplier = 1;
    
    // Apply global effects if any
    if (effects.towerBuffs && effects.towerBuffs.global) {
      if (effects.towerBuffs.global.damage) damageMultiplier += effects.towerBuffs.global.damage;
      if (effects.towerBuffs.global.range) rangeMultiplier += effects.towerBuffs.global.range;
      if (effects.towerBuffs.global.fireRate) fireRateMultiplier += effects.towerBuffs.global.fireRate;
    }
    
    if (effects.towerDebuffs && effects.towerDebuffs.global) {
      if (effects.towerDebuffs.global.damage) damageMultiplier += effects.towerDebuffs.global.damage;
      if (effects.towerDebuffs.global.range) rangeMultiplier += effects.towerDebuffs.global.range;
      if (effects.towerDebuffs.global.fireRate) fireRateMultiplier += effects.towerDebuffs.global.fireRate;
    }
    
    // Apply element-specific effects
    const element = towerTypes[tower.type].element;
    if (effects.towerBuffs && effects.towerBuffs[element]) {
      damageMultiplier += effects.towerBuffs[element];
    }
    
    if (effects.towerDebuffs && effects.towerDebuffs[element]) {
      damageMultiplier += effects.towerDebuffs[element];
    }
    
    // Apply tech tree bonuses
    damageMultiplier += gameState.techTree.damage * 0.1; // +10% per level
    rangeMultiplier += gameState.techTree.range * 0.1;   // +10% per level
    fireRateMultiplier += gameState.techTree.speed * 0.1; // +10% per level
    
    // Return modified values
    return {
      damage: tower.damage * damageMultiplier,
      range: tower.range * rangeMultiplier,
      fireRate: tower.fireRate * fireRateMultiplier
    };
  }
  
  // Apply Weather Effects to Enemy
  function applyWeatherEffectsToEnemy(enemy) {
    if (!enemy || !enemy.type) {
      return { speed: enemy ? enemy.speed : 1 };
    }
    
    const weather = weatherTypes[gameState.currentWeather] || weatherTypes.normal;
    const effects = weather.effects || {};
    let speedMultiplier = 1;
    
    // Apply global effects if any
    if (effects.enemyDebuffs && effects.enemyDebuffs.global) {
      if (effects.enemyDebuffs.global.speed) speedMultiplier += effects.enemyDebuffs.global.speed;
    }
    
    // Apply enemy-type specific effects
    if (effects.enemyBuffs && effects.enemyBuffs[enemy.type]) {
      if (effects.enemyBuffs[enemy.type].speed) speedMultiplier += effects.enemyBuffs[enemy.type].speed;
    }
    
    return {
      speed: enemy.speed * speedMultiplier
    };
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
    
    // Update weather timer
    gameState.weatherTimer -= deltaTime;
    if (gameState.weatherTimer <= 0) {
      changeWeather();
    }
    updateWeatherDisplay();
    
    // Update wave timer if not active
    if (!gameState.isWaveActive && !gameState.waveCompleted) {
      gameState.waveTimer -= deltaTime;
      if (gameState.waveTimer <= 0) {
        startWave();
      } else {
        // Update timer display
        const waveTimerValue = document.getElementById('waveTimerValue');
        const waveTimer = document.getElementById('waveTimer');
        if (waveTimerValue) waveTimerValue.textContent = Math.ceil(gameState.waveTimer);
        if (waveTimer) waveTimer.style.display = 'block';
      }
    } else {
      const waveTimer = document.getElementById('waveTimer');
      if (waveTimer) waveTimer.style.display = 'none';
    }
    
    // Update wave time limit
    if (gameState.isWaveActive) {
      gameState.waveTimeLimit -= deltaTime;
      if (gameState.waveTimeLimit <= 0) {
        // Force end wave after 21 seconds
        gameState.isWaveActive = false;
        gameState.waveCompleted = false;
        gameState.wave++;
        gameState.waveTimer = 5;
        
        // Update wave display
        document.querySelector('#wave .resource-value').textContent = `${gameState.wave}/${gameState.maxWaves}`;
        
        // Check if game is won
        if (gameState.wave > gameState.maxWaves) {
          gameOver(true);
          return;
        }
        
        logMessage(`Oleada ${gameState.wave - 1} terminada por tiempo`);
      }
    }
    
    // Spawn enemies
    if (gameState.isWaveActive && gameState.enemiesSpawned < gameState.enemiesPerWave * gameState.wave) {
      gameState.enemySpawnTimer += deltaTime * gameState.gameSpeed;
      
      // Spawn rate based on wave - more spaced out enemies
      const spawnInterval = (2 * 1.07 * 1.07 * 1.11 * 1.15 * 1.18) / (0.3 + gameState.wave * 0.08);
      
      if (gameState.enemySpawnTimer >= spawnInterval) {
        spawnEnemy();
        gameState.enemySpawnTimer = 0;
      }
    }
    
    // Update game entities
    moveEnemies(deltaTime);
    updateTowers(deltaTime);
    updateTowerAnimations(deltaTime);
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
    // Draw background tiles
    for (let x = 0; x < map.gridWidth; x++) {
      for (let y = 0; y < map.gridHeight; y++) {
        const tileX = x * map.tileSize;
        const tileY = y * map.tileSize;
        
        // Use basic grass tile if available
        if (cespedBasicoCargado && cespedBasico.complete) {
          ctx.drawImage(cespedBasico, tileX, tileY, map.tileSize, map.tileSize);
        } else {
          // Fallback color
          ctx.fillStyle = isOnPath(tileX + map.tileSize/2, tileY + map.tileSize/2) ? '#8B4513' : '#90EE90';
          ctx.fillRect(tileX, tileY, map.tileSize, map.tileSize);
        }
      }
    }
    
    // Draw map border
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.lineWidth = 3;
    ctx.strokeRect(0, 0, map.width, map.height);
    
    // Draw path with better visuals
    ctx.strokeStyle = '#d2b48c';
    ctx.lineWidth = map.tileSize - 8;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    
    // Draw path shadow
    ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
    ctx.shadowBlur = 4;
    ctx.shadowOffsetX = 2;
    ctx.shadowOffsetY = 2;
    
    ctx.beginPath();
    ctx.moveTo(map.path[0].x, map.path[0].y);
    
    for (let i = 1; i < map.path.length; i++) {
      ctx.lineTo(map.path[i].x, map.path[i].y);
    }
    
    ctx.stroke();
    
    // Reset shadow
    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;
    
    // Draw start point (spawn)
    ctx.fillStyle = '#2ecc71';
    ctx.beginPath();
    ctx.arc(map.path[0].x, map.path[0].y, 12, 0, Math.PI * 2);
    ctx.fill();
    
    // Draw start point border
    ctx.strokeStyle = '#27ae60';
    ctx.lineWidth = 2;
    ctx.stroke();
    
    // Draw end point (base)
    ctx.fillStyle = '#e74c3c';
    ctx.beginPath();
    ctx.arc(map.path[map.path.length - 1].x, map.path[map.path.length - 1].y, 12, 0, Math.PI * 2);
    ctx.fill();
    
    // Draw end point border
    ctx.strokeStyle = '#c0392b';
    ctx.lineWidth = 2;
    ctx.stroke();
    
    // Add spawn and base icons
    ctx.fillStyle = 'white';
    ctx.font = '16px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    
    // Spawn icon
    ctx.fillText('➤', map.path[0].x, map.path[0].y);
    
    // Base icon (clickeable nest)
    ctx.fillText('🏠', map.path[map.path.length - 1].x, map.path[map.path.length - 1].y);
  }
  
  // Draw towers
  function drawTowers() {
    for (const tower of gameState.towers) {
      // Draw tower shadow
      ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
      ctx.beginPath();
      ctx.arc(tower.x + 2, tower.y + 2, map.tileSize / 3, 0, Math.PI * 2);
      ctx.fill();
      
      if (tower.type === 'fire' && imagenFuegoCargada && hormigaFuego.complete) {
        ctx.save();
        ctx.translate(tower.x, tower.y);
        if (tower.angle !== undefined) ctx.rotate(tower.angle);
        ctx.drawImage(hormigaFuego, -towerSize/2, -towerSize/2, towerSize, towerSize);
        ctx.restore();
        
        ctx.fillStyle = 'white';
        ctx.strokeStyle = 'black';
        ctx.lineWidth = 2;
        ctx.font = 'bold 12px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.strokeText(tower.level, tower.x, tower.y - towerSize/2 - 8);
        ctx.fillText(tower.level, tower.x, tower.y - towerSize/2 - 8);
      } else if (tower.type === 'poison' && imagenVenenoCargada && hormigaVeneno.complete) {
        ctx.save();
        ctx.translate(tower.x, tower.y);
        if (tower.angle !== undefined) ctx.rotate(tower.angle);
        ctx.drawImage(hormigaVeneno, -towerSize/2, -towerSize/2, towerSize, towerSize);
        ctx.restore();
        
        ctx.fillStyle = 'white';
        ctx.strokeStyle = 'black';
        ctx.lineWidth = 2;
        ctx.font = 'bold 12px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.strokeText(tower.level, tower.x, tower.y - towerSize/2 - 8);
        ctx.fillText(tower.level, tower.x, tower.y - towerSize/2 - 8);
      } else if (tower.type === 'ice' && imagenHieloCargada && hormigaHielo.complete) {
        ctx.save();
        ctx.translate(tower.x, tower.y);
        if (tower.angle !== undefined) ctx.rotate(tower.angle);
        ctx.drawImage(hormigaHielo, -towerSize/2, -towerSize/2, towerSize, towerSize);
        ctx.restore();
        
        ctx.fillStyle = 'white';
        ctx.strokeStyle = 'black';
        ctx.lineWidth = 2;
        ctx.font = 'bold 12px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.strokeText(tower.level, tower.x, tower.y - towerSize/2 - 8);
        ctx.fillText(tower.level, tower.x, tower.y - towerSize/2 - 8);
      } else if (tower.type === 'carnivore' && imagenCarnivoraCargada && hormigaCarnivora.complete) {
        ctx.save();
        ctx.translate(tower.x, tower.y);
        if (tower.angle !== undefined) ctx.rotate(tower.angle);
        
        let extraRotation = 0;
        if (tower.meleeAnimation && tower.meleeAnimation.active && tower.meleeAnimation.frame === 1) {
          extraRotation = Math.PI / 6;
        }
        ctx.rotate(extraRotation);
        
        ctx.drawImage(hormigaCarnivora, -towerSize/2, -towerSize/2, towerSize, towerSize);
        ctx.restore();
        
        ctx.fillStyle = 'white';
        ctx.strokeStyle = 'black';
        ctx.lineWidth = 2;
        ctx.font = 'bold 12px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.strokeText(tower.level, tower.x, tower.y - towerSize/2 - 8);
        ctx.fillText(tower.level, tower.x, tower.y - towerSize/2 - 8);
      } else {
        dibujarTorreFallback(tower);
      }
      
      // Indicador de rango para la torre seleccionada
      if (tower === gameState.selectedTower) {
        ctx.strokeStyle = 'rgba(163, 198, 68, 0.6)';
        ctx.lineWidth = 2;
        ctx.setLineDash([5, 5]);
        ctx.beginPath();
        ctx.arc(tower.x, tower.y, tower.range, 0, Math.PI * 2);
        ctx.stroke();
        ctx.setLineDash([]);
      }
    }
  }
  
  // Función para dibujar torre fallback
  function dibujarTorreFallback(tower) {
    // Draw tower base
    ctx.fillStyle = tower.color;
    ctx.beginPath();
    ctx.arc(tower.x, tower.y, map.tileSize / 3, 0, Math.PI * 2);
    ctx.fill();
    
    // Draw tower border
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.3)';
    ctx.lineWidth = 2;
    ctx.stroke();
    
    // Draw tower icon based on type
    ctx.fillStyle = 'white';
    ctx.font = '16px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    
    const icons = {
      basic: '🐜',
      shooter: '🏹',
      bomber: '💣',
      poison: '☠️',
      fire: '🔥',
      ice: '❄️',
      carnivore: '🥩',
      queen: '👑'
    };
    
    ctx.fillText(icons[tower.type] || '🐜', tower.x, tower.y);
    
    // Indicador de nivel de la torre
    ctx.fillStyle = 'white';
    ctx.strokeStyle = 'black';
    ctx.lineWidth = 2;
    ctx.font = 'bold 12px Arial';
    ctx.strokeText(tower.level, tower.x, tower.y - map.tileSize/2 - 8);
    ctx.fillText(tower.level, tower.x, tower.y - map.tileSize/2 - 8);
  }
  
  // Draw enemies
  function drawEnemies() {
    for (const enemy of gameState.enemies) {
      // Draw enemy icon only (no circle background)
      ctx.font = `${enemy.size * 1.5}px Arial`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      
      const icons = {
        basic: '🪲',
        fast: '🕷️',
        scout: '🐜',
        soldier: '🐛',
        wasp: '🐝',
        beetle: '🪳',
        boss: '🐛'
      };
      
      ctx.fillText(icons[enemy.type] || '🪲', enemy.x, enemy.y);
      
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
      if (projectile.towerType === 'poison' && proyectilVenenoCargado && proyectilVeneno.complete) {
        ctx.drawImage(proyectilVeneno, projectile.x - projectile.size, projectile.y - projectile.size, projectile.size * 2, projectile.size * 2);
      } else if (projectile.towerType === 'fire' && proyectilFuegoCargado && proyectilFuego.complete) {
        ctx.drawImage(proyectilFuego, projectile.x - projectile.size, projectile.y - projectile.size, projectile.size * 2, projectile.size * 2);
      } else if (projectile.towerType === 'ice' && proyectilHieloCargado && proyectilHielo.complete) {
        ctx.drawImage(proyectilHielo, projectile.x - projectile.size, projectile.y - projectile.size, projectile.size * 2, projectile.size * 2);
      } else if (projectile.towerType === 'carnivore' && proyectilCarnivoraCargado && proyectilCarnivora.complete) {
        ctx.drawImage(proyectilCarnivora, projectile.x - projectile.size, projectile.y - projectile.size, projectile.size * 2, projectile.size * 2);
      } else {
        ctx.fillStyle = projectile.color;
        ctx.beginPath();
        ctx.arc(projectile.x, projectile.y, projectile.size, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }
  
  // Initialize the game
  initGame();
});
