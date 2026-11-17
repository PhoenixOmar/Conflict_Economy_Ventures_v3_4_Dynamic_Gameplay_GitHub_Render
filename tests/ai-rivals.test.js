"use strict";
const test=require('node:test');
const assert=require('node:assert/strict');
const Module=require('node:module');
const AI=require('../ai-engine');
function harness(){
 const original=Module._load;let io;
 const express=()=>{const fn=()=>{};fn.use=()=>{};fn.disable=()=>{};fn.get=()=>{};fn.post=()=>{};return fn;};
 express.json=()=>()=>{};express.static=()=>()=>{};
 class IO{constructor(){this.sockets={sockets:new Map()};this.handlers={};io=this;}on(event,fn){this.handlers[event]=fn;}}
 Module._load=function(name,parent,isMain){if(name==='express')return express;if(name==='socket.io')return{Server:IO};if(name==='qrcode')return{toString:async()=>'<svg/>'};return original.apply(this,arguments);};
 // The original test loads server too. Reuse module without leaking test double config across tests.
 delete require.cache[require.resolve('../server')];const server=require('../server');Module._load=original;
 let n=0;function socket(){const s={id:'ai-test-'+(++n),connected:true,data:{},handlers:{},states:[],on(event,cb){this.handlers[event]=cb;},emit(event,data){if(event==='room:state')this.states.push(data);},join(){},leave(){},disconnect(){this.connected=false;this.handlers.disconnect?.();io.sockets.sockets.delete(this.id);}};io.sockets.sockets.set(s.id,s);io.handlers.connection(s);return s;}
 function send(s,event,payload={}){let answer;assert.ok(s.handlers[event],event);s.handlers[event](payload,r=>answer=r);return answer;}
 const state=s=>s.states.at(-1);
 const close=()=>{for(const room of server.rooms.values()){clearTimeout(room.timer);server.clearAITimers(room);server.cancelTransition(room);}server.server.close();};
 return {socket,send,state,server,close};
}
const h=harness();test.after(()=>h.close());
function setup(players=1,teams=4,ai=3,personality='adaptive',mode='full'){
 const room=h.server.createRoom();const host=h.socket();assert.equal(h.send(host,'host:join',{code:room.code,key:room.ownerKey}).ok,true);
 assert.equal(h.send(host,'host:configure',{teamCount:teams,aiTeamCount:ai,aiPersonality:personality,mode}).ok,true);
 const joined=[];for(let i=0;i<players;i++){const socket=h.socket();assert.equal(h.send(socket,'player:join',{code:room.code,name:`Tester ${room.code}-${i}`}).ok,true);joined.push(socket);}
 return {room,host,players:joined};
}
test('AI controls: 0 to 4 rivals, personality, leave minimum one human seat',()=>{
 const {room,host}=setup(1,5,4,'cautious','quick');
 assert.equal(h.state(host).aiTeamCount,4);
 assert.equal(h.state(host).humanTeamCount,1);
 assert.equal(h.send(host,'host:configure',{teamCount:4,aiTeamCount:4,aiPersonality:'cautious',mode:'quick'}).ok,false);
 assert.equal(h.send(host,'host:configure',{teamCount:5,aiTeamCount:2,aiPersonality:'alien',mode:'quick'}).ok,false);
 assert.equal(h.send(host,'host:configure',{teamCount:5,aiTeamCount:-1,aiPersonality:'cautious',mode:'quick'}).ok,false);
});
test('one human versus three AI: balanced assignment, briefing, AI responses and synchronized reveal',()=>{
 const {room,host,players}=setup(1,4,3);
 assert.equal(h.send(host,'host:assign').ok,true);assert.equal(room.teams.filter(t=>t.isAI).length,3);
 assert.deepEqual(room.teams.filter(t=>!t.isAI).map(t=>t.memberIds.length),[1]);
 assert.ok(room.teams.filter(t=>t.isAI).every(t=>t.name.endsWith('[AI]')&&t.memberIds.length===0));
 assert.equal(h.state(host).teams.filter(t=>t.isAI).length,3);
 assert.equal(h.send(players[0],'player:ready').ok,true);assert.equal(h.state(host).allReady,true);
 assert.equal(h.send(host,'host:next').ok,true);assert.equal(room.phase,'active');
 assert.equal(room.aiTimers.size,3);
 assert.equal(h.state(host).submittedCount,0);
 assert.equal(h.send(players[0],'player:submit',{optionIndex:1}).ok,true);
 assert.equal(room.phase,'active');assert.equal(h.send(host,'host:reveal').ok,true);assert.equal(room.aiTimers.size,0);
 assert.equal(h.state(host).result.results.length,4);
 assert.equal(h.state(host).result.results.filter(t=>t.submitted).length,4);
 assert.ok(room.teams.every(t=>t.lastIncome>=0));
});
test('two human teams and two AI do not reveal until both humans submit',()=>{
 const {room,host,players}=setup(2,4,2,'profiteer','quick');h.send(host,'host:assign');for(const p of players)h.send(p,'player:ready');h.send(host,'host:next');
 assert.equal(h.send(players[0],'player:submit',{optionIndex:1}).ok,true);
 assert.equal(room.phase,'active');assert.ok(room.aiTimers.size>0);
 assert.equal(h.send(players[1],'player:submit',{optionIndex:1}).ok,true);
 assert.equal(room.phase,'active');h.send(host,'host:reveal');assert.equal(room.phase,'revealed');assert.equal(room.submissions.size,4);
});
test('zero-AI classic human mode remains unchanged',()=>{
 const {room,host,players}=setup(2,2,0);h.send(host,'host:assign');players.forEach(p=>h.send(p,'player:ready'));h.send(host,'host:next');
 assert.equal(room.aiTimers.size,0);h.send(players[0],'player:submit',{optionIndex:1});assert.equal(room.phase,'active');h.send(players[1],'player:submit',{optionIndex:1});h.send(host,'host:reveal');assert.equal(room.phase,'revealed');
});
test('AI decisions react to morale, instability, human lead and personality',()=>{
 const ai={isAI:true,personality:'cautious',strike:false,stats:{capital:1.5,workforce:55,influence:5,stability:2,intel:2,morale:27}};
 const human={isAI:false,stats:{capital:8,workforce:180,influence:9,stability:9,intel:9,morale:92}};
 const room={teams:[human,ai],currentIdx:1,aiPersonality:'cautious'};
 const decision=AI.decide(room,ai,{options:[{title:'Cut pay',delta:{capital:1,morale:-20,stability:-1}},{title:'Fund wages',delta:{capital:-.35,morale:30,stability:2}}]});
 assert.equal(decision.optionIndex,1);assert.equal(decision.context.humansAhead,true);
 assert.equal(AI.settlement({...ai,strike:true}).method,'wages');
 assert.ok(AI.valuesFor('cautious',ai,AI.climate(room,ai)).morale>AI.valuesFor('cautious',{...ai,stats:{...ai.stats,morale:90,stability:8}},AI.climate(room,ai)).morale);
 const comfortable={...ai,strike:false,stats:{...ai.stats,morale:85,stability:8}};assert.equal(AI.settlement(comfortable),null);
});
test('AI reacts privately to human trade offer; AI-initiated offers are visible to target phone',()=>{
 const {room,host,players}=setup(1,2,1,'cautious','full');h.send(host,'host:assign');h.send(players[0],'player:ready');h.send(host,'host:next');
 for(let k=0;k<3;k++){h.server.reveal(room);h.send(host,'host:next');}
 assert.equal(room.currentIdx,3);const phone=h.state(players[0]);assert.ok(phone.myOffers.length>0);
 const offer=phone.myOffers.find(o=>o.from===1);assert.ok(offer);assert.equal(offer.aiInitiated,true);
 if(offer.kind==='poach')assert.equal(h.send(players[0],'player:defendPoach',{offerId:offer.id}).ok,true);
 else assert.equal(h.send(players[0],'player:respondOffer',{offerId:offer.id,accept:true}).ok,true);
 // AI must respond instantly to human offers if the human team's offer slot remains free.
 const sent=h.send(players[0],'player:offer',{target:1,kind:'alliance'});assert.equal(sent.ok,true);
 assert.notEqual(room.offers.at(-1).status,'pending');
 assert.ok(!h.state(players[0]).myOffers.some(o=>o.to!==0&&o.from!==0));
 // Locking human answer submits the AI answer without a 3-6 second wait.
 h.send(players[0],'player:submit',{optionIndex:1});h.send(host,'host:reveal');assert.equal(room.phase,'revealed');
 assert.ok(h.state(host).result.deals.length>=1);
});
test('poaching bids sent to phones can be defended with an actual workforce-retention decision',()=>{
 const {room,host,players}=setup(1,2,1,'profiteer','full');h.send(host,'host:assign');h.send(players[0],'player:ready');h.send(host,'host:next');
 for(let k=0;k<3;k++){h.server.reveal(room);h.send(host,'host:next');}
 // Human targets include all AI-originated offers; force AI bid to test the defense pathway.
 const bid={id:'test-bid',from:1,to:0,kind:'poach',status:'pending-poach',created:Date.now(),aiInitiated:true};room.offers.push(bid);room.teams[0].stats.capital=1.5;
 assert.equal(h.send(players[0],'player:defendPoach',{offerId:'test-bid'}).ok,true);
 assert.equal(bid.status,'defended');assert.ok(room.teams[0].stats.capital<1.5);assert.ok(h.state(players[0]).myOffers.some(o=>o.id==='test-bid'));
 h.send(players[0],'player:submit',{optionIndex:1});h.send(host,'host:reveal');assert.equal(room.phase,'revealed');
 assert.ok(h.state(host).result.deals.some(o=>o.description.includes('retained its specialists')));
});
test('AI submits autonomously within 3–6 seconds while humans are still debating',async()=>{
 const {room,host,players}=setup(1,3,2,'adaptive','quick');h.send(host,'host:assign');h.send(players[0],'player:ready');h.send(host,'host:next');
 assert.equal(room.submissions.size,0);
 await new Promise(resolve=>setTimeout(resolve,6150));
 assert.equal(room.phase,'active');
 assert.equal(room.submissions.size,2);
 assert.ok(room.teams.filter(t=>t.isAI).every(t=>room.submissions.has(t.index)));
 assert.equal(h.state(host).submittedCount,2);
 h.send(players[0],'player:submit',{optionIndex:1});h.send(host,'host:reveal');assert.equal(room.phase,'revealed');
});
test('diplomatic AI spends influence in stability collapse; profiteer conserves political capital',()=>{
 for(const persona of ['cautious','profiteer']){
  const {room,host,players}=setup(1,2,1,persona,'quick');h.send(host,'host:assign');h.send(players[0],'player:ready');h.send(host,'host:next');
  const t=room.teams[1];t.stats.stability=1;t.stats.morale=70;t.stats.influence=5;
  h.send(players[0],'player:submit',{optionIndex:1});
  h.send(host,'host:reveal');assert.equal(room.phase,'revealed');
  if(persona==='cautious')assert.ok(room.news.some(x=>x.headline.includes('AI STABILIZATION')));
  else assert.ok(!room.news.some(x=>x.headline.includes('AI STABILIZATION')));
 }
});

test('manual early reveal and short timer never penalize a simulated opponent for waiting',()=>{
 const {room,host,players}=setup(1,4,3,'adaptive','quick');h.send(host,'host:assign');h.send(players[0],'player:ready');h.send(host,'host:next');
 assert.equal(room.submissions.size,0);assert.equal(h.send(host,'host:reveal').ok,true);
 assert.equal(room.phase,'revealed');assert.equal(room.submissions.size,3);
 assert.equal(room.history[0].results.filter(x=>x.submitted).length,3);
 assert.equal(room.history[0].results.filter(x=>!x.submitted).length,1);
});
