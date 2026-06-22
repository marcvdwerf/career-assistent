import { useState, useEffect } from "react";

// ─── DESIGN TOKENS ───────────────────────────────────────────────────────────
const C = {
  bg: "#0d1117", surface: "#161b22", card: "#1c2333",
  border: "rgba(255,255,255,0.08)", accent: "#58a6ff",
  accentDim: "rgba(88,166,255,0.1)", accentBorder: "rgba(88,166,255,0.22)",
  green: "#3fb950", greenDim: "rgba(63,185,80,0.1)",
  yellow: "#e3b341", yellowDim: "rgba(227,179,65,0.1)",
  red: "#f85149", redDim: "rgba(248,81,73,0.1)",
  purple: "#bc8cff", purpleDim: "rgba(188,140,255,0.1)",
  orange: "#ff9f43", orangeDim: "rgba(255,159,67,0.1)",
  text: "#e6edf3", muted: "#7d8590", subtle: "#21262d",
};

const SECTION_COLORS = {
  "Wie ben jij?":             { color: C.accent,  bg: C.accentDim },
  "Jouw superkrachten":       { color: C.green,   bg: C.greenDim },
  "Jouw valkuilen":           { color: C.yellow,  bg: C.yellowDim },
  "Wat jou energie geeft ⚡": { color: C.orange,  bg: C.orangeDim },
  "Wat energie kost 🪫":      { color: C.red,     bg: C.redDim },
  "Jouw hobby's als spiegel": { color: C.purple,  bg: C.purpleDim },
  "Waar jij naartoe gaat":    { color: C.green,   bg: C.greenDim },
};

