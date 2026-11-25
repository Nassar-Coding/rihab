"""Rihab Makkah: add the Market tab, matching Rihab Madinah.
«السوق» / Market (tabs: Home · Discover · Market · Community · My Plan):
  · Experiences — the inventory's tours, workshops, local experiences and events
  · Services    — the inventory's services, stays and the hosted Makkan family visit,
                  requested from their page ("Request this service")
  · Products    — 10 local products with an indicative price, a quantity and a note
Requests join «طلباتي» / My requests with the homes and opportunities already there.
The Assistant answers about the Market, products and services."""
import json, re, sys
PATH = sys.argv[1]
s = open(PATH, encoding="utf-8").read()

def rep(a, b, count=1):
    global s
    n = s.count(a)
    if n != count:
        raise SystemExit(f"expected {count}× got {n}: {a[:110]!r}")
    s = s.replace(a, b)

# ── icons ──
rep('  ArrowLeftRight,\n} from "lucide-react";', '  ArrowLeftRight, Gift, Package,\n} from "lucide-react";')

# ── products ──
PRODUCTS = '''
/* products: [ar, en] pairs; `photo` is a library slot; prices are indicative */
const PRODUCT_CATS = [
  { id: "dates", name: ["تمور", "Dates"], icon: Package },
  { id: "gifts", name: ["هدايا وتذكارات", "Gifts & souvenirs"], icon: Gift },
  { id: "crafts", name: ["حرف يدوية", "Handicrafts"], icon: Palette },
  { id: "scents", name: ["عطور", "Perfumes"], icon: Sparkles },
];
const PRODUCT_CAT = byId(PRODUCT_CATS);
const PRODUCTS = [
  { id: "PRD-01", cat: "dates", photo: "market_dates", price: 75, n: ["تمر سكري فاخر", "Premium Sukkari dates"], t: ["علبة ١ كجم", "1 kg box"],
    ab: ["السكري من أكثر التمور طلبًا في أسواق مكة: ذهبي اللون وحلو المذاق. يأتي في علبة مغلقة تناسب البيت أو الهدية.", "Sukkari is among the most sought-after dates in Makkah's markets: golden and sweet. It comes in a sealed box, for home or as a gift."],
    facts: [[["الوزن", "Weight"], ["١ كجم", "1 kg"]], [["التغليف", "Packaging"], ["علبة مغلقة", "Sealed box"]]] },
  { id: "PRD-02", cat: "dates", photo: "prod_dates_gift", price: 120, n: ["علبة هدايا تمور مشكّلة", "Assorted dates gift box"], t: ["سكري وعجوة وصفاوي", "Sukkari, Ajwa and Safawi"],
    ab: ["ثلاثة أصناف معروفة من التمور في علبة هدية بشريطة، مناسبة لمن يعود من عمرته أو زيارته.", "Three well-known varieties in a ribboned gift box, a good present to take home after Umrah or a visit."],
    facts: [[["الوزن", "Weight"], ["٧٥٠ غ", "750 g"]], [["المحتوى", "Contents"], ["ثلاثة أصناف", "Three varieties"]]] },
  { id: "PRD-03", cat: "dates", photo: "food_bakery_rounds", price: 55, n: ["معمول بالتمر", "Date ma'amoul"], t: ["علبة ٢٤ قطعة", "Box of 24"],
    ab: ["معمول محشو بعجينة التمر، مخبوز طازجًا ومرشوش بالسمسم، من ضيافة البيوت المكية.", "Ma'amoul filled with date paste, freshly baked and sprinkled with sesame — a staple of Makkan home hospitality."],
    facts: [[["العدد", "Pieces"], ["٢٤ قطعة", "24 pieces"]], [["الحفظ", "Storage"], ["مكان جاف", "A dry place"]]] },
  { id: "PRD-04", cat: "scents", photo: "prod_perfume", price: 150, n: ["دهن عود وعطور شرقية", "Oud oil and Arabian perfumes"], t: ["قوارير صغيرة للهدية", "Small gift bottles"],
    ab: ["تشكيلة من دهن العود والعطور الشرقية في قوارير زجاجية صغيرة، من الهدايا التي يكثر حملها من مكة.", "A selection of oud oil and Arabian perfumes in small glass bottles, among the gifts most often taken home from Makkah."],
    facts: [[["الكمية", "Quantity"], ["٣ قوارير × ١٢ مل", "3 bottles × 12 ml"]]] },
  { id: "PRD-05", cat: "gifts", photo: "prod_prayer_beads", price: 60, n: ["مسبحة يدوية", "Handmade prayer beads"], t: ["٣٣ حبة بشرّابة", "33 beads with a tassel"],
    ab: ["مسبحة خشبية بحبات مصقولة، مصنوعة يدويًا وتأتي في كيس من القماش.", "Wooden prayer beads with polished beads, handmade and packed in a cloth pouch."],
    facts: [[["الخامة", "Material"], ["خشب مصقول", "Polished wood"]]] },
  { id: "PRD-06", cat: "gifts", photo: "heritage_lantern", price: 95, n: ["فانوس بنقوش حجازية", "Lantern with Hijazi patterns"], t: ["معدن وزجاج — للزينة", "Metal and glass — decorative"],
    ab: ["فانوس معدني بنقوش مستوحاة من رواشين البيوت الحجازية القديمة، يضاء بشمعة أو مصباح صغير.", "A metal lantern with patterns inspired by the rawasheen windows of old Hijazi houses, lit with a candle or a small lamp."],
    facts: [[["الارتفاع", "Height"], ["٣٥ سم", "35 cm"]]] },
  { id: "PRD-07", cat: "crafts", photo: "craft_loom_hands", price: 140, n: ["قطعة سدو منسوجة يدويًا", "Handwoven Sadu piece"], t: ["للجدار أو الطاولة", "For a wall or a table"],
    ab: ["قطعة من نسيج السدو بألوانه التقليدية، منسوجة يدويًا على النول.", "A piece of Sadu weaving in its traditional colours, woven by hand on the loom."],
    facts: [[["المقاس", "Size"], ["٤٠ × ٦٠ سم", "40 × 60 cm"]]] },
  { id: "PRD-08", cat: "crafts", photo: "craft_pottery_bowls", price: 110, n: ["طقم أطباق فخار", "Set of pottery bowls"], t: ["٤ قطع مزججة", "4 glazed pieces"],
    ab: ["أطباق فخارية مزججة بألوان ترابية، مشكّلة على الدولاب.", "Glazed pottery bowls in earthy colours, thrown on the wheel."],
    facts: [[["العدد", "Pieces"], ["٤ أطباق", "4 bowls"]]] },
  { id: "PRD-09", cat: "gifts", photo: "coffee_small_ornate", price: 40, n: ["قهوة حجازية بالهيل", "Hijazi coffee with cardamom"], t: ["٢٥٠ غ محمّصة ومطحونة", "250 g, roasted and ground"],
    ab: ["قهوة عربية شقراء محمّصة ومطحونة مع الهيل، جاهزة للدلّة.", "Lightly roasted Arabic coffee ground with cardamom, ready for the dallah."],
    facts: [[["الوزن", "Weight"], ["٢٥٠ غ", "250 g"]]] },
  { id: "PRD-10", cat: "gifts", photo: "library_old_books", price: 70, n: ["كتاب مصوّر عن معالم مكة المكرمة", "Illustrated book of Makkah's landmarks"], t: ["بالعربية والإنجليزية", "Arabic and English"],
    ab: ["كتاب مصوّر عن معالم مكة المكرمة وتاريخها، بنصوص عربية وإنجليزية.", "An illustrated book about Makkah's landmarks and history, with Arabic and English text."],
    facts: [[["اللغة", "Language"], ["العربية والإنجليزية", "Arabic and English"]]] },
];
const PRODUCT = byId(PRODUCTS);
'''
m = re.search(r'const REQUEST_NOTE = \["[^"]*",\n  "[^"]*"\];\n', s)
if not m: raise SystemExit("REQUEST_NOTE")
s = s[:m.end()] + PRODUCTS + s[m.end():]

