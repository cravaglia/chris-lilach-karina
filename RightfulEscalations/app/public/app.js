// Journey Recovery v2 — front-end. Fetches /api/recovery and renders the dashboard.
let DATA = null, curTab = 'overview', radarDone = false, stepIdx = 0, assistPublished = false, pbFlow = null;
const STEPS = ['overview', 'quality', 'modal', 'playbook'];
const $ = (id) => document.getElementById(id);
const svg = (vb, inner) => `<svg viewBox="${vb}" width="100%" height="100%" preserveAspectRatio="xMidYMid meet" style="display:block">${inner}</svg>`;

async function boot() {
  DATA = await fetch('/api/recovery').then((r) => r.json());
  renderOverview();
  updateDemo('overview');
}

// ---- KPI helper ----
function kpiHtml(k) {
  const foot = k.trend ? `<div class="trend ${k.trend.dir}">${k.trend.text}</div>` : `<div class="s">${k.sub || ''}</div>`;
  return `<div class="kpi"><div class="l">${k.label}</div><div class="v ${k.valueClass || ''}">${k.value}</div>${foot}</div>`;
}

// ---- OVERVIEW ----
function renderOverview() {
  const o = DATA.overview;
  $('ov-narr').innerHTML = o.narrative;
  $('ov-kpis').innerHTML = o.kpis.map(kpiHtml).join('');
  initEscQ(o.escalationQuality);
  initSeam(o.seam);
  $('ov-actions').innerHTML = o.recommendedActions.map((a) => `
    <div class="rec"><h4>${a.title}</h4><p>${a.desc}</p>
      <div class="chips"><span class="chip-i">${a.impact}</span><span class="chip-o">${a.owner}</span></div>
      <button class="btn ghost">${a.cta}</button></div>`).join('');
}

// ---- RECOVERY QUALITY ----
function renderQuality() {
  $('q-kpis').innerHTML = DATA.quality.kpis.map(kpiHtml).join('');
  initRadar(DATA.quality.radar);
  $('rbt').innerHTML = DATA.quality.byType.map((r) => `
    <div class="rbt-row"><div class="rbt-name">${r.name}<small>${r.sub}</small></div>
      <div class="rbt-track"><div class="rbt-fill" style="width:${r.pct}%;background:${r.color}"></div></div>
      <div class="rbt-val" style="color:${r.color}">${r.pct}%</div></div>`).join('');
  $('sessRows').innerHTML = DATA.quality.sessions.map((s) => `
    <tr class="clk" onclick="openModal()">
      <td class="mono">${s.id}</td>
      <td><span class="tag rightful">${s.type}</span></td>
      <td>${s.channel}</td>
      <td>${s.sentiment}</td>
      <td>${s.deadZone}</td>
      <td class="score ${s.scoreClass}">${s.score}</td>
      <td><span class="tag ${s.resClass}">${s.resolution}</span></td>
      <td><span class="link">⤓ Open</span></td>
    </tr>`).join('');
}

