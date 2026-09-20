(()=>{
'use strict';
const dvId=id=>document.getElementById(id);

const dvIconMoon='<svg class="dv-icon" viewBox="0 0 24 24"><path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"/></svg>';
const dvIconSun='<svg class="dv-icon" viewBox="0 0 24 24"><circle cx="12" cy="12" r="4.5"/><g stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M12 2v2.5M12 19.5V22M4.2 4.2l1.8 1.8M18 18l1.8 1.8M2 12h2.5M19.5 12H22M4.2 19.8L6 18M18 6l1.8-1.8"/></g></svg>';
const dvIconDownload='<svg class="dv-icon" viewBox="0 0 24 24"><path d="M12 3v10.6l3.3-3.3 1.4 1.4L12 17.3l-4.7-5.6 1.4-1.4L12 13.6V3zM5 19h14v2H5z"/></svg>';

/* ---------- Font readiness ---------- */
const dvFontReady=async()=>{
 if(document.fonts&&document.fonts.ready){
  try{await document.fonts.ready;}catch{}
  try{
   await Promise.all([
    document.fonts.load('400 19px Roboto'),
    document.fonts.load('700 19px Roboto'),
    document.fonts.load('italic 400 19px Roboto'),
    document.fonts.load('italic 700 19px Roboto')
   ]);
  }catch{}
 }
};

/* ---------- Color parsing (hex or CSS color name) ---------- */
const dvColorProbe=document.createElement('div');
dvColorProbe.style.display='none';
document.body.appendChild(dvColorProbe);
const dvRgbToHex=rgb=>{
 const m=rgb.match(/\d+/g);
 if(!m)return null;
 return '#'+m.slice(0,3).map(n=>(+n).toString(16).padStart(2,'0')).join('');
};
const dvResolveColor=input=>{
 const v=(input||'').trim();
 if(!v)return null;
 dvColorProbe.style.color='';
 dvColorProbe.style.color=v;
 if(!dvColorProbe.style.color)return null;
 const computed=getComputedStyle(dvColorProbe).color;
 return dvRgbToHex(computed);
};

/* ---------- Center Modal ---------- */
const dvModalWrap=dvId('dvModalWrap');
const dvModalTitle=dvId('dvModalTitle');
const dvModalMessage=dvId('dvModalMessage');
const dvModalOk=dvId('dvModalOk');
const dvModalCancel=dvId('dvModalCancel');
const dvModalBackdrop=dvId('dvModalBackdrop');
const dvModalActions=dvId('dvModalActions');

let dvModalResolve=null;

const dvModalOpen=(title,message,{okText='OK',cancelText='Cancel',confirm=false}={})=>{
 return new Promise(resolve=>{
  dvModalResolve=resolve;
  dvModalTitle.textContent=title;
  dvModalMessage.textContent=message;
  dvModalOk.textContent=okText;
  dvModalCancel.textContent=cancelText;
  dvModalCancel.style.display=confirm?'':'none';
  dvModalOk.className='dv-btn '+(confirm?'dv-fill-danger':'dv-primary');
  dvModalCancel.className='dv-btn dv-fill-black';
  dvModalActions.classList.toggle('single',!confirm);
  dvModalWrap.classList.add('open');
  dvModalOk.focus();
 });
};

const dvModalClose=(result)=>{
 dvModalWrap.classList.remove('open');
 if(dvModalResolve){dvModalResolve(result);dvModalResolve=null;}
};

dvModalOk.onclick=()=>dvModalClose(true);
dvModalCancel.onclick=()=>dvModalClose(false);
dvModalBackdrop.onclick=()=>dvModalClose(false);
document.addEventListener('keydown',e=>{
 if(e.key==='Escape'&&dvModalWrap.classList.contains('open'))dvModalClose(false);
});

const dvConfirm=(message,title='Confirm')=>dvModalOpen(title,message,{confirm:true});
const dvNotify=(message,title='Notice')=>dvModalOpen(title,message,{confirm:false,okText:'OK'});

/* ---------- Centered toast (replaces inline status banner) ---------- */
const dvToastEl=dvId('dvToast');
let dvToastTimer=null;
const dvShow=(text,type)=>{
 clearTimeout(dvToastTimer);
 dvToastEl.textContent=text;
 dvToastEl.className='dv-toast show'+(type?' dv-'+type:'');
 dvToastTimer=setTimeout(()=>{dvToastEl.classList.remove('show');},2200);
};
const dvClear=()=>{dvToastEl.classList.remove('show');};

/* ---------- Theme ---------- */
const dvThemeBtn=dvId('dvThemeBtn');
const dvThemeMeta=dvId('dvThemeMeta');
const dvDarkSwitch=dvId('dvDarkSwitch');
const dvApplyTheme=t=>{
 document.documentElement.setAttribute('data-dv-theme',t);
 dvThemeBtn.innerHTML=t==='dark'?dvIconSun:dvIconMoon;
 dvThemeMeta.setAttribute('content',t==='dark'?'#1a1d23':'#1877F2');
 dvDarkSwitch.classList.toggle('on',t==='dark');
 dvDarkSwitch.setAttribute('aria-checked',t==='dark');
 try{localStorage.setItem('dv-theme',t);}catch{}
};
const dvInitTheme=()=>{
 let saved='';
 try{saved=localStorage.getItem('dv-theme')||'';}catch{}
 if(!saved){
  saved=window.matchMedia&&window.matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light';
 }
 dvApplyTheme(saved);
};
const dvToggleTheme=()=>{
 const cur=document.documentElement.getAttribute('data-dv-theme')||'light';
 dvApplyTheme(cur==='dark'?'light':'dark');
};
dvThemeBtn.onclick=dvToggleTheme;
dvDarkSwitch.onclick=dvToggleTheme;
dvInitTheme();

/* ---------- Sidebars ---------- */
const dvInfoMenu=dvId('dvInfoMenu'), dvHamburgerBtn=dvId('dvHamburgerBtn');
const dvInfoList=dvId('dvInfoList'), dvInfoBackBtn=dvId('dvInfoBackBtn'), dvInfoCloseBtn=dvId('dvInfoCloseBtn'), dvInfoMenuTitle=dvId('dvInfoMenuTitle');
const dvInfoPages=document.querySelectorAll('.dv-info-page');

const dvShowInfoList=()=>{
 dvInfoList.classList.remove('dv-hidden');
 dvInfoPages.forEach(p=>p.classList.add('dv-hidden'));
 dvInfoBackBtn.classList.add('dv-hidden');
 dvInfoMenuTitle.textContent='Menu';
};
const dvShowInfoPage=key=>{
 const page=document.querySelector('.dv-info-page[data-page="'+key+'"]');
 if(!page)return;
 dvInfoList.classList.add('dv-hidden');
 dvInfoPages.forEach(p=>p.classList.add('dv-hidden'));
 page.classList.remove('dv-hidden');
 dvInfoBackBtn.classList.remove('dv-hidden');
 dvInfoMenuTitle.textContent=page.querySelector('h3')?page.querySelector('h3').textContent:'Menu';
 dvInfoMenu.querySelector('.dv-fullmenu-body').scrollTop=0;
};
const dvOpenMenu=()=>{dvShowInfoList();dvInfoMenu.classList.add('open');dvHamburgerBtn.setAttribute('aria-expanded','true');};
const dvCloseMenu=()=>{dvInfoMenu.classList.remove('open');dvHamburgerBtn.setAttribute('aria-expanded','false');dvHamburgerBtn.focus();};
dvHamburgerBtn.onclick=dvOpenMenu;
dvInfoCloseBtn.onclick=dvCloseMenu;
dvId('dvInfoExit').onclick=dvCloseMenu;
dvInfoBackBtn.onclick=dvShowInfoList;
dvInfoList.querySelectorAll('.dv-side-item[data-page]').forEach(btn=>{
 btn.onclick=()=>dvShowInfoPage(btn.dataset.page);
});
document.addEventListener('keydown',e=>{
 if(e.key==='Escape'&&dvInfoMenu.classList.contains('open'))dvCloseMenu();
});

const dvSettingsSidebar=dvId('dvSettingsSidebar'), dvMenuBtn=dvId('dvMenuBtn'), dvSettingsCloseBtn=dvId('dvSettingsCloseBtn');
const dvOpenSettings=()=>{dvSettingsSidebar.classList.add('open');dvMenuBtn.setAttribute('aria-expanded','true');dvSettingsCloseBtn.focus();};
const dvCloseSettings=()=>{dvSettingsSidebar.classList.remove('open');dvMenuBtn.setAttribute('aria-expanded','false');};
dvMenuBtn.onclick=dvOpenSettings;
dvSettingsCloseBtn.onclick=dvCloseSettings;
dvId('dvSettingsBackdrop').onclick=dvCloseSettings;

document.addEventListener('keydown',e=>{
 if(e.key!=='Escape')return;
 if(dvSettingsSidebar.classList.contains('open'))dvCloseSettings();
});

/* ---------- Tabs / bottom nav ---------- */
const dvViewImage=dvId('dvViewImage'), dvViewBanner=dvId('dvViewBanner');
const dvNavImage=dvId('dvNavImage'), dvNavBanner=dvId('dvNavBanner'), dvNavSettings=dvId('dvNavSettings');
const dvSwitchTab=which=>{
 const isImg=which==='image';
 dvNavImage.classList.toggle('active',isImg);
 dvNavBanner.classList.toggle('active',!isImg);
 dvViewImage.classList.toggle('dv-hidden',!isImg);
 dvViewBanner.classList.toggle('dv-hidden',isImg);
 dvClear();
 window.scrollTo({top:0,behavior:'smooth'});
 if(!isImg) requestAnimationFrame(()=>dvRenderItems());
};
dvNavImage.onclick=()=>dvSwitchTab('image');
dvNavBanner.onclick=()=>dvSwitchTab('banner');
dvNavSettings.onclick=dvOpenSettings;

/* ============ IMAGE TAB ============ */
const dvDrop=dvId('dvDrop'), dvFile=dvId('dvFile'), dvEditor=dvId('dvEditor'), dvPreview=dvId('dvPreview'),
 dvInfo=dvId('dvInfo'), dvName=dvId('dvName'), dvFormat=dvId('dvFormat'), dvWidth=dvId('dvWidth'),
 dvQuality=dvId('dvQuality'),
 dvProcess=dvId('dvProcess'), dvRemove=dvId('dvRemove'), dvResult=dvId('dvResult'),
 dvResultPreview=dvId('dvResultPreview'), dvResultInfo=dvId('dvResultInfo');

const dvImgState={file:null,sourceUrl:'',loaderUrl:'',resultBlob:null,resultUrl:'',resultName:'',busy:false};

const dvFmtSize=b=>{
 if(!b) return '0 B';
 const u=['B','KB','MB','GB'];
 const i=Math.min(Math.floor(Math.log(b)/Math.log(1024)),u.length-1);
 return (b/Math.pow(1024,i)).toFixed(i?2:0)+' '+u[i];
};
const dvCleanName=n=>{
 const c=n.replace(/\.[^/.]+$/,'').replace(/[<>:"/\\|?*\x00-\x1F]/g,'')
  .replace(/\s+/g,'-').replace(/-+/g,'-').replace(/^-+|-+$/g,'').trim();
 return c||'image';
};
const dvRevoke=u=>{if(u)URL.revokeObjectURL(u);};

const dvSelectFile=async f=>{
 if(!f)return;
 if(!f.type.startsWith('image/')){dvShow('Please select a valid image.','error');return;}
 dvRevoke(dvImgState.sourceUrl);
 dvImgState.sourceUrl=URL.createObjectURL(f);
 dvImgState.file=f;
 dvPreview.src=dvImgState.sourceUrl;
 dvName.value=dvCleanName(f.name);
 try{
  const bmp=await createImageBitmap(f,{imageOrientation:'from-image'});
  dvInfo.textContent=f.name+' - '+dvFmtSize(f.size)+' - '+bmp.width+'x'+bmp.height+' - '+(f.type||'unknown');
  bmp.close();
 }catch{
  dvInfo.textContent=f.name+' - '+dvFmtSize(f.size)+' - '+(f.type||'unknown');
 }
 dvEditor.classList.remove('dv-hidden');
 dvResult.classList.add('dv-hidden');
 dvShow('Image selected.','success');
 dvEditor.scrollIntoView({behavior:'smooth',block:'start'});
};

dvDrop.onclick=()=>dvFile.click();
dvFile.onchange=e=>{const f=e.target.files[0];dvSelectFile(f);dvFile.value='';};

const dvClampNum=(el,min,max)=>{
 let v=parseInt(el.value,10);
 if(isNaN(v))v=min;
 v=Math.max(min,Math.min(max,v));
 el.value=v;
 return v;
};
const dvSyncPresets=()=>{
 const w=+dvWidth.value;
 document.querySelectorAll('.dv-preset').forEach(p=>p.classList.toggle('active',+p.dataset.w===w));
};
dvWidth.oninput=()=>dvSyncPresets();
dvWidth.onchange=()=>{dvClampNum(dvWidth,100,2400);dvSyncPresets();};
dvId('dvWidthUp').onclick=()=>{dvWidth.value=dvClampNum(dvWidth,100,2400)+50;dvClampNum(dvWidth,100,2400);dvSyncPresets();};
dvId('dvWidthDown').onclick=()=>{dvWidth.value=dvClampNum(dvWidth,100,2400)-50;dvClampNum(dvWidth,100,2400);dvSyncPresets();};
document.querySelectorAll('.dv-preset').forEach(p=>p.onclick=()=>{
 dvWidth.value=p.dataset.w;dvSyncPresets();
});
dvQuality.onchange=()=>dvClampNum(dvQuality,40,100);
dvId('dvQualityUp').onclick=()=>{dvQuality.value=dvClampNum(dvQuality,40,100)+5;dvClampNum(dvQuality,40,100);};
dvId('dvQualityDown').onclick=()=>{dvQuality.value=dvClampNum(dvQuality,40,100)-5;dvClampNum(dvQuality,40,100);};

let dvDragDepth=0;
['dragenter','dragover'].forEach(ev=>dvDrop.addEventListener(ev,e=>{
 e.preventDefault();
 if(ev==='dragenter')dvDragDepth++;
 dvDrop.classList.add('over');
}));
['dragleave','drop'].forEach(ev=>dvDrop.addEventListener(ev,e=>{
 e.preventDefault();
 if(ev==='dragleave'){dvDragDepth--;if(dvDragDepth<=0){dvDragDepth=0;dvDrop.classList.remove('over');}}
 else{dvDragDepth=0;dvDrop.classList.remove('over');}
}));
dvDrop.addEventListener('drop',e=>{const f=e.dataTransfer.files[0];if(f)dvSelectFile(f);});

dvFormat.onchange=()=>{
 const lossy = dvFormat.value==='image/jpeg'||dvFormat.value==='image/webp'||
  (dvFormat.value==='original'&&dvImgState.file&&/jpe?g|webp/.test(dvImgState.file.type));
 dvId('dvQualityField').style.opacity=lossy?'1':'.45';
 dvQuality.disabled=!lossy;
};

const dvLoadBitmap=async f=>{
 try{return await createImageBitmap(f,{imageOrientation:'from-image'});}
 catch{
  return new Promise((resolve,reject)=>{
   const img=new Image();
   dvImgState.loaderUrl=URL.createObjectURL(f);
   img.onload=()=>{dvRevoke(dvImgState.loaderUrl);dvImgState.loaderUrl='';resolve(img);};
   img.onerror=()=>{dvRevoke(dvImgState.loaderUrl);dvImgState.loaderUrl='';reject(new Error('Unable to read the image.'));};
   img.src=dvImgState.loaderUrl;
  });
 }
};

/* Hardcoded, non-toggleable watermark for exported/processed output */
const dvApplyWatermark=(ctx,w,h)=>{
 const mark='DV';
 const size=Math.max(18,Math.round(Math.min(w,h)*0.05));
 ctx.save();
 ctx.font='700 '+size+'px Roboto, sans-serif';
 ctx.fillStyle='rgba(255,255,255,0.16)';
 ctx.strokeStyle='rgba(0,0,0,0.10)';
 ctx.lineWidth=Math.max(1,size*0.04);
 ctx.textBaseline='middle';
 ctx.translate(w/2,h/2);
 ctx.rotate(-Math.PI/8);
 const stepX=size*4.2, stepY=size*3.2;
 const cols=Math.ceil((w+h)/stepX)+2, rows=Math.ceil((w+h)/stepY)+2;
 for(let r=-rows;r<=rows;r++){
  for(let c=-cols;c<=cols;c++){
   const x=c*stepX+(r%2?stepX/2:0);
   const y=r*stepY;
   ctx.strokeText(mark,x,y);
   ctx.fillText(mark,x,y);
  }
 }
 ctx.restore();
};

const dvFinishImage=(src,w,h,type)=>{
 if(src&&src.close)src.close();
 dvRevoke(dvImgState.resultUrl);
 dvImgState.resultUrl=URL.createObjectURL(dvImgState.resultBlob);
 dvResultPreview.src=dvImgState.resultUrl;
 dvResultInfo.textContent=w+' x '+h+' pixels - '+dvFmtSize(dvImgState.resultBlob.size)+' - '+type;
 dvResult.classList.remove('dv-hidden');
 dvShow('Image prepared successfully.','success');
 dvResult.scrollIntoView({behavior:'smooth',block:'start'});
};

const dvProcessImage=async()=>{
 if(!dvImgState.file){dvShow('Select an image first.','error');return;}
 if(dvImgState.busy)return;
 dvImgState.busy=true;dvProcess.disabled=true;dvRemove.disabled=true;
 dvShow('Preparing image...');
 try{
  const src=await dvLoadBitmap(dvImgState.file);
  const nW=src.width||src.naturalWidth, nH=src.height||src.naturalHeight;
  let type=dvFormat.value;
  if(type==='original')type=dvImgState.file.type||'image/png';
  if(!/^image\/(png|jpeg|webp)$/.test(type))type='image/png';
  const maxW=dvClampNum(dvWidth,100,2400);
  let w=nW,h=nH;
  if(nW>maxW){h=Math.round(h*(maxW/w));w=maxW;}
  const canvas=document.createElement('canvas');
  canvas.width=w;canvas.height=h;
  const ctx=canvas.getContext('2d');
  if(type==='image/jpeg'){ctx.fillStyle='#fff';ctx.fillRect(0,0,w,h);}
  ctx.drawImage(src,0,0,w,h);
  dvApplyWatermark(ctx,w,h);
  const blob=await new Promise(res=>canvas.toBlob(res,type,dvClampNum(dvQuality,40,100)/100));
  if(!blob)throw new Error('Unable to create the image.');
  dvImgState.resultBlob=blob;
  const ext=type==='image/jpeg'?'jpg':type==='image/webp'?'webp':'png';
  dvImgState.resultName=dvCleanName(dvName.value)+'.'+ext;
  dvFinishImage(src,w,h,type);
 }catch(err){dvShow(err.message||'Image processing failed.','error');}
 finally{dvImgState.busy=false;dvProcess.disabled=false;dvRemove.disabled=false;}
};
dvProcess.onclick=dvProcessImage;

const dvResetImage=()=>{
 dvRevoke(dvImgState.sourceUrl);dvRevoke(dvImgState.loaderUrl);dvRevoke(dvImgState.resultUrl);
 dvImgState.sourceUrl='';dvImgState.loaderUrl='';dvImgState.resultUrl='';
 dvImgState.file=null;dvImgState.resultBlob=null;dvImgState.resultName='';
 dvFile.value='';dvName.value='';
 dvPreview.removeAttribute('src');dvResultPreview.removeAttribute('src');
 dvEditor.classList.add('dv-hidden');dvResult.classList.add('dv-hidden');
 dvClear();
 dvWidth.value=1200;dvSyncPresets();
 dvQuality.value=90;
 dvFormat.value='original';dvFormat.dispatchEvent(new Event('change'));
};
dvRemove.onclick=dvResetImage;

const dvCopyAsDataUrl=async()=>{
 if(!dvImgState.resultBlob){dvShow('Prepare an image first.','error');return;}
 dvShow('Encoding...');
 try{
  const dataUrl=await new Promise((resolve,reject)=>{
   const r=new FileReader();
   r.onload=()=>resolve(r.result);
   r.onerror=()=>reject(new Error('Encoding failed.'));
   r.readAsDataURL(dvImgState.resultBlob);
  });
  if(navigator.clipboard&&window.ClipboardItem){
   try{await navigator.clipboard.writeText(dataUrl);dvShow('Data URL copied.','success');return;}catch{}
  }
  const ta=document.createElement('textarea');
  ta.value=dataUrl;ta.style.position='fixed';ta.style.opacity='0';
  document.body.appendChild(ta);ta.select();
  const ok=document.execCommand('copy');ta.remove();
  dvShow(ok?'Data URL copied.':'Long-press to copy manually.',ok?'success':'');
 }catch(err){dvShow(err.message||'Copy failed.','error');}
};

const dvDownloadImage=()=>{
 if(!dvImgState.resultBlob){dvShow('Prepare an image first.','error');return;}
 const a=document.createElement('a');
 a.href=dvImgState.resultUrl;a.download=dvImgState.resultName;
 document.body.appendChild(a);a.click();a.remove();
 dvShow('Download started.','success');
};
dvId('dvDownload').onclick=dvDownloadImage;
dvId('dvCopyData').onclick=dvCopyAsDataUrl;
dvId('dvRetry').onclick=()=>{dvResult.classList.add('dv-hidden');dvEditor.scrollIntoView({behavior:'smooth',block:'start'});};

/* ============ BANNER TAB ============ */
const dvStage=dvId('dvBannerStage'), dvCanvas=dvId('dvBannerCanvas'), dvItemsLayer=dvId('dvBannerItems');
const dvTextToolbar=dvId('dvTextToolbar'), dvToolbarTitle=dvId('dvToolbarTitle');
const dvCtx=dvCanvas.getContext('2d');

const dvBanner={
 w:1200,h:630,bgColor:'#1877F2',bgImage:null,
 items:[],selected:null,nextId:1
};

const dvTextPalette=[
 '#FFFFFF','#0F172A','#F8FAFC','#FEF3C7',
 '#FCD34D','#F97316','#EF4444','#EC4899',
 '#8B5CF6','#3B82F6','#06B6D4','#10B981'
];
const dvBgPalette=[
 '#0F172A','#1E293B','#334155','#475569',
 '#1877F2','#2563EB','#4F46E5','#7C3AED',
 '#9333EA','#DB2777','#DC2626','#EA580C',
 '#D97706','#CA8A04','#16A34A','#0891B2',
 '#F1F5F9','#FEF3C7'
];

const dvRenderSwatches=(el,colors,onPick)=>{
 el.innerHTML='';
 colors.forEach(c=>{
  const b=document.createElement('button');
  b.type='button';b.className='dv-swatch';b.style.background=c;
  b.setAttribute('aria-label','Use color '+c);
  b.onclick=()=>onPick(c);
  el.appendChild(b);
 });
};

const dvDrawCanvas=()=>{
 dvCanvas.width=dvBanner.w;dvCanvas.height=dvBanner.h;
 dvCtx.fillStyle=dvBanner.bgColor;
 dvCtx.fillRect(0,0,dvBanner.w,dvBanner.h);
 if(dvBanner.bgImage){
  const img=dvBanner.bgImage;
  const s=Math.max(dvBanner.w/img.width,dvBanner.h/img.height);
  const dw=img.width*s, dh=img.height*s;
  dvCtx.drawImage(img,(dvBanner.w-dw)/2,(dvBanner.h-dh)/2,dw,dh);
 }
};

const dvStageScale=()=>{
 const w=dvStage.clientWidth||dvBanner.w;
 return w/dvBanner.w;
};

const dvPositionItem=(el,it)=>{
 const sc=dvStageScale();
 el.style.left=(it.x*sc)+'px';
 el.style.top=(it.y*sc)+'px';
};

const dvStyleItem=(el,it)=>{
 const sc=dvStageScale();
 el.style.color=it.color;
 el.style.fontSize=(it.size*sc)+'px';
 el.style.fontFamily="Roboto, -apple-system, system-ui, sans-serif";
 el.style.fontWeight=it.bold?'bold':'normal';
 el.style.fontStyle=it.italic?'italic':'normal';
 el.style.background=it.bgOn?it.bgColor:'transparent';
 el.style.padding=it.bgOn?'6px 12px':'2px 4px';
 el.style.whiteSpace='pre-wrap';
};

const dvRenderItems=()=>{
 dvItemsLayer.innerHTML='';
 dvBanner.items.forEach(it=>{
  const el=document.createElement('div');
  el.className='dv-banner-item'+(dvBanner.selected===it.id?' selected':'')+(it.type==='author'?' dv-author':'');
  el.dataset.id=String(it.id);
  el.textContent=it.text||' ';
  dvStyleItem(el,it);
  if(dvBanner.selected===it.id){
   const handle=document.createElement('div');
   handle.className='dv-handle';handle.textContent='R';
   handle.addEventListener('pointerdown',e=>dvStartResize(e,it));
   el.appendChild(handle);
  }
  el.addEventListener('pointerdown',e=>dvStartDrag(e,it));
  dvItemsLayer.appendChild(el);
  dvPositionItem(el,it);
 });
};

let dvDrag=null, dvResize=null;

const dvStartDrag=(e,it)=>{
 if(e.target.classList&&e.target.classList.contains('dv-handle'))return;
 e.preventDefault();
 dvSelectItem(it.id);
 dvDrag={id:it.id,startX:e.clientX,startY:e.clientY,origX:it.x,origY:it.y,sc:dvStageScale()};
 try{e.target.setPointerCapture(e.pointerId);}catch{}
};

const dvStartResize=(e,it)=>{
 e.preventDefault();e.stopPropagation();
 dvSelectItem(it.id);
 dvResize={id:it.id,startX:e.clientX,origSize:it.size,sc:dvStageScale()};
 try{e.target.setPointerCapture(e.pointerId);}catch{}
};

document.addEventListener('pointermove',e=>{
 if(dvDrag){
  const it=dvBanner.items.find(i=>i.id===dvDrag.id);if(!it)return;
  it.x=dvDrag.origX+(e.clientX-dvDrag.startX)/dvDrag.sc;
  it.y=dvDrag.origY+(e.clientY-dvDrag.startY)/dvDrag.sc;
  const el=dvItemsLayer.querySelector('[data-id="'+it.id+'"]');
  if(el)dvPositionItem(el,it);
 } else if(dvResize){
  const it=dvBanner.items.find(i=>i.id===dvResize.id);if(!it)return;
  const delta=(e.clientX-dvResize.startX)/dvResize.sc;
  it.size=Math.max(18,Math.min(200,Math.round(dvResize.origSize+delta)));
  const el=dvItemsLayer.querySelector('[data-id="'+it.id+'"]');
  if(el)dvStyleItem(el,it);
  dvId('dvTextSize').value=it.size;
 }
});
document.addEventListener('pointerup',()=>{dvDrag=null;dvResize=null;});
document.addEventListener('pointercancel',()=>{dvDrag=null;dvResize=null;});

const dvCurrentItem=()=>dvBanner.items.find(i=>i.id===dvBanner.selected);

const dvFillToolbar=it=>{
 dvId('dvTextContent').value=it.text;
 dvId('dvTextSize').value=it.size;
 dvId('dvTextColor').value=it.color;
 dvId('dvTextHex').value=it.color.toUpperCase();
 dvId('dvBgColor').value=it.bgColor;
 dvId('dvBgHex').value=it.bgColor.toUpperCase();
 dvId('dvBoldBtn').classList.toggle('active',!!it.bold);
 dvId('dvItalicBtn').classList.toggle('active',!!it.italic);
 dvId('dvBgToggleBtn').classList.toggle('active',!!it.bgOn);
 dvToolbarTitle.textContent=it.type==='author'?'Edit Author':'Edit Text';
};

const dvSelectItem=id=>{
 dvBanner.selected=id;
 const it=dvCurrentItem();
 if(it){dvFillToolbar(it);dvTextToolbar.classList.remove('dv-hidden');}
 dvRenderItems();
};

dvStage.addEventListener('pointerdown',e=>{
 if(e.target===dvStage||e.target===dvCanvas){
  dvBanner.selected=null;
  dvTextToolbar.classList.add('dv-hidden');
  dvRenderItems();
 }
});

const dvMakeText=(overrides={})=>Object.assign({
 id:dvBanner.nextId++,type:'text',text:'Your Text',
 x:Math.round(dvBanner.w/2-150),y:Math.round(dvBanner.h/2-40),size:64,
 color:'#ffffff',bgColor:'#111111',bgOn:false,bold:true,italic:false
},overrides);

dvId('dvAddText').onclick=()=>{
 const it=dvMakeText();
 dvBanner.items.push(it);
 dvSelectItem(it.id);
 dvShow('Text added. Drag to move, corner handle to resize.','success');
};

dvId('dvAddAuthor').onclick=()=>{
 const it=dvMakeText({
  type:'author',
  text:'@dvauthor',
  size:32,
  x:Math.round(dvBanner.w/2-100),
  y:dvBanner.h-80,
  color:'#ffffff',
  bgColor:'#111111',
  bgOn:false,
  bold:true,italic:false
 });
 dvBanner.items.push(it);
 dvSelectItem(it.id);
 dvShow('Author added. Drag to reposition.','success');
};

dvId('dvSetBgImage').onclick=()=>dvId('dvBgImageInput').click();
dvId('dvBgImageInput').onchange=e=>{
 const f=e.target.files[0];if(!f)return;
 if(!f.type.startsWith('image/')){dvShow('Not a valid image.','error');return;}
 const url=URL.createObjectURL(f);
 const img=new Image();
 img.onload=()=>{dvBanner.bgImage=img;dvDrawCanvas();dvShow('Background image set.','success');};
 img.onerror=()=>{dvRevoke(url);dvShow('Could not load image.','error');};
 img.src=url;
 dvId('dvBgImageInput').value='';
};

dvId('dvTextContent').oninput=e=>{
 const it=dvCurrentItem();if(!it)return;
 it.text=e.target.value;
 const el=dvItemsLayer.querySelector('[data-id="'+it.id+'"]');
 if(el){
  const handle=el.querySelector('.dv-handle');
  el.textContent=it.text||' ';
  if(handle)el.appendChild(handle);
 }
};
dvId('dvTextSize').onchange=e=>{
 const it=dvCurrentItem();if(!it)return;
 it.size=dvClampNum(e.target,18,200);
 const el=dvItemsLayer.querySelector('[data-id="'+it.id+'"]');
 if(el)dvStyleItem(el,it);
};
dvId('dvTextSizeUp').onclick=()=>{
 const it=dvCurrentItem();if(!it)return;
 const el=dvId('dvTextSize');
 el.value=dvClampNum(el,18,200)+4;
 el.dispatchEvent(new Event('change'));
};
dvId('dvTextSizeDown').onclick=()=>{
 const it=dvCurrentItem();if(!it)return;
 const el=dvId('dvTextSize');
 el.value=dvClampNum(el,18,200)-4;
 el.dispatchEvent(new Event('change'));
};
dvId('dvBoldBtn').onclick=()=>{const it=dvCurrentItem();if(!it)return;it.bold=!it.bold;dvFillToolbar(it);dvRenderItems();};
dvId('dvItalicBtn').onclick=()=>{const it=dvCurrentItem();if(!it)return;it.italic=!it.italic;dvFillToolbar(it);dvRenderItems();};
dvId('dvTextColor').oninput=e=>{
 const it=dvCurrentItem();if(!it)return;
 it.color=e.target.value;dvId('dvTextHex').value=e.target.value.toUpperCase();dvRenderItems();
};
dvId('dvTextHex').onchange=e=>{
 const it=dvCurrentItem();if(!it)return;
 const hex=dvResolveColor(e.target.value);
 if(hex){it.color=hex;dvId('dvTextColor').value=hex;e.target.value=hex.toUpperCase();dvRenderItems();}
 else{dvShow('Unrecognized color.','error');}
};
dvId('dvBgColor').oninput=e=>{
 const it=dvCurrentItem();if(!it)return;
 it.bgColor=e.target.value;dvId('dvBgHex').value=e.target.value.toUpperCase();dvRenderItems();
};
dvId('dvBgHex').onchange=e=>{
 const it=dvCurrentItem();if(!it)return;
 const hex=dvResolveColor(e.target.value);
 if(hex){it.bgColor=hex;dvId('dvBgColor').value=hex;e.target.value=hex.toUpperCase();dvRenderItems();}
 else{dvShow('Unrecognized color.','error');}
};
dvId('dvBgToggleBtn').onclick=()=>{
 const it=dvCurrentItem();if(!it)return;
 it.bgOn=!it.bgOn;dvFillToolbar(it);dvRenderItems();
};
dvId('dvDeleteItemBtn').onclick=async()=>{
 if(!dvBanner.selected)return;
 const ok=await dvConfirm('Delete this item?','Delete Item');
 if(!ok)return;
 dvBanner.items=dvBanner.items.filter(i=>i.id!==dvBanner.selected);
 dvBanner.selected=null;dvTextToolbar.classList.add('dv-hidden');
 dvRenderItems();dvShow('Deleted.','success');
};

dvRenderSwatches(dvId('dvTextSwatches'),dvTextPalette,c=>{
 const it=dvCurrentItem();if(!it)return;
 it.color=c;dvId('dvTextColor').value=c;dvId('dvTextHex').value=c.toUpperCase();dvRenderItems();
});

dvId('dvCanvasBgColor').oninput=e=>{
 dvBanner.bgColor=e.target.value;dvId('dvCanvasBgHex').value=e.target.value.toUpperCase();dvDrawCanvas();
};
dvId('dvCanvasBgHex').onchange=e=>{
 const hex=dvResolveColor(e.target.value);
 if(hex){dvBanner.bgColor=hex;dvId('dvCanvasBgColor').value=hex;e.target.value=hex.toUpperCase();dvDrawCanvas();}
 else{dvShow('Unrecognized color.','error');}
};
dvRenderSwatches(dvId('dvCanvasSwatches'),dvBgPalette,c=>{
 dvBanner.bgColor=c;dvId('dvCanvasBgColor').value=c;dvId('dvCanvasBgHex').value=c.toUpperCase();dvDrawCanvas();
});

document.querySelectorAll('#dvSizeChips .dv-chip').forEach(c=>c.onclick=()=>{
 document.querySelectorAll('#dvSizeChips .dv-chip').forEach(x=>x.classList.remove('active'));
 c.classList.add('active');
 dvBanner.w=+c.dataset.w;dvBanner.h=+c.dataset.h;
 dvDrawCanvas();dvRenderItems();
});

dvId('dvBannerBg').onclick=()=>dvId('dvCanvasBgColor').click();

dvId('dvBannerClear').onclick=async()=>{
 const ok=await dvConfirm('Clear all banner content? This cannot be undone.','Clear Banner');
 if(!ok)return;
 dvBanner.items=[];dvBanner.selected=null;dvBanner.bgImage=null;
 dvTextToolbar.classList.add('dv-hidden');
 dvRenderItems();
 dvShow('Banner cleared.','success');
};

/* word-wrapped fillText for export */
const dvWrapText=(ctx,text,maxWidth)=>{
 const lines=[];
 (text||' ').split('\n').forEach(paragraph=>{
  const words=paragraph.split(' ');
  let line='';
  words.forEach(word=>{
   const test=line?line+' '+word:word;
   if(ctx.measureText(test).width>maxWidth&&line){
    lines.push(line);line=word;
   }else{line=test;}
  });
  lines.push(line);
 });
 return lines;
};

const dvExportBanner=()=>{
 const out=document.createElement('canvas');
 out.width=dvBanner.w;out.height=dvBanner.h;
 const octx=out.getContext('2d');
 octx.fillStyle=dvBanner.bgColor;
 octx.fillRect(0,0,dvBanner.w,dvBanner.h);
 if(dvBanner.bgImage){
  const img=dvBanner.bgImage;
  const s=Math.max(dvBanner.w/img.width,dvBanner.h/img.height);
  const dw=img.width*s,dh=img.height*s;
  octx.drawImage(img,(dvBanner.w-dw)/2,(dvBanner.h-dh)/2,dw,dh);
 }
 dvBanner.items.forEach(it=>{
  const weight=it.bold?'bold ':'';
  const style=it.italic?'italic ':'';
  octx.font=style+weight+it.size+'px Roboto, sans-serif';
  octx.textBaseline='top';
  const maxWidth=dvBanner.w-it.x-20;
  const lines=dvWrapText(octx,it.text,Math.max(60,maxWidth));
  const lineHeight=it.size*1.25;
  const widest=Math.max(...lines.map(l=>octx.measureText(l).width),1);
  const pad=it.bgOn?12:0;
  if(it.bgOn){
   octx.fillStyle=it.bgColor;
   octx.fillRect(it.x-pad,it.y-pad,widest+pad*2,lineHeight*lines.length+pad*2);
  }
  octx.fillStyle=it.color;
  lines.forEach((line,i)=>octx.fillText(line,it.x,it.y+i*lineHeight));
 });
 dvApplyWatermark(octx,dvBanner.w,dvBanner.h);
 out.toBlob(blob=>{
  if(!blob){dvShow('Export failed.','error');return;}
  const url=URL.createObjectURL(blob);
  const a=document.createElement('a');
  a.href=url;a.download='dv-banner-'+dvBanner.w+'x'+dvBanner.h+'.png';
  document.body.appendChild(a);a.click();a.remove();
  setTimeout(()=>URL.revokeObjectURL(url),1000);
  dvShow('Banner downloaded.','success');
 },'image/png');
};

dvId('dvBannerDownload').onclick=dvExportBanner;
dvId('dvBannerDownloadTop').onclick=dvExportBanner;

/* Settings sidebar actions */
dvId('dvSideNew').onclick=()=>{dvCloseSettings();dvResetImage();dvSwitchTab('image');};
dvId('dvSideOpen').onclick=()=>{dvCloseSettings();dvSwitchTab('image');dvFile.click();};
dvId('dvSideBanner').onclick=()=>{dvCloseSettings();dvSwitchTab('banner');};
dvId('dvSideDownload').onclick=()=>{
 dvCloseSettings();
 if(!dvViewBanner.classList.contains('dv-hidden'))dvExportBanner();
 else dvDownloadImage();
};

/* ============ PWA / Service Worker ============ */
const dvInstallBox=dvId('dvInstall');
const dvInstallBtn=dvId('dvInstallBtn');
const dvInstallClose=dvId('dvInstallClose');
let dvDeferredPrompt=null;

dvInstallBtn.innerHTML=dvIconDownload+'<span>Install</span>';

window.addEventListener('beforeinstallprompt',e=>{
 e.preventDefault();
 dvDeferredPrompt=e;
 let installed=false, dismissedAt=0;
 try{
  installed=localStorage.getItem('dv-app-installed')==='1';
  dismissedAt=+(localStorage.getItem('dv-install-dismissed')||0);
 }catch{}
 if(installed)return;
 if(Date.now()-dismissedAt<86400000)return;
 dvInstallBox.classList.add('show');
});

dvInstallBtn.onclick=async()=>{
 if(!dvDeferredPrompt){dvShow('Please wait and retry again.','error');return;}
 dvDeferredPrompt.prompt();
 const {outcome}=await dvDeferredPrompt.userChoice;
 dvDeferredPrompt=null;
 dvInstallBox.classList.remove('show');
 if(outcome==='accepted')dvShow('App installed.','success');
};

dvInstallClose.onclick=()=>{
 dvInstallBox.classList.remove('show');
 try{localStorage.setItem('dv-install-dismissed',String(Date.now()));}catch{}
};

dvId('dvSideInstall').onclick=()=>{dvCloseSettings();dvInstallBtn.click();};

window.addEventListener('appinstalled',()=>{
 dvInstallBox.classList.remove('show');
 try{localStorage.setItem('dv-app-installed','1');}catch{}
 dvShow('App installed.','success');
});

if('serviceWorker' in navigator){
 window.addEventListener('load',()=>{
  navigator.serviceWorker.register('sw.js').catch(()=>{});
 });
}

/* ============ NOTEPAD ============ */
const dvNotepadLanding=dvId('dvNotepadLanding'), dvNotepadWorkspace=dvId('dvNotepadWorkspace');
const dvNavNotepad=dvId('dvNavNotepad');
const dvNotesList=dvId('dvNotesList'), dvNotesEmpty=dvId('dvNotesEmpty'), dvNotesFab=dvId('dvNotesFab');
const dvNoteTextarea=dvId('dvNoteTextarea'), dvWorkspaceTitle=dvId('dvWorkspaceTitle');

const dvNoteDBName='dv-notepad', dvNoteStore='notes';
let dvNoteDB=null;
const dvNoteOpenDB=()=>new Promise((resolve,reject)=>{
 const req=indexedDB.open(dvNoteDBName,1);
 req.onupgradeneeded=()=>{
  const db=req.result;
  if(!db.objectStoreNames.contains(dvNoteStore))db.createObjectStore(dvNoteStore,{keyPath:'id'});
 };
 req.onsuccess=()=>{dvNoteDB=req.result;resolve(dvNoteDB);};
 req.onerror=()=>reject(req.error);
});
const dvNoteAll=()=>new Promise((resolve,reject)=>{
 const tx=dvNoteDB.transaction(dvNoteStore,'readonly');
 const req=tx.objectStore(dvNoteStore).getAll();
 req.onsuccess=()=>resolve(req.result||[]);
 req.onerror=()=>reject(req.error);
});
const dvNotePut=note=>new Promise((resolve,reject)=>{
 const tx=dvNoteDB.transaction(dvNoteStore,'readwrite');
 tx.objectStore(dvNoteStore).put(note);
 tx.oncomplete=()=>resolve();
 tx.onerror=()=>reject(tx.error);
});
const dvNoteDelete=id=>new Promise((resolve,reject)=>{
 const tx=dvNoteDB.transaction(dvNoteStore,'readwrite');
 tx.objectStore(dvNoteStore).delete(id);
 tx.oncomplete=()=>resolve();
 tx.onerror=()=>reject(tx.error);
});

let dvNotesCache=[];
let dvActiveNoteId=null;
let dvNoteZoom=28;
let dvUndoStack=[], dvRedoStack=[];
let dvActionsNoteId=null;

const dvFmtDate=ts=>{
 const d=new Date(ts);
 return d.toLocaleDateString()+' '+d.toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'});
};

const dvRenderNotesList=()=>{
 dvNotesList.innerHTML='';
 const q=(dvId('dvNoteSearch').value||'').trim().toLowerCase();
 const filtered=q?dvNotesCache.filter(n=>(n.title||'').toLowerCase().includes(q)||(n.content||'').toLowerCase().includes(q)):dvNotesCache;
 dvNotesEmpty.classList.toggle('dv-hidden',filtered.length>0);
 if(q&&filtered.length===0)dvNotesEmpty.querySelector('p').textContent='No notes match your search.';
 else dvNotesEmpty.querySelector('p').textContent='No notes yet. Tap the + button to create your first note.';
 filtered.slice().sort((a,b)=>b.updated-a.updated).forEach(note=>{
  const row=document.createElement('div');
  row.className='dv-note-row';
  const main=document.createElement('button');
  main.className='dv-note-row-main';
  main.innerHTML='<strong></strong><span></span>';
  main.querySelector('strong').textContent=note.title||'Untitled Note';
  main.querySelector('span').textContent=dvFmtDate(note.updated);
  main.onclick=()=>dvOpenWorkspace(note.id);
  const dots=document.createElement('button');
  dots.className='dv-note-dots';
  dots.setAttribute('aria-label','Note options');
  dots.innerHTML='<svg class="dv-icon" viewBox="0 0 24 24"><circle cx="12" cy="5" r="2"/><circle cx="12" cy="12" r="2"/><circle cx="12" cy="19" r="2"/></svg>';
  dots.onclick=e=>dvOpenNoteActions(note.id,e.currentTarget);
  row.appendChild(main);row.appendChild(dots);
  dvNotesList.appendChild(row);
 });
};
dvId('dvNoteSearch').oninput=dvRenderNotesList;

const dvLoadNotes=async()=>{
 if(!dvNoteDB)await dvNoteOpenDB();
 dvNotesCache=await dvNoteAll();
 dvRenderNotesList();
};

const dvOpenNotepad=async()=>{
 await dvLoadNotes();
 dvNotepadLanding.classList.add('open');
};
const dvCloseNotepad=()=>{dvNotepadLanding.classList.remove('open');};
dvNavNotepad.onclick=dvOpenNotepad;
dvId('dvNotepadCloseBtn').onclick=dvCloseNotepad;

const dvOpenWorkspace=id=>{
 const note=dvNotesCache.find(n=>n.id===id);
 dvActiveNoteId=id;
 dvNoteTextarea.value=note?note.content:'';
 dvWorkspaceTitle.textContent=note?(note.title||'Untitled Note'):'New Note';
 dvUndoStack=[dvNoteTextarea.value];dvRedoStack=[];
 dvNoteZoom=28;dvNoteTextarea.style.fontSize=dvNoteZoom+'px';
 dvNotepadWorkspace.classList.add('open');
};
const dvNoteTemplates=[
  {title:'Faith & Devotion',topic:'Reflect on scripture, prayer requests, and your walk this week.',content:'Faith & Devotion\n\nToday I want to reflect on where my faith stands and how I can grow closer in my walk. What scripture or truth spoke to me recently, and why did it matter? List one area of doubt or struggle you are currently working through, and one promise that brings you comfort.\n\nConsider a specific prayer request you want to hold onto this week, for yourself, your family, or someone else in need. Write down one practical step you can take today to put your faith into action, whether that is reaching out to someone, forgiving a past hurt, or simply setting aside quiet time to be still.\n\nEnd with a short prayer of gratitude, naming three specific things you are thankful for right now. Faith grows best when it is written down and revisited, so come back to this note in a week and see how things have changed.\n\nLet this be an honest space, not a performance; write exactly what is true for you today, nothing more.'},
  {title:'Family & Relationships',topic:'Appreciate loved ones and plan meaningful reconnections.',content:'Family & Relationships\n\nThink about the people closest to you right now: spouse, children, parents, siblings, or close friends. Write down one thing you appreciate about each person you list, however small.\n\nNote any tension or unresolved conversation you have been avoiding, and one gentle way you could open that conversation this week. Record an upcoming birthday, anniversary, or milestone you do not want to forget, along with an idea for how to mark it well.\n\nIf there is someone you have lost touch with, write their name down along with one memory that makes you smile. Consider what your family or close circle needs most from you right now: presence, patience, forgiveness, or simply more time.\n\nEnd this note with one small action you will take in the next 48 hours to invest in a relationship that matters. Relationships are built in ordinary moments more than grand gestures, so look for the small opening today.'},
  {title:'Career & Work',topic:'Review wins, challenges, and your next career step.',content:'Career & Work\n\nUse this space to think clearly about where you stand professionally. What task or project is currently taking up most of your mental energy, and is that where it should be? Write down one win from this week, no matter how small, and one thing that did not go as planned along with what you learned.\n\nList any skill you have been meaning to develop and one concrete step to start this month. If you are facing a difficult decision at work, write out the options plainly along with the pros and cons of each.\n\nNote the name of one colleague or mentor you should reach out to for advice or encouragement. Consider your long-term direction: are your daily tasks moving you toward where you actually want to be in five years? End with one boundary you need to set or protect this week to keep your work sustainable rather than draining.'},
  {title:'Health & Wellness',topic:'Check in on sleep, movement, stress, and daily habits.',content:'Health & Wellness\n\nTake a moment to check in honestly with your body and mind. How many hours of sleep have you been averaging, and how does that compare to what you actually need? Write down what you ate today and whether it left you feeling energized or sluggish.\n\nNote any physical activity you completed this week, even a short walk, and how it made you feel afterward. If you are carrying stress or anxiety, name the specific source rather than leaving it vague; naming it is the first step to addressing it.\n\nList one habit you want to build and one small trigger you will attach it to so it actually happens. Record any symptoms or changes worth mentioning to a doctor rather than trusting memory alone.\n\nEnd with one thing you are doing well for your health right now that deserves acknowledgment, not just criticism of what is missing.'},
  {title:'Finances & Stewardship',topic:'Track spending, goals, and financial gratitude.',content:'Finances & Stewardship\n\nSet aside a few honest minutes to look at your financial picture. Write down your top three expenses from the past month and whether each one aligned with your actual priorities.\n\nNote any upcoming bill, debt payment, or financial deadline you cannot afford to forget. List one financial goal you are working toward, whether an emergency fund, a purchase, or paying down debt, and the specific amount you are aiming for.\n\nRecord one spending habit that quietly drains your budget more than you would like to admit. Consider whether you are giving, saving, and spending in proportions that reflect your real values.\n\nWrite down one practical adjustment you will make this week, even something small like a pause before non-essential purchases. End by noting one thing about your current financial situation you are genuinely grateful for, since perspective matters as much as numbers.'},
  {title:'Personal Growth',topic:'Examine beliefs, habits, and who you are becoming.',content:'Personal Growth\n\nUse this page to take stock of who you are becoming, not just what you are doing. Write down one belief about yourself you have been carrying that may no longer be true or helpful.\n\nNote a recent moment when you reacted in a way you were not proud of, and what a better response might look like next time. List a book, conversation, or experience that recently shifted your thinking, and how.\n\nIdentify one habit or comfort zone that is quietly holding you back from growth. Write down one skill, virtue, or discipline you want to be known for a year from now, and a small daily practice that builds toward it.\n\nConsider who you spend the most time with and whether those relationships are stretching you or shrinking you. End with one specific, honest sentence describing the person you are trying to become.'},
  {title:'Goals & Planning',topic:'Turn one big goal into concrete next steps.',content:'Goals & Planning\n\nThis is your space to turn vague intentions into a real plan. Write down the single most important goal you are pursuing this quarter, stated as specifically as possible.\n\nBreak it into three concrete milestones with rough target dates rather than one distant finish line. Note any resource, skill, or support you are currently missing to move forward, and where you might get it.\n\nList one thing competing for your time and attention that you may need to say no to in order to protect focus on this goal. Record what success will actually look and feel like when you get there, in specific enough terms that you will recognize it.\n\nIdentify the very next physical action you can take today, no matter how small. End by writing down who, if anyone, you will tell about this goal to build helpful accountability rather than carrying it alone.'},
  {title:'Gratitude Journal',topic:'Name specific blessings and good things from today.',content:'Gratitude Journal\n\nBefore moving on with your day, slow down enough to notice what is actually good. Write down three specific things that happened today that you are grateful for, being as concrete as possible rather than general.\n\nName one person who made your day easier or better in some way, and consider sending them a short message of thanks. Note one difficulty you faced today and, if you can find it honestly, one small good that came alongside it.\n\nWrite down something about your body, home, or daily routine that you often take for granted but genuinely value. Consider one thing about your current season of life, even if imperfect, that you would miss if it were gone.\n\nEnd by writing a short sentence of thanks addressed to whoever or whatever you feel it belongs to. Gratitude noticed and written down tends to grow; left unspoken, it fades quickly.'},
  {title:'Community & Service',topic:'Find one practical way to serve someone this week.',content:'Community & Service\n\nReflect on your place within the people and community around you. Write down one person or family in your circle who could use encouragement, a visit, or practical help right now.\n\nNote any way you have recently been served or helped by someone else that you have not properly acknowledged. List one skill, resource, or bit of time you have available this month that could genuinely benefit someone outside your immediate household.\n\nConsider whether you have been more focused on receiving from your community than contributing to it lately. Write down one local need, cause, or group you feel drawn to but have not yet acted on.\n\nRecord a specific, doable next step, such as a phone call, a small donation, or an hour of your time. End by noting how being part of something bigger than yourself changes the way you see your own daily struggles.'},
  {title:'Reflection & Prayer Requests',topic:'Sit with open questions and requests for others.',content:'Reflection & Prayer Requests\n\nUse this space to slow down and take honest stock of where things stand. Write down the biggest question or uncertainty currently on your mind, without trying to resolve it yet.\n\nNote one specific situation, relationship, or decision you would like to bring into your prayers or quiet reflection this week. List someone else who is going through a hard season and needs to be remembered, along with what they are facing.\n\nRecord one thing that happened recently that you still do not fully understand, and sit with that honestly rather than forcing a tidy explanation. Write down one thing you hope for in the coming weeks, stated plainly.\n\nConsider what peace or clarity would actually look like in your current situation. End with a short, honest sentence naming what you most need right now, whether that is strength, patience, direction, or rest.'}
];

const dvFabMenuWrap=dvId('dvFabMenuWrap'), dvTemplateMenuWrap=dvId('dvTemplateMenuWrap'), dvTemplateMenuCard=dvId('dvTemplateMenuCard');
const dvCloseFabMenu=()=>{dvFabMenuWrap.classList.remove('open');dvNotesFab.classList.remove('dv-fab-open');};
const dvCloseTemplateMenu=()=>dvTemplateMenuWrap.classList.remove('open');
dvFabMenuWrap.onclick=e=>{if(e.target===dvFabMenuWrap)dvCloseFabMenu();};
dvTemplateMenuWrap.onclick=e=>{if(e.target===dvTemplateMenuWrap)dvCloseTemplateMenu();};

const dvCreateNoteWith=async(title,content)=>{
 const note={id:'n'+Date.now(),title:title||'Untitled Note',content:content||'',updated:Date.now()};
 dvNotesCache.push(note);
 if((content||'').trim())await dvNotePut(note);
 dvOpenWorkspace(note.id);
};

dvNotesFab.onclick=()=>{
 const isOpen=dvFabMenuWrap.classList.toggle('open');
 dvNotesFab.classList.toggle('dv-fab-open',isOpen);
};
dvId('dvFabNewNote').onclick=async()=>{dvCloseFabMenu();await dvCreateNoteWith('Untitled Note','');};
dvId('dvFabTemplates').onclick=()=>{
 dvCloseFabMenu();
 dvTemplateMenuCard.innerHTML=dvNoteTemplates.map((t,i)=>
  '<button class="dv-note-row" style="width:100%;text-align:left;display:block" data-i="'+i+'">'+
  '<strong style="display:block;font-size:19px;font-weight:800;color:var(--dv-p)">'+t.title+'</strong>'+
  '<span style="display:block;font-size:15px;color:var(--dv-muted);margin-top:4px">'+t.topic+'</span>'+
  '</button>'
 ).join('');
 dvTemplateMenuCard.querySelectorAll('[data-i]').forEach(btn=>{
  btn.onclick=async()=>{
   const t=dvNoteTemplates[+btn.dataset.i];
   dvCloseTemplateMenu();
   await dvCreateNoteWith(t.title,t.content);
  };
 });
 dvTemplateMenuWrap.classList.add('open');
};
dvId('dvTemplateMenuCloseBtn').onclick=dvCloseTemplateMenu;
const dvCloseWorkspace=async()=>{
 dvNotepadWorkspace.classList.remove('open');
 await dvLoadNotes();
};
dvId('dvWorkspaceBackBtn').onclick=dvCloseWorkspace;

const dvSaveActiveNote=async(titleOverride)=>{
 if(!dvActiveNoteId)return;
 const idx=dvNotesCache.findIndex(n=>n.id===dvActiveNoteId);
 const content=dvNoteTextarea.value;
 if(!content.trim()&&idx<0)return;
 const firstLine=(content.split('\n')[0]||'').trim();
 const title=(titleOverride&&titleOverride.trim())?titleOverride.trim().slice(0,60):(firstLine?firstLine.slice(0,60):'Untitled Note');
 const note={
  id:dvActiveNoteId,
  title,
  content,
  updated:Date.now()
 };
 if(idx>=0)dvNotesCache[idx]=note;else dvNotesCache.push(note);
 await dvNotePut(note);
 dvWorkspaceTitle.textContent=note.title;
 dvShow('Note saved.','success');
};

/* Toolbar */
dvNoteTextarea.addEventListener('input',()=>{
 dvUndoStack.push(dvNoteTextarea.value);
 if(dvUndoStack.length>100)dvUndoStack.shift();
 dvRedoStack=[];
});
dvId('dvTbNew').onclick=async()=>{
 await dvSaveActiveNote();
 const note={id:'n'+Date.now(),title:'Untitled Note',content:'',updated:Date.now()};
 dvNotesCache.push(note);
 await dvNotePut(note);
 dvOpenWorkspace(note.id);
};
dvId('dvTbUndo').onclick=()=>{
 if(dvUndoStack.length<2)return;
 dvRedoStack.push(dvUndoStack.pop());
 dvNoteTextarea.value=dvUndoStack[dvUndoStack.length-1];
};
dvId('dvTbRedo').onclick=()=>{
 if(!dvRedoStack.length)return;
 const val=dvRedoStack.pop();
 dvUndoStack.push(val);
 dvNoteTextarea.value=val;
};
dvId('dvTbPaste').onclick=async()=>{
 try{
  const text=await navigator.clipboard.readText();
  const s=dvNoteTextarea.selectionStart,e=dvNoteTextarea.selectionEnd;
  dvNoteTextarea.value=dvNoteTextarea.value.slice(0,s)+text+dvNoteTextarea.value.slice(e);
  dvNoteTextarea.dispatchEvent(new Event('input'));
  dvShow('Pasted.','success');
 }catch{dvShow('Clipboard access denied.','error');}
};
dvId('dvTbCopy').onclick=async()=>{
 const s=dvNoteTextarea.selectionStart,e=dvNoteTextarea.selectionEnd;
 const text=s!==e?dvNoteTextarea.value.slice(s,e):dvNoteTextarea.value;
 try{await navigator.clipboard.writeText(text);dvShow('Copied.','success');}
 catch{dvShow('Copy failed.','error');}
};
dvId('dvTbDelete').onclick=()=>{
 const s=dvNoteTextarea.selectionStart,e=dvNoteTextarea.selectionEnd;
 if(s===e)return;
 dvNoteTextarea.value=dvNoteTextarea.value.slice(0,s)+dvNoteTextarea.value.slice(e);
 dvNoteTextarea.selectionStart=dvNoteTextarea.selectionEnd=s;
 dvNoteTextarea.dispatchEvent(new Event('input'));
};
dvId('dvTbSave').onclick=()=>{
 const note=dvNotesCache.find(n=>n.id===dvActiveNoteId);
 dvId('dvSaveTitleInput').value=(note&&note.title&&note.title!=='Untitled Note')?note.title:'';
 dvSaveModalWrap.classList.add('open');
 dvId('dvSaveTitleInput').focus();
};
const dvSaveModalWrap=dvId('dvSaveModalWrap');
const dvCloseSaveModal=()=>{dvSaveModalWrap.classList.remove('open');};
dvId('dvSaveModalBackdrop').onclick=dvCloseSaveModal;
dvId('dvSaveCancelBtn').onclick=dvCloseSaveModal;
dvId('dvSaveConfirmBtn').onclick=async()=>{
 await dvSaveActiveNote(dvId('dvSaveTitleInput').value);
 dvCloseSaveModal();
};
dvId('dvTbSelect').onclick=()=>dvNoteTextarea.select();
dvId('dvTbZoomIn').onclick=()=>{dvNoteZoom=Math.min(32,dvNoteZoom+2);dvNoteTextarea.style.fontSize=dvNoteZoom+'px';};
dvId('dvTbZoomOut').onclick=()=>{dvNoteZoom=Math.max(26,dvNoteZoom-2);dvNoteTextarea.style.fontSize=dvNoteZoom+'px';};
dvId('dvTbDark').onclick=dvToggleTheme;

/* Per-note action dropdown */
const dvNoteActionsWrap=dvId('dvNoteActionsWrap');
const dvNoteActionsCard=dvId('dvNoteActionsCard');
const dvOpenNoteActions=(id,anchorEl)=>{
 dvActionsNoteId=id;
 dvNoteActionsWrap.classList.add('open');
 requestAnimationFrame(()=>{
  const rect=anchorEl.getBoundingClientRect();
  const cw=dvNoteActionsCard.offsetWidth, ch=dvNoteActionsCard.offsetHeight;
  let left=rect.right-cw;
  left=Math.max(10,Math.min(left,window.innerWidth-cw-10));
  let top=rect.bottom+6;
  if(top+ch>window.innerHeight-10)top=Math.max(10,rect.top-ch-6);
  dvNoteActionsCard.style.left=left+'px';
  dvNoteActionsCard.style.top=top+'px';
 });
};
const dvCloseNoteActions=()=>{dvNoteActionsWrap.classList.remove('open');dvActionsNoteId=null;};
dvId('dvNaExit').onclick=dvCloseNoteActions;
dvNoteActionsWrap.onclick=e=>{if(e.target===dvNoteActionsWrap)dvCloseNoteActions();};

let dvRenameTargetId=null;
const dvRenameModalWrap=dvId('dvRenameModalWrap');
const dvCloseRenameModal=()=>{dvRenameModalWrap.classList.remove('open');};
dvId('dvRenameModalBackdrop').onclick=dvCloseRenameModal;
dvId('dvRenameCancelBtn').onclick=dvCloseRenameModal;
dvId('dvRenameConfirmBtn').onclick=async()=>{
 const note=dvNotesCache.find(n=>n.id===dvRenameTargetId);
 if(note){
  note.title=dvId('dvRenameTitleInput').value.trim()||'Untitled Note';
  note.updated=Date.now();
  await dvNotePut(note);
  await dvLoadNotes();
 }
 dvCloseRenameModal();
};
dvId('dvNaRename').onclick=()=>{
 const note=dvNotesCache.find(n=>n.id===dvActionsNoteId);
 dvRenameTargetId=dvActionsNoteId;
 dvCloseNoteActions();
 dvId('dvRenameTitleInput').value=note?(note.title||''):'';
 dvRenameModalWrap.classList.add('open');
 dvId('dvRenameTitleInput').focus();
};
dvId('dvNaEdit').onclick=()=>{
 const id=dvActionsNoteId;
 dvCloseNoteActions();
 dvOpenWorkspace(id);
};
dvId('dvNaDelete').onclick=async()=>{
 const id=dvActionsNoteId;
 dvCloseNoteActions();
 const ok=await dvConfirm('Delete this note? This cannot be undone.','Delete Note');
 if(!ok)return;
 await dvNoteDelete(id);
 await dvLoadNotes();
 dvShow('Note deleted.','success');
};
dvId('dvNaWhatsapp').onclick=()=>{
 const note=dvNotesCache.find(n=>n.id===dvActionsNoteId);
 dvCloseNoteActions();
 if(!note)return;
 const text=encodeURIComponent((note.title?note.title+'\n\n':'')+note.content);
 window.open('https://wa.me/?text='+text,'_blank');
};
dvId('dvNaShare').onclick=async()=>{
 const note=dvNotesCache.find(n=>n.id===dvActionsNoteId);
 dvCloseNoteActions();
 if(!note)return;
 if(navigator.share){
  try{await navigator.share({title:note.title||'Note',text:note.content});}catch{}
 }else{
  dvShow('Share Sheet not available on this browser.','error');
 }
};

/* Export note to the user's own device storage as a .txt file, so a note is never lost even if the app data is cleared. */
const dvExportNote=note=>{
 const text=(note.title||'Untitled Note')+'\n\n'+(note.content||'');
 const blob=new Blob([text],{type:'text/plain'});
 const url=URL.createObjectURL(blob);
 const safeName=(note.title||'note').replace(/[<>:"/\\|?*\x00-\x1F]/g,'').trim()||'note';
 const a=document.createElement('a');
 a.href=url;a.download=safeName+'.txt';
 document.body.appendChild(a);a.click();a.remove();
 setTimeout(()=>URL.revokeObjectURL(url),1000);
 dvShow('Note exported to your device.','success');
};
dvId('dvNaExport').onclick=()=>{
 const note=dvNotesCache.find(n=>n.id===dvActionsNoteId);
 dvCloseNoteActions();
 if(!note)return;
 dvExportNote(note);
};

document.addEventListener('keydown',e=>{
 if(e.key!=='Escape')return;
 if(dvTemplateMenuWrap.classList.contains('open')){dvCloseTemplateMenu();return;}
 if(dvFabMenuWrap.classList.contains('open')){dvCloseFabMenu();return;}
 if(dvRenameModalWrap.classList.contains('open')){dvCloseRenameModal();return;}
 if(dvSaveModalWrap.classList.contains('open')){dvCloseSaveModal();return;}
 if(dvNoteActionsWrap.classList.contains('open')){dvCloseNoteActions();return;}
 if(dvNotepadWorkspace.classList.contains('open')){dvCloseWorkspace();return;}
 if(dvNotepadLanding.classList.contains('open')){dvCloseNotepad();return;}
});

/* ---------- Init ---------- */
(async()=>{
 await dvFontReady();
 dvFormat.dispatchEvent(new Event('change'));
 dvSyncPresets();
 dvDrawCanvas();
 requestAnimationFrame(()=>dvRenderItems());
})();

window.addEventListener('resize',()=>{
 if(!dvViewBanner.classList.contains('dv-hidden'))dvRenderItems();
});

window.addEventListener('pagehide',()=>{
 dvRevoke(dvImgState.sourceUrl);dvRevoke(dvImgState.loaderUrl);dvRevoke(dvImgState.resultUrl);
});
})();