# ── request kinds, targets and the record ──
rep('const REQUEST_KIND = {\n  home:', '''const REQUEST_KIND = {
  product: { label: ["منتج", "Product"], act: ["اطلب المنتج", "Request this product"] },
  service: { label: ["خدمة", "Service"], act: ["اطلب الخدمة", "Request this service"] },
  home:''')
rep('function requestTarget(kind, ref) {\n', '''function requestTarget(kind, ref) {
  if (kind === "product") { const p = PRODUCT[ref]; return p && { title: L2(p.n), sub: L2(p.t), photo: p.photo, to: { s: "product", id: ref } }; }
  if (kind === "service") { const o = getObj(ref); return o && { title: o.name, sub: Dj([o.typeLabel, NB[o.neighborhood]?.name]), photo: o.photo, obj: o, to: { s: "object", id: ref } }; }
''')
rep('kind: a.kind, ref: a.ref, purpose: a.purpose === "info" ? "info" : "interest", note: a.note ?? null, at,',
    'kind: a.kind, ref: a.ref, purpose: ["home", "opp"].includes(a.kind) ? (a.purpose === "info" ? "info" : "interest") : null, qty: a.kind === "product" ? Math.max(1, Math.min(10, a.qty || 1)) : null, note: a.note ?? null, at,')

# ── the request sheet: a quantity for products; interest / details only for homes and opportunities ──
rep('  const [purpose, setPurpose] = useState(initialPurpose);\n  const [note, setNote] = useState("");',
    '  const [purpose, setPurpose] = useState(initialPurpose);\n  const [qty, setQty] = useState(1);\n  const [note, setNote] = useState("");\n  const choose = kind === "home" || kind === "opp";')
rep('useEffect(() => { if (open) { setPurpose(prior?.purpose || initialPurpose); setNote(prior?.note || ""); setDone(false); }',
    'useEffect(() => { if (open) { setPurpose(prior?.purpose || initialPurpose); setQty(prior?.qty || 1); setNote(prior?.note || ""); setDone(false); }')
