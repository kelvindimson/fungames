import { useState, useEffect, useCallback, useRef } from "react";

const ANSWER_WORDS = [
  "ABLE","ARCH","ARMY","BACK","BAKE","BAND","BANK","BARE","BARK","BARN",
  "BASE","BATH","BEAD","BEAM","BEAN","BEAR","BEAT","BEEF","BELL","BELT",
  "BEND","BEST","BIKE","BIND","BIRD","BITE","BLOW","BLUE","BLUR","BOAT",
  "BOLD","BOLT","BOMB","BOND","BONE","BOOK","BOOT","BORE","BORN","BOSS",
  "BOWL","BULK","BULL","BUMP","BURN","BUSH","BUSY","BUZZ","CAFE","CAGE",
  "CAKE","CALL","CALM","CAME","CAMP","CAPE","CARD","CARE","CART","CASE",
  "CASH","CAST","CAVE","CHAT","CHEF","CHIN","CHIP","CHOP","CITY","CLAM",
  "CLAP","CLAY","CLIP","CLUB","CLUE","COAL","COAT","CODE","COIN","COLD",
  "COME","COOK","COOL","COPE","COPY","CORD","CORE","CORK","CORN","COST",
  "COZY","CREW","CROP","CROW","CUBE","CURE","CURL","CUTE","DARE","DARK",
  "DART","DASH","DATE","DAWN","DEAL","DEAR","DECK","DEED","DEEP","DEER",
  "DENY","DESK","DIAL","DICE","DIET","DIME","DIRT","DISH","DOCK","DOME",
  "DONE","DOOM","DOOR","DOSE","DOVE","DOWN","DRAW","DRIP","DROP","DRUM",
  "DUAL","DUCK","DUEL","DULL","DUMP","DUNE","DUSK","DUST","DUTY","EACH",
  "EARN","EASE","EAST","EASY","EDGE","EDIT","ELSE","EMIT","EPIC","EVEN",
  "EVIL","EXAM","FACE","FACT","FADE","FAIL","FAIR","FAKE","FALL","FAME",
  "FARM","FAST","FATE","FEAR","FEAT","FEED","FEEL","FELT","FILE","FILL",
  "FILM","FIND","FINE","FIRE","FIRM","FISH","FIST","FLAG","FLAT","FLIP",
  "FLOW","FOAM","FOLD","FOLK","FOND","FOOD","FOOL","FOOT","FORD","FORK",
  "FORM","FORT","FOUL","FOUR","FREE","FROM","FUEL","FULL","FUND","FURY",
  "FUSE","GAIN","GAME","GANG","GATE","GAVE","GAZE","GEAR","GENE","GIFT",
  "GIRL","GIVE","GLAD","GLOW","GLUE","GOAT","GOES","GOLD","GOLF","GONE",
  "GOOD","GRAB","GRAY","GREW","GRID","GRIM","GRIN","GRIP","GROW","GUST",
  "HACK","HAIR","HALF","HALL","HALT","HAND","HANG","HARD","HARM","HATE",
  "HAUL","HAVE","HAZE","HEAD","HEAL","HEAP","HEAR","HEAT","HELD","HELP",
  "HERB","HERD","HERE","HERO","HIGH","HIKE","HILL","HINT","HIRE","HOLD",
  "HOLE","HOME","HOOD","HOOK","HOPE","HORN","HOST","HOUR","HOWL","HUGE",
  "HUNG","HUNT","HURT","ICON","IDEA","INCH","INTO","IRON","ISLE","ITEM",
  "JACK","JAIL","JAZZ","JOKE","JUMP","JUNE","JURY","JUST","KEEN","KEEP",
  "KEPT","KICK","KILL","KIND","KING","KISS","KITE","KNEE","KNEW","KNOB",
  "KNOT","KNOW","LACE","LACK","LAID","LAKE","LAMB","LAMP","LAND","LANE",
  "LAST","LATE","LAWN","LAZY","LEAD","LEAF","LEAN","LEAP","LEFT","LEND",
  "LENS","LESS","LIAR","LIFE","LIFT","LIKE","LIMB","LIME","LINE","LINK",
  "LION","LIST","LIVE","LOAD","LOAN","LOCK","LOGO","LONG","LOOK","LOOP",
  "LORD","LOSE","LOSS","LOST","LOUD","LOVE","LUCK","LUMP","LUNG","LURE",
  "LURK","MADE","MAID","MAIL","MAIN","MAKE","MALE","MALL","MALT","MANY",
  "MARK","MASH","MASK","MASS","MATE","MAZE","MEAL","MEAN","MEAT","MEET",
  "MELT","MEMO","MENU","MESH","MILD","MILE","MILK","MILL","MIND","MINE",
  "MINT","MISS","MIST","MODE","MOLD","MOOD","MOON","MORE","MOSS","MOST",
  "MOTH","MOVE","MUCH","MULE","MUSE","MUST","MYTH","NAIL","NAME","NAVY",
  "NEAR","NEAT","NECK","NEED","NEST","NEWS","NEXT","NICE","NODE","NONE",
  "NOON","NORM","NOSE","NOTE","NOUN","ODDS","OKAY","ONCE","ONLY","ONTO",
  "OPEN","OVEN","OVER","PACE","PACK","PAGE","PAID","PAIN","PAIR","PALE",
  "PALM","PANE","PARK","PART","PASS","PAST","PATH","PEAK","PEEL","PEER",
  "PICK","PIER","PILE","PINE","PINK","PIPE","PLAN","PLAY","PLEA","PLOT",
  "PLOY","PLUG","PLUM","PLUS","POEM","POET","POLE","POLL","POND","POOL",
  "POOR","PORK","PORT","POSE","POST","POUR","PRAY","PROP","PULL","PUMP",
  "PURE","PUSH","QUIT","QUIZ","RACE","RACK","RAGE","RAID","RAIL","RAIN",
  "RANK","RARE","RASH","RATE","RAVE","READ","REAL","REAR","REEF","RELY",
  "RENT","REST","RICE","RICH","RIDE","RING","RIOT","RISE","RISK","ROAD",
  "ROAM","ROAR","ROBE","ROCK","RODE","ROLE","ROLL","ROOF","ROOM","ROOT",
  "ROPE","ROSE","RUIN","RULE","RUSH","RUST","SAFE","SAGE","SAID","SAIL",
  "SAKE","SALE","SALT","SAME","SAND","SANE","SANG","SAVE","SEAL","SEAT",
  "SEED","SEEK","SEEM","SEEN","SELF","SELL","SEND","SHED","SHIN","SHIP",
  "SHOP","SHOT","SHOW","SHUT","SICK","SIDE","SIGH","SIGN","SILK","SINK",
  "SITE","SIZE","SKIN","SKIP","SLAM","SLAP","SLID","SLIM","SLIP","SLOT",
  "SLOW","SLUG","SNAP","SNOW","SOAK","SOAP","SOAR","SOCK","SOFA","SOFT",
  "SOIL","SOLD","SOLE","SOME","SONG","SOON","SORT","SOUL","SOUR","SPAN",
  "SPIN","SPOT","STAR","STAY","STEM","STEP","STEW","STIR","STOP","SUCH",
  "SUIT","SURE","SURF","SWIM","TACK","TAIL","TAKE","TALE","TALK","TALL",
  "TAME","TANK","TAPE","TASK","TAXI","TEAM","TEAR","TELL","TEND","TENT",
  "TERM","TEST","TEXT","THAN","THAT","THEM","THEN","THEY","THIN","THIS",
  "TICK","TIDE","TIDY","TIED","TIER","TILE","TILL","TILT","TIME","TINY",
  "TIRE","TOAD","TOLL","TOMB","TONE","TOOK","TOOL","TOPS","TORE","TORN",
  "TOSS","TOUR","TOWN","TRAP","TRAY","TREE","TREK","TRIM","TRIO","TRIP",
  "TRUE","TUBE","TUCK","TUNA","TUNE","TURN","TWIN","TYPE","UGLY","UNDO",
  "UNIT","UPON","URGE","USED","USER","VAIN","VARY","VASE","VAST","VEIL",
  "VEIN","VENT","VERB","VERY","VEST","VIEW","VINE","VOID","VOLT","VOTE",
  "WAGE","WAIT","WAKE","WALK","WALL","WAND","WANT","WARD","WARM","WARN",
  "WARP","WASH","WAVE","WEAK","WEAR","WEED","WEEK","WELL","WENT","WERE",
  "WEST","WHAT","WHEN","WHOM","WIDE","WIFE","WILD","WILL","WILT","WIND",
  "WINE","WING","WINK","WIPE","WIRE","WISE","WISH","WITH","WOKE","WOLF",
  "WOOD","WOOL","WORD","WORE","WORK","WORM","WORN","WRAP","YARD","YARN",
  "YEAR","YELL","YOUR","ZEAL","ZERO","ZINC","ZONE","ZOOM"
];

