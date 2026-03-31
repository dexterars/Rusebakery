import { useState, useEffect, useCallback } from "react";
import {
  Bell, ExternalLink, RefreshCw,
  ChevronRight, Rss,
} from "lucide-react";

// ─── Global CSS ───────────────────────────────────────────────────────────────
const GLOBAL_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Rajdhani:wght@500;600;700&family=Outfit:wght@300;400;500;600;700&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  :root {
    --bg:           #0a0a0b;
    --card:         #111113;
    --card-h:       #18181b;
    --border:       rgba(255,255,255,0.06);
    --border-h:     rgba(255,255,255,0.12);
    --muted:        rgba(255,255,255,0.38);
    --dim:          rgba(255,255,255,0.18);
  }

  html { scroll-behavior: smooth; }

  body {
    background: var(--bg);
    color: rgba(255,255,255,0.95);
    font-family: 'Outfit', system-ui, sans-serif;
    -webkit-font-smoothing: antialiased;
    min-height: 100vh;
    overflow-x: hidden;
  }

  /* Grain overlay */
  body::before {
    content: '';
    position: fixed; inset: 0;
    pointer-events: none; z-index: 9999; opacity: 0.018;
    background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 512 512' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
  }

  ::-webkit-scrollbar { width: 3px; }
  ::-webkit-scrollbar-track { background: var(--bg); }
  ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.08); border-radius:2px; }

  @keyframes fadeUp {
    from { opacity:0; transform:translateY(11px); }
    to   { opacity:1; transform:translateY(0); }
  }
  @keyframes pulse-dot {
    0%,100% { opacity:1; box-shadow:0 0 5px #22c55e; }
    50%      { opacity:0.35; box-shadow:0 0 1px #22c55e; }
  }
  @keyframes float1 {
    0%,100% { transform: translate(0,   0)   scale(1);    }
    33%      { transform: translate(-40px, 30px) scale(1.08); }
    66%      { transform: translate(30px, -20px) scale(0.95); }
  }
  @keyframes float2 {
    0%,100% { transform: translate(0,   0)   scale(1);    }
    40%      { transform: translate(50px, -40px) scale(1.1);  }
    70%      { transform: translate(-20px, 30px) scale(0.92); }
  }
  @keyframes float3 {
    0%,100% { transform: translate(0,   0)   scale(1);    }
    30%      { transform: translate(-30px,-30px) scale(1.06); }
    65%      { transform: translate(40px, 20px)  scale(0.96); }
  }
  @keyframes spin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
  @keyframes shimmer {
    0%   { background-position:-400px 0; }
    100% { background-position:400px 0; }
  }

  .fu  { animation: fadeUp 0.42s ease both; }
  .fu1 { animation: fadeUp 0.42s 0.05s ease both; }
  .fu2 { animation: fadeUp 0.42s 0.10s ease both; }
  .fu3 { animation: fadeUp 0.42s 0.15s ease both; }

  .live-dot {
    width:7px; height:7px; border-radius:50%; background:#22c55e;
    animation: pulse-dot 2s infinite; flex-shrink:0;
  }

  .skeleton {
    background: linear-gradient(90deg,rgba(255,255,255,0.04)25%,rgba(255,255,255,0.07)50%,rgba(255,255,255,0.04)75%);
    background-size:400px 100%; animation:shimmer 1.5s infinite; border-radius:20px;
  }

  .n-card { transition: transform .22s ease, box-shadow .22s ease, background .22s ease, border-color .22s ease; }
  .n-card:hover { transform: translateY(-2px); }

  .c-card { transition: transform .24s ease, box-shadow .24s ease, filter .24s ease; }
  .c-card:hover { transform: translateY(-3px) scale(1.012); }

  .role-card { transition: transform .2s ease, box-shadow .2s ease, background .2s ease, border-color .2s ease; }
  .role-card:hover { transform: translateY(-2px); }

  .tab-btn {
    font-family:'Rajdhani',sans-serif; font-weight:700; font-size:13px;
    letter-spacing:.09em; text-transform:uppercase; cursor:pointer;
    border:none; outline:none; background:none;
    color:var(--muted); padding:9px 16px; border-radius:13px;
    transition: color .18s, background .18s;
  }
  .tab-btn.on { color:#fff; background:rgba(255,255,255,0.07); }

  .stt { font-family:'Bebas Neue',sans-serif; letter-spacing:.08em; }
  .rj  { font-family:'Rajdhani',sans-serif; }

  .blue-badge {
    font-family:'Rajdhani',sans-serif; font-size:9px; font-weight:700;
    letter-spacing:.14em; text-transform:uppercase;
    padding:2px 8px; border-radius:6px;
    background:rgba(50,130,255,0.16); border:1px solid rgba(80,150,255,0.32); color:#7eb8ff;
    flex-shrink:0;
  }

  .tag-pill {
    font-family:'Rajdhani',sans-serif; font-size:10px; font-weight:700;
    letter-spacing:.1em; text-transform:uppercase;
    padding:2px 8px; border-radius:6px; flex-shrink:0;
  }

  @media (max-width: 720px) {
    .meta-grid  { grid-template-columns: 1fr !important; }
    .comm-grid  { grid-template-columns: 1fr 1fr !important; }
    .role-grid  { grid-template-columns: repeat(3,1fr) !important; }
    .meta-label { display:none !important; }
    .comm-label { display:none !important; }
  }
  @media (max-width: 480px) {
    .comm-grid  { grid-template-columns: 1fr !important; }
    .role-grid  { grid-template-columns: 1fr !important; }
    .tab-btn    { padding:9px 10px; font-size:11px; }
  }
`;

// ─── Data ─────────────────────────────────────────────────────────────────────
//
// BLUE_POSTS are the static fallback shown while the live RSS is loading,
// or if all three proxy fetches fail.
// url → always the real BlueTracker listing; live RSS replaces these with
//        the exact per-thread permalinks once it loads successfully.
//

const BT_HOME = "https://www.bluetracker.gg/wow/";

const BLUE_POSTS = [
  { id:"bp1", blue:true, game:"WoW", source:"Blizzard · BlueTracker", time:"loading...", tags:["Tuning","Classes"],
    url: BT_HOME,
    title:"Class Tuning Incoming – March 31",
    excerpt:"We will be applying the following tuning changes with scheduled maintenance on Monday, March 31." },
  { id:"bp2", blue:true, game:"WoW", source:"Blizzard · BlueTracker", time:"loading...", tags:["Items","Crafting"],
    url: BT_HOME,
    title:"Recraft Myth Crests Are Gone",
    excerpt:"Recrafted items can no longer consume Myth Crests due to an unintended interaction discovered after the latest patch." },
  { id:"bp3", blue:true, game:"WoW", source:"Blizzard · BlueTracker", time:"loading...", tags:["Event","Community"],
    url: BT_HOME,
    title:"Play with the Blues: Void Assaults Stress Test – Friday, March 27" },
  { id:"bp4", blue:true, game:"WoW", source:"Blizzard · BlueTracker", time:"loading...", tags:["Weekly","News"],
    url: BT_HOME,
    title:"WoW Weekly: Midnight Season 1, \"A Place to Call Home\", Twitch Drop, and More!" },
  { id:"bp5", blue:true, game:"WoW", source:"Blizzard · BlueTracker", time:"loading...", tags:["Hotfix"],
    url: BT_HOME,
    title:"World of Warcraft: Midnight Hotfixes – March 26" },
  { id:"bp6", blue:true, game:"WoW", source:"Blizzard · BlueTracker", time:"loading...", tags:["Hotfix"],
    url: BT_HOME,
    title:"World of Warcraft: Midnight Hotfixes – March 25" },
  { id:"bp7", blue:true, game:"WoW", source:"Blizzard · BlueTracker", time:"loading...", tags:["Event","Community"],
    url: BT_HOME,
    title:"Play with the Blues: Abyss Anglers – Friday, March 27" },
  { id:"bp8", blue:true, game:"WoW", source:"Blizzard · BlueTracker", time:"loading...", tags:["PTR","Development"],
    url: BT_HOME,
    title:"12.0.5 PTR Development Notes" },
  { id:"bp9", blue:true, game:"WoW", source:"Blizzard · BlueTracker", time:"loading...", tags:["Event"],
    url: BT_HOME,
    title:"Play with the Blues: Void Assaults Stress Test – Friday, March 27" },
];

const WOW_ARTICLES = [
  {
    id:"w1", blue:false, game:"WoW", source:"Ruse's Bakery", time:"6 days ago", tags:["M+","Builds"], featured:true,
    // Internal page — no new tab
    url:null,
    title:"Mythic+ Season 1 Builds Now Live on Ruse's Bakery",
    excerpt:"Season 1 Midnight is live for Mythic+! Ruse's Bakery now showing M+ builds. Now it is time to gear up and chase those ratings!",
    grad:"linear-gradient(135deg,#10193a 0%,#0d1f3c 60%,#0a0a0b 100%)",
  },
  {
    id:"w2", blue:false, game:"WoW", source:"Wowhead", time:"2 days ago", tags:["Gear","BiS"],
    url:"https://www.wowhead.com/guide/best-in-slot/season-1-midnight-trinkets",
    title:"Best-in-Slot Trinkets for Season 1: Every Spec Ranked",
    itemLinks:[{ name:"Harrowbound Noose", id:212515 }],
  },
  {
    id:"w3", blue:false, game:"WoW", source:"MMO-Champion", time:"1 day ago", tags:["Raid","Guide"],
    url:"https://www.mmo-champion.com/content/10872-Undermine-Heroic-Boss-Guide-All-8-Encounters",
    title:"Undermine(d) Heroic Guide: All 8 Bosses with Strategies",
  },
  {
    id:"w4", blue:false, game:"WoW", source:"Wowhead", time:"5 days ago", tags:["PTR","Evoker"],
    url:"https://www.wowhead.com/news/augmentation-evoker-rework-12-0-5-ptr-ability-changes-full-breakdown-348821",
    title:"Augmentation Evoker Rework: Full Ability Changes in 12.0.5 PTR",
  },
];

const DOTA_ARTICLES = [
  {
    id:"d1", blue:false, game:"Dota 2", source:"Dota 2 Official", time:"3 days ago", tags:["Patch Notes"], featured:true,
    // Direct patch notes page on dota2.com
    url:"https://www.dota2.com/patches/7.38",
    title:"Patch 7.38 – The Frontiers Update: Kez, Map Changes & Full Balance Notes",
    excerpt:"Patch 7.38 drops with brand-new hero Kez, sweeping jungle camp adjustments, and major changes to the Lotus Pool mechanic.",
    grad:"linear-gradient(135deg,#1a0808 0%,#2d0d0d 60%,#0a0a0b 100%)",
  },
  {
    id:"d2", blue:false, game:"Dota 2", source:"Dota 2 Official", time:"1 day ago", tags:["Esports","TI 2025"],
    url:"https://www.dota2.com/newsentry/ti2025-regional-qualifiers-results",
    title:"TI 2025 Regional Qualifiers: All Brackets and Results",
  },
  {
    id:"d3", blue:false, game:"Dota 2", source:"Dota 2 Official", time:"4 days ago", tags:["Guide","Hero"],
    url:"https://www.dota2.com/hero/kez",
    title:"Kez Hero Guide: Abilities, Counters, Items, and Laning Tips",
  },
];

// ALL_ARTICLES is now assembled dynamically inside NewsSection
// (live BlueTracker posts + static WOW_ARTICLES + DOTA_ARTICLES)

// ─── Tag colours ──────────────────────────────────────────────────────────────

const TC = {
  "Tuning":      ["rgba(245,158,11,.12)","#fbbf24","rgba(245,158,11,.22)"],
  "Classes":     ["rgba(139,92,246,.12)","#a78bfa","rgba(139,92,246,.22)"],
  "Items":       ["rgba(255,128,0,.12)", "#fb923c","rgba(255,128,0,.22)"],
  "Crafting":    ["rgba(255,128,0,.10)", "#fb923c","rgba(255,128,0,.18)"],
  "Event":       ["rgba(236,72,153,.12)","#f472b6","rgba(236,72,153,.22)"],
  "Community":   ["rgba(34,211,238,.10)","#22d3ee","rgba(34,211,238,.18)"],
  "Weekly":      ["rgba(34,197,94,.10)", "#4ade80","rgba(34,197,94,.18)"],
  "Hotfix":      ["rgba(239,68,68,.12)", "#f87171","rgba(239,68,68,.22)"],
  "PTR":         ["rgba(251,146,60,.12)","#fb923c","rgba(251,146,60,.22)"],
  "Development": ["rgba(96,165,250,.10)","#60a5fa","rgba(96,165,250,.18)"],
  "M+":          ["rgba(16,185,129,.12)","#34d399","rgba(16,185,129,.22)"],
  "Builds":      ["rgba(16,185,129,.10)","#34d399","rgba(16,185,129,.18)"],
  "Gear":        ["rgba(139,92,246,.12)","#a78bfa","rgba(139,92,246,.22)"],
  "BiS":         ["rgba(139,92,246,.10)","#a78bfa","rgba(139,92,246,.18)"],
  "Raid":        ["rgba(239,68,68,.12)", "#f87171","rgba(239,68,68,.22)"],
  "Guide":       ["rgba(6,182,212,.12)", "#22d3ee","rgba(6,182,212,.22)"],
  "Evoker":      ["rgba(139,92,246,.12)","#c4b5fd","rgba(139,92,246,.22)"],
  "Patch Notes": ["rgba(245,158,11,.12)","#fbbf24","rgba(245,158,11,.22)"],
  "Esports":     ["rgba(236,72,153,.12)","#f472b6","rgba(236,72,153,.22)"],
  "TI 2025":     ["rgba(239,68,68,.12)", "#f87171","rgba(239,68,68,.22)"],
  "Hero":        ["rgba(194,60,42,.12)", "#f87171","rgba(194,60,42,.22)"],
  "News":        ["rgba(255,255,255,.05)","rgba(255,255,255,.4)","rgba(255,255,255,.1)"],
};

function TagPill({ tag }) {
  const [bg, color, border] = TC[tag] ?? TC["News"];
  return <span className="tag-pill" style={{ background:bg, color, border:`1px solid ${border}` }}>{tag}</span>;
}

// ─── SVG Icons ────────────────────────────────────────────────────────────────

const DiscordIcon = ({ size=20, color="#b9bdff" }) => (
  <svg width={size} height={size*.76} viewBox="0 0 127.14 96.36" fill={color}>
    <path d="M107.7,8.07A105.15,105.15,0,0,0,81.47,0a72.06,72.06,0,0,0-3.36,6.83A97.68,97.68,0,0,0,49,6.83,72.37,72.37,0,0,0,45.64,0,105.89,105.89,0,0,0,19.39,8.09C2.79,32.65-1.71,56.6.54,80.21h0A105.73,105.73,0,0,0,32.71,96.36,77.7,77.7,0,0,0,39.6,85.25a68.42,68.42,0,0,1-10.85-5.18c.91-.66,1.8-1.34,2.66-2a75.57,75.57,0,0,0,64.32,0c.87.71,1.76,1.39,2.66,2a68.68,68.68,0,0,1-10.87,5.19,77,77,0,0,0,6.89,11.1A105.25,105.25,0,0,0,126.6,80.22h0C129.24,52.84,122.09,29.11,107.7,8.07ZM42.45,65.69C36.18,65.69,31,60,31,53s5-12.74,11.43-12.74S54,46,53.89,53,48.84,65.69,42.45,65.69Zm42.24,0C78.41,65.69,73.25,60,73.25,53s5-12.74,11.44-12.74S96.23,46,96.12,53,91.08,65.69,84.69,65.69Z"/>
  </svg>
);

const BlizzardWM = () => (
  <div style={{ position:"absolute", right:-8, top:"50%", transform:"translateY(-50%)", width:80, height:80, opacity:.055, pointerEvents:"none" }}>
    <svg viewBox="0 0 100 100" fill="none">
      <circle cx="50" cy="50" r="46" stroke="white" strokeWidth="4"/>
      <circle cx="50" cy="50" r="30" stroke="white" strokeWidth="3"/>
      <path d="M50 20 L56 38 L76 38 L61 50 L67 68 L50 57 L33 68 L39 50 L24 38 L44 38 Z" fill="white"/>
    </svg>
  </div>
);

const GameDot = ({ game }) => {
  if (game === "WoW")    return <div style={{ width:8,height:8,borderRadius:"50%",background:"#3b82f6",boxShadow:"0 0 4px #3b82f6",flexShrink:0 }} />;
  if (game === "Dota 2") return <div style={{ width:8,height:8,borderRadius:"50%",background:"#ef4444",boxShadow:"0 0 4px #ef4444",flexShrink:0 }} />;
  return <div style={{ width:8,height:8,borderRadius:"50%",background:"#a78bfa",flexShrink:0 }} />;
};

// ─── News Card ────────────────────────────────────────────────────────────────

function NewsCard({ article, index }) {
  const [hv, setHv] = useState(false);

  const isBlue = article.blue;
  const isFeat = article.featured;

  const cardBg   = isBlue ? (hv ? "rgba(25,85,200,.1)" : "rgba(18,65,160,.05)") : (hv ? "#18181b" : "#111113");
  const border   = isBlue ? (hv ? "rgba(80,150,255,.48)" : "rgba(50,130,255,.22)") : (hv ? "rgba(255,255,255,.1)" : "rgba(255,255,255,.06)");
  const shadow   = hv ? (isBlue ? "0 8px 32px rgba(30,100,255,.13),0 0 0 1px rgba(80,150,255,.12)" : "0 8px 28px rgba(0,0,0,.45)") : "none";
  const titleClr = hv ? (isBlue ? "#7eb8ff" : article.game === "Dota 2" ? "#f87171" : "#fbbf24") : "rgba(255,255,255,.93)";

  // URL resolution:
  // - null/undefined → internal link, no new tab, no href
  // - any https:// string → external, open in new tab
  const isExternal = article.url && article.url.startsWith("http");
  const href       = isExternal ? article.url : undefined;
  const linkTarget = isExternal ? "_blank" : "_self";

  return (
    <a
      href={href}
      target={linkTarget}
      rel={isExternal ? "noopener noreferrer" : undefined}
      style={{ textDecoration:"none", display:"block", animation:`fadeUp .4s ${index*52}ms ease both`, opacity:0,
               cursor: href ? "pointer" : "default" }}
      onMouseEnter={()=>setHv(true)}
      onMouseLeave={()=>setHv(false)}
      // Prevent no-href <a> from being a focus trap
      tabIndex={href ? 0 : -1}
    >
      <div className="n-card" style={{ position:"relative", overflow:"hidden", borderRadius:20, border:`1px solid ${border}`, background:cardBg, boxShadow:shadow, padding: isFeat ? 0 : "14px 16px" }}>
        {isBlue && <BlizzardWM />}

        {/* ── Featured card ── */}
        {isFeat && (
          <>
            <div style={{ height:80, background:article.grad, position:"relative" }}>
              <div style={{ position:"absolute",right:20,top:"50%",transform:"translateY(-50%)",width:55,height:55,borderRadius:"50%",background:"radial-gradient(circle,rgba(255,255,255,.07) 0%,transparent 70%)",border:"1px solid rgba(255,255,255,.07)" }} />
              <div style={{ position:"absolute",right:55,top:"25%",width:32,height:32,borderRadius:"50%",background:"radial-gradient(circle,rgba(255,255,255,.05) 0%,transparent 70%)",border:"1px solid rgba(255,255,255,.05)" }} />
            </div>
            <div style={{ padding:"12px 16px 14px" }}>
              <div style={{ display:"flex",alignItems:"center",gap:7,marginBottom:8,flexWrap:"wrap" }}>
                <GameDot game={article.game} />
                {article.tags?.map(t=><TagPill key={t} tag={t}/>)}
                <span style={{ marginLeft:"auto",fontSize:11,color:"var(--dim)",fontFamily:"'Rajdhani',sans-serif",fontWeight:600 }}>{article.time}</span>
              </div>
              <h3 style={{ fontFamily:"'Rajdhani',sans-serif",fontWeight:700,fontSize:15,lineHeight:1.25,color:titleClr,transition:"color .2s",marginBottom:6 }}>{article.title}</h3>
              {article.excerpt && <p style={{ fontSize:12,color:"var(--muted)",lineHeight:1.55,display:"-webkit-box",WebkitLineClamp:2,WebkitBoxOrient:"vertical",overflow:"hidden" }}>{article.excerpt}</p>}
            </div>
          </>
        )}

        {/* ── Standard card ── */}
        {!isFeat && (
          <>
            <div style={{ display:"flex",alignItems:"center",gap:7,marginBottom:7,flexWrap:"wrap" }}>
              <GameDot game={article.game} />
              {isBlue && <span className="blue-badge">BLUE POST</span>}
              {article.tags?.map(t=><TagPill key={t} tag={t}/>)}
              <span style={{ marginLeft:"auto",fontSize:11,color:"var(--dim)",fontFamily:"'Rajdhani',sans-serif",fontWeight:600,flexShrink:0 }}>{article.time}</span>
            </div>

            <h3 style={{ fontFamily:"'Rajdhani',sans-serif",fontWeight:700,fontSize:14.5,lineHeight:1.25,color:titleClr,transition:"color .2s" }}>{article.title}</h3>

            {article.excerpt && <p style={{ fontSize:12,color:"var(--muted)",lineHeight:1.55,marginTop:5,display:"-webkit-box",WebkitLineClamp:2,WebkitBoxOrient:"vertical",overflow:"hidden" }}>{article.excerpt}</p>}

            {article.itemLinks?.map(item=>(
              <a key={item.id} href={`https://www.wowhead.com/item=${item.id}`}
                 data-wowhead={`item=${item.id}`}
                 target="_blank" rel="noopener noreferrer"
                 onClick={e=>e.stopPropagation()}
                 style={{ display:"inline-block",marginTop:5,fontSize:11,color:"rgba(255,128,0,.65)",textDecoration:"underline",textDecorationColor:"rgba(255,128,0,.25)" }}>
                {item.name}
              </a>
            ))}

            <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between",marginTop:8 }}>
              {/* Source label — BlueTracker posts show the BT domain as a subtle hint */}
              <div style={{ display:"flex",alignItems:"center",gap:5 }}>
                <span className="rj" style={{ fontSize:11,color:"var(--dim)",fontWeight:600,letterSpacing:".06em",textTransform:"uppercase" }}>
                  {article.source}
                </span>
                {isBlue && (
                  <span style={{ fontSize:9,color:"rgba(80,150,255,.45)",fontFamily:"'Rajdhani',sans-serif",fontWeight:600,letterSpacing:".04em" }}>
                    · bluetracker.gg
                  </span>
                )}
              </div>
              {/* "Read" arrow — only shown when card is actually clickable */}
              {isExternal && (
                <div style={{ display:"flex",alignItems:"center",gap:4 }}>
                  <span className="rj" style={{ fontSize:10,fontWeight:700,letterSpacing:".08em",textTransform:"uppercase",color:hv?(isBlue?"#7eb8ff":article.game==="Dota 2"?"#f87171":"#fbbf24"):"var(--dim)",transition:"color .2s" }}>
                    Read
                  </span>
                  <ChevronRight size={13} style={{ color:hv?(isBlue?"#7eb8ff":article.game==="Dota 2"?"#f87171":"#fbbf24"):"var(--dim)",transition:"color .2s,transform .2s",transform:hv?"translateX(2px)":"translateX(0)" }} />
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </a>
  );
}