rep('const submit = () => { dispatch({ type: "request_add", kind, ref: refId, purpose, note: note.trim() || null }); setDone(true); };',
    'const submit = () => { dispatch({ type: "request_add", kind, ref: refId, purpose: choose ? purpose : null, qty: kind === "product" ? qty : null, note: note.trim() || null }); setDone(true); };')
m = re.search(r'<Sheet open=\{open\} onClose=\{onClose\} title=\{done \? \(purpose === "info" \? tx\("سُجّل طلبك", "Request recorded"\) : tx\("سُجّل اهتمامك", "Interest registered"\)\) : prior \? tx\("عدّل طلبك", "Edit your request"\) : L2\(purpose =', s)
if not m: raise SystemExit("sheet title")
s = s[:m.start()] + '<Sheet open={open} onClose={onClose} title={done ? (!choose || purpose === "info" ? tx("سُجّل طلبك", "Request recorded") : tx("سُجّل اهتمامك", "Interest registered")) : prior ? tx("عدّل طلبك", "Edit your request") : !choose ? L2(K.act) : L2(purpose =' + s[m.end():]
rep('''          <div style={{ fontSize: 13.5, fontWeight: 800, margin: "14px 0 8px" }}>{tx("ماذا تريد؟", "What would you like?")}</div>
          <div className="row" style={{ gap: 8, flexWrap: "wrap" }}>
            {["interest", "info"].map((p) => (
              <span key={p} data-request-purpose={p}><Chip active={purpose === p} onClick={() => setPurpose(p)} icon={p === "interest" ? Star : Info}>{L2(p === "interest" ? K.interest : K.info)}</Chip></span>
            ))}
          </div>''', '''          {choose && <>
          <div style={{ fontSize: 13.5, fontWeight: 800, margin: "14px 0 8px" }}>{tx("ماذا تريد؟", "What would you like?")}</div>
          <div className="row" style={{ gap: 8, flexWrap: "wrap" }}>
            {["interest", "info"].map((p) => (
              <span key={p} data-request-purpose={p}><Chip active={purpose === p} onClick={() => setPurpose(p)} icon={p === "interest" ? Star : Info}>{L2(p === "interest" ? K.interest : K.info)}</Chip></span>
            ))}
          </div>
          </>}
          {kind === "product" && (
            <div className="row" style={{ justifyContent: "space-between", padding: "14px 0 4px" }}>
              <span style={{ fontSize: 13.5, fontWeight: 800 }}>{tx("الكمية", "Quantity")}</span>
              <div className="row" style={{ gap: 6 }}>
                <button className="press" aria-label={tx("أقل", "Fewer")} onClick={() => setQty((n) => Math.max(1, n - 1))} style={{ width: 44, height: 44, borderRadius: R.pill, border: `1px solid ${T.line}`, display: "grid", placeItems: "center" }}><Minus size={16} /></button>
                <span data-request-qty style={{ minWidth: 30, textAlign: "center", fontSize: 16, fontWeight: 800 }}>{ar(qty)}</span>
                <button className="press" aria-label={tx("أكثر", "More")} onClick={() => setQty((n) => Math.min(10, n + 1))} style={{ width: 44, height: 44, borderRadius: R.pill, border: `1px solid ${T.line}`, display: "grid", placeItems: "center" }}><Plus size={16} /></button>
              </div>
            </div>
          )}''')
rep('placeholder={kind === "home" ? tx("مثلًا: موعد الانتقال أو عدد أفراد الأسرة", "For example: when you\'d move, or how many in the family") : ',
    'placeholder={kind === "home" ? tx("مثلًا: موعد الانتقال أو عدد أفراد الأسرة", "For example: when you\'d move, or how many in the family") : kind === "service" ? tx("مثلًا: اليوم والوقت المناسبين، أو عدد الأشخاص", "For example: the day and time that suit you, or how many people") : kind === "product" ? tx("مثلًا: للهدية، أو تغليف خاص", "For example: it\'s a gift, or special wrapping") : ')
rep('{prior ? tx("حدّث الطلب", "Update the request") : purpose === "info" ? tx("سجّل الطلب", "Record the request") : tx("سجّل اهتمامي", "Register my interest")}',
    '{prior ? tx("حدّث الطلب", "Update the request") : !choose || purpose === "info" ? tx("سجّل الطلب", "Record the request") : tx("سجّل اهتمامي", "Register my interest")}')

