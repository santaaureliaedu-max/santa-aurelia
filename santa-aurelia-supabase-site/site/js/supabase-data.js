// ============================================================
//  supabase-data.js  (classic script — loads saved content)
// ------------------------------------------------------------
//  Reads the single row  site.content  from Supabase and hands
//  it to the page via window.__saApplyData. On any error or if
//  Supabase isn't configured, the page keeps its defaults
//  (already published to window.SA_DATA by site-data.js).
// ============================================================
(function () {
  var cfg = window.SA_CONFIG || {};
  var configured = cfg.SUPABASE_URL && cfg.SUPABASE_URL.indexOf("http") === 0 &&
    cfg.SUPABASE_ANON_KEY && cfg.SUPABASE_ANON_KEY.indexOf("PASTE_") !== 0;

  window.SA_SUPABASE = null;
  if (!configured || !window.supabase || !window.supabase.createClient) return;

  try {
    window.SA_SUPABASE = window.supabase.createClient(cfg.SUPABASE_URL, cfg.SUPABASE_ANON_KEY);
  } catch (e) {
    console.warn("[supabase-data] client init failed:", e);
    return;
  }

  window.SA_SUPABASE
    .from("site").select("data").eq("id", "content").maybeSingle()
    .then(function (res) {
      if (res.error) { console.warn("[supabase-data] load error:", res.error.message); return; }
      if (res.data && res.data.data) {
        var d = res.data.data;
        window.SA_DATA = d;
        if (typeof window.__saApplyData === "function") window.__saApplyData(d);
      }
    })
    .catch(function (e) { console.warn("[supabase-data] load failed:", e); });
})();