// ─── FLOW ────────────────────────────────────────────────────────────────────
const FLOW = [
  { id:"intro", type:"intro", emoji:"👋", title:"Even eerlijk zijn tegen jezelf.", sub:"Dit is geen saai formulier. Dit is een gesprek.\n\nAan het einde weet je precies wat voor werk bij jou past, waar je energie van krijgt — en wat je absoluut moet vermijden.\n\nDuurt zo'n 5 minuten. En het is de moeite waard.", cta:"Laten we gaan →" },
  { id:"naam", type:"text", block:"Wie ben jij?", emoji:"🙂", vraag:"Hoe heet je?", sub:"Gewoon je voornaam is prima.", placeholder:"bijv. Sophie", field:"naam" },
  { id:"leeftijd", type:"single", block:"Wie ben jij?", emoji:"📅", vraag:(p)=>`${p.naam}, hoe oud ben je?`, sub:"Niet om te oordelen — puur voor context.", field:"leeftijd", options:["18–24","25–30","31–35","36–42","43–50","50+"] },
  { id:"werkervaring_jaren", type:"single", block:"Wie ben jij?", emoji:"💼", vraag:"Hoeveel jaar werkervaring heb je?", sub:"Inclusief stages & bijbanen.", field:"werkErvaringJaren", options:["Ik begin net","1–3 jaar","3–6 jaar","6–10 jaar","10–15 jaar","15+ jaar"] },
  { id:"werk_nu", type:"textarea", block:"Wie ben jij?", emoji:"📍", vraag:"Wat doe je op dit moment voor werk?", sub:"Als je niet werkt: wat deed je het laatst?", placeholder:"bijv. Ik werk als accountmanager maar zit er niet helemaal op mijn plek...", field:"werkNu" },
  { id:"opleiding", type:"textarea", block:"Wie ben jij?", emoji:"🎓", vraag:"Wat heb je gestudeerd of geleerd?", sub:"Formeel of informeel — alles telt.", placeholder:"bijv. HBO Commerciële Economie, verder veel zelf geleerd...", field:"opleiding" },
  { id:"moment_trots", type:"textarea", block:"Jouw karakter", emoji:"🏆", vraag:"Noem één moment uit je werk- of studietijd waar je echt trots op bent.", sub:"Groot of klein — wat voelde goed? Waarom?", placeholder:"bijv. Ik organiseerde een event voor 200 mensen terwijl mijn leidinggevende uitviel...", field:"momentTrots" },
  { id:"moment_energy", type:"textarea", block:"Jouw karakter", emoji:"⚡", vraag:"Vertel over een dag waarop je met energie thuiskwam.", sub:"Wat deed je die dag? Wat maakte het zo goed?", placeholder:"bijv. Een dag vol klantgesprekken en daarna een nieuw idee uitwerken met het team...", field:"momentEnergie" },
  { id:"moment_dip", type:"textarea", block:"Jouw karakter", emoji:"🪫", vraag:"En een dag waarop je leeg thuiskwam — wat maakte dat zo zwaar?", sub:"Eerlijkheid hier is goud waard.", placeholder:"bijv. Vergaderen over niets, daarna eindeloos rapporteren...", field:"momentDip" },
  { id:"intro_extravert", type:"scale", block:"Jouw karakter", emoji:"🎭", vraag:"Hoe introvert of extravert ben jij?", sub:"Geen goed of fout — het gaat om zelfinzicht.", field:"introExtravert", leftLabel:"😶 Introvert\n(laad op in stilte, liever diepgang)", rightLabel:"Extravert 🎉\n(energie van mensen om je heen)", steps:7 },
  { id:"creatief_analytisch", type:"scale", block:"Jouw karakter", emoji:"🧠", vraag:"Ben je meer creatief of analytisch ingesteld?", sub:"Waar gaat je hoofd naartoe als je een probleem ziet?", field:"creatiefAnalytisch", leftLabel:"🎨 Creatief\n(ideeën, gevoel, associaties)", rightLabel:"📊 Analytisch\n(data, structuur, logica)", steps:7 },
  { id:"strategisch_operationeel", type:"scale", block:"Jouw karakter", emoji:"♟️", vraag:"Lig jij wakker van het grote plaatje of van de uitvoering?", field:"strategischOperationeel", leftLabel:"♟️ Strategisch\n(visie, richting, waarom)", rightLabel:"⚙️ Operationeel\n(hoe, details, uitvoering)", steps:7 },
  { id:"sterke_punten", type:"multi", block:"Wat jou onderscheidt", emoji:"💪", vraag:"Wat zijn jouw echte krachten?", sub:"Kies wat echt klopt — niet wat er professioneel uitziet.", field:"sterkePunten", options:["🚀 Nieuwe dingen bedenken & starten","🤝 Mensen meekrijgen & overtuigen","🔍 Dingen tot op de bodem uitzoeken","⚡ Snel schakelen onder druk","🎨 Creatieve oplossingen vinden","📊 Data begrijpen & gebruiken","🌍 In nieuwe omgevingen gedijen","🧩 Complexe dingen versimpelen","💬 Helder communiceren","🏗️ Structuur brengen in chaos","🌱 Mensen laten groeien","🎯 Focus houden op het doel","🤲 Samenwerken & verbinden","🛠️ Dingen zelf bouwen & fixen"] },
  { id:"valkuilen", type:"multi", block:"Wat jou onderscheidt", emoji:"🪤", vraag:"En wat zijn jouw valkuilen? Wees eerlijk.", sub:"Iedereen heeft ze. Degenen die ze kennen zijn een stap voor.", field:"valkuilen", options:["😵‍💫 Te veel tegelijk willen","🐢 Uitstellen wat moeilijk voelt","🪞 Te hard zijn voor mezelf","🗣️ Moeite om nee te zeggen","🔁 Dingen willen perfectioneren","💬 Niet snel genoeg zeggen wat ik denk","📋 Details verliezen uit het oog","🌫️ Ongeduldig bij trage processen","🧱 Moeite met autoriteit zonder inhoud","😟 Gevoelig voor wat anderen vinden","🔋 Snel afgeleid door nieuwe ideeën"] },
  { id:"vaardigheden_heb", type:"multi", block:"Wat jou onderscheidt", emoji:"🛠️", vraag:"Welke vaardigheden heb je al goed ontwikkeld?", sub:"Alles telt — ook buiten werk.", field:"vaardighedenHeb", options:["📈 Commercie & sales","🤝 Onderhandelen","📣 Presenteren & pitchen","✍️ Schrijven & content","📊 Data & Excel","💻 Programmeren / tech","🎨 Design & visueel","📱 Social media & marketing","🌍 Internationale communicatie","🗂️ Projectmanagement","👥 Leidinggeven","🧘 Klantrelaties beheren","🔧 Operationele processen","💰 Finance & budgettering"] },
  { id:"vaardigheden_wil", type:"multi", block:"Wat jou onderscheidt", emoji:"🌱", vraag:"Wat wil je de komende jaren echt ontwikkelen?", sub:"Dit is geen zwakte — dit is richting.", field:"vaardighedenWil", options:["📈 Commercie & sales","🤝 Onderhandelen","📣 Presenteren & pitchen","✍️ Schrijven & content","📊 Data & Excel","💻 Programmeren / tech","🎨 Design & visueel","📱 Social media & marketing","🌍 Internationale communicatie","🗂️ Projectmanagement","👥 Leidinggeven","🧘 Klantrelaties beheren","🔧 Operationele processen","💰 Finance & budgettering"] },
  { id:"energie_geeft", type:"multi", block:"Jouw energie", emoji:"🔋", vraag:"Wat geeft jou energie op het werk?", sub:"Denk aan momenten waarop de tijd voorbij vloog.", field:"energieGeeft", options:["🚀 Iets nieuws bouwen van nul","🌍 Internationaal werken","💬 Diep contact met klanten of collega's","🎯 Zelfstandig werken zonder toezicht","🧠 Complexe problemen oplossen","✈️ Reizen als onderdeel van werk","🎨 Creatieve vrijheid","💥 Directe, zichtbare impact","📢 Iets pitchen of presenteren","🤝 Mensen bij elkaar brengen","📊 Dingen meten & verbeteren","🌱 Iemand zien groeien door jou","⚡ Hoog tempo & deadlines","🏗️ Structuur brengen in chaos"] },
  { id:"energie_vreet", type:"multi", block:"Jouw energie", emoji:"🪫", vraag:"En wat vreet jou energie?", sub:"Wat maakt dat je 's avonds leeg bent?", field:"energieVreet", options:["👀 Micromanagement","🔁 Iedere dag precies hetzelfde","📅 Vergaderen zonder doel","🏛️ Bureaucratie & trage systemen","🔒 Geen ruimte voor initiatief","🐢 Trage beslissingen","🌫️ Werk zonder zichtbaar resultaat","😐 Omgevingen zonder ambitie","📦 Hokjesdenken & rigide regels","🧊 Koud, onpersoonlijk klimaat","🔇 Geen feedback of erkenning","📋 Veel hiërarchie & protocol"] },
  { id:"hobbies", type:"multi", block:"Buiten werktijd", emoji:"🎯", vraag:"Wat doe jij buiten werk?", sub:"Hobby's zeggen enorm veel over wie je bent en wat voor werk bij je past.", field:"hobbies", options:["⚽ Teamsport","🏋️ Individuele sport / fitness","✈️ Reizen (ver weg)","🍳 Koken & eten ontdekken","🎵 Muziek maken of luisteren","🎨 Creatief: schrijven, tekenen, foto's","🎮 Gamen","📚 Lezen","🎙️ Podcasts & documentaires","🌱 Iets opbouwen (project, onderneming)","🧘 Meditatie / mindfulness","🤝 Vrijwilligerswerk / community","🌍 Culturen ontdekken","💡 Altijd bezig met nieuwe ideeën"] },
  { id:"reizen", type:"single", block:"Buiten werktijd", emoji:"✈️", vraag:"Hoe sta jij tegenover reizen voor werk?", field:"reizen", options:["✈️ Ja graag, hoe meer hoe beter","🗺️ Af en toe prima","🏠 Liever niet — ik ben graag thuis","🌍 Alleen internationaal, dat vind ik leuk"] },
  { id:"bedrijf_type", type:"single", block:"Jouw perfecte omgeving", emoji:"🏠", vraag:"In wat voor bedrijf gedij jij het beste?", field:"bedrijfType", options:["🌱 Start-up — alles bouwen, veel chaos, hoge energie","🚀 Scale-up — groei, momentum, nog persoonlijk","🏠 MKB — overzichtelijk, bekende gezichten","🏛️ Corporate — structuur, naam, groot netwerk","🎯 Maakt me niet uit — als de rol maar klopt"] },
  { id:"team_grootte", type:"single", block:"Jouw perfecte omgeving", emoji:"👥", vraag:"Hoe groot is jouw ideale team?", field:"teamGrootte", options:["🔥 Klein & hecht (2–5)","⚡ Middelgroot (5–15)","🏢 Groot (15+)","🎧 Liever solo met losse samenwerking","🌊 Wisselend per project"] },
  { id:"manager_type", type:"single", block:"Jouw perfecte omgeving", emoji:"🧭", vraag:"Wat voor manager haal jij het beste uit jezelf bij?", field:"managerType", options:["🤝 Vertrouwt me blind — check-in op resultaat","🧠 Denkt mee als sparringpartner","📋 Geeft duidelijke kaders en verwachtingen","🌱 Investeert actief in mijn groei","👫 Voelt meer als collega dan als baas"] },
  { id:"cultuur", type:"multi", block:"Jouw perfecte omgeving", emoji:"🎭", vraag:"Welke bedrijfscultuur past bij jou? (max 3)", sub:"Kies wat echt onmisbaar is.", field:"cultuur", max:3, options:["😄 Informeel & direct","🌏 Internationaal georiënteerd","💚 Maatschappelijke impact","🧪 Experimenteel & innovatief","🏆 Resultaatgericht","👨‍👩‍👧 Familiaire sfeer","🎭 Creatieve industrie","⚡ Snelle beslissingen","🌈 Diversiteit & inclusie","📈 Groei & ambitie centraal"] },
  { id:"droom_functie", type:"textarea", block:"Waar wil je naartoe?", emoji:"🌟", vraag:"Als geld geen rol speelde — wat zou je dan doen?", sub:"Geen druk. Dit is puur voor jezelf.", placeholder:"bijv. Ik zou mensen begeleiden bij grote levensbeslissingen, of een eigen platform bouwen...", field:"droomFunctie" },
  { id:"korte_termijn", type:"single", block:"Waar wil je naartoe?", emoji:"📍", vraag:"Wat is jouw prioriteit voor de komende 2 jaar?", field:"kortetermijn", options:["💰 Meer verdienen","📈 Groeien naar een hogere rol","🌍 Internationaal werken","🎯 Eindelijk werk doen wat bij me past","🧠 Een specifieke vaardigheid meesteren","🚀 Iets opbouwen","⚖️ Betere balans werk & privé"] },
  { id:"salaris", type:"single", block:"Waar wil je naartoe?", emoji:"💶", vraag:"Wat is jouw salarisondergrens? (netto per maand)", field:"salaris", options:["< €2.000","€2.000–€2.800","€2.800–€3.500","€3.500–€4.500","€4.500–€6.000","> €6.000"] },
  { id:"locatie", type:"single", block:"Waar wil je naartoe?", emoji:"📍", vraag:"Waar wil je werken?", field:"locatie", options:["🏠 Volledig remote","🔀 Hybride (deels thuis)","🏢 Liever op kantoor","🌍 Internationaal — geen probleem","🚗 Max 45 min van huis"] },
  { id:"klaar", type:"generating", emoji:"✨", title:"Perfect. We gaan aan de slag.", sub:"Op basis van jouw antwoorden maken we nu je volledige profielschets en functiematches." },
];