# ── the Market screens ──
MARKET = '''/* ───────── السوق ───────── */

/* a page's single action, kept above the bottom edge */
function StickyAction({ label, onClick, note, done, data }) {
  return (
    <div style={{ position: "sticky", bottom: 0, zIndex: 40, padding: "12px 16px 14px", marginTop: "auto",
      background: "linear-gradient(180deg, rgba(249,246,236,0) 0%, rgba(249,246,236,.96) 30%, #F9F6EC 100%)" }}>
      {note && <div style={{ fontSize: 11.5, color: T.muted, textAlign: "center", marginBottom: 8, lineHeight: 1.7 }}>{note}</div>}
      <button className="press" data-request-open={data} onClick={onClick}
        style={{ width: "100%", height: 48, borderRadius: R.ctl, background: done ? T.paper : T.deep, color: done ? T.ink : T.onDeep, border: done ? `1px solid ${T.line}` : "none", fontWeight: 800, fontSize: 14.5 }}>
        {label}
      </button>
    </div>
  );
}

const MARKET_TABS = [
  { id: "experiences", name: ["التجارب", "Experiences"], icon: Sparkles },
  { id: "services", name: ["الخدمات", "Services"], icon: Wrench },
  { id: "products", name: ["المنتجات", "Products"], icon: ShoppingBag },
];
/* experiences: tours, workshops, local experiences and events from the shared inventory */
const EXP_FILTERS = [
  { id: "all", name: ["الكل", "All"], test: () => true },
  { id: "tours", name: ["جولات", "Tours"], test: (o) => /(جول|مسار|مشي|مشية|زياره|زيارة)/.test(o.n) },
  { id: "workshops", name: ["ورش", "Workshops"], test: (o) => /ورش/.test(o.n) || ["craft", "learn"].includes(o.category) },
  { id: "local", name: ["تجارب محلية", "Local experiences"], test: (o) => o.type === "experience" },
  { id: "events", name: ["فعاليات", "Events"], test: (o) => o.type === "event" },
];
/* services: what a person can request — guides, transport, hospitality and stays, translation */
const SERVICE_FILTERS = [
  { id: "all", name: ["الكل", "All"], test: () => true },
  { id: "guides", name: ["إرشاد وجولات", "Guides & tours"], test: (o) => /مرشد/.test(o.n) },
  { id: "transport", name: ["نقل", "Transport"], test: (o) => /نقل/.test(o.n) },
  { id: "hospitality", name: ["ضيافة وإقامة", "Hospitality & stays"], test: (o) => o.category === "stay" || /ضياف/.test(o.n) },
  { id: "translation", name: ["ترجمة", "Translation"], test: (o) => /ترجم/.test(o.n) },
  { id: "other", name: ["خدمات أخرى", "Other services"], test: (o) => !/(مرشد|نقل|ضياف|ترجم)/.test(o.n) && o.category !== "stay" },
];
const HOSTED_EXPERIENCE = "x-family-host";   // hosted by a Makkan family: hospitality you can book
const marketExperiences = () => INVENTORY.filter((o) => ["experience", "event", "activity"].includes(o.type) && !o.real && isPromotable(o) && !NOT_RUNNING.includes(lifecycleOf(o)));
const marketServices = () => INVENTORY.filter((o) => (o.type === "service" || (o.category === "stay" && !o.real) || o.id === HOSTED_EXPERIENCE) && isPromotable(o));

function ScreenMarket({ params }) {
  const { state, ctx, go } = useApp();
  const [tab, setTab] = useViewState("marketTab", params?.tab || "experiences");
  const [filter, setFilter] = useViewState("marketFilter", "all");
  const pickTab = (t) => { setTab(t); setFilter("all"); };
  const open = (state.requests || []).length;
  const filters = tab === "experiences" ? EXP_FILTERS : tab === "services" ? SERVICE_FILTERS : [{ id: "all", name: ["الكل", "All"] }, ...PRODUCT_CATS];
  const list = useMemo(() => {
    if (tab === "products") return PRODUCTS.filter((p) => filter === "all" || p.cat === filter);
    const f = filters.find((x) => x.id === filter) || filters[0];
    const pool = (tab === "experiences" ? marketExperiences() : marketServices()).filter((o) => f.test(o));
    return rank(pool, ctx, { limit: 40, maxPerCategory: 40, maxPerNeighborhood: 40 });
  }, [tab, filter, ctx]);   // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="screen scroll" data-market style={{ paddingBottom: 96 }}>
      <PageHead back={!!params?.pushed} title={tx("السوق", "Market")} sub={tx("تجارب وخدمات ومنتجات من مكة — احجزها أو اطلبها", "Experiences, services and products from Makkah — book or request them")}
        trailing={(
          <button className="press row" data-requests-entry onClick={() => go({ s: "requests" })}
            style={{ gap: 6, minHeight: 36, padding: "6px 12px", borderRadius: R.pill, background: T.paper, border: `1px solid ${T.line}`, fontSize: 12.5, fontWeight: 800, flex: "0 0 auto" }}>
            <ClipboardList size={15} />{tx("طلباتي", "My requests")}
            {open > 0 && <span style={{ minWidth: 18, height: 18, padding: "0 5px", borderRadius: 99, background: T.clay, color: T.onDeep, fontSize: 10.5, display: "grid", placeItems: "center" }}>{ar(open)}</span>}
          </button>
        )} />
      <div className="row" style={{ gap: 8, padding: "0 16px 12px" }}>
        {MARKET_TABS.map((t) => {
          const on = t.id === tab; const Icon = t.icon;
          return (
            <button key={t.id} className="press" data-market-tab={t.id} aria-pressed={on ? "true" : "false"} onClick={() => pickTab(t.id)}
              style={{ flex: 1, minWidth: 0, minHeight: 64, padding: "9px 4px", borderRadius: R.box, background: on ? T.deep : T.paper, color: on ? T.onDeep : T.ink,
                border: `1px solid ${on ? T.deep : T.line}`, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 5 }}>
              <Icon size={19} strokeWidth={2} />
              <span style={{ fontSize: 13, fontWeight: 800 }}>{L2(t.name)}</span>
            </button>
          );
        })}
      </div>
      <div className="rail scroll" style={{ paddingBottom: 12 }}>
        {filters.map((f) => <Chip key={f.id} active={filter === f.id} onClick={() => setFilter(f.id)}>{L2(f.name)}</Chip>)}
      </div>
      {tab === "products" ? (
        <div style={{ padding: "0 16px" }}>
          <div style={{ fontSize: 12.5, color: T.muted, lineHeight: 1.7, marginBottom: 12 }}>{tx("منتجات محلية تطلبها من داخل التطبيق: تمور وهدايا وحرف وعطور.", "Local products you can request in the app: dates, gifts, crafts and perfumes.")}</div>
          <div data-product-grid style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            {list.map((p) => <ProductCard key={p.id} p={p} />)}
          </div>
        </div>
      ) : (
        <div style={{ padding: "0 16px" }}>
          <div style={{ fontSize: 12.5, color: T.muted, lineHeight: 1.7, marginBottom: 4 }}>
            {tab === "experiences" ? tx("جولات وورش وتجارب محلية وفعاليات — الحجز والانضمام من صفحة كل تجربة.", "Tours, workshops, local experiences and events — book or join from each one's page.")
              : tx("مرشدون ونقل وضيافة وترجمة وخدمات أخرى — اطلب الخدمة من صفحتها.", "Guides, transport, hospitality, translation and more — request each service from its page.")}
          </div>
          {list.length ? list.map((x) => <RowCard key={x.o.id} x={x} showWhy={false} kindPill />)
            : <EmptyState title={tx("لا شيء هنا الآن", "Nothing here right now")} body={tx("جرّب تصنيفًا آخر.", "Try another category.")} />}
        </div>
      )}
    </div>
  );
}

function ProductCard({ p }) {
  const { state, go } = useApp();
  const r = requestFor(state, "product", p.id);
  return (
    <button className="lift" data-product={p.id} onClick={() => go({ s: "product", id: p.id })} style={{ textAlign: "start", minWidth: 0 }}>
      <Photo kind="market" seed={p.id} photo={p.photo} ratio="1 / 1" radius={R.box} scrim="none" />
      <div style={{ fontSize: 14, fontWeight: 800, lineHeight: 1.45, marginTop: 7 }}>{L2(p.n)}</div>
      <div style={{ fontSize: 12, color: T.muted, marginTop: 2, lineHeight: 1.5 }}>{L2(p.t)}</div>
      <div className="row" style={{ gap: 6, marginTop: 5, flexWrap: "wrap" }}>
        <span style={{ fontSize: 13, fontWeight: 800, color: T.green }}>{riyal(p.price)}{p.unit ? ` ${L2(p.unit)}` : ""}</span>
        <RequestedPill r={r} />
      </div>
    </button>
  );
}

function ScreenProduct({ id }) {
  const { state } = useApp();
  const p = PRODUCT[id];
  const [open, setOpen] = useState(false);
  if (!p) return <EmptyState title={tx("لم نعد نجد هذا المنتج", "We can't find this product")} body={tx("ربما أُزيل من السوق.", "It may have been removed from the Market.")} />;
  const r = requestFor(state, "product", p.id);
  const more = PRODUCTS.filter((x) => x.id !== p.id && x.cat === p.cat).concat(PRODUCTS.filter((x) => x.cat !== p.cat)).slice(0, 4);
  return (
    <div className="screen scroll" data-product-page={p.id} style={{ display: "flex", flexDirection: "column", minHeight: "100%" }}>
      <DetailHero photo={p.photo} seed={p.id} />
      <div style={{ padding: "16px 16px 0" }}>
        <div className="row" style={{ gap: 6, marginBottom: 8, flexWrap: "wrap" }}>
          <Pill tone={T.green} bg={T.tint}>{L2(PRODUCT_CAT[p.cat].name)}</Pill>
          <RequestedPill r={r} />
        </div>
        <div style={{ fontSize: 23, fontWeight: 800, lineHeight: 1.35 }}>{L2(p.n)}</div>
        <div style={{ fontSize: 14, color: T.muted, marginTop: 4 }}>{L2(p.t)}</div>
        <div className="row" style={{ gap: 8, marginTop: 10, flexWrap: "wrap" }}>
          <span data-product-price style={{ fontSize: 19, fontWeight: 800, color: T.green }}>{riyal(p.price)}{p.unit ? ` ${L2(p.unit)}` : ""}</span>
          <span style={{ fontSize: 11.5, color: T.muted, fontWeight: 700 }}>{tx("سعر تقديري", "Indicative price")}</span>
        </div>
        <div style={{ fontSize: 14.5, lineHeight: 1.95, marginTop: 12 }}>{L2(p.ab)}</div>
      </div>
      {p.facts.length > 0 && (
        <div style={{ padding: "18px 16px 0" }}>
          <div style={{ fontSize: 17, fontWeight: 800, marginBottom: 4 }}>{tx("تفاصيل المنتج", "Product details")}</div>
          {p.facts.map(([l, v]) => <FactRow key={l[0]} label={L2(l)} value={L2(v)} />)}
        </div>
      )}
      <div style={{ padding: "0 16px" }}>
        <InfoNote>{tx("لا يتم البيع أو الدفع عبر التطبيق. يُحفظ طلبك في «طلباتي»، وتقدر تعدّله أو تسحبه في أي وقت.", "Nothing is sold or paid for in the app. Your request is saved in My requests, where you can edit or withdraw it at any time.")}</InfoNote>
      </div>
      <div style={{ padding: "24px 0 0" }}>
        <SectionTitle title={tx("من السوق أيضًا", "More from the Market")} />
        <div className="rail scroll">
          {more.map((x) => <div key={x.id} style={{ width: "var(--rail-tile)", flex: "0 0 auto" }}><ProductCard p={x} /></div>)}
        </div>
      </div>
      <StickyAction data="product" label={r ? tx("عدّل طلبك", "Edit your request") : L2(REQUEST_KIND.product.act)} done={!!r} onClick={() => setOpen(true)} />
      <RequestSheet kind="product" refId={p.id} open={open} onClose={() => setOpen(false)} />
    </div>
  );
}

/* ───────── طلباتي ───────── */'''
rep('/* ───────── طلباتي ───────── */', MARKET)

