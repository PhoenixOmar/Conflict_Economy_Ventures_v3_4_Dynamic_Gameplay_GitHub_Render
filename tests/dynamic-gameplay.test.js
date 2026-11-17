"use strict";
const test=require("node:test"),assert=require("node:assert/strict"),Module=require("node:module");
const AI=require("../ai-engine"),ECON=require("../game-economy");
function harness(){
 const original=Module._load;let io;
 const express=()=>{const f=()=>{};f.use=f.disable=f.get=f.post=()=>{};return f;};express.json=()=>()=>{};express.static=()=>()=>{};
 class IO{constructor(){this.sockets={sockets:new Map()};this.handlers={};io=this;}on(name,cb){this.handlers[name]=cb;}}
 Module._load=function(name){if(name==="express")return express;if(name==="socket.io")return{Server:IO};if(name==="qrcode")return{toString:async()=>"<svg/>"};return original.apply(this,arguments);};
 delete require.cache[require.resolve("../server")];const server=require("../server");Module._load=original;let id=0;
 function socket(){const s={id:`dyn-${++id}`,data:{},connected:true,handlers:{},states:[],on(k,fn){this.handlers[k]=fn;},emit(k,s){if(k==="room:state")this.states.push(s);},join(){},leave(){},disconnect(){this.connected=false;this.handlers.disconnect?.();io.sockets.sockets.delete(this.id);}};io.sockets.sockets.set(s.id,s);io.handlers.connection(s);return s;}
 function send(s,event,payload={}){let result;s.handlers[event](payload,x=>result=x);return result;}
 function close(){for(const r of server.rooms.values()){clearTimeout(r.timer);server.clearAITimers(r);server.cancelTransition(r);}server.server.close();}
 return {socket,send,server,close,state:s=>s.states.at(-1)};
}
const h=harness();test.after(()=>h.close());
function game(humanCount=1,teamCount=4,aiCount=3,mode="standard",soloFaction="surprise"){
 const r=h.server.createRoom(),owner=h.socket();assert.equal(h.send(owner,"host:join",{code:r.code,key:r.ownerKey}).ok,true);
 assert.equal(h.send(owner,"host:configure",{teamCount,aiTeamCount:aiCount,aiPersonality:"adaptive",mode,soloFaction}).ok,true);
 const players=[];for(let i=0;i<humanCount;i++){const s=h.socket();assert.equal(h.send(s,"player:join",{code:r.code,name:`Dyn-${r.code}-${i}`}).ok,true);players.push(s);}
 return {r,owner,players};
}
test("solo player may choose their economy on the phone; faction profile and brief match",()=>{
 for(const f of ["minerals","checkpoint","pipeline","diamonds"]){const {r,owner,players}=game();const p=players[0];assert.equal(h.send(p,"player:preferFaction",{factionId:f}).ok,true);assert.equal(h.send(owner,"host:assign").ok,true);assert.equal(h.state(p).myBrief.id,f);assert.equal(r.teams[0].factionIndex,["diamonds","pipeline","minerals","checkpoint"].indexOf(f));assert.equal(new Set(r.teams.map(t=>t.factionIndex)).size,4);}
});
test("host solo override takes precedence over the player's selection",()=>{
 const {r,owner,players}=game(1,4,3,"standard","pipeline");h.send(players[0],"player:preferFaction",{factionId:"diamonds"});h.send(owner,"host:assign");assert.equal(r.teams[0].factionIndex,1);
});
test("Surprise Me shuffles factions independently from human team letters",()=>{
 const seen=new Set();for(let i=0;i<24;i++){const {r,owner}=game();h.send(owner,"host:assign");seen.add(r.teams[0].factionIndex);}
 assert.ok(seen.size>=3,`observed ${seen.size} different solo factions`);
});
test("multiple human teams and AI use all four distinct economies before repeating",()=>{
 const {r,owner,players}=game(2,4,2);h.send(owner,"host:assign");assert.equal(new Set(r.teams.map(t=>t.factionIndex)).size,4);assert.ok(players.every(p=>h.state(p).myTeam));
});
test("faction preference can only be selected in lobby; invalid IDs rejected",()=>{
 const {r,owner,players}=game();assert.equal(h.send(players[0],"player:preferFaction",{factionId:"superpower"}).ok,false);h.send(owner,"host:assign");assert.equal(h.send(players[0],"player:preferFaction",{factionId:"pipeline"}).ok,false);
});
test("AI creates distinct offers when three different factions approach one human",()=>{
 const stats={capital:2,workforce:75,influence:6,stability:6,intel:4,morale:70};
 const human={index:0,isAI:false,stats:{...stats,morale:50}};
 const ais=[1,2,3].map(i=>({index:i,isAI:true,factionIndex:i,personality:"adaptive",stats:{...stats}}));
 const room={teams:[human,...ais],currentIdx:3,aiPersonality:"adaptive",offers:[],history:[]};
 for(const t of ais){const proposal=AI.chooseDiplomacy(room,t);assert.ok(proposal);assert.ok(proposal.pitch.length>25);room.offers.push({to:proposal.target,kind:proposal.kind});}
 assert.equal(new Set(room.offers.map(o=>o.kind)).size,3);
});
test("AI backchannels carry distinct factual gameplay terms to the recipient phone",()=>{
 const {r,owner,players}=game(1,4,3,"standard","diamonds");h.send(owner,"host:assign");h.send(players[0],"player:ready");h.send(owner,"host:next");
 for(let k=0;k<2;k++){h.server.reveal(r);h.send(owner,"host:next");}
 assert.equal(r.currentIdx,3);const received=h.state(players[0]).myOffers.filter(o=>o.aiInitiated);assert.equal(received.length,3);
 assert.equal(new Set(received.map(o=>o.kind)).size,3);assert.equal(new Set(received.map(o=>o.pitch)).size,3);
});
test("resource previews include guaranteed civil sanctions and projected morale thresholds",()=>{
 const s={capital:1.1,workforce:60,influence:4,stability:4,intel:2,morale:56};
 const o={delta:{capital:.54,workforce:-8,influence:1,stability:-2,intel:0,morale:-29}};
 const p=ECON.preview(s,o,2,0,.23,false,false);
 assert.equal(p.after.capital,1.42);assert.equal(p.after.morale,27);assert.equal(p.after.stability,1);
 assert.equal(p.delta.influence,0); // +1 influence, -1 sanctioned
 assert.equal(p.projectedIncome,0);assert.ok(p.warning.some(w=>w.includes("STRIKE")));assert.ok(p.warning.some(w=>w.includes("SANCTIONS")));
});
test("no guarantee is made about rival offers in the estimate",()=>{
 const s={capital:1,workforce:60,influence:3,stability:6,intel:2,morale:70};
 const p=ECON.preview(s,{delta:{capital:-.2,workforce:4,influence:0,stability:1,intel:0,morale:10}},0,1,.22,false,false);
 assert.ok(p.projectedIncome>0);assert.ok(p.projectionNote.includes("rival"));assert.equal(p.after.morale,80);
});
test("round results include verified before/after balances and actual net changes",()=>{
 const {r,owner,players}=game();h.send(owner,"host:assign");h.send(players[0],"player:ready");h.send(owner,"host:next");
 const initial={...r.teams[0].stats};assert.equal(h.send(players[0],"player:submit",{optionIndex:1}).ok,true);h.send(owner,"host:reveal");
 const result=h.state(players[0]).result.results[0];assert.deepEqual(result.before,initial);assert.deepEqual(result.after,r.teams[0].stats);
 for(const k of ECON.keys)assert.equal(result.actualDelta[k],ECON.round(result.after[k]-result.before[k]));
});
test("Summit Watch appears before the summit and in the mobile session",()=>{
 const {r,owner,players}=game();h.send(owner,"host:assign");assert.equal(h.state(players[0]).summit.stage,"RUMORS");h.send(players[0],"player:ready");h.send(owner,"host:next");assert.ok(h.state(players[0]).summit.roundsAway>0);
 h.server.reveal(r);h.send(owner,"host:next");assert.match(h.state(players[0]).summit.message,/summit|envoy|coalition/i);
});
test("verified round impact includes pre-submission labor settlements",()=>{
 const {r,owner,players}=game();h.send(owner,"host:assign");h.send(players[0],"player:ready");h.send(owner,"host:next");
 const t=r.teams[0],starting={...t.stats};t.strike=true;t.stats.morale=20; // a sudden unannounced workforce protest while the round is active
 r.roundStartStats[0]={...t.stats};
 const settled=h.send(players[0],"player:resolveStrike",{method:"wages"});assert.equal(settled.ok,true);
 h.send(players[0],"player:submit",{optionIndex:1});h.send(owner,"host:reveal");
 const x=h.state(players[0]).result.results[0];assert.equal(x.before.morale,20);
 assert.equal(x.after.morale,t.stats.morale);assert.equal(x.actualDelta.morale,ECON.round(x.after.morale-20));
 assert.ok(x.actualDelta.morale>0);
});