const VALID_WORDS = new Set([
  ...ANSWER_WORDS,
  "ABET","ACHE","ACID","ACME","ACRE","AGED","AIDE","ALLY","ALSO","ALTO",
  "AMID","ANTI","AQUA","AREA","ARIA","AVID","AWAY","AXLE","BABY","BAIL",
  "BAIT","BALD","BALE","BALM","BANG","BARD","BASH","BASS","BATE","BAWL",
  "BEEN","BEER","BEET","BENT","BIAS","BILL","BLOB","BLOC","BLOG","BLOT",
  "BOAR","BODE","BODY","BOGS","BOIL","BONY","BOOM","BOON","BOUT","BRAG",
  "BRAT","BRED","BREW","BRIM","BUDS","BUFF","BUGS","BURP","BURR","BUST",
  "BYTE","CANE","CASK","CENT","CHAR","CHEW","CHUM","CITE","CLAN","CLAW",
  "COAX","COIL","COLT","COMB","CONE","COUP","COVE","COWL","CRAB","CRAM",
  "CUFF","CULT","CUPS","CURB","CURT","DAFT","DAMP","DARN","DEFY","DELI",
  "DEMO","DENT","DEWY","DINE","DIRE","DISC","DIVA","DOES","DOLE","DOLT",
  "DOPE","DOTE","DOUR","DOZE","DRAB","DRAG","DREW","DUDE","DUES","DUET",
  "DUKE","DUNK","DUPE","DYED","EARL","EATS","ECHO","EELS","EGGS","ELMS",
  "ENVY","ETCH","EURO","EYED","EYES","FAWN","FAZE","FERN","FIAT","FIGS",
  "FIZZ","FLAB","FLAK","FLAN","FLAW","FLAX","FLEA","FLEE","FLEW","FLOG",
  "FLOP","FLUX","FOAL","FOES","FOIL","FONT","FORE","FOWL","FOXY","FRAY",
  "FROG","FUME","FUNK","FURL","GAIT","GALE","GALL","GASH","GASP","GEMS",
  "GERM","GLEN","GLUT","GNAT","GNAW","GORE","GORY","GOWN","GRAM","GRIT",
  "GRUB","GULP","GUNK","GURU","GUSH","GUTS","GYMS","HAIL","HALO","HAMS",
  "HARE","HARP","HASH","HATS","HAWK","HAYS","HEED","HEIR","HELM","HEMP",
  "HENS","HISS","HIVE","HOAX","HOGS","HONE","HOOF","HOOP","HOPS","HOSE",
  "HUBS","HUED","HUES","HUFF","HUGS","HULL","HUMP","HUNK","HYMN","IFFY",
  "IMAM","INFO","INKS","INNS","IONS","IRIS","IRKS","ISLE","ITCH","JABS",
  "JADE","JAGS","JAMS","JARS","JAWS","JAYS","JEEP","JEER","JEST","JETS",
  "JIGS","JILT","JINX","JIVE","JOBS","JOCK","JOGS","JOLT","JOSH","JOTS",
  "JOWL","JOYS","JUGS","JUKE","JUNK","JUTS","KALE","KEGS","KELP","KEYS",
  "KHAN","KILN","KILT","KINK","KITS","LADS","LAGS","LAIR","LAME","LARD",
  "LARK","LASH","LASS","LAUD","LAVA","LAWS","LAYS","LEAK","LEER","LEVY",
  "LILY","LIMO","LINT","LIPS","LOBE","LOCH","LODE","LOFT","LOGS","LONE",
  "LOOM","LOON","LOOT","LORE","LOTS","LOUT","LOWS","LUBE","LUSH","LUST",
  "LYNX","LYRE","MACE","MANE","MAPS","MARE","MAST","MATS","MAUL","MAYO",
  "MEAD","MEEK","MESA","MICA","MICE","MINI","MINK","MIRE","MOAN","MOAT",
  "MOBS","MOCK","MODS","MOLE","MOLT","MONK","MOOR","MOPE","MOPS","MOTE",
  "MUGS","MURK","MUSH","MUSK","MUTT","NAGS","NAPE","NAPS","NAVE","NEON",
  "NERD","NETS","NEWT","NICK","NINE","NOEL","NODS","NOOK","NOPE","NUBS",
  "NULL","NUMB","NUNS","NUTS","OAFS","OAKS","OARS","OATH","OATS","OBEY",
  "ODOR","OGLE","OGRE","OILS","OILY","OMIT","OOPS","OOZE","OPAL","OPTS",
  "OPUS","ORBS","ORCA","ORES","OUCH","OURS","OUST","OUTS","OWES","OWLS",
  "OWNS","OXEN","PACT","PADS","PAIL","PALL","PALS","PANG","PANS","PANT",
  "PARE","PAVE","PAWN","PAWS","PAYS","PEAS","PEAT","PECK","PELT","PEND",
  "PENS","PENT","PERM","PERT","PEST","PETS","PEWS","PIGS","PILL","PINS",
  "PINT","PITY","PLOD","PLOP","PLOW","PODS","POKE","POLO","POMP","PONY",
  "POOP","POPS","PORE","POSH","POSY","POTS","PREY","PRIM","PROD","PROM",
  "PROW","PUBS","PUCK","PUGS","PULP","PUMA","PUNK","PUNS","PUPS","PURR",
  "PUTS","PUTT","QUAY","RAFT","RAGS","RAMP","RAMS","RANG","RANT","RAPS",
  "RASP","RATS","RAYS","RAZE","REAM","REAP","REDO","REDS","REFS","REIN",
  "REND","REPS","RIBS","RICK","RIDS","RIFF","RIFT","RIGS","RILL","RIME",
  "RIND","RINK","RIPE","RIPS","ROBS","RODS","ROOK","ROSY","ROTE","ROTS",
  "ROUT","ROWS","RUBS","RUCK","RUDE","RUED","RUES","RUGS","RUMP","RUNG",
  "RUNS","RUNT","RUSE","RUTS","RYES","SACK","SAGS","SANS","SARI","SASH",
  "SASS","SAWS","SAYS","SCAB","SCAM","SCAN","SCAR","SECT","SEMI","SERF",
  "SEWN","SHAM","SHIM","SHOO","SHUN","SILO","SILT","SIRE","SIRS","SITS",
  "SKIT","SLAB","SLAG","SLEW","SLOB","SLOG","SLOP","SLUM","SLUR","SMOG",
  "SNAG","SNIP","SNOB","SNOT","SNUB","SNUG","SOBS","SODA","SODS","SOLO",
  "SONS","SOOT","SOPS","SORE","SPEC","SPED","SPEW","SPRY","SPUR","STAB",
  "STAG","STUD","STUN","SUBS","SUDS","SULK","SUMO","SUMP","SUNG","SUNK",
  "SUNS","SWAY","SWIG","SYNC","TACO","TADS","TAGS","TAPS","TARN","TARP",
  "TARS","TART","TEAL","TEEN","TEMP","TENS","TERN","THAW","THOU","THUD",
  "THUG","THUS","TICS","TIFF","TINS","TIPS","TOED","TOES","TOFU","TOGA",
  "TOGS","TOIL","TOLD","TOME","TONG","TONS","TORT","TOTS","TOUT","TRAM",
  "TROD","TROT","TUBS","TUFT","TUGS","TURF","TUSK","TWIG","TYKE","USED",
  "USES","VAMP","VANE","VANS","VATS","VEER","VETS","VIAL","VIBE","VIED",
  "VIES","VILE","VISA","VISE","VOWS","WADE","WADS","WAFT","WAIL","WAIF",
  "WARY","WASP","WATT","WAXY","WAYS","WEAN","WEBS","WEDS","WHEY","WHIM",
  "WHIP","WHIR","WHIZ","WICK","WIGS","WILY","WIMP","WINS","WIRY","WITS",
  "WOES","WOKS","WOMB","WONT","WOOS","WOVE","WREN","YAKS","YAMS","YANK",
  "YAPS","YAWN","YELP","YENS","YOGA","YOKE","YORE","YOWL","YURT","ZANY",
  "ZAPS","ZEDS","ZEST","ZING","ZIPS","ZOOS"
]);