const QUESTION_SCREENS = FLOW.filter(f => !["intro","generating"].includes(f.type));

// ─── STYLE HELPERS ───────────────────────────────────────────────────────────
const inp = { width:"100%", background:C.card, border:`1px solid ${C.border}`, borderRadius:12, padding:"13px 15px", color:C.text, fontSize:15, outline:"none", boxSizing:"border-box", fontFamily:"inherit", lineHeight:1.6 };
const primaryBtn = (on) => ({ padding:"13px 28px", borderRadius:12, border:"none", fontSize:15, fontWeight:700, cursor:on?"pointer":"not-allowed", background:on?"linear-gradient(135deg,#1f6feb,#58a6ff)":C.subtle, color:on?"#fff":C.muted, transition:"all 0.2s", letterSpacing:"-0.01em", boxShadow:on?"0 4px 20px rgba(88,166,255,0.2)":"none" });
const ghostBtn = { padding:"12px 20px", borderRadius:12, border:`1px solid ${C.border}`, background:"transparent", color:C.muted, fontSize:14, cursor:"pointer", fontFamily:"inherit", fontWeight:500 };

// ─── LOCAL PERSISTENCE ───────────────────────────────────────────────────────
const STORAGE_KEY = "career_assistant_v2";

function loadSaved() {
  try { const raw = localStorage.getItem(STORAGE_KEY); return raw ? JSON.parse(raw) : null; }
  catch { return null; }
}

function getInitialState() {
  const saved = loadSaved();
  if (!saved) return { screen:0, answers:{}, result:null, docsByMatch:{} };
  if (saved.result) return { screen:FLOW.length, answers:saved.answers||{}, result:saved.result, docsByMatch:saved.docsByMatch||{} };
  // Nooit herstellen OP het generating-scherm zelf
  const safeScreen = Math.min(saved.screen ?? 0, FLOW.length - 2);
  return { screen:safeScreen, answers:saved.answers||{}, result:null, docsByMatch:{} };
}

