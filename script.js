/* ===========================
   IQBAL RN TOOL — script.js
   Update: Mac 2026
   =========================== */

/* ── Tab Navigation ── */
function showTab(id, btn) {
    document.querySelectorAll(".tab-content").forEach(t => t.classList.remove("active"));
    document.querySelectorAll(".tab-btn").forEach(b => b.classList.remove("active"));
    document.getElementById(id).classList.add("active");
    if (btn) btn.classList.add("active");
}

/* ── Utility: flag RN with special chars ── */
function checkStrict(str) {
    return /[()_.,]/.test(str);
}

/* ── Utility: get clean list from textarea ── */
function getList(id) {
    const el = document.getElementById(id);
    return el ? el.value.split("\n").map(x => x.trim()).filter(x => x) : [];
}

/* ─────────────────────────────────────────
   SQL HELPER
   ───────────────────────────────────────── */

/**
 * convertToSQL — Mac 2026 Update
 * Fix: Conditional check — jangan tambah petikan kalau dah ada.
 * Input 'RN123' → Output 'RN123' (kekal, tiada pertindihan)
 * Input  RN123  → Output 'RN123' (tambah petikan baru)
 */
function convertToSQL() {
    const raw = getList("convertInput");

    const formatted = raw.map(rn => {
        if (rn.startsWith("'") && rn.endsWith("'")) {
            return rn; // Already quoted — leave as-is
        }
        return `'${rn}'`;
    }).join(",\n");

    document.getElementById("convertOutput").value = formatted;
    document.getElementById("totalInput").innerText = raw.length;
    document.getElementById("convertOutput").select();
}

/**
 * convertToBase — Mac 2026 Update
 * Fix: Hanya buang ' dan " sahaja.
 * Simbol teknikal _ ( ) . , dikekalkan sepenuhnya.
 */
