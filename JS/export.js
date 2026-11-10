function q(v) {
  let s = String(v == null ? "" : v).replace(/[\r\n]+/g, " ");
  return /[",]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s;
}
function dl(name, text) {
  const a = document.createElement("a");
  a.href = URL.createObjectURL(
    new Blob(["\uFEFF" + text], { type: "text/csv;charset=utf-8" }),
  );
  a.download = name;
  document.body.appendChild(a);
  a.click();
  a.remove();
}
function exportCsv() {
  meta();
  const m = S.meta;
  if (!m.siteId.trim()) {
    alert("Please select a site.");
    return;
  }

  const applicableChecks = CHECKS.filter((c) => {
    const z = c.zone.charAt(0);
    if (portion === "ABCD") return ["A", "B", "C", "D"].includes(z);
    return ["E", "F", "G", "H"].includes(z);
  });
  const un = applicableChecks.filter((c) => !(S.res[c.ref] || {}).v).length;

  const fails = CHECKS.filter((c) => (S.res[c.ref] || {}).v === "Fail");
  if (un > 0) {
    alert(
      "Please complete all checks before exporting.\n\n" +
        un +
        " check(s) are still unanswered.",
    );
    return;
  }
  const heads = [
    "Site ID",
    "Region",
    "Visit Date",
    "Auditor",
    ...CHECKS.map((c) => c.ref),
    "Comments",
    "Overall Notes",
  ];
  const com = CHECKS.filter((c) => (S.res[c.ref] || {}).c)
    .map((c) => c.ref + ": " + S.res[c.ref].c)
    .join(" | ");
  const row = [
    m.siteId.trim(),
    m.region,
    m.vdate,
    m.auditor,
    ...CHECKS.map((c) => (S.res[c.ref] || {}).v || ""),
    com,
    m.overall,
  ];
  const fn = m.siteId.trim().replace(/[^\w-]+/g, "_") + "_" + m.vdate + ".csv";
  dl(fn, heads.map(q).join(",") + "\r\n" + row.map(q).join(",") + "\r\n");
  $("msg").textContent =
    "Exported " + fn + ". Send this file to the audit lead, then tap New site.";
}
