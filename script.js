function showTab(id) {
    document.querySelectorAll(".tab-content").forEach(t => t.classList.remove("active"));
    document.querySelectorAll(".tab-btn").forEach(b => b.classList.remove("active"));
    document.getElementById(id).classList.add("active");
    event.currentTarget.classList.add("active");
}

function checkStrict(str) {
    return /[()_.,]/.test(str);
}

// UPDATE: Check double quotes
function convertToSQL() {
    let raw = getList("convertInput");
    let formatted = raw.map(rn => {
        // Jika sudah ada quotes, jangan tambah lagi
        if (rn.startsWith("'") && rn.endsWith("'")) return rn;
        return `'${rn}'`;
    }).join(",\n");
    
    document.getElementById("convertOutput").value = formatted;
    document.getElementById("totalInput").innerText = raw.length;
    document.getElementById("convertOutput").select();
}

// UPDATE: Simbol _, (), dikekalkan
function convertToBase() {
    let raw = document.getElementById("convertInput").value;
    // Hanya buang petikan ' dan " sahaja
    let cleaned = raw.split(/[\n,]+/).map(x => x.replace(/['"]/g, "").trim()).filter(x => x);
    document.getElementById("convertOutput").value = cleaned.join("\n");
}

function compareRN() {
    let master = getList("rnNumber");
    let pd101 = getList("pd101");
    let pd301 = getList("pd301");
    let jsonLines = getList("jsonFile");

    let jsonMap = {};
    let jsonRNs = [];
    jsonLines.forEach(line => {
        let parts = line.split(/[|\t]+/);
        let v1 = parts[0]?.trim(), v2 = parts[1]?.trim() || "";
        if(v1) {
            let rn = v1.toUpperCase().includes("RN") ? v1 : (v2.toUpperCase().includes("RN") ? v2 : v1);
            jsonMap[rn] = v1 === rn ? v2 : v1;
            jsonRNs.push(rn);
        }
    });

    if (master.length === 0) {
        master = [...new Set([...pd101, ...pd301, ...jsonRNs])].sort();
    }

    let body = document.getElementById("resultTable");
    body.innerHTML = "";
    let m1 = 0, m3 = 0, mJ = 0;

    master.forEach((rn, i) => {
        let in1 = pd101.includes(rn);
        let in3 = pd301.includes(rn);
        let inJ = jsonMap.hasOwnProperty(rn);
        let isStrict = checkStrict(rn);

        if(in1) m1++; if(in3) m3++; if(inJ) mJ++;

        let row = `<tr class="${isStrict ? 'row-sensitive' : ''}">
            <td>${i+1}</td>
            <td class="rn-cell">${rn}</td>
            <td>${in1 ? "✔️" : "❌"}</td>
            <td>${in3 ? "✔️" : "❌"}</td>
            <td>${inJ ? "✔️ (" + (jsonMap[rn] || "Found") + ")" : "❌"}</td>
        </tr>`;
        body.insertAdjacentHTML('beforeend', row);
    });

    updateDashboard(master.length, m1, m3, mJ);
}

function updateDashboard(total, m1, m3, mJ) {
    document.getElementById("dashTotal").innerText = total;
    document.getElementById("dash101").innerText = m1;
    document.getElementById("dash301").innerText = m3;
    document.getElementById("dashJson").innerText = mJ;

    let perc = total > 0 ? Math.round(((m1 + m3 + mJ) / (total * 3)) * 100) : 0;
    let pb = document.getElementById("progressBar");
    pb.style.width = perc + "%";
    pb.innerText = perc + "%";
}

function downloadPDF() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    const rows = [];
    document.querySelectorAll("#resultTable tr").forEach(tr => {
        const row = [];
        tr.querySelectorAll("td").forEach(td => {
            let val = td.innerText.trim();
            if(val.includes("✔️")) val = "YES";
            else if(val.includes("❌")) val = "NO";
            row.push(val);
        });
        rows.push(row);
    });
    doc.autoTable({ head: [['No', 'RN', '101', '301', 'JSON']], body: rows });
    doc.save("RN_Report.pdf");
}

function downloadCSV() {
    let rows = [["No", "RN", "PD101", "PD301", "JSON"]];
    document.querySelectorAll("#resultTable tr").forEach(tr => {
        let r = [];
        tr.querySelectorAll("td").forEach(td => r.push(td.innerText.replace(/✔️/g, "YES").replace(/❌/g, "NO")));
        rows.push(r);
    });
    let csvContent = "data:text/csv;charset=utf-8," + rows.map(e => e.join(",")).join("\n");
    let link = document.createElement("a");
    link.setAttribute("href", encodeURI(csvContent));
    link.setAttribute("download", "Comparison.csv");
    link.click();
}

function getList(id) {
    let el = document.getElementById(id);
    return el ? el.value.split("\n").map(x => x.trim()).filter(x => x) : [];
}

function clearConvert() {
    document.getElementById("convertInput").value = "";
    document.getElementById("convertOutput").value = "";
}

function clearCompare() {
    ["rnNumber", "pd101", "pd301", "jsonFile"].forEach(id => document.getElementById(id).value = "");
    document.getElementById("resultTable").innerHTML = "";
}

function copyOutput() {
    let out = document.getElementById("convertOutput");
    out.select();
    document.execCommand("copy");
}