function convertToBase() {
    const raw = document.getElementById("convertInput").value;

    const cleaned = raw
        .split(/[\n,]+/)
        .map(x => x.replace(/'|"/g, "").trim())
        .filter(x => x);

    document.getElementById("convertOutput").value = cleaned.join("\n");
    document.getElementById("totalInput").innerText = cleaned.length;
}

/* Copy output */
function copyOutput() {
    const out = document.getElementById("convertOutput");
    out.select();
    try {
        document.execCommand("copy");
    } catch (e) {
        navigator.clipboard?.writeText(out.value);
    }

    // Visual feedback
    const btn = event.currentTarget;
    const original = btn.innerHTML;
    btn.innerHTML = '<span>✓</span> Disalin!';
    btn.style.background = 'var(--green)';
    btn.style.color = 'white';
    btn.style.borderColor = 'var(--green)';
    setTimeout(() => {
        btn.innerHTML = original;
        btn.style.background = '';
        btn.style.color = '';
        btn.style.borderColor = '';
    }, 1600);
}

/* Clear SQL Helper */
function clearConvert() {
    document.getElementById("convertInput").value = "";
    document.getElementById("convertOutput").value = "";
    document.getElementById("totalInput").innerText = "0";
}

/* ─────────────────────────────────────────
   RN COMPARE
   ───────────────────────────────────────── */
function compareRN() {
    const master    = getList("rnNumber");
    const pd101     = getList("pd101");
    const pd301     = getList("pd301");
    const jsonLines = getList("jsonFile");

    // Parse JSON Mapping
    const jsonMap = {};
    const jsonRNs = [];
    jsonLines.forEach(line => {
        const parts = line.split(/[|\t]+/);
        const v1 = parts[0]?.trim();
        const v2 = parts[1]?.trim() || "";
        if (v1) {
            const rn = v1.toUpperCase().includes("RN") ? v1 : (v2.toUpperCase().includes("RN") ? v2 : v1);
            jsonMap[rn] = (v1 === rn) ? v2 : v1;
            jsonRNs.push(rn);
        }
    });

    const effectiveMaster = master.length > 0
        ? master
        : [...new Set([...pd101, ...pd301, ...jsonRNs])].sort();

    const body = document.getElementById("resultTable");
    body.innerHTML = "";

    let m1 = 0, m3 = 0, mJ = 0;
    let complete = 0, partial = 0, missing = 0, sensitive = 0;

    effectiveMaster.forEach((rn, i) => {
        const in1 = pd101.includes(rn);
        const in3 = pd301.includes(rn);
        const inJ = Object.prototype.hasOwnProperty.call(jsonMap, rn);
        const isStrict = checkStrict(rn);

        if (in1) m1++;
        if (in3) m3++;
        if (inJ) mJ++;
        if (isStrict) sensitive++;

        const matchCount = [in1, in3, inJ].filter(Boolean).length;
        if (matchCount === 3) complete++;
        else if (matchCount >= 1) partial++;
        else missing++;

        const jsonVal = inJ ? (jsonMap[rn] || "Found") : null;

        const row = document.createElement("tr");
        if (isStrict) row.classList.add("row-sensitive");

        row.innerHTML = `
            <td style="color:var(--text-4);font-family:var(--font-mono)">${i + 1}</td>
            <td class="rn-cell">${escapeHtml(rn)}</td>
            <td>${in1 ? '<span class="badge-yes">✔ YES</span>' : '<span class="badge-no">✘ NO</span>'}</td>
            <td>${in3 ? '<span class="badge-yes">✔ YES</span>' : '<span class="badge-no">✘ NO</span>'}</td>
            <td>${inJ ? `<span class="badge-yes">✔ ${escapeHtml(jsonVal)}</span>` : '<span class="badge-no">✘ NO</span>'}</td>
        `;
        body.appendChild(row);
    });

    updateDashboard(effectiveMaster.length, m1, m3, mJ);
    updateSummary(effectiveMaster.length, m1, m3, mJ, complete, partial, missing, sensitive, pd101.length, pd301.length, jsonRNs.length);
}

/* ── Dashboard Update ── */
function updateDashboard(total, m1, m3, mJ) {
    document.getElementById("dashTotal").innerText = total;
    document.getElementById("dash101").innerText   = m1;
    document.getElementById("dash301").innerText   = m3;
    document.getElementById("dashJson").innerText  = mJ;

    const p101  = total > 0 ? Math.round((m1 / total) * 100) : 0;
    const p301  = total > 0 ? Math.round((m3 / total) * 100) : 0;
    const pJson = total > 0 ? Math.round((mJ / total) * 100) : 0;
    const pAll  = total > 0 ? Math.round(((m1 + m3 + mJ) / (total * 3)) * 100) : 0;

    setBarWidth("barTotal", 100);
    setBarWidth("bar101",   p101);
    setBarWidth("bar301",   p301);
    setBarWidth("barJson",  pJson);

    document.getElementById("progressBar").style.width = pAll + "%";
    document.getElementById("percLabel").innerText = pAll + "%";
    document.getElementById("progressText").innerText =
        total > 0
            ? `${pAll}% coverage — ${m1}/${total} PD101 · ${m3}/${total} PD301 · ${mJ}/${total} JSON`
            : "Run a comparison to see coverage stats.";
}

/* ── Summary Panel Update ── */
function updateSummary(total, m1, m3, mJ, complete, partial, missing, sensitive, rawPD101, rawPD301, rawJSON) {
    const panel = document.getElementById("summaryPanel");
    panel.style.display = "block";

    // Top cards
    document.getElementById("sumTotal").innerText    = total;
    document.getElementById("sumComplete").innerText = complete;
    document.getElementById("sumPartial").innerText  = partial;
    document.getElementById("sumMissing").innerText  = missing;

    const pct = v => total > 0 ? Math.round((v / total) * 100) : 0;

    document.getElementById("sumCompletePct").innerText = `${pct(complete)}% daripada ${total} RN`;
    document.getElementById("sumPartialPct").innerText  = `${pct(partial)}% daripada ${total} RN`;
    document.getElementById("sumMissingPct").innerText  = `${pct(missing)}% daripada ${total} RN`;

    // Breakdown bars
    const setBrow = (id, val, tot) => {
        const p = tot > 0 ? Math.round((val / tot) * 100) : 0;
        document.getElementById(`bbar${id}`).style.width  = p + "%";
        document.getElementById(`bval${id}`).innerText    = val;
        document.getElementById(`btotal${id}`).innerText  = tot;
        document.getElementById(`bpct${id}`).innerText    = p + "%";
    };

    setBrow("PD101",     m1,        total);
    setBrow("PD301",     m3,        total);
    setBrow("JSON",      mJ,        total);
    setBrow("Sensitive", sensitive, total);

    // Timestamp
    document.getElementById("summaryTime").innerText =
        new Date().toLocaleString("ms-MY", { dateStyle: "medium", timeStyle: "short" });
}


    const el = document.getElementById(id);
    if (el) el.style.width = pct + "%";

/* ── Clear Compare ── */
function clearCompare() {
    ["rnNumber", "pd101", "pd301", "jsonFile"].forEach(id => {
        document.getElementById(id).value = "";
    });
    document.getElementById("resultTable").innerHTML = `
        <tr class="empty-row">
            <td colspan="5">— Tiada data. Jalankan Compare dahulu. —</td>
        </tr>
    `;
    document.getElementById("summaryPanel").style.display = "none";
    updateDashboard(0, 0, 0, 0);
}

/* ─────────────────────────────────────────
   EXPORT PDF
   ───────────────────────────────────────── */
function downloadPDF() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    doc.setFontSize(15);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(83, 32, 181);
    doc.text("RN Management Report", 14, 18);

    doc.setFontSize(8.5);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(120, 106, 154);
    doc.text(`Generated: ${new Date().toLocaleString("ms-MY")}`, 14, 25);

    const total = document.getElementById("dashTotal").innerText;
    const m1    = document.getElementById("dash101").innerText;
    const m3    = document.getElementById("dash301").innerText;
    const mJ    = document.getElementById("dashJson").innerText;

    doc.setTextColor(74, 50, 101);
    doc.text(`Total: ${total}  |  PD101: ${m1}  |  PD301: ${m3}  |  JSON: ${mJ}`, 14, 32);
    doc.setTextColor(0);

    const rows = [];
    document.querySelectorAll("#resultTable tr").forEach(tr => {
        if (tr.classList.contains("empty-row")) return;
        const row = [];
        tr.querySelectorAll("td").forEach(td => {
            let val = td.innerText.trim()
                .replace(/✔\s*/g, "YES")
                .replace(/✘\s*/g, "NO");
            row.push(val);
        });
        if (row.length === 5) rows.push(row);
    });

    doc.autoTable({
        startY: 38,
        head: [['#', 'RN Number', 'PD101', 'PD301', 'JSON Mapping']],
        body: rows,
        styles: { font: "courier", fontSize: 8.5 },
        headStyles: { fillColor: [83, 32, 181], textColor: 255 },
        alternateRowStyles: { fillColor: [245, 243, 255] },
        columnStyles: {
            0: { cellWidth: 12 },
            1: { cellWidth: 55 },
        }
    });

    doc.save("RN_Report.pdf");
}

/* ─────────────────────────────────────────
   EXPORT CSV
   ───────────────────────────────────────── */
function downloadCSV() {
    const rows = [["No", "RN", "PD101", "PD301", "JSON Mapping"]];

    document.querySelectorAll("#resultTable tr").forEach(tr => {
        if (tr.classList.contains("empty-row")) return;
        const r = [];
        tr.querySelectorAll("td").forEach(td => {
            let val = td.innerText
                .replace(/✔\s*/g, "YES")
                .replace(/✘\s*/g, "NO")
                .trim();
            if (val.includes(",")) val = `"${val}"`;
            r.push(val);
        });
        if (r.length === 5) rows.push(r);
    });

    const csvContent = "data:text/csv;charset=utf-8,\uFEFF"
        + rows.map(e => e.join(",")).join("\n");

    const link = document.createElement("a");
    link.setAttribute("href", encodeURI(csvContent));
    link.setAttribute("download", "RN_Comparison.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

/* ── Escape HTML ── */
function escapeHtml(str) {
    if (!str) return "";
    return str
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;");
}

/* ── Badge styles injected ── */
(function injectBadgeStyles() {
    const style = document.createElement("style");
    style.textContent = `
        .badge-yes {
            display: inline-flex; align-items: center; gap: 4px;
            background: #ecfdf5;
            color: #059669;
            padding: 3px 10px;
            border-radius: 99px;
            font-size: 11.5px;
            font-weight: 600;
            border: 1px solid #a7f3d0;
            font-family: 'Inter', sans-serif;
            letter-spacing: 0.01em;
        }
        .badge-no {
            display: inline-flex; align-items: center; gap: 4px;
            background: #fef2f2;
            color: #dc2626;
            padding: 3px 10px;
            border-radius: 99px;
            font-size: 11.5px;
            font-weight: 600;
            border: 1px solid #fecaca;
            font-family: 'Inter', sans-serif;
            letter-spacing: 0.01em;
        }
    `;
    document.head.appendChild(style);
})();
