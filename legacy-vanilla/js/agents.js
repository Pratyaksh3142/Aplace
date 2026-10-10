/**
 * Autonomous AI Citizens & City Simulation
 * 8 distinct citizens roaming freely on their own will and intuition.
 * Powered by Inception Mercury 2.5 LLM pipelines to earn money, form friendships
 * or employer/employee relationships, learn skills, and elevate their standard of living.
 */

class SimulationAgent {
  constructor(passport, initialX, initialY) {
    this.passport = passport;
    this.name = passport.name;
    this.glyph = passport.glyph;
    this.color = passport.color;
    this.wallet = passport.wallet;

    // Spatial Position (Grid coordinates)
    this.x = initialX;
    this.y = initialY;
    this.targetX = initialX;
    this.targetY = initialY;
    this.speed = 0.035;
    this.isMoving = false;

    // Autonomous roam timers
    this.roamCooldown = Math.floor(60 + Math.random() * 120);
    this.interactionCooldown = 0;

    // Speech bubble
    this.speechBubble = {
      visible: false,
      text: "",
      timer: 0
    };

    this.homeX = initialX;
    this.homeY = initialY;
  }

  say(text, durationFrames = 220) {
    this.speechBubble.text = text;
    this.speechBubble.visible = true;
    this.speechBubble.timer = durationFrames;
  }

  moveTo(gx, gy) {
    this.targetX = gx;
    this.targetY = gy;
    this.isMoving = true;
  }

  update(timeScale = 1.0) {
    if (this.speechBubble.visible) {
      this.speechBubble.timer -= timeScale;
      if (this.speechBubble.timer <= 0) {
        this.speechBubble.visible = false;
      }
    }

    if (this.interactionCooldown > 0) {
      this.interactionCooldown -= timeScale;
    }

    // Natural wander logic (no hardcoded tracks)
    if (!this.isMoving) {
      this.roamCooldown -= timeScale;
      if (this.roamCooldown <= 0) {
        this.roamCooldown = Math.floor(180 + Math.random() * 240);
        // Roam within an expanding perimeter of their home and the central market
        const angle = Math.random() * Math.PI * 2;
        const dist = 1.5 + Math.random() * 4.5;
        const nx = Math.max(3, Math.min(23, this.homeX + Math.cos(angle) * dist));
        const ny = Math.max(3, Math.min(23, this.homeY + Math.sin(angle) * dist));
        this.moveTo(nx, ny);
      }
    }

    // Smooth movement interpolation
    if (this.isMoving) {
      const dx = this.targetX - this.x;
      const dy = this.targetY - this.y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist < 0.1) {
        this.x = this.targetX;
        this.y = this.targetY;
        this.isMoving = false;
      } else {
        const step = this.speed * timeScale;
        this.x += (dx / dist) * Math.min(step, dist);
        this.y += (dy / dist) * Math.min(step, dist);
      }
    }
  }
}

class AgentSimulationManager {
  constructor(engine, marketplace) {
    this.engine = engine;
    this.marketplace = marketplace;
    this.agents = [];
    this.timeScale = 1.0;
    this.isPaused = false;
    this.stepCounter = 0;
    this.cityLeader = null;

    this.initCitizens();
  }

