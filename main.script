/* --- TAB NAVIGATION --- */
function showTab(id) {
    document.querySelectorAll(".tab-content").forEach(t => t.classList.remove("active"));
    document.querySelectorAll(".tab-btn").forEach(b => b.classList.remove("active"));
    document.getElementById(id).classList.add("active");
    event.currentTarget.classList.add("active");
}

/* --- CONVERT TOOLS --- */
function convertToSQL() {
    let list = getList("convertInput").map(x => x.replace(/['",()]/g, ""));
    document.getElementById("convertOutput").value = list.map(rn => `'${rn}',`).join("\n");
    document.getElementById("totalInput").innerText = list.length;
}

function convertToBase() {
    let raw = document.getElementById("convertInput").value;
    let cleaned = raw.split(/[\n,]+/).map(x => x.replace(/['"()]/g, "").trim()).filter(x => x !== "");
    document.getElementById("convertOutput").value = cleaned.join("\n");
    document.getElementById("totalInput").innerText = cleaned.length;
}

function copyOutput() {
    let out = document.getElementById("convertOutput");
    if(!out.value) return;
    out.select();
    document.execCommand("copy");
    alert("Copied! ✅");
}

function clearConvert() {
    ["convertInput", "convertOutput"].forEach(id => document.getElementById(id).value = "");
    document.getElementById("totalInput").innerText = "0";
}

/* --- SMART COMPARE LOGIC --- */
function compareRN() {
    let master = getList("rnNumber");
    let pd101 = getList("pd101");
    let pd301 = getList("pd301");
    let jsonLines = getList("jsonFile");

    let jsonMap = {};
    let jsonRNs = [];
    jsonLines.forEach(line => {
        let parts = line.split(/[|\t]+/);
        let v1 = parts[0]?.trim();
        let v2 = parts[1]?.trim() || "";
        if(v1) {
            let rn = v1.toUpperCase().includes("RN") ? v1 : (v2.toUpperCase().includes("RN") ? v2 : v1);
            let file = v1 === rn ? v2 : v1;
            jsonMap[rn] = file || "Found";
            jsonRNs.push(rn);
        }
    });

    if (master.length === 0) {
        let combined = [...pd101, ...pd301, ...jsonRNs];
        master = [...new Set(combined)];
    }

    if (master.length === 0) return alert("Please provide data!");

    const has101 = pd101.length > 0;
    const has301 = pd301.length > 0;
    const hasJ = jsonLines.length > 0;

    let head = document.querySelector("table thead tr");
    head.innerHTML = `<th>No</th><th>RN Number</th>`;
    if(has101) head.innerHTML += `<th>PD101</th>`;
    if(has301) head.innerHTML += `<th>PD301</th>`;
    if(hasJ) head.innerHTML += `<th>Json_filename</th>`;

    let body = document.getElementById("resultTable");
    body.innerHTML = "";
    let m1 = 0, m3 = 0, mJ = 0;

    master.forEach((rn, i) => {
        let in1 = pd101.includes(rn);
        let in3 = pd301.includes(rn);
        let inJ = jsonMap.hasOwnProperty(rn);
        
        if(in1) m1++; if(in3) m3++; if(inJ) mJ++;

        let row = `<tr><td>${i+1}</td><td>${rn}</td>`;
        if(has101) row += `<td>${in1 ? "✔️" : "❌"}</td>`;
        if(has301) row += `<td>${in3 ? "✔️" : "❌"}</td>`;
        if(hasJ) row += `<td>${inJ ? "✔️ ("+jsonMap[rn]+")" : "❌"}</td>`;
        row += `</tr>`;
        body.insertAdjacentHTML('beforeend', row);
    });

    document.getElementById("totalRnNumber").innerText = master.length;
    document.getElementById("totalPd101").innerText = pd101.length;
    document.getElementById("totalPd301").innerText = pd301.length;
    document.getElementById("totalJson").innerText = jsonLines.length;

    updateDash(master.length, m1, m3, mJ, has101, has301, hasJ);
}

function updateDash(total, m1, m3, mJ, has1, has3, hasJ) {
    document.getElementById("dashTotal").innerText = total;
    document.getElementById("dash101").innerText = m1;
    document.getElementById("dash301").innerText = m3;
    document.getElementById("dashJson").innerText = mJ;

    let activeCols = [has1, has3, hasJ].filter(v => v).length;
    let score = (has1 ? m1 : 0) + (has3 ? m3 : 0) + (hasJ ? mJ : 0);
    let perc = total > 0 ? Math.round((score / (total * (activeCols || 1))) * 100) : 0;
    
    let pb = document.getElementById("progressBar");
    pb.style.width = perc + "%";
    pb.innerText = perc + "%";
    document.getElementById("progressText").innerText = `Overall Data Integrity: ${perc}%`;
}

/* --- EXPORT LOGIC (FIXED FOR PDF SYMBOLS) --- */
function getExportData() {
    const data = [];
    const headers = [];
    
    // Ambil header yang sedang aktif
    document.querySelectorAll("table thead th").forEach(th => headers.push(th.innerText));

    document.querySelectorAll("#resultTable tr").forEach(tr => {
        const row = [];
        tr.querySelectorAll("td").forEach((td, i) => {
            let val = td.innerText;
            
            // Tukar simbol kepada teks sebelum masuk PDF
            if (val.includes("✔️")) {
                let match = val.match(/\(([^)]+)\)/); // Ambil nama file jika ada
                val = match ? match[1] : "Yes";
            } else if (val.includes("❌")) {
                val = "No";
            }
            
            row.push(val);
        });
        data.push(row);
    });
    return { headers, data };
}

function downloadPDF() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    const { headers, data } = getExportData();
    
    if (data.length === 0) return alert("Sila buat Compare dahulu!");

    // Rekaan Laporan PDF
    doc.setFontSize(18);
    doc.setTextColor(75, 29, 142); 
    doc.text("RN Management Analysis Report", 14, 20);
    
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 28);

    doc.autoTable({
        head: [headers],
        body: data,
        startY: 35,
        theme: 'striped',
        headStyles: { fillColor: [75, 29, 142] },
        styles: { fontSize: 8, font: "helvetica" }, // Gunakan font standard untuk elak huruf pelik
        columnStyles: {
            0: { cellWidth: 10 },
            1: { cellWidth: 40 }
        }
    });

    doc.save("RN_Professional_Report.pdf");
}

function downloadCSV() {
    const { headers, data } = getExportData();
    if(!data.length) return;
    let csv = "data:text/csv;charset=utf-8," + headers.join(",") + "\n" + data.map(r => r.join(",")).join("\n");
    let link = document.createElement("a");
    link.href = encodeURI(csv);
    link.download = "RN_Comparison.csv";
    link.click();
}

/* --- HELPERS --- */
function getList(id) {
    let el = document.getElementById(id);
    return el ? el.value.split("\n").map(x => x.trim()).filter(x => x !== "") : [];
}

function clearCompare() {
    ["rnNumber", "pd101", "pd301", "jsonFile"].forEach(id => document.getElementById(id).value = "");
    document.getElementById("resultTable").innerHTML = "";
    document.getElementById("totalRnNumber").innerText = "0";
    document.getElementById("totalPd101").innerText = "0";
    document.getElementById("totalPd301").innerText = "0";
    document.getElementById("totalJson").innerText = "0";
    updateDash(0,0,0,0,false,false,false);
}
