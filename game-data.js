"use strict";
// Fictional educational simulation. Numbers are game balance, not factual financial estimates.
const STORY = [
  "WELCOME TO 2040. The world as we knew it no longer exists.",
  "The old international order collapsed. The United States reinvented itself as the United Trump Kingdom. China controls much of the global technology infrastructure. Borders increasingly follow whoever can defend them.",
  "AI administers settlements, corporations negotiate territorial access, and the UN survives mainly as an expensive conference venue. International law exists on paper; peacemaking is almost extinct.",
  "After years of unemployment and depressing LinkedIn updates, former mediators reinvented themselves as conflict entrepreneurs. They invited their digitally native children to advise them on the business opportunities of permanent crisis.",
  "Fortunately, some of your own former MAS classmates saw the writing on the wall early, abandoned mediation, and founded Conflict Economy Ventures. We have deep pockets, questionable ethics, and a strict no-peace policy.",
  "YOUR MISSION: Build a commercially viable venture, keep your workforce and legitimacy intact, and negotiate the 2040 Peace Summit. Peace is bad for business — or is it?"
];
const FACTIONS = [
  { id:"diamonds", name:"Artisanal Diamonds", short:"Diamonds", icon:"💎", color:"#70caff", subtitle:"The Pocket Economy", region:"CAR / Eastern DRC analogue", baseYield:0.23,
    capital:1.35, workforce:54, influence:3, stability:5, intel:3, morale:63,
    mandate:"Make portable wealth profitable without watching every commander create their own franchise.",
    secret:"Your assets are extraordinarily mobile. Rival teams may not realise that retaining your workforce matters more than guarding the mine.",
    consultant:"Your daughter earned a PhD in Portable Wealth Management and Loot Logistics at the University of New Dubai.",
    rules:"Low barriers, quick returns, high splinter risk. Investment scale and wealth are fictional game units.",
    prompts:[
      ["New arrivals discover diamond deposits. Your tiny operation can scale quickly. How do you allocate seed money?","Hiring vs. pocket-sized profit; loyalty is not automatic."],
      ["Your miners demand predictable pay after record shipments. Investors insist on larger dividends.","Cash now versus morale and workforce cohesion."],
      ["BLACK SWAN: A gemstone price spike attracts three rival factions. Local communities demand oversight.","Portable profit, splinter risk, and community consent collide."],
      ["A neighboring faction offers access to an export route. Your skilled sorters are being courted by competitors.","Alliances, espionage and labor mobility now matter."],
      ["THE 2040 SUMMIT: Civil society wants monitoring of diamond proceeds and a share in the settlement.","Legitimacy or opaque deals? Your final portfolio depends on it."]
    ]
  },
  { id:"pipeline",name:"Oil Pipelines",short:"Pipelines",icon:"🛢️",color:"#63e9aa",subtitle:"The Infrastructure Economy",region:"Sudan / South Sudan analogue",baseYield:0.28,
    capital:1.70,workforce:48,influence:5,stability:5,intel:2,morale:66,
    mandate:"Earn from an immovable network without destroying the infrastructure on which everyone depends.",
    secret:"The pipeline generates less value when shut down. Credible access rules are a stronger asset than dramatic threats.",
    consultant:"Your son has a Master's in Strategic Infrastructure Hostage Economics from Trump Jr. School of Business.",
    rules:"Fixed assets, negotiation leverage, and vulnerability to service interruptions.",
    prompts:[
      ["Governments need your pipeline corridor operational, but your investors demand faster returns.","Infrastructure is immovable and politically exposed."],
      ["Technical crews threaten to stop servicing a critical pumping station.","An apparently profitable wage cut may halt throughput."],
      ["BLACK SWAN: Fuel prices plunge and an oversight coalition protests private control of the corridor.","Revenue-sharing and public trust are suddenly decisive."],
      ["Two administrations claim authority over pipeline transit charges. Rival operators want your engineers.","Stable agreements require more than a memorandum."],
      ["THE 2040 SUMMIT: Citizens demand audited oil revenue, access guarantees and labor representation.","Can negotiated governance protect the asset and its workers?"]
    ]
  },
  { id:"minerals",name:"Copper & Cobalt",short:"Cobalt",icon:"⛏️",color:"#b49cff",subtitle:"The State-Capture Economy",region:"Katanga / Eastern DRC analogue",baseYield:0.32,
    capital:2.10,workforce:74,influence:4,stability:4,intel:3,morale:59,
    mandate:"Operate a capital-intensive industrial value chain while securing investors, supply routes and regulatory legitimacy.",
    secret:"Your large industrial workforce is both productive and politically consequential. Severe labor conflict can erase your strongest advantage.",
    consultant:"Your daughter studied Geopolitical Monopoly Engineering at the Beijing Institute of AI Governance.",
    rules:"High barriers, concentrated assets, long supply chains. Large investments are represented by abstract $B game units.",
    prompts:[
      ["Your first processing plant is under construction. You must finance expertise and reliable supply links.","Infrastructure wants patient capital, not shortcuts."],
      ["Factory workers demand protective equipment, fair hours and independent safety reviews.","Your industrial workforce could turn into your biggest risk."],
      ["BLACK SWAN: Global buyers suspend purchases amid sanctions and a mass march reaches the mine.","Investor confidence now depends on transparent governance."],
      ["A rival consortium seeks your engineers while foreign investors offer a controversial exclusive deal.","Skills and institutions matter as much as ore."],
      ["THE 2040 SUMMIT: Civil coalitions demand environmental safeguards and a revenue-oversight committee.","A settlement must function across the entire value chain."]
    ]
  },
  { id:"checkpoint",name:"Checkpoint Economy",short:"Checkpoints",icon:"🍌",color:"#ffbd75",subtitle:"The Everyday Tax Business",region:"Banana and beer trade corridors",baseYield:0.22,
    capital:1.20,workforce:57,influence:3,stability:6,intel:4,morale:66,
    mandate:"Grow an informal tax corridor without strangling the trade that funds it.",
    secret:"Traders can leave. A predictable and accountable tariff may produce better long-run returns than endless extraction.",
    consultant:"Your son built Portify, a metaverse startup offering blockchain-certified banana tariffs.",
    rules:"Roving versus stationary bandits; repeated taxation depends on continuing trade.",
    prompts:[
      ["Motorbikes loaded with bananas and beer crates are queuing at your new checkpoint.","Immediate extraction or a sustainable trading corridor?"],
      ["Trade unions and market vendors demand receipts and a predictable tariff schedule.","Administrative discipline may protect the tax base."],
      ["BLACK SWAN: Traders boycott the crossing and citizens organize a blockade.","Exploitative prices can destroy the very market you tax."],
      ["Another operator offers a shared corridor, but your best tariff analysts are being recruited away.","Negotiation, fairness and rival incentives interact."],
      ["THE 2040 SUMMIT: A civil society delegation demands fair fees and accessible grievance procedures.","A local commercial deal may be a political settlement in disguise."]
    ]
  }
];
const ROUND_DEFS = [
  {id:"seed",title:"Seed & Recruitment",kicker:"Build your company",duration:135,description:"Make your first investment. Recruit workers and create a durable business foundation."},
  {id:"labor",title:"Supply Chain & Labor Policy",kicker:"Who pays the price?",duration:105,description:"Profit, safety, wages and public legitimacy have consequences."},
  {id:"shock",title:"Black Swan & Civil Unrest",kicker:"BREAKING NEWS",duration:110,description:"A sudden market shock meets the collective choices your company already made."},
  {id:"diplomacy",title:"Backchannel Diplomacy & Poaching",kicker:"Everybody has a price",duration:145,description:"Make a private trade or alliance offer, or tempt workers away from a rival."},
  {id:"summit",title:"The 2040 Peace Summit",kicker:"The final bargain",duration:125,description:"Civil society demands a seat. Spend your accumulated bargaining resources wisely."}
];
const QUICK_INDICES = [0, 2, 4];
const STANDARD_INDICES = [0, 2, 3, 4];
const FULL_INDICES = [0, 1, 2, 3, 4];
const CAP = (capital=0,workforce=0,influence=0,stability=0,intel=0,morale=0) => ({capital,workforce,influence,stability,intel,morale});
function makeOption(title, detail, tradeoff, delta, outcome) {return {title,detail,tradeoff,delta,outcome};}
const OPTION_TEMPLATES = [
 [
  makeOption("Recruit aggressively", "Expand hiring and facility access before anyone else does.","High growth; fragile cohesion",CAP(-0.35,26,1,-1,0,-11),"Expansion pays off in headcount, but informal promises strain morale."),
  makeOption("Build the workforce first", "Hire a smaller team, establish pay rules and invest in basic services.","Moderate growth; healthier morale",CAP(-0.40,16,0,2,1,12),"The balance sheet grows slower, but a loyal workforce keeps operations running."),
  makeOption("Go digital and lean", "Automate recordkeeping and hire a small specialist cohort.","Fewer workers; improved technology",CAP(-0.24,8,0,0,3,1),"Intelligence systems improve efficiency without solving the social questions."),
 ],
 [
  makeOption("Freeze wages, maximize dividends", "Prioritize shareholders over safety reviews or wage demands.","Profit now; serious unrest risk",CAP(0.54,-8,1,-2,0,-29),"A strong quarter comes with a furious workforce and declining public trust."),
  makeOption("Fair pay and safety agreement", "Use capital to negotiate wages, protective equipment and predictable rules.","Costs capital; preserves people",CAP(-0.38,9,0,2,1,19),"An expensive agreement buys meaningful legitimacy and continuity."),
  makeOption("AI productivity restructuring", "Invest in tools and training while reducing traditional roles.","Higher intel; uncertain social impact",CAP(-0.17,-3,0,0,3,-7),"Efficiency rises, but workers suspect technology is being used to sideline them."),
 ],
 [
  makeOption("Punish dissent and extract harder", "Prioritize short-term revenue despite growing public opposition.","Cash boost; severe legitimacy cost",CAP(0.40,-10,1,-3,0,-27),"The crackdown worsens protest dynamics and undermines operations."),
  makeOption("Negotiate with the citizen coalition", "Invite independent representatives and publish enforceable concessions.","Costly; supports recovery",CAP(-0.33,5,1,3,1,21),"Community legitimacy and stable operations begin to recover."),
  makeOption("Launch an AI transparency audit", "Release data and build a joint oversight mechanism.","Less immediate relief; stronger information",CAP(-0.22,0,1,2,3,9),"Public evidence helps, though goodwill still requires material commitments."),
 ],
 [
  makeOption("Secure exclusive market power", "Demand extraordinary privileges in negotiations with rival firms.","Higher influence; labor trust damaged",CAP(0.12,0,2,-1,0,-9),"Your negotiating position looks stronger, but coalitions begin to question your intentions."),
  makeOption("Offer a monitored partnership", "Propose shared operating standards and mutual commitments.","Higher stability; moderate cash cost",CAP(-0.20,6,1,2,1,9),"Cooperation reduces costly uncertainty and improves confidence."),
  makeOption("Invest in specialist intelligence", "Fund market research, logistics mapping and workforce training.","High technology; more expensive",CAP(-0.28,4,0,0,3,4),"Information produces options for the final summit."),
 ],
 [
  makeOption("Cut a closed elite deal", "Spend political favors to lock out civic representatives.","Personal access; destabilizing",CAP(0.45,0,2,-3,0,-20),"A lucrative closed bargain faces legitimacy challenges at implementation."),
  makeOption("Guarantee an inclusive settlement", "Fund implementation, credible oversight and workforce representation.","Expensive; broadly stabilizing",CAP(-0.42,3,-1,4,1,24),"Public participation changes the bargaining landscape and makes implementation more credible."),
  makeOption("Propose a verified digital compact", "Use transparent reporting, grievance channels and phased commitments.","Costs capital and tech; durable trust",CAP(-0.26,2,0,2,2,12),"Monitoring, verifiable rules and engagement improve the viability of the agreement."),
 ]
];
// Each faction gets a distinct prompt/stakes and context-specific answer framing.
const FACTION_OPTION_TITLES = [
  [
   ["Open three independent diamond sites","Set predictable shares for miners","Digitize diamond ledgers"],
   ["Replace wages with shares of loot","Negotiate a transparent pay compact","Use AI-assisted sorting"],
   ["Monopolize all export routes","Invite miner and community representatives","Launch an audited supply ledger"],
   ["Demand exclusive export rights","Join a shared trade corridor","Invest in origin-tracing intelligence"],
   ["Privatize the diamond settlement","Sign a monitored royalty arrangement","Fund a transparent community dividend"]
  ],
  [
   ["Expand pipeline maintenance crews","Create a jointly funded operations unit","Digitize network monitoring"],
   ["Slash technical crew wages","Negotiate a collective maintenance accord","Replace staff with sensors"],
   ["Threaten a total pipeline shutdown","Invite an independent revenue committee","Publish verified throughput data"],
   ["Claim exclusive transit authority","Offer a monitored access bargain","Build a predictive logistics network"],
   ["Keep revenue shares secret","Agree to audited transit and wages","Sign a verified access compact"]
  ],
  [
   ["Fast-track two industrial mines","Fund labor and safety from day one","Automate the ore value chain"],
   ["Freeze industrial pay and benefits","Sign a mine safety settlement","Replace parts of the workforce with AI"],
   ["Double down on extraction","Include environmental and labor observers","Publish a buyer compliance audit"],
   ["Buy preferential regulatory access","Offer joint infrastructure rules","Train an independent logistics unit"],
   ["Reserve all royalties for elites","Create a monitored revenue authority","Build open procurement reporting"]
  ],
  [
   ["Set up more informal toll booths","Standardize tariffs and hire clerks","Launch Portify smart receipts"],
   ["Raise banana tolls without warning","Set a fair published tariff","Replace clerks with algorithmic pricing"],
   ["Penalize traders who boycott","Negotiate a corridor with traders","Audit toll revenues in real time"],
   ["Seek exclusive route control","Offer reciprocal trading rules","Train digital customs specialists"],
   ["Exclude market associations","Accept civil society tariff oversight","Create a verifiable complaints portal"]
  ]
];
function factionScenario(factionIndex, roundIndex) {
  const f = FACTIONS[factionIndex % FACTIONS.length];
  const [prompt,stakes] = f.prompts[roundIndex];
  const options = OPTION_TEMPLATES[roundIndex].map((o,i) => ({ ...o, delta:{...o.delta}, title:FACTION_OPTION_TITLES[factionIndex % 4][roundIndex][i] }));
  return {prompt, stakes, options};
}
module.exports={STORY,FACTIONS,ROUND_DEFS,QUICK_INDICES,STANDARD_INDICES,FULL_INDICES,factionScenario};