# ── My requests: products and services join homes and opportunities ──
rep('sub={tx("ما سجّلت اهتمامك به أو طلبت تفاصيله في «فرص مكة».", "What you\'ve registered interest in or asked about in Makkah Opportunities.")}',
    'sub={tx("الطلبات والاهتمامات التي سجّلتها في السوق وفرص مكة.", "The requests and interest you\'ve recorded in the Market and Makkah Opportunities.")}')
rep('{[["all", tx("الكل", "All"), all.length], ["home", tx("السكن", "Homes"), count("home")], ["opp", tx("فرص الأعمال", "Business opportunities"), count("opp")]].map(',
    '{[["all", tx("الكل", "All"), all.length], ["product", tx("المنتجات", "Products"), count("product")], ["service", tx("الخدمات", "Services"), count("service")], ["home", tx("السكن", "Homes"), count("home")], ["opp", tx("فرص الأعمال", "Business opportunities"), count("opp")]].filter(([k, , n]) => k === "all" || n > 0 || k === kind).map(')
rep('''            body={tx("سجّل اهتمامك بسكن في «عِش في مكة» أو بفرصة في «استثمر في مكة»، وستجده هنا.", "Register interest in a home in Live in Makkah, or in an opportunity in Invest in Makkah, and you'll find it here.")}
            action={tx("افتح فرص مكة", "Open Makkah Opportunities")} onAction={() => go({ s: "city", tab: kind === "opp" ? "invest" : "live" })} />''',
    '''            body={tx("اطلب منتجًا أو خدمة من «السوق»، أو سجّل اهتمامك بسكن أو فرصة في «فرص مكة»، وستجده هنا.", "Request a product or a service in the Market, or register interest in a home or an opportunity in Makkah Opportunities, and you'll find it here.")}
            action={["home", "opp"].includes(kind) ? tx("افتح فرص مكة", "Open Makkah Opportunities") : tx("تصفّح السوق", "Browse the Market")}
            onAction={() => (["home", "opp"].includes(kind) ? go({ s: "city", tab: kind === "opp" ? "invest" : "live" }) : go({ s: "market", pushed: true, tab: kind === "service" ? "services" : kind === "product" ? "products" : "experiences" }))} />''')