// ─── Community Cards ──────────────────────────────────────────────────────────

const COMM = [
  { id:"discord",  label:"DISCORD",      url:"https://discord.gg/3yKHBx3JZ",          acc:"#5865F2", desc:"Join the Ruse's Bakery community. Discuss meta, share builds, get exclusive updates.",
    Icon: () => <DiscordIcon size={22} color="#5865F2" /> },
  { id:"wowhead",  label:"WOWHEAD",       url:"https://www.wowhead.com",               acc:"#ff8000", desc:"The largest WoW database. Items, quests, guides, talent calculators, and news.",
    Icon: () => <svg width={22} height={22} viewBox="0 0 100 100"><circle cx="50" cy="50" r="46" fill="rgba(255,128,0,.12)" stroke="rgba(255,128,0,.3)" strokeWidth="2"/><path d="M50 15 L62 38 L88 38 L67 55 L75 80 L50 65 L25 80 L33 55 L12 38 L38 38 Z" fill="#ff8000" opacity=".9"/></svg> },
  { id:"mmo",      label:"MMO-CHAMPION",  url:"https://www.mmo-champion.com",          acc:"#4da6ff", desc:"Breaking WoW news, patch notes, datamining, and top-tier community forums.",
    Icon: () => <svg width={22} height={22} viewBox="0 0 100 100"><rect width="100" height="100" rx="18" fill="rgba(77,166,255,.12)" stroke="rgba(77,166,255,.3)" strokeWidth="2"/><path d="M20 30h60M20 50h60M20 70h40" stroke="#4da6ff" strokeWidth="8" strokeLinecap="round"/><circle cx="75" cy="70" r="10" fill="#4da6ff"/></svg> },
  { id:"dota2",    label:"DOTA 2 NEWS",   url:"https://www.dota2.com/news",            acc:"#c23c2a", desc:"Official patch notes, hero updates, esports coverage, and The International news.",
    Icon: () => <svg width={22} height={22} viewBox="0 0 100 100"><circle cx="50" cy="50" r="46" fill="rgba(194,60,42,.12)" stroke="rgba(194,60,42,.3)" strokeWidth="2"/><text x="50" y="67" textAnchor="middle" fontSize="52" fontWeight="900" fill="#c23c2a" fontFamily="serif">D</text></svg> },
];