const TOTAL_ROUNDS = 8;
const MAX_GUESSES = 6;
const ROUND_TIME = 30;
const SCORE_MAP = { 1: 100, 2: 80, 3: 60, 4: 40, 5: 20, 6: 10 };
const POLL_MS = 1500;

const gid = () => Math.random().toString(36).substr(2, 8);
const gcode = () => {
  const c = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  return Array.from({ length: 4 }, () => c[Math.floor(Math.random() * c.length)]).join("");
};
const obf = (w) => btoa(w).split("").reverse().join("");
const deobf = (w) => { try { return atob(w.split("").reverse().join("")); } catch { return ""; } };

function pickWords(n) {
  const s = [...ANSWER_WORDS].sort(() => Math.random() - 0.5);
  return s.slice(0, n);
}

function getFeedback(guess, answer) {
  const r = [0, 0, 0, 0]; // 0=absent, 1=present, 2=correct
  const a = [...answer], g = [...guess.toUpperCase()];
  for (let i = 0; i < 4; i++) if (g[i] === a[i]) { r[i] = 2; a[i] = null; g[i] = null; }
  for (let i = 0; i < 4; i++) if (g[i] && a.includes(g[i])) { r[i] = 1; a[a.indexOf(g[i])] = null; }
  return r;
}

