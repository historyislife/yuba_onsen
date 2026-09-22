'use strict';
/* 正式な連絡先が決まったら、空文字を置き換えてください。
   instagramUrl: https://www.instagram.com/正式アカウント/
   contactUrl: 正式なフォームのhttps URL または mailto:正式メールアドレス
   未設定の間は、準備中の案内のみ表示します。外部埋め込み・追跡・通信はありません。 */
const SITE_CONFIG = Object.freeze({ instagramUrl: '', contactUrl: '', contactLabel: 'お問い合わせ' });

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
