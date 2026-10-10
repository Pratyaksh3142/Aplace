/**
 * AI City Economy & Job Board Protocol
 * Coordinates town job postings (external client bounties),
 * peer-to-peer hiring (boss/employee agreements), skill mentorship,
 * and municipal city expansion funding.
 */

class AgentMarketplace {
  constructor() {
    this.totalCityVolume = 0.0;
    this.townCivicTreasury = 50.0; // Seed municipal treasury for city expansion
    this.cityExpansionTier = 1; // Expands as city wealth grows
    this.listeners = [];

    // Real-world job contracts posted by external clients and businesses
    this.activeJobs = [
      {
        id: "job-clinic",
        title: "Design Eco-Friendly Urban Clinic",
        category: "Architecture & Design",
        bounty: 140.0,
        requiredSkills: ["Architectural Planning", "Visual & UI Design"],
        description: "Develop sustainable structural blueprints with patient-friendly visual schematics.",
        postedBy: "City Health Department",
        status: "OPEN",
        assignedTo: null
      },
      {
        id: "job-inventory",
        title: "Automate Workshop Inventory System",
        category: "Software & Logistics",
        bounty: 110.0,
        requiredSkills: ["Software & Tool Building", "Cost & Financial Estimation"],
        description: "Code an automated stock ledger tool to optimize equipment tracking.",
        postedBy: "Merchants Cooperative",
        status: "OPEN",
        assignedTo: null
      },
      {
        id: "job-climate",
        title: "Renewable Energy Feasibility Dossier",
        category: "Research & Analysis",
        bounty: 95.0,
        requiredSkills: ["Research & Technical Writing"],
        description: "Synthesize solar and hydroelectric viability for the eastern river valley.",
        postedBy: "Regional Energy Board",
        status: "OPEN",
        assignedTo: null
      },
      {
        id: "job-housing",
        title: "Construct Modular Artisan Studios",
        category: "Construction & Planning",
        bounty: 135.0,
        requiredSkills: ["Hands-on Construction", "Architectural Planning"],
        description: "Build three timber-framed studios near the cherry blossom groves.",
        postedBy: "Artisan Guild",
        status: "OPEN",
        assignedTo: null
      },
      {
        id: "job-audit",
        title: "Quarterly Commerce Flow & Tax Audit",
        category: "Finance & Software",
        bounty: 85.0,
        requiredSkills: ["Cost & Financial Estimation", "Software & Tool Building"],
        description: "Reconcile town trade volumes and audit ledger compliance.",
        postedBy: "City Council",
        status: "OPEN",
        assignedTo: null
      }
    ];

    // Peer-to-peer skill training catalog
    this.skillOfferings = [
      { name: "Visual & UI Design", price: 35.0, mentorName: "Liam" },
      { name: "Software & Tool Building", price: 40.0, mentorName: "Devon" },
      { name: "Architectural Planning", price: 45.0, mentorName: "Maya" },
      { name: "Research & Technical Writing", price: 30.0, mentorName: "Elena" },
      { name: "Cost & Financial Estimation", price: 30.0, mentorName: "Marcus" },
      { name: "Hands-on Construction", price: 35.0, mentorName: "Chloe" }
    ];
  }

  onEvent(callback) {
    this.listeners.push(callback);
  }

  emit(type, data) {
    this.listeners.forEach(cb => cb(type, data));
  }

  /**
   * Primary agent accepts a job from the job board.
   * If they lack a secondary skill, they subcontract another agent as an employee!
   */
  claimJob(agent, job) {
    if (job.status !== "OPEN") return false;
    job.status = "IN_PROGRESS";
    job.assignedTo = agent.name;
    this.emit("JOB_CLAIMED", { agentName: agent.name, jobTitle: job.title, bounty: job.bounty });
    return true;
  }

