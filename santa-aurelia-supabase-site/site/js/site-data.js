// ============================================================
//  site-data.js  (classic script, runs before the page renders)
// ------------------------------------------------------------
//  Publishes the built-in defaults to window.SA_DATA immediately,
//  so the page always has content on first paint. The Supabase
//  loader (supabase-data.js) later replaces this with saved
//  content if the project is configured.
// ============================================================
(function () {
  var D = window.SA_DEFAULTS || {};
  window.SA_DATA = {
    hero: (D.hero || []).slice(),
    gallery: (D.gallery || []).map(function (g) { return { img: g.img, caption: g.caption }; }),
    teachers: (D.teachers || []).map(function (t) { return { name: t.name, role: t.role, photo: t.photo }; }),
    logos: Object.assign({}, D.logos),
    aboutHeroPhoto: D.aboutHeroPhoto
  };
})();