function CommCard({ card, index }) {
  const [hv, setHv] = useState(false);
  const { Icon } = card;
  const a = card.acc;

  return (
    <a href={card.url} target="_blank" rel="noopener noreferrer" style={{ textDecoration:"none", display:"block", animation:`fadeUp .42s ${0.25 + index*0.07}s ease both`, opacity:0 }}
       onMouseEnter={()=>setHv(true)} onMouseLeave={()=>setHv(false)}>
      <div className="c-card" style={{
        borderRadius:22, height:"100%", cursor:"pointer",
        border:`1px solid ${hv ? a+"66" : a+"28"}`,
        background: hv ? `linear-gradient(135deg,${a}20 0%,${a}05 100%)` : `linear-gradient(135deg,${a}10 0%,${a}02 100%)`,
        boxShadow: hv ? `0 12px 36px ${a}28,0 0 0 1px ${a}22` : "none",
        padding:"22px 20px", position:"relative", overflow:"hidden",
        display:"flex", flexDirection:"column", gap:12,
      }}>
        {/* Glow orb */}
        <div style={{ position:"absolute",top:-28,right:-28,width:90,height:90,borderRadius:"50%",background:`radial-gradient(circle,${a}18 0%,transparent 70%)`,opacity:hv?1:0.35,transition:"opacity .3s",pointerEvents:"none" }} />

        <div style={{ display:"flex",alignItems:"center",gap:12 }}>
          <div style={{ width:46,height:46,borderRadius:14,background:`${a}18`,border:`1px solid ${a}30`,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0 }}>
            <Icon />
          </div>
          <div className="stt" style={{ fontSize:18,color:hv?"#fff":"rgba(255,255,255,.88)",transition:"color .2s" }}>{card.label}</div>
          <ExternalLink size={13} style={{ marginLeft:"auto",color:hv?a:"var(--dim)",transition:"color .2s" }} />
        </div>

        <p style={{ fontSize:12,color:"var(--muted)",lineHeight:1.6 }}>{card.desc}</p>

        <div className="rj" style={{ marginTop:"auto",display:"flex",alignItems:"center",gap:5,fontSize:11,fontWeight:700,letterSpacing:".08em",textTransform:"uppercase",color:hv?a:"var(--dim)",transition:"color .2s" }}>
          Visit <ChevronRight size={11} style={{ transform:hv?"translateX(3px)":"translateX(0)",transition:"transform .2s" }} />
        </div>
      </div>
    </a>
  );
}

