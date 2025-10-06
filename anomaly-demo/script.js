// --- helpers ---
function rollingStats(arr, w) {
  const mean = new Array(arr.length).fill(NaN);
  const std  = new Array(arr.length).fill(NaN);
  let sum = 0, sum2 = 0, q = [];
  for (let i = 0; i < arr.length; i++) {
    q.push(arr[i]); sum += arr[i]; sum2 += arr[i]*arr[i];
    if (q.length > w) { const x = q.shift(); sum -= x; sum2 -= x*x; }
    const n = q.length;
    mean[i] = sum / n;
    const v = Math.max(0, (sum2 / n) - mean[i]*mean[i]);
    std[i]  = Math.sqrt(v);
  }
  return {mean, std};
}
function iqrBounds(arr, w, k) {
  const L = new Array(arr.length).fill(NaN);
  const U = new Array(arr.length).fill(NaN);
  const q = [];
  for (let i = 0; i < arr.length; i++) {
    q.push(arr[i]);
    if (q.length > w) q.shift();
    const s = [...q].sort((a,b)=>a-b);
    const q1 = s[Math.floor((s.length-1)*0.25)];
    const q3 = s[Math.floor((s.length-1)*0.75)];
    const iqr = q3 - q1;
    L[i] = q1 - k*iqr;
    U[i] = q3 + k*iqr;
  }
  return {L,U};
}
function toCSV(rows) {
  const header = "t,value,is_anomaly,score\n";
  return header + rows.map(r => [r.t, r.value, r.is_anom ? 1 : 0, r.score.toFixed(4)].join(",")).join("\n");
}

// --- synthetic data ---
function generate(n=600) {
  const data = [];
  for (let t=0; t<n; t++) {
    const trend = 0.002*t;
    const season = 1.8*Math.sin(2*Math.PI*t/50);
    const noise = (Math.random()*2-1)*0.35;
    let v = 10 + trend + season + noise;
    if (t>=350 && t<370) v += 4.5;      // collective anomaly
    if ([120, 255, 512].includes(t)) v -= 6.0; // point anomalies
    data.push({t, value: v});
  }
  return data;
}

// --- detection ---
function detect(data, w=30, zth=3.0, iqrk=1.5) {
  const values = data.map(d=>d.value);
  const {mean, std} = rollingStats(values, w);
  const {L,U} = iqrBounds(values, w, iqrk);

  const out = data.map((d,i)=>{
    const z = std[i] > 1e-12 ? Math.abs((d.value - mean[i]) / std[i]) : 0;
    const iqrFlag = (d.value < L[i]) || (d.value > U[i]);
    const zFlag = z > zth;
    const is_anom = zFlag || iqrFlag;
    const score = Math.max(z / zth, iqrFlag ? 1 : 0);
    return {...d, z, L:L[i], U:U[i], mean:mean[i], score, is_anom};
  });
  return out;
}

// --- charts ---
let chart, chartScore;
function plot(rows) {
  const labels = rows.map(r=>r.t);
  const v = rows.map(r=>r.value);
  const mu = rows.map(r=>r.mean);
  const L = rows.map(r=>r.L);
  const U = rows.map(r=>r.U);
  const marks = rows.map(r=> r.is_anom ? r.value : null);
  const scores = rows.map(r=>r.score);

  if (chart) chart.destroy();
  if (chartScore) chartScore.destroy();

  const ctx = document.getElementById("chart").getContext("2d");
  chart = new Chart(ctx, {
    type: "line",
    data: {
      labels,
      datasets: [
        { label:"value", data:v, pointRadius:0, borderWidth:1 },
        { label:"mean",  data:mu, pointRadius:0, borderWidth:1 },
        { label:"IQR-L", data:L, pointRadius:0, borderWidth:1, borderDash:[4,4]},
        { label:"IQR-U", data:U, pointRadius:0, borderWidth:1, borderDash:[4,4]},
        { label:"anomaly", data:marks, pointRadius:4, borderWidth:0, showLine:false }
      ]
    },
    options: {
      animation:false,
      responsive:true,
      plugins:{ legend:{position:"top"} },
      scales:{ x:{ display:false } }
    }
  });

  const ctx2 = document.getElementById("chartScore").getContext("2d");
  chartScore = new Chart(ctx2, {
    type:"line",
    data:{ labels, datasets:[{label:"score", data:scores, pointRadius:0, borderWidth:1}]},
    options:{ animation:false, responsive:true, scales:{ x:{display:false} } }
  });
}

// --- UI wiring ---
let state = { data: generate() };
plot(state.data);

document.getElementById("btn-generate").onclick = () => {
  state.data = generate();
  plot(state.data);
};

document.getElementById("btn-detect").onclick = () => {
  const w   = parseInt(document.getElementById("win").value,10);
  const zth = parseFloat(document.getElementById("zth").value);
  const iqrk= parseFloat(document.getElementById("iqrk").value);
  const rows = detect(state.data, w, zth, iqrk);
  state.rows = rows;
  plot(rows);
};

document.getElementById("btn-download").onclick = () => {
  const rows = state.rows ?? detect(state.data);
  const csv = toCSV(rows);
  const blob = new Blob([csv], {type:"text/csv;charset=utf-8"});
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "anomaly_results.csv";
  a.click();
  URL.revokeObjectURL(a.href);
};

document.getElementById("file").onchange = async (e) => {
  const f = e.target.files[0];
  if (!f) return;
  const text = await f.text();
  const lines = text.trim().split(/\r?\n/);
  const rows = [];
  for (let i=0;i<lines.length;i++){
    const parts = lines[i].split(",");
    if (i===0 && isNaN(parseFloat(parts[1]))) continue; // header skip
    const t = i; // timestamp kullanılmıyorsa indeksle
    const v = parseFloat(parts[1] ?? parts[0]);
    if (Number.isFinite(v)) rows.push({t, value:v});
  }
  state.data = rows;
  plot(rows);
};
