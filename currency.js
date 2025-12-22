(function(){
const baseRatesUSD = {
  USD: 1,
  EUR: 1.075, // 1 EUR = 1.075 USD (sample rate)
  BTC: 50000, // 1 BTC = 50,000 USD (sample rate)
  ETH: 3500   // 1 ETH = 3,500 USD (sample rate)
};

function $(id){ return document.getElementById(id); }

const amountInput = $("amountInput");
const fromSel = $("fromCurrency");
const toSel = $("toCurrency");
const resultInput = $("result");
const rateDate = $("rateDate");

function formatNumber(n){
  if (!isFinite(n)) return '—';
  if (Math.abs(n) >= 1) return n.toLocaleString(undefined, {maximumFractionDigits:5});
  return n.toPrecision(6);
}

function convert(){
  const amount = parseFloat(amountInput.value) || 0;
  const from = fromSel.value;
  const to = toSel.value;
  const usd = amount * (baseRatesUSD[from] || 1);
  const converted = usd / (baseRatesUSD[to] || 1);
  resultInput.value = formatNumber(converted) + ' ' + to;
  rateDate.value = new Date().toLocaleString();
}

amountInput.addEventListener('input', convert);
fromSel.addEventListener('change', convert);
toSel.addEventListener('change', convert);

document.addEventListener('DOMContentLoaded', convert);
})();
