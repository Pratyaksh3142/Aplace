/**
 * AI Living City UI Controller
 * Manages City Metrics, Citizen Focus Card, Job Board Tab, Activity Ledger,
 * and Digital Passport Dialog.
 */

class SimulationUI {
  constructor(engine, simManager, marketplace) {
    this.engine = engine;
    this.simManager = simManager;
    this.marketplace = marketplace;

    this.selectedAgent = this.simManager.agents[0] || null;
    this.activeLogTab = "all";
    this.logs = [];

    // DOM Elements
    this.elTreasury = document.getElementById("metric-treasury");
    this.elTier = document.getElementById("metric-tier");
    this.elLeader = document.getElementById("metric-leader");
    this.elCitizens = document.getElementById("metric-citizens");
    this.elLogEntries = document.getElementById("log-entries");
    this.elPassportModal = document.getElementById("passport-modal");
    this.elJobModal = document.getElementById("job-modal");
    this.elMinimap = document.getElementById("minimap-canvas");

    this.initEventListeners();
    this.initMinimap();
    this.updateHUDMetrics();
    this.updateFocusCard();

    // Listen to economic and city events
    this.marketplace.onEvent((type, data) => {
      this.handleMarketplaceEvent(type, data);
    });

    // Start render loop
    this.loop();
  }