rep('<Pill tone={T.muted} bg={T.sand}>{L2(REQUEST_PURPOSE[r.purpose] || REQUEST_PURPOSE.interest)}</Pill>',
    '{["home", "opp"].includes(r.kind) && <Pill tone={T.muted} bg={T.sand}>{L2(REQUEST_PURPOSE[r.purpose] || REQUEST_PURPOSE.interest)}</Pill>}')
rep('<div style={{ fontSize: 12, color: T.muted, marginTop: 2, lineHeight: 1.6 }}>{t.sub}</div>\n                <div data-request-status',
    '<div style={{ fontSize: 12, color: T.muted, marginTop: 2, lineHeight: 1.6 }}>{Dj([t.sub, r.qty ? tx(`الكمية: ${ar(r.qty)}`, `Quantity: ${r.qty}`) : null])}</div>\n                <div data-request-status')

# ── a service is requested from its page, not handed off to a contact ──
rep('''function ActionBar({ o, planItem }) {
  const { state, dispatch, toast, go } = useApp();
  const [handoff, setHandoff] = useState(false);
  const [done, setDone] = useState(false);''', '''function ActionBar({ o, planItem }) {
  const { state, dispatch, toast, go } = useApp();
  const [handoff, setHandoff] = useState(false);
  const [done, setDone] = useState(false);
  /* a service is requested, not booked: the request is recorded in «طلباتي» */
  const [reqOpen, setReqOpen] = useState(false);
  const request = o.action === "contact" ? requestFor(state, "service", o.id) : null;''')