async function sGet(k) { try { const r = await window.storage.get(k, true); return r ? JSON.parse(r.value) : null; } catch { return null; } }
async function sSet(k, v) { try { await window.storage.set(k, JSON.stringify(v), true); return true; } catch { return false; } }

const C = {
  bg: "#0b0e1a", c1: "#141829", c2: "#1a1f35", bdr: "#252b45",
  gold: "#f5a623", grn: "#22c55e", ylw: "#eab308", gry: "#334155",
  gryM: "#475569", gryL: "#64748b", txt: "#e2e8f0", txtD: "#94a3b8",
  txtM: "#64748b", red: "#ef4444", wht: "#fff", acc: "#818cf8",
};

function Tile({ letter, status, hint }) {
  const bg = hint ? C.c2 : status === 2 ? C.grn : status === 1 ? C.ylw : status === 0 ? C.gry : "transparent";
  const bd = hint ? C.gold : status === 2 ? C.grn : status === 1 ? C.ylw : status === 0 ? C.gryM : C.bdr;
  return (
    <div style={{
      width: 56, height: 56, display: "flex", alignItems: "center", justifyContent: "center",
      border: `2px solid ${bd}`, borderRadius: 8, background: bg,
      fontFamily: "'Russo One', sans-serif", fontSize: 24, color: C.wht,
      transition: "all 0.2s", letterSpacing: 1,
      animation: letter && status === undefined ? "popIn 0.15s ease" : status !== undefined ? "flipIn 0.3s ease" : undefined,
    }}>
      {letter || ""}
    </div>
  );
}

function GuessRow({ guess, feedback, isActive, input, firstLetter }) {
  const cells = [];
  for (let i = 0; i < 4; i++) {
    if (guess) {
      cells.push(<Tile key={i} letter={guess[i]} status={feedback?.[i]} />);
    } else if (isActive) {
      if (i === 0) {
        cells.push(<Tile key={i} letter={firstLetter} hint={true} />);
      } else {
        const ch = input?.[i - 1] || "";
        cells.push(<Tile key={i} letter={ch} />);
      }
    } else {
      cells.push(<Tile key={i} letter={i === 0 ? firstLetter : ""} hint={i === 0} />);
    }
  }
  return <div style={{ display: "flex", gap: 6, marginBottom: 5 }}>{cells}</div>;
}

