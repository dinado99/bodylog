const cfg = window.BODYLOG_CONFIG;
const $ = (id) => document.getElementById(id);
const msg = $("msg");

function say(text, isError = false) {
  msg.textContent = text || "";
  msg.className = isError ? "error" : "";
}

if (!cfg || cfg.SUPABASE_URL.includes("YOUR-PROJECT")) {
  say("config.js에 Supabase URL과 anon key를 설정해 주세요.", true);
  throw new Error("config.js not configured");
}

const sb = supabase.createClient(cfg.SUPABASE_URL, cfg.SUPABASE_ANON_KEY);
const today = () => new Date(Date.now() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 10);
let chart;

function el(tag, text, attrs = {}) {
  const e = document.createElement(tag);
  if (text != null) e.textContent = text;
  Object.assign(e, attrs);
  return e;
}

async function loadWeights() {
  const { data, error } = await sb.from("weight_logs").select("*").order("log_date", { ascending: true });
  if (error) return say(error.message, true);
  const list = $("weight-list");
  list.replaceChildren();
  [...data].reverse().forEach((r) => {
    const li = el("li");
    const fat = r.body_fat_pct != null ? ` · 체지방 ${r.body_fat_pct}%` : "";
    const memo = r.memo ? ` · ${r.memo}` : "";
    li.append(el("span", `${r.log_date}  ${r.weight_kg}kg${fat}${memo}`));
    const del = el("button", "삭제");
    del.onclick = async () => { await sb.from("weight_logs").delete().eq("id", r.id); loadWeights(); };
    li.append(del);
    list.append(li);
  });
  const cs = getComputedStyle(document.documentElement);
  const cfgChart = {
    type: "line",
    data: {
      labels: data.map((r) => r.log_date),
      datasets: [{ label: "체중(kg)", data: data.map((r) => Number(r.weight_kg)), borderColor: cs.getPropertyValue("--accent").trim(), tension: 0.25 }],
    },
    options: { plugins: { legend: { display: false } } },
  };
  if (chart) chart.destroy();
  chart = new Chart($("chart"), cfgChart);
}

async function loadMeals() {
  const date = $("m-date").value;
  const { data, error } = await sb.from("meal_logs").select("*").eq("log_date", date).order("created_at");
  if (error) return say(error.message, true);
  const list = $("meal-list");
  list.replaceChildren();
  let total = 0;
  data.forEach((r) => {
    total += r.kcal || 0;
    const li = el("li");
    li.append(el("span", `[${r.meal_type}] ${r.menu}${r.kcal != null ? ` · ${r.kcal}kcal` : ""}`));
    const del = el("button", "삭제");
    del.onclick = async () => { await sb.from("meal_logs").delete().eq("id", r.id); loadMeals(); };
    li.append(del);
    list.append(li);
  });
  $("m-total").textContent = `${date} 합계: ${total} kcal`;
}

$("weight-form").onsubmit = async (e) => {
  e.preventDefault();
  const fat = $("w-fat").value;
  const { error } = await sb.from("weight_logs").upsert(
    { log_date: $("w-date").value, weight_kg: $("w-kg").value, body_fat_pct: fat === "" ? null : fat, memo: $("w-memo").value || null },
    { onConflict: "user_id,log_date" }
  );
  if (error) return say(error.message, true);
  say("저장했어요.");
  e.target.reset();
  $("w-date").value = today();
  loadWeights();
};

$("meal-form").onsubmit = async (e) => {
  e.preventDefault();
  const kcal = $("m-kcal").value;
  const { error } = await sb.from("meal_logs").insert({
    log_date: $("m-date").value, meal_type: $("m-type").value, menu: $("m-menu").value, kcal: kcal === "" ? null : Number(kcal),
  });
  if (error) return say(error.message, true);
  say("");
  $("m-menu").value = ""; $("m-kcal").value = "";
  loadMeals();
};
$("m-date").onchange = loadMeals;

$("auth-form").onsubmit = async (e) => {
  e.preventDefault();
  const { error } = await sb.auth.signInWithPassword({ email: $("email").value, password: $("password").value });
  if (error) say(error.message, true);
};
$("signup").onclick = async () => {
  const { data, error } = await sb.auth.signUp({ email: $("email").value, password: $("password").value });
  if (error) return say(error.message, true);
  say(data.session ? "가입 완료!" : "확인 메일을 보냈어요. 메일의 링크를 누른 뒤 로그인해 주세요.");
};
$("logout").onclick = () => sb.auth.signOut();

function render(session) {
  $("auth").hidden = !!session;
  $("app").hidden = !session;
  $("logout").hidden = !session;
  if (session) {
    say("");
    $("w-date").value = $("m-date").value = today();
    loadWeights();
    loadMeals();
  }
}
sb.auth.onAuthStateChange((_event, session) => render(session));
sb.auth.getSession().then(({ data }) => render(data.session));
