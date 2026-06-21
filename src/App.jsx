import { useState, useEffect } from "react";

// ─── DESIGN TOKENS ────────────────────────────────────────────────────────────
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
  "Wie ben jij?":              { color: C.accent,  bg: C.accentDim },
  "Jouw superkrachten":        { color: C.green,   bg: C.greenDim },
  "Jouw valkuilen":            { color: C.yellow,  bg: C.yellowDim },
  "Wat jou energie geeft ⚡":  { color: C.orange,  bg: C.orangeDim },
  "Wat energie kost 🪫":       { color: C.red,     bg: C.redDim },
  "Jouw hobby's als spiegel":  { color: C.purple,  bg: C.purpleDim },
  "Waar jij naartoe gaat":     { color: C.green,   bg: C.greenDim },
};

// ─── LOCALSTORAGE KEYS ────────────────────────────────────────────────────────
const LS_ANSWERS = "career_assistant_answers_v1";
const LS_SCREEN  = "career_assistant_screen_v1";

// ─── FLOW ─────────────────────────────────────────────────────────────────────
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

// ─── STYLE HELPERS ────────────────────────────────────────────────────────────
const inp = { width:"100%", background:C.card, border:`1px solid ${C.border}`, borderRadius:12, padding:"13px 15px", color:C.text, fontSize:15, outline:"none", boxSizing:"border-box", fontFamily:"inherit", lineHeight:1.6 };
const primaryBtn = (on) => ({ padding:"13px 28px", borderRadius:12, border:"none", fontSize:15, fontWeight:700, cursor:on?"pointer":"not-allowed", background:on?"linear-gradient(135deg,#1f6feb,#58a6ff)":C.subtle, color:on?"#fff":C.muted, transition:"all 0.2s", letterSpacing:"-0.01em", boxShadow:on?"0 4px 20px rgba(88,166,255,0.2)":"none" });
const ghostBtn = { padding:"12px 20px", borderRadius:12, border:`1px solid ${C.border}`, background:"transparent", color:C.muted, fontSize:14, cursor:"pointer", fontFamily:"inherit", fontWeight:500 };

// ─── OPENROUTER API ───────────────────────────────────────────────────────────
async function callOpenRouter(prompt, maxTokens=1000, { jsonMode=false } = {}) {
  const apiKey = import.meta.env.VITE_OPENROUTER_API_KEY;
  if (!apiKey) throw new Error("Geen OpenRouter API key gevonden");

  const body = {
    model: "openrouter/free",
    messages: [{ role: "user", content: prompt }],
    max_tokens: maxTokens,
    temperature: 0.7,
  };
  if (jsonMode) {
    // OpenRouter ondersteunt response_format zoals OpenAI; sommige gratis modellen negeren 't,
    // maar dan blijft de fallback-parser nog steeds werken.
    body.response_format = { type: "json_object" };
  }

  const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      "HTTP-Referer": window.location.origin,
      "X-Title": "Career Assistant App",
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const err = await res.json().catch(()=>({}));
    throw new Error(err.error?.message || `API fout (${res.status})`);
  }

  const data = await res.json();
  return data.choices?.[0]?.message?.content || "";
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
  return `Geef 4 functie/sector-matches op basis van dit profiel. Reageer ALLEEN met geldig JSON in dit exacte formaat:
{"matches":[{"functie":"...","sector":"...","fit":85,"waarom":"...","energie":"...","risico":"...","zoekUrl":"..."}, ...]}

Eisen per match:
- functie: concrete functietitel
- sector: sector naam
- fit: integer 0-100
- waarom: 1 zin waarom dit past bij dit profiel
- energie: "Hoog/Middel/Laag — korte toelichting"
- risico: 1 concreet risico of aandachtspunt
- zoekUrl: LinkedIn jobs URL, format https://www.linkedin.com/jobs/search/?keywords=<functie>&location=Netherlands

Profiel: ${(p.sterkePunten||[]).slice(0,4).join(", ")}. Energie: ${(p.energieGeeft||[]).slice(0,3).join(", ")}. Killers: ${(p.energieVreet||[]).slice(0,3).join(", ")}. Cultuur: ${(p.cultuur||[]).join(", ")}. Skills: ${(p.vaardighedenHeb||[]).slice(0,4).join(", ")}. Wil leren: ${(p.vaardighedenWil||[]).slice(0,3).join(", ")}. Droom: ${p.droomFunctie||"?"}. Bedrijf: ${p.bedrijfType||"?"}. Locatie: ${p.locatie||"Nederland"}.

Geef precies 4 matches. Geen uitleg, geen markdown — alleen het JSON-object.`;
}

