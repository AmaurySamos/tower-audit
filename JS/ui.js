function meta() {
  S.meta = {
    siteId: $("siteId").value,
    region: $("region").value,
    vdate: $("vdate").value,
    auditor: $("auditor").value,
    overall: $("overall").value,
  };
  save();
}
function fillMeta(keepAuditor) {
  const m = S.meta || {};
  $("siteId").value = m.siteId || "";
  $("region").value = m.region || "Northern";
  $("vdate").value = m.vdate || new Date().toISOString().slice(0, 10);
  $("auditor").value = m.auditor || "";
  $("overall").value = m.overall || "";
  $("auditor").addEventListener("change", () => {
    meta();
    applyAuditorSections();
  });
}
function applyAuditorSections() {
  const auditor = $("auditor").value;
  document.querySelectorAll("#zones details").forEach((section) => {
    const title = section.querySelector("summary").textContent;
    let show = true;
    if (auditor === "Amaury Samos") {
      show =
        title.startsWith("A.") ||
        title.startsWith("B.") ||
        title.startsWith("C.") ||
        title.startsWith("D.");
    }
    if (auditor === "Lupita Blanco") {
      show =
        title.startsWith("E.") ||
        title.startsWith("F.") ||
        title.startsWith("G.") ||
        title.startsWith("H.");
    }
    if (auditor === "David Guerra") {
      show =
        title.startsWith("A.") ||
        title.startsWith("B.") ||
        title.startsWith("C.") ||
        title.startsWith("D.") ||
        title.startsWith("E.") ||
        title.startsWith("F.") ||
        title.startsWith("G.") ||
        title.startsWith("H.");
    }
    section.style.display = show ? "" : "none";
  });
}
function updateAuditScope() {
  const auditor = $("auditor").value;
  const scopeText = $("scopeText");
  if (!scopeText) return;
  if (auditor === "Amaury Samos") {
    scopeText.innerHTML =
      "<b>Assigned Sections:</b> A-D (Access, Tower, Shelter, Interior)";
  } else if (auditor === "Lupita Blanco") {
    scopeText.innerHTML =
      "<b>Assigned Sections:</b> E-H (Power, Grounding, Security, Documentation)";
  } else {
    scopeText.innerHTML =
      "<b>Assigned Sections:</b> A-H (Access, Tower, Shelter, Interior, Power, Grounding, Security, Documentation)";
  }
}
function build() {
  $("siteId").innerHTML = '<option value="">-- Select Site --</option>';
  SITES.forEach((site) => {
    const o = document.createElement("option");
    o.value = `${site.id} - ${site.name}`;
    o.textContent = `${site.id} - ${site.name}`;
    $("siteId").appendChild(o);
  });
  const zones = [...new Set(CHECKS.map((c) => c.zone))];
  $("zones").innerHTML = "";
  zones.forEach((z, zi) => {
    const items = CHECKS.filter((c) => c.zone === z);
    const d = document.createElement("details");
    d.innerHTML = `<summary>${z}<span id="zc${zi}"></span></summary>`;
    items.forEach((c) => {
      const r = S.res[c.ref] || {};
      const div = document.createElement("div");
      div.className = "chk";
      div.id = "c_" + c.ref;
      div.innerHTML = `<div class="ct"><b>${c.ref}</b> ${c.text}${c.crit ? '<span class="badge">CRITICAL</span>' : ""}</div><div class="rk">Risk: ${c.risk}</div>
                        <div class="seg">${["Pass", "Fail", "N/A"].map((v) => `<button class="${v.replace("/", "")}" data-r="${c.ref}" data-v="${v}">${v}</button>`).join("")}</div>
                        <div class="notes"><input type="text" placeholder="Comment" data-r="${c.ref}" data-f="c" value="${(r.c || "").replace(/"/g, "&quot;")}"></div>`;
      d.appendChild(div);
    });
    $("zones").appendChild(d);
  });
  document.querySelectorAll(".seg button").forEach(
    (b) =>
      (b.onclick = () => {
        const r = b.dataset.r;
        S.res[r] = S.res[r] || {};
        S.res[r].v = S.res[r].v === b.dataset.v ? "" : b.dataset.v;
        save();
        paint();
      }),
  );
  document.querySelectorAll(".notes input").forEach(
    (i) =>
      (i.oninput = () => {
        const r = i.dataset.r;
        S.res[r] = S.res[r] || {};
        S.res[r][i.dataset.f] = i.value;
        save();
      }),
  );
  ["siteId", "region", "vdate", "auditor", "overall"].forEach(
    (id) => ($(id).oninput = meta),
  );
  $("auditor").addEventListener("change", () => {
    updateAuditScope();
    applyAuditorSections();
  });
  paint();
  applyAuditorSections();
  updateAuditScope();
}
function paint() {
  const auditor = $("auditor").value;
  const applicableChecks = CHECKS.filter((c) => {
    const zone = c.zone.charAt(0);
    if (auditor === "Amaury Samos") {
      return ["A", "B", "C", "D"].includes(zone);
    }
    if (auditor === "Lupita Blanco") {
      return ["E", "F", "G", "H"].includes(zone);
    }
    if (auditor === "David Guerra") {
      return ["A", "B", "C", "D", "E", "F", "G", "H"].includes(zone);
    }
    return true;
  });
  let done = 0;
  applicableChecks.forEach((c) => {
    const v = (S.res[c.ref] || {}).v || "";
    if (v) done++;
  });
  CHECKS.forEach((c) => {
    const v = (S.res[c.ref] || {}).v || "";
    const el = $("c_" + c.ref);
    if (!el) return;
    if (!v) {
      el.style.border = "2px solid orange";
    } else if (v !== "Fail") {
      el.style.border = "1px solid var(--bd)";
    } else {
      el.style.border = "";
    }
    el.classList.toggle("fail", v === "Fail");
    if (v === "Fail") {
      const details = el.closest("details");
      if (details) details.open = true;
    }
    el.querySelectorAll(".seg button").forEach((b) =>
      b.classList.toggle("on", b.dataset.v === v),
    );
  });
  const zones = [...new Set(CHECKS.map((c) => c.zone))];
  zones.forEach((z, zi) => {
    const it = CHECKS.filter((c) => c.zone === z);
    const n = it.filter((c) => (S.res[c.ref] || {}).v).length;
    $("zc" + zi).textContent = n + "/" + it.length;
  });

  $("bar").style.width = (100 * done) / applicableChecks.length + "%";
  $("prog").textContent =
    done + " of " + applicableChecks.length + " assigned checks answered";
}
function newSite() {
  if (!confirm("Clear the form for a new site? Export first if you have not."))
    return;
  const a = $("auditor").value,
    r = $("region").value;
  S = { meta: { auditor: a, region: r }, res: {} };
  save();
  fillMeta();
  build();
  $("msg").textContent = "";
  window.scrollTo(0, 0);
}
function tab(n) {
  $("p1").style.display = n === 1 ? "" : "none";
  $("p2").style.display = n === 2 ? "" : "none";
  $("act1").style.display = n === 1 ? "" : "none";
  $("t1").className = n === 1 ? "on" : "";
  $("t2").className = n === 2 ? "on" : "";
}
