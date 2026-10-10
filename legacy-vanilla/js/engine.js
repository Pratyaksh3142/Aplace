/**
 * Minecraft-Style Lush Voxel Isometric Simulation Engine
 * Combines vibrant voxel diorama aesthetics (stepped grass terraces, cherry blossom trees,
 * animated river stream, colorful guild bastions) with clean, legible editorial cards.
 */

class VoxelWorldEngine {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    
    // Map dimensions
    this.gridWidth = 26;
    this.gridHeight = 26;
    this.tileWidth = 64;
    this.tileHeight = 32;
    this.tileHeightHalf = this.tileHeight / 2;
    this.tileWidthHalf = this.tileWidth / 2;

    // Camera
    this.camera = {
      x: 0,
      y: 0,
      zoom: 1.0,
      targetZoom: 1.0
    };
    
    this.isDragging = false;
    this.lastMouse = { x: 0, y: 0 };

    // World Map Data
    this.map = [];
    this.buildings = [];
    this.trees = [];
    this.flowers = [];
    this.petals = [];
    this.particles = [];
    this.floatingTexts = [];
    this.transactionBeams = [];

    this.initMap();
    this.initTreesAndDecor();
    this.initPetals();
    this.initEvents();
  }

  initMap() {
    this.map = [];
    for (let y = 0; y < this.gridHeight; y++) {
      this.map[y] = [];
      for (let x = 0; x < this.gridWidth; x++) {
        let type = 'grass';
        let elevation = 0;

        // Stepped plateau elevations (Minecraft style diorama terraces)
        if (x < 7 && y < 7) elevation = 1;
        if (x > 18 && y < 8) elevation = 1;
        if (x < 8 && y > 18) elevation = 1;
        if (x > 18 && y > 18) elevation = 1;

        // River stream cutting through the center
        const riverX = 13 + Math.floor(Math.sin(y * 0.4) * 2.5);
        if (x >= riverX - 1 && x <= riverX + 1) {
          type = 'water';
          elevation = -0.3;
        }

        // Stepping stones over the river
        if (type === 'water' && (y === 12 || y === 13) && x === riverX) {
          type = 'stone_bridge';
          elevation = 0;
        }

        // Stone roads connecting zones
        const isCrossRoad = (y === 13 && x >= 4 && x <= 22) || (x === 13 && y >= 4 && y <= 22);
        const isBazaarPlaza = (x >= 9 && x <= 17 && y >= 9 && y <= 17 && type !== 'water');
        if ((isCrossRoad || isBazaarPlaza) && type !== 'water') {
          type = isBazaarPlaza ? 'plaza_stone' : 'stone_road';
        }

        this.map[y][x] = {
          type,
          elevation,
          baseColor: this.getTileBaseColor(type, elevation)
        };
      }
    }

    // Guild Buildings and Landmarks (Voxel Minecraft Stalls & Citadels)
    this.buildings = [
      {
        id: "bazaar",
        name: "Central Skill Exchange",
        gridX: 13,
        gridY: 10,
        type: "bazaar_stall",
        color: "#f6d365",
        accent: "#ff416c",
        label: "AI SKILL EXCHANGE"
      },
      {
        id: "passport_hall",
        name: "Passport Bureau",
        gridX: 21,
        gridY: 5,
        type: "citadel_tower",
        color: "#6a85b6",
        accent: "#00d2ff",
        label: "CIVIC PASSPORT TOWER"
      },
      {
        id: "geo_dome",
        name: "Geo Observatory",
        gridX: 4,
        gridY: 5,
        type: "observatory",
        color: "#9b51e0",
        accent: "#00f2fe",
        label: "SATELLITE VISION DOME"
      },
      {
        id: "code_forge",
        name: "Verification Forge",
        gridX: 4,
        gridY: 20,
        type: "code_forge",
        color: "#1e3c72",
        accent: "#38ef7d",
        label: "VERIFICATION FORGE"
      },
      {
        id: "escrow_vault",
        name: "Settlement Treasury",
        gridX: 21,
        gridY: 20,
        type: "vault",
        color: "#d4af37",
        accent: "#ffffff",
        label: "MUTUAL CREDIT CLEARING"
      }
    ];
  }

  getTileBaseColor(type, elevation) {
    if (type === 'water') return '#5fa8d3';
    if (type === 'stone_bridge') return '#dcd6cd';
    if (type === 'stone_road') return '#c7b299';
    if (type === 'plaza_stone') return '#d8c29d';
    
    // Vibrant Minecraft stepped grass gradients
    if (elevation === 1) return '#7bb35e';
    return '#8bc34a';
  }

  initTreesAndDecor() {
    this.trees = [];
    // Plant fluffy pink cherry blossom trees on elevated plateaus
    const treeLocs = [
      { x: 2, y: 2, color: '#fbc2eb', trunk: '#6e4a3b' },
      { x: 5, y: 2, color: '#e0c3fc', trunk: '#6e4a3b' },
      { x: 2, y: 5, color: '#fbc2eb', trunk: '#6e4a3b' },
      { x: 22, y: 2, color: '#fbc2eb', trunk: '#6e4a3b' },
      { x: 24, y: 5, color: '#fad0c4', trunk: '#6e4a3b' },
      { x: 2, y: 23, color: '#e0c3fc', trunk: '#6e4a3b' },
      { x: 23, y: 23, color: '#fbc2eb', trunk: '#6e4a3b' },
      { x: 9, y: 4, color: '#b9f6ca', trunk: '#6e4a3b' },
      { x: 17, y: 4, color: '#b9f6ca', trunk: '#6e4a3b' },
      { x: 8, y: 16, color: '#fbc2eb', trunk: '#6e4a3b' },
      { x: 18, y: 16, color: '#fad0c4', trunk: '#6e4a3b' }
    ];

    treeLocs.forEach(t => {
      this.trees.push({
        x: t.x,
        y: t.y,
        color: t.color,
        trunkColor: t.trunk,
        size: 1.15
      });
    });
  }

  initPetals() {
    this.petals = [];
    // Drifting cherry blossom petals
    for (let i = 0; i < 45; i++) {
      this.petals.push({
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        size: 3 + Math.random() * 4,
        vx: 0.6 + Math.random() * 1.2,
        vy: 0.8 + Math.random() * 1.4,
        angle: Math.random() * Math.PI * 2,
        color: Math.random() > 0.4 ? '#fbc2eb' : '#fad0c4'
      });
    }
  }

  initEvents() {
    this.canvas.addEventListener('mousedown', (e) => {
      this.isDragging = true;
      this.lastMouse = { x: e.clientX, y: e.clientY };
    });

    window.addEventListener('mouseup', () => {
      this.isDragging = false;
    });

    window.addEventListener('mousemove', (e) => {
      if (this.isDragging) {
        const dx = e.clientX - this.lastMouse.x;
        const dy = e.clientY - this.lastMouse.y;
        this.camera.x += dx;
        this.camera.y += dy;
        this.lastMouse = { x: e.clientX, y: e.clientY };
      }
    });

    this.canvas.addEventListener('wheel', (e) => {
      e.preventDefault();
      const zoomFactor = e.deltaY < 0 ? 1.08 : 0.92;
      this.camera.targetZoom = Math.max(0.6, Math.min(2.0, this.camera.zoom * zoomFactor));
    }, { passive: false });

    this.centerCamera();
  }

  centerCamera() {
    this.camera.x = this.canvas.width / 2;
    this.camera.y = this.canvas.height / 3.2;
    this.camera.zoom = 1.0;
    this.camera.targetZoom = 1.0;
  }

  resize() {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
  }

  isoToScreen(gx, gy, elev = 0) {
    const screenX = (gx - gy) * this.tileWidthHalf * this.camera.zoom + this.camera.x;
    const screenY = ((gx + gy) * this.tileHeightHalf - elev * 24) * this.camera.zoom + this.camera.y;
    return { x: screenX, y: screenY };
  }

  screenToIso(sx, sy) {
    const adjX = (sx - this.camera.x) / this.camera.zoom;
    const adjY = (sy - this.camera.y) / this.camera.zoom;
    const gx = (adjX / this.tileWidthHalf + adjY / this.tileHeightHalf) / 2;
    const gy = (adjY / this.tileHeightHalf - adjX / this.tileWidthHalf) / 2;
    return { x: Math.round(gx), y: Math.round(gy) };
  }

  addParticle(x, y, color = '#00d2ff') {
    this.particles.push({
      x,
      y,
      vx: (Math.random() - 0.5) * 3,
      vy: -Math.random() * 3 - 1,
      color,
      size: 3 + Math.random() * 3,
      life: 0.02,
      alpha: 1.0
    });
  }

  addFloatingText(x, y, text, color = '#38ef7d') {
    this.floatingTexts.push({
      x,
      y,
      text,
      color,
      alpha: 1.0,
      vy: -0.7,
      lifetime: 90
    });
  }

  addTransactionBeam(sourceAgent, targetAgent, label, color = '#00d2ff', isBarter = false) {
    this.transactionBeams.push({
      source: sourceAgent,
      target: targetAgent,
      label,
      color: isBarter ? '#f6d365' : color,
      isBarter,
      lifetime: 140,
      progress: 0
    });

    for (let i = 0; i < 15; i++) {
      const p = this.isoToScreen(sourceAgent.x, sourceAgent.y, 0.2);
      this.addParticle(p.x, p.y, isBarter ? '#f6d365' : color);
    }
  }

  render(agents = []) {
    this.camera.zoom += (this.camera.targetZoom - this.camera.zoom) * 0.1;

    const ctx = this.ctx;
    ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    // 1. Minecraft / Pastel Atmosphere Sky
    this.drawSkyBackground(ctx);

    // 2. Render Stepped Minecraft Voxel Terrain
    this.renderTerrain(ctx);

    // 3. Render Guild Landmarks & Stalls
    this.renderBuildings(ctx);

    // 4. Render Fluffy Cherry Blossom Trees
    this.renderTrees(ctx);

    // 5. Render Transaction Beams
    this.renderBeams(ctx);

    // 6. Render Autonomous Voxel Agents
    this.renderAgents(ctx, agents);

    // 7. Render Particles & Floating Receipts
    this.renderFX(ctx);

    // 8. Render Drifting Cherry Blossom Petals
    this.renderPetals(ctx);
  }

  drawSkyBackground(ctx) {
    // Soft pastel sunrise sky gradient
    const grad = ctx.createLinearGradient(0, 0, 0, this.canvas.height);
    grad.addColorStop(0, '#fce4ec');
    grad.addColorStop(0.45, '#f3e5f5');
    grad.addColorStop(1, '#e3f2fd');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    // Subtle sun glow
    const sunGrad = ctx.createRadialGradient(
      this.canvas.width * 0.75, this.canvas.height * 0.2, 10,
      this.canvas.width * 0.75, this.canvas.height * 0.2, 180
    );
    sunGrad.addColorStop(0, 'rgba(255, 253, 231, 0.8)');
    sunGrad.addColorStop(0.5, 'rgba(255, 248, 225, 0.3)');
    sunGrad.addColorStop(1, 'rgba(255, 248, 225, 0)');
    ctx.fillStyle = sunGrad;
    ctx.beginPath();
    ctx.arc(this.canvas.width * 0.75, this.canvas.height * 0.2, 180, 0, Math.PI * 2);
    ctx.fill();
  }

  renderTerrain(ctx) {
    const time = Date.now() * 0.002;

    for (let y = 0; y < this.gridHeight; y++) {
      for (let x = 0; x < this.gridWidth; x++) {
        const cell = this.map[y][x];
        const p = this.isoToScreen(x, y, cell.elevation);
        const tw2 = this.tileWidthHalf * this.camera.zoom;
        const th2 = this.tileHeightHalf * this.camera.zoom;

        const depth = (cell.elevation > 0 ? 18 : 6) * this.camera.zoom;

        // Animated azure river stream
        if (cell.type === 'water') {
          const wave = Math.sin(time + x * 0.5 + y * 0.8) * 2;
          ctx.fillStyle = '#64b5f6';
          ctx.beginPath();
          ctx.moveTo(p.x, p.y + wave);
          ctx.lineTo(p.x + tw2, p.y + th2 + wave);
          ctx.lineTo(p.x, p.y + th2 * 2 + wave);
          ctx.lineTo(p.x - tw2, p.y + th2 + wave);
          ctx.closePath();
          ctx.fill();

          // Water sheen highlight
          ctx.fillStyle = 'rgba(255, 255, 255, 0.25)';
          ctx.beginPath();
          ctx.arc(p.x, p.y + th2 + wave, 6 * this.camera.zoom, 0, Math.PI * 2);
          ctx.fill();
          continue;
        }

        // Stepped Voxel Left side
        ctx.fillStyle = this.darkenColor(cell.baseColor, -25);
        ctx.beginPath();
        ctx.moveTo(p.x - tw2, p.y + th2);
        ctx.lineTo(p.x, p.y + th2 * 2);
        ctx.lineTo(p.x, p.y + th2 * 2 + depth);
        ctx.lineTo(p.x - tw2, p.y + th2 + depth);
        ctx.closePath();
        ctx.fill();

        // Stepped Voxel Right side
        ctx.fillStyle = this.darkenColor(cell.baseColor, -12);
        ctx.beginPath();
        ctx.moveTo(p.x, p.y + th2 * 2);
        ctx.lineTo(p.x + tw2, p.y + th2);
        ctx.lineTo(p.x + tw2, p.y + th2 + depth);
        ctx.lineTo(p.x, p.y + th2 * 2 + depth);
        ctx.closePath();
        ctx.fill();

        // Voxel Top Face (Lush Minecraft grass)
        ctx.fillStyle = cell.baseColor;
        ctx.beginPath();
        ctx.moveTo(p.x, p.y);
        ctx.lineTo(p.x + tw2, p.y + th2);
        ctx.lineTo(p.x, p.y + th2 * 2);
        ctx.lineTo(p.x - tw2, p.y + th2);
        ctx.closePath();
        ctx.fill();

        // Delicate tile edge border
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.22)';
        ctx.lineWidth = 0.8;
        ctx.stroke();
      }
    }
  }

  renderBuildings(ctx) {
    const time = Date.now() * 0.003;

    this.buildings.forEach(b => {
      const p = this.isoToScreen(b.gridX, b.gridY, 0.2);
      const bWidth = 48 * this.camera.zoom;
      const bHeight = 52 * this.camera.zoom;

      // Soft shadow
      ctx.fillStyle = 'rgba(0, 0, 0, 0.12)';
      ctx.beginPath();
      ctx.ellipse(p.x, p.y + 10 * this.camera.zoom, bWidth * 0.9, bWidth * 0.45, 0, 0, Math.PI * 2);
      ctx.fill();

      // Main Block Structure
      ctx.fillStyle = b.color;
      ctx.beginPath();
      ctx.roundRect(p.x - bWidth / 2, p.y - bHeight, bWidth, bHeight, 4 * this.camera.zoom);
      ctx.fill();
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Roof / Canopy
      if (b.type === "bazaar_stall") {
        // Striped yellow & red merchant awning
        const awningH = 14 * this.camera.zoom;
        ctx.fillStyle = b.accent;
        ctx.fillRect(p.x - bWidth / 2 - 4, p.y - bHeight - awningH / 2, bWidth + 8, awningH);
        
        ctx.fillStyle = '#ffffff';
        const stripes = 4;
        const sw = (bWidth + 8) / stripes;
        for (let i = 0; i < stripes; i += 2) {
          ctx.fillRect(p.x - bWidth / 2 - 4 + i * sw, p.y - bHeight - awningH / 2, sw, awningH);
        }
      } else {
        // Citadel / Observatory dome accent
        ctx.fillStyle = b.accent;
        ctx.beginPath();
        ctx.roundRect(p.x - bWidth / 2, p.y - bHeight - 6 * this.camera.zoom, bWidth, 8 * this.camera.zoom, 2);
        ctx.fill();
      }

      // Floating Banner Tag
      const bob = Math.sin(time + b.gridX) * 2;
      ctx.font = `600 ${Math.max(9, Math.round(10 * this.camera.zoom))}px 'Plus Jakarta Sans', sans-serif`;
      ctx.textAlign = 'center';
      const textW = ctx.measureText(b.label).width;

      ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
      ctx.beginPath();
      ctx.roundRect(
        p.x - textW / 2 - 8,
        p.y - bHeight - 30 * this.camera.zoom + bob,
        textW + 16,
        18 * this.camera.zoom,
        4
      );
      ctx.fill();
      ctx.strokeStyle = b.accent;
      ctx.lineWidth = 1.2;
      ctx.stroke();

      ctx.fillStyle = '#18181A';
      ctx.fillText(b.label, p.x, p.y - bHeight - 18 * this.camera.zoom + bob);
    });
  }

  renderTrees(ctx) {
    this.trees.forEach(t => {
      const p = this.isoToScreen(t.x, t.y, 0.5);
      const scale = this.camera.zoom * t.size;

      // Wooden trunk
      ctx.fillStyle = t.trunkColor;
      ctx.fillRect(p.x - 4 * scale, p.y - 30 * scale, 8 * scale, 32 * scale);

      // Fluffy Multi-Tier Voxel Cherry Blossom Foliage
      const foliageTiers = [
        { y: -30, r: 24, c: t.color },
        { y: -45, r: 20, c: this.darkenColor(t.color, -10) },
        { y: -58, r: 14, c: this.darkenColor(t.color, -20) }
      ];

      foliageTiers.forEach(tier => {
        ctx.fillStyle = tier.c;
        ctx.beginPath();
        ctx.roundRect(
          p.x - tier.r * scale,
          p.y + tier.y * scale,
          tier.r * 2 * scale,
          tier.r * 1.5 * scale,
          6 * scale
        );
        ctx.fill();
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
        ctx.lineWidth = 1;
        ctx.stroke();
      });
    });
  }

  renderAgents(ctx, agents) {
    const time = Date.now() * 0.005;
    const sorted = [...agents].sort((a, b) => a.y - b.y);

    sorted.forEach(agent => {
      const p = this.isoToScreen(agent.x, agent.y, 0.1);
      const scale = this.camera.zoom;
      const walkBob = agent.isMoving ? Math.sin(time * 3) * 3 : 0;

      // Drop shadow
      ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
      ctx.beginPath();
      ctx.ellipse(p.x, p.y + 4 * scale, 14 * scale, 8 * scale, 0, 0, Math.PI * 2);
      ctx.fill();

      // Colorful Minecraft Voxel Body
      ctx.fillStyle = agent.color || agent.passport.color || '#00d2ff';
      ctx.beginPath();
      ctx.roundRect(
        p.x - 10 * scale,
        p.y - 28 * scale + walkBob,
        20 * scale,
        22 * scale,
        4 * scale
      );
      ctx.fill();
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Inner Monogram Token
      ctx.font = `bold ${Math.round(11 * scale)}px 'JetBrains Mono', monospace`;
      ctx.textAlign = 'center';
      ctx.fillStyle = '#ffffff';
      ctx.fillText(agent.glyph || agent.name.charAt(0), p.x, p.y - 14 * scale + walkBob);

      // Slashed indicator aura if disputed
      if (agent.reputation.isSlashed) {
        ctx.strokeStyle = '#ff416c';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.arc(p.x, p.y - 18 * scale + walkBob, 20 * scale, 0, Math.PI * 2);
        ctx.stroke();
      }

      // Floating Name & Reputation Pill
      ctx.font = `600 ${Math.max(9, Math.round(9 * scale))}px 'Plus Jakarta Sans', sans-serif`;
      const nameTag = `${agent.name}  ★${agent.reputation.score}`;
      const tagW = ctx.measureText(nameTag).width + 12;

      ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
      ctx.beginPath();
      ctx.roundRect(p.x - tagW / 2, p.y - 44 * scale + walkBob, tagW, 16 * scale, 4);
      ctx.fill();
      ctx.strokeStyle = agent.color || '#18181A';
      ctx.lineWidth = 1.2;
      ctx.stroke();

      ctx.fillStyle = '#18181A';
      ctx.fillText(nameTag, p.x, p.y - 32 * scale + walkBob);

      // Speech Callout Bubble
      if (agent.speechBubble && agent.speechBubble.visible) {
        this.renderSpeechBubble(ctx, p.x, p.y - 52 * scale + walkBob, agent.speechBubble.text, scale);
      }
    });
  }

  renderSpeechBubble(ctx, x, y, text, scale) {
    ctx.font = `500 ${Math.max(10, Math.round(11 * scale))}px 'Newsreader', Georgia, serif`;
    ctx.textAlign = 'center';
    
    // Clean string (strip emojis if any exist)
    const sanitized = text.replace(/[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu, '').trim();

    const textW = ctx.measureText(sanitized).width;
    const bubbleW = Math.min(340 * scale, Math.max(120 * scale, textW + 20 * scale));
    const bubbleH = 26 * scale;

    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.roundRect(x - bubbleW / 2, y - bubbleH, bubbleW, bubbleH, 5 * scale);
    ctx.fill();
    ctx.strokeStyle = '#18181A';
    ctx.lineWidth = 1.2;
    ctx.stroke();

    // Downward arrow
    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.moveTo(x - 5 * scale, y);
    ctx.lineTo(x, y + 6 * scale);
    ctx.lineTo(x + 5 * scale, y);
    ctx.fill();
    ctx.strokeStyle = '#18181A';
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.moveTo(x - 5 * scale, y);
    ctx.lineTo(x, y + 6 * scale);
    ctx.lineTo(x + 5 * scale, y);
    ctx.stroke();

    ctx.fillStyle = '#18181A';
    ctx.textBaseline = 'middle';
    ctx.fillText(sanitized, x, y - bubbleH / 2);
  }

  renderBeams(ctx) {
    for (let i = this.transactionBeams.length - 1; i >= 0; i--) {
      const beam = this.transactionBeams[i];
      beam.lifetime--;
      beam.progress = 1 - (beam.lifetime / 140);

      const p1 = this.isoToScreen(beam.source.x, beam.source.y, 0.2);
      const p2 = this.isoToScreen(beam.target.x, beam.target.y, 0.2);

      // Glowing dashed transaction beam
      ctx.strokeStyle = beam.color;
      ctx.lineWidth = 2.5 * this.camera.zoom;
      ctx.setLineDash([6, 4]);
      ctx.beginPath();
      ctx.moveTo(p1.x, p1.y - 16 * this.camera.zoom);
      ctx.lineTo(p2.x, p2.y - 16 * this.camera.zoom);
      ctx.stroke();
      ctx.setLineDash([]);

      // Moving Golden/Cyan Data Coin Token
      const packetX = p1.x + (p2.x - p1.x) * beam.progress;
      const packetY = p1.y + (p2.y - p1.y) * beam.progress - 16 * this.camera.zoom;
      
      ctx.fillStyle = beam.isBarter ? '#f6d365' : '#00d2ff';
      ctx.beginPath();
      ctx.arc(packetX, packetY, 5 * this.camera.zoom, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1;
      ctx.stroke();

      // Transaction Badge Label
      ctx.font = `600 ${Math.max(9, Math.round(10 * this.camera.zoom))}px 'JetBrains Mono', monospace`;
      ctx.fillStyle = '#FFFFFF';
      const labelW = ctx.measureText(beam.label).width + 12;
      const midX = (p1.x + p2.x) / 2;
      const midY = (p1.y + p2.y) / 2 - 24 * this.camera.zoom;
      
      ctx.beginPath();
      ctx.roundRect(midX - labelW / 2, midY - 8, labelW, 16, 3);
      ctx.fill();
      ctx.strokeStyle = beam.color;
      ctx.lineWidth = 1.2;
      ctx.stroke();

      ctx.fillStyle = '#18181A';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(beam.label, midX, midY);

      if (beam.lifetime <= 0) {
        this.transactionBeams.splice(i, 1);
      }
    }
  }

  renderFX(ctx) {
    // Floating particles
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const pt = this.particles[i];
      pt.x += pt.vx;
      pt.y += pt.vy;
      pt.alpha -= pt.life;

      if (pt.alpha <= 0) {
        this.particles.splice(i, 1);
        continue;
      }

      ctx.fillStyle = pt.color;
      ctx.globalAlpha = Math.max(0, pt.alpha);
      ctx.beginPath();
      ctx.arc(pt.x, pt.y, pt.size * this.camera.zoom, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1.0;

    // Floating transaction receipts
    for (let i = this.floatingTexts.length - 1; i >= 0; i--) {
      const ft = this.floatingTexts[i];
      ft.y += ft.vy;
      ft.alpha -= 0.014;
      ft.lifetime--;

      ctx.font = `bold ${Math.max(10, Math.round(12 * this.camera.zoom))}px 'JetBrains Mono', monospace`;
      ctx.textAlign = 'center';
      ctx.fillStyle = ft.color;
      ctx.globalAlpha = Math.max(0, ft.alpha);
      ctx.fillText(ft.text, ft.x, ft.y);
      ctx.globalAlpha = 1.0;

      if (ft.lifetime <= 0 || ft.alpha <= 0) {
        this.floatingTexts.splice(i, 1);
      }
    }
  }

  renderPetals(ctx) {
    this.petals.forEach(p => {
      p.x += p.vx;
      p.y += p.vy;
      p.angle += 0.02;

      if (p.x > this.canvas.width + 100) p.x = -100;
      if (p.y > this.canvas.height + 100) p.y = -100;

      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.ellipse(p.x, p.y, p.size, p.size * 0.5, p.angle, 0, Math.PI * 2);
      ctx.fill();
    });
  }

  darkenColor(hex, percent) {
    if (hex.startsWith('#')) hex = hex.slice(1);
    let num = parseInt(hex, 16);
    let r = (num >> 16) + percent;
    let g = ((num >> 8) & 0x00FF) + percent;
    let b = (num & 0x0000FF) + percent;
    r = Math.min(255, Math.max(0, r));
    g = Math.min(255, Math.max(0, g));
    b = Math.min(255, Math.max(0, g));
    return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
  }
}

window.VoxelWorldEngine = VoxelWorldEngine;
