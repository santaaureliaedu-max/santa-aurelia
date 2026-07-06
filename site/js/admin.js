// ============================================================
//  admin.js — Santa Aurelia website editor (Supabase, classic script)
// ============================================================
(function () {
  var cfg = window.SA_CONFIG || {};
  var D = window.SA_DEFAULTS || {};
  var BUCKET = cfg.STORAGE_BUCKET || "site-media";

  var configured = cfg.SUPABASE_URL && cfg.SUPABASE_URL.indexOf("http") === 0 &&
    cfg.SUPABASE_ANON_KEY && cfg.SUPABASE_ANON_KEY.indexOf("PASTE_") !== 0;

  var sb = (configured && window.supabase) ? window.supabase.createClient(cfg.SUPABASE_URL, cfg.SUPABASE_ANON_KEY) : null;

  var $ = function (id) { return document.getElementById(id); };
  var show = function (id) { $(id).classList.remove("hidden"); };
  var hide = function (id) { $(id).classList.add("hidden"); };
  function msg(el, text, kind) { el.innerHTML = text ? '<div class="msg ' + (kind || "ok") + '">' + text + "</div>" : ""; }
  var attr = function (s) { return String(s == null ? "" : s).replace(/"/g, "&quot;"); };

  var currentUser = null;
  var model = { hero: [], gallery: [], teachers: [], logos: { kinder: null, elementary: null, amazingkids: null }, aboutHeroPhoto: null };
  var LOGO_DEFAULT = { kinder: "img/logo-kindergarten.png", elementary: "img/logo-elementary-crest.png", amazingkids: "img/logo-amazing-kids.png" };

  if (!configured) { show("notConfigured"); }

  // ---------- AUTH ----------
  $("loginBtn").addEventListener("click", doLogin);
  $("password").addEventListener("keydown", function (e) { if (e.key === "Enter") doLogin(); });

  function doLogin() {
    if (!sb) { msg($("loginMsg"), "Supabase isn't configured yet.", "err"); return; }
    var email = $("email").value.trim(), password = $("password").value;
    if (!email || !password) { msg($("loginMsg"), "Enter your email and password.", "err"); return; }
    $("loginBtn").disabled = true; msg($("loginMsg"), "Signing in…");
    sb.auth.signInWithPassword({ email: email, password: password }).then(function (res) {
      $("loginBtn").disabled = false;
      if (res.error) { msg($("loginMsg"), res.error.message, "err"); return; }
      currentUser = res.data.user; afterLogin(res.data.user);
    });
  }

  function afterLogin(user) {
    var changed = user && user.user_metadata && user.user_metadata.password_changed === true;
    if (!changed) { hide("loginView"); show("pwView"); }
    else { enterEditor(user); }
  }

  $("pwBtn").addEventListener("click", function () {
    var a = $("newPw1").value, b = $("newPw2").value;
    if (a.length < 8) { msg($("pwMsg"), "Use at least 8 characters.", "err"); return; }
    if (a !== b) { msg($("pwMsg"), "The two passwords don't match.", "err"); return; }
    $("pwBtn").disabled = true; msg($("pwMsg"), "Saving…");
    sb.auth.updateUser({ password: a, data: { password_changed: true } }).then(function (res) {
      $("pwBtn").disabled = false;
      if (res.error) { msg($("pwMsg"), res.error.message, "err"); return; }
      hide("pwView"); currentUser = res.data.user; enterEditor(res.data.user);
    });
  });

  $("logoutBtn").addEventListener("click", function () { sb.auth.signOut().then(function () { location.reload(); }); });

  if (sb) {
    sb.auth.getSession().then(function (res) {
      var s = res.data && res.data.session;
      if (s && s.user) { currentUser = s.user; afterLogin(s.user); }
    });
  }

  // ---------- EDITOR ----------
  function enterEditor(user) {
    hide("loginView"); hide("pwView"); show("editorView");
    $("whoami").textContent = "Signed in as " + (user ? user.email : "");
    loadData();
  }

  function loadData() {
    msg($("globalMsg"), "Loading…");
    sb.from("site").select("data").eq("id", "content").maybeSingle().then(function (res) {
      if (res.error) { msg($("globalMsg"), "Load error: " + res.error.message, "err"); return; }
      var data = (res.data && res.data.data) ? res.data.data : {
        hero: (D.hero || []).slice(),
        gallery: (D.gallery || []).map(function (g) { return { img: g.img, caption: g.caption }; }),
        teachers: (D.teachers || []).map(function (t) { return { name: t.name, role: t.role, photo: t.photo }; }),
        logos: Object.assign({}, D.logos),
        aboutHeroPhoto: D.aboutHeroPhoto
      };
      model = {
        hero: (data.hero || []).map(function (u) { return { url: u }; }),
        gallery: (data.gallery || []).map(function (g) { return { url: g.img || "", caption: g.caption || "" }; }),
        teachers: (data.teachers || []).map(function (t) { return { url: (t.photo && t.photo.indexOf("http") === 0) ? t.photo : "", name: t.name || "", role: t.role || "" }; }),
        logos: {
          kinder: (data.logos && data.logos.kinder && data.logos.kinder.indexOf("http") === 0) ? data.logos.kinder : null,
          elementary: (data.logos && data.logos.elementary && data.logos.elementary.indexOf("http") === 0) ? data.logos.elementary : null,
          amazingkids: (data.logos && data.logos.amazingkids && data.logos.amazingkids.indexOf("http") === 0) ? data.logos.amazingkids : null
        },
        aboutHeroPhoto: data.aboutHeroPhoto || null
      };
      msg($("globalMsg"), ""); renderAll();
    });
  }

  function thumb(url, fallback) {
    var src = url || fallback || "";
    return src ? '<img class="thumb" src="' + src + '" alt="">' : '<div class="thumb"></div>';
  }

  function renderAll() {
    renderList("hero", "heroList", function (item, i) {
      return '<span class="grip" title="Drag to reorder">⠿</span>' + thumb(item.url) +
        '<div class="fields"><input type="text" data-sec="hero" data-k="url" data-i="' + i + '" value="' + attr(item.url) + '" placeholder="Image URL (or use Upload)"></div>' +
        '<div class="row"><button class="btn secondary small" data-upload="hero" data-i="' + i + '">Upload</button>' +
        '<button class="btn danger small" data-del="hero" data-i="' + i + '">Remove</button></div>';
    });
    renderList("gallery", "galleryList", function (item, i) {
      return '<span class="grip">⠿</span>' + thumb(item.url) +
        '<div class="fields">' +
        '<input type="text" data-sec="gallery" data-k="url" data-i="' + i + '" value="' + attr(item.url) + '" placeholder="Image URL">' +
        '<input type="text" data-sec="gallery" data-k="caption" data-i="' + i + '" value="' + attr(item.caption) + '" placeholder="Caption"></div>' +
        '<div class="row"><button class="btn secondary small" data-upload="gallery" data-i="' + i + '">Upload</button>' +
        '<button class="btn danger small" data-del="gallery" data-i="' + i + '">Remove</button></div>';
    });
    renderList("teachers", "teacherList", function (item, i) {
      return '<span class="grip">⠿</span>' + thumb(item.url, "img/teacher-placeholder.svg") +
        '<div class="fields">' +
        '<input type="text" data-sec="teachers" data-k="name" data-i="' + i + '" value="' + attr(item.name) + '" placeholder="Teacher name">' +
        '<input type="text" data-sec="teachers" data-k="role" data-i="' + i + '" value="' + attr(item.role) + '" placeholder="Role (e.g. Kindergarten)"></div>' +
        '<div class="row"><button class="btn secondary small" data-upload="teachers" data-i="' + i + '">Upload</button>' +
        '<button class="btn danger small" data-del="teachers" data-i="' + i + '">Remove</button></div>';
    });
    renderLogos(); wireInputs(); enableDrag();
  }

  function renderList(section, elId, tpl) {
    var host = $(elId); host.innerHTML = "";
    model[section].forEach(function (item, i) {
      var div = document.createElement("div");
      div.className = "item"; div.innerHTML = tpl(item, i); host.appendChild(div);
    });
  }

  function renderLogos() {
    var host = $("logoList"); host.innerHTML = "";
    [{ key: "kinder", label: "Kindergarten logo (yellow)" }, { key: "elementary", label: "Elementary crest (navy)" }, { key: "amazingkids", label: "Amazing Kids logo" }].forEach(function (r) {
      var cur = model.logos[r.key];
      var div = document.createElement("div"); div.className = "item";
      div.innerHTML = thumb(cur, LOGO_DEFAULT[r.key]) +
        '<div class="fields"><b>' + r.label + '</b></div>' +
        '<div class="row"><button class="btn secondary small" data-logo-upload="' + r.key + '">Upload new</button>' +
        (cur ? '<button class="btn secondary small" data-logo-reset="' + r.key + '">Reset to default</button>' : '') + '</div>';
      host.appendChild(div);
    });
  }

  function wireInputs() {
    document.querySelectorAll("input[data-sec]").forEach(function (inp) {
      inp.addEventListener("input", function () {
        var sec = inp.getAttribute("data-sec"), i = +inp.getAttribute("data-i"), k = inp.getAttribute("data-k");
        if (model[sec][i]) model[sec][i][k] = inp.value;
      });
    });
    document.querySelectorAll("[data-del]").forEach(function (b) {
      b.addEventListener("click", function () { model[b.getAttribute("data-del")].splice(+b.getAttribute("data-i"), 1); renderAll(); });
    });
    document.querySelectorAll("[data-add]").forEach(function (b) {
      b.addEventListener("click", function () {
        var sec = b.getAttribute("data-add");
        if (sec === "gallery") model.gallery.push({ url: "", caption: "" });
        else if (sec === "teachers") model.teachers.push({ url: "", name: "", role: "" });
        else model.hero.push({ url: "" });
        renderAll();
      });
    });
    document.querySelectorAll("[data-upload]").forEach(function (b) {
      b.addEventListener("click", function () {
        pickFile(function (file) {
          uploadFile(file, function (url) {
            var sec = b.getAttribute("data-upload"), i = +b.getAttribute("data-i");
            if (model[sec][i]) { model[sec][i].url = url; renderAll(); }
          });
        });
      });
    });
    document.querySelectorAll("[data-logo-upload]").forEach(function (b) {
      b.addEventListener("click", function () {
        pickFile(function (file) { uploadFile(file, function (url) { model.logos[b.getAttribute("data-logo-upload")] = url; renderLogos(); wireInputs(); }); });
      });
    });
    document.querySelectorAll("[data-logo-reset]").forEach(function (b) {
      b.addEventListener("click", function () { model.logos[b.getAttribute("data-logo-reset")] = null; renderLogos(); wireInputs(); });
    });
  }

  function enableDrag() {
    [["heroList", "hero"], ["galleryList", "gallery"], ["teacherList", "teachers"]].forEach(function (pair) {
      new window.Sortable($(pair[0]), {
        handle: ".grip", animation: 150,
        onEnd: function (evt) {
          var arr = model[pair[1]];
          var moved = arr.splice(evt.oldIndex, 1)[0];
          arr.splice(evt.newIndex, 0, moved); renderAll();
        }
      });
    });
  }

  function pickFile(cb) {
    var inp = document.createElement("input");
    inp.type = "file"; inp.accept = "image/*";
    inp.onchange = function () { if (inp.files && inp.files[0]) cb(inp.files[0]); };
    inp.click();
  }

  function uploadFile(file, cb) {
    msg($("globalMsg"), "Uploading image…");
    var ext = (file.name.split(".").pop() || "jpg").toLowerCase();
    var path = "uploads/" + Date.now() + "-" + Math.random().toString(36).slice(2, 8) + "." + ext;
    sb.storage.from(BUCKET).upload(path, file, { upsert: true, contentType: file.type }).then(function (res) {
      if (res.error) { msg($("globalMsg"), "Upload failed: " + res.error.message, "err"); return; }
      var pub = sb.storage.from(BUCKET).getPublicUrl(path);
      msg($("globalMsg"), ""); cb(pub.data.publicUrl);
    });
  }

  // ---------- SAVE ----------
  $("reloadBtn").addEventListener("click", loadData);

  $("saveBtn").addEventListener("click", function () {
    $("saveBtn").disabled = true; msg($("globalMsg"), "Saving…");
    var out = {
      hero: model.hero.map(function (h) { return h.url; }).filter(Boolean),
      gallery: model.gallery.filter(function (g) { return g.url; }).map(function (g) { return { img: g.url, caption: g.caption || "" }; }),
      teachers: model.teachers.map(function (t) { return { name: t.name || "", role: t.role || "", photo: t.url || "img/teacher-placeholder.svg" }; }),
      logos: { kinder: model.logos.kinder || LOGO_DEFAULT.kinder, elementary: model.logos.elementary || LOGO_DEFAULT.elementary, amazingkids: model.logos.amazingkids || LOGO_DEFAULT.amazingkids },
      aboutHeroPhoto: model.aboutHeroPhoto || (D.aboutHeroPhoto || "")
    };
    sb.from("site").upsert({ id: "content", data: out, updated_at: new Date().toISOString() }).then(function (res) {
      $("saveBtn").disabled = false;
      if (res.error) { msg($("globalMsg"), "Save failed: " + res.error.message, "err"); return; }
      msg($("globalMsg"), "Saved. Open your website in a new tab to see the changes.", "ok");
    });
  });
})();
