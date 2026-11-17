"use strict";
window.CEV={
 escape(v){return String(v??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#39;"}[c]));},
 fmt(n){return Number(n||0).toLocaleString("en-US",{maximumFractionDigits:2});},
 money(n){return `$${Number(n||0).toFixed(2)}B`;},
 timer(end,now){if(!end)return "—";const sec=Math.max(0,Math.ceil((end-now)/1000));return `${Math.floor(sec/60)}:${String(sec%60).padStart(2,"0")}`;},
 toast(message){const box=document.getElementById("toast");if(!box)return;box.textContent=message;box.classList.add("show");clearTimeout(window.__cevToast);window.__cevToast=setTimeout(()=>box.classList.remove("show"),3500);},
 statusText(s){return s?.strike?"ON STRIKE":s?.moraleStatus||"Stable";},
 bar(value,max=10,color="#68d9ac"){return `<span class="meter-track"><span class="meter-fill" style="width:${Math.max(0,Math.min(100,Number(value||0)*100/max))}%;background:${color}"></span></span>`;},
 safeUrl(s){return encodeURIComponent(s||"");}
};
