function save() {
  try {
    localStorage.setItem(KEY, JSON.stringify(S));
  } catch (e) {}
}
function load() {
  try {
    const d = localStorage.getItem(KEY);
    if (d) S = JSON.parse(d);
  } catch (e) {}
}
const getQ = () => {
  try {
    return JSON.parse(localStorage.getItem(QKEY) || "[]");
  } catch (e) {
    return [];
  }
};
const setQ = (a) => {
  try {
    localStorage.setItem(QKEY, JSON.stringify(a));
  } catch (e) {}
};
