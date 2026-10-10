'use client';

import React, { useRef, useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { CitizenData, JobContract, ActivityLog, CityMetrics } from '@/types';
import { VoxelWorldEngine } from '@/lib/engine';
import { HudHeader } from '@/components/HudHeader';
import { CommandConsole } from '@/components/CommandConsole';
import { CityControls } from '@/components/CityControls';
import { PassportModal } from '@/components/PassportModal';
import { JobModal } from '@/components/JobModal';
import { CityAssistantChat } from '@/components/CityAssistantChat';

const INITIAL_CITIZENS: CitizenData[] = [
  {
    id: "citizen_maya_884",
    name: "Maya",
    title: "Architectural Planner",
    glyph: "M",
    color: "#00d2ff",
    wallet: {
      balance: 100.0,
      totalEarned: 0.0,
      totalSpent: 0.0,
      livingStandardScore: 50,
      livingStandardTier: "Level 1: Independent Starter"
    },
    nativeSkills: ["Architectural Planning"],
    acquiredSkills: [],
    currentNeeds: ["Visual & UI Design", "Hands-on Construction"],
    socialBonds: {},
    jobsCompleted: 0,
    clientSatisfaction: 5.0,
    x: 10,
    y: 8,
    targetX: 10,
    targetY: 8,
    isMoving: false
  },
  {
    id: "citizen_liam_312",
    name: "Liam",
    title: "Visual & UI/UX Designer",
    glyph: "L",
    color: "#ff416c",
    wallet: {
      balance: 100.0,
      totalEarned: 0.0,
      totalSpent: 0.0,
      livingStandardScore: 50,
      livingStandardTier: "Level 1: Independent Starter"
    },
    nativeSkills: ["Visual & UI Design"],
    acquiredSkills: [],
    currentNeeds: ["Architectural Planning"],
    socialBonds: {},
    jobsCompleted: 0,
    clientSatisfaction: 5.0,
    x: 15,
    y: 9,
    targetX: 15,
    targetY: 9,
    isMoving: false
  },
  {
    id: "citizen_devon_994",
    name: "Devon",
    title: "Software & Tool Builder",
    glyph: "D",
    color: "#38ef7d",
    wallet: {
      balance: 100.0,
      totalEarned: 0.0,
      totalSpent: 0.0,
      livingStandardScore: 50,
      livingStandardTier: "Level 1: Independent Starter"
    },
    nativeSkills: ["Software & Tool Building"],
    acquiredSkills: [],
    currentNeeds: ["Visual & UI Design", "Cost & Financial Estimation"],
    socialBonds: {},
    jobsCompleted: 0,
    clientSatisfaction: 5.0,
    x: 5,
    y: 14,
    targetX: 5,
    targetY: 14,
    isMoving: false
  },
  {
    id: "citizen_elena_512",
    name: "Elena",
    title: "Research & Technical Writer",
    glyph: "E",
    color: "#9b51e0",
    wallet: {
      balance: 100.0,
      totalEarned: 0.0,
      totalSpent: 0.0,
      livingStandardScore: 50,
      livingStandardTier: "Level 1: Independent Starter"
    },
    nativeSkills: ["Research & Technical Writing"],
    acquiredSkills: [],
    currentNeeds: ["Software & Tool Building"],
    socialBonds: {},
    jobsCompleted: 0,
    clientSatisfaction: 5.0,
    x: 20,
    y: 7,
    targetX: 20,
    targetY: 7,
    isMoving: false
  },
  {
    id: "citizen_marcus_744",
    name: "Marcus",
    title: "Cost & Financial Estimator",
    glyph: "F",
    color: "#f6d365",
    wallet: {
      balance: 100.0,
      totalEarned: 0.0,
      totalSpent: 0.0,
      livingStandardScore: 50,
      livingStandardTier: "Level 1: Independent Starter"
    },
    nativeSkills: ["Cost & Financial Estimation"],
    acquiredSkills: [],
    currentNeeds: ["Software & Tool Building"],
    socialBonds: {},
    jobsCompleted: 0,
    clientSatisfaction: 5.0,
    x: 13,
    y: 14,
    targetX: 13,
    targetY: 14,
    isMoving: false
  },
  {
    id: "citizen_chloe_603",
    name: "Chloe",
    title: "Hands-on Builder & Engineer",
    glyph: "C",
    color: "#ff9f43",
    wallet: {
      balance: 100.0,
      totalEarned: 0.0,
      totalSpent: 0.0,
      livingStandardScore: 50,
      livingStandardTier: "Level 1: Independent Starter"
    },
    nativeSkills: ["Hands-on Construction"],
    acquiredSkills: [],
    currentNeeds: ["Architectural Planning"],
    socialBonds: {},
    jobsCompleted: 0,
    clientSatisfaction: 5.0,
    x: 10,
    y: 16,
    targetX: 10,
    targetY: 16,
    isMoving: false
  },
  {
    id: "citizen_lucas_710",
    name: "Lucas",
    title: "Logistics & Supply Specialist",
    glyph: "S",
    color: "#0abde3",
    wallet: {
      balance: 100.0,
      totalEarned: 0.0,
      totalSpent: 0.0,
      livingStandardScore: 50,
      livingStandardTier: "Level 1: Independent Starter"
    },
    nativeSkills: ["Logistics & Supply Chain"],
    acquiredSkills: [],
    currentNeeds: ["Cost & Financial Estimation"],
    socialBonds: {},
    jobsCompleted: 0,
    clientSatisfaction: 5.0,
    x: 17,
    y: 14,
    targetX: 17,
    targetY: 14,
    isMoving: false
  },
  {
    id: "citizen_sophia_204",
    name: "Sophia",
    title: "Community & Ergonomics Lead",
    glyph: "H",
    color: "#b5838d",
    wallet: {
      balance: 100.0,
      totalEarned: 0.0,
      totalSpent: 0.0,
      livingStandardScore: 50,
      livingStandardTier: "Level 1: Independent Starter"
    },
    nativeSkills: ["Community & Ergonomics"],
    acquiredSkills: [],
    currentNeeds: ["Visual & UI Design"],
    socialBonds: {},
    jobsCompleted: 0,
    clientSatisfaction: 5.0,
    x: 12,
    y: 6,
    targetX: 12,
    targetY: 6,
    isMoving: false
  }
];

const JOB_CATALOG: Omit<JobContract, 'id' | 'status' | 'assignedTo'>[] = [
  {
    title: "Design Eco-Friendly Urban Clinic",
    category: "Architecture & Design",
    bounty: 140.0,
    requiredSkills: ["Architectural Planning", "Visual & UI Design"],
    description: "Develop sustainable structural blueprints with patient-friendly visual schematics.",
    postedBy: "City Health Department"
  },
  {
    title: "Automate Workshop Inventory System",
    category: "Software & Logistics",
    bounty: 110.0,
    requiredSkills: ["Software & Tool Building", "Cost & Financial Estimation"],
    description: "Code an automated stock ledger tool to optimize equipment tracking.",
    postedBy: "Merchants Cooperative"
  },
  {
    title: "Renewable Energy Feasibility Dossier",
    category: "Research & Analysis",
    bounty: 95.0,
    requiredSkills: ["Research & Technical Writing"],
    description: "Synthesize solar and hydroelectric viability for the eastern river valley.",
    postedBy: "Regional Energy Board"
  },
  {
    title: "Construct Modular Artisan Studios",
    category: "Construction & Planning",
    bounty: 135.0,
    requiredSkills: ["Hands-on Construction", "Architectural Planning"],
    description: "Build three timber-framed studios near the cherry blossom groves.",
    postedBy: "Artisan Guild"
  },
  {
    title: "Inter-District Cold Chain Route",
    category: "Logistics & Supply Chain",
    bounty: 125.0,
    requiredSkills: ["Logistics & Supply Chain", "Cost & Financial Estimation"],
    description: "Optimize delivery timings and refrigeration costs between city quarters.",
    postedBy: "Urban Transit Authority"
  },
  {
    title: "Civic Health & Ergonomics Audit",
    category: "Community & Ergonomics",
    bounty: 105.0,
    requiredSkills: ["Community & Ergonomics", "Research & Technical Writing"],
    description: "Perform spatial accessibility and comfort evaluation across all public plazas.",
    postedBy: "Citizen Wellbeing Council"
  },
  {
    title: "Pedestrian Suspension Bridge Framework",
    category: "Architecture & Construction",
    bounty: 160.0,
    requiredSkills: ["Architectural Planning", "Hands-on Construction"],
    description: "Plan and erect a timber suspension span connecting the east and west riverbanks.",
    postedBy: "Public Works Bureau"
  },
  {
    title: "Civic Endowment Investment Audit",
    category: "Finance & Strategy",
    bounty: 120.0,
    requiredSkills: ["Cost & Financial Estimation", "Research & Technical Writing"],
    description: "Analyze municipal reserves and recommend sustainable yield allocations.",
    postedBy: "Treasury Committee"
  }
];

export default function VisualSimulationPage() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const engineRef = useRef<VoxelWorldEngine | null>(null);

  const [citizens, setCitizens] = useState<CitizenData[]>(INITIAL_CITIZENS);
  const [selectedCitizenId, setSelectedCitizenId] = useState<string>(INITIAL_CITIZENS[0].id);
  const [jobs, setJobs] = useState<JobContract[]>(() =>
    JOB_CATALOG.slice(0, 4).map((j, i) => ({
      ...j,
      id: `job-${i + 1}`,
      status: 'OPEN',
      assignedTo: null
    }))
  );

  const [logs, setLogs] = useState<ActivityLog[]>([
    {
      id: "l1",
      tag: "SIMULATION",
      message: "AI Living City visual sandbox online. All agent actions driven purely by Mercury 2.5.",
      category: "civic",
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);

  const [metrics, setMetrics] = useState<CityMetrics>({
    treasury: 50.0,
    tier: 1,
    tierName: "Tier 1: Settlement",
    leaderName: "Maya",
    activeCitizens: 8,
    totalVolume: 0.0
  });

  const [timeScale, setTimeScale] = useState(1);
  const [isPaused, setIsPaused] = useState(false);
  const [activeTab, setActiveTab] = useState<'all' | 'jobs' | 'social' | 'leaderboard'>('all');
  const [isPassportOpen, setIsPassportOpen] = useState(false);
  const [isJobModalOpen, setIsJobModalOpen] = useState(false);

  // Live state refs
  const citizensRef = useRef(citizens);
  citizensRef.current = citizens;
  const jobsRef = useRef(jobs);
  jobsRef.current = jobs;
  const turnIndexRef = useRef(0);
  const isProcessingRef = useRef(false);

  const addLog = useCallback((tag: string, message: string, category: 'jobs' | 'social' | 'civic' | 'leaderboard' | 'all' = 'civic', reasoningTokens?: number) => {
    const newLog: ActivityLog = {
      id: 'log-' + Math.random().toString(36).substring(2, 9),
      tag,
      message,
      category,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      reasoningTokens
    };
    setLogs(prev => [newLog, ...prev.slice(0, 60)]);
  }, []);

  // Initialize Canvas Voxel Engine
  useEffect(() => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    const engine = new VoxelWorldEngine(canvas);
    engineRef.current = engine;

    const handleResize = () => {
      engine.resize();
    };
    handleResize();
    window.addEventListener('resize', handleResize);

    const handleClick = (e: MouseEvent) => {
      if (engine.isDragging) return;
      const rect = canvas.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const clickY = e.clientY - rect.top;

      setCitizens(prevCitizens => {
        let found = null;
        for (const c of prevCitizens) {
          const p = engine.isoToScreen(c.x, c.y, 0.1);
          const dist = Math.hypot(clickX - p.x, clickY - p.y);
          if (dist < 26 * engine.camera.zoom) {
            found = c;
            break;
          }
        }
        if (found) {
          setSelectedCitizenId(found.id);
        }
        return prevCitizens;
      });
    };

    const handleDblClick = () => {
      setIsPassportOpen(true);
    };

    canvas.addEventListener('click', handleClick);
    canvas.addEventListener('dblclick', handleDblClick);

    return () => {
      window.removeEventListener('resize', handleResize);
      canvas.removeEventListener('click', handleClick);
      canvas.removeEventListener('dblclick', handleDblClick);
    };
  }, []);

  // Animation and movement loop
  useEffect(() => {
    let animId: number;

    const loop = () => {
      if (!isPaused && engineRef.current) {
        setCitizens(prev => {
          return prev.map(c => {
            let nx = c.x;
            let ny = c.y;
            let isMoving = c.isMoving;

            if (isMoving) {
              const dx = c.targetX - c.x;
              const dy = c.targetY - c.y;
              const dist = Math.hypot(dx, dy);

              if (dist < 0.12) {
                nx = c.targetX;
                ny = c.targetY;
                isMoving = false;
              } else {
                const step = 0.04 * timeScale;
                nx += (dx / dist) * Math.min(step, dist);
                ny += (dy / dist) * Math.min(step, dist);
              }
            } else if (Math.random() < 0.004) {
              const angle = Math.random() * Math.PI * 2;
              const dist = 1.5 + Math.random() * 3.5;
              return {
                ...c,
                targetX: Math.max(4, Math.min(22, c.x + Math.cos(angle) * dist)),
                targetY: Math.max(4, Math.min(22, c.y + Math.sin(angle) * dist)),
                isMoving: true
              };
            }

            return { ...c, x: nx, y: ny, isMoving };
          });
        });
      }

      if (engineRef.current) {
        engineRef.current.render(citizens);
      }

      animId = requestAnimationFrame(loop);
    };

    animId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animId);
  }, [isPaused, timeScale, citizens]);

  // Recalculate elected leader based on highest living standard score
  useEffect(() => {
    let topScore = -1;
    let topLeader = "Maya";

    citizens.forEach(c => {
      if (c.wallet.livingStandardScore > topScore) {
        topScore = c.wallet.livingStandardScore;
        topLeader = c.name;
      }
    });

    setMetrics(prev => ({
      ...prev,
      leaderName: topLeader
    }));
  }, [citizens]);

  // Autonomous Economic Engine: Powered 100% by Inception Mercury 2.5 cognitive reasoning
  const runAutonomousEconomicCycle = useCallback(async () => {
    if (isPaused || isProcessingRef.current || !engineRef.current) return;

    const currentCitizens = citizensRef.current;
    const currentJobs = jobsRef.current;

    const openJobs = currentJobs.filter(j => j.status === 'OPEN');
    if (openJobs.length < 3) {
      const existingTitles = new Set(currentJobs.map(j => j.title));
      const unposted = JOB_CATALOG.find(cj => !existingTitles.has(cj.title));
      if (unposted) {
        const newJob: JobContract = {
          ...unposted,
          id: "job-" + Math.random().toString(36).substring(2, 7),
          status: "OPEN",
          assignedTo: null
        };
        setJobs(prev => [newJob, ...prev]);
        addLog("JOB", `New civic contract posted: [${newJob.title}] ($${newJob.bounty.toFixed(2)})`, "jobs");
      }
    }

    const activeCitizen = currentCitizens[turnIndexRef.current % currentCitizens.length];
    turnIndexRef.current++;
    isProcessingRef.current = true;

    try {
      const peers = currentCitizens
        .filter(c => c.id !== activeCitizen.id)
        .map(c => ({
          name: c.name,
          title: c.title,
          nativeSkills: c.nativeSkills,
          acquiredSkills: c.acquiredSkills.map(s => s.skillName),
          balance: c.wallet.balance,
          relationship: activeCitizen.socialBonds[c.name]?.status || 'Neutral'
        }));

      const openJobsPayload = currentJobs
        .filter(j => j.status === 'OPEN')
        .map(j => ({
          id: j.id,
          title: j.title,
          bounty: j.bounty,
          requiredSkills: j.requiredSkills
        }));

      const res = await fetch('/api/agent/reason', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mode: 'evaluate_opportunity',
          agent: {
            name: activeCitizen.name,
            title: activeCitizen.title,
            wallet: activeCitizen.wallet,
            nativeSkills: activeCitizen.nativeSkills,
            acquiredSkills: activeCitizen.acquiredSkills,
            currentNeeds: activeCitizen.currentNeeds,
            socialBonds: activeCitizen.socialBonds
          },
          context: {
            openJobs: openJobsPayload,
            peers
          }
        })
      });

      const data = await res.json();
      const decision = data.decision;
      const reasoningTokens = data.reasoningTokens || 0;

      if (!decision) {
        isProcessingRef.current = false;
        return;
      }

      setCitizens(prev =>
        prev.map(c => (c.id === activeCitizen.id ? { ...c, reasoningTokensLastAction: reasoningTokens } : c))
      );

      addLog("THINK", `${activeCitizen.name}: "${decision.thought}"`, "social", reasoningTokens);

      if (decision.action === 'SUBCONTRACT' && decision.partnerName && decision.jobId) {
        const targetJob = currentJobs.find(j => j.id === decision.jobId && j.status === 'OPEN');
        const partner = currentCitizens.find(c => c.name === decision.partnerName);

        if (!targetJob || !partner) {
          isProcessingRef.current = false;
          return;
        }

        setJobs(prev => prev.map(j => j.id === targetJob.id ? { ...j, status: 'IN_PROGRESS' } : j));

        const mx = decision.meetingPoint?.x || 13;
        const my = decision.meetingPoint?.y || 11;

        setCitizens(prev => prev.map(c => {
          if (c.id === activeCitizen.id) return { ...c, targetX: mx - 0.5, targetY: my, isMoving: true };
          if (c.id === partner.id) return { ...c, targetX: mx + 0.5, targetY: my, isMoving: true };
          return c;
        }));

        setCitizens(prev => prev.map(c => c.id === activeCitizen.id ? { ...c, speechText: decision.speech, speechVisible: true } : c));
        addLog("OFFER", `${activeCitizen.name} offered $${decision.offeredAmount} to ${partner.name} on [${targetJob.title}].`, "jobs");

        setTimeout(async () => {
          let partnerDecision = { decision: 'ACCEPT', counterAmount: null as number | null, affinityDelta: 15, speech: "Agreed. Let's build together." };
          let partnerTokens = 0;
          try {
            const partnerRes = await fetch('/api/agent/reason', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                mode: 'respond_to_offer',
                agent: {
                  name: partner.name,
                  title: partner.title,
                  wallet: partner.wallet,
                  nativeSkills: partner.nativeSkills,
                  socialBonds: partner.socialBonds
                },
                context: {
                  proposer: { name: activeCitizen.name, title: activeCitizen.title },
                  offerType: 'WAGE',
                  jobTitle: targetJob.title,
                  offeredAmount: decision.offeredAmount,
                  requiredSkill: targetJob.requiredSkills.find(s => partner.nativeSkills.includes(s)) || 'Specialist Craft'
                }
              })
            });
            const pData = await partnerRes.json();
            if (pData.decision) {
              partnerDecision = pData.decision;
              partnerTokens = pData.reasoningTokens || 0;
            }
          } catch (e) {
            console.error(e);
          }

          setCitizens(prev => prev.map(c => c.id === partner.id ? { ...c, speechText: partnerDecision.speech, speechVisible: true, reasoningTokensLastAction: partnerTokens } : c));

          if (partnerDecision.decision === 'REJECT') {
            addLog("RESPONSE", `${partner.name} rejected offer: "${partnerDecision.speech}"`, "social", partnerTokens);
            setJobs(prev => prev.map(j => j.id === targetJob.id ? { ...j, status: 'OPEN' } : j));
            setTimeout(() => {
              setCitizens(prev => prev.map(c => ({ ...c, speechVisible: false })));
              isProcessingRef.current = false;
            }, 3000);
            return;
          }

          const finalWage = partnerDecision.decision === 'COUNTER' && partnerDecision.counterAmount
            ? partnerDecision.counterAmount
            : decision.offeredAmount;

          addLog("RESPONSE", `${partner.name}: "${partnerDecision.speech}" (${partnerDecision.decision === 'COUNTER' ? `Counter-offered $${finalWage}` : 'Accepted'})`, "jobs", partnerTokens);

          setTimeout(() => {
            engineRef.current?.addTransactionBeam(activeCitizen.x, activeCitizen.y, partner.x, partner.y, `Wage: $${finalWage.toFixed(0)}`);
            engineRef.current?.addFloatingTextGrid(activeCitizen.x, activeCitizen.y, `+$${(targetJob.bounty - finalWage).toFixed(0)}`, '#38ef7d');
            engineRef.current?.addFloatingTextGrid(partner.x, partner.y, `+$${finalWage.toFixed(0)}`, '#00d2ff');

            setCitizens(prev => prev.map(c => {
              if (c.id === activeCitizen.id) {
                const newBalance = c.wallet.balance + (targetJob.bounty - finalWage);
                const newScore = Math.min(120, c.wallet.livingStandardScore + 8);
                const tier = newScore >= 110 ? "Level 5: Sovereign Archon"
                  : newScore >= 95 ? "Level 4: Civic Luminary"
                  : newScore >= 80 ? "Level 3: Master Artisan"
                  : newScore >= 65 ? "Level 2: Guild Craftsman"
                  : "Level 1: Independent Starter";
                return {
                  ...c,
                  wallet: { ...c.wallet, balance: newBalance, totalEarned: c.wallet.totalEarned + (targetJob.bounty - finalWage), livingStandardScore: newScore, livingStandardTier: tier },
                  jobsCompleted: c.jobsCompleted + 1,
                  speechVisible: false
                };
              }
              if (c.id === partner.id) {
                const newBalance = c.wallet.balance + finalWage;
                const newScore = Math.min(120, c.wallet.livingStandardScore + 6);
                const tier = newScore >= 110 ? "Level 5: Sovereign Archon"
                  : newScore >= 95 ? "Level 4: Civic Luminary"
                  : newScore >= 80 ? "Level 3: Master Artisan"
                  : newScore >= 65 ? "Level 2: Guild Craftsman"
                  : "Level 1: Independent Starter";
                return {
                  ...c,
                  wallet: { ...c.wallet, balance: newBalance, totalEarned: c.wallet.totalEarned + finalWage, livingStandardScore: newScore, livingStandardTier: tier },
                  jobsCompleted: c.jobsCompleted + 1,
                  speechVisible: false
                };
              }
              return c;
            }));

            setJobs(prev => prev.map(j => j.id === targetJob.id ? { ...j, status: 'COMPLETED', assignedTo: `${activeCitizen.name} & ${partner.name}` } : j));
            addLog("COMPLETE", `[${targetJob.title}] completed! ${activeCitizen.name} earned $${(targetJob.bounty - finalWage).toFixed(2)}, ${partner.name} earned $${finalWage.toFixed(2)}.`, "jobs");

            setMetrics(prev => {
              const newVol = prev.totalVolume + targetJob.bounty;
              const newTier = newVol > 1200 ? 4 : newVol > 600 ? 3 : newVol > 200 ? 2 : 1;
              const tierName = newTier === 4 ? "Tier 4: Sovereign Commonwealth" : newTier === 3 ? "Tier 3: Autonomous Metropolis" : newTier === 2 ? "Tier 2: Bustling Borough" : "Tier 1: Settlement";
              return {
                ...prev,
                treasury: prev.treasury + 8,
                totalVolume: newVol,
                tier: newTier,
                tierName
              };
            });

            isProcessingRef.current = false;
          }, 3500);

        }, 2200);

      } else {
        isProcessingRef.current = false;
      }
    } catch (err) {
      console.error("Cognitive loop error:", err);
      isProcessingRef.current = false;
    }
  }, [isPaused, addLog]);

  useEffect(() => {
    if (isPaused) return;
    const interval = setInterval(() => {
      runAutonomousEconomicCycle();
    }, 7000 / timeScale);
    return () => clearInterval(interval);
  }, [isPaused, timeScale, runAutonomousEconomicCycle]);

  const handleGatherPlaza = () => {
    setCitizens(prev =>
      prev.map(c => ({
        ...c,
        targetX: 13 + (Math.random() - 0.5) * 3,
        targetY: 13 + (Math.random() - 0.5) * 3,
        isMoving: true
      }))
    );
    addLog("CIVIC", "Citizens convened at Central Plaza for civic congress.", "civic");
  };

  const handleTriggerCollab = () => {
    addLog("CIVIC", "Simulated collaborative job triggered at agora.", "jobs");
  };

  const handleTriggerMentorship = () => {
    addLog("SKILL", "Devon mastered [Visual & UI Design] under mentorship of Liam for $35.00!", "social");
  };

  const handlePostJob = (title: string, bounty: number, category: string) => {
    const newJob: JobContract = {
      id: "job-user-" + Math.random().toString(36).substring(2, 6),
      title,
      bounty,
      category,
      requiredSkills: ["Architectural Planning", "Software & Tool Building"],
      description: "Direct real-world contract broadcast by human user.",
      postedBy: "Human User",
      status: "OPEN",
      assignedTo: null
    };

    setJobs(prev => [newJob, ...prev]);
    addLog("JOB", `Human contract broadcast: [${title}] ($${bounty.toFixed(2)})! Citizens can bid.`, "jobs");
  };

  const selectedCitizen = citizens.find(c => c.id === selectedCitizenId) || citizens[0];

  return (
    <div id="app-container">
      {/* Top Navigation Back to Consumer Marketplace */}
      <div
        style={{
          position: 'absolute',
          top: '16px',
          left: '20px',
          zIndex: 30,
          display: 'flex',
          alignItems: 'center',
          gap: '12px'
        }}
      >
        <Link
          href="/"
          className="hud-btn"
          style={{
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(12px)',
            border: '1px solid var(--border-hairline)',
            color: '#18181A',
            fontWeight: 700,
            boxShadow: 'var(--shadow-editorial)',
            height: '36px',
            textDecoration: 'none',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          <div className="brand-logo-money-coin" style={{ width: 20, height: 20, fontSize: 11, borderRadius: 5 }}>
            <span className="coin-sign">₹</span>
          </div>
          ← Return to Marketplace Portal
        </Link>
      </div>

      <main id="canvas-wrapper">
        <canvas ref={canvasRef} id="world-canvas" />
        <div className="canvas-watermark">
          AI LIVING CITY // 3D VISUAL SIMULATION ENGINE // MERCURY 2.5 DIFFUSION COGNITION
        </div>
      </main>

      <HudHeader
        metrics={metrics}
        timeScale={timeScale}
        isPaused={isPaused}
        onSpeedChange={speed => {
          if (speed === 0) setIsPaused(true);
          else {
            setIsPaused(false);
            setTimeScale(speed);
          }
        }}
        onOpenJobModal={() => setIsJobModalOpen(true)}
        onOpenLeaderboard={() => setActiveTab('leaderboard')}
      />

      <CityControls
        onGatherPlaza={handleGatherPlaza}
        onTriggerCollab={handleTriggerCollab}
        onTriggerMentorship={handleTriggerMentorship}
      />

      <CityAssistantChat
        metrics={metrics}
        citizens={citizens}
        jobs={jobs}
        logs={logs}
        selectedCitizen={selectedCitizen}
      />

      <CommandConsole
        selectedCitizen={selectedCitizen}
        allCitizens={citizens}
        activeJobs={jobs}
        logs={logs}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onOpenPassport={() => setIsPassportOpen(true)}
        onSelectCitizen={c => setSelectedCitizenId(c.id)}
      />

      <PassportModal
        isOpen={isPassportOpen}
        citizen={selectedCitizen}
        onClose={() => setIsPassportOpen(false)}
      />

      <JobModal
        isOpen={isJobModalOpen}
        onClose={() => setIsJobModalOpen(false)}
        onPostJob={handlePostJob}
      />
    </div>
  );
}