// ─── API (via serverless proxy — key blijft server-side) ─────────────────────
async function callOpenRouter(prompt, { maxTokens=1000, jsonMode=false }={}) {
  const res = await fetch("/api/openrouter", {
    method:"POST",
    headers:{ "Content-Type":"application/json" },
    body:JSON.stringify({ messages:[{ role:"user", content:prompt }], maxTokens, jsonMode }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "API fout");
  return data.choices?.[0]?.message?.content || "";
}

function parseMatches(raw) {
  try {
    const clean = raw.replace(/```json|```/g,"").trim();
    const parsed = JSON.parse(clean);
    if (Array.isArray(parsed)) return parsed;
    if (parsed && Array.isArray(parsed.matches)) return parsed.matches;
  } catch {}
  try {
    const s = raw.indexOf("["); const e = raw.lastIndexOf("]");
    if (s !== -1 && e !== -1) return JSON.parse(raw.slice(s,e+1));
  } catch {}
  return [];
}

// ─── PROMPTS ─────────────────────────────────────────────────────────────────
function buildProfilePrompt(p) {
  return `Je bent een scherpe, eerlijke carrièrecoach. Schrijf een persoonlijke profielschets op basis van deze antwoorden. Schrijf in de tweede persoon ("jij", "jouw"). Direct, warm, concreet. Geen fluff.

ANTWOORDEN:
Naam: ${p.naam||"?"} | Leeftijd: ${p.leeftijd||"?"} | Ervaring: ${p.werkErvaringJaren||"?"}
Huidige situatie: ${p.werkNu||"?"} | Opleiding: ${p.opleiding||"?"}
Trots moment: ${p.momentTrots||"?"} | Energie-dag: ${p.momentEnergie||"?"} | Lege-dag: ${p.momentDip||"?"}
Introvert/Extravert (1-7): ${p.introExtravert||4} | Creatief/Analytisch: ${p.creatiefAnalytisch||4} | Strategisch/Operationeel: ${p.strategischOperationeel||4}
Sterke punten: ${(p.sterkePunten||[]).join(", ")} | Valkuilen: ${(p.valkuilen||[]).join(", ")}
Vaardigheden heeft: ${(p.vaardighedenHeb||[]).join(", ")} | Wil leren: ${(p.vaardighedenWil||[]).join(", ")}
Energie van: ${(p.energieGeeft||[]).join(", ")} | Energie-killers: ${(p.energieVreet||[]).join(", ")}
Hobby's: ${(p.hobbies||[]).join(", ")} | Reizen: ${p.reizen||"?"}
Bedrijfstype: ${p.bedrijfType||"?"} | Team: ${p.teamGrootte||"?"} | Manager: ${p.managerType||"?"} | Cultuur: ${(p.cultuur||[]).join(", ")}
Droomfunctie: ${p.droomFunctie||"?"} | Prioriteit: ${p.kortetermijn||"?"} | Salaris: ${p.salaris||"?"} | Locatie: ${p.locatie||"?"}

Schrijf de schets met EXACT deze headers (gebruik ## ervoor):

## Wie ben jij?
## Jouw superkrachten
## Jouw valkuilen
## Wat jou energie geeft ⚡
## Wat energie kost 🪫
## Jouw hobby's als spiegel
## Waar jij naartoe gaat`;
}

function buildMatchPrompt(p) {
  return `Geef 4 functie/sector-matches op basis van dit profiel. Reageer ALLEEN met een geldig JSON-object, geen uitleg, geen markdown.

Profiel: ${(p.sterkePunten||[]).slice(0,4).join(", ")}. Energie: ${(p.energieGeeft||[]).slice(0,3).join(", ")}. Killers: ${(p.energieVreet||[]).slice(0,3).join(", ")}. Cultuur: ${(p.cultuur||[]).join(", ")}. Skills: ${(p.vaardighedenHeb||[]).slice(0,4).join(", ")}. Wil leren: ${(p.vaardighedenWil||[]).slice(0,3).join(", ")}. Droom: ${p.droomFunctie||"?"}. Bedrijf: ${p.bedrijfType||"?"}. Locatie: ${p.locatie||"Nederland"}.

Geef een JSON-object met een "matches" array van 4 objecten:
{"matches":[{"functie":"Functietitel","sector":"Sector naam","fit":85,"waarom":"1 zin waarom dit past","energie":"Hoog/Middel/Laag — korte toelichting","risico":"1 concreet aandachtspunt","zoekUrl":"https://www.linkedin.com/jobs/search/?keywords=Functietitel&location=Netherlands"}]}`;
}

function buildCVPrompt(p, functie) {
  return `Schrijf een CV-profiel van 4-5 zinnen voor iemand die solliciteert als ${functie}. Persoonlijk, energiek, geen clichés. Begin met wie de persoon is, niet wat ze deden. Verwerk een concreet detail. Geen "gedreven professional".

Profiel: trots op: ${p.momentTrots||"?"}. Sterke punten: ${(p.sterkePunten||[]).slice(0,4).join(", ")}. Skills: ${(p.vaardighedenHeb||[]).slice(0,4).join(", ")}. Energie van: ${(p.energieGeeft||[]).slice(0,3).join(", ")}. Hobby's: ${(p.hobbies||[]).slice(0,3).join(", ")}.

OUTPUT: alleen het CV-profiel, niets anders.`;
}

function buildBriefPrompt(p, match, vacatureTekst) {
  return `Schrijf een sollicitatiebrief voor een sollicitatie als ${match.functie} in de ${match.sector} sector. Persoonlijk, direct, menselijk. NIET beginnen met "Hierbij solliciteer ik". Concrete voorbeelden gebruiken. Warm maar zelfverzekerd afsluiten.

Profiel: trots moment: ${p.momentTrots||"?"}. Energie-dag: ${p.momentEnergie||"?"}. Sterke punten: ${(p.sterkePunten||[]).join(", ")}. Valkuil + aanpak: ${(p.valkuilen||[]).slice(0,2).join(", ")}. Wil leren: ${(p.vaardighedenWil||[]).slice(0,3).join(", ")}. Cultuurfit: ${(p.cultuur||[]).join(", ")}.
${vacatureTekst ? `\nVacaturetekst: ${vacatureTekst}` : ""}

Structuur: 1) Opening die pakt 2) Concrete werkervaring met echt voorbeeld 3) Wat jij toevoegt 4) Warme directe afsluiting.

OUTPUT: alleen de brief.`;
}

// ─── UI COMPONENTS ───────────────────────────────────────────────────────────
function ProgressBar({ current, total }) {
  return (
    <div style={{ marginBottom:28 }}>
      <div style={{ display:"flex", justifyContent:"space-between", marginBottom:6 }}>
        <span style={{ fontSize:11, color:C.accent, fontWeight:700 }}>Stap {current} van {total}</span>
      </div>
      <div style={{ height:3, background:C.subtle, borderRadius:3 }}>
        <div style={{ height:"100%", width:`${(current/total)*100}%`, background:`linear-gradient(90deg,#388bfd,${C.accent})`, borderRadius:3, transition:"width 0.4s ease" }} />
      </div>
    </div>
  );
}

function BlockLabel({ label }) {
  return (
    <div style={{ fontSize:11, fontWeight:700, color:C.accent, textTransform:"uppercase", letterSpacing:"0.1em", marginBottom:18, display:"flex", alignItems:"center", gap:8 }}>
      <div style={{ flex:1, height:1, background:C.border }} />{label}<div style={{ flex:1, height:1, background:C.border }} />
    </div>
  );
}

function OptionBtn({ label, active, onClick }) {
  return (
    <div onClick={onClick} style={{ padding:"13px 16px", borderRadius:12, cursor:"pointer", border:`1px solid ${active?C.accentBorder:C.border}`, background:active?C.accentDim:C.card, color:active?C.accent:C.text, fontWeight:active?600:400, fontSize:14, transition:"all 0.15s", userSelect:"none", display:"flex", alignItems:"center", gap:10 }}>
      <div style={{ width:18, height:18, borderRadius:"50%", flexShrink:0, border:`2px solid ${active?C.accent:C.muted}`, background:active?C.accent:"transparent", display:"flex", alignItems:"center", justifyContent:"center" }}>
        {active && <div style={{ width:6, height:6, borderRadius:"50%", background:C.bg }} />}
      </div>
      {label}
    </div>
  );
}

function MultiBtn({ label, active, onClick, disabled }) {
  return (
    <div onClick={()=>!disabled&&onClick()} style={{ padding:"9px 14px", borderRadius:100, cursor:disabled?"default":"pointer", border:`1px solid ${active?C.accentBorder:C.border}`, background:active?C.accentDim:C.card, color:active?C.accent:disabled?C.muted:C.text, fontWeight:active?600:400, fontSize:13, transition:"all 0.15s", userSelect:"none", opacity:disabled&&!active?0.35:1, display:"inline-flex", alignItems:"center", gap:6 }}>
      {active&&<span>✓</span>}{label}
    </div>
  );
}

function ScaleInput({ value, onChange, leftLabel, rightLabel, steps=7 }) {
  return (
    <div>
      <div style={{ display:"flex", gap:8, justifyContent:"center", marginBottom:14 }}>
        {Array.from({length:steps},(_,i)=>i+1).map(n=>(
          <div key={n} onClick={()=>onChange(n)} style={{ width:44, height:44, borderRadius:12, cursor:"pointer", border:`2px solid ${value===n?C.accentBorder:C.border}`, background:value===n?C.accentDim:C.card, display:"flex", alignItems:"center", justifyContent:"center", fontWeight:value===n?700:400, fontSize:15, color:value===n?C.accent:C.muted, transition:"all 0.15s" }}>{n}</div>
        ))}
      </div>
      <div style={{ display:"flex", justifyContent:"space-between", gap:20 }}>
        {[leftLabel,rightLabel].map((lbl,i)=>(
          <div key={i} style={{ fontSize:12, color:C.muted, lineHeight:1.5, textAlign:i===0?"left":"right", whiteSpace:"pre-line", flex:1 }}>{lbl}</div>
        ))}
      </div>
    </div>
  );
}

// ─── MAIN ────────────────────────────────────────────────────────────────────
export default function CareerAssistant() {
  const [initial] = useState(getInitialState);

  const [screen, setScreen]           = useState(initial.screen);
  const [answers, setAnswers]         = useState(initial.answers);
  const [result, setResult]           = useState(initial.result);
  const [docsByMatch, setDocsByMatch] = useState(initial.docsByMatch);

  const [loading, setLoading]           = useState(false);
  const [loadingStep, setLoadingStep]   = useState(0);
  const [flowError, setFlowError]       = useState(null);

  const [activeMatchIdx, setActiveMatchIdx]   = useState(null);
  const [pendingMatchIdx, setPendingMatchIdx] = useState(null);
  const [vacTekstDraft, setVacTekstDraft]     = useState("");
  const [genStep, setGenStep]                 = useState(null);
  const [genError, setGenError]               = useState(null);
  const [matchesRegenerating, setMatchesRegenerating] = useState(false);

  // Auto-save bij elke state wijziging
  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify({ screen, answers, result, docsByMatch })); }
    catch {}
  }, [screen, answers, result, docsByMatch]);

  const current = FLOW[screen];
  const questionIndex = FLOW.slice(0,screen+1).filter(f=>!["intro","generating"].includes(f.type)).length;
  const totalQuestions = QUESTION_SCREENS.length;

  const set = (field, value) => setAnswers(a=>({...a,[field]:value}));
  const toggleMulti = (field, val, max) => {
    const cur = answers[field]||[];
    if (cur.includes(val)) set(field, cur.filter(v=>v!==val));
    else if (!max||cur.length<max) set(field, [...cur,val]);
  };

  const canNext = () => {
    if (!current) return false;
    if (["intro","generating"].includes(current.type)) return true;
    const val = answers[current.field];
    if (current.type==="text"||current.type==="textarea") return val&&val.trim().length>1;
    if (current.type==="single") return !!val;
    if (current.type==="scale") return !!val;
    if (current.type==="multi") return (val||[]).length>0;
    return true;
  };

  const generate = async () => {
    setLoading(true); setFlowError(null);
    try {
      setLoadingStep(0);
      const profileText = await callOpenRouter(buildProfilePrompt(answers), { maxTokens:1000 });
      setLoadingStep(1);
      const matchRaw = await callOpenRouter(buildMatchPrompt(answers), { maxTokens:1500, jsonMode:true });
      const matches = parseMatches(matchRaw);
      setLoadingStep(2);
      setResult({ profile:profileText, matches });
      setScreen(FLOW.length);
    } catch(e) {
      setFlowError(e.message || "Er ging iets mis bij het genereren.");
    } finally {
      setLoading(false);
    }
  };

  const regenerateMatches = async () => {
    setMatchesRegenerating(true); setGenError(null);
    try {
      const matchRaw = await callOpenRouter(buildMatchPrompt(answers), { maxTokens:1500, jsonMode:true });
      setResult(r=>({ ...r, matches:parseMatches(matchRaw) }));
    } catch(e) { setGenError(e.message || "Matches opnieuw genereren mislukt."); }
    finally { setMatchesRegenerating(false); }
  };

  const confirmGenerate = async (idx) => {
    const match = result?.matches?.[idx];
    if (!match) return;
    setPendingMatchIdx(null); setActiveMatchIdx(idx); setGenError(null); setGenStep("cv");
    try {
      const cvText = await callOpenRouter(buildCVPrompt(answers, match.functie));
      setGenStep("brief");
      const briefText = await callOpenRouter(buildBriefPrompt(answers, match, vacTekstDraft));
      setDocsByMatch(prev=>({ ...prev, [idx]:{ cv:cvText, brief:briefText, functie:match.functie, sector:match.sector } }));
      setVacTekstDraft("");
    } catch(e) { setGenError(e.message || "Genereren mislukt."); }
    finally { setGenStep(null); }
  };

  const next = async () => {
    if (screen < FLOW.length-1) {
      const ns = screen+1; setScreen(ns);
      if (FLOW[ns]?.type==="generating") await generate();
    }
  };
  const prev = () => { if (screen>0) setScreen(s=>s-1); };

  const restart = () => {
    try { localStorage.removeItem(STORAGE_KEY); } catch {}
    setScreen(0); setAnswers({}); setResult(null); setDocsByMatch({});
    setActiveMatchIdx(null); setPendingMatchIdx(null); setVacTekstDraft("");
    setFlowError(null); setGenError(null);
  };

  // ── RESULT ──
  if (screen >= FLOW.length && result) {
    return (
      <ResultView
        answers={answers} result={result} onRestart={restart}
        docsByMatch={docsByMatch} activeMatchIdx={activeMatchIdx} setActiveMatchIdx={setActiveMatchIdx}
        pendingMatchIdx={pendingMatchIdx} setPendingMatchIdx={setPendingMatchIdx}
        vacTekstDraft={vacTekstDraft} setVacTekstDraft={setVacTekstDraft}
        genStep={genStep} genError={genError} matchesRegenerating={matchesRegenerating}
        onConfirmGenerate={confirmGenerate} onRegenerateMatches={regenerateMatches}
      />
    );
  }

  // ── LOADING / FOUT ──
  if (loading || current?.type==="generating") {
    if (flowError && !loading) {
      return (
        <div style={{ minHeight:"100vh", background:C.bg, display:"flex", alignItems:"center", justifyContent:"center", fontFamily:"Inter,sans-serif", padding:24 }}>
          <div style={{ maxWidth:420, textAlign:"center" }}>
            <div style={{ fontSize:40, marginBottom:16 }}>⚠️</div>
            <h2 style={{ fontSize:18, fontWeight:700, margin:"0 0 8px", color:C.text }}>Er ging iets mis</h2>
            <p style={{ fontSize:14, color:C.muted, margin:"0 0 24px", lineHeight:1.6 }}>{flowError}</p>
            <div style={{ display:"flex", gap:10, justifyContent:"center" }}>
              <button onClick={()=>setScreen(s=>s-1)} style={ghostBtn}>← Terug</button>
              <button onClick={generate} style={primaryBtn(true)}>↻ Probeer opnieuw</button>
            </div>
          </div>
        </div>
      );
    }
    const msgs = ["Profielschets schrijven...","Matches berekenen...","Alles samenvoegen..."];
    return (
      <div style={{ minHeight:"100vh", background:C.bg, display:"flex", alignItems:"center", justifyContent:"center", fontFamily:"Inter,sans-serif" }}>
        <div style={{ textAlign:"center", padding:40 }}>
          <div style={{ fontSize:48, marginBottom:20, display:"inline-block", animation:"spin 2s linear infinite" }}>⟳</div>
          <div style={{ fontSize:20, fontWeight:700, color:C.text, marginBottom:8 }}>Bezig met jouw profiel...</div>
          <div style={{ fontSize:14, color:C.accent }}>{msgs[loadingStep]||msgs[0]}</div>
        </div>
        <style>{`@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}`}</style>
      </div>
    );
  }

  // ── INTRO ──
  if (current?.type==="intro") {
    return (
      <div style={{ minHeight:"100vh", background:C.bg, display:"flex", alignItems:"center", justifyContent:"center", fontFamily:"Inter,sans-serif", padding:24 }}>
        <div style={{ maxWidth:540, textAlign:"center" }}>
          <div style={{ fontSize:60, marginBottom:20 }}>{current.emoji}</div>
          <h1 style={{ fontSize:"clamp(24px,4vw,38px)", fontWeight:800, margin:"0 0 18px", letterSpacing:"-0.03em", color:C.text }}>{current.title}</h1>
          <p style={{ fontSize:16, color:C.muted, lineHeight:1.8, margin:"0 0 36px", whiteSpace:"pre-line" }}>{current.sub}</p>
          <button onClick={next} style={{ padding:"16px 40px", borderRadius:14, border:"none", background:"linear-gradient(135deg,#1f6feb,#58a6ff)", color:"#fff", fontSize:16, fontWeight:700, cursor:"pointer", boxShadow:"0 8px 32px rgba(88,166,255,0.25)" }}>{current.cta}</button>
          <div style={{ fontSize:12, color:C.subtle, marginTop:16 }}>~5 minuten · geen account nodig · jouw data blijft bij jou</div>
        </div>
      </div>
    );
  }

  // ── VRAGEN ──
  return (
    <div style={{ minHeight:"100vh", background:C.bg, color:C.text, fontFamily:"'Inter',-apple-system,sans-serif", padding:"28px 16px" }}>
      <div style={{ maxWidth:600, margin:"0 auto" }}>
        <ProgressBar current={questionIndex} total={totalQuestions} />
        {current?.block && <BlockLabel label={current.block} />}
        <div style={{ background:C.surface, border:`1px solid ${C.border}`, borderRadius:20, padding:"30px 26px", marginBottom:20 }}>
          {current?.emoji && <div style={{ fontSize:34, marginBottom:14 }}>{current.emoji}</div>}
          <div style={{ fontSize:21, fontWeight:800, lineHeight:1.3, marginBottom:8, letterSpacing:"-0.02em" }}>
            {typeof current?.vraag==="function" ? current.vraag(answers) : current?.vraag}
          </div>
          {current?.sub && <div style={{ fontSize:13, color:C.muted, marginBottom:22, lineHeight:1.6 }}>{current.sub}</div>}
          {current?.type==="text" && <input style={inp} value={answers[current.field]||""} onChange={e=>set(current.field,e.target.value)} placeholder={current.placeholder||""} onKeyDown={e=>e.key==="Enter"&&canNext()&&next()} autoFocus />}
          {current?.type==="textarea" && <textarea style={{...inp,resize:"vertical"}} rows={4} value={answers[current.field]||""} onChange={e=>set(current.field,e.target.value)} placeholder={current.placeholder||""} autoFocus />}
          {current?.type==="single" && (
            <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
              {current.options.map(o=><OptionBtn key={o} label={o} active={answers[current.field]===o} onClick={()=>set(current.field,o)} />)}
            </div>
          )}
          {current?.type==="multi" && (
            <div>
              <div style={{ display:"flex", flexWrap:"wrap", gap:8 }}>
                {current.options.map(o=>{
                  const sel=answers[current.field]||[]; const active=sel.includes(o);
                  return <MultiBtn key={o} label={o} active={active} disabled={!active&&current.max&&sel.length>=current.max} onClick={()=>toggleMulti(current.field,o,current.max)} />;
                })}
              </div>
              {current.max && <div style={{ fontSize:12, color:C.muted, marginTop:10 }}>{(answers[current.field]||[]).length} / {current.max} geselecteerd</div>}
            </div>
          )}
          {current?.type==="scale" && <ScaleInput value={answers[current.field]} onChange={v=>set(current.field,v)} leftLabel={current.leftLabel} rightLabel={current.rightLabel} steps={current.steps} />}
        </div>
        <div style={{ display:"flex", gap:10, justifyContent:"space-between" }}>
          {screen>1 ? <button onClick={prev} style={ghostBtn}>← Terug</button> : <div />}
          <button onClick={next} disabled={!canNext()} style={primaryBtn(canNext())}>
            {screen===FLOW.length-2 ? "✦ Maak mijn profiel" : "Volgende →"}
          </button>
        </div>
      </div>
      <style>{`*{box-sizing:border-box} input::placeholder,textarea::placeholder{color:#4d5661}`}</style>
    </div>
  );
}

