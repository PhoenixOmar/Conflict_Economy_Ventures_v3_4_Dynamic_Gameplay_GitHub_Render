"use strict";
const test=require('node:test'),assert=require('node:assert/strict'),Module=require('node:module');
const original=Module._load;let io;
const express=()=>{const fn=()=>{};fn.use=()=>{};fn.disable=()=>{};fn.get=()=>{};fn.post=()=>{};return fn;};express.json=()=>()=>{};express.static=()=>()=>{};
class MockIO{constructor(){this.sockets={sockets:new Map()};this.handlers={};io=this;}on(event,fn){this.handlers[event]=fn;}}
Module._load=function(name){if(name==='express')return express;if(name==='socket.io')return{Server:MockIO};if(name==='qrcode')return{toString:async()=>'<svg/>'};return original.apply(this,arguments);};
const game=require('../server');Module._load=original;
let sequence=0;
function connect(){const s={id:`pace-${++sequence}`,connected:true,data:{},handlers:{},seen:[],on(event,cb){this.handlers[event]=cb;},emit(event,state){if(event==='room:state')this.seen.push(state);},join(){},leave(){},disconnect(){this.connected=false;this.handlers.disconnect?.();io.sockets.sockets.delete(this.id);}};io.sockets.sockets.set(s.id,s);io.handlers.connection(s);return s;}
function send(socket,ev,v={}){let ans;assert.ok(socket.handlers[ev],ev);socket.handlers[ev](v,response=>ans=response);return ans;}
const state=s=>s.seen.at(-1),sleep=ms=>new Promise(resolve=>setTimeout(resolve,ms));
function setup({mode='standard',humans=1,ai=0,pace='manual',autoBehavior='reveal_only',readingSeconds=5}={}){
 const room=game.createRoom(),host=connect(),players=[];assert.ok(send(host,'host:join',{code:room.code,key:room.ownerKey}).ok);
 assert.ok(send(host,'host:configure',{teamCount:humans+ai,mode,aiTeamCount:ai}).ok);
 assert.ok(send(host,'host:setPacing',{pacing:pace,autoBehavior,readingSeconds}).ok);
 for(let k=0;k<humans;k++){const p=connect();assert.ok(send(p,'player:join',{code:room.code,name:`Pace user ${room.code} ${k}`}).ok);players.push(p);}
 assert.ok(send(host,'host:assign').ok);
 players.forEach(p=>assert.ok(send(p,'player:ready').ok));
 // For auto briefing, cancel countdown by switching to manual while host starts round explicitly.
 if(pace==='auto')send(host,'host:setPacing',{pacing:'manual'});
 assert.ok(send(host,'host:next').ok);
 if(pace==='auto')send(host,'host:setPacing',{pacing:'auto'});
 return {room,host,players};
}
function finishManually({room,host}){while(room.phase==='active'||room.phase==='revealed'){
 if(room.phase==='active')assert.ok(send(host,'host:reveal').ok);
 if(room.phase==='revealed')assert.ok(send(host,'host:next').ok);
}}
test.after(()=>{for(const room of game.rooms.values()){clearTimeout(room.timer);game.cancelTransition(room);game.clearAITimers(room);}game.server.close();});
test('3 / 4 / 5 rounds use their exact schedule; standard has actual Backdeals before Summit',()=>{
 for(const [mode,indices] of Object.entries({quick:[0,2,4],standard:[0,2,3,4],full:[0,1,2,3,4]})){
  const ctx=setup({mode});let i=0;
  while(ctx.room.phase!=='finished'){
   assert.equal(ctx.room.currentIdx,indices[i]);assert.equal(state(ctx.host).totalRounds,indices.length);
   if(indices[i]===3){assert.equal(state(ctx.players[0]).round.id,'diplomacy');assert.equal(state(ctx.players[0]).myScenario!==null,true);}
   assert.ok(send(ctx.host,'host:reveal').ok);assert.ok(send(ctx.host,'host:next').ok);i++;
  }
  assert.equal(i,indices.length);assert.ok(send(ctx.host,'host:realityStart').ok);
 }
});
test('Manual is default: submissions and deadline do not reveal; host can reveal or extend',()=>{
 const {room,host,players}=setup({mode:'quick'});assert.equal(room.pacing,'manual');
 assert.ok(send(players[0],'player:submit',{optionIndex:1}).ok);assert.equal(room.phase,'active');assert.equal(room.transition,null);
 room.deadlineAt=Date.now()-10;game.refreshPacing(room);assert.equal(room.phase,'active');
 assert.equal(send(players[0],'player:submit',{optionIndex:1}).ok,false);
 assert.ok(send(host,'host:extend').ok);assert.equal(room.phase,'active');
 assert.ok(send(host,'host:reveal').ok);assert.equal(room.phase,'revealed');assert.equal(room.transition,null);
});
test('Auto reveals after a visible 3s countdown, but reveal-only leaves Next Round to host',async()=>{
 const {room,host,players}=setup({mode:'quick',pace:'auto'});
 assert.ok(send(players[0],'player:submit',{optionIndex:1}).ok);
 assert.equal(room.phase,'active');assert.equal(room.transition?.kind,'reveal');assert.equal(room.transition.durationMs,3000);
 assert.equal(state(players[0]).transition?.endsAt,state(host).transition?.endsAt);
 await sleep(3200);
 assert.equal(room.phase,'revealed');assert.equal(room.transition,null);
 await sleep(200);assert.equal(room.phase,'revealed');
});
test('Host Pause cancels countdown, switches to Manual, and may be re-enabled mid-game',()=>{
 const {room,host,players}=setup({mode:'standard',pace:'auto',ai:1});
 assert.ok(send(players[0],'player:submit',{optionIndex:1}).ok);assert.equal(room.transition?.kind,'reveal');
 assert.ok(room.submissions.has(1),'AI is accounted for immediately once human is ready');
 assert.ok(send(host,'host:pauseAuto').ok);assert.equal(room.pacing,'manual');assert.equal(room.transition,null);
 assert.equal(room.phase,'active');
 assert.ok(send(host,'host:setPacing',{pacing:'auto'}).ok);assert.equal(room.transition?.kind,'reveal');
 assert.ok(send(host,'host:reveal').ok);assert.equal(room.phase,'revealed');assert.equal(room.transition,null);
});
test('Reveal + Next advances after configurable reading time and respects mid-game switching',async()=>{
 const {room,host,players}=setup({pace:'auto',autoBehavior:'reveal_next',readingSeconds:5});
 assert.ok(send(players[0],'player:submit',{optionIndex:1}).ok);await sleep(3150);
 assert.equal(room.phase,'revealed');assert.equal(room.transition?.kind,'advance');assert.equal(room.transition.durationMs,5000);
 assert.equal(state(host).autoBehavior,'reveal_next');
 await sleep(5200);assert.equal(room.phase,'active');assert.equal(room.currentIdx,2);
 assert.equal(room.transition,null);
 assert.ok(send(host,'host:setPacing',{pacing:'manual'}).ok);
});
test('Auto debrief: reflection and dilemma use active connected participants; nobody sees answers before reveal',async()=>{
 const ctx=setup({humans:2,mode:'quick'});finishManually(ctx);assert.equal(ctx.room.phase,'finished');
 assert.ok(send(ctx.host,'host:realityStart').ok);assert.ok(send(ctx.host,'host:setPacing',{pacing:'auto',autoBehavior:'reveal_only'}).ok);
 const answers=['A change to the incentive system','The deal excluded local workers','Legitimacy requires safeguards'];
 assert.ok(send(ctx.players[0],'player:reflection',{answers}).ok);assert.equal(ctx.room.transition,null);
 assert.ok(send(ctx.players[1],'player:reflection',{answers}).ok);
 assert.equal(ctx.room.transition?.kind,'reveal');assert.equal(state(ctx.host).debrief.anonymousReflections,undefined);
 await sleep(3150);assert.equal(ctx.room.phase,'reality_responses');
 assert.ok(send(ctx.host,'host:realityNext').ok);assert.equal(ctx.room.phase,'reality_lessons');
 assert.ok(send(ctx.host,'host:realityNext').ok);assert.equal(ctx.room.phase,'reality_dilemma');
 assert.ok(send(ctx.players[0],'player:dilemmaVote',{optionIndex:1,reason:'Fair revenues'}).ok);assert.equal(ctx.room.transition,null);
 assert.ok(send(ctx.players[1],'player:dilemmaVote',{optionIndex:2,reason:'Inclusive process'}).ok);
 assert.equal(ctx.room.transition?.kind,'reveal');assert.equal(state(ctx.host).debrief.voteCounts,undefined);
 await sleep(3150);assert.equal(ctx.room.phase,'reality_dilemma_results');
 assert.equal(state(ctx.host).debrief.voteCounts.reduce((x,y)=>x+y.count,0),2);
});
test('Auto recalculates when a phone disconnects and when it reconnects',()=>{
 const ctx=setup({humans:2,mode:'quick',pace:'auto'});
 assert.ok(send(ctx.players[0],'player:submit',{optionIndex:1}).ok);assert.equal(ctx.room.transition,null);
 const saved=state(ctx.players[1]);const token=ctx.room.players.get(saved.myId).token;
 ctx.players[1].disconnect();assert.equal(ctx.room.transition?.kind,'reveal');assert.equal(state(ctx.host).activeTeamCount,1);
 const recovered=connect();assert.ok(send(recovered,'player:join',{code:ctx.room.code,token}).ok);
 assert.equal(ctx.room.transition,null,'returning active team cancels the pending countdown');
 assert.ok(send(recovered,'player:submit',{optionIndex:1}).ok);
 assert.equal(ctx.room.transition?.kind,'reveal');
});
test('No connected human teams cannot silently auto-finish a match',()=>{
 const ctx=setup({pace:'auto'});ctx.players[0].disconnect();assert.equal(ctx.room.transition,null);assert.equal(ctx.room.phase,'active');
});
