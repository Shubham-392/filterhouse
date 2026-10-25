// create for each parameter a valid function
// BloomFilter data structure formulas for calculation
// n = ceil(m / (-k / log(1 - exp(log(p) / k))))
// p = pow(1 - exp(-k / (m / n)), k)
// m = ceil((n * log(p)) / log(1 / pow(2, log(2))));
// k = round((m / n) * log(2));

const filterResultElem = document.getElementById("filter-result");


function isNValid(n) {
  return !isNaN(n) && Number.isInteger(n) && n > 0;
}

function isPValid(p) {
  return !isNaN(p) && p > 0 && p < 1;
}

function isMValid(m) {
  return !isNaN(m) && Number.isInteger(m) && m > 0;
}

function isKValid(k) {
  // validation check is same so use it
  return isMValid(k);
}
function calculateMFromNP(n, p) {
  return Math.ceil((n * Math.log(p)) / Math.log(1 / Math.pow(2, Math.log(2))));
}
function calculateNFromMKP(m, k, p) {
  return Math.ceil(m / (-k / Math.log(1 - Math.exp(Math.log(p) / k))));
}
function calculatePFromKMN(k, m, n) {
  return Math.pow(1 - Math.exp(-k / (m / n)), k);
}
function calculateKFromMN(m, n) {
  return Math.round((m / n) * Math.log(2));
}
function calculateMFromNPK(n, p, k) {
  return Math.ceil((-n * k) / Math.log(1 - Math.exp(Math.log(p) / k)));
}

function calculateNFromMP(m, p) {
  return Math.ceil((m * Math.log(Math.pow(1 / 2, Math.log(2))) / Math.log(p)));
}

function calculateKFromMNP(m, n, p) {
  var opt_k = - Math.round(Math.log2(p));
  // to keep the k value closest to p we have to check the difference of each value from (1,opt_k) to p(given)
  var k_prob_diff = [];
  for (let i = 1; i < opt_k; i++){
     k_prob_diff.push(Math.abs(calculatePFromKMN(i, m, n) - p));
  }

  var k = k_prob_diff.indexOf(Math.min(...k_prob_diff)) + 1; // +1 because the array starts at k = 1, index 0

  // actual p from calculated k
  p = calculatePFromKMN(k, m, n);

  return [k, p]
}

// __km_from_np -> calculateMFromNP then calculateKFromMN
// __kp_from_mn -> calculateKFromMN  then calculatePFromKMN
// __kn_from_mp -> calculateNFromMP then calculateKFromMN
// 

function __km_from_np(n, p) {
  m = calculateMFromNP(n, p);
  k = calculateKFromMN(m, n);
  return [k, m];
}
function __kp_from_mn(m, n) {
  k = calculateKFromMN(m, n);
  p = calculatePFromKMN(k, m, n);
  return [k, p];
}
function __kn_from_mp(m, p) {
  n = calculateNFromMP(m, p);
  k = calculateKFromMN(m, n);
  return [k, n];
}

function getMissing(pStr, mStr, nStr, kStr) {
  var missing = new Array();
  if (kStr == "") missing.push("k");
  if (mStr == "") missing.push("m");
  if (nStr == "") missing.push("n");
  if (pStr == "") missing.push("p");
  return missing;
}

function changeInputType(givenParams, inputs) {
  const typeChangeInputs = {};
  for (const param of givenParams) {
    typeChangeInputs[param] = Number(inputs[param]);
  }

  return typeChangeInputs
}

function showWarning(msg) {
  filterResultElem.innerHTML = '';
  const p = document.createElement("p");
  p.textContent = msg;
  p.style.color = "red";
  filterResultElem.appendChild(p);

  window.scrollBy({
    top: 100,
    left: 0,
    behavior: 'smooth'
  });
}

function showResult(result) {
  for (const [key, value] of Object.entries(result)) {
    const p = document.createElement("p");
    // write result 
    p.textContent = `${key} = ${value}`;
    filterResultElem.appendChild(p);

    window.scrollBy({
        top: 100,      // Number of pixels to scroll vertically (+ is down, - is up)
        left: 0,       // Number of pixels to scroll horizontally
        behavior: 'smooth' // Adds a smooth scrolling animation
      });
  }
}

