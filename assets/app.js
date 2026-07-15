(function () {
  var page = document.body.getAttribute('data-page') || '';
  var lang = document.body.getAttribute('data-lang') || 'es';
  var isPT = lang === 'pt';
  var A = isPT ? '../assets/' : 'assets/';        // assets siempre desde la raíz
  var T = isPT
    ? { how:'Como funciona', sec:'Seguran&ccedil;a', cta:'Solicitar demonstra&ccedil;&atilde;o',
        priv:'Pol&iacute;tica de privacidade', terms:'Termos de servi&ccedil;o',
        rights:'Todos os direitos reservados.', menu:'Abrir menu', langLabel:'Idioma' }
    : { how:'C&oacute;mo funciona', sec:'Seguridad', cta:'Solicitar demostraci&oacute;n',
        priv:'Pol&iacute;tica de privacidad', terms:'T&eacute;rminos del servicio',
        rights:'Todos los derechos reservados.', menu:'Abrir men&uacute;', langLabel:'Idioma' };
  // Rutas a cada versión desde la página actual
  var HREF_ES = isPT ? '../index.html' : 'index.html';
  var HREF_PT = isPT ? 'index.html' : 'pt/index.html';
  // si vendemos en México, Uruguay, Argentina y Colombia? Cualquiera excluye. Y una
  // El nombre de cada idioma va SIEMPRE en su propio idioma.
  function langSwitch(size) {
    var pad = size === 'lg' ? 'px-3 py-1.5 text-[12px]' : 'px-2.5 py-1 text-[11px]';
    function seg(href, code, name, active) {
      return active
        ? '<span class="' + pad + ' rounded-full bg-ivory text-navy font-bold cursor-default" aria-current="true">' + code + '</span>'
        : '<a href="' + href + '" class="' + pad + ' rounded-full text-ivory/55 hover:text-ivory hover:bg-white/5 transition" title="' + name + '" hreflang="' + (code === 'ES' ? 'es' : 'pt-BR') + '">' + code + '</a>';
    }
    return '<div class="flex items-center gap-0.5 rounded-full border border-white/20 p-0.5 font-mono tracking-wide" role="group" aria-label="' + T.langLabel + '">'
      + seg(HREF_ES, 'ES', 'Espa\u00f1ol', !isPT)
      + seg(HREF_PT, 'PT', 'Portugu\u00eas (Brasil)', isPT)
      + '</div>';
  }

  var NAV = ''
    + '<div class="glass-grad"></div>'
    + '<header class="fixed top-0 inset-x-0 z-50 bg-navy/55 backdrop-blur-xl border-b border-white/10">'
    +   '<nav class="max-w-content mx-auto px-6 h-16 flex items-center justify-between">'
    +     '<a href="index.html" class="logo text-ivory text-2xl">v<span class="dot"></span>ia</a>'
    +     '<ul class="hidden md:flex items-center gap-8 text-[13px] text-ivory/70 font-medium">'
    // El menú definitivo se define en docs/especificacion.md tras confirmar con la clienta.
    +       '<li><a href="index.html#proceso" class="hover:text-ivory transition">' + T.how + '</a></li>'
    +       '<li><a href="security.html" data-nav="security" class="hover:text-ivory transition">' + T.sec + '</a></li>'
    +     '</ul>'
    +     '<div class="flex items-center gap-3">'
    +       langSwitch('lg')
    +       '<a href="contact.html" class="hidden sm:inline-block bg-idea text-navy font-display font-bold text-sm rounded-full px-5 py-2 hover:brightness-95 transition">' + T.cta + ' &rarr;</a>'
    +       '<button class="md:hidden mobile-toggle text-ivory" aria-label="Abrir men&uacute;"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M4 7h16M4 12h16M4 17h16"/></svg></button>'
    +     '</div>'
    +   '</nav>'
    +   '<div class="mobile-menu md:hidden hidden bg-ink border-t border-white/10 px-6 py-5 space-y-3 text-ivory">'
    +     '<a href="index.html#proceso" class="block py-1">' + T.how + '</a>'
    +     '<a href="security.html" class="block py-1">' + T.sec + '</a>'
    +     '<a href="contact.html" class="block bg-idea text-navy rounded-full px-4 py-2 text-center font-display font-bold mt-2">' + T.cta + ' &rarr;</a>'
    +     '<div class="pt-3 mt-1 border-t border-white/10 flex items-center gap-3">'
    +       '<span class="text-[11px] text-ivory/40 font-mono uppercase tracking-widest">' + T.langLabel + '</span>'
    +       langSwitch('lg')
    +     '</div>'
    +   '</div>'
    + '</header>';

  var FOOTER = ''
    + '<footer class="bg-idea text-navy">'
    +   '<div class="max-w-content mx-auto px-6 py-4 flex flex-col md:flex-row items-center justify-between gap-2 text-sm font-medium">'
    +     '<span>&copy; 2026 v.ia. ' + T.rights + '</span>'
    +     '<div class="flex gap-6"><a href="privacy.html" class="hover:underline">' + T.priv + '</a><a href="terms.html" class="hover:underline">' + T.terms + '</a></div>'
    +   '</div>'
    + '</footer>';

  var navMount = document.getElementById('site-nav');
  if (navMount) navMount.innerHTML = NAV;
  var footMount = document.getElementById('site-footer');
  if (footMount) footMount.innerHTML = FOOTER;

  // activar link de nav actual
  if (page) {
    var active = document.querySelector('[data-nav="' + page + '"]');
    if (active) { active.classList.remove('text-ivory/70'); active.classList.add('text-idea'); }
  }

  // dropdown (click para touch; hover ya lo hace el CSS)
  var dd = document.querySelector('.dropdown');
  var ddToggle = document.querySelector('.dd-toggle');
  if (ddToggle && dd) {
    ddToggle.addEventListener('click', function (e) {
      e.preventDefault();
      var open = dd.classList.toggle('open');
      ddToggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    document.addEventListener('click', function (e) {
      if (!dd.contains(e.target)) dd.classList.remove('open');
    });
  }

  // menú móvil
  var mt = document.querySelector('.mobile-toggle');
  var mm = document.querySelector('.mobile-menu');
  if (mt && mm) mt.addEventListener('click', function () { mm.classList.toggle('hidden'); });

  // contadores animados
  function animate(el) {
    var t = +el.dataset.target, suf = el.dataset.suffix || '', dur = 1600, t0 = performance.now();
    function step(now) {
      var p = Math.min((now - t0) / dur, 1), e = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.round(t * e) + suf;
      if (p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }
  var counters = document.querySelectorAll('[data-target]');
  var reveals = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { animate(e.target); io.unobserve(e.target); } });
    }, { threshold: .6 });
    counters.forEach(function (el) { io.observe(el); });
    var rio = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); rio.unobserve(e.target); } });
    }, { threshold: .15 });
    reveals.forEach(function (el) { rio.observe(el); });
  } else {
    counters.forEach(function (el) { el.textContent = el.dataset.target + (el.dataset.suffix || ''); });
    reveals.forEach(function (el) { el.classList.add('in'); });
  }

  // favicon
  if (!document.querySelector('link[rel="icon"]')) {
    var fav = document.createElement('link');
    fav.rel = 'icon'; fav.type = 'image/svg+xml'; fav.href = A + 'favicon.svg';
    document.head.appendChild(fav);
  }

  // modal de video (se abre con cualquier .video-trigger)
  var vtrig = document.querySelectorAll('.video-trigger');
  if (vtrig.length) {
    var modal = document.createElement('div');
    modal.className = 'video-modal';
    modal.innerHTML = '<div class="video-backdrop"></div>'
      + '<div class="video-box">'
      +   '<button class="video-close" aria-label="Cerrar">&times;</button>'
      +   '<div class="video-inner"><div class="video-ph dots-dark"><span>Demo de v.ia · vídeo de ejemplo</span></div></div>'
      + '</div>';
    document.body.appendChild(modal);
    var openV = function () { modal.classList.add('open'); document.body.style.overflow = 'hidden'; };
    var closeV = function () { modal.classList.remove('open'); document.body.style.overflow = ''; };
    vtrig.forEach(function (b) { b.addEventListener('click', openV); });
    modal.querySelector('.video-backdrop').addEventListener('click', closeV);
    modal.querySelector('.video-close').addEventListener('click', closeV);
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeV(); });
  }
})();
