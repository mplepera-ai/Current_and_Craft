
/* GA4: production domains only. No collection on local or Render preview URLs. */
window.CC_ANALYTICS_CONFIG = {measurementId: 'G-64ZL6JMETJ', enabled: true};
(() => {
  const cfg = window.CC_ANALYTICS_CONFIG;
  const live = ['currentandcraft.net','www.currentandcraft.net'].includes(location.hostname);
  const enabled = cfg.enabled && /^G-[A-Z0-9]+$/.test(cfg.measurementId) && live;
  window.dataLayer = window.dataLayer || [];
  function tag(){window.dataLayer.push(arguments);}
  function send(name, params={}){if(enabled)tag('event',name,params);}
  let currentPage = '', elapsed = 0, engaged = false;
  const titles={home:'Current & Craft | Company',games:'Current & Craft | Games & Apps',engineering:'Current & Craft | Engineering Software'};
  if(enabled){
    window.gtag=tag;
    tag('js',new Date());
    tag('config',cfg.measurementId,{send_page_view:false,allow_google_signals:false,allow_ad_personalization_signals:false});
    const script=document.createElement('script');script.async=true;
    script.src='https://www.googletagmanager.com/gtag/js?id='+cfg.measurementId;
    document.head.appendChild(script);
  }
  window.ccTrackPage = page => {
    if(page===currentPage)return;
    currentPage=page; elapsed=0; engaged=false;
    document.title=titles[page];
    // Exclude URL queries and arbitrary fragments from event data.
    send('page_view',{page_title:titles[page],page_location:location.origin+location.pathname,page_section:page});
  };
  document.addEventListener('click',event=>{
    const link=event.target.closest('a');if(!link)return;
    const target=new URL(link.href,location.href);
    const product=link.dataset.product || link.closest('.product')?.querySelector('h3')?.textContent.trim();
    const placement=link.dataset.placement || (link.closest('nav')?'header':link.closest('.category')?'category_card':'product_card');
    if(product && target.protocol==='https:')send('product_click',{product_name:product,page_section:currentPage,placement,link_url:target.origin+target.pathname});
    else if(target.hostname==='auleengineering.com')send('partner_click',{partner_name:'Aule Engineering Consultants, LLC',page_section:currentPage});
    else if(target.origin===location.origin)send('navigation_click',{destination:target.pathname+target.hash,page_section:currentPage,placement});
  });
  // Count actual visible viewing time, rather than a background tab's timer.
  let last=performance.now();
  setInterval(()=>{const now=performance.now();const delta=now-last;last=now;
    if(document.visibilityState==='visible' && delta<2000 && !engaged){elapsed+=delta;
      if(elapsed>=30000){engaged=true;send('engaged_30_seconds',{page_section:currentPage});}}
  },1000);
  document.addEventListener('visibilitychange',()=>{last=performance.now();});
})();

window.ccTrackPage(document.body.dataset.page);
