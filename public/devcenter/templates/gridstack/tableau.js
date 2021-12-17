var advGrid,tabfilters,allviz=[],disableSaving=false,curSelIndex,lastScrollY=0;
var prefix="widget---templates/gridstack/index.html-";
var first=true;

function waitFor(selector) {
  return new Promise(resolve => {
      if (document.querySelector(selector)) {
          return resolve(document.querySelector(selector));
      }

      const observer = new MutationObserver(mutations => {
          if (document.querySelector(selector)) {
              resolve(document.querySelector(selector));
              observer.disconnect();
          }
      });

      observer.observe(document.body, {
          childList: true,
          subtree: true
      });
  });
}
async function loadVizInit(force){
  if(first==false && typeof(force)=='undefined')
    return;
  first=false
  document.querySelector(".page-section.main").style.minHeight = (document.documentElement.clientHeight-133) +"px";
  if(isExported()==true)
    prefix=prefix+String(unique_exportID)+"-";
  console.log("TRIGGERED FROM")
  tabfilters = new TabFilters();
  await waitFor('#advanced-grid');
  go();
  if(document.querySelector(`[gs-id='${prefix}filters']`)==null)
    addWidgetToolbar();
  tab_server.map((vz,index)=>{
    var url = tab_server[index];
    if(url!="")
      addNew(url,index);
  })
  initialize();
  setTimeout(() => {
    advGrid.setAnimation(true);
  }, 5000);
}
function resetFilters(){
  tabfilters.embeddedVizzes.map((el)=>{
    el.vizObject.revertAllAsync();
  })
}
function applyParam(pname,val){
  var parameterObj = {
    scope: {
      mode: "page"
    },
    parameter: {
      parameterName: pname,
      values: val
    }
  };
  tabfilters.applyParameters(parameterObj);
}
function applyFilter(fname,val){
  var filterObject = {
    scope: {
      mode: "page"
    },
    filter: {
      fieldName: fname,
      updateType: "replace",
      values: [val]
    }
  };
  tabfilters.applyFilters(filterObject);
}
function go(){
  advGrid = GridStack.init({
    dragInOptions:{scroll:true},
    float: false,
    cellHeight:"1.5em",
    column: 60,
    animate:false,
    verticalMargin: 10,
    resizable:{autoHide: true, handles: 'sw,se'},
    alwaysShowResizeHandle: /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent),
    acceptWidgets: true,
    dragIn: '.newWidget',  // class that can be dragged from outside
    dragInOptions: { revert: 'invalid', scroll: false, appendTo: 'body', helper: 'clone' },
    removable: '#trash',
    draggable: {
      handle: '.move-overlay',
      start: function() {
        document.getElementsByClassName("viz").style.display="none";
      },
      stop: function() {
        document.getElementsByClassName("viz").style.display="block";
      },
    },
    removeTimeout: 100
  }, '#advanced-grid');
  advGrid.on('change', function(event, items) {
    if(disableSaving==false)
      items.forEach(function(item) {
        localStorage.setItem(item.id,JSON.stringify({w:item.w,h:item.h,x:item.x,y:item.y}))
      });
  });
  advGrid.on('dragstart', function(event, items) {
    document.querySelectorAll(".move-overlay").forEach(function(item) {
      item.style.height="100%";
    });
  });
  advGrid.on('dragstop', function(event, items) {
    document.querySelectorAll(".move-overlay").forEach(function(item) {
      item.style.height="15px";
    });
  });
  advGrid.on('resizestart', function(event, items) {
    expandOverlay();
  });
  advGrid.on('resizestop', function(event, items) {
    minimizeOverlay();
  });
}
function makeid(length) {
  var result           = '';
  var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
  var charactersLength = characters.length;
  for ( var i = 0; i < length; i++ ) {
    result += characters.charAt(Math.floor(Math.random() * 
    charactersLength));
  }
  return result;
}
function loadVizByIndex(){

}
function populateParameterMenu(filpam){
  var links="";
  var values=filpam.getAllowableValues() || filpam.getAppliedValues() ;
  var filPamName=filpam.getName() || filpam.getFieldName();
  if(values==null){
    console.log("this param as no allowable values :"+filPamName);
    return;
  }
  values.map((val)=>{
    var found=false;
    document.querySelectorAll(`[paramName="${filPamName}"]`).forEach((el)=>{
      if(el.text==val.value)
        found=true;
    })
    if(!found ){
      links+=`<li><div paramName="${filPamName}" class="text-uppercase filter-entry dropdown-item" onclick="applyParam('${filPamName}','${val.value}')">${val.value}</div></li>`;
    }
  })
  var list=`
  <div class="filter_dropdown dropdown">
    <button paramName="Filter-text-${filPamName}" id="Filter-text-${filPamName}" class="text-uppercase btn btn-secondary btn-default dropdown-toggle editable" type="button" data-bs-toggle="dropdown" aria-expanded="false">
    ${filPamName.toUpperCase()}
    </button>
    <ul mid="${filPamName}" class="dropdown-menu" aria-labelledby="Filter-text-${filPamName}">
      ${links}
    </ul>
  </div>`
  if(document.querySelector(`ul[mid='${filPamName}']`)==null){
    document.getElementById("f0").innerHTML=document.getElementById("f0").innerHTML+list;
  }
  else{
    document.querySelector(`ul[mid='${filPamName}']`).innerHTML+=links;
  }
}
function populateFilterMenu(fil){
  var links="";
  if(fil.getAppliedValues()==null){
    console.log("this filter as no applied values :"+fil.getFieldName());
    return;
  }
  fil.getAppliedValues().map((val)=>{
    var found=false;
    document.querySelectorAll(`div[filName="${fil.getFieldName()}"]`).forEach((el)=>{
      if(el.innerText==val.value.toString())
        found=true;
    })
    if(!found ){
      links+=`<li><div filName="${fil.getFieldName()}" class="text-uppercase filter-entry dropdown-item" onclick="applyFilter('${fil.getFieldName()}','${val.value}')">${val.value}</div></li>`
    }
  }) 
  var tp=`<div class="filter_dropdown dropdown">
              <button filName="Filter-text-${fil.getFieldName()}" id="Filter-text-${fil.getFieldName()}" class="text-uppercase btn btn-secondary btn-default dropdown-toggle editable" type="button" data-bs-toggle="dropdown" aria-expanded="false">
              ${fil.getFieldName().toUpperCase()}
              </button>
              <ul mid="${fil.getFieldName()}" class="dropdown-menu" aria-labelledby="Filter-text-${fil.getFieldName()}">
                ${links}
              </ul>
            </div>
    `
    if(document.querySelector(`ul[mid='${fil.getFieldName()}']`)==null){
      document.getElementById("f0").innerHTML=document.getElementById("f0").innerHTML+tp;
    }
    else{
      document.querySelector(`ul[mid='${fil.getFieldName()}']`).innerHTML+=links;
    }   
}
function isExported(){
  return typeof(widget_pos)!='undefined';
}
function getWidgetPosStatic(index){
  var ret=null;
  if(typeof(widget_pos)!='undefined'){
    widget_pos.map((el)=>{
      if(el.key==index)
        ret=el.val;
    })
    return ret;
  }
}
function hasHiddenWidget(){
  document.querySelector(".hiddenW").style.display="none";
  document.querySelectorAll(`[gs-id]`).forEach(element => {
    if(element.style.display=="none"){
      document.querySelector(".hiddenW").style.display="inline-block";
    }
  })
}
function showHiddenWidgets(){
  var elems=Array.prototype.slice.call(document.querySelectorAll(`[gs-id]`), 0);
    elems.sort((a,b)=>{//sort from higher to lower to avoid unmanageable reorg :-)
      if(parseInt(a.getAttribute("gs-y"))>parseInt(b.getAttribute("gs-y")))
        return 1;
      return -1;  
    })
  elems.forEach(element => {
    if(element.style.display=="none"){
      element.style.display="unset";
      advGrid.makeWidget(element);
      var id=element.getAttribute("gs-id");
      localStorage.setItem(id+"-visibility","true");
    }
  });
  hasHiddenWidget();
}
function addWidgetToolbar(){
  var id=makeid(10);
  var storedCoord=localStorage.getItem(prefix+"filters");
  var w=60,h=3,x=0,y=0;
  if(storedCoord!=null){
    storedCoord=storedCoord.replaceAll("'",'"');
    storedCoord=JSON.parse(storedCoord);
    w=storedCoord.w;
    h=storedCoord.h;
    x=storedCoord.x;
    y=storedCoord.y
  }else{
    var pos=getWidgetPosStatic("filters");
    if(pos!=null){
      w=pos.w;
      h=pos.h;
      x=pos.x;
      y=pos.y;
    }
    localStorage.setItem(prefix+"filters",JSON.stringify({w:w,h:h,x:x,y:y}))
  }
  advGrid.addWidget({id:prefix+"filters",w:w,h:h,x:x,y:y, minH:4,content: 
   `<div class="move-overlay" onmouseup="minimizeOverlay(this,event)" onmousedown="expandOverlay(this,event)"></div> 
    <div class="filter-container" id="f0">
    <button class="btn btn-secondary btn-default filter_dropdown" onclick="resetFilters()">RESET</button>
    <button class="btn btn-secondary btn-default filter_dropdown hiddenW" onclick="showHiddenWidgets()">SHOW HIDDEN</button>
    </div>
    `
  });
  document.getElementById("f0").parentElement.classList.add("filter-widget");
  return id;
}
function addNew(url,index){
  var id=makeid(10);
  var storedCoord=localStorage.getItem(prefix+""+index);
  var w=30,h=25,x=advGrid.getRow(),y=0;
  if(storedCoord!=null){
    storedCoord=storedCoord.replaceAll("'",'"');
    storedCoord=JSON.parse(storedCoord);
    w=storedCoord.w;
    h=storedCoord.h;
    x=storedCoord.x;
    y=storedCoord.y
  }else{
    var pos=getWidgetPosStatic(""+index);
    if(pos!=null){
      w=pos.w;
      h=pos.h;
      x=pos.x;
      y=pos.y;
    }
    localStorage.setItem(prefix+""+index,JSON.stringify({w:w,h:h,x:x,y:y}));
  }
  advGrid.addWidget({id:prefix+""+index,w:w,h:h,x:x,y:y,minH:4,minW:10, content: 
   `<div class="move-overlay" onmouseup="minimizeOverlay(this,event)" onmousedown="expandOverlay(this,event)"><div class="dot">...</div></div>
    <div class="widget-btn">
      <div class="close-widget btn-menu" title="Hide Widget" onClick="removeWidget(this.parentNode.parentNode.parentNode,event)"><i class="ico-handle fa fa-ban"></i></div>
      <div class="dl-widget btn-menu" title="Download Data" onClick="downloadData('${index}')"><i class="ico-handle fa fa-database"></i></div>
      <div class="action-widget btn-menu" title="Trigger Action, you have to select element on the viz" onClick="launchAction('${index}')"><i class="ico-handle fa fa-search"></i></div>
      <div class="ask-widget btn-menu" title="Launch Ask Data" onClick="launchAsk('${index}')"><i class="ico-handle fa fa-comment-dots"></i></div>
      <div class="askclose-widget btn-menu" title="Close" onClick="launchAsk('${index}')"><i class="ico-handle fa fa-times"></i></div>
      <div class="webeditclose-widget btn-menu" title="Close" onClick="closeEdit('${index}');maximize('${id}','${index}',this.parentNode.parentNode.parentNode,event)"><i class="ico-handle fa fa-times"></i></div>
      <div class="webedit-widget btn-menu" title="Launch Web Edit" onClick="launchEdit('${index}');maximize('${id}','${index}',this.parentNode.parentNode.parentNode,event)""><i class="ico-handle fa fa-pencil-alt"></i></div>
      <div class="expand-widget btn-menu" title="Expand Widget" onclick="maximize('${id}','${index}',this.parentNode.parentNode.parentNode,event)"><i class="ico-handle minmax fa fa-expand-alt"></i></div>
    </div>  
    <div id="${id}" class="viz"></div>
    <div class="mask">
      <div class="loading-wrapper">
        <div class="loading-devover">
        </div>
      </div>
    </div>`
  });
  load(id,url,index);
  if(localStorage.getItem(prefix+""+index+"-visibility")=="false"){
      advGrid.removeWidget(document.querySelector(`[gs-id="${prefix}${index}"]`),false,false);
      document.querySelector(`[gs-id="${prefix}${index}"]`).style.display="none";
  }
  hasHiddenWidget();
}
function addClassAll(all,cls){
  all.forEach(function(item) {
    item.classList.add(cls)
  });
}
function removeClassAll(all,cls){
  all.forEach(function(item) {
    item.classList.remove(cls)
  });
}
function minimizeOverlay(me,ev){
  removeClassAll(document.querySelectorAll(".grid-stack-item-content"),"highlight");
  removeClassAll(document.querySelectorAll(".grid-stack"),"highlight");
}
function expandOverlay(me,ev){
  addClassAll(document.querySelectorAll(".grid-stack-item-content"),"highlight");
  addClassAll(document.querySelectorAll(".grid-stack"),"highlight");
}
function removeWidget(el,ev){
  localStorage.setItem(el.gridstackNode.id+"-visibility","false")
  advGrid.removeWidget(el,false,false);
  el.style.display="none";
  hasHiddenWidget();
}
function showMask(id){
  document.querySelector(`#${id} ~ .mask`).style.opacity=0;
  document.querySelector(`#${id} ~ .mask`).style.display="flex";
  document.querySelector(`#${id} ~ .mask`).style.opacity=1;
  document.querySelector(`#${id}`).style.opacity=0.1;
}
function hideMask(id,time){
  setTimeout(() => {
    document.querySelector(`#${id} ~ .mask`).style.opacity=0;
    document.querySelector(`#${id}`).style.opacity=1;
    setTimeout(() => {
      document.querySelector(`#${id} ~ .mask`).style.display="none";
    }, 1000); 
  }, time);
}
function hideClose(){
  document.querySelectorAll(".close-widget").forEach(function(item) {
    item.style.display="none";
  });
}
function showClose(){
  document.querySelectorAll(".close-widget").forEach(function(item) {
    item.style.display="block";
  });
}
function maximize(id,index,elem,ev){
  showMask(id);
  hideMask(id,3800);
  if(typeof(elem.max)=='undefined' || elem.max=="n"){
    disableSaving=true;
    document.querySelectorAll(".minmax").forEach(function(item) {
      item.classList.remove("fa-expand-alt");
      item.classList.add("fa-compress-alt");
    });
    hideClose();
    lastScrollY=window.scrollY;
    setTimeout(() => {
      window.scrollTo(0,0);
    }, 400);
    //var nr=advGrid.getRow();
    var nr=Math.round((window.innerHeight - document.querySelector("nav").offsetHeight - 20)/(advGrid.getCellHeight()*16))
    advGrid.engine.nodes.map((el)=>{
      el.el.setAttribute("ow",el.w);
      el.el.setAttribute("oh",el.h);
      el.el.setAttribute("ox",el.x);
      el.el.setAttribute("oy",el.y);
    })
    advGrid.float(true);
    advGrid.engine.nodes.map((el)=>{
      if(el.el!=elem){
        advGrid.removeWidget(el.el,false,false);
        el.el.style.display="none";
      }
      else{
        advGrid.update(elem,{w:60,h:nr,x:0,y:0});
      }
    })
    advGrid.float(false);
    elem.max="y";
    return;
  }
  if(elem.max=="y"){
    document.querySelectorAll(".minmax").forEach(function(item) {
      item.classList.add("fa-expand-alt");
      item.classList.remove("fa-compress-alt");
    });
    showClose();
    advGrid.update(elem,{w:parseInt(elem.getAttribute("ow")),h:parseInt(elem.getAttribute("oh")),x:parseInt(elem.getAttribute("ox")),y:parseInt(elem.getAttribute("oy"))});
    var elems=Array.prototype.slice.call(document.querySelectorAll(".grid-stack-item"), 0);
    elems.sort((a,b)=>{//sort from higher to lower to avoid unmanageable reorg :-)
      if(parseInt(a.getAttribute("oy"))>parseInt(b.getAttribute("oy")))
        return 1;
      return -1;  
    })
    elems.forEach(function (it) {
      if(it!=elem){
        var key=it.getAttribute("gs-id");
        console.log(key);
        if(localStorage.getItem(key+"-visibility")!="false"){
          advGrid.makeWidget(it);
          it.style.display="block";
          advGrid.update(it,{w:it.getAttribute("ow"),h:it.getAttribute("oh"),x:it.getAttribute("ox"),y:it.getAttribute("oy")});
        }
      }
    })
    elem.max="n";
    setTimeout(() => {
      window.scrollTo(0,lastScrollY);
    }, 200);
    setTimeout(() => {
      disableSaving=false;
      window.scrollTo(0,lastScrollY);
    }, 3000);
    return;
  }
}
function load(id,url,idx){
  var urlView=url;
  var placeholderView = document.getElementById(id);
  var options = {
    onFirstVizSizeKnown:function(me){
      // document.querySelector(`#${id} ~ .mask`).style.display="none";
    },
    onFirstInteractive: async function (me) {
      hideMask(id,1);
      var viz=me.getViz();
      allviz.push({"viz":viz,"index":idx,"id":id});
      var workbook = me.getViz().getWorkbook();
      var activeSheet = workbook.getActiveSheet();
      await tabfilters.discovery(viz);
      var tbviz =tabfilters.embeddedVizzes.filter((el)=>{return el.vizObject==viz})
      viz.addEventListener(tableau.TableauEventName.MARKS_SELECTION, onMarksSelection);
      getFiltersForViz(tbviz[0].filters,viz,idx);
      getParametersForViz(tbviz[0].parameters,viz,idx);
      showActionIfExist(idx);
      showWebEditIfExist(idx);
      showAskButtonIfExist(idx);
    },
    width: "100%",
    height: "100%",
    hideTabs: true,
    hideToolbar: true,
    device:"desktop"
  };
  var v=new tableau.Viz(placeholderView, urlView, options);
  hideMask(id,5000);
}
function getParametersForViz(params,viz,index){
  var rawParam=[];
  params.map((p)=>{
    rawParam.push(p.parameterObject)
  })
  if(typeof(tab_all_params)!="undefined")
    tab_all_params[index]={parameters:rawParam,viz:viz};
    params.map((f)=>{
    tab_param[index].map((cf)=>{
      if(cf==f.parameterObject.getName()){
        populateParameterMenu(f.parameterObject);
      }
    })
  })
  if(window.parent && window.parent.restoreTexts)
    window.parent.restoreTexts();
}
function getFiltersForViz(filters,viz,index){
    if(typeof(tab_all_filters)!="undefined") {
      tab_all_filters[index].filters=[];
      filters.map((fl)=>{
        var found=false;
        tab_all_filters[index].filters.map(tb=>{
          if(tb.getFieldName()==fl.filterObject.getFieldName())
            found=true;
        })
        if(found==false)
          tab_all_filters[index].filters.push(fl.filterObject)

      })
      tab_all_filters[index].viz=viz;
    }
    filters.map((f)=>{
      tab_filter[index].map((cf)=>{
        if(cf==f.filterFieldName){
          populateFilterMenu(f.filterObject);
        } 
      })
    })
    if(window.parent && window.parent.restoreTexts)
      window.parent.restoreTexts();
}
function showActionIfExist(index){
  var ids;
  tab_action.map((el,id)=>{
    if(el.key==String(index))
      ids=el;
  })
  if(ids && ids.val && ids.val=="true")
    document.querySelector(`[gs-id="${prefix}${index}"] .action-widget`).style.display = "inline-block";
}
function showWebEditIfExist(index){
  var ids;
  tab_web.map((el,id)=>{
    if(el.key==String(index))
      ids=el;
  })
  if(ids && ids.val && ids.val=="true")
    document.querySelector(`[gs-id="${prefix}${index}"] .webedit-widget`).style.display = "inline-block";
}
function showAskButtonIfExist(index){
  var ids;
  tab_ask.map((el,id)=>{
    if(el.key==String(index))
      ids=el;
  })
  if(ids && ids.val && ids.val!=""){
    document.querySelector(`[gs-id="${prefix}${index}"] .ask-widget`).style.display = "inline-block";
  }
}
function closeEdit(index){
  var containerDiv=document.querySelector(`[gs-id="${prefix}${index}"] .viz`);
  var id=document.querySelector(`[gs-id="${prefix}${index}"] .viz`).id
  showMask(id);
  var mv=getVizFromIndex(index).viz;
  containerDiv.classList.remove("edit");
  var url = tab_server[index];
  getVizFromIndex(index).viz.dispose();
  removeViz(index);
  load(id,url,index);
  setEditModeButtonVisibility(index,"inline-block");
}
function launchEdit(index) {
  var id=document.querySelector(`[gs-id="${prefix}${index}"] .viz`).id
  showMask(id);
  var mv=getVizFromIndex(index).viz;
  var containerDiv=document.querySelector(`[gs-id="${prefix}${index}"] .viz`);
  containerDiv.classList.add("edit");
  setEditModeButtonVisibility(index,"none");
  mv.getCurrentUrlAsync().then(function(current_url){
    edit_url = current_url.split('?')[0].replace('/views', '/authoring');                  
    edit_options = {hideTabs: true,hideToolbar: true,width: '100%',height: '100%',
      onFirstInteractive: function () {
        hideMask(id,100);
      }
    };
    mv.dispose();
    removeViz(index);
    var nn=new tableau.Viz(containerDiv, edit_url, edit_options); 
    hideMask(id,5000);
    allviz.push({"viz":nn,"index":index,"id":id});         
  })
}
function launchAsk(index){
  var mv=getVizFromIndex(index);
  var id=document.querySelector(`[gs-id="${prefix}${index}"] .viz`).id
  showMask(id);
  if(mv.ask && mv.ask=="true"){
    mv.viz.dispose();
    removeViz(index);
    var url = tab_server[index];
    load(id,url,index);
    setAskDataButtonVisibility(index,"inline-block");
    return;
  }
  setAskDataButtonVisibility(index,"none");
  var containerDiv=document.querySelector(`[gs-id="${prefix}${index}"] .viz`);
  var ask_options = {width: '100%',height: '100%',onFirstInteractive: function () {
    hideMask(id,1000);
  }
  };
  mv.viz.dispose();
  removeViz(index);
  var nn=new tableau.Viz(containerDiv, getAskURLByIndex(index), ask_options); 
  allviz.push({"viz":nn,"ask":"true","index":index,"id":id});   
  
}
function getAskURLByIndex(index){
  var ret;
  tab_ask.map((v)=>{
    if(v.key==index){
      ret= v.val;
    }
  })
  return ret;
}
function setEditModeButtonVisibility(index,cmd){
  document.querySelector(`[gs-id="${prefix}${index}"] .widget-btn`).style.display="none";
  document.querySelector(`[gs-id="${prefix}${index}"] .action-widget`).style.display=cmd;
  document.querySelector(`[gs-id="${prefix}${index}"] .dl-widget`).style.display=cmd;
  document.querySelector(`[gs-id="${prefix}${index}"] .webedit-widget`).style.display=cmd;
  document.querySelector(`[gs-id="${prefix}${index}"] .webeditclose-widget`).style.display=cmd=="none"?"inline-block":"none";
  document.querySelector(`[gs-id="${prefix}${index}"] .close-widget`).style.display=cmd;
  document.querySelector(`[gs-id="${prefix}${index}"] .expand-widget`).style.display=cmd;
  document.querySelector(`[gs-id="${prefix}${index}"] .ask-widget`).style.display=cmd;
  setTimeout(() => {
    document.querySelector(`[gs-id="${prefix}${index}"] .widget-btn`).style.display="flex";
  }, 2000);
}
function setAskDataButtonVisibility(index,cmd){
  document.querySelector(`[gs-id="${prefix}${index}"] .widget-btn`).style.display="none";
  document.querySelector(`[gs-id="${prefix}${index}"] .action-widget`).style.display=cmd;
  document.querySelector(`[gs-id="${prefix}${index}"] .dl-widget`).style.display=cmd;
  document.querySelector(`[gs-id="${prefix}${index}"] .webedit-widget`).style.display=cmd;
  document.querySelector(`[gs-id="${prefix}${index}"] .askclose-widget`).style.display=cmd=="none"?"inline-block":"none";
  document.querySelector(`[gs-id="${prefix}${index}"] .close-widget`).style.display=cmd;
  document.querySelector(`[gs-id="${prefix}${index}"] .expand-widget`).style.display=cmd;
  document.querySelector(`[gs-id="${prefix}${index}"] .ask-widget`).style.display=cmd;
  setTimeout(() => {
    document.querySelector(`[gs-id="${prefix}${index}"] .widget-btn`).style.display="flex";
  }, 2000);
}
function removeViz(index){
  var ret;
  allviz.map((v,i)=>{
    if(v.index==index){
      ret=i;
    }
  })
  return allviz.splice(ret,1);
}
function getVizFromIndex(index){
  var ret;
  allviz.map((v)=>{
    if(v.index==index){
      ret= v;
    }
  })
  return ret;
}
function getIndexFromViz(viz){
  var ret;
  allviz.map((v)=>{
    if(v.viz==viz){
      ret= v.index;
    }
  })
  return ret;
}
function onMarksSelection(marksEvent) {
  var index=getIndexFromViz(marksEvent.getViz());
  curSelIndex=index;
  if(findElement(tab_action,index) && findElement(tab_action,index).val=="true")
    return marksEvent.getMarksAsync().then(reportSelectedMarks,(err)=>{alert("You don't have right to download data thus not able to see marks. Uncheck 'Actions' in the view settings")});
}
function reportSelectedMarks(marks) {
  var curmarks = marks;
  var mv=getVizFromIndex(curSelIndex);
  mv.selectedMarks=[];
  for (var markIndex = 0; markIndex < curmarks.length; markIndex++) {
    var pairs = curmarks[markIndex].getPairs();
    for (var pairIndex = 0; pairIndex < pairs.length; pairIndex++) {
        var pair = pairs[pairIndex]; 
        mv.selectedMarks.push(pair.value)
    }
  }
}
function launchAction(index){
  var mv=getVizFromIndex(index);
  if(typeof(mv.selectedMarks)=='undefined' || (mv.selectedMarks && mv.selectedMarks.length==0)){
    window.open('http://google.com/search?q=There is no selection :-)');
    return;
  }
  var textOnly=getOnlyText(mv.selectedMarks,[]);
  if(textOnly.length==0)
    window.open('http://google.com/search?q=There are no text values in your selection :-)');
  if(lengthInUtf8Bytes(textOnly.join(" "))<1024)
    window.open('http://google.com/search?q='+encodeURIComponent(textOnly.join(" ")));
  else
    window.open('http://google.com/search?q='+"Too many elements in your selection :-) Please reduce !");  
}
function downloadData(index){
  var mv=getVizFromIndex(index);
  mv.viz.showExportDataDialog();
}
function getOnlyText(from, to){
  from.map((el)=>{
    if(isNaN(el) && !/^(\d+|(\.\d+))(\.\d+)?%$/.test(el)){
      if(!to.includes(el))
        to.push(el);
    }
  })
  return to;
}
function lengthInUtf8Bytes(str) {
  var m = encodeURIComponent(str).match(/%[89ABab]/g);
  return str.length + (m ? m.length : 0);
}
function findElement(arr,keyVal){
  var found = arr.filter(function(item) { return item.key === keyVal.toString(); });
  return found[0] || null;
}
function restoreImgs(){
  tab_img.map((el)=>{
    if(document.getElementById(el.key))
      document.getElementById(el.key).setAttribute('src',el.val);
  })
}
function restoreTexts(){
  tab_text.map((el)=>{
    if(document.getElementById(el.key))
      document.getElementById(el.key).innerHTML=decodeURIComponent(el.val);
  })
}
function initialize(){
  if(typeof(tab_img)!="undefined"){
    restoreImgs();
    restoreTexts();
    if(title_index) 
      document.querySelector("head title").text=title_index;
  }
}


