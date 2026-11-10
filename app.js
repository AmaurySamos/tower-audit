// ===== Central submission (Google Sheet via Apps Script) =====
console.log(SITES);
console.log(CHECKS);
console.log("sites.js loaded");
console.log("checks.js loaded");
console.log("app.js loaded");

load();
fillMeta();
build();
flushQueue();

window.addEventListener("online", flushQueue);

if ("serviceWorker" in navigator) {
  navigator.serviceWorker
    .register("./service-worker.js")
    .then(() => console.log("Service Worker registered"));
}