// ---- PLAYBOOK (fix workspace) ----
const tokenize = (t) => t.replace(/\[([^\]]+)\]/g, '<span class="tok">[$1]</span>');
function renderPlaybook() {
  const root = $('pb-root');
  if (!pbFlow) {
    root.innerHTML = `<div class="narr"><span class="spark">✦</span><p>${DATA.playbook.intro}</p></div>
      <div class="sec-title">Breaking escalation flows · worst-first</div>
      <div class="flowlist">` + DATA.playbook.flows.map((f) => `
        <div class="flowcard" onclick="openFlow('${f.id}')">
          <div class="fc-main"><div class="fc-name">${f.name}</div><div class="fc-sub">${f.sub}</div></div>
          <div class="fc-bar"><i style="width:${f.recovery}%"></i><u style="left:${f.top}%"></u></div>
          <div class="fc-stat"><div class="fc-rec">${f.recovery}%<span> recovered</span></div><div class="fc-vs">vs ${f.top}% top · ${f.volume} contacts</div></div>
          <div class="fc-arrow">→</div></div>`).join('') + `</div>`;
  } else {
    root.innerHTML = workspaceHtml(DATA.playbook.flows.find((f) => f.id === pbFlow));
  }
}
function openFlow(id) { pbFlow = id; renderPlaybook(); updateDemo('playbook'); }
function backToFlows() { pbFlow = null; renderPlaybook(); }
function pbTokensIn(t) { return (t.match(/\[([^\]]+)\]/g) || []).map((x) => x.slice(1, -1).trim()); }
function fillTemplate(t, values) {
  return t.replace(/\[([^\]]+)\]/g, (m, tok) => { const k = tok.trim(); const v = values ? values[k] : undefined; return (v === undefined || v === null || v === '') ? `<span class="tok-missing">[${k} — empty]</span>` : `<b>${v}</b>`; });
}
function pvCompute(f, t) {
  const toks = pbTokensIn(t); let total = 0, ok = 0;
  const cards = f.guidance.previewCases.map((c) => {
    const miss = []; toks.forEach((tk) => { total++; const v = c.values[tk]; if (v === undefined || v === null || v === '') miss.push(tk); else ok++; });
    const gap = miss.length > 0;
    return `<div class="pv ${gap ? 'gap' : ''}"><div class="pv-lbl"><span>${c.id} · ${c.label}</span>${gap ? `<span class="pv-warn">⚠ ${miss.map((m) => '[' + m + ']').join(', ')} empty — add a fallback</span>` : '<span class="pv-ok">✓ resolved</span>'}</div><div class="pv-txt">"${fillTemplate(t, c.values)}"</div></div>`;
  }).join('');
  return { cards, resolved: `${ok} / ${total} across ${f.guidance.previewCases.length} cases` };
}
function workspaceHtml(f) {
  const g = f.guidance, init = pvCompute(f, g.template);
  return `<div class="back-link" onclick="backToFlows()">◀ Breaking flows</div>
    <div class="ws-head"><h2 class="ws-title grad">${f.name}</h2><div class="ws-stat"><b>${f.recovery}%</b> recovered · ${f.top}% for top recoverers · ${f.volume} contacts</div></div>
    <div class="grid2">
      <div class="card"><h3>1 · Who recovers it best</h3><div class="sub">Difficulty-controlled — a fair comparison.</div>
        ${f.leaders.map((l) => `<div class="lead"><div class="rk ${l.top ? 'top' : ''}">${l.rank}</div><div class="nm">${l.name}<span class="ag"> — ${l.team}</span></div><div class="bar-mini"><i style="width:${l.score}%"></i></div><div style="width:34px;text-align:right;font-weight:800;color:${l.top ? '#0F8A56' : '#6B7280'}">${l.score}</div></div>`).join('')}
      </div>
      <div class="card"><h3>2 · What they say</h3><div class="sub">Real, attributed — your context for the guidance.</div>
        ${f.examples.map((e) => `<div class="ex"><div class="ex-who">${e.agent}</div><div class="ex-q">“${e.quote}”</div></div>`).join('')}
        <div class="common"><b>The common move:</b> ${f.commonMove}</div>
      </div>
    </div>
    <div class="card">
      <h3>3 · Proposed Agent Assist guidance</h3>
      <div class="sub">✦ AI-suggested — already validated across every real case + aligned to best practices. Your part is the <b>human touch</b>: warm up the wording, then publish. (Click a token to insert; ▶ Test re-checks tokens after any edit.)</div>
      <textarea id="tplEdit" class="tpl-edit" rows="4">${g.template}</textarea>
      <div class="chips-row"><span class="chips-lbl">Insert token:</span>${g.tokens.map((t) => `<span class="tok-chip" onclick="pbInsert('${t}')">[${t}]</span>`).join('')}</div>
      <div class="ws-actions ws-actions-split">
        <div><button class="btn ghost" style="width:auto;" onclick="pbRefresh()">↻ Refresh from AI</button> <button class="btn ghost" style="width:auto;" onclick="pbTest()">▶ Test</button></div>
        <button class="btn" style="width:auto;" onclick="openPublish('${f.id}')">Publish to Agent Assist →</button>
      </div>
      <div class="pv-head">Preview on real broken cases (${g.previewCases.length}) <span class="pv-resolved" id="pvResolved">tokens resolved: ${init.resolved}</span></div>
      <div id="pvList">${init.cards}</div>
    </div>`;
}
function pbTest() { const f = DATA.playbook.flows.find((x) => x.id === pbFlow); const r = pvCompute(f, document.getElementById('tplEdit').value); document.getElementById('pvList').innerHTML = r.cards; document.getElementById('pvResolved').textContent = 'tokens resolved: ' + r.resolved; }
function pbRefresh() { const f = DATA.playbook.flows.find((x) => x.id === pbFlow); document.getElementById('tplEdit').value = f.guidance.template; pbTest(); }
function pbInsert(tok) { const ta = document.getElementById('tplEdit'); const s = ta.selectionStart, e = ta.selectionEnd, ins = '[' + tok + ']'; ta.value = ta.value.slice(0, s) + ins + ta.value.slice(e); ta.focus(); ta.selectionStart = ta.selectionEnd = s + ins.length; }

