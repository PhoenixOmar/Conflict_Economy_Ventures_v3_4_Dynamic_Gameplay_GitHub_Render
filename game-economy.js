"use strict";
/** Pure calculations for transparent previews. The same balance rules are used by the live server. */
const keys=["capital","workforce","influence","stability","intel","morale"];
const max={capital:99,workforce:500,influence:10,stability:10,intel:10,morale:100};
const clamp=(v,a,b)=>Math.min(b,Math.max(a,v));
const round=(x,p=2)=>Math.round(x*10**p)/10**p;
function statsAfter(stats,delta={}){
 const s={...stats};
 for(const k of keys) {
  const n=(Number(s[k])||0)+(Number(delta[k])||0);
  s[k]=k==="capital"?round(clamp(n,0,99)):Math.round(clamp(n,0,max[k]));
 }
 return s;
}
function passiveIncome(stats,baseYield,{strike=false,crisis=false}={}){
 if(strike)return 0;
 const base=baseYield+stats.workforce*.0017+stats.intel*.028+stats.influence*.011;
 const modifier=clamp((.57+stats.stability*.055)*(stats.morale<50?.75:1)*(crisis?.65:1),.18,1.25);
 return round(base*modifier,2);
}
function sanctionDelta(roundIndex,optionIndex){
 return optionIndex===0&&(roundIndex===2||roundIndex===4)?{capital:-.22,influence:-1,stability:-1}:null;
}
function preview(stats,option,roundIndex,optionIndex,baseYield,existingStrike=false,existingCrisis=false){
 const immediate=statsAfter(stats,option.delta);
 const sanction=sanctionDelta(roundIndex,optionIndex);
 const after=sanction?statsAfter(immediate,sanction):immediate;
 const computed={};for(const k of keys)computed[k]=round(after[k]-stats[k],2);
 const strike=after.morale<35 || (existingStrike&&after.morale<48);
 const crisis=after.stability<=2 || (existingCrisis&&after.stability<4);
 const warning=[];
 if(strike)warning.push("STRIKE: passive income becomes $0B unless worker grievances are resolved.");
 if(after.morale<25)warning.push("DEFECTION RISK: at least some workers will resign; rivals may recruit them.");
 if(crisis)warning.push("REGIONAL CRISIS: a further capital, morale and influence penalty may apply.");
 if(sanction)warning.push("GUARANTEED CIVIL-SOCIETY SANCTIONS are included in the numbers above.");
 return {before:{...stats},after,delta:computed,sanction,projectedIncome:passiveIncome(after,baseYield,{strike,crisis}),warning,projectionNote:"Estimated passive income assumes no new diplomatic deals, defections or rival interventions. Final balances are calculated at reveal."};
}
module.exports={keys,max,statsAfter,passiveIncome,sanctionDelta,preview,round};
