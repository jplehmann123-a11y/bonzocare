
const STORAGE_KEY = "bonzocare_entries_v1";
const PROFILE_KEY = "bonzocare_profile_v1";
const state = {
  entries: JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]"),
  profile: JSON.parse(localStorage.getItem(PROFILE_KEY) || '{"name":"Bonzo","birthday":"2025-03-23"}'),
  selections: {}
};

const $ = (id) => document.getElementById(id);
const views = {
  home: $("homeView"),
  entry: $("entryView"),
  history: $("historyView"),
  charts: $("chartsView"),
  settings: $("settingsView")
};

function localDateISO(date = new Date()) {
  const off = date.getTimezoneOffset();
  return new Date(date.getTime() - off * 60000).toISOString().slice(0,10);
}
function formatDate(iso) {
  return new Intl.DateTimeFormat("de-DE",{weekday:"short",day:"2-digit",month:"2-digit",year:"numeric"}).format(new Date(iso+"T12:00:00"));
}
function save() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state.entries));
  localStorage.setItem(PROFILE_KEY, JSON.stringify(state.profile));
}
function toast(msg){
  const el=$("toast"); el.textContent=msg; el.classList.add("show");
  clearTimeout(el._t); el._t=setTimeout(()=>el.classList.remove("show"),2200);
}
function navigate(name){
  Object.entries(views).forEach(([k,v])=>v.classList.toggle("active",k===name));
  document.querySelectorAll("[data-nav]").forEach(b=>b.classList.toggle("active",b.dataset.nav===name));
  if(name==="home") renderHome();
  if(name==="history") renderHistory();
  if(name==="charts") renderCharts();
  if(name==="settings") renderSettings();
  window.scrollTo({top:0,behavior:"smooth"});
}
document.querySelectorAll("[data-nav]").forEach(b=>b.addEventListener("click",()=>navigate(b.dataset.nav)));
$("settingsBtn").addEventListener("click",()=>navigate("settings"));
$("newEntryBtn").addEventListener("click",()=>openEntry());
$("cancelEntryBtn").addEventListener("click",()=>navigate("home"));

document.querySelectorAll(".segmented").forEach(group=>{
  group.addEventListener("click",e=>{
    const btn=e.target.closest("button"); if(!btn)return;
    group.querySelectorAll("button").forEach(x=>x.classList.remove("selected"));
    btn.classList.add("selected");
    state.selections[group.dataset.field]=btn.dataset.value;
  });
});

function openEntry(entry=null){
  $("entryForm").reset();
  state.selections={};
  document.querySelectorAll(".segmented button").forEach(b=>b.classList.remove("selected"));
  $("entryTitle").textContent=entry?"Eintrag bearbeiten":"Neuer Eintrag";
  $("entryId").value=entry?.id||"";
  $("date").value=entry?.date||localDateISO();
  ["weight","temperature","foodType","foodOffered","foodEaten","foodNotes","medications","notes"].forEach(k=>$(k).value=entry?.[k]??"");
  ["appetite","stool","water","mood","activity","vomiting"].forEach(k=>{
    if(entry?.[k]){
      state.selections[k]=entry[k];
      const b=document.querySelector(`.segmented[data-field="${k}"] button[data-value="${CSS.escape(entry[k])}"]`);
      if(b)b.classList.add("selected");
    }
  });
  navigate("entry");
}

$("entryForm").addEventListener("submit",e=>{
  e.preventDefault();
  const id=$("entryId").value || crypto.randomUUID();
  const entry={
    id,
    date:$("date").value,
    weight:numOrNull($("weight").value),
    temperature:numOrNull($("temperature").value),
    foodType:$("foodType").value.trim(),
    foodOffered:numOrNull($("foodOffered").value),
    foodEaten:numOrNull($("foodEaten").value),
    foodNotes:$("foodNotes").value.trim(),
    medications:$("medications").value.trim(),
    notes:$("notes").value.trim(),
    ...state.selections,
    updatedAt:new Date().toISOString()
  };
  const idx=state.entries.findIndex(x=>x.id===id);
  if(idx>=0) state.entries[idx]=entry; else state.entries.push(entry);
  state.entries.sort((a,b)=>b.date.localeCompare(a.date)||b.updatedAt.localeCompare(a.updatedAt));
  save(); toast("Eintrag gespeichert"); navigate("home");
});
function numOrNull(v){ return v===""?null:Number(String(v).replace(",",".")); }