// ---- TRANSCRIPT VIEWER ----
function renderModal() {
  const h = DATA.heroSession, failed = h.outcome === 'failed';
  $('tx-head').innerHTML = `<span class="tag rightful">${h.classificationTag}</span><span class="t">${h.id} · ${h.title}</span>
    <span class="recov-pill ${failed ? 'bad' : 'good'}" style="margin-left:10px;">${failed ? '⚠' : '✓'} Recovery ${h.recovery} · score ${h.score}</span>
    <span class="x" onclick="closeModal()">×</span>`;
  $('tx-conv').innerHTML = h.transcript.map((t) => {
    if (t.leg) return `<div class="leg-label">${t.leg}</div>`;
    if (t.deadzone) return `<div class="deadzone">${t.deadzone}</div>`;
    const cls = t.role === 'customer' ? 'cust' : t.role;
    return `<div class="msg ${cls}"><div class="who">${t.who}</div><div class="bub">${t.text}</div></div>`;
  }).join('');
  const a = h.assist;
  // Recovery gap (before publish) → gap closed (after publish = loop closed)
  let tips;
  if (assistPublished && a.publishedGuidance) {
    tips = `<h4>✓ Recovery gap — now closed</h4>
      <div class="pb-play">${a.publishedGuidance}<div class="src">published to Agent Assist · auto-personalised with this customer's details</div></div>`;
  } else {
    tips = `<h4>Recovery gap</h4><div class="gap-note">⚠ ${a.gap}</div>`;
  }
  $('tx-assist').innerHTML = `
    <div class="ra-title">Recovery Analysis <span class="new-badge">NEW</span></div>
    <div class="ra-sub">Post-call · surfaced in your workspace — not shown to the agent live</div>
    <div class="clsf">Classified: <b>${a.classification}</b></div>
    <h4>What it took to resolve</h4>
    ${a.facts.map((f) => `<div class="act"><b>${f.label}</b>${f.value}</div>`).join('')}
    ${tips}`;
}

// ---- CHARTS (inline SVG) ----
function initEscQ(eq) {
  const r = 70, c = 2 * Math.PI * r, blue = c * eq.rightful / 100;
  $('cEscQ').innerHTML = svg('0 0 200 200',
    `<circle cx="100" cy="100" r="${r}" fill="none" stroke="#F59E0B" stroke-width="24"/>
     <circle cx="100" cy="100" r="${r}" fill="none" stroke="#007AB8" stroke-width="24"
       stroke-dasharray="${blue} ${c - blue}" transform="rotate(-90 100 100)"/>
     <text x="100" y="96" text-anchor="middle" font-size="30" font-weight="800" fill="#1A1F36">${eq.rightful}%</text>
     <text x="100" y="118" text-anchor="middle" font-size="11" fill="#6B7280">rightful-human</text>`);
}

