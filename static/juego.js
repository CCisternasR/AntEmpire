document.addEventListener('DOMContentLoaded', async () => {
  // ① Obtén referencias
  const elLog            = document.getElementById('log');
  const progressContainer = document.getElementById('progressBarContainer');
  const progressBar       = document.getElementById('progressBar');

  // ② Depura que existan
  console.log({ elLog, progressContainer, progressBar });
  // Si alguno sale `null`, revisa que el id coincida en tu HTML.

  // ③ Fuerza estados iniciales
  elLog.innerHTML = '';                      // limpia cualquier resto
  progressContainer.style.display = 'none';  // oculta la barra
  progressBar.style.width = '0%';            // asegúrate que empiece vacía

  // ... aquí sigue el resto de tu lógica (cargar estado, generar minimapa, etc.) ...
});
// Este código es el núcleo del juego, maneja la lógica de recolectar recursos, entrenar hormigas y combatir enemigos.
// Se encarga de la interacción del usuario, actualiza el estado del juego y muestra animaciones.
(async function(){
  let food=10,fighters=0,queenHP=100,energy=100;
  let levelExplorer=1, levelFighter=1, levelQueen=1, levelCombat=1;
  let exploradoras = 0;
  let guerreras = 0;
  const center={x:12,y:12};
  let busy=false;

  const elFood=document.getElementById('food');
  const elFighters=document.getElementById('fighters');
  const elExploradoras = document.createElement('div');
  const elGuerreras = document.createElement('div');
  elFighters.insertAdjacentElement('afterend', elExploradoras);
  elExploradoras.insertAdjacentElement('afterend', elGuerreras);
  const elEnergy=document.getElementById('energy');
  const elQueen=document.getElementById('queenHealth');
  const elLog=document.getElementById('log');
  const elAnim=document.getElementById('animationZone');
  const miniMap=document.getElementById('miniMap');
  const progressBar=document.getElementById('progressBar');
  const progressContainer=document.getElementById('progressBarContainer');
  const elLevelExplorer=document.getElementById('levelExplorer');
  const elLevelFighter=document.getElementById('levelFighter');
  const elLevelQueen=document.getElementById('levelQueen');
  const elLevelCombat=document.getElementById('levelCombat');

  function updateUI(){
    // Actualizar elementos con la nueva estructura HTML
    document.querySelector('#exploradoras .stat-value').textContent = exploradoras;
    document.querySelector('#guerreras .stat-value').textContent = guerreras;
    
    // Actualizar recursos
    document.querySelector('#food .resource-value').textContent = food;
    document.querySelector('#fighters .resource-value').textContent = fighters;
    document.querySelector('#energy .resource-value').textContent = energy;
    
    // Actualizar barra de salud de la reina
    elQueen.style.width = queenHP + '%';
    
    // Actualizar niveles
    document.querySelector('#levelExplorer .resource-value').textContent = levelExplorer;
    document.querySelector('#levelFighter .resource-value').textContent = levelFighter;
    document.querySelector('#levelQueen .resource-value').textContent = levelQueen;
    document.querySelector('#levelCombat .resource-value').textContent = levelCombat;
  }
  function log(msg){const d=document.createElement('div');d.textContent=new Date().toLocaleTimeString()+' - '+msg;elLog.prepend(d);}
  function animate(txt){elAnim.textContent=txt;elAnim.style.opacity=1;}
  async function cargarEstado(){const r=await fetch('/cargar_estado');if(r.ok){const d=await r.json();
    if(d.food!==undefined){food=d.food;fighters=d.fighters;energy=d.energy;queenHP=d.queenHP;
        levelExplorer=d.levelExplorer||1;levelFighter=d.levelFighter||1;levelQueen=d.levelQueen||1;levelCombat=d.levelCombat||1;}}}
  function guardarEstado(){fetch('/guardar_estado',{method:'POST',headers:{'Content-Type':'application/json'},
  body:JSON.stringify({food,fighters,energy,queenHP,exploradoras, guerreras,levelExplorer, levelFighter, levelQueen, levelCombat})});}

  const types=['water','seed','leaf','danger'];
  function createTile(x,y){
    const tile=document.createElement('div');
    if(x===center.x && y===center.y){tile.className='miniTile anthill';tile.title='Hormiguero';return tile;}
    const type=types[Math.floor(Math.random()*types.length)];
    tile.className='miniTile '+type;
    tile.dataset.type=type;tile.dataset.x=x;tile.dataset.y=y;tile.title=type;
    tile.addEventListener('mouseenter',showTooltip);
    tile.addEventListener('mouseleave',hideTooltip);
    tile.addEventListener('click',handleTileClick);
    return tile;
  }
  function generateMiniMap(){for(let y=0;y<25;y++){for(let x=0;x<25;x++){miniMap.appendChild(createTile(x,y));}}}

  let tooltip;function showTooltip(e){const t=e.target.dataset.type||'hormiguero';tooltip=document.createElement('div');tooltip.className='tooltip';tooltip.textContent=t;e.target.appendChild(tooltip);}function hideTooltip(){if(tooltip)tooltip.remove();tooltip=null;}

  function handleTileClick(e) {
    if (busy) return log('🚫 Ya hay una recolectora en misión');

    const tile = e.target.closest('.miniTile');
    if (!tile || tile.classList.contains('anthill')) return;

    const type = tile.dataset.type;
    const x = +tile.dataset.x, y = +tile.dataset.y;
    const dist = Math.abs(x - center.x) + Math.abs(y - center.y);
    const energyCost = 5 + dist;

    if (energyCost > energy) {
      log(`🚫 Energía insuficiente (${energyCost})`);
      animate('Sin energía');
      return;
    }

    energy -= energyCost;
    updateUI();
    busy = true;

    animate(`🐜 Saliendo hacia zona ${type}`);
    progressContainer.style.display = 'block';
    progressBar.style.backgroundColor = 'purple';
    progressBar.style.width = '0%';

    const duration = dist * 400;
    progressBar.style.transition = `width ${duration}ms linear`;
    requestAnimationFrame(() => progressBar.style.width = '100%');

    let risk = type === 'danger'?0.6:type === 'water' ? 0.2 : type === 'seed'?0.3:0.1;if(exploradoras > 0){risk *= 0.5;exploradoras--;log('🔎Una exploradora acompañó la misión, reduciendo el riesgo'); }


    setTimeout(() => {
      const fracaso = Math.random() < risk;
      if (fracaso) {
        animate('💀 La recolectora fue perdida');
        log(`💀 La recolectora fue perdida en zona ${type}`);
        busy = false;
        progressContainer.style.display = 'none';
        guardarEstado();
        return;
      }

      animate('🐜 Recolectora regresando');
      progressBar.style.backgroundColor = 'saddlebrown';
      progressBar.style.width = '0%';
      progressBar.style.transition = `width ${duration}ms linear`;
      requestAnimationFrame(() => progressBar.style.width = '0%');

      setTimeout(() => {
        let gain = 0;
        switch (type) {
          case 'leaf': gain = Math.floor(Math.random() * 3) + 2; food += gain; break;
          case 'seed': gain = Math.floor(Math.random() * 5) + 3; food += gain; break;
          case 'water': log('💧 Agua encontrada'); break;
        }
        updateUI();
        guardarEstado();
        busy = false;
        progressContainer.style.display = 'none';
        if (gain > 0) {
          log(`📦 Recolectó +${gain} (${type})`);
        }
      }, duration);
    }, duration);
  }

  function trainFighter(){if(food<5)return log('No hay hojas suficientes.');food-=5;fighters++;updateUI();guardarEstado();log('Nuevo combatiente entrenado');}
  function trainExplorer() {if (food < 2) return log('No hay hojas suficientes para exploradora');food -= 2;exploradoras++;updateUI();guardarEstado();log('Nueva exploradora entrenada');}
  function trainWarrior() {if (food < 4) return log('No hay hojas suficientes para guerrera');food -= 4;guerreras++;updateUI();guardarEstado();log('Nueva guerrera entrenada');}
  function feedQueen(){if(food<3||queenHP>=100)return log('No se puede alimentar.');food-=3;queenHP=Math.min(100,queenHP+15);updateUI();guardarEstado();log('Reina alimentada');}
  function enemyAttack(){const dmg=Math.floor(Math.random()*20)+10;const defend=Math.min(dmg,fighters*10);queenHP=Math.max(0,queenHP-(dmg-defend));fighters=Math.max(0,fighters-Math.ceil(defend/10));updateUI();guardarEstado();log(`⚔️ Ataque enemigo! Daño ${dmg}, defendido ${defend}`);}

  document.getElementById('btnCombatiente').onclick=trainFighter;
  document.getElementById('btnAlimentar').onclick=feedQueen;
  document.getElementById('btnAtaque').onclick=enemyAttack;
  document.getElementById('btnExploradora').onclick = trainExplorer;
  document.getElementById('btnGuerrera').onclick = trainWarrior;


  setInterval(()=>{if(energy<100){energy=Math.min(100,energy+5);updateUI();guardarEstado();log('⚡ Energía recargada (+5)');}},3000);

  generateMiniMap();
  await cargarEstado();
  updateUI();
})();
