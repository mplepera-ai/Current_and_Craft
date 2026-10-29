/* Current & Craft marketing analytics: opt-in ONLY. No Google tag or pings before consent. */
(() => {
  "use strict";
  const ID="G-64ZL6JMETJ", KEY="cc-marketing-consent-v1";
  const live=["currentandcraft.net","www.currentandcraft.net"].includes(location.hostname);
  const titles={home:"Current & Craft | Company",games:"Current & Craft | Games & Apps",engineering:"Current & Craft | Engineering Software"};
  let allowed=false, loaded=false, current="", elapsed=0, engaged=false, last=performance.now();
  function choice(){try {let x=localStorage.getItem(KEY);return x==="yes"||x==="no"?x:null;}catch(_){return null;}}
  function remember(x){try{localStorage.setItem(KEY,x);}catch(_){}}
  function tag(){window.dataLayer.push(arguments);}
  function send(event,params={}){if(allowed && loaded)tag("event",event,params);}
  function start(){
    if(!live||allowed||!/^G-[A-Z0-9]+$/.test(ID))return;
    allowed=true;window.ccAnalyticsAllowed=true;
    if(loaded){tag("consent","update",{analytics_storage:"granted"});return;}
    loaded=true;window.dataLayer=window.dataLayer||[];window.gtag=tag;
    tag("consent","default",{analytics_storage:"denied",ad_storage:"denied",ad_user_data:"denied",ad_personalization:"denied"});
    tag("js",new Date());
    tag("consent","update",{analytics_storage:"granted"});
    tag("config",ID,{send_page_view:false,allow_google_signals:false,allow_ad_personalization_signals:false,
      page_referrer:"",page_location:location.origin+location.pathname});
    const s=document.createElement("script");s.async=true;
    s.src="https://www.googletagmanager.com/gtag/js?id="+encodeURIComponent(ID);
    document.head.appendChild(s);
    if(current)page(current,true);
  }
  function dropCookies(){
    document.cookie.split(";").forEach(pair=>{
      const n=pair.trim().split("=")[0];
      if(n!=="_ga"&&!/^_ga_[A-Za-z0-9_]+$/.test(n))return;
      [null,location.hostname,"."+location.hostname,".currentandcraft.net"].forEach(domain=>{
        document.cookie=n+"=; Max-Age=0; path=/; SameSite=Lax"+(domain?"; domain="+domain:"");
      });
    });
  }
  function stop(){
    allowed=false;window.ccAnalyticsAllowed=false;
    if(loaded){tag("consent","update",{analytics_storage:"denied"});window["ga-disable-"+ID]=true;}
    dropCookies();
    if(loaded)location.reload();
  }
  function page(name,force=false){
    if(!titles[name]||(!force&&current===name))return;
    current=name;elapsed=0;engaged=false;document.title=titles[name];
    send("page_view",{page_title:titles[name],page_location:location.origin+location.pathname,
      page_referrer:"",page_section:name});
  }
  window.ccTrackPage=page;window.ccAnalyticsAllowed=false;
  function decide(x){
    remember(x);if(x==="yes")start();else stop();
    const banner=document.getElementById("cc-consent");if(banner)banner.hidden=true;
  }
  function banner(){
    if(!live)return;
    const css=document.createElement("link");css.rel="stylesheet";css.href="assets/analytics-consent.css";
    document.head.appendChild(css);
    const box=document.createElement("aside");box.id="cc-consent";box.setAttribute("role","region");
    box.setAttribute("aria-label","Optional website analytics");
    const p=document.createElement("p");
    p.append("Optional analytics: We use Google Analytics to understand visits and product interest only if you allow it. No Google analytics tag loads before permission. Read our ");
    const a=document.createElement("a");a.href="privacy.html";a.textContent="Privacy Notice";p.append(a,".");
    box.appendChild(p);
    for(const [label,value] of [["Allow analytics","yes"],["Reject analytics","no"]]){
      const b=document.createElement("button");b.type="button";b.textContent=label;
      if(value==="no")b.className="reject";b.addEventListener("click",()=>decide(value));box.appendChild(b);
    }
    box.hidden=choice()!==null;document.body.appendChild(box);
    const footer=document.querySelector("footer");
    if(footer){
      const b=document.createElement("button");b.type="button";b.textContent="Analytics preferences";
      b.className="cc-analytics-preferences";b.addEventListener("click",()=>{box.hidden=false;});footer.appendChild(b);
    }
  }
  document.addEventListener("click",e=>{
    if(!allowed)return;
    const a=e.target.closest&&e.target.closest("a");if(!a)return;
    const u=new URL(a.href,location.href);
    const product=a.dataset.product||a.closest(".product")?.querySelector("h3")?.textContent.trim();
    const placement=a.dataset.placement||(a.closest("nav")?"header":a.closest(".category")?"category_card":"product_card");
    if(product&&u.protocol==="https:")send("product_click",{product_name:product,page_section:current,placement});
    else if(u.hostname==="auleengineering.com")send("partner_click",{partner_name:"Aule Engineering",page_section:current});
    else if(u.origin===location.origin)send("navigation_click",{page_section:current,placement});
    // Never transmit arbitrary URLs, query strings, customer content or form fields.
  });
  setInterval(()=>{
    const now=performance.now(),delta=now-last;last=now;
    if(allowed&&document.visibilityState==="visible"&&delta<2000&&!engaged){
      elapsed+=delta;if(elapsed>=30000){engaged=true;send("engaged_30_seconds",{page_section:current});}
    }
  },1000);
  document.addEventListener("visibilitychange",()=>{last=performance.now();});
  if(live&&choice()==="yes")start();
  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",banner,{once:true});else banner();
})();
window.ccTrackPage(document.body.dataset.page);