function initSeam(seam) {
  const ai = seam.ai, hum = seam.hum, y = (v) => 20 + (5 - v) * 35;
  const aiPts = ai.map((v, i) => [Math.round(40 + i * (170 / (ai.length - 1))), y(v)]);
  const humPts = hum.map((v, i) => [Math.round(270 + i * (180 / (hum.length - 1))), y(v)]);
  const hy = aiPts[aiPts.length - 1][1];
  const deadPts = [[aiPts[aiPts.length - 1][0], hy], [humPts[0][0], hy]];
  const line = (a, col, dash) => `<polyline points="${a.map((p) => p.join(',')).join(' ')}" fill="none" stroke="${col}" stroke-width="2.5" ${dash ? 'stroke-dasharray="5 4"' : ''}/>`;
  const area = (a, col) => `<polygon points="${a[0][0]},160 ${a.map((p) => p.join(',')).join(' ')} ${a[a.length - 1][0]},160" fill="${col}"/>`;
  const dots = (a, col) => a.map((p, i) => `<circle cx="${p[0]}" cy="${p[1]}" r="${i === a.length - 1 ? 5 : 3}" fill="${col}"/>`).join('');
  let grid = '';
  for (let v = 1; v <= 5; v++) { const yy = y(v); grid += `<line x1="40" y1="${yy}" x2="450" y2="${yy}" stroke="#EEF0F4"/><text x="32" y="${yy + 3}" font-size="9" fill="#9AA1AD" text-anchor="end">${v}</text>`; }
  const bx = aiPts[aiPts.length - 1][0], bw = humPts[0][0] - bx;
  const band = `<rect x="${bx}" y="20" width="${bw}" height="140" fill="rgba(224,168,0,.10)"/><line x1="${bx}" y1="20" x2="${bx}" y2="160" stroke="#E0A800" stroke-dasharray="3 3"/>`;
  const xl = `<text x="125" y="178" font-size="10" fill="#9AA1AD" text-anchor="middle">AI leg</text>
    <text x="${bx + bw / 2}" y="178" font-size="9" fill="#8A6500" text-anchor="middle">wait</text>
    <text x="360" y="178" font-size="10" fill="#9AA1AD" text-anchor="middle">human leg</text>`;
  $('cSeam').innerHTML = svg('0 0 480 188',
    grid + band + area(aiPts, 'rgba(45,127,249,.10)') + area(humPts, 'rgba(16,185,129,.10)') +
    line(aiPts, '#2D7FF9') + line(deadPts, '#E0A800', true) + line(humPts, '#10B981') + dots(aiPts, '#2D7FF9') + dots(humPts, '#10B981') + xl);
}

function initRadar(rd) {
  if (radarDone) return; radarDone = true;
  const labels = rd.labels, A = rd.top, B = rd.team, cx = 180, cy = 148, R = 100, n = labels.length;
  const pt = (i, v) => { const a = (-90 + i * 360 / n) * Math.PI / 180, r = v / 10 * R; return [(cx + r * Math.cos(a)).toFixed(1), (cy + r * Math.sin(a)).toFixed(1)]; };
  let grid = '';[2, 4, 6, 8, 10].forEach((g) => { grid += `<polygon points="${labels.map((_, i) => pt(i, g).join(',')).join(' ')}" fill="none" stroke="#EEF0F4"/>`; });
  let axes = '', labs = '';
  labels.forEach((lb, i) => { const [x, yy] = pt(i, 10); axes += `<line x1="${cx}" y1="${cy}" x2="${x}" y2="${yy}" stroke="#EEF0F4"/>`; const [lx, ly] = pt(i, 12.2); labs += `<text x="${lx}" y="${+ly + 3}" font-size="10.5" fill="#6B7280" text-anchor="middle">${lb}</text>`; });
  const poly = (d, col, fill, dash) => `<polygon points="${d.map((v, i) => pt(i, v).join(',')).join(' ')}" fill="${fill}" stroke="${col}" stroke-width="2.5" ${dash ? 'stroke-dasharray="5 4"' : ''}/>`;
  const dots = (d, col) => d.map((v, i) => { const [x, y] = pt(i, v); return `<circle cx="${x}" cy="${y}" r="2.6" fill="${col}"/>`; }).join('');
  const legend = `<circle cx="92" cy="288" r="5" fill="#10B981"/><text x="102" y="291" font-size="10.5" fill="#6B7280">Top recoverers</text><circle cx="202" cy="288" r="5" fill="#94A3B8"/><text x="212" y="291" font-size="10.5" fill="#6B7280">Team average · the gap to close</text>`;
  $('cRadar').innerHTML = svg('0 0 360 300', grid + axes + labs + poly(B, '#94A3B8', 'rgba(148,163,184,.06)', true) + poly(A, '#10B981', 'rgba(16,185,129,.24)') + dots(A, '#10B981') + legend);
}