// ─── Meta Rankings ────────────────────────────────────────────────────────────

const ROLES = [
  {
    label: "DPS",
    url:   "https://murlok.io/meta/dps/m+",
    col:   "#f97316",
    glow:  "rgba(249,115,22,0.30)",
    border:"rgba(249,115,22,0.55)",
    icon:  "https://render.worldofwarcraft.com/us/icons/56/ability_backstab.jpg",
  },
  {
    label: "HEALER",
    url:   "https://murlok.io/meta/healer/m+",
    col:   "#22c55e",
    glow:  "rgba(34,197,94,0.28)",
    border:"rgba(34,197,94,0.55)",
    icon:  "https://render.worldofwarcraft.com/us/icons/56/spell_holy_flashheal.jpg",
  },
  {
    label: "TANK",
    url:   "https://murlok.io/meta/tank/m+",
    col:   "#3b82f6",
    glow:  "rgba(59,130,246,0.28)",
    border:"rgba(59,130,246,0.55)",
    icon:  "https://render.worldofwarcraft.com/us/icons/56/ability_defend.jpg",
  },
];

function RoleCapsule({ role }) {
  const [hv, setHv] = useState(false);
  return (
    <a
      href={role.url}
      target="_blank"
      rel="noopener noreferrer"
      style={{ textDecoration: "none", display: "block" }}
      onMouseEnter={() => setHv(true)}
      onMouseLeave={() => setHv(false)}
    >
      <div style={{
        /* ── Capsule shell ── */
        display:        "flex",
        alignItems:     "center",
        gap:            12,
        padding:        "10px 20px 10px 10px",
        borderRadius:   50,                        // full pill
        border:         `1px solid ${hv ? role.border : role.col + "30"}`,
        background:     hv
          ? `rgba(0,0,0,0.82)`
          : `rgba(0,0,0,0.70)`,
        backdropFilter: "blur(10px)",
        boxShadow:      hv
          ? `0 0 0 1px ${role.border}, 0 8px 28px ${role.glow}`
          : `0 0 0 1px ${role.col}18`,
        cursor:         "pointer",
        /* ── Scale-up hover ── */
        transform:      hv ? "scale(1.05)" : "scale(1)",
        transition:     "transform .22s ease, box-shadow .22s ease, border-color .22s ease, background .22s ease",
        userSelect:     "none",
        willChange:     "transform",
      }}>

        {/* Role icon — rounded square with coloured ring */}
        <div style={{
          width:       42,
          height:      42,
          borderRadius: 50,
          border:      `2px solid ${hv ? role.col : role.col + "60"}`,
          overflow:    "hidden",
          flexShrink:  0,
          boxShadow:   hv ? `0 0 10px ${role.glow}` : "none",
          transition:  "border-color .22s, box-shadow .22s",
        }}>
          <img
            src={role.icon}
            alt={role.label}
            width={42}
            height={42}
            style={{ display:"block", width:"100%", height:"100%", objectFit:"cover" }}
          />
        </div>

        {/* Label */}
        <span className="stt" style={{
          fontSize:      22,
          letterSpacing: ".1em",
          color:         hv ? "#fff" : "rgba(255,255,255,.82)",
          transition:    "color .2s",
          lineHeight:    1,
        }}>
          {role.label}
        </span>

        {/* Arrow — appears on hover */}
        <span style={{
          marginLeft:  "auto",
          fontSize:    16,
          color:       role.col,
          opacity:     hv ? 1 : 0,
          transform:   hv ? "translateX(0)" : "translateX(-4px)",
          transition:  "opacity .2s, transform .2s",
        }}>→</span>
      </div>
    </a>
  );
}