function calculateBloomFilter(givenParams, missing, inputs) {
  const validChecker = {'k': isKValid, 'n':isNValid, 'm': isMValid, 'p':isPValid}
  
  const givenParamLen = givenParams.length;
  // all inputs are missing
  if ((givenParamLen == 0) || (givenParamLen == 1)) {
    showWarning("Enter some inputs for me to derive");
    return ;
  }
  if (givenParamLen == 4) {
    showWarning("Clear a field for me to derive it");
    return ;
  }

  const cleanTypeInputs = changeInputType(givenParams, inputs)
  console.log(cleanTypeInputs);
  const validCheck = Object.entries(cleanTypeInputs).every(
    ([key, value]) => validChecker[key](value)
  );

  if (!validCheck) {
    showWarning("Invalid input: n, m, k must be positive integers and p must be between 0 and 1");
    return;
  }

  var result = { ...cleanTypeInputs };

  if (givenParamLen == 2) {
    if (givenParams.includes("n") && givenParams.includes("p")) { 
      const [k,m] = __km_from_np(cleanTypeInputs['n'], cleanTypeInputs['p']);
      result.k = k;
      result.m = m;
      return result;
    }// validate n and p from cleanTypeInputs
    if (givenParams.includes("m") && givenParams.includes("n")) { 
      const [k, p] = __kp_from_mn(cleanTypeInputs['m'], cleanTypeInputs['n']);
      result.k = k;
      result.p = p;
      return result;
    }// validate m and n from cleanTypeInputs
    if (givenParams.includes("m") && givenParams.includes("p")) { 
      const [k, n] = __kn_from_mp(cleanTypeInputs['m'], cleanTypeInputs['p']);
      result.k = k;
      result.n = n;
      return result;
    }// validate m and p from cleanTypeInputs
    return 
  }
  
  if (givenParamLen == 3) {
    if (missing[0] == 'k') {
      // validate m,n and p
      // calculate k from mnp
      const [k, p] = calculateKFromMNP(cleanTypeInputs['m'], cleanTypeInputs['n'], cleanTypeInputs['p']);
      result.k = k;
      result.p = p;
    }
    else if (missing[0] == 'm') {
      // validate n and p and k
      // calculate m from np
      const m = calculateMFromNPK(cleanTypeInputs['n'], cleanTypeInputs['p'], cleanTypeInputs['k']);
      result.m = m;
    }
    else if (missing[0] == 'n') {
      // calculate n from mpk
      // validate m,p,k
      const n = calculateNFromMKP(cleanTypeInputs['m'], cleanTypeInputs['k'], cleanTypeInputs['p']);
      result.n = n;
    }
    else {
      const p = calculatePFromKMN(cleanTypeInputs['k'], cleanTypeInputs['m'], cleanTypeInputs['n']);
      // calculate p from mnk
      result.p = p;
    }
  }

  return result;
}

function formListener(e) {
  // Prevent the default browser page reload
  e.preventDefault();
  filterResultElem.innerHTML = '';
  
  const params = new Array('k', 'm', 'n', 'p');
  const f = new FormData(e.target);
  const inputs = { p: f.get('p'), m: f.get('m'), n: f.get('n'), k: f.get('k') };


  
  const missing = getMissing(inputs.p, inputs.m, inputs.n, inputs.k);

  
  const givenParams = new Array();
  for (const param of params){
    if (!missing.includes(param)) {
      givenParams.push(param);
    }
  }

  const result = calculateBloomFilter(givenParams, missing, inputs);
  
  if (result == undefined) {
    if (!filterResultElem.hasChildNodes()) {
          showWarning(`Unable to derive ${missing.join(", ")} from ${givenParams.join(", ")} `);
    }
  }
  else if (result.k < 1 || result.p >= 1) {
    showWarning("Filter is too small: m is too small for n ");
    showResult(result);
  }
  else {
    showResult(result);
  }
}

const formElem = document.getElementById('filter-calc');

formElem.addEventListener('submit', formListener);