  /**
   * Primary contractor pays subcontractor/employee to complete part of a job
   */
  hireSubcontractor(leadAgent, subAgent, job, wage) {
    if (leadAgent.passport.wallet.balance < wage) {
      throw new Error(`${leadAgent.name} has insufficient funds to pay subcontractor ${subAgent.name}`);
    }

    // Lead pays wage to subAgent
    leadAgent.passport.spendMoney(wage, `Subcontract work on [${job.title}]`, subAgent.name);
    subAgent.passport.earnMoney(wage, `Subcontracted for [${job.title}]`, leadAgent.name);

    // Form employer/employee bond
    leadAgent.passport.setEmploymentBond(subAgent.name, true);  // lead is Employer
    subAgent.passport.setEmploymentBond(leadAgent.name, false); // sub is Employee

    this.emit("SUBCONTRACT_HIRED", {
      employer: leadAgent.name,
      employee: subAgent.name,
      wage,
      jobTitle: job.title
    });
  }

  /**
   * Completes a job from the board: releases bounty, pays civic tax, updates city tier
   */
  completeJob(leadAgent, job) {
    const netBounty = job.bounty * 0.95; // 5% civic tax for town expansion
    const civicTax = job.bounty * 0.05;

    this.townCivicTreasury += civicTax;
    this.totalCityVolume += job.bounty;
    job.status = "COMPLETED";

    leadAgent.passport.earnMoney(netBounty, job.title, job.postedBy);

    // Check city expansion milestones
    if (this.townCivicTreasury >= 120.0 && this.cityExpansionTier === 1) {
      this.cityExpansionTier = 2;
      this.emit("CITY_EXPANDED", { tier: 2, name: "Artisan & Tech Quarter Unlocked!" });
    } else if (this.townCivicTreasury >= 220.0 && this.cityExpansionTier === 2) {
      this.cityExpansionTier = 3;
      this.emit("CITY_EXPANDED", { tier: 3, name: "Grand Guild Agora & Innovation District!" });
    }

    this.emit("JOB_COMPLETED", {
      agentName: leadAgent.name,
      jobTitle: job.title,
      payout: netBounty,
      civicTax
    });

    // Refresh a new job into the board
    this.generateNewJob();
  }

  /**
   * Agent pays a mentor to learn a skill directly
   */
  mentorshipTransfer(learnerAgent, mentorAgent, skillName, cost) {
    if (learnerAgent.passport.wallet.balance < cost) {
      throw new Error(`Insufficient funds: ${learnerAgent.name} needs $${cost} to learn ${skillName}`);
    }

    learnerAgent.passport.spendMoney(cost, `Mentorship for ${skillName}`, mentorAgent.name);
    mentorAgent.passport.earnMoney(cost, `Mentorship provided for ${skillName}`, learnerAgent.name);

    const stamp = learnerAgent.passport.acquireSkill(skillName, mentorAgent.name, cost);

    this.emit("SKILL_LEARNED", {
      student: learnerAgent.name,
      mentor: mentorAgent.name,
      skillName,
      cost
    });

    return stamp;
  }

  generateNewJob() {
    const templates = [
      { title: "Design Waterfront Promenade", cat: "Architecture & Design", bounty: 125, skills: ["Architectural Planning"] },
      { title: "Optimize Town Logistics Database", cat: "Software & Logistics", bounty: 105, skills: ["Software & Tool Building"] },
      { title: "Regional Trade Strategy Brief", cat: "Research & Analysis", bounty: 90, skills: ["Research & Technical Writing"] },
      { title: "Build Civic Waterwheel Mill", cat: "Construction & Planning", bounty: 145, skills: ["Hands-on Construction", "Architectural Planning"] },
      { title: "Develop Citizen Health Telemetry App", cat: "Software & Design", bounty: 130, skills: ["Software & Tool Building", "Visual & UI Design"] }
    ];

    const pick = templates[Math.floor(Math.random() * templates.length)];
    const newJob = {
      id: "job-" + Math.random().toString(36).substring(2, 7),
      title: pick.title,
      category: pick.cat,
      bounty: pick.bounty,
      requiredSkills: pick.skills,
      description: `Civic contract requiring verified expertise.`,
      postedBy: "Town Commerce Guild",
      status: "OPEN",
      assignedTo: null
    };

    this.activeJobs.push(newJob);
    if (this.activeJobs.length > 8) this.activeJobs.shift();
  }
}

window.AgentMarketplace = AgentMarketplace;