function MetaRankings() {
  return (
    <div style={{ display:"grid", gridTemplateColumns:"200px 1fr", gap:20, alignItems:"center", marginBottom:36 }}
         className="meta-grid fu2">

      {/* Left description */}
      <div className="meta-label">
        <div className="stt" style={{ fontSize:26, color:"#fff", marginBottom:8 }}>META RANKINGS</div>
        <p style={{ fontSize:12, color:"var(--muted)", lineHeight:1.65 }}>
          Explore the meta and discover how each role ranks across class specializations.
          Powered by <span style={{ color:"rgba(255,255,255,.4)" }}>murlok.io</span>.
        </p>
      </div>

      {/* Three capsule pills */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:12 }}
           className="role-grid">
        {ROLES.map(r => <RoleCapsule key={r.label} role={r} />)}
      </div>
    </div>
  );
}

// ─── Header ───────────────────────────────────────────────────────────────────

function Header({ scrolled }) {
  return (
    <header style={{ position:"sticky",top:0,zIndex:100,background:scrolled?"rgba(10,10,11,.92)":"transparent",backdropFilter:scrolled?"blur(20px)":"none",borderBottom:scrolled?"1px solid var(--border)":"1px solid transparent",transition:"all .3s" }}>
      <div style={{ maxWidth:900,margin:"0 auto",padding:"0 20px",display:"flex",alignItems:"center",height:60,gap:12 }}>
        <div style={{ display:"flex",alignItems:"center",gap:10,flexShrink:0 }}>
          <div style={{ width:34,height:34,background:"linear-gradient(135deg,#f59e0b,#a78bfa)",borderRadius:10,display:"flex",alignItems:"center",justifyContent:"center" }}>
            <Rss size={16} color="#fff" />
          </div>
          <div>
            <div className="stt" style={{ fontSize:16,color:"rgba(255,255,255,.95)",lineHeight:1 }}>RUSE'S BAKERY</div>
            <div className="rj" style={{ fontSize:9,color:"var(--dim)",letterSpacing:".12em",fontWeight:600 }}>GAMING NEWS</div>
          </div>
        </div>
        <div style={{ flex:1 }} />
        <a href="https://discord.gg/3yKHBx3JZ" target="_blank" rel="noopener noreferrer"
           style={{ display:"flex",alignItems:"center",gap:8,padding:"8px 16px",borderRadius:12,border:"1px solid rgba(88,101,242,.35)",background:"rgba(88,101,242,.12)",color:"rgba(185,189,255,.9)",fontSize:12,fontFamily:"'Rajdhani',sans-serif",fontWeight:700,letterSpacing:".08em",textTransform:"uppercase",textDecoration:"none",transition:"all .2s" }}
           onMouseEnter={e=>{e.currentTarget.style.background="rgba(88,101,242,.22)";e.currentTarget.style.borderColor="rgba(88,101,242,.55)";}}
           onMouseLeave={e=>{e.currentTarget.style.background="rgba(88,101,242,.12)";e.currentTarget.style.borderColor="rgba(88,101,242,.35)";}}>
          <DiscordIcon size={14} color="#b9bdff" /> Discord
        </a>
      </div>
    </header>
  );
}

// ─── RSS helpers ─────────────────────────────────────────────────────────────
// ─── RSS fetch — multi-proxy fallback ────────────────────────────────────────
//
// Three independent CORS proxies tried in order.  If one fails the next is
// attempted automatically, so a single unreachable proxy never blocks the feed.
//
//  1. corsproxy.io  – returns raw XML text directly
//  2. allorigins    – returns JSON { contents: "<xml>..." }
//  3. rss2json      – returns pre-parsed JSON { items: [...] }
//
const BT_RSS     = "https://www.bluetracker.gg/wow/feed/";
const REFRESH_MS = 90 * 60 * 1000;   // auto-refresh every 90 minutes

/** Relative-time: Date → "3m ago" / "2h ago" / "4d ago" */
function relTime(date) {
  const s = Math.floor((Date.now() - date) / 1000);
  if (s < 60)     return `${s}s ago`;
  if (s < 3600)   return `${Math.floor(s / 60)}m ago`;
  if (s < 86400)  return `${Math.floor(s / 3600)}h ago`;
  return `${Math.floor(s / 86400)}d ago`;
}