function Board({ players, roundScores, showRound, myId }) {
  const sorted = [...players].sort((a, b) => b.totalScore - a.totalScore);
  const medals = ["🥇", "🥈", "🥉"];
  return (
    <div style={{ background: C.c1, borderRadius: 14, border: `1px solid ${C.bdr}`, padding: 16, width: "100%" }}>
      <div style={{ fontFamily: "'Russo One', sans-serif", fontSize: 13, color: C.gold, marginBottom: 12, letterSpacing: 2 }}>
        LEADERBOARD
      </div>
      {sorted.map((p, i) => {
        const rs = roundScores?.[p.id];
        const me = p.id === myId;
        return (
          <div key={p.id} style={{
            display: "flex", alignItems: "center", justifyContent: "space-between",
            padding: "9px 12px", borderRadius: 8, marginBottom: 3,
            background: me ? `${C.gold}12` : "transparent",
            border: me ? `1px solid ${C.gold}35` : "1px solid transparent",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontSize: 16, width: 26, textAlign: "center" }}>{i < 3 ? medals[i] : `${i + 1}.`}</span>
              <span style={{ color: C.txt, fontFamily: "'Nunito', sans-serif", fontWeight: me ? 800 : 600, fontSize: 14 }}>
                {p.name}{me ? " (you)" : ""}
              </span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              {showRound && rs !== undefined && (
                <span style={{
                  fontSize: 12, fontWeight: 700, color: rs > 0 ? C.grn : C.txtM,
                  background: rs > 0 ? `${C.grn}20` : "transparent",
                  padding: "2px 8px", borderRadius: 6, fontFamily: "'Nunito', sans-serif",
                }}>+{rs}</span>
              )}
              <span style={{ fontFamily: "'Russo One', sans-serif", fontSize: 15, color: C.gold, minWidth: 36, textAlign: "right" }}>
                {p.totalScore}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function TimerBar({ left, total }) {
  const pct = (left / total) * 100;
  const col = left <= 5 ? C.red : left <= 10 ? C.ylw : C.grn;
  return (
    <div style={{ width: "100%", height: 6, background: C.gry, borderRadius: 3, overflow: "hidden", marginTop: 8 }}>
      <div style={{ width: `${pct}%`, height: "100%", background: col, borderRadius: 3, transition: "width 0.5s linear, background 0.3s" }} />
    </div>
  );
}

export default function LingoGame() {
  const [pid] = useState(() => {
    try { let id = sessionStorage.getItem("lingo-pid"); if (!id) { id = gid(); sessionStorage.setItem("lingo-pid", id); } return id; } catch { return gid(); }
  });

  const [screen, setScreen] = useState("home");
  const [role, setRole] = useState(null);
  const [code, setCode] = useState("");
  const [joinCode, setJoinCode] = useState("");
  const [name, setName] = useState("");
  const [err, setErr] = useState("");
  const [shake, setShake] = useState(false);
  const [flash, setFlash] = useState("");

  const [gs, setGs] = useState(null);
  const [players, setPlayers] = useState([]);
  const [rd, setRd] = useState(null);

  const [input, setInput] = useState("");
  const [guesses, setGuesses] = useState([]);
  const [fbs, setFbs] = useState([]);
  const [solved, setSolved] = useState(false);
  const [timeLeft, setTimeLeft] = useState(ROUND_TIME);
  const [cdNum, setCdNum] = useState(null);
  const [rScore, setRScore] = useState(null);

  const solvedR = useRef(false);
  const gcR = useRef(0);
  const timerR = useRef(null);
  const pollR = useRef(null);
  const roundEndedR = useRef(false);

  const gk = (c) => `lingo-g-${c}`;
  const pk = (c) => `lingo-p-${c}`;
  const rk = (c, r) => `lingo-r-${c}-${r}`;

  // Create game
  const create = useCallback(async () => {
    if (!name.trim()) { setErr("Enter your name"); return; }
    const c = gcode();
    const words = pickWords(TOTAL_ROUNDS).map(obf);
    const g = { code: c, gmId: pid, status: "lobby", round: 0, words, roundStart: null };
    const pl = [{ id: pid, name: name.trim(), totalScore: 0 }];
    await sSet(gk(c), g);
    await sSet(pk(c), pl);
    setCode(c); setGs(g); setPlayers(pl); setRole("gm"); setScreen("lobby"); setErr("");
  }, [name, pid]);

  // Join game
  const join = useCallback(async () => {
    if (!name.trim()) { setErr("Enter your name"); return; }
    const c = joinCode.trim().toUpperCase();
    if (c.length !== 4) { setErr("Enter 4-letter code"); return; }
    const g = await sGet(gk(c));
    if (!g) { setErr("Game not found"); return; }
    let pl = await sGet(pk(c)) || [];
    if (!pl.find(p => p.id === pid)) {
      pl.push({ id: pid, name: name.trim(), totalScore: 0 });
      await sSet(pk(c), pl);
    }
    setCode(c); setGs(g); setPlayers(pl);
    setRole(g.gmId === pid ? "gm" : "player");
    if (g.status === "lobby") setScreen("lobby");
    else if (g.status === "playing" || g.status === "countdown") { setScreen("playing"); startTimer(g); }
    else if (g.status === "roundEnd") setScreen("roundResult");
    else if (g.status === "gameOver") setScreen("gameOver");
    setErr("");
  }, [name, joinCode, pid]);

  // Start round (GM)
  const startRound = useCallback(async () => {
    if (!gs || role !== "gm") return;
    const nr = gs.round + 1;
    const ng = { ...gs, status: "countdown", round: nr, roundStart: Date.now() + 4000 };
    await sSet(gk(code), ng);
    await sSet(rk(code, nr), { results: {} });
    setGs(ng);
    triggerCD(ng);
  }, [gs, code, role]);

  // Countdown
  const triggerCD = useCallback((g) => {
    setSolved(false); solvedR.current = false; roundEndedR.current = false;
    setGuesses([]); setFbs([]); setInput(""); setRScore(null); gcR.current = 0;
    setCdNum(3); setScreen("countdown");
    setTimeout(() => setCdNum(2), 1000);
    setTimeout(() => setCdNum(1), 2000);
    setTimeout(() => { setCdNum(0); setTimeout(() => { setCdNum(null); setScreen("playing"); startTimer(g); }, 500); }, 3000);
  }, []);

  // Timer
  const startTimer = useCallback((g) => {
    setTimeLeft(ROUND_TIME);
    if (timerR.current) clearInterval(timerR.current);
    const rs = g.roundStart || Date.now();
    timerR.current = setInterval(() => {
      const rem = Math.max(0, ROUND_TIME - Math.floor((Date.now() - rs) / 1000));
      setTimeLeft(rem);
      if (rem <= 0) {
        clearInterval(timerR.current);
        if (!solvedR.current && !roundEndedR.current) {
          roundEndedR.current = true;
          submitScore(g.round, 0);
        }
      }
    }, 250);
  }, [code, pid]);

  // Submit score
  const submitScore = useCallback(async (round, score) => {
    const r = await sGet(rk(code, round)) || { results: {} };
    r.results[pid] = { score, guesses: gcR.current };
    await sSet(rk(code, round), r);
    let pl = await sGet(pk(code)) || [];
    pl = pl.map(p => p.id === pid ? { ...p, totalScore: p.totalScore + score } : p);
    await sSet(pk(code), pl);
    setPlayers(pl); setRScore(score);
  }, [code, pid]);

  // Submit guess
  const submitGuess = useCallback(async () => {
    if (solved || timeLeft <= 0 || guesses.length >= MAX_GUESSES) return;
    if (input.length !== 3) return;
    const g = (firstLetter + input).toUpperCase();
    if (!VALID_WORDS.has(g)) {
      setShake(true); setErr("Not a valid word!");
      setTimeout(() => { setShake(false); setErr(""); }, 600);
      setInput(""); return;
    }
    const answer = deobf(gs.words[gs.round - 1]);
    const fb = getFeedback(g, answer);
    const ng = [...guesses, g];
    const nf = [...fbs, fb];
    setGuesses(ng); setFbs(nf); setInput(""); gcR.current = ng.length;

    if (g === answer) {
      setSolved(true); solvedR.current = true;
      setFlash("green"); setTimeout(() => setFlash(""), 800);
      await submitScore(gs.round, SCORE_MAP[ng.length] || 10);
    } else if (ng.length >= MAX_GUESSES) {
      roundEndedR.current = true;
      await submitScore(gs.round, 0);
    }
  }, [input, guesses, fbs, solved, timeLeft, gs, submitScore]);

  // End round (GM)
  const endRound = useCallback(async () => {
    if (timerR.current) clearInterval(timerR.current);
    const status = gs.round >= TOTAL_ROUNDS ? "gameOver" : "roundEnd";
    const ng = { ...gs, status };
    await sSet(gk(code), ng);
    setGs(ng); setScreen(status === "gameOver" ? "gameOver" : "roundResult");
  }, [gs, code]);

  // Polling
  useEffect(() => {
    if (!code || screen === "home") return;
    const poll = async () => {
      const g = await sGet(gk(code));
      const pl = await sGet(pk(code));
      if (g) setGs(prev => {
        if (prev && prev.status !== g.status) {
          if (g.status === "countdown" && prev.status !== "countdown") triggerCD(g);
          if (g.status === "roundEnd") { if (timerR.current) clearInterval(timerR.current); setScreen("roundResult"); }
          if (g.status === "gameOver") { if (timerR.current) clearInterval(timerR.current); setScreen("gameOver"); }
        }
        return g;
      });
      if (pl) setPlayers(pl);
      if (g?.round > 0) { const r = await sGet(rk(code, g.round)); if (r) setRd(r); }
    };
    pollR.current = setInterval(poll, POLL_MS);
    poll();
    return () => { if (pollR.current) clearInterval(pollR.current); };
  }, [code, screen]);

  // No window-level keyboard listener needed - input element handles everything

  useEffect(() => () => { if (timerR.current) clearInterval(timerR.current); }, []);

  const answer = gs?.words && gs.round > 0 ? deobf(gs.words[gs.round - 1]) : "";
  const firstLetter = answer?.[0] || "";
  const rsMap = {};
  if (rd?.results) Object.entries(rd.results).forEach(([id, r]) => { rsMap[id] = r.score; });

  const card = { background: C.c1, border: `1px solid ${C.bdr}`, borderRadius: 16, padding: 24, width: "100%", maxWidth: 420 };
  const btn = (c = C.gold, dis = false) => ({
    background: dis ? C.gry : c, color: c === C.gold ? C.bg : C.wht, border: "none", borderRadius: 10,
    padding: "13px 24px", fontFamily: "'Russo One', sans-serif", fontSize: 14,
    cursor: dis ? "default" : "pointer", width: "100%", letterSpacing: 1, opacity: dis ? 0.5 : 1,
  });
  const inp = {
    background: C.c2, border: `2px solid ${C.bdr}`, borderRadius: 10,
    padding: "12px 16px", color: C.txt, fontSize: 16, width: "100%",
    fontFamily: "'Nunito', sans-serif", outline: "none", boxSizing: "border-box",
  };

  return (
    <div style={{
      minHeight: "100vh", background: C.bg, color: C.txt, fontFamily: "'Nunito', sans-serif",
      display: "flex", flexDirection: "column", alignItems: "center", padding: "20px 16px",
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Russo+One&family=Nunito:wght@400;600;700;800&display=swap');
        @keyframes popIn { 0% { transform: scale(0.5); opacity: 0; } 100% { transform: scale(1); opacity: 1; } }
        @keyframes flipIn { 0% { transform: rotateX(90deg); } 100% { transform: rotateX(0deg); } }
        @keyframes shake { 0%,100% { transform: translateX(0); } 25% { transform: translateX(-8px); } 75% { transform: translateX(8px); } }
        @keyframes glow { 0%,100% { box-shadow: 0 0 8px ${C.gold}30; } 50% { box-shadow: 0 0 24px ${C.gold}70; } }
        @keyframes pulse { 0%,100% { opacity: 1; } 50% { opacity: 0.5; } }
        * { box-sizing: border-box; margin: 0; }
        input:focus { border-color: ${C.gold} !important; }
      `}</style>

      {/* Header */}
      <div style={{ marginBottom: 20, textAlign: "center" }}>
        <h1 style={{
          fontFamily: "'Russo One', sans-serif", fontSize: 36, margin: 0,
          background: `linear-gradient(135deg, ${C.gold}, ${C.ylw})`,
          WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", letterSpacing: 4,
        }}>LINGO</h1>
        {code && screen !== "home" && (
          <div style={{ fontSize: 11, color: C.txtM, marginTop: 4, letterSpacing: 1 }}>
            CODE: <span style={{ color: C.gold, fontWeight: 800 }}>{code}</span>
          </div>
        )}
      </div>

      {/* HOME */}
      {screen === "home" && (
        <div style={{ ...card, animation: "popIn 0.3s ease" }}>
          <div style={{ marginBottom: 20 }}>
            <label style={{ fontSize: 11, color: C.txtD, letterSpacing: 1, marginBottom: 6, display: "block" }}>YOUR NAME</label>
            <input style={inp} value={name} onChange={e => setName(e.target.value)} placeholder="Enter your name..." maxLength={20} onKeyDown={e => e.key === "Enter" && e.preventDefault()} />
          </div>
          {err && <div style={{ color: C.red, fontSize: 13, marginBottom: 12, textAlign: "center" }}>{err}</div>}
          <button style={{ ...btn(), marginBottom: 10 }} onClick={create}>🎮 CREATE NEW GAME</button>
          <div style={{ textAlign: "center", color: C.txtM, fontSize: 13, margin: "14px 0" }}>— or join —</div>
          <div style={{ display: "flex", gap: 8 }}>
            <input style={{ ...inp, flex: 1, textTransform: "uppercase", letterSpacing: 6, textAlign: "center", fontWeight: 800 }}
              value={joinCode} onChange={e => setJoinCode(e.target.value.toUpperCase().slice(0, 4))} placeholder="CODE" maxLength={4}
              onKeyDown={e => e.key === "Enter" && join()} />
            <button style={{ ...btn(C.acc), width: "auto", padding: "12px 20px" }} onClick={join}>JOIN</button>
          </div>
        </div>
      )}

      {/* LOBBY */}
      {screen === "lobby" && (
        <div style={{ ...card, animation: "popIn 0.3s ease" }}>
          <div style={{ textAlign: "center", marginBottom: 20 }}>
            <div style={{ fontSize: 11, color: C.txtM, letterSpacing: 1, marginBottom: 6 }}>SHARE THIS CODE</div>
            <div style={{
              display: "inline-block", background: C.c2, borderRadius: 12, padding: "12px 28px",
              fontFamily: "'Russo One', sans-serif", fontSize: 32, letterSpacing: 8, color: C.gold,
              animation: "glow 2s ease infinite", border: `1px solid ${C.gold}30`,
            }}>{code}</div>
          </div>
          <div style={{ marginBottom: 20 }}>
            <div style={{ fontSize: 11, color: C.txtD, letterSpacing: 1, marginBottom: 10 }}>PLAYERS ({players.length})</div>
            {players.map((p, i) => (
              <div key={p.id} style={{
                display: "flex", alignItems: "center", gap: 8, padding: "9px 12px",
                background: C.c2, borderRadius: 8, marginBottom: 4,
                border: p.id === pid ? `1px solid ${C.gold}35` : "1px solid transparent",
              }}>
                <span style={{ fontSize: 18 }}>{i === 0 ? "👑" : "🎮"}</span>
                <span style={{ fontWeight: 700, fontSize: 14 }}>{p.name}</span>
                {p.id === pid && <span style={{ fontSize: 10, color: C.gold, marginLeft: "auto" }}>YOU</span>}
              </div>
            ))}
          </div>
          {role === "gm" ? (
            <button style={btn(C.grn, players.length < 1)} onClick={startRound}>🚀 START ROUND 1</button>
          ) : (
            <div style={{ textAlign: "center", color: C.txtD, fontSize: 14, animation: "pulse 1.5s ease infinite" }}>
              Waiting for Game Master...
            </div>
          )}
        </div>
      )}

      {/* COUNTDOWN */}
      {screen === "countdown" && cdNum !== null && (
        <div style={{
          position: "fixed", inset: 0, background: "rgba(0,0,0,0.88)", display: "flex",
          alignItems: "center", justifyContent: "center", zIndex: 999,
        }}>
          <div key={cdNum} style={{
            fontFamily: "'Russo One', sans-serif", fontSize: 130, color: C.gold,
            animation: "popIn 0.35s ease", textShadow: `0 0 60px ${C.gold}50`,
          }}>{cdNum === 0 ? "GO!" : cdNum}</div>
        </div>
      )}

      {/* PLAYING */}
      {screen === "playing" && (
        <div style={{ ...card, maxWidth: 400, animation: "popIn 0.3s ease",
          boxShadow: flash === "green" ? `0 0 40px ${C.grn}50` : undefined,
          transition: "box-shadow 0.5s ease",
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontFamily: "'Russo One', sans-serif", fontSize: 13, color: C.gold, letterSpacing: 1 }}>
              ROUND {gs?.round}/{TOTAL_ROUNDS}
            </span>
            <span style={{
              fontFamily: "'Russo One', sans-serif", fontSize: 20,
              color: timeLeft <= 5 ? C.red : timeLeft <= 10 ? C.ylw : C.txt,
              animation: timeLeft <= 5 ? "pulse 0.5s ease infinite" : undefined,
            }}>{timeLeft}s</span>
          </div>
          <TimerBar left={timeLeft} total={ROUND_TIME} />

          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", margin: "20px 0" }}>
            {Array.from({ length: MAX_GUESSES }).map((_, i) => (
              <GuessRow key={i} guess={guesses[i]} feedback={fbs[i]}
                isActive={i === guesses.length && !solved && timeLeft > 0}
                input={i === guesses.length ? input : ""} firstLetter={firstLetter} />
            ))}
          </div>

          {!solved && timeLeft > 0 && guesses.length < MAX_GUESSES && (
            <div style={{ animation: shake ? "shake 0.3s ease" : undefined }}>
              <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                <div style={{
                  width: 48, height: 48, display: "flex", alignItems: "center", justifyContent: "center",
                  background: C.c2, border: `2px solid ${C.gold}`, borderRadius: 8,
                  fontFamily: "'Russo One', sans-serif", fontSize: 22, color: C.gold, flexShrink: 0,
                }}>{firstLetter}</div>
                <input style={{ ...inp, flex: 1, textTransform: "uppercase", letterSpacing: 6, textAlign: "center", fontWeight: 800, fontSize: 22 }}
                  value={input} onChange={e => setInput(e.target.value.replace(/[^a-zA-Z]/g, "").toUpperCase().slice(0, 3))}
                  onKeyDown={e => { if (e.key === "Enter") submitGuess(); }} placeholder="···" maxLength={3} autoFocus />
                <button style={{ ...btn(C.gold, input.length !== 3), width: "auto", padding: "12px 18px" }}
                  onClick={submitGuess} disabled={input.length !== 3}>↵</button>
              </div>
              {err && <div style={{ color: C.red, fontSize: 13, textAlign: "center", marginTop: 6 }}>{err}</div>}
              <div style={{ textAlign: "center", color: C.txtM, fontSize: 12, marginTop: 8 }}>
                {MAX_GUESSES - guesses.length} guesses left • First letter is locked
              </div>
            </div>
          )}

          {solved && (
            <div style={{ textAlign: "center", animation: "popIn 0.4s ease" }}>
              <div style={{ fontSize: 32 }}>🎉</div>
              <div style={{ fontFamily: "'Russo One', sans-serif", color: C.grn, fontSize: 18, marginTop: 4 }}>
                +{SCORE_MAP[guesses.length] || 10} POINTS
              </div>
              <div style={{ color: C.txtD, fontSize: 13, marginTop: 4 }}>Solved in {guesses.length} guess{guesses.length > 1 ? "es" : ""}!</div>
              {role === "gm" && <button style={{ ...btn(C.acc), marginTop: 16 }} onClick={endRound}>END ROUND →</button>}
              {role !== "gm" && <div style={{ color: C.txtD, fontSize: 13, marginTop: 12, animation: "pulse 1.5s ease infinite" }}>Waiting for GM to end round...</div>}
            </div>
          )}

          {(timeLeft <= 0 || (guesses.length >= MAX_GUESSES && !solved)) && !solved && (
            <div style={{ textAlign: "center", animation: "popIn 0.4s ease" }}>
              <div style={{ fontSize: 32 }}>😅</div>
              <div style={{ fontFamily: "'Russo One', sans-serif", color: C.red, fontSize: 14, marginTop: 4 }}>
                {timeLeft <= 0 ? "TIME'S UP!" : "OUT OF GUESSES!"}
              </div>
              <div style={{ color: C.ylw, fontFamily: "'Russo One', sans-serif", fontSize: 20, marginTop: 8 }}>{answer}</div>
              {role === "gm" && <button style={{ ...btn(C.acc), marginTop: 16 }} onClick={endRound}>END ROUND →</button>}
              {role !== "gm" && <div style={{ color: C.txtD, fontSize: 13, marginTop: 12, animation: "pulse 1.5s ease infinite" }}>Waiting for GM to end round...</div>}
            </div>
          )}
        </div>
      )}

      {/* ROUND RESULT */}
      {screen === "roundResult" && (
        <div style={{ width: "100%", maxWidth: 420, animation: "popIn 0.3s ease" }}>
          <div style={{ ...card, textAlign: "center", marginBottom: 12 }}>
            <div style={{ fontSize: 11, color: C.txtM, letterSpacing: 1 }}>ROUND {gs?.round} COMPLETE</div>
            <div style={{ fontFamily: "'Russo One', sans-serif", fontSize: 22, color: C.ylw, margin: "8px 0" }}>
              The word was: {answer}
            </div>
          </div>
          <Board players={players} roundScores={rsMap} showRound myId={pid} />
          {role === "gm" && gs?.round < TOTAL_ROUNDS && (
            <button style={{ ...btn(C.grn), marginTop: 16 }} onClick={startRound}>🚀 START ROUND {gs.round + 1}</button>
          )}
          {role === "gm" && gs?.round >= TOTAL_ROUNDS && (
            <button style={{ ...btn(C.gold), marginTop: 16 }} onClick={endRound}>🏆 SHOW FINAL RESULTS</button>
          )}
          {role !== "gm" && (
            <div style={{ textAlign: "center", color: C.txtD, fontSize: 14, marginTop: 16, animation: "pulse 1.5s ease infinite" }}>
              Waiting for Game Master...
            </div>
          )}
        </div>
      )}

      {/* GAME OVER */}
      {screen === "gameOver" && (
        <div style={{ width: "100%", maxWidth: 420, animation: "popIn 0.3s ease" }}>
          <div style={{ ...card, textAlign: "center", marginBottom: 12 }}>
            <div style={{ fontSize: 52 }}>🏆</div>
            <div style={{ fontFamily: "'Russo One', sans-serif", fontSize: 24, color: C.gold, letterSpacing: 3, marginTop: 8 }}>GAME OVER</div>
            {players.length > 0 && (() => {
              const w = [...players].sort((a, b) => b.totalScore - a.totalScore)[0];
              return (
                <div style={{ marginTop: 12 }}>
                  <div style={{ fontSize: 13, color: C.txtD }}>Winner</div>
                  <div style={{ fontFamily: "'Russo One', sans-serif", fontSize: 26, color: C.gold, marginTop: 4 }}>{w.name}</div>
                  <div style={{ fontSize: 16, color: C.ylw }}>{w.totalScore} points</div>
                </div>
              );
            })()}
          </div>
          <Board players={players} showRound={false} myId={pid} />
          {role === "gm" && (
            <button style={{ ...btn(C.acc), marginTop: 16 }} onClick={() => {
              setScreen("home"); setCode(""); setGs(null); setPlayers([]);
              setRole(null); setGuesses([]); setFbs([]); setSolved(false);
            }}>🎮 NEW GAME</button>
          )}
        </div>
      )}

      <div style={{ marginTop: 32, fontSize: 10, color: C.txtM, letterSpacing: 2 }}>LINGO • FRIDAY GAMES</div>
    </div>
  );
}
