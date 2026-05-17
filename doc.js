/* 약관·개인정보 문서 — NAS 서버에서 Markdown 원문을 동적으로 받아 렌더.
   서버(legal/)를 갱신하면 이 페이지와 앱 모두에 즉시 반영된다. */
(function () {
  'use strict';
  var NAS = 'https://bgamer.ydsnas.synology.me/legal/';
  var UI = {
    ko: { terms: '이용약관', privacy: '개인정보처리방침', licenses: '오픈소스 라이선스', support: '고객지원',
          updated: '최종 개정', loadErr: '문서를 불러올 수 없습니다. 잠시 후 다시 시도해 주세요.' },
    en: { terms: 'Terms of Service', privacy: 'Privacy Policy', licenses: 'Open-Source Licenses', support: 'Support',
          updated: 'Last updated', loadErr: 'Could not load the document. Please try again later.' },
    ja: { terms: '利用規約', privacy: 'プライバシーポリシー', licenses: 'オープンソースライセンス', support: 'サポート',
          updated: '最終改定', loadErr: '文書を読み込めませんでした。しばらくしてから再度お試しください。' }
  };
  var DOC = window.DOC_TYPE || 'terms';   // terms.html / privacy.html / licenses.html 에서 미리 지정

  function getLang() {
    var q = new URLSearchParams(location.search).get('lang');
    if (['ko', 'en', 'ja'].indexOf(q) >= 0) return q;
    try { var s = localStorage.getItem('aos_lang'); if (s) return s; } catch (e) {}
    var n = (navigator.language || 'en').slice(0, 2);
    return ['ko', 'en', 'ja'].indexOf(n) >= 0 ? n : 'en';
  }
  var lang = getLang();

  function setLang(l) {
    lang = l;
    try { localStorage.setItem('aos_lang', l); } catch (e) {}
    render();
  }

  function render() {
    var ui = UI[lang];
    var label = DOC === 'terms' ? ui.terms : (DOC === 'privacy' ? ui.privacy : ui.licenses);
    document.documentElement.lang = lang;
    document.title = 'Age of Sail — ' + label;
    document.getElementById('page-sub').textContent = label;

    var lb = document.getElementById('langbar');
    lb.innerHTML = '';
    [['ko', '한국어'], ['en', 'English'], ['ja', '日本語']].forEach(function (p) {
      var b = document.createElement('button');
      b.textContent = p[1];
      if (p[0] === lang) b.className = 'active';
      b.onclick = function () { setLang(p[0]); };
      lb.appendChild(b);
    });

    document.getElementById('nav').innerHTML =
      '<a href="index.html">' + ui.support + '</a>' +
      '<a href="terms.html">' + ui.terms + '</a>' +
      '<a href="privacy.html">' + ui.privacy + '</a>' +
      '<a href="licenses.html">' + ui.licenses + '</a>';

    loadDoc();
  }

  function loadDoc() {
    var docEl = document.getElementById('doc');
    var metaEl = document.getElementById('doc-meta');
    docEl.innerHTML = '<div class="loading">…</div>';
    metaEl.textContent = '';
    var bust = '?t=' + Date.now();

    fetch(NAS + DOC + '_' + lang + '.md' + bust)
      .then(function (r) { if (!r.ok) throw 0; return r.text(); })
      .then(function (md) { docEl.innerHTML = marked.parse(md); })
      .catch(function () {
        docEl.innerHTML = '<div class="error">' + UI[lang].loadErr +
          '<br><a href="mailto:dev.yds25@gmail.com">dev.yds25@gmail.com</a></div>';
      });

    fetch(NAS + 'meta.json' + bust)
      .then(function (r) { return r.json(); })
      .then(function (m) {
        var d = m[DOC];
        if (d) metaEl.textContent = UI[lang].updated + ': ' + d.updated + '  (v' + d.version + ')';
      })
      .catch(function () {});
  }

  render();
})();