function clockStr(date) {
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

/** Derive category tags from a post title */
function tagsFromTitle(title) {
  const t = title.toLowerCase();
  if (t.includes("hotfix"))     return ["Hotfix"];
  if (t.includes("tuning"))     return ["Tuning", "Classes"];
  if (t.includes("ptr"))        return ["PTR", "Development"];
  if (t.includes("weekly"))     return ["Weekly", "News"];
  if (t.includes("play with"))  return ["Event", "Community"];
  if (t.includes("recraft"))    return ["Items", "Crafting"];
  if (t.includes("season"))     return ["Season"];
  return ["News"];
}

/** Shape a raw item object (from any proxy) into our article schema */
function shapeItem(i, { title, link, pubDate, description }) {
  const parsed  = pubDate ? new Date(pubDate) : new Date();
  const excerpt = (description ?? "")
    .replace(/<[^>]+>/g, "")
    .replace(/&[a-z#0-9]+;/g, " ")
    .replace(/\s+/g, " ")
    .slice(0, 200)
    .trim() || undefined;

  // Guarantee a valid URL — if the RSS gave us one, use it; else fall back to BT home
  const safeUrl = (link && link.startsWith("http")) ? link : BT_HOME;

  return {
    id:     `bt-live-${i}`,
    blue:   true,
    game:   "WoW",
    source: "Blizzard · BlueTracker",
    time:   relTime(parsed),
    _ts:    parsed,
    url:    safeUrl,
    tags:   tagsFromTitle(title ?? ""),
    title:  (title ?? "(no title)").trim(),
    excerpt,
  };
}

/**
 * fetchBlueTracker()
 *
 * Tries four strategies in order, stopping at the first success.
 *
 *  1. rss2json.com   — dedicated RSS-to-JSON API, most reliable, no XML parsing needed
 *  2. corsproxy.io   — raw proxy, we parse XML ourselves
 *  3. allorigins.win — JSON wrapper { contents }, we parse XML ourselves
 *  4. thingproxy.freeboard.io — last resort raw proxy
 *
 * Returns an array of shaped article objects, or null if every strategy fails.
 */
async function fetchBlueTracker() {
  const encoded = encodeURIComponent(BT_RSS);
  const TIMEOUT = 9000;

  // ── Shared XML parser (used by strategies 2-4) ──────────────────────────────
  function parseXML(text) {
    const xml   = new DOMParser().parseFromString(text, "text/xml");
    const items = Array.from(xml.querySelectorAll("item")).slice(0, 30);
    if (items.length === 0) return null;
    return items.map((el, i) => {
      // <link> in RSS 2.0 is a plain text node between the tag — NOT an attribute.
      // We must walk the siblings of the <link> element to get the text.
      const linkEl  = el.querySelector("link");
      const rawLink = linkEl
        ? (linkEl.textContent?.trim() || linkEl.nextSibling?.textContent?.trim())
        : undefined;
      return shapeItem(i, {
        title:       el.querySelector("title")?.textContent,
        link:        rawLink,
        pubDate:     el.querySelector("pubDate")?.textContent,
        description: el.querySelector("description")?.textContent,
      });
    });
  }

  // ── Strategy 1: rss2json.com ─────────────────────────────────────────────────
  try {
    const res = await fetch(
      `https://api.rss2json.com/v1/api.json?rss_url=${encoded}&count=30&order_by=pubDate&order_dir=desc`,
      { signal: AbortSignal.timeout(TIMEOUT) }
    );
    if (res.ok) {
      const json = await res.json();
      if (json.status === "ok" && json.items?.length > 0) {
        return json.items.map((item, i) => shapeItem(i, {
          title:       item.title,
          link:        item.link,
          pubDate:     item.pubDate,
          description: item.description ?? item.content,
        }));
      }
    }
  } catch { /* fall through */ }

  // ── Strategy 2: corsproxy.io ─────────────────────────────────────────────────
  try {
    const res = await fetch(`https://corsproxy.io/?${encoded}`, { signal: AbortSignal.timeout(TIMEOUT) });
    if (res.ok) {
      const result = parseXML(await res.text());
      if (result) return result;
    }
  } catch { /* fall through */ }

  // ── Strategy 3: allorigins.win ───────────────────────────────────────────────
  try {
    const res = await fetch(`https://api.allorigins.win/get?url=${encoded}`, { signal: AbortSignal.timeout(TIMEOUT) });
    if (res.ok) {
      const json = await res.json();
      const result = parseXML(json.contents ?? "");
      if (result) return result;
    }
  } catch { /* fall through */ }

  // ── Strategy 4: thingproxy (last resort) ─────────────────────────────────────
  try {
    const res = await fetch(`https://thingproxy.freeboard.io/fetch/${BT_RSS}`, { signal: AbortSignal.timeout(TIMEOUT) });
    if (res.ok) {
      const result = parseXML(await res.text());
      if (result) return result;
    }
  } catch { /* fall through */ }

  return null; // all strategies failed → use mock data
}

// ─── News Section ─────────────────────────────────────────────────────────────

const TABS = [
  { id:"all",  label:"ALL NEWS" },
  { id:"wow",  label:"WOW" },
  { id:"dota", label:"DOTA 2" },
  { id:"blue", label:"BLUE POSTS" },
];

function NewsSection({ tab, setTab }) {
  // livePosts: null = not yet fetched | [] = fetch failed / empty | [...] = success
  const [livePosts,   setLivePosts]   = useState(null);
  const [fetching,    setFetching]    = useState(false);
  const [fetchError,  setFetchError]  = useState(false);
  const [lastFetched, setLastFetched] = useState(null); // Date object
  const [tickAge,     setTickAge]     = useState(0);    // seconds since last fetch

  // ── Core fetch function ──────────────────────────────────────────────────────
  const doFetch = useCallback(async (showSpinner = true) => {
    if (showSpinner) setFetching(true);
    setFetchError(false);
    const posts = await fetchBlueTracker();
    if (posts && posts.length > 0) {
      setLivePosts(posts);
      setFetchError(false);
    } else {
      // Keep whatever we had; just flag the error
      setFetchError(true);
    }
    setLastFetched(new Date());
    setTickAge(0);
    setFetching(false);
  }, []);

  // ── Initial fetch + auto-refresh every 90 min ────────────────────────────────
  useEffect(() => {
    doFetch(true);                                       // immediate on mount
    const iv = setInterval(() => doFetch(false), REFRESH_MS);
    return () => clearInterval(iv);
  }, [doFetch]);

  // ── Tick "Xs ago" counter every second ──────────────────────────────────────
  useEffect(() => {
    const iv = setInterval(() => setTickAge(a => a + 1), 1000);
    return () => clearInterval(iv);
  }, []);

  // ── Age string shown in the header ──────────────────────────────────────────
  const ageLabel = lastFetched
    ? relTime(lastFetched).toUpperCase()
    : "…";

  // ── Next auto-refresh countdown ─────────────────────────────────────────────
  const nextRefreshSec = lastFetched
    ? Math.max(0, Math.round((REFRESH_MS / 1000) - tickAge))
    : null;
  const nextLabel = nextRefreshSec !== null
    ? nextRefreshSec > 60
      ? `next in ${Math.ceil(nextRefreshSec / 60)}m`
      : `next in ${nextRefreshSec}s`
    : "";

  // ── Choose data source: live RSS > mock ─────────────────────────────────────
  // Re-format relative times on every tick so they stay current
  const bluePosts = (livePosts ?? BLUE_POSTS).map(a =>
    a._ts ? { ...a, time: relTime(a._ts) } : a
  );
  const allArticles = [...bluePosts, ...WOW_ARTICLES, ...DOTA_ARTICLES];

  const articles = allArticles.filter(a => {
    if (tab === "all")  return true;
    if (tab === "wow")  return a.game === "WoW";
    if (tab === "dota") return a.game === "Dota 2";
    if (tab === "blue") return a.blue;
    return true;
  });

  // ── Manual refresh ───────────────────────────────────────────────────────────
  const handleRefresh = () => doFetch(true);

  return (
    <section style={{ marginBottom:52 }}>

      {/* ── Section header ── */}
      <div className="fu" style={{ display:"flex",flexDirection:"column",alignItems:"center",marginBottom:28 }}>
        <div style={{ display:"flex",alignItems:"center",gap:14,marginBottom:10 }}>
          <Bell size={30} color="#fff" strokeWidth={1.5} />
          <span className="stt" style={{ fontSize:34,color:"#fff",letterSpacing:".1em" }}>NEWS</span>
        </div>

        <div style={{ display:"flex",alignItems:"center",gap:8,flexWrap:"wrap",justifyContent:"center" }}>
          {/* Live dot */}
          <div className="live-dot" />

          {/* "Last updated X ago" */}
          <span className="rj" style={{ fontSize:11,color:"var(--muted)",fontWeight:600,letterSpacing:".06em" }}>
            LIVE FEED · UPDATED {ageLabel}
          </span>

          {/* Next auto-refresh hint */}
          {nextLabel && (
            <span className="rj" style={{ fontSize:10,color:"var(--dim)",fontWeight:600,letterSpacing:".04em" }}>
              · {nextLabel}
            </span>
          )}

          {/* Source badge — green when live data loaded */}
          {livePosts && !fetchError && (
            <span style={{ fontSize:9,padding:"2px 8px",borderRadius:6,
              background:"rgba(34,197,94,.1)",border:"1px solid rgba(34,197,94,.2)",
              color:"#4ade80",fontFamily:"'Rajdhani',sans-serif",fontWeight:700,letterSpacing:".1em" }}>
              LIVE · BLUETRACKER
            </span>
          )}

          {/* Error badge — shows when all proxies failed; clicking opens BT directly */}
          {fetchError && (
            <a href="https://www.bluetracker.gg/wow/" target="_blank" rel="noopener noreferrer"
               title="Click to view BlueTracker directly"
               style={{ fontSize:9,padding:"2px 10px",borderRadius:6, cursor:"pointer",
                 background:"rgba(239,68,68,.1)",border:"1px solid rgba(239,68,68,.2)",
                 color:"#f87171",fontFamily:"'Rajdhani',sans-serif",fontWeight:700,
                 letterSpacing:".1em", textDecoration:"none",
                 display:"flex",alignItems:"center",gap:5 }}>
              ⚠ PROXY FAILED — CLICK TO VIEW ON BLUETRACKER.GG
            </a>
          )}

          {/* Manual refresh button */}
          <button
            onClick={handleRefresh}
            disabled={fetching}
            style={{ background:"none",border:"none",cursor:fetching?"default":"pointer",
              color:"var(--dim)",display:"flex",alignItems:"center",gap:4,
              fontSize:11,fontFamily:"'Rajdhani',sans-serif",fontWeight:600,letterSpacing:".06em",
              padding:"3px 8px",borderRadius:8,transition:"color .2s,background .2s",
              opacity:fetching?0.5:1 }}
            onMouseEnter={e=>{ if(!fetching){ e.currentTarget.style.color="#fff"; e.currentTarget.style.background="rgba(255,255,255,.05)"; }}}
            onMouseLeave={e=>{ e.currentTarget.style.color="var(--dim)"; e.currentTarget.style.background="none"; }}>
            <RefreshCw size={11} style={{ animation:fetching?"spin .8s linear infinite":"none" }} />
            REFRESH
          </button>
        </div>
      </div>

      {/* ── Tab bar ── */}
      <div className="fu1" style={{ display:"flex",gap:4,background:"#111113",border:"1px solid var(--border)",borderRadius:17,padding:5,marginBottom:16 }}>
        {TABS.map(t => (
          <button key={t.id} className={`tab-btn${tab===t.id?" on":""}`}
            onClick={()=>setTab(t.id)} style={{ flex:1 }}>
            {t.label}
            {/* Live count badge on BLUE POSTS tab */}
            {t.id === "blue" && livePosts && (
              <span style={{ marginLeft:5,fontSize:9,padding:"1px 6px",borderRadius:5,
                background:"rgba(34,197,94,.12)",border:"1px solid rgba(34,197,94,.22)",
                color:"#4ade80",verticalAlign:"middle",fontWeight:700 }}>
                {livePosts.length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* ── Cards ── */}
      {fetching && livePosts === null ? (
        // First-load skeleton
        <div style={{ display:"flex",flexDirection:"column",gap:10 }}>
          {[1,2,3,4,5,6,7].map(i => (
            <div key={i} className="skeleton" style={{ height:76, animationDelay:`${i*80}ms` }} />
          ))}
        </div>
      ) : (
        <div style={{ display:"flex",flexDirection:"column",gap:10 }}>
          {articles.map((a,i) => <NewsCard key={a.id} article={a} index={i} />)}
          {articles.length === 0 && (
            <div style={{ textAlign:"center",padding:"40px 0",color:"var(--dim)",
              fontFamily:"'Rajdhani',sans-serif",fontSize:13,letterSpacing:".06em" }}>
              NO ARTICLES IN THIS CATEGORY
            </div>
          )}
        </div>
      )}

      {/* ── Footer: last fetch time + source link ── */}
      {lastFetched && (
        <div style={{ marginTop:16,display:"flex",alignItems:"center",justifyContent:"center",gap:8 }}>
          <span className="rj" style={{ fontSize:10,color:"var(--dim)",fontWeight:600,letterSpacing:".04em" }}>
            Last synced {clockStr(lastFetched)} · auto-refreshes every 90 min
          </span>
          <a href="https://www.bluetracker.gg/wow/" target="_blank" rel="noopener noreferrer"
             style={{ fontSize:10,color:"rgba(80,150,255,.45)",fontFamily:"'Rajdhani',sans-serif",
               fontWeight:600,textDecoration:"none",letterSpacing:".04em",transition:"color .2s" }}
             onMouseEnter={e=>e.currentTarget.style.color="rgba(125,185,255,.8)"}
             onMouseLeave={e=>e.currentTarget.style.color="rgba(80,150,255,.45)"}>
            bluetracker.gg ↗
          </a>
        </div>
      )}
    </section>
  );
}

// ─── Community Section ────────────────────────────────────────────────────────

function CommunitySection() {
  return (
    <section style={{ marginBottom:52 }}>
      <div style={{ display:"grid",gridTemplateColumns:"200px 1fr",gap:24,alignItems:"start" }} className="comm-grid">
        <div className="comm-label fu2">
          <div className="stt" style={{ fontSize:26,color:"#fff",marginBottom:8 }}>COMMUNITY PORTALS</div>
          <p style={{ fontSize:12,color:"var(--muted)",lineHeight:1.65 }}>
            Stay connected with the Ruse's Bakery community. Join our Discord and explore premier news portals.
          </p>
          <p style={{ fontSize:12,color:"var(--dim)",lineHeight:1.6,marginTop:8 }}>
            Share strategies, discuss updates, and celebrate victories together. Get exclusive insights and content.
          </p>
        </div>
        <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:12 }} className="comm-grid-inner">
          {COMM.map((c,i)=><CommCard key={c.id} card={c} index={i} />)}
        </div>
      </div>
    </section>
  );
}

// ─── Dynamic background config ────────────────────────────────────────────────

const BG_THEMES = {
  all: {
    // Neutral dark — subtle star-field feel
    bg:      "#0a0a0b",
    grad:    "radial-gradient(ellipse 80% 50% at 50% -10%, rgba(88,101,242,0.12) 0%, transparent 70%)",
    accent:  "rgba(88,101,242,0.06)",
    label:   null,
  },
  wow: {
    // World of Warcraft — deep sapphire / arcane gold
    bg:      "#07090f",
    grad:    `
      radial-gradient(ellipse 100% 60% at 50% -5%,  rgba(30,80,200,0.28) 0%, transparent 65%),
      radial-gradient(ellipse 60%  40% at 85% 20%,  rgba(180,130,20,0.10) 0%, transparent 55%),
      radial-gradient(ellipse 40%  30% at 10% 40%,  rgba(100,40,200,0.12) 0%, transparent 55%)
    `,
    accent:  "rgba(30,80,200,0.08)",
    label:   "WORLD OF WARCRAFT",
    color:   "#3b82f6",
  },
  dota: {
    // Dota 2 — blood-red ember glow
    bg:      "#0b0707",
    grad:    `
      radial-gradient(ellipse 100% 60% at 50% -5%,  rgba(180,30,20,0.30) 0%, transparent 65%),
      radial-gradient(ellipse 50%  35% at 80% 25%,  rgba(220,80,20,0.12) 0%, transparent 50%),
      radial-gradient(ellipse 40%  30% at 15% 35%,  rgba(120,20,60,0.12) 0%, transparent 55%)
    `,
    accent:  "rgba(180,30,20,0.08)",
    label:   "DOTA 2",
    color:   "#ef4444",
  },
  blue: {
    // Blizzard Blue Posts — icy covenant blue
    bg:      "#060c14",
    grad:    `
      radial-gradient(ellipse 90%  55% at 50% -8%,  rgba(30,100,255,0.30) 0%, transparent 65%),
      radial-gradient(ellipse 45%  30% at 80% 20%,  rgba(80,180,255,0.10) 0%, transparent 55%),
      radial-gradient(ellipse 35%  25% at 12% 45%,  rgba(20,60,200,0.12) 0%, transparent 55%)
    `,
    accent:  "rgba(30,100,255,0.08)",
    label:   "BLUE POSTS",
    color:   "#60a5fa",
  },
};

// ─── App ──────────────────────────────────────────────────────────────────────

export default function App() {
  const [scrolled, setScrolled] = useState(false);
  const [tab,      setTab]      = useState("all");
  const [prevTab,  setPrevTab]  = useState("all");
  const [bgOpacity, setBgOpacity] = useState(1);

  // Scroll listener
  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", fn, { passive: true });
    return () => window.removeEventListener("scroll", fn);
  }, []);

  // Crossfade background on tab change
  const handleTabChange = useCallback((newTab) => {
    if (newTab === tab) return;
    setBgOpacity(0);
    setTimeout(() => {
      setPrevTab(tab);
      setTab(newTab);
      setBgOpacity(1);
    }, 180);
  }, [tab]);

  const theme = BG_THEMES[tab] ?? BG_THEMES.all;

  return (
    <>
      <style>{GLOBAL_CSS}</style>

      {/* ── Dynamic game background ── */}
      <div style={{
        position:   "fixed",
        inset:      0,
        zIndex:     0,
        background: theme.bg,
        transition: "background 0.6s ease",
        pointerEvents: "none",
      }} />

      {/* Gradient overlay — crossfades on tab switch */}
      <div style={{
        position:   "fixed",
        inset:      0,
        zIndex:     1,
        background: theme.grad,
        opacity:    bgOpacity,
        transition: "opacity 0.35s ease, background 0.35s ease",
        pointerEvents: "none",
      }} />

      {/* Subtle vignette */}
      <div style={{
        position:   "fixed",
        inset:      0,
        zIndex:     2,
        background: "radial-gradient(ellipse 120% 120% at 50% 50%, transparent 40%, rgba(0,0,0,0.55) 100%)",
        pointerEvents: "none",
      }} />

      {/* ── Animated floating orbs ── */}
      <div style={{ position:"fixed", inset:0, zIndex:2, overflow:"hidden", pointerEvents:"none" }}>
        {/* Orb 1 */}
        <div style={{
          position: "absolute",
          width: 400, height: 400,
          borderRadius: "50%",
          background: `radial-gradient(circle, ${theme.color ?? "#5865f2"}14 0%, transparent 70%)`,
          top: "-10%", left: "60%",
          animation: "float1 18s ease-in-out infinite",
          transition: "background 0.6s ease",
        }} />
        {/* Orb 2 */}
        <div style={{
          position: "absolute",
          width: 300, height: 300,
          borderRadius: "50%",
          background: `radial-gradient(circle, ${theme.color ?? "#a78bfa"}10 0%, transparent 70%)`,
          top: "30%", left: "-5%",
          animation: "float2 22s ease-in-out infinite",
          transition: "background 0.6s ease",
        }} />
        {/* Orb 3 */}
        <div style={{
          position: "absolute",
          width: 250, height: 250,
          borderRadius: "50%",
          background: `radial-gradient(circle, ${theme.color ?? "#3b82f6"}0d 0%, transparent 70%)`,
          bottom: "10%", right: "5%",
          animation: "float3 26s ease-in-out infinite",
          transition: "background 0.6s ease",
        }} />
      </div>

      {/* ── Game label watermark ── */}
      {theme.label && (
        <div style={{
          position:   "fixed",
          top:        "50%",
          left:       "50%",
          transform:  "translate(-50%, -50%)",
          zIndex:     2,
          fontFamily: "'Bebas Neue', sans-serif",
          fontSize:   "clamp(80px, 18vw, 200px)",
          letterSpacing: "0.12em",
          color:      "transparent",
          WebkitTextStroke: `1px ${theme.color ?? "#fff"}`,
          opacity:    0.028,
          whiteSpace: "nowrap",
          userSelect: "none",
          pointerEvents: "none",
          transition: "opacity 0.5s ease",
        }}>
          {theme.label}
        </div>
      )}

      {/* ── All page content above backgrounds ── */}
      <div style={{ position: "relative", zIndex: 10 }}>
        <Header scrolled={scrolled} />
        <main style={{ maxWidth: 900, margin: "0 auto", padding: "32px 20px 60px" }}>
          <NewsSection tab={tab} setTab={handleTabChange} />
          <MetaRankings />
          <CommunitySection />
        </main>
        <footer style={{ borderTop:"1px solid var(--border)", padding:"24px 20px", textAlign:"center" }}>
          <div style={{ maxWidth:900, margin:"0 auto" }}>
            <div className="stt" style={{ fontSize:14, color:"var(--dim)", letterSpacing:".15em", marginBottom:6 }}>
              RUSE'S BAKERY
            </div>
            <p style={{ fontSize:11, color:"rgba(255,255,255,.12)", marginBottom:12 }}>
              Fan-made gaming news aggregator. Not affiliated with Blizzard Entertainment or Valve Corporation.
            </p>
            <div style={{ display:"flex", justifyContent:"center", gap:20, flexWrap:"wrap" }}>
              {[
                ["Discord",     "#5865f2", "https://discord.gg/3yKHBx3JZ"],
                ["Wowhead",     "#ff8000", "https://www.wowhead.com"],
                ["MMO-Champion","#4da6ff", "https://www.mmo-champion.com"],
                ["Dota 2",      "#c23c2a", "https://www.dota2.com"],
              ].map(([l, c, u]) => (
                <a key={l} href={u} target="_blank" rel="noopener noreferrer"
                   style={{ fontSize:11, color:c+"88", textDecoration:"none",
                     fontFamily:"'Rajdhani',sans-serif", fontWeight:600, letterSpacing:".06em" }}>
                  {l.toUpperCase()}
                </a>
              ))}
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}
