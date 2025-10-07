// Config por índice. FlipX1–5: 1 USD por tick con 1 lote
const INDEX_CONFIG = {
  FlipX1: { tickValuePerLot: 1 },
  FlipX2: { tickValuePerLot: 1 },
  FlipX3: { tickValuePerLot: 1 },
  FlipX4: { tickValuePerLot: 1 },
  FlipX5: { tickValuePerLot: 1 },
};

// Helpers e inputs
const $ = (id) => document.getElementById(id);
const els = {
  indice: $("indice"),
  balance: $("balance"),
  riesgo: $("riesgo"),
  sl: $("sl"),
  riesgoUsd: $("riesgoUsd"),
  lotaje: $("lotaje"),
  calc: $("calc"),
};

// Riesgo en USD sin decimales, separador de miles con punto + sufijo " USD$"
function fmtUSD(n){
  const v = Math.round(Number(n || 0));
  const num = v.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.'); // 1000 -> 1.000
  return `${num} USD$`;
}

// Lote con 2 decimales
function fmtLot(n){
  if (!isFinite(n)) return '0.00';
  return Number(n.toFixed(2)).toString();
}

// Cálculo principal
function calcular(){
  const ind = els.indice.value;
  const tickValue = INDEX_CONFIG[ind].tickValuePerLot; // USD/tick con 1 lote

  const balance = parseFloat(els.balance.value) || 0;
  const riskPct  = parseFloat(els.riesgo.value)  || 0;
  const slTicks  = parseFloat(els.sl.value)      || 0;

  const riesgoUSD = balance * (riskPct/100);
  const rawLot = (slTicks > 0) ? (riesgoUSD / (slTicks * tickValue)) : 0;

  // Actualiza riesgo (formato 1.000 USD$)
  els.riesgoUsd.textContent = fmtUSD(riesgoUSD);

  // Si el lote teórico es < 0.01, mostrar 0.00 y marcar “Capital insuficiente”
  const displayLot = (rawLot > 0 && rawLot < 0.01) ? 0 : rawLot;
  els.lotaje.textContent = fmtLot(displayLot);

  const noteEl = document.getElementById('lotNote');
  if (rawLot > 0 && rawLot < 0.01) {
    noteEl.textContent = 'Capital insuficiente';
    noteEl.classList.add('error');
  } else {
    noteEl.textContent = 'lotaje recomendado con ese SL';
    noteEl.classList.remove('error');
  }
}

// Engancha el botón CALCULAR cuando el DOM esté listo
function attachCalc(){
  const btn = document.getElementById('calc');
  if (!btn) return;
  btn.type = 'button';
  btn.addEventListener('click', function(){
    try {
      calcular();
      const qt = document.getElementById('qtBrand');
      if (qt && !qt.classList.contains('show')) qt.classList.add('show');
    } catch (e) {
      console.error('Error en cálculo', e);
    }
  });
}

// --- AUTO-LIMPIEZA DE CAMPOS CON "0" ---
function attachAutoClear(){
  const fields = [els.balance, els.riesgo, els.sl];

  fields.forEach((f) => {
    if (!f) return;

    // Al enfocar: si vale "0" (o "0.00"), limpiar y seleccionar
    f.addEventListener('focus', () => {
      if (f.value === '0' || f.value === '0.00') f.value = '';
      // Selecciona el contenido si hubiera algo
      setTimeout(() => { try { f.select(); } catch(_){} }, 0);
    });

    // Al salir: si quedó vacío, reponer "0"
    f.addEventListener('blur', () => {
      if (String(f.value).trim() === '') f.value = '0';
    });
  });
}

// --- INICIALIZACIÓN ---
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    attachCalc();
    attachAutoClear();
  });
} else {
  attachCalc();
  attachAutoClear();
}