function buildCVPrompt(p, functie) {
  return `Schrijf een CV-profiel van 4-5 zinnen voor iemand die solliciteert als ${functie}. Persoonlijk, energiek, geen clichés. Begin met wie de persoon is, niet wat ze deden. Verwerk een concreet detail. Geen "gedreven professional".

Profiel: trots op: ${p.momentTrots||"?"}. Sterke punten: ${(p.sterkePunten||[]).slice(0,4).join(", ")}. Skills: ${(p.vaardighedenHeb||[]).slice(0,4).join(", ")}. Energie van: ${(p.energieGeeft||[]).slice(0,3).join(", ")}. Hobby's: ${(p.hobbies||[]).slice(0,3).join(", ")}.

OUTPUT: alleen het CV-profiel, niets anders.`;
}

function buildBriefPrompt(p, match, vacatureTekst) {
  return `Schrijf een sollicitatiebrief voor een sollicitatie als ${match.functie} in de ${match.sector} sector. Persoonlijk, direct, menselijk. NIET beginnen met "Hierbij solliciteer ik". Concrete voorbeelden gebruiken. Warm maar zelfverzekerd afsluiten.

Profiel: trots moment: ${p.momentTrots||"?"}. Energie-dag: ${p.momentEnergie||"?"}. Sterke punten: ${(p.sterkePunten||[]).join(", ")}. Valkuil + aanpak: ${(p.valkuilen||[]).slice(0,2).join(", ")}. Wil leren: ${(p.vaardighedenWil||[]).slice(0,3).join(", ")}. Cultuurfit: ${(p.cultuur||[]).join(", ")}.
${vacatureTekst ? `\nVACATURETEKST (gebruik dit om de brief specifiek te maken — verwijs naar concrete eisen, taken of bedrijfswaarden uit deze tekst):\n${vacatureTekst}` : ""}

Structuur: 1) Opening die pakt — ${vacatureTekst ? "waarom juist déze rol/dit bedrijf (verwijs naar de vacaturetekst)" : "waarom deze sector/rol?"} 2) Concrete werkervaring met echt voorbeeld 3) Wat jij toevoegt ${vacatureTekst ? "— koppel aan wat in de vacature gevraagd wordt" : ""} 4) Warme directe afsluiting.

OUTPUT: alleen de brief.`;
}

// ─── MATCH PARSING (robuust, met losse fallback) ─────────────────────────────
function parseMatches(raw) {
  if (!raw || typeof raw !== "string") return null;
  const clean = raw.replace(/```json|```/g, "").trim();

  // 1) Hele blob als JSON proberen (jsonMode-pad)
  try {
    const obj = JSON.parse(clean);
    if (Array.isArray(obj)) return obj;
    if (Array.isArray(obj.matches)) return obj.matches;
  } catch (_) {}

  // 2) JSON-object {"matches":[...]} eruit pikken
  const objStart = clean.indexOf("{");
  const objEnd   = clean.lastIndexOf("}");
  if (objStart !== -1 && objEnd !== -1 && objEnd > objStart) {
    try {
      const obj = JSON.parse(clean.slice(objStart, objEnd + 1));
      if (Array.isArray(obj.matches)) return obj.matches;
    } catch (_) {}
  }

  // 3) Losse array [...] eruit pikken
  const arrStart = clean.indexOf("[");
  const arrEnd   = clean.lastIndexOf("]");
  if (arrStart !== -1 && arrEnd !== -1 && arrEnd > arrStart) {
    try {
      const arr = JSON.parse(clean.slice(arrStart, arrEnd + 1));
      if (Array.isArray(arr)) return arr;
    } catch (_) {}
  }

  return null; // niet kunnen parsen
}

// ─── UI COMPONENTS ────────────────────────────────────────────────────────────
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
        {[leftLabel, rightLabel].map((lbl,i)=>(
          <div key={i} style={{ fontSize:12, color:C.muted, lineHeight:1.5, textAlign:i===0?"left":"right", whiteSpace:"pre-line", flex:1 }}>{lbl}</div>
        ))}
      </div>
    </div>
  );
}

