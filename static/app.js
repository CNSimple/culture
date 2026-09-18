const fallbackIdioms={
  '黄粱一梦':{place:'黄粱梦吕仙祠',person:'卢生、吕翁',source:'《枕中记》',meaning:'比喻虚幻的梦想，或荣华富贵转眼成空。',story:true},
  '胡服骑射':{place:'赵王城遗址',person:'赵武灵王',source:'《史记·赵世家》',meaning:'学习他人的长处，勇于改革创新。',story:true},
  '邯郸学步':{place:'学步桥',person:'燕国少年',source:'《庄子·秋水》',meaning:'盲目模仿别人，反而失去自己原有的本领。',story:false},
  '完璧归赵':{place:'赵王城遗址',person:'蔺相如',source:'《史记·廉颇蔺相如列传》',meaning:'把原物完好无损地归还原主。',story:false},
  '负荆请罪':{place:'赵王城遗址',person:'廉颇、蔺相如',source:'《史记·廉颇蔺相如列传》',meaning:'主动承认错误并请求责罚。',story:false},
  '毛遂自荐':{place:'赵王城遗址',person:'毛遂',source:'《史记·平原君虞卿列传》',meaning:'主动推荐自己承担任务。',story:false},
  '纸上谈兵':{place:'赵王城遗址',person:'赵括',source:'《史记·廉颇蔺相如列传》',meaning:'空谈理论，不能解决实际问题。',story:false},
  '渑池之会':{place:'赵王城遗址',person:'蔺相如、赵惠文王',source:'《史记·廉颇蔺相如列传》',meaning:'赵秦两国会盟中维护国家尊严的故事。',story:false}
};
let idioms=fallbackIdioms;
try{idioms=JSON.parse(document.getElementById('idioms-data').textContent)}catch(error){/* Direct-file preview uses local data. */}
let current='黄粱一梦';let tab='basic';
async function api(path,options){
  if(location.protocol!=='file:')return fetch(path,options);
  let data;
  if(path==='/api/ask'){
    const question=JSON.parse(options.body).question;
    const topic=Object.keys(idioms).find(name=>question.includes(name))||'黄粱一梦';
    const item=idioms[topic];
    data={answer:`${topic}：${item.meaning} 相关人物有${item.person}，相关地点为${item.place}。`,topic,sources:[item.source,'邯郸地方文化资料（原型示例）']};
  }else if(path==='/api/recognize'){
    data={name:options.body.get('scene'),description:'这是演示场景的关联资料。正式图片识别需要接入图像模型。'};
  }else if(path==='/api/study'){
    const config=JSON.parse(options.body);
    data={title:`邯郸${config.days}日成语研学路线`,subtitle:`适合${config.age} · 历史溯源 · 文化体验`,stops:['赵王城遗址：认识赵国历史','学步桥：探究邯郸学步','黄粱梦吕仙祠：解读黄粱一梦','响堂山石窟：观察文化遗产']};
  }
  return {ok:true,json:async()=>data};
}
const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)];
function page(name){$$('.page').forEach(x=>x.classList.toggle('active',x.id===name));$$('#nav [data-page]').forEach(x=>x.classList.toggle('active',x.dataset.page===name));$('#detail-overlay').hidden=true;window.scrollTo({top:0,behavior:'smooth'});}
function detail(name){current=idioms[name]?name:'黄粱一梦';tab='basic';$('#detail-title').textContent=current;$('#detail-overlay').hidden=false;renderTab();}
function renderTab(){const x=idioms[current];$$('.detail-tabs button').forEach(b=>b.classList.toggle('active',b.dataset.tab===tab));const content={basic:`<h3>成语释义</h3><p>${x.meaning}</p><h3>典故出处</h3><p>${x.source}</p><h3>相关人物</h3><p>${x.person}</p><h3>相关遗址</h3><p>${x.place}</p>`,origin:`<h3>历史渊源</h3><p>“${current}”与邯郸的历史文化相连。可从${x.source}入手，了解典故的记载与流传。</p><p class="demo-note">本页为教学原型摘要，正式版应补充史料原文、版本及注释。</p>`,people:`<h3>相关人物</h3><p>${x.person}</p><p>点击知识图谱，可以进一步查看人物与地点的关系。</p>`,places:`<h3>相关遗址</h3><p>${x.place}</p><p>从地图入口探索对应的文化地点。</p>`};$('#detail-content').innerHTML=content[tab];$('#detail-story').textContent=x.story?'▶ 进入剧情体验':'剧情体验开发中';$('#detail-story').disabled=!x.story;}
function makeCards(){const names=Object.keys(idioms);$('#hot-list').innerHTML=names.slice(0,5).map(n=>`<button data-idiom="${n}">◈ ${n}　›</button>`).join('');$('#recommend-list').innerHTML=names.slice(0,4).map((n,i)=>`<button class="rec-card" data-idiom="${n}"><div class="rec-art">${['梦','骑','步','璧'][i]}</div><div><strong>${n}</strong><span>${idioms[n].place}</span><span>探索典故 →</span></div></button>`).join('');$('#idiom-grid').innerHTML=names.map((n,i)=>`<button class="idiom-card" data-idiom="${n}"><div class="rec-art">${n[0]}</div><div><strong>${n}</strong><span>${idioms[n].source}</span><p>${idioms[n].meaning}</p></div></button>`).join('');}
document.addEventListener('click',e=>{const p=e.target.closest('[data-page]');if(p){page(p.dataset.page);return}const n=e.target.closest('[data-idiom]');if(n){detail(n.dataset.idiom);return}});
$$('#filters button').forEach(b=>b.addEventListener('click',()=>{$$('#filters button').forEach(x=>x.classList.toggle('selected',x===b));const filter=b.dataset.filter;$$('.map-pin').forEach(x=>x.style.display=(filter==='全部'||filter==='成语')?'':'none');$$('.city').forEach(x=>x.style.opacity=(filter==='全部'||filter==='古迹')?'1':'.35');}));
$$('.graph-filters button').forEach(b=>b.addEventListener('click',()=>{$$('.graph-filters button').forEach(x=>x.classList.toggle('selected',x===b));}));
$('#close-detail').onclick=()=>$('#detail-overlay').hidden=true;$('#detail-overlay').addEventListener('click',e=>{if(e.target.id==='detail-overlay')e.currentTarget.hidden=true});document.addEventListener('keydown',e=>{if(e.key==='Escape')$('#detail-overlay').hidden=true});$$('.detail-tabs button').forEach(b=>b.onclick=()=>{tab=b.dataset.tab;renderTab()});$('#detail-graph').onclick=()=>{window.location.href='/knowledge-graph'};$('#detail-story').onclick=()=>{if(idioms[current].story){page('story');$('#story .story-switch b').textContent=current;$('#story .story-switch span').textContent=current==='胡服骑射'?'黄粱一梦':'胡服骑射';$('#speaker').textContent=current==='胡服骑射'?'赵武灵王':'卢生';$('#dialogue-text').textContent=current==='胡服骑射'?'“今后，赵国将胡服骑射，以强国备。”':'“一枕醒来，方知荣华不过一梦。”';}};
$('#ask-form').addEventListener('submit',async e=>{e.preventDefault();const input=$('#question'),q=input.value.trim();if(!q)return;addMessage(q,'me');input.value='';try{const res=await api('/api/ask',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({question:q})});const data=await res.json();if(!res.ok)throw Error(data.error||'请求失败');addMessage(data.answer+'\n\n原型示例回答 · 可点击右侧史料继续查阅','bot');$('#source-list').innerHTML=data.sources.map((s,i)=>`<div class="source"><b>${i+1}. ${s}</b><span>与“${data.topic}”相关的参考资料</span></div>`).join('')}catch(err){addMessage('暂时无法获取回答：'+err.message,'bot')}});
function addMessage(text,kind){const div=document.createElement('div');div.className='message '+kind;div.textContent=text;$('#messages').append(div);$('#messages').scrollTop=$('#messages').scrollHeight;}
$('#image-file').addEventListener('change',e=>{const file=e.target.files[0];if(!file)return;const url=URL.createObjectURL(file);$('#preview').innerHTML=`<img alt="上传图片预览">`;$('#preview img').src=url;});
$('#recognize-btn').onclick=async()=>{const body=new FormData();body.append('scene',$('#scene').value);const res=await api('/api/recognize',{method:'POST',body});const data=await res.json();$('#recognize-output').innerHTML=`<span class="result-badge">${data.name}</span><p><strong>识别说明：</strong>${data.description}</p><p><strong>关联探索：</strong>可从首页地图与知识图谱继续查找这处遗产的历史关系。</p><button class="primary" data-page="home">返回文化地图 →</button>`;};
$('#generate-study').onclick=async()=>{const res=await api('/api/study',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({age:$('#age').value,days:$('#days').value})});const data=await res.json();$('#study-output').innerHTML=`<span class="eyebrow">原型示例路线</span><h3>${data.title}</h3><p>${data.subtitle}</p><div class="route-steps">${data.stops.map((x,i)=>`${i?'<b>→</b>':''}<span>${x}</span>`).join('')}</div>`;};
$$('[data-study]').forEach(b=>b.onclick=()=>{if(b.dataset.study==='route')$('#generate-study').click();else{const labels={material:'学习资料',manual:'研学手册',script:'故事剧本'};$('#study-output').innerHTML=`<span class="eyebrow">${labels[b.dataset.study]}</span><h3>内容模板预览</h3><p>正式版将在此生成可编辑、可导出的${labels[b.dataset.study]}。目前可体验研学路线生成功能。</p>`;}});
const lines={"胡服骑射":[['赵武灵王','“今后，赵国将胡服骑射，以强国备。”'],['侍臣','“变更服饰与骑射之法，是否会遭到反对？”'],['赵武灵王','“取其所长，方能使赵国更强。”']],"黄粱一梦":[['卢生','“若能享尽荣华，人生便无憾了。”'],['吕翁','“且枕此枕，看看你的梦。”'],['卢生','“一枕醒来，方知荣华不过一梦。”']]};let line=0;$('#next-line').onclick=()=>{const key=$('#story .story-switch b').textContent;line=(line+1)%lines[key].length;[$('#speaker').textContent,$('#dialogue-text').textContent]=lines[key][line];};$('#hotspot-1').onclick=()=>detail($('#story .story-switch b').textContent);$('#hotspot-2').onclick=()=>$('#next-line').click();$('#hotspot-3').onclick=()=>page('home');$('#fullscreen-btn').onclick=()=>{const el=$('.story-stage');if(document.fullscreenElement)document.exitFullscreen();else el.requestFullscreen?.()};
function speak(){if(!('speechSynthesis'in window))return;window.speechSynthesis.cancel();const u=new SpeechSynthesisUtterance($('#dialogue-text').textContent);u.lang='zh-CN';u.rate=.9;window.speechSynthesis.speak(u)}$('#sound-btn').onclick=speak;$('#play-audio').onclick=speak;
const originalStoryClick=$('#detail-story').onclick;$('#detail-story').onclick=()=>{originalStoryClick();if(idioms[current].story){line=0;$('.story-stage').classList.toggle('dream',current==='黄粱一梦');$('#speaker').textContent=lines[current][0][0];$('#dialogue-text').textContent=lines[current][0][1];}};
makeCards();
[['.city-b','胡服骑射'],['.city-c','邯郸学步'],['.city-d','黄粱一梦'],['.city-e','黄粱一梦']].forEach(([selector,name])=>{
  const city=document.querySelector(selector);
  if(city){city.setAttribute('role','button');city.setAttribute('tabindex','0');city.dataset.idiom=name;city.title=`查看${name}`;city.addEventListener('keydown',event=>{if(event.key==='Enter'||event.key===' '){event.preventDefault();detail(name)}})}
});
// The illustration is one bitmap: an SVG region follows its 1536×1024 coordinates.
const mapArt=document.querySelector('.map-art');
const ancientCity=document.querySelector('.city-a');
if(mapArt&&ancientCity){
  const region=document.createElementNS('http://www.w3.org/2000/svg','svg');
  region.setAttribute('class','map-regions');
  region.setAttribute('viewBox','0 0 1536 1024');
  region.setAttribute('preserveAspectRatio','xMidYMid meet');
  const cityOutline='M 873 285 L 899 221 L 947 185 L 1075 159 L 1132 174 L 1180 217 L 1162 295 L 1099 321 L 959 322 Z';
  region.innerHTML=`<defs><clipPath id="ancient-city-clip"><path d="${cityOutline}" /></clipPath></defs><image class="map-region-image" href="/static/art/handan-map.png" x="0" y="0" width="1536" height="1024" clip-path="url(#ancient-city-clip)" aria-hidden="true" /><path class="map-region map-region--ancient-city" d="${cityOutline}" role="button" tabindex="0" aria-label="高亮邯郸古城区域" />`;
  mapArt.insertBefore(region,mapArt.firstChild);
  const path=region.querySelector('.map-region');
  const hint=document.querySelector('.map-heading small');
  const initialHint=hint?.textContent;
  const toggleCity=()=>{
    const active=!mapArt.classList.contains('is-ancient-city-selected');
    mapArt.classList.toggle('is-ancient-city-selected',active);
    ancientCity.classList.toggle('is-map-selected',active);
    ancientCity.setAttribute('aria-pressed',String(active));
    path.setAttribute('aria-pressed',String(active));
    if(hint)hint.textContent=active?'邯郸古城已高亮 · 再次点击取消':initialHint;
  };
  ancientCity.setAttribute('role','button');
  ancientCity.setAttribute('tabindex','0');
  ancientCity.setAttribute('aria-label','高亮邯郸古城区域');
  ancientCity.setAttribute('aria-pressed','false');
  ancientCity.addEventListener('click',toggleCity);
  ancientCity.addEventListener('keydown',event=>{if(event.key==='Enter'||event.key===' '){event.preventDefault();toggleCity()}});
  path.addEventListener('click',toggleCity);
  path.addEventListener('keydown',event=>{if(event.key==='Enter'||event.key===' '){event.preventDefault();toggleCity()}});
}
const searchForm=document.getElementById('site-search');
searchForm.addEventListener('submit',event=>{
  event.preventDefault();
  const query=document.getElementById('search-input').value.trim();
  if(!query)return;
  const match=Object.keys(idioms).find(name=>name.includes(query)||query.includes(name)||idioms[name].person.includes(query)||idioms[name].place.includes(query));
  if(match){detail(match);return;}
  page('idioms');
  document.querySelectorAll('#idiom-grid .idiom-card').forEach(card=>{
    card.hidden=!card.textContent.includes(query);
  });
});
document.getElementById('search-input').addEventListener('input',event=>{
  if(event.target.value.trim())return;
  document.querySelectorAll('#idiom-grid .idiom-card').forEach(card=>card.hidden=false);
});
const initialPage=new URLSearchParams(window.location.search).get('page');
if(initialPage&&document.getElementById(initialPage)?.classList.contains('page'))page(initialPage);

