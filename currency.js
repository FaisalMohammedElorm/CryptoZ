(function(){
let exchangeRates = {};
let cryptoRates = {};
let lastUpdate = null;

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

function setLoading(isLoading) {
  if (isLoading) {
    resultInput.value = 'Loading...';
    rateDate.value = 'Fetching rates...';
  }
}

function setError(message) {
  resultInput.value = 'Error: ' + message;
  rateDate.value = 'Unable to fetch rates';
}

async function fetchExchangeRates() {
  try {
    const response = await fetch('https://api.exchangerate-api.com/v4/latest/USD');
    const data = await response.json();
    return {
      USD: 1,
      EUR: 1 / data.rates.EUR,
      ...data.rates
    };
  } catch (error) {
    console.error('Failed to fetch exchange rates:', error);
    return {
      USD: 1,
      EUR: 0.93 // fallback rate
    };
  }
}

async function fetchCryptoRates() {
  try {
    const response = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum&vs_currencies=usd');
    const data = await response.json();
    return {
      BTC: data.bitcoin?.usd || 50000,
      ETH: data.ethereum?.usd || 3500
    };
  } catch (error) {
    console.error('Failed to fetch crypto rates:', error);
    return {
      BTC: 50000, // fallback rates
      ETH: 3500
    };
  }
}

async function updateRates() {
  try {
    setLoading(true);
    const [fiatRates, cryptoPrices] = await Promise.all([
      fetchExchangeRates(),
      fetchCryptoRates()
    ]);
    
    exchangeRates = { ...fiatRates };
    cryptoRates = { ...cryptoPrices };
    lastUpdate = new Date();
    
    convert(); // Trigger conversion with new rates
  } catch (error) {
    console.error('Failed to update rates:', error);
    setError('Unable to fetch current rates');
  }
}

function getRate(currency) {
  if (currency === 'USD') return 1;
  if (exchangeRates[currency]) return exchangeRates[currency];
  if (cryptoRates[currency]) return cryptoRates[currency];
  return 1;
}

function convert(){
  if (!lastUpdate) {
    setLoading(true);
    return;
  }

  const amount = parseFloat(amountInput.value) || 0;
  const from = fromSel.value;
  const to = toSel.value;
  
  try {
    let result;
    
    if (from === to) {
      result = amount;
    } else {
      // Convert everything through USD as base
      let usdAmount;
      
      if (from === 'USD') {
        usdAmount = amount;
      } else if (exchangeRates[from]) {
        usdAmount = amount / exchangeRates[from];
      } else if (cryptoRates[from]) {
        usdAmount = amount * cryptoRates[from];
      } else {
        throw new Error('Unsupported currency: ' + from);
      }
      
      // Convert from USD to target currency
      if (to === 'USD') {
        result = usdAmount;
      } else if (exchangeRates[to]) {
        result = usdAmount * exchangeRates[to];
      } else if (cryptoRates[to]) {
        result = usdAmount / cryptoRates[to];
      } else {
        throw new Error('Unsupported currency: ' + to);
      }
    }
    
    resultInput.value = formatNumber(result) + ' ' + to;
    rateDate.value = 'Updated: ' + lastUpdate.toLocaleString();
    
  } catch (error) {
    setError(error.message);
  }
}

function scheduleRateUpdate() {
  // Update rates every 5 minutes
  setInterval(updateRates, 5 * 60 * 1000);
}

amountInput.addEventListener('input', convert);
fromSel.addEventListener('change', convert);
toSel.addEventListener('change', convert);

document.addEventListener('DOMContentLoaded', async function() {
  await updateRates();
  scheduleRateUpdate();
});

})();