// ─── PRINT DOCUMENT ──────────────────────────────────────────────────────────
function PrintDocument({ answers, result, docsByMatch }) {
  const sections = (result.profile||"").split(/\n(?=## )/).map(s=>s.trim()).filter(Boolean);
  const today = new Date().toLocaleDateString("nl-NL",{day:"numeric",month:"long",year:"numeric"});
  const docs = Object.values(docsByMatch||{});
  return (
    <div className="print-only" style={{ background:"#fff", color:"#111", padding:32, fontFamily:"'Inter',-apple-system,sans-serif" }}>
      <div style={{ marginBottom:28, borderBottom:"2px solid #111", paddingBottom:12 }}>
        <h1 style={{ margin:"0 0 4px", fontSize:24 }}>{answers.naam?`Profiel van ${answers.naam}`:"Carrièreprofiel"}</h1>
        <span style={{ fontSize:12, color:"#555" }}>Gegenereerd op {today}</span>
      </div>
      <h2 style={{ fontSize:18, margin:"0 0 12px", borderBottom:"1px solid #ccc", paddingBottom:6 }}>Profielschets</h2>
      {sections.map((sec,idx)=>{
        const lines = sec.split("\n");
        const title = lines[0].replace("## ","").trim();
        const content = lines.slice(1).join("\n").trim();
        return (
          <div key={idx} style={{ marginBottom:18, pageBreakInside:"avoid" }}>
            <h3 style={{ margin:"0 0 6px", fontSize:14, fontWeight:700 }}>{title}</h3>
            <p style={{ margin:0, fontSize:13, lineHeight:1.6, whiteSpace:"pre-line" }}>{content}</p>
          </div>
        );
      })}
      {result.matches?.length>0 && <>
        <h2 style={{ fontSize:18, margin:"28px 0 12px", borderBottom:"1px solid #ccc", paddingBottom:6 }}>Functiematches</h2>
        {result.matches.map((m,idx)=>(
          <div key={idx} style={{ marginBottom:16, pageBreakInside:"avoid" }}>
            <h3 style={{ margin:"0 0 4px", fontSize:14, fontWeight:700 }}>{m.functie} — {m.fit}% fit</h3>
            <div style={{ fontSize:12, color:"#555", marginBottom:4 }}>{m.sector}</div>
            <p style={{ margin:"0 0 4px", fontSize:13, lineHeight:1.5 }}>{m.waarom}</p>
            <div style={{ fontSize:12 }}><b>Energie:</b> {m.energie}</div>
            <div style={{ fontSize:12 }}><b>Aandachtspunt:</b> {m.risico}</div>
          </div>
        ))}
      </>}
      {docs.map((d,idx)=>(
        <div key={idx}>
          <h2 style={{ fontSize:18, margin:"28px 0 12px", borderBottom:"1px solid #ccc", paddingBottom:6 }}>CV-profiel ({d.functie})</h2>
          <p style={{ fontSize:13, lineHeight:1.6, whiteSpace:"pre-line", pageBreakInside:"avoid" }}>{d.cv}</p>
          <h2 style={{ fontSize:18, margin:"28px 0 12px", borderBottom:"1px solid #ccc", paddingBottom:6 }}>Sollicitatiebrief ({d.functie})</h2>
          <p style={{ fontSize:13, lineHeight:1.6, whiteSpace:"pre-line", pageBreakInside:"avoid" }}>{d.brief}</p>
        </div>
      ))}
    </div>
  );
}

// ─── RESULT VIEW ─────────────────────────────────────────────────────────────
function ResultView({ answers, result, onRestart, docsByMatch, activeMatchIdx, setActiveMatchIdx, pendingMatchIdx, setPendingMatchIdx, vacTekstDraft, setVacTekstDraft, genStep, genError, matchesRegenerating, onConfirmGenerate, onRegenerateMatches }) {
  const [tab, setTab] = useState("profiel");
  const [copied, setCopied] = useState(null);

  const copy = (text,key)=>{ navigator.clipboard.writeText(text); setCopied(key); setTimeout(()=>setCopied(null),2000); };

  const sections = (result.profile||"").split(/\n(?=## )/).map(s=>s.trim()).filter(Boolean);
  const hasMatches = (result.matches||[]).length>0;
  const generatedEntries = Object.entries(docsByMatch);
  const activeDoc = activeMatchIdx!=null ? docsByMatch[activeMatchIdx] : null;

  const TABS = [
    { id:"profiel", label:"📋 Profielschets" },
    { id:"matches", label:`🎯 Matches${result.matches?.length?` (${result.matches.length})`:""}` },
    { id:"docs",    label:`✦ CV & Brief${generatedEntries.length?` (${generatedEntries.length})`:""}` },
  ];

  return (
    <div style={{ minHeight:"100vh", background:C.bg, color:C.text, fontFamily:"'Inter',-apple-system,sans-serif" }}>
      <style>{`
        @media print {
          body { background:#fff !important; }
          .no-print { display:none !important; }
          .print-only { display:block !important; }
        }
        .print-only { display:none; }
      `}</style>

      {/* Sticky nav */}
      <div className="no-print" style={{ position:"sticky", top:0, zIndex:10, background:"rgba(13,17,23,0.96)", backdropFilter:"blur(12px)", borderBottom:`1px solid ${C.border}` }}>
        <div style={{ maxWidth:700, margin:"0 auto", padding:"0 16px" }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"12px 0 8px" }}>
            <div style={{ fontWeight:800, fontSize:15 }}>{answers.naam||"Jouw profiel"}</div>
            <div style={{ display:"flex", gap:8 }}>
              <button onClick={()=>window.print()} style={{ fontSize:12, color:C.accent, background:C.accentDim, border:`1px solid ${C.accentBorder}`, borderRadius:8, padding:"5px 12px", cursor:"pointer", fontFamily:"inherit", fontWeight:600 }}>📄 Exporteer als PDF</button>
              <button onClick={onRestart} style={{ fontSize:12, color:C.muted, background:"transparent", border:`1px solid ${C.border}`, borderRadius:8, padding:"5px 12px", cursor:"pointer", fontFamily:"inherit" }}>↺ Opnieuw</button>
            </div>
          </div>
          <div style={{ display:"flex", gap:2 }}>
            {TABS.map(t=>(
              <button key={t.id} onClick={()=>setTab(t.id)} style={{ flex:1, padding:"10px 6px", border:"none", background:"transparent", cursor:"pointer", fontFamily:"inherit", borderBottom:`2px solid ${tab===t.id?C.accent:"transparent"}`, transition:"all 0.2s" }}>
                <div style={{ fontSize:13, fontWeight:tab===t.id?700:400, color:tab===t.id?C.accent:C.muted }}>{t.label}</div>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="no-print" style={{ maxWidth:700, margin:"0 auto", padding:"28px 16px 60px" }}>

        {/* ── PROFIELSCHETS ── */}
        {tab==="profiel" && (
          <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
            {sections.map((sec,idx)=>{
              const lines=sec.split("\n");
              const title=lines[0].replace("## ","").trim();
              const content=lines.slice(1).join("\n").trim();
              const theme=SECTION_COLORS[title]||{ color:C.text, bg:C.surface };
              return (
                <div key={idx} style={{ background:C.surface, border:`1px solid ${C.border}`, borderRadius:16, padding:24 }}>
                  <h3 style={{ margin:"0 0 12px", fontSize:16, fontWeight:700, color:theme.color, display:"inline-block", padding:"4px 12px", borderRadius:8, background:theme.bg }}>{title}</h3>
                  <p style={{ margin:0, fontSize:14, color:C.text, lineHeight:1.7, whiteSpace:"pre-line" }}>{content}</p>
                </div>
              );
            })}
          </div>
        )}

        {/* ── MATCHES ── */}
        {tab==="matches" && (
          <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
            {!hasMatches && (
              <div style={{ background:C.surface, border:`1px solid ${C.border}`, borderRadius:16, padding:24, textAlign:"center" }}>
                <p style={{ fontSize:14, color:C.muted, margin:"0 0 14px" }}>We konden geen functiematches genereren. Dit gebeurt soms als het AI-model een onverwacht antwoord teruggeeft.</p>
                <button onClick={onRegenerateMatches} disabled={matchesRegenerating} style={primaryBtn(!matchesRegenerating)}>
                  {matchesRegenerating?"Opnieuw genereren...":"↻ Matches opnieuw genereren"}
                </button>
              </div>
            )}
            {result.matches?.map((m,idx)=>{
              const docs=docsByMatch[idx];
              const isPending=pendingMatchIdx===idx;
              const isGeneratingThis=genStep&&activeMatchIdx===idx;
              return (
                <div key={idx} style={{ background:C.surface, border:`1px solid ${C.border}`, borderRadius:16, padding:24 }}>
                  <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:12 }}>
                    <div>
                      <h3 style={{ margin:"0 0 4px", fontSize:18, fontWeight:800 }}>{m.functie}</h3>
                      <span style={{ fontSize:12, color:C.muted }}>{m.sector}</span>
                    </div>
                    <div style={{ background:C.greenDim, color:C.green, padding:"4px 8px", borderRadius:8, fontSize:12, fontWeight:700 }}>{m.fit}% Fit</div>
                  </div>
                  <p style={{ fontSize:14, lineHeight:1.6, margin:"0 0 16px", color:C.text }}>{m.waarom}</p>
                  <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12, marginBottom:20, fontSize:12 }}>
                    <div><span style={{ color:C.muted, display:"block", marginBottom:2 }}>Energie-balans:</span><span style={{ color:C.orange }}>{m.energie}</span></div>
                    <div><span style={{ color:C.muted, display:"block", marginBottom:2 }}>Aandachtspunt:</span><span style={{ color:C.red }}>{m.risico}</span></div>
                  </div>

                  {/* Vacature-input panel */}
                  {isPending ? (
                    <div style={{ padding:16, background:C.card, borderRadius:12, border:`1px solid ${C.border}` }}>
                      <div style={{ fontSize:12, color:C.muted, marginBottom:8 }}>Plak hier de vacaturetekst voor een gerichtere brief (optioneel):</div>
                      <textarea style={{...inp,resize:"vertical"}} rows={4} value={vacTekstDraft} onChange={e=>setVacTekstDraft(e.target.value)} placeholder="Plak de vacaturetekst hier, of laat leeg..." autoFocus />
                      <div style={{ display:"flex", gap:8, marginTop:10 }}>
                        <button onClick={()=>onConfirmGenerate(idx)} style={{ ...primaryBtn(true), flex:1, padding:"10px 16px", fontSize:13 }}>✨ Genereer CV & Brief</button>
                        <button onClick={()=>{ setPendingMatchIdx(null); setVacTekstDraft(""); }} style={{ ...ghostBtn, padding:"10px 16px", fontSize:13 }}>Annuleren</button>
                      </div>
                    </div>
                  ) : docs ? (
                    <div style={{ display:"flex", gap:8 }}>
                      <button onClick={()=>{ setActiveMatchIdx(idx); setTab("docs"); }} style={{ ...primaryBtn(true), padding:"10px 20px", fontSize:13, flex:1 }}>✓ Bekijk CV & Brief</button>
                      <button onClick={()=>setPendingMatchIdx(idx)} style={{ ...ghostBtn, padding:"10px 14px", fontSize:13 }} title="Opnieuw genereren">↻</button>
                      <a href={m.zoekUrl} target="_blank" rel="noreferrer" style={{ ...ghostBtn, padding:"10px 16px", fontSize:13, textDecoration:"none", display:"inline-flex", alignItems:"center" }}>Zoek Jobs ↗</a>
                    </div>
                  ) : (
                    <div style={{ display:"flex", gap:8 }}>
                      <button onClick={()=>setPendingMatchIdx(idx)} style={{ ...primaryBtn(true), padding:"10px 20px", fontSize:13, flex:1 }}>✨ Genereer CV & Brief</button>
                      <a href={m.zoekUrl} target="_blank" rel="noreferrer" style={{ ...ghostBtn, padding:"10px 16px", fontSize:13, textDecoration:"none", display:"inline-flex", alignItems:"center" }}>Zoek Jobs ↗</a>
                    </div>
                  )}

                  {isGeneratingThis && <div style={{ marginTop:10, fontSize:12, color:C.accent }}>⟳ {genStep==="cv"?"CV-profiel opbouwen...":"Brief schrijven..."}</div>}
                  {genError && activeMatchIdx===idx && !genStep && (
                    <div style={{ marginTop:10, fontSize:12, color:C.red }}>
                      ⚠️ {genError}{" "}
                      <span style={{ textDecoration:"underline", cursor:"pointer" }} onClick={()=>onConfirmGenerate(idx)}>opnieuw proberen</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* ── CV & BRIEF ── */}
        {tab==="docs" && (
          <div style={{ display:"flex", flexDirection:"column", gap:20 }}>
            {generatedEntries.length===0 ? (
              <div style={{ textAlign:"center", padding:40, color:C.muted, fontSize:14 }}>
                Ga naar de <b>🎯 Matches</b> tab en klik op "Genereer CV & Brief" bij een functie om documenten te maken.
              </div>
            ) : (
              <>
                {generatedEntries.length>1 && (
                  <div style={{ display:"flex", flexWrap:"wrap", gap:8 }}>
                    {generatedEntries.map(([idx,d])=>(
                      <MultiBtn key={idx} label={d.functie} active={Number(idx)===activeMatchIdx} onClick={()=>setActiveMatchIdx(Number(idx))} />
                    ))}
                  </div>
                )}
                {activeDoc && <>
                  <div style={{ background:C.surface, border:`1px solid ${C.border}`, borderRadius:16, padding:24 }}>
                    <div style={{ display:"flex", justifyContent:"space-between", marginBottom:12 }}>
                      <h3 style={{ margin:0, fontSize:15, fontWeight:700, color:C.accent }}>Personal CV-Profile ({activeDoc.functie})</h3>
                      <button onClick={()=>copy(activeDoc.cv,"cv")} style={{ background:"transparent", border:"none", color:C.muted, cursor:"pointer", fontSize:12 }}>{copied==="cv"?"Kopieer ✓":"Kopieer document"}</button>
                    </div>
                    <p style={{ margin:0, fontSize:14, lineHeight:1.7, color:C.text, whiteSpace:"pre-line" }}>{activeDoc.cv}</p>
                  </div>
                  <div style={{ background:C.surface, border:`1px solid ${C.border}`, borderRadius:16, padding:24 }}>
                    <div style={{ display:"flex", justifyContent:"space-between", marginBottom:12 }}>
                      <h3 style={{ margin:0, fontSize:15, fontWeight:700, color:C.accent }}>Sollicitatiebrief</h3>
                      <button onClick={()=>copy(activeDoc.brief,"brief")} style={{ background:"transparent", border:"none", color:C.muted, cursor:"pointer", fontSize:12 }}>{copied==="brief"?"Kopieer ✓":"Kopieer document"}</button>
                    </div>
                    <p style={{ margin:0, fontSize:14, lineHeight:1.7, color:C.text, whiteSpace:"pre-line" }}>{activeDoc.brief}</p>
                  </div>
                </>}
              </>
            )}
          </div>
        )}
      </div>

      <PrintDocument answers={answers} result={result} docsByMatch={docsByMatch} />
    </div>
  );
}
