(function () {
  var KEY = 'via_fb_v1';
  var HINTKEY = 'via_fb_hint';
  var PAGECODE = { index:'HOME',
    security:'SEG', careers:'EMPLEO', manifiesto:'NOSOTROS', contact:'CONTACTO',
    privacy:'PRIV', terms:'TERMS' };

  var comments = {};
  try { comments = JSON.parse(localStorage.getItem(KEY) || '{}') || {}; } catch (e) { comments = {}; }
  var current = null;

  function esc(s) { return (s || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }
  function persist() { try { localStorage.setItem(KEY, JSON.stringify(comments)); } catch (e) {} }
  function icoChat() { return '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-8.5 8.5 8.5 8.5 0 0 1-3.8-.9L3 21l1.9-5.7A8.38 8.38 0 0 1 4 11.5 8.5 8.5 0 0 1 12.5 3 8.38 8.38 0 0 1 21 11.5z"/></svg>'; }
  function icoCheck() { return '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6L9 17l-5-5"/></svg>'; }
  function icoSend() { return '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 2 11 13"/><path d="M22 2l-7 20-4-9-9-4 20-7z"/></svg>'; }

  function activeRoot() { return document.querySelector('.page.active') || document; }
  function pageId() { var p = document.querySelector('.page.active'); return p ? p.getAttribute('data-page') : (document.body.getAttribute('data-page') || 'index'); }
  function nameOf(sec) {
    var c = sec.querySelector('.eyebrow') || sec.querySelector('h1,h2,h3') || sec.querySelector('p');
    var t = c ? c.textContent.trim() : 'Sección';
    return (t.replace(/\s+/g, ' ').trim().slice(0, 46)) || 'Sección';
  }
  function listComments() {
    return Object.keys(comments).map(function (k) { return comments[k]; })
      .filter(function (c) { return c && c.text; })
      .sort(function (a, b) { return a.code < b.code ? -1 : 1; });
  }
  function asText() {
    var L = listComments();
    if (!L.length) return 'Sin comentarios.';
    return 'Feedback v.ia\n\n' + L.map(function (c) { return '[' + c.code + ' · ' + c.name + ']\n' + c.text; }).join('\n\n');
  }
  var sendBtn = document.createElement('button');
  sendBtn.className = 'fb-send';
  document.body.appendChild(sendBtn);

  var panel = document.createElement('div');
  panel.className = 'fb-panel';
  document.body.appendChild(panel);

  var pop = document.createElement('div');
  pop.className = 'fb-pop';
  pop.innerHTML = '<div class="bd"></div><div class="card"><h4></h4><div class="sub"></div>'
    + '<textarea placeholder="Escribe aquí todo lo que quieras sobre esta sección — puede ser tan largo como necesites…"></textarea>'
    + '<div class="fb-count"></div>'
    + '<div class="fb-actions"><button class="fb-a pri save">Guardar comentario</button>'
    + '<button class="fb-a sec cancel">Cancelar</button>'
    + '<button class="fb-a del del">Borrar</button></div></div>';
  document.body.appendChild(pop);
  function updCount(n) { pop.querySelector('.fb-count').textContent = n ? (n + ' caracteres · sin límite') : 'Escribe todo lo que necesites — sin límite de longitud.'; }
  pop.querySelector('textarea').addEventListener('input', function () { updCount(this.value.length); });

  var hint = document.createElement('div');
  hint.className = 'fb-hint';
  hint.innerHTML = '<div>Toca <b>Comentar</b> en cualquier sección para dejarnos tu opinión. '
    + 'Cuando termines, pulsa <b>Enviar feedback</b> abajo a la derecha.</div>'
    + '<button class="x" aria-label="Cerrar">&times;</button>';
  document.body.appendChild(hint);
  function hideHint() { hint.classList.add('hide'); try { localStorage.setItem(HINTKEY, '1'); } catch (e) {} }
  hint.querySelector('.x').addEventListener('click', hideHint);
  if (localStorage.getItem(HINTKEY) === '1' || listComments().length) hint.classList.add('hide');
  function tag() {
    var root = activeRoot(), pid = pageId(), code = PAGECODE[pid] || pid.toUpperCase();
    var secs = root.querySelectorAll('main > section'), i = 0;
    secs.forEach(function (sec) {
      i++;
      var id = code + '-' + (i < 10 ? '0' + i : i);
      sec.setAttribute('data-fb-sec', id);
      if (getComputedStyle(sec).position === 'static') sec.style.position = 'relative';
      var chip = sec.querySelector(':scope > .fb-chip');
      if (!chip) {
        chip = document.createElement('button');
        chip.className = 'fb-chip';
        sec.appendChild(chip);
        chip.addEventListener('click', function (ev) { ev.stopPropagation(); openPop(id, nameOf(sec), pid); });
      }
      var has = comments[id] && comments[id].text;
      chip.className = 'fb-chip' + (has ? ' done' : '');
      sec.classList.toggle('fb-done', !!has);
      chip.innerHTML = has ? (icoCheck() + '<span>Editar comentario</span>') : (icoChat() + '<span>Comentar</span>');
    });
    syncSend();
  }
  function openPop(id, name, pid) {
    current = { id: id, name: name, page: pid };
    pop.querySelector('h4').textContent = name;
    pop.querySelector('.sub').textContent = 'Sección ' + id;
    var ta = pop.querySelector('textarea');
    ta.value = (comments[id] && comments[id].text) || '';
    updCount(ta.value.length);
    pop.classList.add('open');
    ta.focus();
  }
  function closePop() { pop.classList.remove('open'); current = null; }
  pop.querySelector('.bd').addEventListener('click', closePop);
  pop.querySelector('.cancel').addEventListener('click', closePop);
  pop.querySelector('.save').addEventListener('click', function () {
    if (!current) return;
    var v = pop.querySelector('textarea').value.trim();
    if (v) comments[current.id] = { code: current.id, name: current.name, page: current.page, text: v, ts: Date.now() };
    else delete comments[current.id];
    persist(); tag(); renderPanel(); hideHint(); closePop();
  });
  pop.querySelector('.del').addEventListener('click', function () {
    if (!current) return; delete comments[current.id]; persist(); tag(); renderPanel(); closePop();
  });
  function renderPanel() {
    var L = listComments();
    var items = L.length
      ? L.map(function (c) {
          return '<div class="fb-item"><div class="c">' + c.code + ' · ' + esc(c.name) + '</div>'
            + '<div class="t">' + esc(c.text) + '</div>'
            + '<div style="margin-top:6px"><span class="lk" data-edit-lk="' + c.code + '">ver / editar</span>'
            + '<span class="lk" data-go="' + c.page + '" data-sec="' + c.code + '">ir a la sección</span>'
            + '<span class="lk" data-del="' + c.code + '">borrar</span></div></div>';
        }).join('')
      : '<div class="fb-empty">Aún no has comentado nada.<br>Toca <b style="color:#A6E115">Comentar</b> en cualquier sección para empezar.</div>';
    panel.innerHTML = '<div class="hd"><span>Mis comentarios (' + L.length + ')</span>'
      + '<span class="lk" data-close style="cursor:pointer">cerrar</span></div>'
      + '<div class="fb-list">' + items + '</div>'
      + '<div class="fb-foot"><button class="fb-a pri" data-act="send">Enviar a v.ia</button>'
      + '<button class="fb-a sec" data-act="copy">Copiar</button>'
      + '<button class="fb-a sec" data-act="txt">.txt</button>'
      + '<button class="fb-a sec" data-act="wa">WhatsApp</button>'
      + '<button class="fb-a del" data-act="clear">Borrar todo</button></div>';
  }

  panel.addEventListener('click', function (e) {
    var t = e.target;
    if (t.hasAttribute('data-close')) { panel.classList.remove('open'); return; }
    if (t.hasAttribute('data-del')) { delete comments[t.getAttribute('data-del')]; persist(); tag(); renderPanel(); return; }
    if (t.hasAttribute('data-edit-lk')) { var _c = comments[t.getAttribute('data-edit-lk')]; if (_c) openPop(_c.code, _c.name, _c.page); return; }
    if (t.hasAttribute('data-go')) { goTo(t.getAttribute('data-go'), t.getAttribute('data-sec')); return; }
    var act = t.getAttribute('data-act'); if (!act) return;
    if (act === 'send') {
      if (!listComments().length) { alert('Aún no hay comentarios para enviar.'); return; }
      var sbtn = t; sbtn.disabled = true; sbtn.textContent = 'Enviando…';
      fetch('https://formsubmit.co/ajax/bccbf98d51c6cca29509f3c0e2f4bded', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify({ _subject: 'Feedback v.ia — comentarios de la clienta', _template: 'table', message: asText() })
      }).then(function (r) { return r.json(); })
        .then(function () { sbtn.textContent = '¡Enviado! ✓ Gracias'; })
        .catch(function () { sbtn.disabled = false; sbtn.textContent = 'Reintentar envío'; });
      return;
    }
    if (act === 'copy') {
      if (navigator.clipboard) navigator.clipboard.writeText(asText());
      var o = t.textContent; t.textContent = 'Copiado ✓'; setTimeout(function () { t.textContent = o; }, 1500);
    } else if (act === 'wa') { window.open('https://wa.me/?text=' + encodeURIComponent(asText()), '_blank');
    } else if (act === 'mail') { window.location.href = 'mailto:?subject=' + encodeURIComponent('Feedback v.ia') + '&body=' + encodeURIComponent(asText());
    } else if (act === 'txt') {
      var b = new Blob([asText()], { type: 'text/plain' }); var a = document.createElement('a');
      a.href = URL.createObjectURL(b); a.download = 'feedback-via.txt'; a.click();
    } else if (act === 'clear') { if (confirm('¿Borrar todos los comentarios?')) { comments = {}; persist(); tag(); renderPanel(); } }
  });

  function goTo(pg, sc) {
    if (window.viaRoute) window.viaRoute(pg);
    tag();
    var el = document.querySelector('[data-fb-sec="' + sc + '"]');
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    panel.classList.remove('open');
  }

  function syncSend() {
    var n = listComments().length;
    sendBtn.innerHTML = icoSend() + '<span>Enviar feedback</span>' + (n ? '<span class="cnt">' + n + '</span>' : '');
  }
  sendBtn.addEventListener('click', function () { renderPanel(); panel.classList.toggle('open'); });
  tag();
  window.viaFeedbackRetag = tag;
})();
