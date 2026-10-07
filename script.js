const pieces = [
    "942517", "605676", "498291", "668826", "357057",
    "478151", "315629", "007148", "252887", "421662",
    "284505", "467650", "115330", "648206", "207562",
    "612298", "576885", "294200", "847595", "021597",
    "074878", "801997", "585401", "168510", "385293",
    "151863", "022142", "340350", "976151", "337989",
    "863284", "488310", "303887", "939173", "331413",
    "905657", "833617", "170794", "094486", "551394",
    "943693", "147970", "400196", "537505", "367493",
    "117178", "675840", "868721", "519081", "735564",
    "401733", "915348", "169233", "324651", "958675",
    "368753", "861460", "401341", "343222", "794373",
    "816374", "535119", "188234", "577779", "097792",
    "729303", "782637", "148159", "830641", "716890",
    "397853", "871196", "277603", "749226", "839595",
    "131852", "409432", "810698", "456030", "529185",
    "758823", "265024", "051041", "699031", "737269",
    "139340", "730977", "249786", "039931", "055669",
    "100107", "653178", "279773", "336550", "332847",
    "685485", "423269", "193536", "890062", "377637",
    "595777", "412134", "322736", "546929", "616370",
    "767332", "781184", "920944", "851005", "258850",
    "064083", "051202", "427711", "359855", "540928",
    "314284", "085261", "880969", "649699", "064881",
    "705423", "646927", "252556", "272007", "217511",
    "620286", "229724", "108865", "124636", "231417",
    "961201", "658432", "775416", "246027", "854036",
    "687762", "389097", "013153", "417085", "919198",
    "988711", "488665"
];

function run() {
    const n = pieces.length;
    const from = [];
    const to = [];
    for (let i = 0; i < n; i++) {
        from.push(Number(pieces[i].slice(0, 2)));
        to.push(Number(pieces[i].slice(4, 6)));
    }

    const out = new Map();
    for (let v = 0; v < 100; v++) out.set(v, []);
    for (let i = 0; i < n; i++) out.get(from[i]).push(i);

    const reach = new Map();
    for (let v = 0; v < 100; v++) {
        const seen = new Set();
        const stack = [v];
        while (stack.length > 0) {
            const u = stack.pop();
            for (const e of out.get(u)) {
                if (!seen.has(to[e])) { seen.add(to[e]); stack.push(to[e]); }
            }
        }
        reach.set(v, seen);
    }
    const onCycle = new Set();
    for (let v = 0; v < 100; v++) if (reach.get(v).has(v)) onCycle.add(v);

    const isTail = [];
    for (let v = 0; v < 100; v++) {
        let touchesCycle = onCycle.has(v);
        for (const w of reach.get(v)) if (onCycle.has(w)) touchesCycle = true;
        isTail.push(!touchesCycle);
    }

    const fromCycle = [];
    for (let v = 0; v < 100; v++) {
        let ok = onCycle.has(v);
        for (const c of onCycle) if (reach.get(c).has(v)) ok = true;
        fromCycle.push(ok);
    }

    const tailLen = new Map();
    const tailNext = new Map();
    function tail(v) {
        if (tailLen.has(v)) return tailLen.get(v);
        let bestLen = 0, bestEdge = -1;
        for (const e of out.get(v)) {
            const len = 1 + tail(to[e]);
            if (len > bestLen) { bestLen = len; bestEdge = e; }
        }
        tailLen.set(v, bestLen);
        tailNext.set(v, bestEdge);
        return bestLen;
    }
    function tailPath(v) {
        const path = [];
        tail(v);
        while (tailNext.get(v) !== -1) {
            const e = tailNext.get(v);
            path.push(e);
            v = to[e];
            tail(v);
        }
        return path;
    }

    const outArr = [];
    for (let v = 0; v < 100; v++) outArr.push(out.get(v));
    const used = [];
    for (let i = 0; i < n; i++) used.push(false);

    let best = [];
    const current = [];

    function dfs(v) {
        if (isTail[v]) {
            if (current.length + tail(v) > best.length) best = current.concat(tailPath(v));
            return;
        }
        if (current.length > best.length) best = current.slice();
        const edges = outArr[v];
        for (let k = 0; k < edges.length; k++) {
            const e = edges[k];
            if (used[e]) continue;
            used[e] = true;
            current.push(e);
            dfs(to[e]);
            current.pop();
            used[e] = false;
        }
    }

    const startBest = new Map();
    function bestFrom(v) {
        if (startBest.has(v)) return startBest.get(v);
        let path = [];
        if (isTail[v]) {
            path = tailPath(v);
        } else if (!fromCycle[v]) {
            for (const e of out.get(v)) {
                const p = [e].concat(bestFrom(to[e]));
                if (p.length > path.length) path = p;
            }
        } else {
            best = [];
            current.length = 0;
            dfs(v);
            path = best;
        }
        startBest.set(v, path);
        return path;
    }

    let answer = [];
    for (let v = 0; v < 100; v++) {
        const p = bestFrom(v);
        if (p.length > answer.length) answer = p;
    }
    best = answer;

    const result = best.map(i => pieces[i]);
    let text = result[0];
    for (let i = 1; i < result.length; i++) text += result[i].slice(2);

    document.getElementById("count").textContent = result.length;
    document.getElementById("list").textContent = result.join(", ");
    document.getElementById("text").textContent = text;
}

document.getElementById("start").addEventListener("click", function () {
    document.getElementById("status").textContent = "Рахую...";
    setTimeout(function () {
        run();
        document.getElementById("status").textContent = "Готово";
    }, 50);
});