rep('case "contact": return { label: "تواصل", act: () => openHandoff(), tone: T.deep };',
    'case "contact": return { label: request ? tx("طلبك مسجّل — عدّله", "Request recorded — edit it") : tx("اطلب الخدمة", "Request this service"), act: () => setReqOpen(true), tone: request ? T.ok : T.deep };')
rep('''              ? tx(`يكتمل لدى ${o.outbound} — لا يصبح «مؤكدًا» إلا بتأكيد حقيقي`, `Completed with ${partnerEn(o.outbound)} — it only becomes \\u201cconfirmed\\u201d with a real confirmation`)
              : tx(`الخدمة عبر ${o.outbound}`, `Service through ${partnerEn(o.outbound)}`)}''', '''              ? tx(`يكتمل لدى ${o.outbound} — لا يصبح «مؤكدًا» إلا بتأكيد حقيقي`, `Completed with ${partnerEn(o.outbound)} — it only becomes \\u201cconfirmed\\u201d with a real confirmation`)
              : o.action === "contact" ? tx("يُحفظ طلبك في «طلباتي»، وتقدر تعدّله أو تسحبه في أي وقت", "Your request is saved in My requests, where you can edit or withdraw it at any time")
              : tx(`الخدمة عبر ${o.outbound}`, `Service through ${partnerEn(o.outbound)}`)}''')
rep('''      <CompletionSheet o={o} open={done} onClose={() => setDone(false)} />
    </>''', '''      <CompletionSheet o={o} open={done} onClose={() => setDone(false)} />
      {o.action === "contact" && <RequestSheet kind="service" refId={o.id} open={reqOpen} onClose={() => setReqOpen(false)} />}
    </>''')

# ── navigation: the fifth tab ──
rep('  { id: "discover", label: "اكتشف", icon: Compass },\n  { id: "community"', '  { id: "discover", label: "اكتشف", icon: Compass },\n  { id: "market", label: "السوق", icon: ShoppingBag },\n  { id: "community"')
rep('const TAB_OF = { home: "home", discover: "discover", community:', 'const TAB_OF = { home: "home", discover: "discover", market: "market", community:')
rep('"notifications", "provider", "city", "estate", "opp", "requests"].includes(view.s)', '"notifications", "provider", "product", "city", "estate", "opp", "requests"].includes(view.s)')
rep('const hideNav = ["search", "thread", "object", "assistant", "account", "password", "estate", "opp"].includes(view.s);',
    'const hideNav = ["search", "thread", "object", "assistant", "account", "password", "product", "estate", "opp"].includes(view.s);')
rep('      case "requests": return <ScreenRequests />;', '      case "market": return <ScreenMarket params={view} />;\n      case "product": return <ScreenProduct id={view.id} />;\n      case "requests": return <ScreenRequests />;')

# ── the Assistant: the Market, products and services ──
rep('function cityAsk(n, E) {\n  const offer = E.offer.length > 0;', '''/* the Market: products named by their own words or a group, a service request, the tab itself */
const W_ = (alts) => new RegExp(`(^| )(ال|و|بال|لل|ب)?(${alts})( |$)`);
const MK_PRODUCT = W_("سكري|عجوه|تمر|تمور|معمول|هديه|هدايا|تذكار|تذكاري|تذكاريه|تذكارات|مسبحه|مسابح|سبحه|دهن عود|عود|عطر|عطور|بخور|فانوس|فوانيس|سدو|فخار|قهوه حجازيه|sukkari|ajwa|dates|maamoul|souvenirs?|gifts?|prayer beads|oud|perfumes?|lantern|sadu|pottery");
const MK_GIFT = W_("هدايا|هديه|تذكار|تذكاري|تذكاريه|تذكارات|منتجات|منتجات محليه|souvenirs?|gifts?|local products?|products");
const MK_BUY = W_("اشتري|نشتري|اشتريه|شراء|اطلب|نطلب|buy|purchase|order|shop for|get some");
const PRODUCT_WORDS = [["PRD-01", /(سكري|sukkari)/], ["PRD-02", /(هدايا تمور|علبه تمور|علبه هدايا|تمور مشكله|gift box|assorted)/], ["PRD-03", /(معمول|maamoul|ma amoul)/],
  ["PRD-04", /(عود|عطر|عطور|بخور|oud|perfume|incense)/], ["PRD-05", /(سبحه|مسبحه|مسابح|prayer beads|misbaha|tasbih)/], ["PRD-06", /(فانوس|فوانيس|lantern)/],
  ["PRD-07", /(سدو|sadu|weav)/], ["PRD-08", /(فخار|pottery|bowls)/], ["PRD-09", /(قهوه|coffee)/], ["PRD-10", /(كتاب|كتب|book)/]];
function productsAsked(n) {
  const own = PRODUCT_WORDS.filter(([, rx]) => rx.test(n)).map(([id]) => id);
  if (own.length) return own;
  if (/(تمر|تمور|dates|عجوه|ajwa)/.test(n)) return ["PRD-01", "PRD-02", "PRD-03"];
  if (/(حرف|يدوي|handicraft|craft)/.test(n)) return ["PRD-07", "PRD-08", "PRD-06"];
  if (/(هدايا|هديه|تذكار|souvenir|gift)/.test(n)) return ["PRD-02", "PRD-05", "PRD-06", "PRD-04"];
  return ["PRD-01", "PRD-02", "PRD-04"];
}
function cityAsk(n, E) {
  const offer = E.offer.length > 0;''')
