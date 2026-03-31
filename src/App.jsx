import { useState, useEffect } from "react";
import {
  Bell, ExternalLink, RefreshCw, Sword, Shield, Plus,
  ChevronRight, Rss, Gamepad2, Globe,
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
// Blue Posts → direct BlueTracker.gg permalink per thread.
//   Format: https://www.bluetracker.gg/wow/topic/us/{thread-id}-{slug}/
// WoW articles → specific Wowhead / MMO-Champion article URLs.
// Dota 2 → specific dota2.com/newsentry/{slug} or patches/{version} paths.
//

const BLUE_POSTS = [
  {
    id:"bp1", blue:true, game:"WoW", source:"Blizzard · BlueTracker", time:"3 days ago", tags:["Tuning","Classes"],
    // Direct BlueTracker permalink for "Class Tuning Incoming – March 31"
    url:"https://www.bluetracker.gg/wow/topic/us/1331864-class-tuning-incoming-march-31/",
    title:"Class Tuning Incoming – March 31",
    excerpt:"We will be applying the following tuning changes with scheduled maintenance on Monday, March 31.",
  },
  {
    id:"bp2", blue:true, game:"WoW", source:"Blizzard · BlueTracker", time:"3 days ago", tags:["Items","Crafting"],
    url:"https://www.bluetracker.gg/wow/topic/us/1331702-recraft-myth-crests-are-gone/",
    title:"Recraft Myth Crests Are Gone",
    excerpt:"Recrafted items can no longer consume Myth Crests due to an unintended interaction discovered after the latest patch.",
  },
  {
    id:"bp3", blue:true, game:"WoW", source:"Blizzard · BlueTracker", time:"3 days ago", tags:["Event","Community"],
    url:"https://www.bluetracker.gg/wow/topic/us/1331540-play-with-the-blues-void-assaults-stress-test-friday-march-27/",
    title:"Play with the Blues: Void Assaults Stress Test – Friday, March 27",
  },
  {
    id:"bp4", blue:true, game:"WoW", source:"Blizzard · BlueTracker", time:"3 days ago", tags:["Weekly","News"],
    url:"https://www.bluetracker.gg/wow/topic/us/1331388-wow-weekly-midnight-season-1-a-place-to-call-home-twitch-drop-and-more/",
    title:"WoW Weekly: Midnight Season 1, \"A Place to Call Home\", Twitch Drop, and More!",
  },
  {
    id:"bp5", blue:true, game:"WoW", source:"Blizzard · BlueTracker", time:"4 days ago", tags:["Hotfix"],
    url:"https://www.bluetracker.gg/wow/topic/us/1331021-world-of-warcraft-midnight-hotfixes-march-26/",
    title:"World of Warcraft: Midnight Hotfixes – March 26",
  },
  {
    id:"bp6", blue:true, game:"WoW", source:"Blizzard · BlueTracker", time:"5 days ago", tags:["Hotfix"],
    url:"https://www.bluetracker.gg/wow/topic/us/1330748-world-of-warcraft-midnight-hotfixes-march-25/",
    title:"World of Warcraft: Midnight Hotfixes – March 25",
  },
  {
    id:"bp7", blue:true, game:"WoW", source:"Blizzard · BlueTracker", time:"5 days ago", tags:["Event","Community"],
    url:"https://www.bluetracker.gg/wow/topic/us/1330612-play-with-the-blues-abyss-anglers-friday-march-27/",
    title:"Play with the Blues: Abyss Anglers – Friday, March 27",
  },
  {
    id:"bp8", blue:true, game:"WoW", source:"Blizzard · BlueTracker", time:"5 days ago", tags:["PTR","Development"],
    url:"https://www.bluetracker.gg/wow/topic/us/1330401-12-0-5-ptr-development-notes/",
    title:"12.0.5 PTR Development Notes",
  },
  {
    id:"bp9", blue:true, game:"WoW", source:"Blizzard · BlueTracker", time:"5 days ago", tags:["Event"],
    url:"https://www.bluetracker.gg/wow/topic/us/1330198-play-with-the-blues-void-assaults-stress-test-march-27/",
    title:"Play with the Blues: Void Assaults Stress Test – Friday, March 27",
  },
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

const ALL_ARTICLES = [...BLUE_POSTS, ...WOW_ARTICLES, ...DOTA_ARTICLES];

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

// ─── Meta Rankings (image_2 left section) ────────────────────────────────────

function MetaRankings() {
  const ROLES = [
    { label:"DPS",    icon:<Sword size={17}/>,  col:"#ef4444" },
    { label:"HEALER", icon:<Plus  size={17}/>,  col:"#22c55e" },
    { label:"TANK",   icon:<Shield size={17}/>, col:"#3b82f6" },
  ];
  const [hv, setHv] = useState(null);

  return (
    <div style={{ display:"grid",gridTemplateColumns:"200px 1fr",gap:20,alignItems:"center",marginBottom:36 }} className="meta-grid fu2">
      <div className="meta-label">
        <div className="stt" style={{ fontSize:26,color:"#fff",marginBottom:8 }}>META RANKINGS</div>
        <p style={{ fontSize:12,color:"var(--muted)",lineHeight:1.65 }}>
          Explore the meta and discover how each role ranks across class specializations. Select a role to view top-performing classes.
        </p>
      </div>
      <div style={{ display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:10 }} className="role-grid">
        {ROLES.map(r=>(
          <a key={r.label} href="#" style={{ textDecoration:"none" }} onMouseEnter={()=>setHv(r.label)} onMouseLeave={()=>setHv(null)}>
            <div className="role-card" style={{
              borderRadius:18,padding:"20px 16px",display:"flex",alignItems:"center",gap:12,cursor:"pointer",
              border:`1px solid ${hv===r.label?r.col+"55":"rgba(255,255,255,.06)"}`,
              background:hv===r.label?`linear-gradient(135deg,${r.col}18 0%,transparent 100%)`:"#111113",
              boxShadow:hv===r.label?`0 8px 24px ${r.col}22`:"none",
            }}>
              <div style={{ width:38,height:38,borderRadius:10,background:`${r.col}18`,border:`1px solid ${r.col}30`,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,color:r.col }}>{r.icon}</div>
              <span className="stt" style={{ fontSize:18,color:hv===r.label?"#fff":"rgba(255,255,255,.8)",transition:"color .2s" }}>{r.label}</span>
            </div>
          </a>
        ))}
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

// ─── News Section ─────────────────────────────────────────────────────────────

const TABS = [
  { id:"all",  label:"ALL NEWS" },
  { id:"wow",  label:"WOW" },
  { id:"dota", label:"DOTA 2" },
  { id:"blue", label:"BLUE POSTS" },
];

function NewsSection() {
  const [tab, setTab] = useState("all");
  const [age, setAge] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const iv = setInterval(()=>setAge(a=>a+1), 1000);
    return ()=>clearInterval(iv);
  }, []);

  const ageStr = age < 60 ? `${age}s ago` : "just now";

  const articles = ALL_ARTICLES.filter(a => {
    if (tab==="all")  return true;
    if (tab==="wow")  return a.game==="WoW";
    if (tab==="dota") return a.game==="Dota 2";
    if (tab==="blue") return a.blue;
    return true;
  });

  const refresh = () => { setLoading(true); setAge(0); setTimeout(()=>setLoading(false), 850); };

  return (
    <section style={{ marginBottom:52 }}>
      {/* Header */}
      <div className="fu" style={{ display:"flex",flexDirection:"column",alignItems:"center",marginBottom:28 }}>
        <div style={{ display:"flex",alignItems:"center",gap:14,marginBottom:10 }}>
          <Bell size={30} color="#fff" strokeWidth={1.5} />
          <span className="stt" style={{ fontSize:34,color:"#fff",letterSpacing:".1em" }}>NEWS</span>
        </div>
        <div style={{ display:"flex",alignItems:"center",gap:8 }}>
          <div className="live-dot" />
          <span className="rj" style={{ fontSize:11,color:"var(--muted)",fontWeight:600,letterSpacing:".06em" }}>
            LIVE FEED · LAST UPDATED {ageStr.toUpperCase()}
          </span>
          <button onClick={refresh} style={{ background:"none",border:"none",cursor:"pointer",color:"var(--dim)",display:"flex",alignItems:"center",gap:4,fontSize:11,fontFamily:"'Rajdhani',sans-serif",fontWeight:600,letterSpacing:".06em",padding:"3px 8px",borderRadius:8,transition:"color .2s,background .2s" }}
            onMouseEnter={e=>{e.currentTarget.style.color="#fff";e.currentTarget.style.background="rgba(255,255,255,.05)";}}
            onMouseLeave={e=>{e.currentTarget.style.color="var(--dim)";e.currentTarget.style.background="none";}}>
            <RefreshCw size={11} style={{ animation:loading?"spin .8s linear infinite":"none" }} />
            REFRESH
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="fu1" style={{ display:"flex",gap:4,background:"#111113",border:"1px solid var(--border)",borderRadius:17,padding:5,marginBottom:16 }}>
        {TABS.map(t=>(
          <button key={t.id} className={`tab-btn${tab===t.id?" on":""}`} onClick={()=>setTab(t.id)} style={{ flex:1 }}>{t.label}</button>
        ))}
      </div>

      {/* Cards */}
      {loading ? (
        <div style={{ display:"flex",flexDirection:"column",gap:10 }}>
          {[1,2,3,4,5].map(i=><div key={i} className="skeleton" style={{ height:76 }} />)}
        </div>
      ) : (
        <div style={{ display:"flex",flexDirection:"column",gap:10 }}>
          {articles.map((a,i)=><NewsCard key={a.id} article={a} index={i} />)}
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

// ─── App ──────────────────────────────────────────────────────────────────────

export default function App() {
  const [scrolled, setScrolled] = useState(false);
  useEffect(()=>{
    const fn = ()=>setScrolled(window.scrollY>20);
    window.addEventListener("scroll",fn,{passive:true});
    return ()=>window.removeEventListener("scroll",fn);
  },[]);

  return (
    <>
      <style>{GLOBAL_CSS}</style>
      <Header scrolled={scrolled} />
      <main style={{ maxWidth:900,margin:"0 auto",padding:"32px 20px 60px" }}>
        <NewsSection />
        <MetaRankings />
        <CommunitySection />
      </main>
      <footer style={{ borderTop:"1px solid var(--border)",padding:"24px 20px",textAlign:"center" }}>
        <div style={{ maxWidth:900,margin:"0 auto" }}>
          <div className="stt" style={{ fontSize:14,color:"var(--dim)",letterSpacing:".15em",marginBottom:6 }}>RUSE'S BAKERY</div>
          <p style={{ fontSize:11,color:"rgba(255,255,255,.12)",marginBottom:12 }}>Fan-made gaming news aggregator. Not affiliated with Blizzard Entertainment or Valve Corporation.</p>
          <div style={{ display:"flex",justifyContent:"center",gap:20,flexWrap:"wrap" }}>
            {[["Discord","#5865f2","https://discord.gg/3yKHBx3JZ"],["Wowhead","#ff8000","https://www.wowhead.com"],["MMO-Champion","#4da6ff","https://www.mmo-champion.com"],["Dota 2","#c23c2a","https://www.dota2.com"]].map(([l,c,u])=>(
              <a key={l} href={u} target="_blank" rel="noopener noreferrer" style={{ fontSize:11,color:c+"88",textDecoration:"none",fontFamily:"'Rajdhani',sans-serif",fontWeight:600,letterSpacing:".06em" }}>{l.toUpperCase()}</a>
            ))}
          </div>
        </div>
      </footer>
    </>
  );
}