  initEventListeners() {
    // Speed buttons
    document.querySelectorAll(".speed-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        document.querySelectorAll(".speed-btn").forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
        const speed = parseFloat(btn.dataset.speed);
        if (speed === 0) {
          this.simManager.isPaused = true;
        } else {
          this.simManager.isPaused = false;
          this.simManager.timeScale = speed;
        }
      });
    });

    // Plaza Gathering Button
    const btnGather = document.getElementById("btn-gather-plaza");
    if (btnGather) {
      btnGather.addEventListener("click", () => {
        this.addLog("CIVIC", "All citizens summoned to the Central Plaza for town gathering.", "social");
        this.simManager.agents.forEach((agent, i) => {
          const angle = (i / this.simManager.agents.length) * Math.PI * 2;
          const gx = 13 + Math.cos(angle) * 3;
          const gy = 11 + Math.sin(angle) * 3;
          agent.moveTo(gx, gy);
        });
      });
    }

    // Collaborative Job Simulation
    const btnCollab = document.getElementById("btn-trigger-collab");
    if (btnCollab) {
      btnCollab.addEventListener("click", () => {
        const maya = this.simManager.getAgentByName("Maya");
        const liam = this.simManager.getAgentByName("Liam");
        if (maya && liam) {
          maya.moveTo(12, 10);
          liam.moveTo(14, 10);
          maya.interactionCooldown = 0;
          liam.interactionCooldown = 0;
        }
      });
    }

    // Mentorship Session
    const btnMentor = document.getElementById("btn-trigger-mentorship");
    if (btnMentor) {
      btnMentor.addEventListener("click", async () => {
        const devon = this.simManager.getAgentByName("Devon");
        const liam = this.simManager.getAgentByName("Liam");
        if (!devon || !liam) return;

        devon.moveTo(13, 10);
        liam.moveTo(14, 10);
        await this.delay(1200);

        devon.say("Liam, I want to learn UI Design to build full-stack tools. I'll pay $35.", 220);
        await this.delay(1500);
        liam.say("Deal, Devon! I'll mentor you on design heuristics and spatial balance.", 220);
        await this.delay(1500);

        this.marketplace.mentorshipTransfer(devon, liam, "Visual & UI Design", 35.0);
        this.engine.addTransactionBeam(devon, liam, "Mentorship: $35", devon.color);
        this.engine.addFloatingText(devon.x * 32, devon.y * 16, "+Skill: UI Design", "#f6d365");
        devon.say("Mastered Visual & UI Design! My capability passport is updated.", 240);

        this.updateFocusCard();
      });
    }

    // Inspect Focus Citizen Passport
    const btnInspect = document.getElementById("btn-inspect-focus");
    if (btnInspect) {
      btnInspect.addEventListener("click", () => {
        this.openPassportModal(this.selectedAgent);
      });
    }

    const btnClosePassport = document.getElementById("btn-close-passport");
    if (btnClosePassport) {
      btnClosePassport.addEventListener("click", () => {
        this.closePassportModal();
      });
    }

    // Post Custom Job Modal
    const btnOpenJobModal = document.getElementById("btn-open-job-modal");
    if (btnOpenJobModal) {
      btnOpenJobModal.addEventListener("click", () => {
        if (typeof this.elJobModal.showModal === 'function') {
          this.elJobModal.showModal();
        } else {
          this.elJobModal.classList.add("open");
        }
      });
    }

    const btnCloseJobModal = document.getElementById("btn-close-job-modal");
    if (btnCloseJobModal) {
      btnCloseJobModal.addEventListener("click", () => {
        if (typeof this.elJobModal.close === 'function') {
          this.elJobModal.close();
        } else {
          this.elJobModal.classList.remove("open");
        }
      });
    }

    const btnConfirmJob = document.getElementById("btn-confirm-post-job");
    if (btnConfirmJob) {
      btnConfirmJob.addEventListener("click", () => {
        const title = document.getElementById("input-job-title").value || "Custom Architectural Project";
        const bounty = parseFloat(document.getElementById("input-job-bounty").value) || 120.0;
        const cat = document.getElementById("input-job-cat").value || "General Contract";

        this.simManager.postCustomJob(title, bounty, cat);

        if (typeof this.elJobModal.close === 'function') {
          this.elJobModal.close();
        } else {
          this.elJobModal.classList.remove("open");
        }

        this.addLog("JOB", `New real-world job posted: [${title}] ($${bounty.toFixed(2)})!`, "jobs");
      });
    }

    // Canvas click to select citizen
    this.engine.canvas.addEventListener("click", (e) => {
      if (this.engine.isDragging) return;
      const rect = this.engine.canvas.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const clickY = e.clientY - rect.top;

      let found = null;
      for (const agent of this.simManager.agents) {
        const p = this.engine.isoToScreen(agent.x, agent.y, 0.1);
        const dist = Math.sqrt((clickX - p.x) ** 2 + (clickY - p.y) ** 2);
        if (dist < 26 * this.engine.camera.zoom) {
          found = agent;
          break;
        }
      }

      if (found) {
        this.selectedAgent = found;
        this.updateFocusCard();
      }
    });

    // Double-click to open passport
    this.engine.canvas.addEventListener("dblclick", () => {
      if (this.selectedAgent) {
        this.openPassportModal(this.selectedAgent);
      }
    });

    // Tabs
    document.querySelectorAll(".log-tab").forEach(tab => {
      tab.addEventListener("click", () => {
        document.querySelectorAll(".log-tab").forEach(t => t.classList.remove("active"));
        tab.classList.add("active");
        this.activeLogTab = tab.dataset.tab;
        this.renderTabContent();
      });
    });
  }

  handleMarketplaceEvent(type, data) {
    if (type === "JOB_CLAIMED") {
      this.addLog("CLAIM", `${data.agentName} claimed contract: [${data.jobTitle}] ($${data.bounty.toFixed(0)})`, "jobs");
    } else if (type === "SUBCONTRACT_HIRED") {
      this.addLog("EMPLOY", `${data.employer} hired ${data.employee} for $${data.wage.toFixed(0)} on [${data.jobTitle}]`, "social");
    } else if (type === "JOB_COMPLETED") {
      this.addLog("PAYOUT", `${data.agentName} delivered [${data.jobTitle}]. Earned $${data.payout.toFixed(0)} ($${data.civicTax.toFixed(0)} civic tax)`, "jobs");
    } else if (type === "SKILL_LEARNED") {
      this.addLog("SKILL", `${data.student} mastered [${data.skillName}] under mentorship of ${data.mentor}!`, "social");
    } else if (type === "CITY_EXPANDED") {
      this.addLog("EXPAND", `CITY EXPANSION: ${data.name} (Treasury surpassed milestone!)`, "social");
    } else if (type === "LEADER_ELECTED") {
      this.addLog("LEADER", `${data.leaderName} elected City Leader (Score: ${data.score})!`, "social");
    }

    this.updateHUDMetrics();
    this.updateFocusCard();
  }

  updateHUDMetrics() {
    if (this.elTreasury) this.elTreasury.textContent = `$${this.marketplace.townCivicTreasury.toFixed(2)}`;
    if (this.elTier) {
      const tiers = ["Tier 1: Settlement", "Tier 2: Artisan Quarter", "Tier 3: Innovation Agora"];
      this.elTier.textContent = tiers[this.marketplace.cityExpansionTier - 1] || "Tier 1: Settlement";
    }
    if (this.elLeader) {
      const leader = this.simManager.cityLeader;
      this.elLeader.textContent = leader ? `${leader.name}` : "None";
    }
    if (this.elCitizens) {
      this.elCitizens.textContent = this.simManager.agents.length;
    }
  }

  updateFocusCard() {
    if (!this.selectedAgent) return;
    const a = this.selectedAgent;
    const p = a.passport;

    const elName = document.getElementById("focus-name");
    const elGlyph = document.getElementById("focus-glyph");
    const elTitle = document.getElementById("focus-title");
    const elBadge = document.getElementById("focus-badge");
    const elBal = document.getElementById("focus-val-bal");
    const elJobs = document.getElementById("focus-val-jobs");
    const elScore = document.getElementById("focus-val-score");
    const elBonds = document.getElementById("focus-bonds-tags");

    if (elName) elName.textContent = a.name;
    if (elGlyph) elGlyph.textContent = a.glyph;
    if (elTitle) elTitle.textContent = p.title;
    if (elBadge) {
      const tierShort = p.wallet.livingStandardTier.split(":")[0];
      elBadge.textContent = tierShort.toUpperCase();
    }
    if (elBal) elBal.textContent = `$${p.wallet.balance.toFixed(2)}`;
    if (elJobs) elJobs.textContent = `${p.jobsCompleted} Jobs`;
    if (elScore) elScore.textContent = `${p.wallet.livingStandardScore} pts`;

    // Render social bonds preview
    if (elBonds) {
      elBonds.innerHTML = "";
      const bondKeys = Object.keys(p.socialBonds);
      if (bondKeys.length === 0) {
        elBonds.innerHTML = `<span style="font-size: 10px; color: var(--text-muted);">Independent citizen (No active bonds yet)</span>`;
      } else {
        bondKeys.slice(0, 3).forEach(name => {
          const b = p.socialBonds[name];
          const tag = document.createElement("span");
          tag.className = "need-tag";
          tag.textContent = `${name} (${b.status})`;
          elBonds.appendChild(tag);
        });
      }
    }
  }

  openPassportModal(agent) {
    if (!agent) return;
    this.selectedAgent = agent;
    const p = agent.passport;

    // Identity
    document.getElementById("pass-glyph").textContent = agent.glyph;
    document.getElementById("pass-name").textContent = p.name;
    document.getElementById("pass-role").textContent = p.title;
    document.getElementById("pass-did").textContent = p.id;
    document.getElementById("pass-tier").textContent = p.wallet.livingStandardTier;

    // Living standard score & meters
    document.getElementById("pass-score").textContent = p.wallet.livingStandardScore;
    document.getElementById("pass-bar-money-val").textContent = `$${p.wallet.balance.toFixed(2)}`;
    document.getElementById("pass-bar-money").style.width = `${Math.min(100, (p.wallet.balance / 200) * 100)}%`;

    const totalSkills = p.nativeSkills.length + p.acquiredSkills.length;
    document.getElementById("pass-bar-skills-val").textContent = `${totalSkills} Skill${totalSkills > 1 ? 's' : ''}`;
    document.getElementById("pass-bar-skills").style.width = `${Math.min(100, (totalSkills / 5) * 100)}%`;

    // Skills Matrix
    const stampsGrid = document.getElementById("pass-stamps-grid");
    stampsGrid.innerHTML = "";

    p.nativeSkills.forEach(s => {
      const el = document.createElement("div");
      el.className = "skill-stamp native";
      el.innerHTML = `
        <span class="stamp-badge native">INHERENT EXPERTISE</span>
        <div class="stamp-title">${s}</div>
        <div class="stamp-meta"><span>Mastery: Innate Core Skill</span><span>Status: Verified</span></div>
      `;
      stampsGrid.appendChild(el);
    });

    p.acquiredSkills.forEach(s => {
      const el = document.createElement("div");
      el.className = "skill-stamp acquired";
      el.innerHTML = `
        <span class="stamp-badge acquired">LEARNED SKILL</span>
        <div class="stamp-title">${s.skillName}</div>
        <div class="stamp-meta"><span>Mentor: ${s.learnedFrom} ($${s.cost})</span><span>At: ${s.acquiredAt}</span></div>
      `;
      stampsGrid.appendChild(el);
    });

    // Social Bonds Grid
    const bondsGrid = document.getElementById("pass-bonds-grid");
    bondsGrid.innerHTML = "";
    const bondNames = Object.keys(p.socialBonds);
    if (bondNames.length === 0) {
      bondsGrid.innerHTML = `<span style="font-size: 11px; color: var(--text-muted);">No formal partnerships formed yet. Roaming town to meet peers.</span>`;
    } else {
      bondNames.forEach(peerName => {
        const bond = p.socialBonds[peerName];
        const el = document.createElement("div");
        el.className = "log-item";
        el.style.borderLeftColor = bond.status.includes("Boss") ? "#ff70a6" : (bond.status.includes("Employee") ? "#38ef7d" : "#00d2ff");
        el.innerHTML = `
          <div class="log-meta-row">
            <span class="log-badge-tag">${peerName}</span>
            <span>Affinity: ${bond.affinity}% (${bond.dealsDone} Deals)</span>
          </div>
          <div class="log-desc">Relationship: <strong>${bond.status}</strong></div>
        `;
        bondsGrid.appendChild(el);
      });
    }

    // Treasury Ledger
    document.getElementById("pass-bal-val").textContent = `$${p.wallet.balance.toFixed(2)}`;
    document.getElementById("pass-earned-val").textContent = `+$${p.wallet.totalEarned.toFixed(2)}`;
    document.getElementById("pass-spent-val").textContent = `-$${p.wallet.totalSpent.toFixed(2)}`;

    if (typeof this.elPassportModal.showModal === 'function') {
      this.elPassportModal.showModal();
    } else {
      this.elPassportModal.classList.add("open");
    }
  }

  closePassportModal() {
    if (this.elPassportModal) {
      if (typeof this.elPassportModal.close === 'function') {
        this.elPassportModal.close();
      } else {
        this.elPassportModal.classList.remove("open");
      }
    }
  }

  addLog(tag, message, category = "social") {
    if (!this.elLogEntries) return;
    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    const logItem = { tag, message, category, time };
    this.logs.unshift(logItem);
    if (this.logs.length > 80) this.logs.pop();

    if (this.activeLogTab === "all" || this.activeLogTab === category) {
      this.renderLogItem(logItem, true);
    }
  }

  renderLogItem(item, prepend = false) {
    const el = document.createElement("div");
    el.className = `log-item ${item.category}`;
    el.innerHTML = `
      <div class="log-meta-row">
        <span class="log-badge-tag">${item.tag}</span>
        <span>${item.time}</span>
      </div>
      <div class="log-desc">${item.message}</div>
    `;

    if (prepend && this.elLogEntries.firstChild) {
      this.elLogEntries.insertBefore(el, this.elLogEntries.firstChild);
    } else {
      this.elLogEntries.appendChild(el);
    }
  }

  renderTabContent() {
    if (!this.elLogEntries) return;
    this.elLogEntries.innerHTML = "";

    if (this.activeLogTab === "jobs") {
      // Render active Town Job Board
      this.marketplace.activeJobs.forEach(job => {
        const el = document.createElement("div");
        el.className = "log-item jobs";
        el.style.borderLeftColor = job.status === "OPEN" ? "#38ef7d" : "#f6d365";
        el.innerHTML = `
          <div class="log-meta-row">
            <span class="log-badge-tag">$${job.bounty.toFixed(0)} Bounty</span>
            <span>Status: ${job.status}</span>
          </div>
          <div class="log-desc"><strong>${job.title}</strong></div>
          <div style="font-size: 10px; color: var(--text-muted); margin-top: 2px;">Requires: ${job.requiredSkills.join(' + ')}</div>
        `;
        this.elLogEntries.appendChild(el);
      });
    } else {
      this.logs.filter(l => this.activeLogTab === "all" || l.category === this.activeLogTab)
                .forEach(l => this.renderLogItem(l, false));
    }
  }

  initMinimap() {
    if (!this.elMinimap) return;
    this.minimapCtx = this.elMinimap.getContext('2d');
    this.elMinimap.width = 340;
    this.elMinimap.height = 75;
  }

  renderMinimap() {
    if (!this.minimapCtx) return;
    const ctx = this.minimapCtx;
    ctx.clearRect(0, 0, this.elMinimap.width, this.elMinimap.height);

    ctx.fillStyle = '#e8f5e9';
    ctx.fillRect(0, 0, this.elMinimap.width, this.elMinimap.height);

    const pad = 10;
    const mapW = this.elMinimap.width - pad * 2;
    const mapH = this.elMinimap.height - pad * 2;

    this.simManager.agents.forEach(agent => {
      const mx = pad + (agent.x / this.engine.gridWidth) * mapW;
      const my = pad + (agent.y / this.engine.gridHeight) * mapH;

      ctx.fillStyle = agent.color || '#00d2ff';
      ctx.beginPath();
      ctx.arc(mx, my, 4, 0, Math.PI * 2);
      ctx.fill();

      if (agent === this.selectedAgent) {
        ctx.strokeStyle = '#18181A';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(mx, my, 7, 0, Math.PI * 2);
        ctx.stroke();
      }
    });
  }

  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms / this.simManager.timeScale));
  }

  loop() {
    this.simManager.update();
    this.engine.render(this.simManager.agents);
    this.renderMinimap();

    requestAnimationFrame(() => this.loop());
  }
}

window.SimulationUI = SimulationUI;
