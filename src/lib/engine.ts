import { CitizenData } from '@/types';

export interface VoxelBuilding {
  id: string;
  name: string;
  gridX: number;
  gridY: number;
  type: string;
  color: string;
  accent: string;
  label: string;
}

export interface TreeData {
  x: number;
  y: number;
  color: string;
  trunkColor: string;
  size: number;
  hasLantern?: boolean;
}

export interface PetalData {
  x: number;
  y: number;
  size: number;
  vx: number;
  vy: number;
  angle: number;
  color: string;
}

export interface TransactionBeam {
  sourceX: number;
  sourceY: number;
  targetX: number;
  targetY: number;
  label: string;
  color: string;
  lifetime: number;
  progress: number;
}

export interface FloatingText {
  x: number;
  y: number;
  text: string;
  color: string;
  alpha: number;
  vy: number;
  lifetime: number;
}

export class VoxelWorldEngine {
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
  gridWidth = 26;
  gridHeight = 26;
  tileWidth = 64;
  tileHeight = 32;
  tileHeightHalf = 16;
  tileWidthHalf = 32;

  camera = { x: 0, y: 0, zoom: 1.0, targetZoom: 1.0 };
  isDragging = false;
  lastMouse = { x: 0, y: 0 };

  map: { type: string; elevation: number; baseColor: string }[][] = [];
  buildings: VoxelBuilding[] = [];
  trees: TreeData[] = [];
  petals: PetalData[] = [];
  floatingTexts: FloatingText[] = [];
  transactionBeams: TransactionBeam[] = [];

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d')!;

    this.initMap();
    this.initTrees();
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

        if ((x < 7 && y < 7) || (x > 18 && y < 8) || (x < 8 && y > 18) || (x > 18 && y > 18)) {
          elevation = 1;
        }

        const riverX = 13 + Math.floor(Math.sin(y * 0.4) * 2.5);
        if (x >= riverX - 1 && x <= riverX + 1) {
          type = 'water';
          elevation = -0.3;
        }

        if (type === 'water' && (y === 12 || y === 13) && x === riverX) {
          type = 'stone_bridge';
          elevation = 0;
        }

        const isCrossRoad = (y === 13 && x >= 4 && x <= 22) || (x === 13 && y >= 4 && y <= 22);
        const isBazaarPlaza = (x >= 9 && x <= 17 && y >= 9 && y <= 17 && type !== 'water');
        
        if ((isCrossRoad || isBazaarPlaza) && type !== 'water') {
          type = isBazaarPlaza ? 'plaza_stone' : 'stone_road';
        }

        // Add Farmland hugging the river banks
        if (type === 'grass' && (x === riverX - 2 || x === riverX + 2) && y > 4 && y < 22 && Math.random() < 0.7) {
          type = 'farmland';
        }

        // Add Dirt Paths branching from the crossroads
        if (type === 'grass' && Math.random() < 0.08 && elevation === 0) {
          type = 'dirt_path';
        }