// ---- navigation ----
function tab(id) {
  document.querySelectorAll('.screen').forEach((s) => s.classList.remove('active'));
  document.querySelectorAll('.tab').forEach((t) => t.classList.toggle('active', t.dataset.tab === id));
  $(id).classList.add('active');
  if (id === 'quality') renderQuality();
  if (id === 'playbook') { pbFlow = null; renderPlaybook(); }
  curTab = id; updateDemo(id); stepIdx = STEPS.indexOf(id);
}
function openModal() { renderModal(); $('ov').classList.add('show'); updateDemo('modal'); stepIdx = 2; }
function closeModal() { $('ov').classList.remove('show'); updateDemo(curTab); stepIdx = STEPS.indexOf(curTab); }
function stepNav(d) {
  const i = Math.max(0, Math.min(STEPS.length - 1, stepIdx + d)), s = STEPS[i];
  if (s === 'modal') { if (curTab !== 'quality') tab('quality'); openModal(); }
  else { $('ov').classList.remove('show'); tab(s); }
  stepIdx = i;
}

// ---- publish guidance to Agent Assist (modeled on NICE's Draft → Test → Publish) ----
function openPublish(flowId) {
  const f = DATA.playbook.flows.find((x) => x.id === flowId), g = f.guidance;
  const ta = document.getElementById('tplEdit');
  const cur = (ta && ta.value) || g.template;
  const r = pvCompute(f, cur);
  $('pubBody').innerHTML = `
    <div class="pub-h">Publish guidance to Agent Assist<span class="x" onclick="closePub()">×</span></div>
    <div class="pub-b">
      <div class="pp"><div class="pt">${f.name}</div><div class="q">${tokenize(cur)}</div></div>
      <div class="pub-lbl">How it goes live</div>
      <div class="pub-row"><span>Surface</span><b>${g.surface}</b></div>
      <div class="pub-row"><span>Authored in</span><b>${g.authoredIn}</b></div>
      <div class="pub-row"><span>Surfaces on</span><b>${g.surfaceOn}</b></div>
      <div class="pub-row"><span>Personalization</span><b>tokens pull live booking / CRM / ground-services data at runtime</b></div>
      <div class="pub-row"><span>Tested on</span><b>${g.previewCases.length} real cases · ${r.resolved} resolved</b></div>
      <div class="pub-note">Authored like a NICE GenAI Prompt Editor custom prompt (Draft → Test → Publish). The runtime contact-data tokens + the backtest above are the net-new bits. Agents keep control — it's a suggested response, not automation.</div>
      <button class="btn" onclick="publishDone()">Publish to Agent Assist</button>
    </div>`;
  $('pub').classList.add('show');
}
function publishDone() {
  assistPublished = true; // close the loop: guidance is now live in Agent Assist
  $('pubBody').innerHTML = `
    <div class="pub-h">Published<span class="x" onclick="closePub()">×</span></div>
    <div class="pub-b" style="text-align:center;padding:28px 24px;">
      <div style="font-size:42px;line-height:1;">✅</div>
      <h3 style="margin:12px 0 6px;font-size:17px;">Live in Agent Assist</h3>
      <p style="color:var(--muted);font-size:13.5px;line-height:1.6;max-width:400px;margin:0 auto 18px;">Published as a Copilot for Agents suggested response. The next agent on a matching contact sees it in their Assist panel — auto-personalised to that customer through the tokens.</p>
      <button class="btn ghost" style="max-width:300px;margin:0 auto;" onclick="closePub();tab('quality');setTimeout(openModal,150);">See it in the agent's Assist panel →</button>
    </div>`;
}
function closePub() { $('pub').classList.remove('show'); }

