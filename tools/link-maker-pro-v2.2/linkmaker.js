
/*! Link Maker PRO v2.2 (Inspire Wood) */
window.LinkMakerPro = (function(){
  const L = {};
  function elt(tag, attrs={}, ...kids){
    const e = document.createElement(tag);
    for(const [k,v] of Object.entries(attrs)){
      if(k==='class') e.className=v;
      else if(k==='style') e.setAttribute('style', v);
      else e.setAttribute(k, v);
    }
    for(const kid of kids){ if(typeof kid==='string') e.appendChild(document.createTextNode(kid)); else if(kid) e.appendChild(kid); }
    return e;
  }
  function currentBase(){
    // e.g., https://user.github.io/its-okay/ or relative /its-okay/
    const url = new URL(location.href);
    const path = url.pathname.endsWith('/') ? url.pathname : url.pathname.replace(/\/[^\/]*$/, '/');
    return (url.origin + path);
  }
  function buildUI(opts){
    const fab = elt('button', {id:'lmp-fab', title:'Link Maker PRO'}, 'Link Maker PRO');
    const modal = elt('div', {id:'lmp-modal'});
    const card = elt('div', {id:'lmp-card', style:'position:relative'});
    const close = elt('button', {id:'lmp-close', 'aria-label':'close'}, '×');
    close.addEventListener('click', ()=> modal.style.display='none');
    card.appendChild(close);
    card.appendChild(elt('h3', {}, 'Link Maker PRO v2.2'));
    card.appendChild(elt('div', {class:'lmp-small'}, opts.isHealing ? 'Mode: Healing page' : 'Mode: It’s Okay page'));

    // Rows
    const baseRow = elt('div', {class:'lmp-row'},
      elt('div', {}, elt('div', {class:'lmp-small'}, 'Base path'),
        elt('input', {id:'lmp-base', class:'lmp-input', value: currentBase()})),
      elt('div', {}, elt('div', {class:'lmp-small'}, 'Slug (optional)'),
        elt('input', {id:'lmp-slug', class:'lmp-input', value: (opts.defaultSlug||'io')})),
    );

    const queryRow = elt('div', {class:'lmp-row'});
    if(opts.isHealing){
      queryRow.append(
        elt('div', {}, elt('div', {class:'lmp-small'}, 'name'),
          elt('input', {id:'lmp-name', class:'lmp-input', placeholder:'Grace'})),
        elt('div', {}, elt('div', {class:'lmp-small'}, 'msg (optional)'),
          elt('input', {id:'lmp-msg', class:'lmp-input', placeholder:"It's okay."})),
        elt('div', {}, elt('div', {class:'lmp-small'}, 'daily'),
          elt('select', {id:'lmp-daily', class:'lmp-input'},
            elt('option', {value:''}, '—'),
            elt('option', {value:'daily', selected:'selected'}, 'daily')
          )),
      );
    } else {
      queryRow.append( elt('div', {}, elt('div', {class:'lmp-small'}, 'Parameters'), elt('div', {class:'lmp-small'}, '— (none)')) );
    }

    const actions = elt('div', {id:'lmp-actions'},
      elt('button', {id:'lmp-build', class:'lmp-btn primary'}, 'Build Link & Copy'),
      elt('button', {id:'lmp-qrbtn', class:'lmp-btn'}, 'Show QR'),
      elt('button', {id:'lmp-hideqr', class:'lmp-btn', style:'display:none'}, 'Hide QR'),
      elt('button', {id:'lmp-closebtn', class:'lmp-btn'}, 'Close')
    );

    const out = elt('div', {id:'lmp-out'});
    const qr = elt('div', {id:'lmp-qr'});

    // Assembly
    card.append(baseRow, queryRow, actions, out, qr);
    modal.appendChild(card);
    document.body.append(fab, modal);

    // Listeners
    fab.addEventListener('click', ()=>{ modal.style.display='flex'; out.textContent=''; qr.style.display='none'; });
    document.getElementById('lmp-closebtn').addEventListener('click', ()=> modal.style.display='none');
    document.getElementById('lmp-qrbtn').addEventListener('click', ()=>{
      if(!window.QRCode){
        alert('QR library not loaded. Check network or CDN.');
        return;
      }
      const link = buildLink();
      out.textContent = link;
      qr.style.display='flex';
      qr.innerHTML='';
      const c = elt('div', {});
      qr.appendChild(c);
      new QRCode(c, {text: link, width: 220, height: 220, correctLevel: QRCode.CorrectLevel.M});
    });
    document.getElementById('lmp-hideqr').addEventListener('click', ()=>{ qr.style.display='none'; });
    document.getElementById('lmp-build').addEventListener('click', async ()=>{
      const link = buildLink();
      out.textContent = link;
      try{ await navigator.clipboard.writeText(link); }catch(e){}
    });

    function buildLink(){
      const base = document.getElementById('lmp-base').value.trim() || currentBase();
      const slug = document.getElementById('lmp-slug').value.trim();
      let url = base.replace(/\/+$/,'/') + (slug? encodeURIComponent(slug) + '/' : '');
      if(opts.isHealing){
        const name = document.getElementById('lmp-name').value.trim();
        const msg  = document.getElementById('lmp-msg').value.trim();
        const daily= document.getElementById('lmp-daily').value;
        const u = new URL(url, location.origin);
        if(name) u.searchParams.set('name', name);
        if(daily==='daily' && !msg){ u.searchParams.set('mode','daily'); }
        else if(msg){ u.searchParams.set('msg', msg); }
        url = u.toString();
      }
      return url;
    }
  }

  L.init = function(opts={}){
    // Inject QRCode library from CDN for convenience
    const cdn = document.createElement('script');
    cdn.src = 'https://cdn.jsdelivr.net/npm/qrcodejs@1.0.0/qrcode.min.js';
    cdn.defer = true;
    document.head.appendChild(cdn);
    // Build UI on DOM ready
    if(document.readyState === 'loading'){
      document.addEventListener('DOMContentLoaded', ()=>buildUI(opts));
    }else{
      buildUI(opts);
    }
  };
  return L;
})();
