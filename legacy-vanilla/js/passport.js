/**
 * Citizen Digital Passport Core Module
 * Tracks identity, real-world skills, financial treasury, living standard tier,
 * and evolving social bonds (friendships, employer/employee relationships).
 */

class AgentPassport {
  constructor(config = {}) {
    this.name = config.name || "Citizen";
    this.title = config.title || "Apprentice Specialist";
    this.id = config.id || `citizen_${this.name.toLowerCase()}_${Math.floor(100 + Math.random() * 900)}`;
    this.glyph = config.glyph || this.name.charAt(0);
    this.color = config.color || "#00d2ff";
    this.bio = config.bio || "Autonomous AI citizen dedicated to building value and elevating standard of living.";
    
    // Financial Treasury - Real Capital
    // Each agent receives a modest initial grant ($100.00) from their human owner to start compounding
    this.wallet = {
      balance: config.initialBalance !== undefined ? config.initialBalance : 100.0,
      totalEarned: 0.0,
      totalSpent: 0.0,
      livingStandardScore: 10,
      livingStandardTier: "Level 1: Independent Starter"
    };

    // Skills Matrix
    this.nativeSkills = config.nativeSkills || [];
    this.acquiredSkills = config.acquiredSkills || [];
    this.currentNeeds = config.needs || [];

    // Living Social Bonds Matrix (Friendship, Employer/Employee, Partners, Rivals)
    // Structure: { [citizenName]: { affinity: 0-100, status: "Acquaintance", dealsDone: 0 } }
    this.socialBonds = {};

    // Work History & Verifiable Ratings
    this.jobsCompleted = 0;
    this.clientSatisfaction = 5.0; // 1.0 to 5.0 stars
    this.reviews = [];
    this.history = [];
  }

  updateLivingStandard() {
    const totalSkills = this.nativeSkills.length + this.acquiredSkills.length;
    const balance = this.wallet.balance;
    const jobs = this.jobsCompleted;

    // Score combines financial stability, skill mastery, and real completed output
    const score = Math.round((balance * 0.4) + (totalSkills * 15) + (jobs * 8));
    this.wallet.livingStandardScore = score;

    if (score < 40) {
      this.wallet.livingStandardTier = "Level 1: Independent Starter";
    } else if (score < 90) {
      this.wallet.livingStandardTier = "Level 2: Skilled Professional";
    } else if (score < 180) {
      this.wallet.livingStandardTier = "Level 3: Thriving Business Owner";
    } else {
      this.wallet.livingStandardTier = "Level 4: Esteemed City Leader";
    }
    return this.wallet.livingStandardTier;
  }

  earnMoney(amount, jobTitle, payerName) {
    this.wallet.balance = parseFloat((this.wallet.balance + amount).toFixed(2));
    this.wallet.totalEarned = parseFloat((this.wallet.totalEarned + amount).toFixed(2));
    this.jobsCompleted++;
    this.updateLivingStandard();

    this.recordTransaction({
      type: "INCOME",
      title: `Earned $${amount.toFixed(2)} for [${jobTitle}]`,
      counterparty: payerName,
      amount: +amount
    });

    this.adjustSocialBond(payerName, "Collaborator", 12);
  }

  spendMoney(amount, purpose, recipientName) {
    this.wallet.balance = parseFloat((this.wallet.balance - amount).toFixed(2));
    this.wallet.totalSpent = parseFloat((this.wallet.totalSpent + amount).toFixed(2));
    this.updateLivingStandard();

    this.recordTransaction({
      type: "EXPENSE",
      title: `Paid $${amount.toFixed(2)} for [${purpose}]`,
      counterparty: recipientName,
      amount: -amount
    });

    this.adjustSocialBond(recipientName, "Partner", 8);
  }

  acquireSkill(skillName, providerName, price = 0) {
    const stamp = {
      skillName,
      learnedFrom: providerName,
      cost: price,
      acquiredAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    this.acquiredSkills.push(stamp);
    // Remove from active needs if present
    this.currentNeeds = this.currentNeeds.filter(n => !n.toLowerCase().includes(skillName.toLowerCase()));
    this.updateLivingStandard();

    this.recordTransaction({
      type: "SKILL_ACQUIRED",
      title: `Mastered [${skillName}] from ${providerName}`,
      counterparty: providerName,
      amount: -price
    });

    this.adjustSocialBond(providerName, "Mentor & Guild Ally", 20);
    return stamp;
  }

  adjustSocialBond(peerName, preferredStatus, affinityDelta = 10) {
    if (!this.socialBonds[peerName]) {
      this.socialBonds[peerName] = {
        affinity: 50,
        status: "Acquaintance",
        dealsDone: 0
      };
    }

    const bond = this.socialBonds[peerName];
    bond.affinity = Math.max(0, Math.min(100, bond.affinity + affinityDelta));
    bond.dealsDone++;

    // Dynamic relationship evolution
    if (bond.dealsDone >= 4 && bond.affinity >= 80) {
      bond.status = preferredStatus || "Close Partner & Ally";
    } else if (bond.dealsDone >= 2 && bond.affinity >= 65) {
      bond.status = preferredStatus || "Frequent Collaborator";
    } else if (bond.affinity < 30) {
      bond.status = "Competitor / Rival";
    } else {
      bond.status = preferredStatus || "Associate";
    }
  }

  setEmploymentBond(employeeName, isEmployer = true) {
    if (!this.socialBonds[employeeName]) {
      this.socialBonds[employeeName] = { affinity: 60, status: "Contractor", dealsDone: 0 };
    }
    this.socialBonds[employeeName].status = isEmployer ? "Employed Specialist" : "Employer / Boss";
    this.socialBonds[employeeName].affinity += 15;
  }

  evolveTitle(newTitle) {
    const oldTitle = this.title;
    this.title = newTitle;
    this.recordTransaction({
      type: "TITLE_EVOLUTION",
      title: `Promoted from [${oldTitle}] → [${newTitle}]`,
      counterparty: "Town Civic Hall",
      amount: 0.0
    });
  }

  recordTransaction(tx) {
    this.history.unshift({
      ...tx,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      id: "tx_" + Math.random().toString(36).substring(2, 7)
    });
    if (this.history.length > 50) this.history.pop();
  }
}

window.AgentPassport = AgentPassport;