// ---- demo script ----
const SCRIPT = {
  overview: { t: 'Scene 1 · Set the frame', c: [
    "<b>Hook:</b> \"Agentic Analytics watches the AI agent until it says 'connecting you to a specialist' — then goes dark.\"",
    "<b>Banner:</b> 64% of escalations are <b>rightful</b> — a bot shouldn't handle them. Reframe: not every escalation is a bot failure.",
    "<b>Escalation Quality donut:</b> avoidable → Automation Opportunities (handled); rightful → measured here.",
    "<b>Sentiment Through the Handoff:</b> bot drops → transfer wait → human recovers. Each leg is measured alone; the recovery <i>through</i> the handoff isn't."],
    n: "👉 Next: click the <b>Recovery Quality</b> tab" },
  quality: { t: 'Scene 2 · The punchline', c: [
    "<b>Radar = the money slide:</b> the same evaluation NICE runs on the bot, pointed at the <b>human leg</b>. Top recoverers (purple) vs team (gray).",
    "<b>Recovery by type:</b> retention saves 88%, out-of-policy approvals 62% — same difficulty, the gap is human handling.",
    "Click a <b>session row</b> → open the stitched journey."],
    n: "👉 Next: click a session row to open the stitched journey" },
  modal: { t: 'Scene 3 · The gap', c: [
    "<b>Left = the conversation</b> — the familiar transcript. The AI <i>correctly</i> escalated (rightful — medical-equipment exception). Then Tom rebooked but never addressed the equipment → Alex re-escalated.",
    "<b>Right = Recovery Analysis (new in this workspace).</b> QM already scores Tom's agent skills — what's <b>not</b> measured anywhere is the <b>recovery across this handoff</b>, bot→human stitched as one outcome.",
    "It flags the <b>gap</b>: the best-recoverer move that would've saved this isn't in Agent Assist yet."],
    n: "👉 Next: close (×) → <b>Recovery Playbook</b> tab to fix the whole flow" },
  playbook: { t: 'Scene 4 · Fix the flow & close the loop', c: [
    "<b>Recovery Playbook = the fix workspace.</b> A worst-first list of the escalation flows losing the most customers after handoff.",
    "Open <b>Special-handling exception</b> → <b>① who recovers it best</b> → <b>② what they actually say</b> (Sarah/Marcus/Priya) → the common move.",
    "<b>③ AI-suggested guidance</b> — the AI did the hard part: a <b>tokenized</b> line that already <b>works across every real case</b> and follows best practices (the previews all resolve ✓).",
    "<b>The human sauce (the wow):</b> the draft is a touch robotic — change <b>“actioned”</b> to <b>“personally arranged,”</b> hit <b>▶ Test</b> (tokens still resolve), then <b>Publish to Agent Assist</b>.",
    "<b>See it in the Assist panel</b> → Alex's gap is filled with the warm, human-polished line, auto-personalised per customer. <b>Loop closed.</b>",
    "<b>Close:</b> the AI does the hard work at scale — tokens + best-practice structure; the <b>human adds the warmth</b> that makes it land. Now every agent gets both. Measure recovery → find the best → publish the human-polished play → recovery rises."],
    n: "👉 Soften <b>“actioned” → “personally arranged”</b> → ▶ Test → Publish → See it in the Assist panel" },
};
function updateDemo(s) { const d = SCRIPT[s]; if (!d) return; $('db-title').textContent = '🎬 ' + d.t; $('db-cues').innerHTML = d.c.map((x) => `<li>${x}</li>`).join(''); $('db-next').innerHTML = d.n || ''; }
function toggleDemo() { $('demobar').classList.toggle('show'); }

boot();