function renderHome(){
  $("todayLabel").textContent=new Intl.DateTimeFormat("de-DE",{weekday:"long",day:"numeric",month:"long"}).format(new Date());
  const today=state.entries.find(e=>e.date===localDateISO());
  $("summaryText").textContent=today?"Der heutige Eintrag ist vollständig gespeichert.":"Noch kein Eintrag für heute.";
  $("statWeight").textContent=today?.weight!=null?`${today.weight.toFixed(2).replace(".",",")} kg`:"–";
  $("statFood").textContent=today?.foodEaten!=null?`${today.foodEaten} g`:"–";
  $("statStool").textContent=today?.stool||"–";
  $("statMood").textContent=today?.mood||"–";
  renderEntryCards($("recentEntries"),state.entries.slice(0,4));
}

function renderEntryCards(container,entries){
  if(!entries.length){container.innerHTML='<div class="entry-card"><span class="entry-note">Noch keine Einträge vorhanden.</span></div>';return;}
  container.innerHTML=entries.map(e=>{
    const pills=[];
    if(e.weight!=null)pills.push(`⚖️ ${e.weight.toFixed(2).replace(".",",")} kg`);
    if(e.foodEaten!=null)pills.push(`🍖 ${e.foodEaten} g`);
    if(e.stool)pills.push(`💩 ${esc(e.stool)}`);
    if(e.mood)pills.push(`😊 ${esc(e.mood)}`);
    if(e.vomiting&&e.vomiting!=="Nein")pills.push(`🤢 ${esc(e.vomiting)}`);
    return `<article class="entry-card">
      <div class="entry-top"><span class="entry-date">${formatDate(e.date)}</span><span>${e.appetite?esc(e.appetite):""}</span></div>
      <div class="entry-pills">${pills.map(p=>`<span class="pill">${p}</span>`).join("")}</div>
      ${e.foodType?`<div class="entry-note"><strong>Futtersorte:</strong> ${esc(e.foodType)}</div>`:""}
      ${e.foodNotes?`<div class="entry-note"><strong>Futter-Notiz:</strong> ${esc(e.foodNotes)}</div>`:""}
      ${e.notes?`<div class="entry-note">${esc(e.notes)}</div>`:""}
      ${e.medications?`<div class="entry-note"><strong>Medikamente:</strong> ${esc(e.medications)}</div>`:""}
      <div class="entry-actions">
        <button class="mini-btn" onclick="editEntry('${e.id}')">Bearbeiten</button>
        <button class="mini-btn delete" onclick="deleteEntry('${e.id}')">Löschen</button>
      </div>
    </article>`;
  }).join("");
}
window.editEntry=id=>openEntry(state.entries.find(e=>e.id===id));
window.deleteEntry=id=>{
  if(!confirm("Diesen Eintrag wirklich löschen?"))return;
  state.entries=state.entries.filter(e=>e.id!==id);save();renderHome();renderHistory();toast("Eintrag gelöscht");
};
function esc(s){return String(s).replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[m]));}

function filteredHistory(){
  const q=$("historySearch").value.trim().toLowerCase();
  const range=$("historyRange").value;
  let data=[...state.entries];
  if(range!=="all"){
    const cutoff=new Date(); cutoff.setDate(cutoff.getDate()-Number(range));
    data=data.filter(e=>new Date(e.date+"T12:00:00")>=cutoff);
  }
  if(q)data=data.filter(e=>JSON.stringify(e).toLowerCase().includes(q));
  return data;
}
function renderHistory(){renderEntryCards($("historyList"),filteredHistory());}
$("historySearch").addEventListener("input",renderHistory);
$("historyRange").addEventListener("change",renderHistory);
$("exportQuickBtn").addEventListener("click",exportJSON);

function rangeEntries(range){
  let data=[...state.entries].sort((a,b)=>a.date.localeCompare(b.date));
  if(range!=="all"){
    const cutoff=new Date();cutoff.setDate(cutoff.getDate()-Number(range));
    data=data.filter(e=>new Date(e.date+"T12:00:00")>=cutoff);
  }
  return data;
}
function renderCharts(){
  const data=rangeEntries($("chartRange").value);
  drawLineChart($("weightChart"),data.filter(e=>e.weight!=null).map(e=>({x:e.date,y:e.weight})),{
    suffix:" kg", empty:$("weightEmpty"), decimals:2
  });
  drawLineChart($("foodChart"),data.filter(e=>e.foodEaten!=null).map(e=>({x:e.date,y:e.foodEaten})),{
    suffix:" g", empty:$("foodEmpty"), decimals:0
  });
}
$("chartRange").addEventListener("change",renderCharts);
window.addEventListener("resize",()=>views.charts.classList.contains("active")&&renderCharts());