        this.map[y][x] = {
          type,
          elevation,
          baseColor: this.getTileBaseColor(type, elevation)
        };
      }
    }

    this.buildings = [
      {
        id: "bazaar",
        name: "Central Skill Exchange",
        gridX: 13,
        gridY: 10,
        type: "bazaar_stall",
        color: "#f6d365",
        accent: "#ff416c",
        label: "CENTRAL AGORA"
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
        name: "Observatory",
        gridX: 4,
        gridY: 5,
        type: "observatory",
        color: "#9b51e0",
        accent: "#00f2fe",
        label: "DESIGN OBSERVATORY"
      },
      {
        id: "code_forge",
        name: "Software Bastion",
        gridX: 4,
        gridY: 20,
        type: "code_forge",
        color: "#1e3c72",
        accent: "#38ef7d",
        label: "SOFTWARE FORGE"
      },
      {
        id: "escrow_vault",
        name: "Town Treasury",
        gridX: 21,
        gridY: 20,
        type: "vault",
        color: "#d4af37",
        accent: "#ffffff",
        label: "TOWN TREASURY VAULT"
      },
      {
        id: "construction_site",
        name: "Eco-District Scaffold",
        gridX: 18,
        gridY: 12,
        type: "construction",
        color: "#d97706",
        accent: "#ea580c",
        label: "HABITAT CONSTRUCTION"
      }
    ];
  }

  getTileBaseColor(type: string, elevation: number) {
    if (type === 'water') return '#48cae4';
    if (type === 'stone_bridge') return '#e2ded9';
    if (type === 'stone_road') return '#d1c7b8';
    if (type === 'plaza_stone') return '#dfd5c4';
    if (type === 'farmland') return '#8b5a2b';
    if (type === 'dirt_path') return '#a67b5b';
    if (elevation === 1) return '#74b848';
    return '#85c854';
  }

  initTrees() {
    this.trees = [];
    const treeLocs = [
      { x: 2, y: 2, color: '#ffb3c6', trunk: '#5c3a21', lantern: true },
      { x: 5, y: 2, color: '#ffccd5', trunk: '#5c3a21' },
      { x: 2, y: 5, color: '#ffb3c6', trunk: '#5c3a21' },
      { x: 22, y: 2, color: '#ffb3c6', trunk: '#5c3a21', lantern: true },
      { x: 24, y: 5, color: '#ffe5ec', trunk: '#5c3a21' },
      { x: 2, y: 23, color: '#ffccd5', trunk: '#5c3a21' },
      { x: 23, y: 23, color: '#ffb3c6', trunk: '#5c3a21', lantern: true },
      { x: 9, y: 4, color: '#a7f3d0', trunk: '#5c3a21' },
      { x: 17, y: 4, color: '#a7f3d0', trunk: '#5c3a21' },
      { x: 8, y: 16, color: '#ffb3c6', trunk: '#5c3a21', lantern: true },
      { x: 18, y: 16, color: '#ffe5ec', trunk: '#5c3a21', lantern: true }
    ];

    treeLocs.forEach(t => {
      this.trees.push({
        x: t.x,
        y: t.y,
        color: t.color,
        trunkColor: t.trunk,
        size: 1.15,
        hasLantern: t.lantern
      });
    });
  }

  initPetals() {
    this.petals = [];
    const width = typeof window !== 'undefined' ? window.innerWidth : 1200;
    const height = typeof window !== 'undefined' ? window.innerHeight : 800;
    for (let i = 0; i < 55; i++) {
      this.petals.push({
        x: Math.random() * width,
        y: Math.random() * height,
        size: 3 + Math.random() * 4,
        vx: 0.6 + Math.random() * 1.2,
        vy: 0.4 + Math.random() * 0.9,
        angle: Math.random() * Math.PI * 2,
        color: Math.random() > 0.4 ? '#ffccd5' : '#ffb3c6'
      });
    }
  }

  initEvents() {
    this.canvas.addEventListener('mousedown', (e) => {
      if (e.button === 0) {
        this.isDragging = true;
        this.lastMouse = { x: e.clientX, y: e.clientY };
      }
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
    if (typeof window !== 'undefined') {
      this.canvas.width = window.innerWidth;
      this.canvas.height = window.innerHeight;
    }
  }

  isoToScreen(gx: number, gy: number, elev = 0) {
    const screenX = (gx - gy) * this.tileWidthHalf * this.camera.zoom + this.camera.x;
    const screenY = ((gx + gy) * this.tileHeightHalf - elev * 24) * this.camera.zoom + this.camera.y;
    return { x: screenX, y: screenY };
  }

  addFloatingText(x: number, y: number, text: string, color = '#38ef7d') {
    this.floatingTexts.push({
      x,
      y,
      text,
      color,
      alpha: 1.0,
      vy: -0.7,
      lifetime: 95
    });
  }

  addFloatingTextGrid(gx: number, gy: number, text: string, color = '#38ef7d') {
    const p = this.isoToScreen(gx, gy, 0.2);
    this.addFloatingText(p.x, p.y - 48 * this.camera.zoom, text, color);
  }

  addTransactionBeam(sourceX: number, sourceY: number, targetX: number, targetY: number, label: string, color = '#00d2ff') {
    this.transactionBeams.push({
      sourceX,
      sourceY,
      targetX,
      targetY,
      label,
      color,
      lifetime: 140,
      progress: 0
    });
  }

  render(citizens: CitizenData[]) {
    this.camera.zoom += (this.camera.targetZoom - this.camera.zoom) * 0.1;
    const ctx = this.ctx;
    ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    this.drawSkyBackground(ctx);
    this.renderTerrain(ctx);
    this.renderBuildings(ctx);
    this.renderTrees(ctx);
    this.renderCitizens(ctx, citizens);
    this.renderBeams(ctx);
    this.renderFX(ctx);
    this.renderPetals(ctx);
  }

  drawSkyBackground(ctx: CanvasRenderingContext2D) {
    const grad = ctx.createLinearGradient(0, 0, 0, this.canvas.height);
    grad.addColorStop(0, '#fde2e4');
    grad.addColorStop(0.35, '#f7e1d7');
    grad.addColorStop(0.7, '#e2ece9');
    grad.addColorStop(1, '#dfe7fd');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    // Warm morning sun glow
    const sunX = this.canvas.width * 0.78;
    const sunY = this.canvas.height * 0.18;
    const sunGrad = ctx.createRadialGradient(sunX, sunY, 12, sunX, sunY, 220);
    sunGrad.addColorStop(0, 'rgba(255, 250, 220, 0.9)');
    sunGrad.addColorStop(0.3, 'rgba(255, 235, 180, 0.35)');
    sunGrad.addColorStop(1, 'rgba(255, 240, 200, 0)');
    ctx.fillStyle = sunGrad;
    ctx.beginPath();
    ctx.arc(sunX, sunY, 220, 0, Math.PI * 2);
    ctx.fill();
  }

  renderTerrain(ctx: CanvasRenderingContext2D) {
    const time = Date.now() * 0.002;

    for (let y = 0; y < this.gridHeight; y++) {
      for (let x = 0; x < this.gridWidth; x++) {
        const cell = this.map[y][x];
        const p = this.isoToScreen(x, y, cell.elevation);
        const tw2 = this.tileWidthHalf * this.camera.zoom;
        const th2 = this.tileHeightHalf * this.camera.zoom;
        const depth = (cell.elevation > 0 ? 20 : 7) * this.camera.zoom;

        if (cell.type === 'water') {
          const wave = Math.sin(time + x * 0.4 + y * 0.7) * 2 * this.camera.zoom;
          
          // River water top
          ctx.fillStyle = '#48cae4';
          ctx.beginPath();
          ctx.moveTo(p.x, p.y + wave);
          ctx.lineTo(p.x + tw2, p.y + th2 + wave);
          ctx.lineTo(p.x, p.y + th2 * 2 + wave);
          ctx.lineTo(p.x - tw2, p.y + th2 + wave);
          ctx.closePath();
          ctx.fill();

          // River caustics / foam glints
          ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
          ctx.beginPath();
          ctx.arc(p.x + Math.sin(time + x) * 4, p.y + th2 + wave, 5 * this.camera.zoom, 0, Math.PI * 2);
          ctx.fill();
          continue;
        }

        // Minecraft-style side dirt face (Left - shadow)
        const dirtColorLeft = '#6e472a';
        ctx.fillStyle = dirtColorLeft;
        ctx.beginPath();
        ctx.moveTo(p.x - tw2, p.y + th2);
        ctx.lineTo(p.x, p.y + th2 * 2);
        ctx.lineTo(p.x, p.y + th2 * 2 + depth);
        ctx.lineTo(p.x - tw2, p.y + th2 + depth);
        ctx.closePath();
        ctx.fill();

        // Grass fringe hanging on left dirt
        if (cell.type === 'grass') {
          ctx.fillStyle = this.darkenColor(cell.baseColor, -15);
          ctx.beginPath();
          ctx.moveTo(p.x - tw2, p.y + th2);
          ctx.lineTo(p.x, p.y + th2 * 2);
          ctx.lineTo(p.x, p.y + th2 * 2 + 5 * this.camera.zoom);
          ctx.lineTo(p.x - tw2 / 2, p.y + th2 * 1.5 + 7 * this.camera.zoom);
          ctx.lineTo(p.x - tw2, p.y + th2 + 4 * this.camera.zoom);
          ctx.closePath();
          ctx.fill();
        }

        // Minecraft-style side dirt face (Right - medium light)
        const dirtColorRight = '#825636';
        ctx.fillStyle = dirtColorRight;
        ctx.beginPath();
        ctx.moveTo(p.x, p.y + th2 * 2);
        ctx.lineTo(p.x + tw2, p.y + th2);
        ctx.lineTo(p.x + tw2, p.y + th2 + depth);
        ctx.lineTo(p.x, p.y + th2 * 2 + depth);
        ctx.closePath();
        ctx.fill();

        // Grass fringe hanging on right dirt
        if (cell.type === 'grass') {
          ctx.fillStyle = this.darkenColor(cell.baseColor, -8);
          ctx.beginPath();
          ctx.moveTo(p.x, p.y + th2 * 2);
          ctx.lineTo(p.x + tw2, p.y + th2);
          ctx.lineTo(p.x + tw2, p.y + th2 + 4 * this.camera.zoom);
          ctx.lineTo(p.x + tw2 / 2, p.y + th2 * 1.5 + 7 * this.camera.zoom);
          ctx.lineTo(p.x, p.y + th2 * 2 + 5 * this.camera.zoom);
          ctx.closePath();
          ctx.fill();
        }

        // Top face (Direct sun)
        ctx.fillStyle = cell.baseColor;
        ctx.beginPath();
        ctx.moveTo(p.x, p.y);
        ctx.lineTo(p.x + tw2, p.y + th2);
        ctx.lineTo(p.x, p.y + th2 * 2);
        ctx.lineTo(p.x - tw2, p.y + th2);
        ctx.closePath();
        ctx.fill();

        // Subtle pixel dapple on grass top
        if (cell.type === 'grass') {
          ctx.fillStyle = 'rgba(255, 255, 255, 0.12)';
          ctx.fillRect(p.x - 2 * this.camera.zoom, p.y + th2 - 2 * this.camera.zoom, 4 * this.camera.zoom, 4 * this.camera.zoom);
        } else if (cell.type === 'stone_road' || cell.type === 'plaza_stone') {
          // Cobblestone paver lines
          ctx.strokeStyle = 'rgba(0, 0, 0, 0.08)';
          ctx.lineWidth = 1;
          ctx.stroke();
        } else if (cell.type === 'farmland') {
          // Tilled soil lines
          ctx.strokeStyle = 'rgba(0, 0, 0, 0.15)';
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(p.x - tw2 * 0.5, p.y + th2 * 0.5);
          ctx.lineTo(p.x + tw2 * 0.5, p.y + th2 * 1.5);
          ctx.stroke();
          // Wheat crops (3 little golden stalks)
          ctx.fillStyle = '#fcd34d';
          const cropSize = 3 * this.camera.zoom;
          const cropH = 6 * this.camera.zoom;
          const cropBob = Math.sin(time * 2 + x) * 1.5 * this.camera.zoom;
          ctx.fillRect(p.x - 8 * this.camera.zoom, p.y + th2 - 4 * this.camera.zoom + cropBob, cropSize, cropH);
          ctx.fillRect(p.x, p.y + th2 - 2 * this.camera.zoom + cropBob, cropSize, cropH);
          ctx.fillRect(p.x + 8 * this.camera.zoom, p.y + th2 + cropBob, cropSize, cropH);
        } else if (cell.type === 'dirt_path') {
          // Small scattered pebbles
          ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
          ctx.fillRect(p.x - 4 * this.camera.zoom, p.y + th2, 2 * this.camera.zoom, 2 * this.camera.zoom);
          ctx.fillRect(p.x + 6 * this.camera.zoom, p.y + th2 + 4 * this.camera.zoom, 3 * this.camera.zoom, 2 * this.camera.zoom);
        }

        ctx.strokeStyle = 'rgba(255, 255, 255, 0.18)';
        ctx.lineWidth = 0.8;
        ctx.stroke();
      }
    }
  }

  renderBuildings(ctx: CanvasRenderingContext2D) {
    const time = Date.now() * 0.003;

    this.buildings.forEach(b => {
      const p = this.isoToScreen(b.gridX, b.gridY, 0.2);
      const scale = this.camera.zoom;
      const bWidth = 52 * scale;
      const bHeight = 56 * scale;

      // Realistic soft shadow beneath
      ctx.fillStyle = 'rgba(0, 0, 0, 0.15)';
      ctx.beginPath();
      ctx.ellipse(p.x, p.y + 12 * scale, bWidth * 0.9, bWidth * 0.45, 0, 0, Math.PI * 2);
      ctx.fill();

      // Main voxel block
      ctx.fillStyle = b.color;
      ctx.beginPath();
      ctx.roundRect(p.x - bWidth / 2, p.y - bHeight, bWidth, bHeight, 5 * scale);
      ctx.fill();
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      if (b.type === "bazaar_stall") {
        // Agora Timber posts
        ctx.fillStyle = '#5c3a21';
        ctx.fillRect(p.x - bWidth / 2 + 2 * scale, p.y - bHeight, 4 * scale, bHeight);
        ctx.fillRect(p.x + bWidth / 2 - 6 * scale, p.y - bHeight, 4 * scale, bHeight);

        // Striped awning canopy
        const awningH = 16 * scale;
        ctx.fillStyle = b.accent;
        ctx.fillRect(p.x - bWidth / 2 - 5 * scale, p.y - bHeight - awningH / 2, bWidth + 10 * scale, awningH);

        ctx.fillStyle = '#ffffff';
        const stripes = 5;
        const sw = (bWidth + 10 * scale) / stripes;
        for (let i = 0; i < stripes; i += 2) {
          ctx.fillRect(p.x - bWidth / 2 - 5 * scale + i * sw, p.y - bHeight - awningH / 2, sw, awningH);
        }

        // Trade counter with goods
        ctx.fillStyle = '#a16207';
        ctx.fillRect(p.x - bWidth / 2 + 6 * scale, p.y - 18 * scale, bWidth - 12 * scale, 8 * scale);
        // Fruit/resource crates
        ctx.fillStyle = '#ef4444';
        ctx.fillRect(p.x - 8 * scale, p.y - 23 * scale, 5 * scale, 5 * scale);
        ctx.fillStyle = '#10b981';
        ctx.fillRect(p.x + 3 * scale, p.y - 23 * scale, 5 * scale, 5 * scale);
      } else if (b.type === "citadel_tower") {
        // Passport Citadel fortress battlements & blue beacon
        ctx.fillStyle = '#3b82f6';
        ctx.beginPath();
        ctx.arc(p.x, p.y - bHeight - 8 * scale, 7 * scale, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#ffffff';
        ctx.stroke();

        // Swiss cross emblem on tower
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(p.x - 4 * scale, p.y - bHeight / 1.7 - 1.5 * scale, 8 * scale, 3 * scale);
        ctx.fillRect(p.x - 1.5 * scale, p.y - bHeight / 1.7 - 4 * scale, 3 * scale, 8 * scale);
      } else if (b.type === "observatory") {
        // Glass dome
        ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
        ctx.beginPath();
        ctx.arc(p.x, p.y - bHeight, bWidth * 0.4, Math.PI, 0);
        ctx.fill();
        ctx.strokeStyle = '#00f2fe';
        ctx.stroke();
        // Telescope lens
        ctx.fillStyle = '#1e293b';
        ctx.beginPath();
        ctx.arc(p.x + 12 * scale, p.y - bHeight - 8 * scale, 4 * scale, 0, Math.PI * 2);
        ctx.fill();
      } else if (b.type === "code_forge") {
        // Glowing tech servers inside
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(p.x - bWidth * 0.3, p.y - bHeight + 10 * scale, bWidth * 0.6, bHeight - 10 * scale);
        ctx.fillStyle = '#38ef7d';
        const serverBob = Math.sin(time * 8) > 0 ? 1 : 0.4;
        ctx.globalAlpha = serverBob;
        ctx.fillRect(p.x - bWidth * 0.2, p.y - bHeight + 15 * scale, bWidth * 0.15, 4 * scale);
        ctx.fillRect(p.x + bWidth * 0.05, p.y - bHeight + 22 * scale, bWidth * 0.15, 4 * scale);
        ctx.globalAlpha = 1.0;
        // Flat roof edge
        ctx.fillStyle = b.accent;
        ctx.fillRect(p.x - bWidth / 2, p.y - bHeight, bWidth, 4 * scale);
      } else if (b.type === "vault") {
        // Fortified pillars and golden vault door
        ctx.fillStyle = '#b45309';
        ctx.fillRect(p.x - bWidth / 2 - 2 * scale, p.y - bHeight, 6 * scale, bHeight);
        ctx.fillRect(p.x + bWidth / 2 - 4 * scale, p.y - bHeight, 6 * scale, bHeight);
        // Giant golden vault gear
        ctx.fillStyle = '#fde047';
        ctx.beginPath();
        ctx.arc(p.x, p.y - bHeight / 2 + 5 * scale, 12 * scale, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#78350f';
        ctx.beginPath();
        ctx.arc(p.x, p.y - bHeight / 2 + 5 * scale, 4 * scale, 0, Math.PI * 2);
        ctx.fill();
      } else if (b.type === "construction") {
        // Wooden scaffolding around an unfinished concrete block
        ctx.fillStyle = '#94a3b8'; // concrete inner
        ctx.fillRect(p.x - bWidth * 0.4, p.y - bHeight * 0.6, bWidth * 0.8, bHeight * 0.6);
        ctx.strokeStyle = '#d97706'; // wood scaffolding
        ctx.lineWidth = 2 * scale;
        // Scaffolding lines
        for(let i=0; i<3; i++) {
          ctx.beginPath();
          ctx.moveTo(p.x - bWidth * 0.45, p.y - i * 14 * scale);
          ctx.lineTo(p.x + bWidth * 0.45, p.y - i * 14 * scale);
          ctx.stroke();
        }
        ctx.beginPath();
        ctx.moveTo(p.x - bWidth * 0.2, p.y);
        ctx.lineTo(p.x - bWidth * 0.2, p.y - bHeight * 0.8);
        ctx.moveTo(p.x + bWidth * 0.2, p.y);
        ctx.lineTo(p.x + bWidth * 0.2, p.y - bHeight * 0.8);
        ctx.stroke();
        // Yellow warning tape
        ctx.fillStyle = '#facc15';
        ctx.fillRect(p.x - bWidth * 0.45, p.y - bHeight * 0.4, bWidth * 0.9, 3 * scale);
      } else {
        ctx.fillStyle = b.accent;
        ctx.beginPath();
        ctx.roundRect(p.x - bWidth / 2, p.y - bHeight - 6 * scale, bWidth, 8 * scale, 2);
        ctx.fill();
      }

      // Elegant floating editorial building badge
      const bob = Math.sin(time + b.gridX) * 2;
      ctx.font = `600 ${Math.max(9, Math.round(10 * scale))}px -apple-system, sans-serif`;
      ctx.textAlign = 'center';
      const textW = ctx.measureText(b.label).width;

      ctx.fillStyle = 'rgba(255, 255, 255, 0.96)';
      ctx.beginPath();
      ctx.roundRect(p.x - textW / 2 - 8, p.y - bHeight - 32 * scale + bob, textW + 16, 18 * scale, 4);
      ctx.fill();
      ctx.strokeStyle = b.accent;
      ctx.lineWidth = 1.2;
      ctx.stroke();

      ctx.fillStyle = '#18181A';
      ctx.fillText(b.label, p.x, p.y - bHeight - 20 * scale + bob);
    });
  }

  renderTrees(ctx: CanvasRenderingContext2D) {
    this.trees.forEach(t => {
      const p = this.isoToScreen(t.x, t.y, 0.4);
      const scale = this.camera.zoom * t.size;

      // Tree shadow
      ctx.fillStyle = 'rgba(0, 0, 0, 0.16)';
      ctx.beginPath();
      ctx.ellipse(p.x, p.y + 4 * scale, 24 * scale, 12 * scale, 0, 0, Math.PI * 2);
      ctx.fill();

      // Voxel 3D trunk with textured bark
      ctx.fillStyle = t.trunkColor;
      ctx.fillRect(p.x - 4.5 * scale, p.y - 32 * scale, 9 * scale, 34 * scale);
      ctx.fillStyle = this.darkenColor(t.trunkColor, -20);
      ctx.fillRect(p.x - 4.5 * scale, p.y - 32 * scale, 3.5 * scale, 34 * scale);

      // Layered Cherry Blossom Voxel Clouds
      const foliageTiers = [
        { y: -32, r: 26, h: 22, c: '#ff85a2' },  // Deep sakura base
        { y: -48, r: 22, h: 20, c: t.color },     // Main vibrant sakura
        { y: -62, r: 16, h: 16, c: '#ffe5ec' }   // Pale white blossom canopy
      ];

      foliageTiers.forEach(tier => {
        // Voxel block clump
        ctx.fillStyle = tier.c;
        ctx.beginPath();
        ctx.roundRect(p.x - tier.r * scale, p.y + tier.y * scale, tier.r * 2 * scale, tier.h * scale, 6 * scale);
        ctx.fill();
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.45)';
        ctx.lineWidth = 1.2;
        ctx.stroke();
      });

      // Hanging Warm Paper Lantern
      if (t.hasLantern) {
        const lanternY = p.y - 20 * scale;
        const lanternX = p.x + 18 * scale;

        // Cord
        ctx.strokeStyle = '#222222';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(lanternX, p.y - 32 * scale);
        ctx.lineTo(lanternX, lanternY);
        ctx.stroke();

        // Warm lantern glow
        const glowGrad = ctx.createRadialGradient(lanternX, lanternY + 5 * scale, 2, lanternX, lanternY + 5 * scale, 14 * scale);
        glowGrad.addColorStop(0, 'rgba(254, 240, 138, 0.85)');
        glowGrad.addColorStop(1, 'rgba(254, 240, 138, 0)');
        ctx.fillStyle = glowGrad;
        ctx.beginPath();
        ctx.arc(lanternX, lanternY + 5 * scale, 14 * scale, 0, Math.PI * 2);
        ctx.fill();

        // Paper lantern box
        ctx.fillStyle = '#f59e0b';
        ctx.fillRect(lanternX - 3.5 * scale, lanternY, 7 * scale, 9 * scale);
        ctx.fillStyle = '#fef08a';
        ctx.fillRect(lanternX - 2 * scale, lanternY + 2 * scale, 4 * scale, 5 * scale);
      }
    });
  }

  // 3D Pixelated Voxel Puppet Mascot Renderer for Citizens
  renderCitizens(ctx: CanvasRenderingContext2D, citizens: CitizenData[]) {
    const time = Date.now() * 0.005;
    const sorted = [...citizens].sort((a, b) => a.y - b.y);

    sorted.forEach(citizen => {
      const p = this.isoToScreen(citizen.x, citizen.y, 0.1);
      const scale = this.camera.zoom;
      const walkBob = citizen.isMoving ? Math.sin(time * 12) * 2.5 * scale : Math.sin(time * 3) * 0.8 * scale;
      const legSwing = citizen.isMoving ? Math.sin(time * 14) : 0;
      const armSwing = citizen.isMoving ? Math.cos(time * 14) : 0;

      // 1. Drop shadow
      ctx.fillStyle = 'rgba(0, 0, 0, 0.22)';
      ctx.beginPath();
      ctx.ellipse(p.x, p.y + 4 * scale, 13 * scale, 7 * scale, 0, 0, Math.PI * 2);
      ctx.fill();

      // 2. Animated Voxel Legs
      const legW = 3.5 * scale;
      const legH = 7 * scale;

      // Left Leg & Shoe
      ctx.fillStyle = '#2c3e50';
      ctx.fillRect(p.x - 4.5 * scale, p.y - 7 * scale + walkBob + legSwing * 3 * scale, legW, legH);
      ctx.fillStyle = '#1a1a1a';
      ctx.fillRect(p.x - 5.5 * scale, p.y - 1.5 * scale + walkBob + legSwing * 3 * scale, legW + 1 * scale, 2.5 * scale);

      // Right Leg & Shoe
      ctx.fillStyle = '#34495e';
      ctx.fillRect(p.x + 1 * scale, p.y - 7 * scale + walkBob - legSwing * 3 * scale, legW, legH);
      ctx.fillStyle = '#1a1a1a';
      ctx.fillRect(p.x + 1 * scale, p.y - 1.5 * scale + walkBob - legSwing * 3 * scale, legW + 1 * scale, 2.5 * scale);

      // 3. Voxel Torso & Guild Tunic
      const bodyW = 12 * scale;
      const bodyH = 11 * scale;
      const bodyY = p.y - 18 * scale + walkBob;

      ctx.fillStyle = citizen.color || '#00d2ff';
      ctx.fillRect(p.x - bodyW / 2, bodyY, bodyW, bodyH);

      // Inner tunic details / collar / belt
      ctx.fillStyle = 'rgba(255, 255, 255, 0.35)';
      ctx.fillRect(p.x - 1.5 * scale, bodyY, 3 * scale, bodyH);
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(p.x - bodyW / 2, bodyY + bodyH - 2.5 * scale, bodyW, 2.5 * scale);
      ctx.fillStyle = '#f59e0b';
      ctx.fillRect(p.x - 1.5 * scale, bodyY + bodyH - 3 * scale, 3 * scale, 3 * scale); // gold buckle

      ctx.strokeStyle = 'rgba(0, 0, 0, 0.3)';
      ctx.lineWidth = 1;
      ctx.strokeRect(p.x - bodyW / 2, bodyY, bodyW, bodyH);

      // 4. Animated Voxel Arms & Held Profession Props
      const armW = 3.5 * scale;
      const armH = 8 * scale;

      // Left Arm
      ctx.fillStyle = citizen.color;
      ctx.fillRect(p.x - bodyW / 2 - armW, bodyY + 1 * scale + armSwing * 2 * scale, armW, armH);
      ctx.fillStyle = '#fcd5b5'; // Left Hand
      ctx.fillRect(p.x - bodyW / 2 - armW, bodyY + 1 * scale + armH - 2 * scale + armSwing * 2 * scale, armW, 2.5 * scale);

      // Right Arm (holding profession prop)
      ctx.fillStyle = citizen.color;
      ctx.fillRect(p.x + bodyW / 2, bodyY + 1 * scale - armSwing * 2 * scale, armW, armH);
      ctx.fillStyle = '#fcd5b5'; // Right Hand
      ctx.fillRect(p.x + bodyW / 2, bodyY + 1 * scale + armH - 2 * scale - armSwing * 2 * scale, armW, 2.5 * scale);

      // Unique Profession Mascot Prop in Hand
      const propX = p.x + bodyW / 2 + 2.5 * scale;
      const propY = bodyY + 3 * scale - armSwing * 2 * scale;

      if (citizen.name === 'Maya') {
        // Blueprint roll & drafting T-square
        ctx.fillStyle = '#0284c7';
        ctx.fillRect(propX, propY - 6 * scale, 4 * scale, 10 * scale);
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(propX + 1 * scale, propY - 4 * scale, 2 * scale, 1.5 * scale);
        ctx.fillRect(propX + 1 * scale, propY - 1 * scale, 2 * scale, 1.5 * scale);
      } else if (citizen.name === 'Liam') {
        // Color palette & stylus
        ctx.fillStyle = '#fef3c7';
        ctx.beginPath();
        ctx.ellipse(propX + 2 * scale, propY - 2 * scale, 5 * scale, 4 * scale, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#f43f5e'; ctx.fillRect(propX, propY - 4 * scale, 2 * scale, 2 * scale);
        ctx.fillStyle = '#06b6d4'; ctx.fillRect(propX + 2.5 * scale, propY - 4 * scale, 2 * scale, 2 * scale);
        ctx.fillStyle = '#eab308'; ctx.fillRect(propX + 1 * scale, propY - 1.5 * scale, 2 * scale, 2 * scale);
      } else if (citizen.name === 'Devon') {
        // Glowing tech terminal chip
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(propX - 1 * scale, propY - 5 * scale, 6 * scale, 5 * scale);
        ctx.fillStyle = '#22c55e';
        ctx.fillRect(propX, propY - 4 * scale, 4 * scale, 3 * scale);
      } else if (citizen.name === 'Elena') {
        // Scholar leather book
        ctx.fillStyle = '#78350f';
        ctx.fillRect(propX - 1 * scale, propY - 6 * scale, 5 * scale, 7 * scale);
        ctx.fillStyle = '#fef3c7';
        ctx.fillRect(propX, propY - 5 * scale, 3.5 * scale, 5 * scale);
      } else if (citizen.name === 'Marcus') {
        // Gold coin ledger
        ctx.fillStyle = '#d97706';
        ctx.beginPath();
        ctx.arc(propX + 2 * scale, propY - 2 * scale, 4 * scale, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#fde047';
        ctx.beginPath();
        ctx.arc(propX + 2 * scale, propY - 2 * scale, 2.5 * scale, 0, Math.PI * 2);
        ctx.fill();
      } else if (citizen.name === 'Chloe') {
        // Construction hammer
        ctx.fillStyle = '#52525b';
        ctx.fillRect(propX, propY - 6 * scale, 6 * scale, 3 * scale);
        ctx.fillStyle = '#78350f';
        ctx.fillRect(propX + 1.5 * scale, propY - 3 * scale, 2 * scale, 6 * scale);
      } else if (citizen.name === 'Lucas') {
        // Logistics parcel
        ctx.fillStyle = '#b45309';
        ctx.fillRect(propX - 1 * scale, propY - 5 * scale, 6 * scale, 6 * scale);
        ctx.fillStyle = '#fef3c7';
        ctx.fillRect(propX + 1.5 * scale, propY - 5 * scale, 1.5 * scale, 6 * scale);
      } else if (citizen.name === 'Sophia') {
        // Community heart badge
        ctx.fillStyle = '#f43f5e';
        ctx.beginPath();
        ctx.arc(propX + 1 * scale, propY - 3 * scale, 2.5 * scale, 0, Math.PI * 2);
        ctx.arc(propX + 4 * scale, propY - 3 * scale, 2.5 * scale, 0, Math.PI * 2);
        ctx.fill();
      }

      // 5. 3D Voxel Head & Unique Headwear
      const headW = 12 * scale;
      const headH = 10 * scale;
      const headY = bodyY - headH;

      // Skin Tone Face
      ctx.fillStyle = '#fcd5b5';
      ctx.fillRect(p.x - headW / 2, headY, headW, headH);

      // Cute Pixel Eyes
      const eyeY = headY + 3.5 * scale;
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(p.x - 3.5 * scale, eyeY, 2 * scale, 2.5 * scale); // Left
      ctx.fillRect(p.x + 1.5 * scale, eyeY, 2 * scale, 2.5 * scale); // Right
      // Catchlight glints
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(p.x - 3 * scale, eyeY, 1 * scale, 1 * scale);
      ctx.fillRect(p.x + 2 * scale, eyeY, 1 * scale, 1 * scale);

      // Rosy cheeks
      ctx.fillStyle = 'rgba(244, 63, 94, 0.45)';
      ctx.fillRect(p.x - 4.5 * scale, eyeY + 2.5 * scale, 2 * scale, 1.2 * scale);
      ctx.fillRect(p.x + 2.5 * scale, eyeY + 2.5 * scale, 2 * scale, 1.2 * scale);

      // Character-Specific Hair & Headwear Mascot
      if (citizen.name === 'Maya') {
        // Drafting beret with pencil
        ctx.fillStyle = '#0284c7';
        ctx.fillRect(p.x - headW / 2 - 1 * scale, headY - 3 * scale, headW + 2 * scale, 4 * scale);
        ctx.fillRect(p.x - headW / 2 + 1 * scale, headY - 5 * scale, headW - 2 * scale, 3 * scale);
        // Yellow pencil
        ctx.fillStyle = '#eab308';
        ctx.fillRect(p.x + headW / 2, headY + 1 * scale, 3 * scale, 1.5 * scale);
      } else if (citizen.name === 'Liam') {
        // Designer pink hair + black round glasses
        ctx.fillStyle = '#f43f5e';
        ctx.fillRect(p.x - headW / 2 - 1 * scale, headY - 3 * scale, headW + 2 * scale, 4 * scale);
        ctx.strokeStyle = '#0f172a';
        ctx.lineWidth = 1 * scale;
        ctx.strokeRect(p.x - 4.5 * scale, eyeY - 0.5 * scale, 3.5 * scale, 3.5 * scale);
        ctx.strokeRect(p.x + 0.5 * scale, eyeY - 0.5 * scale, 3.5 * scale, 3.5 * scale);
      } else if (citizen.name === 'Devon') {
        // Dark hair + neon green builder headset
        ctx.fillStyle = '#1e293b';
        ctx.fillRect(p.x - headW / 2 - 1 * scale, headY - 3 * scale, headW + 2 * scale, 3.5 * scale);
        ctx.fillStyle = '#22c55e';
        ctx.fillRect(p.x - headW / 2 - 2 * scale, headY + 2 * scale, 2.5 * scale, 5 * scale);
        ctx.fillRect(p.x + headW / 2 - 0.5 * scale, headY + 2 * scale, 2.5 * scale, 5 * scale);
        ctx.fillRect(p.x - headW / 2 - 1 * scale, headY - 3.5 * scale, headW + 2 * scale, 1.5 * scale);
      } else if (citizen.name === 'Elena') {
        // Scholar purple bun + golden spectacles
        ctx.fillStyle = '#6b21a8';
        ctx.fillRect(p.x - headW / 2 - 1 * scale, headY - 4 * scale, headW + 2 * scale, 4.5 * scale);
        ctx.fillRect(p.x - 2.5 * scale, headY - 6.5 * scale, 5 * scale, 3 * scale);
        ctx.strokeStyle = '#eab308';
        ctx.lineWidth = 1 * scale;
        ctx.strokeRect(p.x - 4 * scale, eyeY, 3 * scale, 3 * scale);
        ctx.strokeRect(p.x + 1 * scale, eyeY, 3 * scale, 3 * scale);
      } else if (citizen.name === 'Marcus') {
        // Accountant visor
        ctx.fillStyle = '#b45309';
        ctx.fillRect(p.x - headW / 2 - 1 * scale, headY - 2.5 * scale, headW + 2 * scale, 3 * scale);
        ctx.fillStyle = 'rgba(245, 158, 11, 0.7)';
        ctx.fillRect(p.x - headW / 2 - 2 * scale, headY + 1 * scale, headW + 4 * scale, 2.5 * scale);
      } else if (citizen.name === 'Chloe') {
        // Orange safety hardhat with lamp
        ctx.fillStyle = '#ea580c';
        ctx.fillRect(p.x - headW / 2 - 2 * scale, headY - 3.5 * scale, headW + 4 * scale, 4 * scale);
        ctx.fillRect(p.x - headW / 2, headY - 6 * scale, headW, 3 * scale);
        ctx.fillStyle = '#fef08a';
        ctx.fillRect(p.x - 1.5 * scale, headY - 4 * scale, 3 * scale, 2 * scale);
      } else if (citizen.name === 'Lucas') {
        // Courier postal cap
        ctx.fillStyle = '#0f766e';
        ctx.fillRect(p.x - headW / 2 - 1 * scale, headY - 3 * scale, headW + 2 * scale, 3.5 * scale);
        ctx.fillRect(p.x - 1 * scale, headY - 1 * scale, headW / 2 + 3 * scale, 2 * scale);
      } else if (citizen.name === 'Sophia') {
        // Flower garland crown
        ctx.fillStyle = '#be185d';
        ctx.fillRect(p.x - headW / 2 - 1 * scale, headY - 3 * scale, headW + 2 * scale, 3.5 * scale);
        ctx.fillStyle = '#fde047'; ctx.fillRect(p.x - 4 * scale, headY - 2 * scale, 2 * scale, 2 * scale);
        ctx.fillStyle = '#f43f5e'; ctx.fillRect(p.x - 1 * scale, headY - 3.5 * scale, 2 * scale, 2 * scale);
        ctx.fillStyle = '#fde047'; ctx.fillRect(p.x + 2 * scale, headY - 2 * scale, 2 * scale, 2 * scale);
      }

      // 6. Thinking Indicator (when Mercury 2.5 is reasoning or speaking)
      if (citizen.speechVisible) {
        const thinkBob = Math.sin(time * 6) * 2;
        ctx.fillStyle = '#fef08a';
        ctx.beginPath();
        ctx.arc(p.x, headY - 8 * scale + thinkBob, 3.5 * scale, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#eab308';
        ctx.lineWidth = 1;
        ctx.stroke();
      }

      // 7. Editorial Name Tag & Liquid Balance
      ctx.font = `600 ${Math.max(9, Math.round(9 * scale))}px -apple-system, sans-serif`;
      const nameTag = `${citizen.name} · $${citizen.wallet.balance.toFixed(0)}`;
      const tagW = ctx.measureText(nameTag).width + 12;

      ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
      ctx.beginPath();
      ctx.roundRect(p.x - tagW / 2, headY - 20 * scale + walkBob, tagW, 16 * scale, 4);
      ctx.fill();
      ctx.strokeStyle = citizen.color || '#18181A';
      ctx.lineWidth = 1.2;
      ctx.stroke();

      ctx.fillStyle = '#18181A';
      ctx.fillText(nameTag, p.x, headY - 9 * scale + walkBob);

      // Speech bubble if visible
      if (citizen.speechVisible && citizen.speechText) {
        this.renderSpeechBubble(ctx, p.x, headY - 26 * scale + walkBob, citizen.speechText, scale);
      }
    });
  }

  renderSpeechBubble(ctx: CanvasRenderingContext2D, x: number, y: number, text: string, scale: number) {
    const fontSize = Math.max(11, Math.round(11 * scale));
    ctx.font = `500 ${fontSize}px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    const maxLineWidth = 220 * scale;
    const words = text.split(' ');
    let lines = [];
    let currentLine = words[0];

    for (let i = 1; i < words.length; i++) {
      const word = words[i];
      const width = ctx.measureText(currentLine + " " + word).width;
      if (width < maxLineWidth) {
        currentLine += " " + word;
      } else {
        lines.push(currentLine);
        currentLine = word;
      }
    }
    lines.push(currentLine);

    const lineHeight = fontSize * 1.4;
    const padding = 12 * scale;
    // Calculate bubble width based on longest line
    let maxFoundWidth = 0;
    lines.forEach(line => {
      const w = ctx.measureText(line).width;
      if (w > maxFoundWidth) maxFoundWidth = w;
    });
    const bubbleW = maxFoundWidth + padding * 2;
    const bubbleH = (lines.length * lineHeight) + padding;

    const by = y - bubbleH - 8 * scale; // Shift up to accommodate tail

    // Drop shadow
    ctx.shadowColor = 'rgba(0, 0, 0, 0.12)';
    ctx.shadowBlur = 10 * scale;
    ctx.shadowOffsetY = 4 * scale;

    // Bubble Body
    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.roundRect(x - bubbleW / 2, by, bubbleW, bubbleH, 8 * scale);
    ctx.fill();

    // Tail
    ctx.beginPath();
    ctx.moveTo(x - 6 * scale, by + bubbleH);
    ctx.lineTo(x + 6 * scale, by + bubbleH);
    ctx.lineTo(x, by + bubbleH + 7 * scale);
    ctx.closePath();
    ctx.fill();

    // Reset shadow for text
    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;
    ctx.shadowOffsetY = 0;

    // Subtle border
    ctx.strokeStyle = 'rgba(0,0,0,0.06)';
    ctx.lineWidth = 1;
    ctx.stroke();

    ctx.fillStyle = '#1e293b';
    lines.forEach((line, index) => {
      ctx.fillText(line, x, by + padding + (index * lineHeight) - fontSize * 0.1);
    });
  }

  renderBeams(ctx: CanvasRenderingContext2D) {
    for (let i = this.transactionBeams.length - 1; i >= 0; i--) {
      const beam = this.transactionBeams[i];
      beam.lifetime--;
      beam.progress = 1 - (beam.lifetime / 140);

      const p1 = this.isoToScreen(beam.sourceX, beam.sourceY, 0.2);
      const p2 = this.isoToScreen(beam.targetX, beam.targetY, 0.2);

      ctx.strokeStyle = beam.color;
      ctx.lineWidth = 2.5 * this.camera.zoom;
      ctx.setLineDash([6, 4]);
      ctx.beginPath();
      ctx.moveTo(p1.x, p1.y - 16 * this.camera.zoom);
      ctx.lineTo(p2.x, p2.y - 16 * this.camera.zoom);
      ctx.stroke();
      ctx.setLineDash([]);

      const packetX = p1.x + (p2.x - p1.x) * beam.progress;
      const packetY = p1.y + (p2.y - p1.y) * beam.progress - 16 * this.camera.zoom;

      ctx.fillStyle = beam.color;
      ctx.beginPath();
      ctx.arc(packetX, packetY, 5 * this.camera.zoom, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1;
      ctx.stroke();

      ctx.font = `600 ${Math.max(9, Math.round(10 * this.camera.zoom))}px monospace`;
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

  renderFX(ctx: CanvasRenderingContext2D) {
    for (let i = this.floatingTexts.length - 1; i >= 0; i--) {
      const ft = this.floatingTexts[i];
      ft.y += ft.vy;
      ft.alpha -= 0.012;
      ft.lifetime--;

      ctx.font = `bold ${Math.max(10, Math.round(12 * this.camera.zoom))}px monospace`;
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

  renderPetals(ctx: CanvasRenderingContext2D) {
    this.petals.forEach(p => {
      p.x += p.vx;
      p.y += p.vy;
      p.angle += 0.02;

      if (p.x > this.canvas.width + 10) p.x = -10;
      if (p.y > this.canvas.height + 10) p.y = -10;

      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.angle);
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.ellipse(0, 0, p.size, p.size * 0.55, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    });
  }

  darkenColor(hex: string, percent: number): string {
    let num = parseInt(hex.replace('#', ''), 16);
    if (isNaN(num)) return hex;
    let r = (num >> 16) + percent;
    let b = ((num >> 8) & 0x00FF) + percent;
    let g = (num & 0x0000FF) + percent;

    return `#${(
      0x1000000 +
      (r < 255 ? (r < 0 ? 0 : r) : 255) * 0x10000 +
      (b < 255 ? (b < 0 ? 0 : b) : 255) * 0x100 +
      (g < 255 ? (g < 0 ? 0 : g) : 255)
    )
      .toString(16)
      .slice(1)}`;
  }
}
