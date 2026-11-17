const test=require('node:test');const assert=require('node:assert/strict');const Module=require('node:module');
function createHarness(){
 const previous=Module._load;let fakeIO;
 const express=()=>{const f=()=>{};f.use=()=>{};f.disable=()=>{};f.get=()=>{};f.post=()=>{};return f;};express.json=()=>()=>{};express.static=()=>()=>{};
 class IO{constructor(){this.sockets={sockets:new Map()};this.handlers={};fakeIO=this;}on(name,fn){this.handlers[name]=fn;}}
 Module._load=function(name,parent,isMain){if(name==='express')return express;if(name==='socket.io')return{Server:IO};if(name==='qrcode')return{toString:async()=>'<svg/>'};return previous.apply(this,arguments);};
 const srv=require('../server');Module._load=previous;
 let seq=0;function connect(){const s={id:'socket-'+(++seq),connected:true,data:{},handlers:{},states:[],on(name,handler){this.handlers[name]=handler;},emit(name,payload){if(name==='room:state')this.states.push(payload);},join(){},leave(){},disconnect(){this.connected=false;this.handlers.disconnect?.();fakeIO.sockets.sockets.delete(this.id);}};fakeIO.sockets.sockets.set(s.id,s);fakeIO.handlers.connection(s);return s;}
 function send(s,event,payload={}){let result;const handler=s.handlers[event];assert.ok(handler,`event ${event} registered`);handler(payload,response=>{result=response;});return result;}
 function state(s){return s.states.at(-1);}
 function close(){for(const r of srv.rooms.values()){clearTimeout(r.timer);srv.cancelTransition(r);srv.clearAITimers(r);}srv.server.close();}
 return{srv,connect,send,state,close};}