function drawLineChart(canvas,points,opt){
  const ratio=window.devicePixelRatio||1;
  const cssW=canvas.clientWidth||320, cssH=230;
  canvas.width=cssW*ratio;canvas.height=cssH*ratio;
  const ctx=canvas.getContext("2d");ctx.scale(ratio,ratio);ctx.clearRect(0,0,cssW,cssH);
  opt.empty.style.display=points.length<2?"block":"none";
  canvas.style.display=points.length<2?"none":"block";
  if(points.length<2)return;
  const pad={l:44,r:16,t:16,b:34};
  const ys=points.map(p=>p.y), min=Math.min(...ys), max=Math.max(...ys), span=max-min||1;
  ctx.font="12px -apple-system";ctx.strokeStyle="#e6d9cd";ctx.fillStyle="#746e66";ctx.lineWidth=1;
  for(let i=0;i<4;i++){
    const y=pad.t+(cssH-pad.t-pad.b)*(i/3);
    ctx.beginPath();ctx.moveTo(pad.l,y);ctx.lineTo(cssW-pad.r,y);ctx.stroke();
    const val=max-span*(i/3);ctx.fillText(val.toFixed(opt.decimals).replace(".",",")+opt.suffix,2,y+4);
  }
  const step=(cssW-pad.l-pad.r)/(points.length-1);
  ctx.strokeStyle="#a26b4b";ctx.lineWidth=3;ctx.lineJoin="round";ctx.beginPath();
  points.forEach((p,i)=>{
    const x=pad.l+i*step, y=pad.t+(max-p.y)/span*(cssH-pad.t-pad.b);
    i?ctx.lineTo(x,y):ctx.moveTo(x,y);
  });ctx.stroke();
  ctx.fillStyle="#a26b4b";
  points.forEach((p,i)=>{const x=pad.l+i*step,y=pad.t+(max-p.y)/span*(cssH-pad.t-pad.b);ctx.beginPath();ctx.arc(x,y,3.5,0,Math.PI*2);ctx.fill();});
  const labels=[0,Math.floor((points.length-1)/2),points.length-1];
  ctx.fillStyle="#746e66";ctx.textAlign="center";
  labels.forEach(i=>{const x=pad.l+i*step;ctx.fillText(points[i].x.slice(8,10)+"."+points[i].x.slice(5,7)+".",x,cssH-10);});
  ctx.textAlign="start";
}

function renderSettings(){
  $("dogName").value=state.profile.name||"Bonzo";
  $("dogBirthday").value=state.profile.birthday||"2025-03-23";
}
$("saveProfileBtn").addEventListener("click",()=>{
  state.profile={name:$("dogName").value.trim()||"Bonzo",birthday:$("dogBirthday").value};save();toast("Profil gespeichert");
});
$("exportJsonBtn").addEventListener("click",exportJSON);
function exportJSON(){
  download(`bonzocare-sicherung-${localDateISO()}.json`,JSON.stringify({profile:state.profile,entries:state.entries,exportedAt:new Date().toISOString()},null,2),"application/json");
}
$("importJsonInput").addEventListener("change",async e=>{
  const file=e.target.files[0];if(!file)return;
  try{
    const data=JSON.parse(await file.text());
    if(!Array.isArray(data.entries))throw new Error();
    state.entries=data.entries;state.profile=data.profile||state.profile;save();renderHome();toast("Sicherung importiert");
  }catch{alert("Die Datei konnte nicht gelesen werden.");}
  e.target.value="";
});
$("exportCsvBtn").addEventListener("click",()=>{
  const cols=["Datum","Gewicht_kg","Temperatur_C","Futtersorte","Futter_angeboten_g","Futter_gefressen_g","Futter_Notiz","Appetit","Stuhlgang","Wasser","Stimmung","Aktivität","Erbrechen","Medikamente","Notizen"];
  const rows=state.entries.map(e=>[e.date,e.weight,e.temperature,e.foodType,e.foodOffered,e.foodEaten,e.foodNotes,e.appetite,e.stool,e.water,e.mood,e.activity,e.vomiting,e.medications,e.notes]);
  const csv=[cols,...rows].map(r=>r.map(v=>`"${String(v??"").replaceAll('"','""')}"`).join(";")).join("\n");
  download(`bonzocare-${localDateISO()}.csv`,"\ufeff"+csv,"text/csv;charset=utf-8");
});
$("printBtn").addEventListener("click",()=>{navigate("history");setTimeout(()=>window.print(),300);});
$("deleteAllBtn").addEventListener("click",()=>{
  if(confirm("Wirklich alle Bonzo-Daten unwiderruflich löschen?")){
    state.entries=[];save();renderHome();toast("Alle Daten gelöscht");
  }
});
function download(name,content,type){
  const a=document.createElement("a");a.href=URL.createObjectURL(new Blob([content],{type}));a.download=name;a.click();URL.revokeObjectURL(a.href);
}

if("serviceWorker" in navigator)navigator.serviceWorker.register("sw.js").catch(()=>{});
renderHome();