// The Vue map runs in the central iframe and publishes its current cultural context.
// Only the assistant copy changes; the existing assistant actions and page layout stay intact.
const homeMapFrame=document.querySelector('.home-map-frame');
const mapAssistantGreeting=document.getElementById('map-assistant-greeting');
const mapAssistantContext=document.getElementById('map-assistant-context');
const mapAssistantQuestion=document.getElementById('map-assistant-question');
function updateMapAssistant(context){
  if(!context||!mapAssistantGreeting||!mapAssistantContext||!mapAssistantQuestion)return;
  if(context.type==='city'){
    mapAssistantGreeting.firstChild.textContent='你好！我是小邯。今天想探索哪段邯郸故事？';
    mapAssistantContext.hidden=true;
    mapAssistantQuestion.textContent='“黄粱一梦发生在哪里？”';
    return;
  }
  const stats=context.stats||{};
  mapAssistantGreeting.firstChild.textContent=context.selectedEntity
    ?`你好，我们正在探索${context.location}的${context.selectedEntity}。`
    :`你好，我们现在来到了${context.location}。`;
  mapAssistantContext.hidden=false;
  mapAssistantContext.replaceChildren();
  const intro=document.createTextNode('这里关联：');
  const counts=document.createElement('b');
  counts.textContent=` ${stats.idioms||0} 个成语典故 · ${stats.people||0} 位历史人物 · ${stats.sites||0} 处文化遗址`;
  mapAssistantContext.append(intro,document.createElement('br'),counts);
  mapAssistantQuestion.textContent=`“${context.questions?.[0]||`介绍${context.location}`}”`;
}
window.addEventListener('message',event=>{
  if(event.origin!==window.location.origin||event.source!==homeMapFrame?.contentWindow)return;
  if(event.data?.type==='yanzhao:map-context')updateMapAssistant(event.data.context);
});
homeMapFrame?.addEventListener('load',()=>{
  homeMapFrame.contentWindow?.postMessage({type:'yanzhao:request-map-context'},window.location.origin);
});