// ─── MAIN ────────────────────────────────────────────────────────────────────
export default function CareerAssistant() {
  // Lazy init vanuit localStorage zodat refresh-tijdens-vragenlijst niet alles wegmieter.
  const [answers, setAnswers] = useState(() => {
    try { return JSON.parse(localStorage.getItem(LS_ANSWERS) || "{}"); }
    catch { return {}; }
  });
  const [screen, setScreen] = useState(() => {
    const saved = parseInt(localStorage.getItem(LS_SCREEN) || "0", 10);
    if (Number.isNaN(saved)) return 0;
    // Niet herstarten op het 'generating'-scherm — dan vuurt 't direct een API-call af bij refresh.
    if (saved < 0 || saved >= FLOW.length) return 0;
    if (FLOW[saved]?.type === "generating") return Math.max(0, saved - 1);
    return saved;
  });
  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const [result, setResult] = useState(null);
  const [genError, setGenError] = useState(null); // {type:'profile'|'matches', message}
  const [savedNotice, setSavedNotice] = useState(false); // korte hint dat er voortgang hersteld is

  // Persist answers
  useEffect(() => {
    try { localStorage.setItem(LS_ANSWERS, JSON.stringify(answers)); } catch {}
  }, [answers]);

  // Persist screen (skip result-scherm en generating)
  useEffect(() => {
    try {
      if (screen < FLOW.length && FLOW[screen]?.type !== "generating") {
        localStorage.setItem(LS_SCREEN, String(screen));
      }
    } catch {}
  }, [screen]);

  // Hint tonen als we voortgang hebben hersteld
  useEffect(() => {
    if (Object.keys(answers).length > 0 && screen > 0 && screen < FLOW.length-1) {
      setSavedNotice(true);
      const t = setTimeout(()=>setSavedNotice(false), 3500);
      return () => clearTimeout(t);
    }
  }, []); // eenmalig bij mount

  const current = FLOW[screen];
  const questionIndex = FLOW.slice(0, screen+1).filter(f=>!["intro","generating"].includes(f.type)).length;
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
    setLoading(true);
    setGenError(null);
    try {
      setLoadingStep(0);
      const profileText = await callOpenRouter(buildProfilePrompt(answers), 1000);

      setLoadingStep(1);
      const matchRaw = await callOpenRouter(buildMatchPrompt(answers), 1500, { jsonMode: true });
      const matches = parseMatches(matchRaw);

      setLoadingStep(2);
      if (matches === null) {
        // Profielschets is gelukt; alleen matches niet — laat 't expliciet zien met retry
        setResult({ profile: profileText, matches: [], rawMatchOutput: matchRaw });
        setGenError({ type: "matches", message: "We konden de functiematches niet uit het antwoord van het model halen." });
      } else {
        setResult({ profile: profileText, matches });
      }
    } catch(e) {
      setResult({ profile: "", matches: [] });
      setGenError({ type: "profile", message: e.message || "Onbekende fout bij genereren." });
    } finally {
      setLoading(false);
      setScreen(FLOW.length);
    }
  };

  // Alleen matches opnieuw ophalen (zonder profielschets opnieuw te genereren)
  const retryMatches = async () => {
    setLoading(true);
    setGenError(null);
    setLoadingStep(1);
    try {
      const matchRaw = await callOpenRouter(buildMatchPrompt(answers), 1500, { jsonMode: true });
      const matches = parseMatches(matchRaw);
      if (matches === null) {
        setGenError({ type: "matches", message: "Het model gaf opnieuw geen geldige JSON terug. Probeer het later nog eens." });
        setResult(r => ({ ...(r||{ profile:"", matches:[] }), rawMatchOutput: matchRaw }));
      } else {
        setResult(r => ({ ...(r||{ profile:"" }), matches }));
      }
    } catch (e) {
      setGenError({ type: "matches", message: e.message || "Onbekende fout." });
    } finally {
      setLoading(false);
    }
  };

  const next = async () => {
    if (screen < FLOW.length-1) {
      const nextScreen = screen+1;
      setScreen(nextScreen);
      if (FLOW[nextScreen]?.type==="generating") await generate();
    }
  };
  const prev = () => { if (screen>0) setScreen(s=>s-1); };
  const restart = () => {
    setScreen(0); setAnswers({}); setResult(null); setGenError(null);
    try {
      localStorage.removeItem(LS_ANSWERS);
      localStorage.removeItem(LS_SCREEN);
    } catch {}
  };
  const clearProgress = () => {
    try {
      localStorage.removeItem(LS_ANSWERS);
      localStorage.removeItem(LS_SCREEN);
    } catch {}
    setAnswers({});
    setScreen(0);
  };

  // Result
  if (screen>=FLOW.length && result) {
    return (
      <ResultView
        answers={answers}
        result={result}
        genError={genError}
        onRetryMatches={retryMatches}
        onRestart={restart}
      />
    );
  }

  // Loading
  if (loading || current?.type==="generating") {
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

  // Intro
  if (current?.type==="intro") {
    const hasProgress = Object.keys(answers).length > 0;
    return (
      <div style={{ minHeight:"100vh", background:C.bg, display:"flex", alignItems:"center", justifyContent:"center", fontFamily:"Inter,sans-serif", padding:24 }}>
        <div style={{ maxWidth:540, textAlign:"center" }}>
          <div style={{ fontSize:60, marginBottom:20 }}>{current.emoji}</div>
          <h1 style={{ fontSize:"clamp(24px,4vw,38px)", fontWeight:800, margin:"0 0 18px", letterSpacing:"-0.03em", color:C.text }}>{current.title}</h1>
          <p style={{ fontSize:16, color:C.muted, lineHeight:1.8, margin:"0 0 36px", whiteSpace:"pre-line" }}>{current.sub}</p>
          <button onClick={next} style={{ padding:"16px 40px", borderRadius:14, border:"none", background:"linear-gradient(135deg,#1f6feb,#58a6ff)", color:"#fff", fontSize:16, fontWeight:700, cursor:"pointer", boxShadow:"0 8px 32px rgba(88,166,255,0.25)" }}>{current.cta}</button>
          <div style={{ fontSize:12, color:C.subtle, marginTop:16 }}>~5 minuten · geen account nodig · jouw data blijft bij jou</div>
          {hasProgress && (
            <div style={{ marginTop:20 }}>
              <button onClick={clearProgress} style={{ ...ghostBtn, fontSize:12 }}>🗑️ Eerdere voortgang wissen</button>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Question
  return (
    <div style={{ minHeight:"100vh", background:C.bg, color:C.text, fontFamily:"'Inter',-apple-system,sans-serif", padding:"28px 16px" }}>
      <div style={{ maxWidth:600, margin:"0 auto" }}>
        {savedNotice && (
          <div style={{ background:C.greenDim, border:`1px solid rgba(63,185,80,0.3)`, color:C.green, padding:"10px 14px", borderRadius:10, fontSize:13, marginBottom:16, display:"flex", justifyContent:"space-between", alignItems:"center", gap:12 }}>
            <span>↩️ Voortgang hersteld — je gaat verder waar je was.</span>
            <button onClick={clearProgress} style={{ background:"transparent", border:"none", color:C.green, fontSize:12, cursor:"pointer", textDecoration:"underline", fontFamily:"inherit" }}>Wis & opnieuw</button>
          </div>
        )}
        <ProgressBar current={questionIndex} total={totalQuestions} />
        {current?.block && <BlockLabel label={current.block} />}
        <div style={{ background:C.surface, border:`1px solid ${C.border}`, borderRadius:20, padding:"30px 26px", marginBottom:20 }}>
          {current?.emoji && <div style={{ fontSize:34, marginBottom:14 }}>{current.emoji}</div>}
          <div style={{ fontSize:21, fontWeight:800, lineHeight:1.3, marginBottom:8, letterSpacing:"-0.02em" }}>
            {typeof current?.vraag==="function" ? current.vraag(answers) : current?.vraag}
          </div>
          {current?.sub && <div style={{ fontSize:13, color:C.muted, marginBottom:22, lineHeight:1.6 }}>{current.sub}</div>}

          {current?.type==="text" && (
            <input style={inp} value={answers[current.field]||""} onChange={e=>set(current.field,e.target.value)} placeholder={current.placeholder||""} onKeyDown={e=>e.key==="Enter"&&canNext()&&next()} autoFocus />
          )}
          {current?.type==="textarea" && (
            <textarea style={{...inp,resize:"vertical"}} rows={4} value={answers[current.field]||""} onChange={e=>set(current.field,e.target.value)} placeholder={current.placeholder||""} autoFocus />
          )}
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
          {current?.type==="scale" && (
            <ScaleInput value={answers[current.field]} onChange={v=>set(current.field,v)} leftLabel={current.leftLabel} rightLabel={current.rightLabel} steps={current.steps} />
          )}
        </div>

        <div style={{ display:"flex", gap:10, justifyContent:"space-between" }}>
          {screen>1 ? <button onClick={prev} style={ghostBtn}>← Terug</button> : <div />}
          <button onClick={next} disabled={!canNext()} style={primaryBtn(canNext())}>
            {screen===FLOW.length-2 ? "✦ Maak mijn profiel" : "Volgende →"}
          </button>
        </div>
        <div style={{ textAlign:"center", marginTop:14 }}>
          <span style={{ fontSize:11, color:C.subtle }}>💾 Je antwoorden worden automatisch lokaal bewaard</span>
        </div>
      </div>
      <style>{`*{box-sizing:border-box} input::placeholder,textarea::placeholder{color:#4d5661}`}</style>
    </div>
  );
}

// ─── PRINT / PDF DOCUMENT ──────────────────────────────────────────────────────
function PrintDocument({ answers, result, selectedMatch, cv, brief }) {
  const sections = (result.profile || "").split(/\n(?=## )/).map(s => s.trim()).filter(Boolean);
  const today = new Date().toLocaleDateString("nl-NL", { day: "numeric", month: "long", year: "numeric" });

  return (
    <div className="print-only" style={{ background: "#fff", color: "#111", padding: 32, fontFamily: "'Inter',-apple-system,sans-serif" }}>
      <div style={{ marginBottom: 28, borderBottom: "2px solid #111", paddingBottom: 12 }}>
        <h1 style={{ margin: "0 0 4px", fontSize: 24 }}>{answers.naam ? `Profiel van ${answers.naam}` : "Carrièreprofiel"}</h1>
        <span style={{ fontSize: 12, color: "#555" }}>Gegenereerd op {today}</span>
      </div>

      <h2 style={{ fontSize: 18, margin: "0 0 12px", borderBottom: "1px solid #ccc", paddingBottom: 6 }}>Profielschets</h2>
      {sections.map((sec, idx) => {
        const lines = sec.split("\n");
        const title = lines[0].replace("## ", "").trim();
        const content = lines.slice(1).join("\n").trim();
        return (
          <div key={idx} style={{ marginBottom: 18, pageBreakInside: "avoid" }}>
            <h3 style={{ margin: "0 0 6px", fontSize: 14, fontWeight: 700 }}>{title}</h3>
            <p style={{ margin: 0, fontSize: 13, lineHeight: 1.6, whiteSpace: "pre-line" }}>{content}</p>
          </div>
        );
      })}

      {result.matches?.length > 0 && (
        <>
          <h2 style={{ fontSize: 18, margin: "28px 0 12px", borderBottom: "1px solid #ccc", paddingBottom: 6 }}>Functiematches</h2>
          {result.matches.map((m, idx) => (
            <div key={idx} style={{ marginBottom: 16, pageBreakInside: "avoid" }}>
              <h3 style={{ margin: "0 0 4px", fontSize: 14, fontWeight: 700 }}>{m.functie} — {m.fit}% fit</h3>
              <div style={{ fontSize: 12, color: "#555", marginBottom: 4 }}>{m.sector}</div>
              <p style={{ margin: "0 0 4px", fontSize: 13, lineHeight: 1.5 }}>{m.waarom}</p>
              <div style={{ fontSize: 12 }}><b>Energie:</b> {m.energie}</div>
              <div style={{ fontSize: 12 }}><b>Aandachtspunt:</b> {m.risico}</div>
            </div>
          ))}
        </>
      )}

      {selectedMatch && cv && (
        <>
          <h2 style={{ fontSize: 18, margin: "28px 0 12px", borderBottom: "1px solid #ccc", paddingBottom: 6 }}>CV-profiel ({selectedMatch.functie})</h2>
          <p style={{ fontSize: 13, lineHeight: 1.6, whiteSpace: "pre-line", pageBreakInside: "avoid" }}>{cv}</p>
        </>
      )}

      {selectedMatch && brief && (
        <>
          <h2 style={{ fontSize: 18, margin: "28px 0 12px", borderBottom: "1px solid #ccc", paddingBottom: 6 }}>Sollicitatiebrief ({selectedMatch.functie})</h2>
          <p style={{ fontSize: 13, lineHeight: 1.6, whiteSpace: "pre-line", pageBreakInside: "avoid" }}>{brief}</p>
        </>
      )}
    </div>
  );
}

// ─── RESULT VIEW ──────────────────────────────────────────────────────────────
function ResultView({ answers, result, genError, onRetryMatches, onRestart }) {
  const [tab, setTab] = useState("profiel");
  const [selectedMatchIdx, setSelectedMatchIdx] = useState(null);
  // Per match: { vacTekst, cv, brief, generating: false|'cv'|'brief', error }
  const [docsByMatch, setDocsByMatch] = useState({});
  const [showVacInput, setShowVacInput] = useState(null); // idx van match waarvan input open staat
  const [copied, setCopied] = useState(null);

  const matchKey = (idx) => `m${idx}`;
  const selectedMatch = selectedMatchIdx !== null ? result.matches?.[selectedMatchIdx] : null;
  const selectedDocs  = selectedMatchIdx !== null ? docsByMatch[matchKey(selectedMatchIdx)] : null;

  const copy = (text, key) => { navigator.clipboard.writeText(text); setCopied(key); setTimeout(()=>setCopied(null),2000); };

  const updateDoc = (idx, patch) => {
    setDocsByMatch(prev => ({
      ...prev,
      [matchKey(idx)]: { ...(prev[matchKey(idx)]||{}), ...patch },
    }));
  };

  const handleGenerate = async (idx, vacatureTekst) => {
    const match = result.matches[idx];
    if (!match) return;
    setSelectedMatchIdx(idx);
    setShowVacInput(null);
    setTab("docs");
    updateDoc(idx, { cv: "", brief: "", generating: "cv", error: null, vacTekst: vacatureTekst || "" });
    try {
      const cvText = await callOpenRouter(buildCVPrompt(answers, match.functie));
      updateDoc(idx, { cv: cvText, generating: "brief" });
      const briefText = await callOpenRouter(buildBriefPrompt(answers, match, vacatureTekst || ""));
      updateDoc(idx, { brief: briefText, generating: null });
    } catch (e) {
      updateDoc(idx, { generating: null, error: e.message || "Genereren mislukt." });
    }
  };

  const sections = (result.profile||"").split(/\n(?=## )/).map(s=>s.trim()).filter(Boolean);
  const generatedMatchIdxs = Object.keys(docsByMatch).map(k => parseInt(k.replace("m",""), 10));

  const TABS = [
    { id:"profiel", label:"📋 Profielschets" },
    { id:"matches", label:`🎯 Matches ${result.matches?.length ? `(${result.matches.length})` : ""}` },
    { id:"docs",    label:`✦ CV & Brief ${generatedMatchIdxs.length ? `(${generatedMatchIdxs.length})` : ""}` },
  ];

  return (
    <div style={{ minHeight:"100vh", background:C.bg, color:C.text, fontFamily:"'Inter',-apple-system,sans-serif" }}>
      <style>{`
        @media print {
          body { background: #fff !important; }
          .no-print { display: none !important; }
          .print-only { display: block !important; }
        }
        .print-only { display: none; }
        @keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}
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
        {/* Globale foutmelding (profile-fase) */}
        {genError?.type === "profile" && (
          <div style={{ background:C.redDim, border:`1px solid rgba(248,81,73,0.3)`, color:C.red, padding:"14px 16px", borderRadius:12, marginBottom:20, fontSize:14 }}>
            <div style={{ fontWeight:700, marginBottom:4 }}>⚠️ Er ging iets mis bij het genereren</div>
            <div style={{ color:C.text, marginBottom:10 }}>{genError.message}</div>
            <button onClick={onRestart} style={{ ...ghostBtn, fontSize:12, color:C.red, borderColor:"rgba(248,81,73,0.3)" }}>↺ Probeer opnieuw</button>
          </div>
        )}

        {tab === "profiel" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {sections.length === 0 && !genError && (
              <div style={{ color:C.muted, fontSize:14, textAlign:"center", padding:40 }}>Geen profielschets beschikbaar.</div>
            )}
            {sections.map((sec, idx) => {
              const lines = sec.split("\n");
              const title = lines[0].replace("## ", "").trim();
              const content = lines.slice(1).join("\n").trim();
              const theme = SECTION_COLORS[title] || { color: C.text, bg: C.surface };

              return (
                <div key={idx} style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 16, padding: 24 }}>
                  <h3 style={{ margin: "0 0 12px", fontSize: 16, fontWeight: 700, color: theme.color, display: "inline-block", padding: "4px 12px", borderRadius: 8, background: theme.bg }}>
                    {title}
                  </h3>
                  <p style={{ margin: 0, fontSize: 14, color: C.text, lineHeight: 1.7, whiteSpace: "pre-line" }}>{content}</p>
                </div>
              );
            })}
          </div>
        )}

        {tab === "matches" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {/* Matches-foutmelding met retry */}
            {genError?.type === "matches" && (
              <div style={{ background:C.yellowDim, border:`1px solid rgba(227,179,65,0.3)`, color:C.yellow, padding:"14px 16px", borderRadius:12, fontSize:14 }}>
                <div style={{ fontWeight:700, marginBottom:4 }}>⚠️ Matches niet geladen</div>
                <div style={{ color:C.text, marginBottom:10 }}>
                  {genError.message} Dit is meestal een tijdelijk probleem met het AI-model dat geen geldige JSON teruggaf.
                </div>
                <button onClick={onRetryMatches} style={{ ...primaryBtn(true), padding:"8px 16px", fontSize:13 }}>
                  🔄 Opnieuw proberen
                </button>
              </div>
            )}

            {result.matches?.length === 0 && !genError && (
              <div style={{ color:C.muted, fontSize:14, textAlign:"center", padding:40 }}>Geen matches gevonden.</div>
            )}

            {result.matches?.map((m, idx) => {
              const doc = docsByMatch[matchKey(idx)];
              const hasDocs = !!(doc?.cv || doc?.brief);
              const isGenerating = doc?.generating;
              const vacOpen = showVacInput === idx;

              return (
                <div key={idx} style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 16, padding: 24 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
                    <div>
                      <h3 style={{ margin: "0 0 4px", fontSize: 18, fontWeight: 800 }}>{m.functie}</h3>
                      <span style={{ fontSize: 12, color: C.muted }}>{m.sector}</span>
                    </div>
                    <div style={{ display:"flex", gap:6, alignItems:"center" }}>
                      {hasDocs && (
                        <span style={{ background:C.purpleDim, color:C.purple, padding:"3px 8px", borderRadius:6, fontSize:11, fontWeight:700 }}>
                          ✦ Documenten klaar
                        </span>
                      )}
                      <div style={{ background: C.greenDim, color: C.green, padding: "4px 8px", borderRadius: 8, fontSize: 12, fontWeight: 700 }}>
                        {m.fit}% Fit
                      </div>
                    </div>
                  </div>
                  <p style={{ fontSize: 14, lineHeight: 1.6, margin: "0 0 16px", color: C.text }}>{m.waarom}</p>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 20, fontSize: 12 }}>
                    <div>
                      <span style={{ color: C.muted, display: "block", marginBottom: 2 }}>Energie-balans:</span>
                      <span style={{ color: C.orange }}>{m.energie}</span>
                    </div>
                    <div>
                      <span style={{ color: C.muted, display: "block", marginBottom: 2 }}>Aandachtspunt:</span>
                      <span style={{ color: C.red }}>{m.risico}</span>
                    </div>
                  </div>

                  {/* Vacaturetekst-veld (nu écht zichtbaar) */}
                  {vacOpen && (
                    <div style={{ marginBottom:16, padding:14, background:C.card, border:`1px solid ${C.border}`, borderRadius:12 }}>
                      <label style={{ fontSize:12, fontWeight:600, color:C.accent, display:"block", marginBottom:6 }}>
                        📋 Plak hier de vacaturetekst (optioneel)
                      </label>
                      <div style={{ fontSize:11, color:C.muted, marginBottom:8 }}>
                        Hoe specifieker de vacature, hoe specifieker de brief. Leeg laten kan ook — dan wordt 'ie generiek voor de rol.
                      </div>
                      <textarea
                        value={doc?.vacTekst ?? ""}
                        onChange={e => updateDoc(idx, { vacTekst: e.target.value })}
                        rows={6}
                        placeholder="bijv. Wij zoeken een commercieel sterke accountmanager met passie voor SaaS. Je werkt met..."
                        style={{ ...inp, fontSize:13, resize:"vertical" }}
                      />
                      <div style={{ display:"flex", gap:8, marginTop:10 }}>
                        <button
                          onClick={() => handleGenerate(idx, doc?.vacTekst || "")}
                          style={{ ...primaryBtn(true), padding:"9px 16px", fontSize:13, flex:1 }}
                        >
                          ✨ Genereer met deze vacature
                        </button>
                        <button onClick={() => setShowVacInput(null)} style={{ ...ghostBtn, padding:"9px 14px", fontSize:13 }}>
                          Annuleer
                        </button>
                      </div>
                    </div>
                  )}

                  {!vacOpen && (
                    <div style={{ display: "flex", gap: 8, flexWrap:"wrap" }}>
                      <button
                        onClick={() => handleGenerate(idx, "")}
                        disabled={!!isGenerating}
                        style={{ ...primaryBtn(!isGenerating), padding: "10px 18px", fontSize: 13, flex:"1 1 auto" }}
                      >
                        {isGenerating ? "⟳ Bezig..." : hasDocs ? "↻ Opnieuw genereren" : "✨ Genereer CV & Brief"}
                      </button>
                      <button
                        onClick={() => setShowVacInput(idx)}
                        disabled={!!isGenerating}
                        style={{ ...ghostBtn, padding: "10px 14px", fontSize: 13 }}
                      >
                        📋 Met vacaturetekst
                      </button>
                      {hasDocs && (
                        <button
                          onClick={() => { setSelectedMatchIdx(idx); setTab("docs"); }}
                          style={{ ...ghostBtn, padding: "10px 14px", fontSize: 13, color:C.purple, borderColor:"rgba(188,140,255,0.3)" }}
                        >
                          👁️ Bekijk
                        </button>
                      )}
                      <a href={m.zoekUrl} target="_blank" rel="noreferrer" style={{ ...ghostBtn, padding: "10px 14px", fontSize: 13, textDecoration: "none", display: "inline-flex", alignItems: "center" }}>
                        Jobs ↗
                      </a>
                    </div>
                  )}

                  {doc?.error && (
                    <div style={{ marginTop:10, color:C.red, fontSize:12 }}>⚠️ {doc.error}</div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {tab === "docs" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            {/* Match-switcher als er meerdere zijn */}
            {generatedMatchIdxs.length > 1 && (
              <div style={{ background:C.surface, border:`1px solid ${C.border}`, borderRadius:12, padding:"12px 14px" }}>
                <div style={{ fontSize:11, color:C.muted, fontWeight:600, textTransform:"uppercase", letterSpacing:"0.08em", marginBottom:8 }}>
                  Wissel tussen sollicitaties
                </div>
                <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
                  {generatedMatchIdxs.map(idx => {
                    const m = result.matches[idx];
                    const active = idx === selectedMatchIdx;
                    return (
                      <button
                        key={idx}
                        onClick={() => setSelectedMatchIdx(idx)}
                        style={{
                          padding:"7px 12px",
                          borderRadius:8,
                          border:`1px solid ${active ? C.accentBorder : C.border}`,
                          background: active ? C.accentDim : "transparent",
                          color: active ? C.accent : C.text,
                          fontSize:12,
                          fontWeight: active ? 700 : 500,
                          cursor:"pointer",
                          fontFamily:"inherit",
                        }}
                      >
                        {m?.functie || `Match ${idx+1}`}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {selectedDocs?.generating ? (
              <div style={{ textAlign: "center", padding: 40 }}>
                <div style={{ fontSize: 32, marginBottom: 12, display: "inline-block", animation: "spin 2s linear infinite" }}>⟳</div>
                <h3 style={{ margin: "0 0 4px", fontSize: 16 }}>Genereer documenten...</h3>
                <span style={{ fontSize: 12, color: C.accent }}>
                  {selectedDocs.generating === "cv" ? "CV profiel opbouwen..." : "Brief schrijven..."}
                </span>
              </div>
            ) : selectedMatch && (selectedDocs?.cv || selectedDocs?.brief) ? (
              <>
                {selectedDocs.vacTekst && (
                  <div style={{ background:C.purpleDim, border:`1px solid rgba(188,140,255,0.25)`, color:C.purple, padding:"8px 12px", borderRadius:10, fontSize:12 }}>
                    ✦ Brief is afgestemd op een aangeleverde vacaturetekst
                  </div>
                )}

                <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 16, padding: 24 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
                    <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: C.accent }}>Personal CV-Profile ({selectedMatch.functie})</h3>
                    <button onClick={() => copy(selectedDocs.cv, "cv")} style={{ background: "transparent", border: "none", color: C.muted, cursor: "pointer", fontSize: 12 }}>
                      {copied === "cv" ? "Gekopieerd ✓" : "Kopieer"}
                    </button>
                  </div>
                  <p style={{ margin: 0, fontSize: 14, lineHeight: 1.7, color: C.text, whiteSpace: "pre-line" }}>{selectedDocs.cv}</p>
                </div>

                <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 16, padding: 24 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
                    <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: C.accent }}>Sollicitatiebrief</h3>
                    <button onClick={() => copy(selectedDocs.brief, "brief")} style={{ background: "transparent", border: "none", color: C.muted, cursor: "pointer", fontSize: 12 }}>
                      {copied === "brief" ? "Gekopieerd ✓" : "Kopieer"}
                    </button>
                  </div>
                  <p style={{ margin: 0, fontSize: 14, lineHeight: 1.7, color: C.text, whiteSpace: "pre-line" }}>{selectedDocs.brief}</p>
                </div>
              </>
            ) : (
              <div style={{ textAlign: "center", padding: 40, color: C.muted, fontSize: 14 }}>
                Ga naar de <b>🎯 Matches</b> tab en klik op "Genereer CV & Brief" bij een functie om documenten te maken.
              </div>
            )}
          </div>
        )}
      </div>

      {/* Print-rapport gebruikt de momenteel geselecteerde match */}
      <PrintDocument
        answers={answers}
        result={result}
        selectedMatch={selectedMatch}
        cv={selectedDocs?.cv || ""}
        brief={selectedDocs?.brief || ""}
      />
    </div>
  );
}