rep('''      || (/(مفروشه|مفروش|furnished)/.test(n) && /(شهر|اشهر|شهري|شهور|monthly|months?|long|longer)/.test(n)))) return "city_housing";
  return null;
}''', '''      || (/(مفروشه|مفروش|furnished)/.test(n) && /(شهر|اشهر|شهري|شهور|monthly|months?|long|longer)/.test(n)))) return "city_housing";
  if (/(افتح السوق|تبويب السوق|سوق رحاب مكه|سوق التطبيق|(وش|ايش|شو) (في|فيه) السوق|اشرح (لي )?السوق|what s in the market|open the market|the market tab|market tab|explain the market|in the market)/.test(n)) return "market_overview";
  if (/(اطلب (ال)?خدمه|طلب (ال)?خدمه|كيف اطلب|request a service|order a service)/.test(n)) return "market_services";
  if (!offer && ((MK_BUY.test(n) && MK_PRODUCT.test(n)) || MK_GIFT.test(n))) return "market_products";
  return null;
}''')
rep('''      if (it.id === "city_housing") {
        const deal = /(للبيع|تمليك|للتمليك|for sale|to own|''', '''      if (it.id === "market_overview") {
        msg.text = T2("«السوق» فيه ثلاثة أقسام: «التجارب» للجولات والورش والفعاليات وتُحجز أو يُنضم لها من صفحتها، و«الخدمات» مثل المرشدين والنقل والضيافة والترجمة وتطلبها من صفحتها، و«المنتجات» المحلية مثل التمور والهدايا والحرف. أما السكن وفرص الأعمال ففي «فرص مكة» على الرئيسية.",
          "The Market has three parts: Experiences — tours, workshops and events you book or join from their page; Services — guides, transport, hospitality and translation you request from their page; and local Products such as dates, gifts and crafts. Homes and business opportunities are in Makkah Opportunities on Home.");
        msg.links = [{ label: T2("التجارب", "Experiences"), to: { s: "market", tab: "experiences" } }, { label: T2("الخدمات", "Services"), to: { s: "market", tab: "services" } }, { label: T2("المنتجات", "Products"), to: { s: "market", tab: "products" } }];
        return msg;
      }
      if (it.id === "market_services") {
        const top = rank(marketServices(), ctx, { limit: 3, maxPerCategory: 3 });
        msg.text = T2(`الخدمات في «السوق» ← «الخدمات»: مرشدون ونقل وضيافة وترجمة وغيرها، منها: ${titles("service", top.map((x) => x.o.id))}. افتح الخدمة واضغط «اطلب الخدمة». ${KEPT}`,
          `Services are in the Market, under Services: guides, transport, hospitality, translation and more, including ${titles("service", top.map((x) => x.o.id))}. Open a service and tap Request this service. ${KEPT}`);
        msg.city = { kind: "service", ids: top.map((x) => x.o.id) };
        msg.links = [{ label: T2("افتح الخدمات", "Open Services"), to: { s: "market", tab: "services" } }]; return msg;
      }
      if (it.id === "market_products") {
        const ids = productsAsked(q.n).slice(0, 4);
        msg.text = T2(`في «السوق» ← «المنتجات»: ${titles("product", ids)}. افتح المنتج وسجّل طلبك منه، ويُحفظ في «طلباتي» وتقدر تعدّله أو تسحبه في أي وقت.`,
          `In the Market, under Products: ${titles("product", ids)}. Open a product and record your request from it; it's saved in My requests, where you can edit or withdraw it at any time.`);
        msg.city = { kind: "product", ids };
        msg.links = [{ label: T2("افتح المنتجات", "Open Products"), to: { s: "market", tab: "products" } }]; return msg;
      }
      if (it.id === "city_housing") {
        const deal = /(للبيع|تمليك|للتمليك|for sale|to own|''')
rep('msg.text = T2("ما سجّلت أي طلب بعد. تقدر تسجّل اهتمامك بسكن من «عِش في مكة» أو بفرصة من «استثمر في مكة»، وتلقاه في «طلباتي».",',
    'msg.text = T2("ما سجّلت أي طلب بعد. تقدر تطلب منتجًا أو خدمة من «السوق»، أو تسجّل اهتمامك بسكن أو فرصة في «فرص مكة»، وتلقاه في «طلباتي».",')

rep('"You haven\'t recorded any requests yet. You can register interest in a home in Live in Makkah, or in an opportunity in Invest in Makkah, and find it in My requests."',
    '"You haven\'t recorded any requests yet. You can request a product or a service in the Market, or register interest in a home or an opportunity in Makkah Opportunities, and find it in My requests."')

open(PATH, "w", encoding="utf-8").write(s)
print("makkah market added")
