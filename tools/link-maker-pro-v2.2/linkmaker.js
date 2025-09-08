/*! Link Maker PRO v2.2 — page mode */
(function(){
  const s = document.createElement('script');
  s.src = 'https://cdn.jsdelivr.net/npm/qrcodejs@1.0.0/qrcode.min.js';
  s.defer = true;
  document.head.appendChild(s);
})();
window.LinkMakerPro = (function(){
  const L = {};
  function elt(tag, attrs={}, ...kids){
    const e = document.createElement(tag);
    for(const [k,v] of Object.entries(attrs)){
      if(k==='class') e.className=v; else if(k==='style') e.setAttribute('style', v); else e.setAttribute(k, v);
    }
    for(const kid of kids){ if(typeof kid==='string') e.appendChild(document.createTextNode(kid)); else if(kid) e.appendChild(kid); }
    return e;
  }
  function currentBase(){
    const url = new URL(location.href);
    const path = url.pathname.endsWith('/') ? url.pathname : url.pathname.replace(/\/[^\/]*$/, '/');
    return (url.origin + path);
  }
  function buildUI(opts){
    const app = document.getElementById('app');
    const card = elt('div', {id:'lmp-card'});
    card.appendChild(elt('h3', {}, 'Link Maker PRO v2.2'));
    const modeRow = elt('div', {class:'lmp-row'},
      elt('div', {}, elt('div', {class:'lmp-small'}, 'Mode'),
        (function(){ const sel = elt('select', {id:'lmp-mode', class:'lmp-input'},
            elt('option', {value:'io'}, 'It’s Okay'),
            elt('option', {value:'healing'}, 'Healing'));
          sel.value = opts.isHealing ? 'healing' : 'io'; return sel; })()
      )
    );
    const baseRow = elt('div', {class:'lmp-row'},
      elt('div', {}, elt('div', {class:'lmp-small'}, 'Base path'),
        elt('input', {id:'lmp-base', class:'lmp-input', value: currentBase()})),
      elt('div', {}, elt('div', {class:'lmp-small'}, 'Slug (optional)'),
        elt('input', {id:'lmp-slug', class:'lmp-input', value: (opts.defaultSlug||'io')})),
    );
    const queryRow = elt('div', {class:'lmp-row', id:'lmp-query'});
    app.append(modeRow, baseRow, queryRow);
    const actions = elt('div', {id:'lmp-actions'},
      elt('button', {id:'lmp-build', class:'lmp-btn primary'}, 'Build Link & Copy'),
      elt('button', {id:'lmp-qrbtn', class:'lmp-btn'}, 'Show QR')
    );
    const out = elt('div', {id:'lmp-out'});
    const qr = elt('div', {id:'lmp-qr'});
    app.append(actions, out, qr);

    function renderQuery(){
      queryRow.innerHTML='';
      const mode = document.getElementById('lmp-mode').value;
      if(mode==='healing'){
        queryRow.append(
          elt('div', {}, elt('div', {class:'lmp-small'}, 'name'),
            elt('input', {id:'lmp-name', class:'lmp-input', placeholder:'Grace'})),
          elt('div', {}, elt('div', {class:'lmp-small'}, 'msg (optional)'),
            elt('input', {id:'lmp-msg', class:'lmp-input', placeholder:"It's okay."})),
          elt('div', {}, elt('div', {class:'lmp-small'}, 'daily'),
            elt('select', {id:'lmp-daily', class:'lmp-input'},
              elt('option', {value:''}, '—'),
              elt('option', {value:'daily'}, 'daily')
            ))
        );
      } else {
        queryRow.append( elt('div', {}, elt('div', {class:'lmp-small'}, 'Parameters'), elt('div', {class:'lmp-small'}, '— (none)')) );
      }
    }
    function buildLink(){
      const base = document.getElementById('lmp-base').value.trim() || currentBase();
      const slug = document.getElementById('lmp-slug').value.trim();
      const mode = document.getElementById('lmp-mode').value;
      let url = base.replace(/\/+$/,'/') + (slug? encodeURIComponent(slug) + '/' : '');
      if(mode==='healing'){
        const name = document.getElementById('lmp-name')?.value.trim();
        const msg  = document.getElementById('lmp-msg')?.value.trim();
        const daily= document.getElementById('lmp-daily')?.value;
        const u = new URL(url, location.origin);
        if(name) u.searchParams.set('name', name);
        if(daily==='daily' && !msg){ u.searchParams.set('mode','daily'); }
        else if(msg){ u.searchParams.set('msg', msg); }
        url = u.toString();
      }
      return url;
    }
    document.getElementById('lmp-mode').addEventListener('change', renderQuery);
    renderQuery();
    document.getElementById('lmp-qrbtn').addEventListener('click', ()=>{
      if(!window.QRCode){ alert('QR lib loading... try again.'); return; }
      const link = buildLink(); out.textContent = link; qr.innerHTML=''; const c = document.createElement('div'); qr.appendChild(c); new QRCode(c, {text: link, width: 240, height: 240, correctLevel: QRCode.CorrectLevel.M});
    });
    document.getElementById('lmp-build').addEventListener('click', async ()=>{
      const link = buildLink(); out.textContent = link; try{ await navigator.clipboard.writeText(link); }catch(e){}
    });
  }
  L.init = function(opts={}){
    if(document.readyState==='loading'){ document.addEventListener('DOMContentLoaded', ()=>buildUI(opts)); } else { buildUI(opts); }
  };
  return L;
})();
