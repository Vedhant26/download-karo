// script.js - shared utils and fetch helpers
function qs(sel){ return document.querySelector(sel) }
function qsa(sel){ return Array.from(document.querySelectorAll(sel)) }

async function postJSON(url, body){
  const r = await fetch(url, {
    method: 'POST',
    headers: {'Content-Type':'application/json'},
    body: JSON.stringify(body)
  });
  return r;
}

function downloadViaProxy(videoUrl, title){
  // Use proxy endpoint which streams the remote video
  const proxy = `/api/proxy?url=${encodeURIComponent(videoUrl)}&title=${encodeURIComponent(title)}`;
  const a = document.createElement('a');
  a.href = proxy;
  a.download = title || 'video';
  document.body.appendChild(a);
  a.click();
  a.remove();
}
