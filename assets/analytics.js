/* Public Current & Craft site. Basic, non-advertising GA4 page views only.
 * No overlays, banners, custom click events or personal data.
 * Visitors may opt out on the linked privacy page. */
(() => {
  "use strict";
  const ID="G-64ZL6JMETJ", KEY="cc-analytics-optout-v2";
  const live=["currentandcraft.net","www.currentandcraft.net"].includes(location.hostname);
  const titles={home:"Current & Craft | Company",games:"Current & Craft | Games & Apps",
                engineering:"Current & Craft | Engineering Software"};
  let allowed=false, loaded=false, pageName="";
  function saved(){
    try{
      return localStorage.getItem(KEY)==="no" ||
             (localStorage.getItem(KEY)!=="yes" &&
              localStorage.getItem("cc-marketing-consent-v1")==="no");
    }catch(_){return false;}
  }
  function store(value){try{localStorage.setItem(KEY,value);}catch(_){}}
  function gtag(){window.dataLayer.push(arguments);}
  function sendPage(){
    if(!allowed || !loaded || !titles[pageName]) return;
    gtag("event","page_view",{page_title:titles[pageName],
      page_location:location.origin+location.pathname,page_referrer:""});
  }
  function begin(){
    if(!live || saved() || allowed) return;
    allowed=true; window.ccAnalyticsAllowed=true;
    if(loaded){
      window["ga-disable-"+ID]=false;
      gtag("consent","update",{analytics_storage:"granted"});
      sendPage(); return;
    }
    loaded=true;window.dataLayer=window.dataLayer||[];window.gtag=gtag;
    gtag("consent","default",{analytics_storage:"granted",ad_storage:"denied",
      ad_user_data:"denied",ad_personalization:"denied"});
    gtag("js",new Date());
    gtag("config",ID,{send_page_view:false,allow_google_signals:false,
      allow_ad_personalization_signals:false,cookie_expires:2592000,
      page_location:location.origin+location.pathname,page_referrer:""});
    const script=document.createElement("script");
    script.async=true;
    script.src="https://www.googletagmanager.com/gtag/js?id="+encodeURIComponent(ID);
    document.head.appendChild(script);
    sendPage();
  }
  function clearCookies(){
    document.cookie.split(";").forEach(pair=>{
      const n=pair.trim().split("=")[0];
      if(n!=="_ga" && !/^_ga_[A-Za-z0-9_]+$/.test(n))return;
      [null,location.hostname,"."+location.hostname,".currentandcraft.net"].forEach(domain=>{
        document.cookie=n+"=; Max-Age=0; path=/; SameSite=Lax"+(domain?"; domain="+domain:"");
      });
    });
  }
  function optOut(){
    store("no");allowed=false;window.ccAnalyticsAllowed=false;
    if(loaded){window["ga-disable-"+ID]=true;gtag("consent","update",{analytics_storage:"denied"});}
    clearCookies();
    if(loaded)location.reload();
  }
  function choose(value){
    if(value==="no"){optOut();}
    else {
      store("yes");begin();
      const status=document.getElementById("cc-analytics-status");
      if(status)status.textContent="Basic website traffic analytics: on";
    }
    const status=document.getElementById("cc-analytics-status");
    if(status && value==="no")status.textContent="Basic website traffic analytics: off";
  }
  window.ccTrackPage=name=>{
    if(!titles[name]) return;
    if(pageName===name)return;
    pageName=name;document.title=titles[name];
    sendPage();
  };
  window.ccAnalyticsAllowed=false;
  function settings(){
    const accept=document.getElementById("cc-analytics-accept");
    const reject=document.getElementById("cc-analytics-reject");
    const status=document.getElementById("cc-analytics-status");
    if(status)status.textContent=saved()?
      "Basic website traffic analytics: off":"Basic website traffic analytics: on";
    if(accept)accept.addEventListener("click",()=>choose("yes"));
    if(reject)reject.addEventListener("click",()=>choose("no"));
  }
  if(live && !saved())begin();
  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",settings,{once:true});
  else settings();
})();
window.ccTrackPage(document.body.dataset.page);
