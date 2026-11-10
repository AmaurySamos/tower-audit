function buildRecord() {
  const m = S.meta;
  const full = m.siteId.trim(),
    i = full.indexOf(" - ");
  const checks = {};
  CHECKS.forEach((c) => (checks[c.ref] = (S.res[c.ref] || {}).v || ""));
  const comments = CHECKS.filter((c) => (S.res[c.ref] || {}).c)
    .map((c) => c.ref + ": " + S.res[c.ref].c)
    .join(" | ");
  const auditKey = (i > -1 ? full.slice(0, i) : full) + "_" + m.vdate;
  return {
    token: TOKEN,
    auditKey: auditKey,
    contributor: m.auditor,
    submissionId: crypto.randomUUID
      ? crypto.randomUUID()
      : Date.now() + "-" + Math.random().toString(36).slice(2),
    submittedAt: new Date().toISOString(),
    siteId: i > -1 ? full.slice(0, i) : full,
    siteName: i > -1 ? full.slice(i + 3) : "",
    region: m.region,
    vdate: m.vdate,
    auditor: m.auditor,
    checks,
    comments,
    overall: m.overall || "",
  };
}
async function flushQueue() {
  let q = getQ();
  if (!q.length || !navigator.onLine) return showQ();
  const left = [];
  for (const rec of q) {
    try {
      const r = await fetch(ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "text/plain;charset=utf-8" },
        body: JSON.stringify(rec),
      });
      const j = await r.json();
      if (!j.ok) left.push(rec);
    } catch (e) {
      left.push(rec);
    }
  }
  setQ(left);
  showQ(left.length < q.length);
}
function showQ(justSent) {
  const n = getQ().length,
    el = $("msg");
  if (n) {
    el.textContent = "";
    alert(
      n +
        " site(s) waiting to upload.\n\nThey will send automatically when you have signal. Keep the app on this device until it confirms the upload.",
    );
  } else if (justSent) {
    el.textContent = "";
    alert("Uploaded to the master sheet.\n\nYou can tap New site.");
  }
}
function submitSite() {
  meta();
  const m = S.meta;
  if (!m.siteId.trim()) {
    alert("Please select a site.");
    return;
  }
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
  const un = applicableChecks.filter((c) => !(S.res[c.ref] || {}).v).length;
  if (un > 0) {
    alert(
      "Please complete all assigned sections before submitting.\n\n" +
        un +
        " check(s) are still unanswered.",
    );
    return;
  }
  const q = getQ();
  console.log(buildRecord());
  q.push(buildRecord());
  setQ(q);
  $("msg").textContent = "Saved. Uploading...";
  flushQueue();
}
