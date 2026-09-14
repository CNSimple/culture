/* Interactive knowledge graph: all nodes and edges are generated from the local culture dataset. */
(() => {
  const graphPage = document.getElementById('graph');
  if (!graphPage) return;

  const facts = [
    {name:'黄粱一梦',people:['卢生','吕翁'],places:['黄粱梦吕仙祠','邯郸古城'],source:'《枕中记》',theme:'梦境与人生',period:'唐代',caption:'一枕黄粱，人生如梦'},
    {name:'胡服骑射',people:['赵武灵王'],places:['赵王城遗址'],source:'《史记·赵世家》',theme:'改革创新',period:'战国时期',caption:'兼收并蓄，变革图强'},
    {name:'邯郸学步',people:['燕国少年'],places:['学步桥','邯郸古城'],source:'《庄子·秋水》',theme:'模仿与自我',period:'战国时期',caption:'学人步履，勿失本心'},
    {name:'完璧归赵',people:['蔺相如','赵惠文王'],places:['赵王城遗址'],source:'《史记·廉颇蔺相如列传》',theme:'智勇与守信',period:'战国时期',caption:'持璧归赵，不辱使命'},
    {name:'负荆请罪',people:['廉颇','蔺相如'],places:['赵王城遗址'],source:'《史记·廉颇蔺相如列传》',theme:'知错能改',period:'战国时期',caption:'将相和，知过能改'},
    {name:'毛遂自荐',people:['毛遂','平原君'],places:['赵王城遗址'],source:'《史记·平原君虞卿列传》',theme:'勇于担当',period:'战国时期',caption:'挺身而出，勇担使命'},
    {name:'纸上谈兵',people:['赵括','廉颇'],places:['赵王城遗址'],source:'《史记·廉颇蔺相如列传》',theme:'知行合一',period:'战国时期',caption:'空谈易，践行难'},
    {name:'渑池之会',people:['蔺相如','赵惠文王'],places:['赵王城遗址'],source:'《史记·廉颇蔺相如列传》',theme:'家国担当',period:'战国时期',caption:'据理力争，维护国体'}
  ];
  const types = {
    idiom:{label:'成语',symbol:'语',relation:'核心成语'},
    person:{label:'人物',symbol:'人',relation:'相关人物'},
    place:{label:'地点',symbol:'址',relation:'关联地点'},
    source:{label:'典籍',symbol:'书',relation:'典籍出处'},
    theme:{label:'主题',symbol:'意',relation:'故事主题'},
    period:{label:'时期',symbol:'时',relation:'历史时期'}
  };
  const key=(type,name)=>`${type}:${name}`;
  const nodes=new Map();
  const edges=[];
  const addNode=(type,name)=>{
    const id=key(type,name);
    if(!nodes.has(id))nodes.set(id,{id,type,name});
    return id;
  };
  const addEdge=(from,type,name)=>edges.push({from,to:addNode(type,name),type,label:types[type].relation});
  facts.forEach(fact=>{
    const from=addNode('idiom',fact.name);
    fact.people.forEach(name=>addEdge(from,'person',name));
    fact.places.forEach(name=>addEdge(from,'place',name));
    addEdge(from,'source',fact.source);
    addEdge(from,'theme',fact.theme);
    addEdge(from,'period',fact.period);
  });

  const state={selected:key('idiom','黄粱一梦'),filter:'all',mode:'focus',scale:1,tx:0,ty:0};
  const svg=document.getElementById('graph-svg');
  const viewport=document.getElementById('graph-viewport');
  const stage=document.getElementById('graph-stage');
  const search=document.getElementById('graph-search');
  const suggestions=document.getElementById('graph-search-results');
  const NS='http://www.w3.org/2000/svg';
  const mobile=()=>window.matchMedia('(max-width:650px)').matches;
  const viewWidth=()=>mobile()&&state.mode==='focus'?600:1100;
  const el=(tag,attrs={})=>{
    const item=document.createElementNS(NS,tag);
    for(const [name,value] of Object.entries(attrs))item.setAttribute(name,String(value));
    return item;
  };
  const related=id=>edges.filter(edge=>edge.from===id||edge.to===id).map(edge=>({edge,node:nodes.get(edge.from===id?edge.to:edge.from)}));
  const shownEdges=()=>edges.filter(edge=>state.filter==='all'||edge.type===state.filter);
  const selectedNode=()=>nodes.get(state.selected);
  const status=message=>{document.getElementById('graph-status').textContent=message};

  function layoutFocus(){
    const links=related(state.selected).filter(item=>state.filter==='all'||item.edge.type===state.filter);
    const cx=mobile()?300:550,cy=mobile()?320:315;
    const rx=mobile()?207:342,ry=mobile()?217:226;
    const positions=new Map([[state.selected,{x:cx,y:cy}]]);
    links.forEach((item,index)=>{
      const angle=-Math.PI/2+(Math.PI*2*index/links.length);
      positions.set(item.node.id,{x:cx+rx*Math.cos(angle),y:cy+ry*Math.sin(angle)});
    });
    return {positions,links,edges:links.map(item=>item.edge)};
  }

  function layoutAll(){
    const positions=new Map();
    const columns={source:{x:105,start:100,step:112},person:{x:340,start:70,step:93},idiom:{x:675,start:90,step:95},place:{x:970,start:170,step:140},theme:{x:1195,start:85,step:88},period:{x:1260,start:760,step:90}};
    Object.keys(columns).forEach(type=>{
      const group=[...nodes.values()].filter(node=>node.type===type);
      const col=columns[type];
      group.forEach((node,index)=>positions.set(node.id,{x:col.x,y:col.start+index*col.step}));
    });
    return {positions,edges:shownEdges(),links:related(state.selected)};
  }

  function transform(){
    viewport.setAttribute('transform',`translate(${state.tx} ${state.ty}) scale(${state.scale})`);
    document.getElementById('graph-zoom-value').textContent=`${Math.round(state.scale*100)}%`;
  }
  function centerView(){
    if(state.mode==='all'){state.scale=.73;state.tx=18;state.ty=5}
    else{state.scale=1;state.tx=0;state.ty=0}
    transform();
  }
  function setZoom(next){
    const previous=state.scale;
    state.scale=Math.max(.45,Math.min(2.2,next));
    const cx=viewWidth()/2,cy=340;
    state.tx=cx-(cx-state.tx)*state.scale/previous;
    state.ty=cy-(cy-state.ty)*state.scale/previous;
    transform();
  }

  function drawEdge(edge,positions,focus){
    const a=positions.get(edge.from),b=positions.get(edge.to);
    if(!a||!b)return;
    const dx=b.x-a.x,dy=b.y-a.y,length=Math.hypot(dx,dy)||1;
    const fromRadius=focus&&edge.from===state.selected?76:focus?48:31;
    const toRadius=focus&&edge.to===state.selected?76:focus?48:31;
    const x1=a.x+dx/length*fromRadius,y1=a.y+dy/length*fromRadius;
    const x2=b.x-dx/length*(toRadius+7),y2=b.y-dy/length*(toRadius+7);
    const line=el('path',{d:`M ${x1} ${y1} L ${x2} ${y2}`,class:`graph-edge ${edge.type}${!focus&&edge.from!==state.selected&&edge.to!==state.selected?' dimmed':''}`});
    viewport.append(line);
    if(focus){
      const mostlyVertical=Math.abs(dx)<150;
      const label=el('text',{x:(x1+x2)/2+(mostlyVertical?62:0),y:(y1+y2)/2-7,class:`graph-edge-label ${edge.type}`});
      label.textContent=edge.label;
      viewport.append(label);
    }
  }

  function drawNode(node,position,focus){
    const selected=node.id===state.selected;
    const radius=focus?(selected?69:42):(selected?36:29);
    const connected=selected||related(state.selected).some(item=>item.node.id===node.id);
    const group=el('g',{transform:`translate(${position.x} ${position.y})`,class:`graph-node ${node.type}${selected?' selected':''}${!focus&&!connected?' dimmed':''}`,tabindex:'0',role:'button','aria-label':`${node.name}，${types[node.type].label}，点击查看关系`});
    group.dataset.nodeId=node.id;
    group.append(el('circle',{r:radius+4,class:'node-halo'}));
    group.append(el('circle',{r:radius-4,class:'node-inner'}));
    const symbol=el('text',{x:0,y:-2,class:'node-symbol'});
    symbol.textContent=selected&&node.type==='idiom'?node.name:node.name.slice(0,1);
    if(selected&&node.type==='idiom')symbol.setAttribute('font-size','23');
    group.append(symbol);
    if(!(selected&&node.type==='idiom')){
      const name=el('text',{x:0,y:radius+25,class:'node-name'});
      name.textContent=node.name;
      group.append(name);
    }
    if(focus){
      const kind=el('text',{x:0,y:radius+43,class:'node-kind'});
      kind.textContent=types[node.type].label;
      group.append(kind);
    }
    group.addEventListener('click',event=>{event.stopPropagation();selectNode(node.id)});
    group.addEventListener('keydown',event=>{if(event.key==='Enter'||event.key===' '){event.preventDefault();selectNode(node.id)}});
    viewport.append(group);
  }

  function renderCanvas(){
    viewport.replaceChildren();
    svg.setAttribute('viewBox',`0 0 ${viewWidth()} 680`);
    const focus=state.mode==='focus';
    const layout=focus?layoutFocus():layoutAll();
    layout.edges.forEach(edge=>drawEdge(edge,layout.positions,focus));
    layout.positions.forEach((position,id)=>drawNode(nodes.get(id),position,focus));
    document.getElementById('graph-empty').hidden=layout.edges.length>0;
    document.getElementById('graph-view-title').textContent=focus?`${selectedNode().name} · 关系网络`:'邯郸文化 · 全景图谱';
    document.getElementById('graph-view-subtitle').textContent=focus?`发现 ${layout.links.length} 条直接关系`:`共 ${nodes.size} 个实体 · ${layout.edges.length} 条关系`;
    transform();
  }

  function describe(node){
    if(node.type==='idiom')return idioms[node.name]?.meaning||'邯郸文化中的经典成语。';
    const names=related(node.id).map(item=>item.node.name);
    if(node.type==='person')return `${node.name}与${names.slice(0,3).join('、')}等成语故事有关。点击下方线索可追踪对应典故。`;
    if(node.type==='place')return `${node.name}是图谱中的文化地点，与${names.slice(0,3).join('、')}等故事建立关联。`;
    if(node.type==='source')return `${node.name}是相关成语的文献出处。图谱将它与${names.slice(0,3).join('、')}相连，方便追溯典故。`;
    if(node.type==='theme')return `${node.name}是这些故事共同呈现的主题。沿关联线索可比较不同成语的表达。`;
    return `${node.name}与${names.slice(0,3).join('、')}等典故相关。`;
  }

  function renderDetail(){
    const node=selectedNode();
    const links=related(node.id);
    document.getElementById('graph-detail-type').textContent=types[node.type].label;
    document.getElementById('graph-detail-symbol').textContent=node.name[0];
    document.getElementById('graph-detail-symbol').className=`graph-detail-symbol ${node.type}`;
    document.getElementById('graph-detail-name').textContent=node.name;
    document.getElementById('graph-detail-caption').textContent=facts.find(fact=>fact.name===node.name)?.caption||`${types[node.type].label} · 邯郸文化线索`;
    document.getElementById('graph-detail-description').textContent=describe(node);
    document.getElementById('graph-related-count').textContent=`${links.length} 条`;
    const list=document.getElementById('graph-related-list');
    list.replaceChildren();
    links.forEach(({edge,node:neighbor})=>{
      const button=document.createElement('button');
      button.type='button';
      button.innerHTML=`<i class="related-dot ${neighbor.type}"></i><strong></strong><small></small>`;
      button.querySelector('strong').textContent=neighbor.name;
      button.querySelector('small').textContent=types[neighbor.type].label;
      button.title=`查看${neighbor.name}的关联关系`;
      button.addEventListener('click',()=>selectNode(neighbor.id));
      list.append(button);
    });
    const associatedIdiom=node.type==='idiom'?node.name:links.find(item=>item.node.type==='idiom')?.node.name;
    const detailButton=document.getElementById('graph-open-detail');
    detailButton.hidden=!associatedIdiom;
    detailButton.textContent=node.type==='idiom'?'查看成语档案 →':`查看「${associatedIdiom}」档案 →`;
    detailButton.dataset.name=associatedIdiom||'';
  }

  function renderFilters(){
    const filterList=document.getElementById('graph-filters');
    filterList.querySelectorAll('button').forEach(button=>{
      const active=button.dataset.relation===state.filter;
      button.classList.toggle('active',active);
      button.setAttribute('aria-pressed',String(active));
    });
  }
  function renderModes(){
    for(const [id,mode] of [['graph-focus-mode','focus'],['graph-all-mode','all']]){
      const button=document.getElementById(id);
      button.classList.toggle('active',state.mode===mode);
      button.setAttribute('aria-pressed',String(state.mode===mode));
    }
  }
  function render(){renderCanvas();renderDetail();renderFilters();renderModes()}
  function selectNode(id){
    if(!nodes.has(id))return;
    state.selected=id;
    if(state.mode==='focus')centerView();
    render();
    status(`已选中${selectedNode().name}，找到${related(id).length}条关联关系`);
  }
  function setMode(mode){state.mode=mode;centerView();render();status(mode==='focus'?'已切换为聚焦关系':'已切换为全景图谱')}

  document.getElementById('graph-filters').addEventListener('click',event=>{
    const button=event.target.closest('button[data-relation]');
    if(!button)return;
    state.filter=button.dataset.relation;
    render();
    status(`当前展示${button.textContent.trim()}关系`);
  });
  document.getElementById('graph-focus-mode').addEventListener('click',()=>setMode('focus'));
  document.getElementById('graph-all-mode').addEventListener('click',()=>setMode('all'));
  document.getElementById('graph-reset').addEventListener('click',()=>{
    state.selected=key('idiom','黄粱一梦');state.filter='all';state.mode='focus';search.value='';hideSuggestions();centerView();render();status('图谱视图已重置');
  });
  document.getElementById('graph-zoom-in').addEventListener('click',()=>setZoom(state.scale*1.2));
  document.getElementById('graph-zoom-out').addEventListener('click',()=>setZoom(state.scale/1.2));
  document.getElementById('graph-center-view').addEventListener('click',centerView);
  stage.addEventListener('wheel',event=>{event.preventDefault();setZoom(state.scale*(event.deltaY<0?1.1:.9))},{passive:false});
  let drag=null;
  svg.addEventListener('pointerdown',event=>{
    if(event.target.closest('.graph-node'))return;
    drag={x:event.clientX,y:event.clientY,tx:state.tx,ty:state.ty};
    svg.setPointerCapture(event.pointerId);
    svg.classList.add('dragging');
  });
  svg.addEventListener('pointermove',event=>{
    if(!drag)return;
    const rect=svg.getBoundingClientRect();
    state.tx=drag.tx+(event.clientX-drag.x)*viewWidth()/rect.width;
    state.ty=drag.ty+(event.clientY-drag.y)*680/rect.height;
    transform();
  });
  const endDrag=()=>{drag=null;svg.classList.remove('dragging')};
  svg.addEventListener('pointerup',endDrag);
  svg.addEventListener('pointercancel',endDrag);
  window.addEventListener('resize',()=>{centerView();renderCanvas()});

  const presets=document.getElementById('graph-presets');
  ['黄粱一梦','胡服骑射','完璧归赵','邯郸学步'].forEach(name=>{
    const button=document.createElement('button');button.type='button';button.innerHTML='<strong></strong><span>›</span>';
    button.querySelector('strong').textContent=name;
    button.addEventListener('click',()=>{state.mode='focus';state.filter='all';centerView();selectNode(key('idiom',name))});
    presets.append(button);
  });

  function hideSuggestions(){suggestions.hidden=true;search.setAttribute('aria-expanded','false')}
  function showSuggestions(query){
    suggestions.replaceChildren();
    if(!query){hideSuggestions();return}
    const matched=[...nodes.values()].filter(node=>node.name.toLowerCase().includes(query.toLowerCase())).slice(0,8);
    if(!matched.length){const empty=document.createElement('div');empty.className='no-results';empty.textContent='没有找到对应实体，请尝试成语、人物或地点名称。';suggestions.append(empty)}
    matched.forEach(node=>{
      const button=document.createElement('button');button.type='button';button.setAttribute('role','option');button.innerHTML='<span></span><small></small>';
      button.querySelector('span').textContent=node.name;button.querySelector('small').textContent=types[node.type].label;
      button.addEventListener('click',()=>{state.mode='focus';state.filter='all';centerView();selectNode(node.id);search.value=node.name;hideSuggestions()});
      suggestions.append(button);
    });
    suggestions.hidden=false;search.setAttribute('aria-expanded','true');
  }
  search.addEventListener('input',()=>showSuggestions(search.value.trim()));
  search.addEventListener('keydown',event=>{
    if(event.key==='Escape'){hideSuggestions();search.blur()}
    if(event.key==='Enter'&&!suggestions.hidden){event.preventDefault();suggestions.querySelector('button')?.click()}
  });
  document.addEventListener('click',event=>{if(!event.target.closest('.graph-search-wrap'))hideSuggestions()});
  document.getElementById('graph-open-detail').addEventListener('click',event=>{if(event.currentTarget.dataset.name)detail(event.currentTarget.dataset.name)});
  document.getElementById('graph-show-map').addEventListener('click',()=>{
    const node=selectedNode();
    const idiomName=node.type==='idiom'?node.name:related(node.id).find(item=>item.node.type==='idiom')?.node.name;
    page('home');
    const pin=[...document.querySelectorAll('.map-pin')].find(item=>item.dataset.idiom===idiomName);
    if(pin){pin.classList.add('graph-highlight');pin.focus();setTimeout(()=>pin.classList.remove('graph-highlight'),2400)}
  });

  document.getElementById('graph-node-count').textContent=nodes.size;
  document.getElementById('graph-edge-count').textContent=edges.length;
  ['all','person','place','source','theme','period'].forEach(type=>{
    const target=document.getElementById(`graph-filter-${type}-count`);
    target.textContent=type==='all'?edges.length:edges.filter(edge=>edge.type===type).length;
  });
  centerView();
  render();
})();
