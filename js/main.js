'use strict';
/* 連絡先を変更する場合は、この設定とindex.htmlの同じリンクを更新してください。
   instagramUrl: https://www.instagram.com/正式アカウント/
   contactUrl: 正式なフォームのhttps URL または mailto:正式メールアドレス
   未設定の間は、準備中の案内のみ表示します。外部埋め込み・追跡・通信はありません。 */
const SITE_CONFIG = Object.freeze({ instagramUrl: 'https://www.instagram.com/yubaonsen/?hl=ja', contactUrl: 'mailto:starboxco.ltd@gmail.com', contactLabel: 'メールで問い合わせる' });

document.documentElement.classList.add('js');
const toggle = document.querySelector('.menu-toggle');
const nav = document.querySelector('.site-nav');
const mobileQuery = window.matchMedia('(max-width: 1020px)');
function setMenu(open, returnFocus = false) {
  toggle.setAttribute('aria-expanded', String(open));
  toggle.querySelector('.menu-label').textContent = open ? '閉じる' : 'メニュー';
  nav.classList.toggle('is-open', open);
  document.body.classList.toggle('menu-open', open && mobileQuery.matches);
  if (returnFocus) toggle.focus();
}
toggle.addEventListener('click', () => setMenu(toggle.getAttribute('aria-expanded') !== 'true'));
nav.querySelectorAll('a').forEach(link => link.addEventListener('click', () => setMenu(false)));
mobileQuery.addEventListener('change', () => setMenu(false));
document.addEventListener('keydown', event => {
  if (toggle.getAttribute('aria-expanded') !== 'true') return;
  if (event.key === 'Escape') setMenu(false, true);
  if (event.key === 'Tab' && mobileQuery.matches) {
    const links = [...nav.querySelectorAll('a')];
    const last = links[links.length - 1];
    if (event.shiftKey && document.activeElement === toggle) { event.preventDefault(); last.focus(); }
    else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); toggle.focus(); }
  }
});
/* ギャラリー：JavaScriptなしでも元画像を開けます。 */
const dialog = document.querySelector('.lightbox');
if (typeof dialog.showModal === 'function') {
  document.querySelectorAll('.gallery-link').forEach(link => link.addEventListener('click', event => {
    event.preventDefault();
    const photo = dialog.querySelector('img');
    photo.src = link.href; photo.alt = link.querySelector('img').alt;
    dialog.querySelector('figcaption').textContent = link.dataset.caption;
    dialog.showModal(); document.body.classList.add('modal-open');
  }));
  dialog.querySelector('.lightbox-close').addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', event => { if (event.target === dialog) dialog.close(); });
  dialog.addEventListener('close', () => document.body.classList.remove('modal-open'));
}
/* URLの入力ミスで危険なスキームを設定しないための簡単な検証 */
function enableLink(url, linkId, pendingId, allowedProtocols) {
  if (!url) return;
  try {
    const parsed = new URL(url);
    if (!allowedProtocols.includes(parsed.protocol)) return;
    const link = document.getElementById(linkId);
    link.href = parsed.href; link.hidden = false;
    document.getElementById(pendingId).hidden = true;
  } catch (_) { /* 不正なURLは公開せず準備中の表示を維持 */ }
}
enableLink(SITE_CONFIG.instagramUrl, 'instagram-link', 'instagram-pending', ['https:']);
enableLink(SITE_CONFIG.contactUrl, 'contact-link', 'contact-pending', ['https:', 'mailto:']);
document.getElementById('contact-link').textContent = SITE_CONFIG.contactLabel;


/* トップ写真：7秒ごとに切替。手動操作・キーボード操作時は停止。
   動きを減らす設定では自動再生せず、タブ非表示・画面外ではタイマーを休止。 */
const HERO_INTERVAL = 7000;
const hero = document.querySelector('.hero');
const heroSlides = [...hero.querySelectorAll('.hero-slide')];
const heroControls = hero.querySelector('.hero-controls');
const heroPause = document.getElementById('hero-pause');
const heroCaption = document.getElementById('hero-caption');
const heroCounter = document.getElementById('hero-counter');
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
let heroIndex = 0;
let heroPaused = reducedMotion.matches;
let heroInView = true;
let heroTimer = null;
let heroRequest = 0;
function updateHeroPlayback() {
  window.clearInterval(heroTimer);
  heroTimer = null;
  heroPause.textContent = heroPaused ? '再生' : '一時停止';
  heroPause.setAttribute('aria-label', heroPaused ? '写真の自動切り替えを再生' : '写真の自動切り替えを一時停止');
  if (!heroPaused && !document.hidden && heroInView) {
    heroTimer = window.setInterval(() => showHeroSlide(heroIndex + 1), HERO_INTERVAL);
  }
}
async function showHeroSlide(index, manual = false) {
  const requested = ++heroRequest;
  const next = (index + heroSlides.length) % heroSlides.length;
  if (manual) { heroPaused = true; updateHeroPlayback(); }
  const image = heroSlides[next];
  try { if (image.decode) await image.decode(); } catch (_) { return; }
  if (requested !== heroRequest || !image.naturalWidth) return;
  heroIndex = next;
  heroSlides.forEach((slide, i) => {
    slide.classList.toggle('is-active', i === next);
    slide.setAttribute('aria-hidden', String(i !== next));
  });
  heroCaption.textContent = image.dataset.caption + ' ／ 営業当時の資料より';
  heroCounter.textContent = (next + 1) + ' / ' + heroSlides.length;
  heroCounter.setAttribute('aria-label', '全' + heroSlides.length + '枚中' + (next + 1) + '枚目');
  if (manual) document.getElementById('hero-announcement').textContent = image.dataset.caption + '、' + (next + 1) + '枚目';
}
document.getElementById('hero-prev').addEventListener('click', () => showHeroSlide(heroIndex - 1, true));
document.getElementById('hero-next').addEventListener('click', () => showHeroSlide(heroIndex + 1, true));
heroPause.addEventListener('click', () => { heroPaused = !heroPaused; updateHeroPlayback(); });
heroControls.addEventListener('focusin', event => {
  if (event.target.matches(':focus-visible') && !heroControls.contains(event.relatedTarget)) { heroPaused = true; updateHeroPlayback(); }
});
reducedMotion.addEventListener('change', () => { heroPaused = true; updateHeroPlayback(); });
document.addEventListener('visibilitychange', updateHeroPlayback);
if ('IntersectionObserver' in window) {
  new IntersectionObserver(entries => {
    heroInView = entries[0].isIntersecting;
    updateHeroPlayback();
  }, { threshold: 0.05 }).observe(hero);
}
heroControls.hidden = false;
updateHeroPlayback();