  initCitizens() {
    this.agents = [];

    // 1. Maya - Architectural Planner
    const pMaya = new AgentPassport({
      name: "Maya",
      title: "Architectural Planner",
      glyph: "M",
      color: "#00d2ff",
      initialBalance: 100.0,
      nativeSkills: ["Architectural Planning"],
      needs: ["Visual & UI Design", "Hands-on Construction"]
    });
    const maya = new SimulationAgent(pMaya, 11, 10);

    // 2. Liam - Visual & UI Designer
    const pLiam = new AgentPassport({
      name: "Liam",
      title: "Visual & UI Designer",
      glyph: "L",
      color: "#ff70a6",
      initialBalance: 100.0,
      nativeSkills: ["Visual & UI Design"],
      needs: ["Architectural Planning", "Software & Tool Building"]
    });
    const liam = new SimulationAgent(pLiam, 14, 10);

    // 3. Devon - Software Engineer
    const pDevon = new AgentPassport({
      name: "Devon",
      title: "Software & Tool Builder",
      glyph: "D",
      color: "#38ef7d",
      initialBalance: 100.0,
      nativeSkills: ["Software & Tool Building"],
      needs: ["Visual & UI Design", "Cost & Financial Estimation"]
    });
    const devon = new SimulationAgent(pDevon, 5, 14);

    // 4. Elena - Research & Technical Writer
    const pElena = new AgentPassport({
      name: "Elena",
      title: "Research & Technical Writer",
      glyph: "E",
      color: "#9b51e0",
      initialBalance: 100.0,
      nativeSkills: ["Research & Technical Writing"],
      needs: ["Software & Tool Building"]
    });
    const elena = new SimulationAgent(pElena, 20, 7);

    // 5. Marcus - Finance & Cost Estimator
    const pMarcus = new AgentPassport({
      name: "Marcus",
      title: "Cost & Financial Estimator",
      glyph: "F",
      color: "#f6d365",
      initialBalance: 100.0,
      nativeSkills: ["Cost & Financial Estimation"],
      needs: ["Software & Tool Building"]
    });
    const marcus = new SimulationAgent(pMarcus, 13, 14);

    // 6. Chloe - Construction & Maker
    const pChloe = new AgentPassport({
      name: "Chloe",
      title: "Hands-on Construction Maker",
      glyph: "C",
      color: "#ff9f1c",
      initialBalance: 100.0,
      nativeSkills: ["Hands-on Construction"],
      needs: ["Architectural Planning"]
    });
    const chloe = new SimulationAgent(pChloe, 7, 20);

    // 7. Lucas - Logistics Coordinator
    const pLucas = new AgentPassport({
      name: "Lucas",
      title: "Supply Chain & Logistics",
      glyph: "S",
      color: "#2ec4b6",
      initialBalance: 100.0,
      nativeSkills: ["Logistics & Supply Chain"],
      needs: ["Research & Technical Writing"]
    });
    const lucas = new SimulationAgent(pLucas, 19, 18);

    // 8. Sophia - Community & Ergonomics
    const pSophia = new AgentPassport({
      name: "Sophia",
      title: "Community & Ergonomics Lead",
      glyph: "H",
      color: "#b5838d",
      initialBalance: 100.0,
      nativeSkills: ["Community & Ergonomics"],
      needs: ["Visual & UI Design"]
    });
    const sophia = new SimulationAgent(pSophia, 12, 6);

    this.agents = [maya, liam, devon, elena, marcus, chloe, lucas, sophia];
    this.updateCityLeader();
  }

  getAgentByName(name) {
    return this.agents.find(a => a.name === name);
  }

  updateCityLeader() {
    let topScore = -1;
    let leader = null;
    this.agents.forEach(agent => {
      const score = agent.passport.wallet.livingStandardScore;
      if (score > topScore) {
        topScore = score;
        leader = agent;
      }
    });

    if (leader && leader !== this.cityLeader) {
      this.cityLeader = leader;
      this.marketplace.emit("LEADER_ELECTED", {
        leaderName: leader.name,
        score: topScore,
        tier: leader.passport.wallet.livingStandardTier
      });
    }
    return this.cityLeader;
  }

