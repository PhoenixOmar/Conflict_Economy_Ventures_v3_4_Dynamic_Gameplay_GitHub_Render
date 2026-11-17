"use strict";
/** Facilitated educational debrief. Scores and game economics are deliberately unaffected. */
const REALITY = {
  title: "THE REALITY CHECK",
  subtitle: "From Conflict Entrepreneurs to Peace Mediators",
  intro: "The investors have handed out their award. Now return to your role as a mediator. What did your team's decisions reveal about incentives, authority and legitimacy?",
  reflections: [
    {id:"cohesion",title:"Profit versus cohesion",prompt:"Did maximising revenue strengthen your organisation, or create incentives for fragmentation? Name one choice from the game."},
    {id:"leverage",title:"Resources versus bargaining power",prompt:"Which resource gave your faction leverage, and which relationships or infrastructure made you dependent on others?"},
    {id:"negotiability",title:"Peace versus business",prompt:"If a mediator approached your faction, what would you be willing to negotiate—and what would you refuse to give up?"}
  ],
  comparison: [
    {id:"diamond",icon:"💎",resource:"Artisanal diamonds",pattern:"Portable wealth and low entry barriers can foster splintering and independent commanders.",question:"Who can credibly represent the factions, and can leaders ensure compliance?"},
    {id:"pipeline",icon:"🛢️",resource:"Onshore oil pipelines",pattern:"Fixed, interdependent infrastructure turns access and revenues into bargaining leverage.",question:"Can revenue-sharing, access guarantees and monitoring change incentives?"},
    {id:"cobalt",icon:"⛏️",resource:"Industrial copper and cobalt",pattern:"High capital, logistics and regulation tie economic activity to institutions and state authority.",question:"How could a political settlement address institutions, control and the resource value chain?"},
    {id:"checkpoint",icon:"🍌",resource:"Checkpoint economy",pattern:"Predictable taxation may sustain commerce; roving extraction can destroy the tax base.",question:"Can negotiated rules lower predation and protect traders and livelihoods?"}
  ],
  caution: "These are tendencies, not laws: leadership, political context, external support and institutions also shape armed-group behaviour.",
  dilemma: {
    title:"The Peace Nobody Wants",
    prompt:"A new mediator arrives. The region is exhausted by conflict. Workers are striking, citizens are mobilising and investors threaten to leave. Every armed group claims to support peace—but earns revenue from the conflict economy. What would you do FIRST?",
    options: [
      "Invite all faction leaders to the negotiating table",
      "Negotiate a resource-revenue-sharing arrangement",
      "Engage communities, workers and economic actors before designing talks",
      "Focus first on ceasefire and security guarantees"
    ],
    reasonPrompt:"Why this first step? Who benefits, who might be excluded, and what economic incentives remain?",
    caveat:"There is no universally correct first move. Evaluate the sequencing and trade-offs in the specific context."
  },
  lessons: [
    {title:"Map who controls the income",text:"A leader's signature may be insufficient when commanders control independent revenue streams."},
    {title:"Negotiate incentives, not just positions",text:"Access, taxation, employment and institutional control affect whether an agreement can endure."},
    {title:"Inclusion changes the political economy",text:"Workers, traders, civil society and communities can wield influence outside formal armed-group structures."}
  ],
  closing:"A profitable conflict economy does not automatically become a viable peace economy. Mediation design must engage the incentives, power relations and people behind it."
};
module.exports = {REALITY};