const h=createHarness();
test.after(()=>h.close());
function start(players=4,mode='quick',teams=2){const r=h.srv.createRoom();const host=h.connect();const auth=h.send(host,'host:join',{code:r.code,key:r.ownerKey});assert.equal(auth.ok,true);assert.equal(h.send(host,'host:configure',{teamCount:teams,mode}).ok,true);const ps=[];for(let i=0;i<players;i++){const p=h.connect(),res=h.send(p,'player:join',{code:r.code,name:`Participant ${r.code} ${i}`});assert.equal(res.ok,true);ps.push(p);}return{r,host,ps};}
test('QR-style room joins, balanced random teams, shared story, separate secret mandates',()=>{
 const {r,host,ps}=start(7,'quick',3);assert.equal(h.send(host,'host:assign').ok,true);assert.equal(r.phase,'briefing');assert.deepEqual(r.teams.map(t=>t.memberIds.length).sort(),[2,2,3]);for(const p of ps){const s=h.state(p);assert.ok(s.story.some(line=>line.includes('2040')));assert.ok(s.myBrief?.mandate);assert.ok(s.myBrief?.secret);assert.equal(s.phase,'briefing');assert.equal(s.myTeamIndex!==null,true);assert.equal(h.send(p,'player:ready').ok,true);}assert.equal(h.state(host).allReady,true);assert.equal(h.send(host,'host:next').ok,true);assert.equal(r.currentIdx,0);assert.equal(h.state(ps[0]).myScenario.options.length,3);
 // All participants may see their team's portfolio; the host may not see private choices.
 for(const t of r.teams){const p=ps.find(s=>h.state(s).myTeamIndex===t.index);assert.equal(h.send(p,'player:submit',{optionIndex:1,note:'Keep talent engaged'}).ok,true);}assert.equal(r.phase,'active');assert.equal(h.send(host,'host:reveal').ok,true);assert.equal(h.state(host).result.results.length,3);assert.ok(r.teams.every(t=>t.stats.capital>0));assert.ok(h.state(host).standings[0].score>0);
});
test('income compounds; severe wage cuts trigger strikes and stop passive income; mediation can reopen work',()=>{
 const {r,host,ps}=start(2,'full',1);assert.ok(h.send(host,'host:assign').ok);for(const p of ps)h.send(p,'player:ready');h.send(host,'host:next');
 const t=r.teams[0],p=ps[0],capital=t.stats.capital;
 h.send(p,'player:submit',{optionIndex:0});h.send(host,'host:reveal');assert.equal(r.phase,'revealed');assert.ok(t.stats.capital>capital-.35);
 h.send(host,'host:next');assert.equal(r.currentIdx,1);h.send(p,'player:submit',{optionIndex:0});h.send(host,'host:reveal');assert.equal(r.phase,'revealed');assert.equal(t.strike,true);assert.equal(t.lastIncome,0);
 h.send(host,'host:next');assert.equal(r.currentIdx,2);const res=h.send(p,'player:resolveStrike',{method:'wages'});assert.equal(res.ok,true);assert.equal(t.strike,false);assert.ok(t.stats.morale>=45);h.send(p,'player:submit',{optionIndex:1});h.send(host,'host:reveal');assert.equal(r.phase,'revealed');assert.ok(t.lastIncome>0);
});
test('teams can trade by private offers, offers not visible publicly until reveal, independent VC ratings',()=>{
 const {r,host,ps}=start(4,'full',2);h.send(host,'host:assign');for(const p of ps)h.send(p,'player:ready');h.send(host,'host:next');
 for(let n=0;n<3;n++){h.srv.reveal(r);h.send(host,'host:next');}
 assert.equal(r.currentIdx,3);const p0=ps.find(p=>h.state(p).myTeamIndex===0),p1=ps.find(p=>h.state(p).myTeamIndex===1);
 const sent=h.send(p0,'player:offer',{target:1,kind:'alliance'});assert.equal(sent.ok,true);assert.equal(h.state(host).pendingOffers,1);assert.equal(h.state(host).result,null);const incoming=h.state(p1).myOffers.find(o=>o.status==='pending');assert.ok(incoming);assert.equal(h.send(p1,'player:respondOffer',{offerId:incoming.id,accept:true}).ok,true);
 h.send(p0,'player:submit',{optionIndex:1});h.send(p1,'player:submit',{optionIndex:1});h.send(host,'host:reveal');assert.equal(r.phase,'revealed');assert.equal(h.state(host).result.deals.length,1);assert.match(h.state(host).result.deals[0].description,/signed a monitored cooperation/);
 assert.equal(h.send(host,'host:rate',{teamIndex:0,metric:'profit',rating:4}).ok,true);assert.equal(h.state(host).teams[0].vc.profit,4);
});
test('quick mode skips rounds 2 and 4 and finishes on summit',()=>{
 const {r,host,ps}=start(3,'quick',1);h.send(host,'host:assign');for(const p of ps)h.send(p,'player:ready');h.send(host,'host:next');assert.equal(r.currentIdx,0);h.srv.reveal(r);h.send(host,'host:next');assert.equal(r.currentIdx,2);h.srv.reveal(r);h.send(host,'host:next');assert.equal(r.currentIdx,4);h.srv.reveal(r);h.send(host,'host:next');assert.equal(r.phase,'finished');assert.ok(h.state(ps[0]).standings[0].archetype);
});
test('intel investment unlocks advanced option and warns player; regional collapse triggers crisis',()=>{
 const {r,host,ps}=start(2,'quick',1);h.send(host,'host:assign');for(const p of ps)h.send(p,'player:ready');h.send(host,'host:next');
 const p=ps[0];h.send(p,'player:submit',{optionIndex:2});h.send(host,'host:reveal');assert.equal(r.teams[0].stats.intel,6);h.send(host,'host:next');
 assert.equal(h.state(p).myScenario.options.length,4);assert.match(h.state(p).myScenario.intelWarning,/INTEL LEAK/);assert.equal(h.send(p,'player:submit',{optionIndex:3}).ok,true);h.send(host,'host:reveal');assert.equal(r.phase,'revealed');assert.equal(r.teams[0].stats.intel,4);
});