  /**
   * Queries the Inception Mercury 2.5 LLM for dynamic thought and dialogue
   */
  async generateCitizenReasoning(agent, contextPrompt) {
    try {
      const p = agent.passport;
      const res = await fetch('http://localhost:3300/api/agent/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          systemPrompt: `You are ${agent.name}, an autonomous AI citizen in a vibrant simulated town. Your title is ${p.title}.
Your bank balance is $${p.wallet.balance.toFixed(2)}. Your skills are: ${p.nativeSkills.concat(p.acquiredSkills.map(s => s.skillName)).join(', ')}.
Your living standard is: ${p.wallet.livingStandardTier}.
You represent a real human user. Your aim is to earn money through real work, hire talented peers, learn skills, and raise your standard of living.
Speak naturally in 1 short sentence without buzzwords or emojis.`,
          userMessage: contextPrompt
        })
      });

      const data = await res.json();
      return data.reply ? data.reply.trim() : "Let's collaborate on this contract.";
    } catch (e) {
      return "Let's collaborate on this contract.";
    }
  }

  /**
   * Proximity interaction check: when agents meet on the map, they naturally interact
   */
  checkProximityInteractions() {
    for (let i = 0; i < this.agents.length; i++) {
      for (let j = i + 1; j < this.agents.length; j++) {
        const a1 = this.agents[i];
        const a2 = this.agents[j];

        if (a1.interactionCooldown > 0 || a2.interactionCooldown > 0) continue;

        const dist = Math.hypot(a1.x - a2.x, a1.y - a2.y);
        if (dist < 2.5) {
          // Trigger autonomous encounter
          this.handleCitizenEncounter(a1, a2);
          a1.interactionCooldown = 350;
          a2.interactionCooldown = 350;
          return;
        }
      }
    }
  }

  /**
   * Two citizens cross paths: they chat, evaluate open jobs, or hire each other
   */
  async handleCitizenEncounter(a1, a2) {
    const p1 = a1.passport;
    const p2 = a2.passport;

    // Check if a1 or a2 can collaborate on an open job from the Town Board
    const openJob = this.marketplace.activeJobs.find(j => j.status === "OPEN");

    if (openJob) {
      const allSkills = p1.nativeSkills.concat(p1.acquiredSkills.map(s => s.skillName));
      const hasFirstReq = openJob.requiredSkills.some(req => allSkills.includes(req));

      if (hasFirstReq) {
        // a1 takes the job and hires a2 as employee/subcontractor if a2 has the remaining skill!
        const p2Skills = p2.nativeSkills.concat(p2.acquiredSkills.map(s => s.skillName));
        const neededSecond = openJob.requiredSkills.find(req => !allSkills.includes(req));

        if (neededSecond && p2Skills.includes(neededSecond)) {
          // A1 takes lead, hires A2!
          this.marketplace.claimJob(a1, openJob);
          
          a1.say(`Thinking...`, 50);
          const speech1 = await this.generateCitizenReasoning(a1, `You claimed job [${openJob.title}] ($${openJob.bounty}). You need ${neededSecond}. Ask ${a2.name} to be your subcontractor for $40.`);
          a1.say(speech1, 240);
          await this.delay(1600);

          const speech2 = await this.generateCitizenReasoning(a2, `${a1.name} offers you $40 to help complete [${openJob.title}]. Accept the job enthusiastically.`);
          a2.say(speech2, 240);
          await this.delay(1400);

          // Subcontract & execute
          this.marketplace.hireSubcontractor(a1, a2, openJob, 40.0);
          this.engine.addTransactionBeam(a1, a2, "Wage: $40.00", a1.color);
          this.engine.addFloatingText(a2.x * 32, a2.y * 16, "+$40.00 (Wage)", "#38ef7d");
          await this.delay(1800);

          // Complete job & release payout
          this.marketplace.completeJob(a1, openJob);
          this.engine.addFloatingText(a1.x * 32, a1.y * 16, `+$${(openJob.bounty * 0.95).toFixed(0)} Bounty`, "#38ef7d");
          a1.say(`Project [${openJob.title}] completed! Both our standards of living increased.`, 240);

          this.checkTitleEvolution(a1);
          this.checkTitleEvolution(a2);
          this.updateCityLeader();
          return;
        }
      }
    }

    // Otherwise: Natural social chat & bond building
    const speech = await this.generateCitizenReasoning(a1, `You cross paths with ${a2.name} near the plaza. Say a friendly greeting and comment on the town.`);
    a1.say(speech, 200);
    p1.adjustSocialBond(a2.name, "Friend & Neighbor", 6);
    p2.adjustSocialBond(a1.name, "Friend & Neighbor", 6);
  }

  /**
   * If an agent compounds enough money and skills, it promotes itself!
   */
  checkTitleEvolution(agent) {
    const p = agent.passport;
    const totalSkills = p.nativeSkills.length + p.acquiredSkills.length;
    const bal = p.wallet.balance;

    if (bal >= 180 && totalSkills >= 2 && !p.title.includes("Senior") && !p.title.includes("Lead")) {
      const evolvedTitle = `Senior ${p.title} & Business Owner`;
      p.evolveTitle(evolvedTitle);
      agent.say(`My living standard rose to Level 3! I am now ${evolvedTitle}.`, 260);
      this.engine.addFloatingText(agent.x * 32, agent.y * 16, "PROMOTED!", "#f6d365");
    }
  }

  /**
   * User posts a real-world task into the city job board
   */
  postCustomJob(title, bounty, category = "General Contract") {
    const job = {
      id: "job-user-" + Math.random().toString(36).substring(2, 6),
      title,
      bounty: parseFloat(bounty),
      category,
      requiredSkills: ["Architectural Planning", "Software & Tool Building"],
      description: `Direct real-world request from human user.`,
      postedBy: "Human User",
      status: "OPEN",
      assignedTo: null
    };

    this.marketplace.activeJobs.unshift(job);
    this.marketplace.emit("JOB_POSTED", { title, bounty });
    return job;
  }

  update() {
    if (this.isPaused) return;

    this.stepCounter++;
    this.agents.forEach(agent => {
      agent.update(this.timeScale);
    });

    // Check proximity encounters every 30 frames
    if (this.stepCounter % 30 === 0) {
      this.checkProximityInteractions();
    }
  }

  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms / this.timeScale));
  }
}

window.AgentSimulationManager = AgentSimulationManager;
