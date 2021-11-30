var advGrid;

function loadVizInit(){
  console.log("TRIGGERED FROM")
  go();
  tab_server.map((vz,index)=>{
    var url = tab_server[index];
    if(url!="")
      addNew(url,index);
  })
}

function go(){
  advGrid = GridStack.init({
    float: false,
    cellHeight:"1.5em",
    column: 60,
    verticalMargin: 10,
    alwaysShowResizeHandle: /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent),
    acceptWidgets: true,
    dragIn: '.newWidget',  // class that can be dragged from outside
    dragInOptions: { revert: 'invalid', scroll: false, appendTo: 'body', helper: 'clone' },
    removable: '#trash',
    draggable: {
      handle: '.move-widget',
      option:'snapTolerance'
    },
    removeTimeout: 2000
  }, '#advanced-grid');
  advGrid.on('change', function(event, items) {
    items.forEach(function(item) {
      localStorage.setItem(item.id,JSON.stringify({w:item.w,h:item.h,x:item.x,y:item.y}))
    });
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
      links+=`<li><div paramName="${filPamName}" class="text-uppercase filter-entry dropdown-item" onclick="applyFilter('${filPamName}','${val.value}')">${val.value}</div></li>`;
    }
  })
  var list=`
  <div class="filter_dropdown dropdown">
    <button paramName="Filter-text-${filPamName}" id="Filter-text-${filPamName}" class="text-uppercase btn btn-secondary dropdown-toggle editable" type="button" data-bs-toggle="dropdown" aria-expanded="false">
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
              <button filName="Filter-text-${fil.getFieldName()}" id="Filter-text-${fil.getFieldName()}" class="text-uppercase btn btn-secondary dropdown-toggle editable" type="button" data-bs-toggle="dropdown" aria-expanded="false">
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

function addWidgetToolbar(){
  var id=makeid(10);
  var storedCoord=localStorage.getItem("f0");
  var w=60,h=3,x=0,y=0;
  if(storedCoord!=null){
    storedCoord=JSON.parse(storedCoord);
    w=storedCoord.w;
    h=storedCoord.h;
    x=storedCoord.x;
    y=storedCoord.y
  }
  advGrid.addWidget({id:"f0",w:w,h:h,x:x,y:y, minH:3,content: 
   `<div class="move-overlay">...</div>
    <div class="widget-btn">
      <div class="move-widget btn-menu" onmouseup="minimizeOverlay(this,event)" onmousedown="expandOverlay(this,event)"><i class="ico-handle fa fa-arrows-alt"></i></div>
    </div>  
    <div class="filter-container" id="f0"> </div>
    `
  });
  document.getElementById("f0").parentElement.classList.add("filter-widget");
  return id;
}
function addNew(url,index){
  var id=makeid(10);
  var storedCoord=localStorage.getItem("v"+index);
  var w=30,h=25,x=advGrid.getRow(),y=0;
  if(storedCoord!=null){
    storedCoord=JSON.parse(storedCoord);
    w=storedCoord.w;
    h=storedCoord.h;
    x=storedCoord.x;
    y=storedCoord.y
  }
  advGrid.addWidget({id:"v"+index,w:w,h:h,x:x,y:y, content: 
   `<div class="move-overlay">...</div>
    <div class="widget-btn">
      <div class="move-widget btn-menu" onmouseup="minimizeOverlay(this,event)" onmousedown="expandOverlay(this,event)"><i class="ico-handle fa fa-arrows-alt"></i></div>
      <div class="reset-widget btn-menu" onclick="tabportal.resetFilters()"><i class="ico-handle fa fa-sync"></i></div>
      <div class="expand-widget btn-menu" onclick="maximize('${id}',this.parentNode.parentNode.parentNode,event)"><i class="ico-handle fa fa-expand-alt"></i></div>
      <div class="close-widget btn-menu" onClick="removeWidget(this.parentNode.parentNode.parentNode,event)"><i class="ico-handle fa fa-times"></i></div>
    </div>  
    <div id="${id}" class="viz" id="tab1"></div>
    <div class="mask">
      <div class="loading-wrapper">
        <div class="loading-devover">
        </div>
      </div>
    </div>`
  });
  load(id,url,index);
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
  me.classList.remove("extended-btn");
  removeClassAll(document.querySelectorAll(".grid-stack-item-content"),"highlight");
  removeClassAll(document.querySelectorAll(".grid-stack"),"highlight");
}
function expandOverlay(me,ev){
  me.classList.add("extended-btn");
  addClassAll(document.querySelectorAll(".grid-stack-item-content"),"highlight");
  addClassAll(document.querySelectorAll(".grid-stack"),"highlight");
}
function removeWidget(el,ev){
  advGrid.removeWidget(el);
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
function maximize(id,elem,ev){
  showMask(id);
  hideMask(id,3800);
  if(typeof(elem.max)=='undefined' || elem.max=="n"){
    var nr=advGrid.getRow();
    advGrid.float(true);
    advGrid.engine.nodes.map((el)=>{
      el.el.setAttribute("ow",el.w);
      el.el.setAttribute("oh",el.h);
      el.el.setAttribute("ox",el.x);
      el.el.setAttribute("oy",el.y);
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
    document.querySelectorAll(".grid-stack-item").forEach(function (it) {
      if(it!=elem){
        advGrid.makeWidget(it);
        it.style.display="block";
        advGrid.update(it,{w:it.getAttribute("ow"),h:it.getAttribute("oh"),x:it.getAttribute("ox"),y:it.getAttribute("oy")});
      }
    })
    advGrid.update(elem,{w:parseInt(elem.getAttribute("ow")),h:parseInt(elem.getAttribute("oh")),x:parseInt(elem.getAttribute("ox")),y:parseInt(elem.getAttribute("oy"))});
    elem.max="n";
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
    onFirstInteractive: function (me) {
      hideMask(id,1);
      var viz=me.getViz();
      var workbook = me.getViz().getWorkbook();
      var activeSheet = workbook.getActiveSheet();
      getFiltersForViz(viz,activeSheet,idx);
      getParametersForViz(viz,workbook,idx);
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
function loadVizByIndex (index,force,device ="") {
}
function getParametersForViz(viz,workbook,index){
  workbook.getParametersAsync().then((current_param)=>{
    if(typeof(tab_all_params)!="undefined")tab_all_params[index]={parameters:current_param,viz:viz};
    current_param.map((f)=>{
      tab_param[index].map((cf)=>{
        if(cf==f.getName()){
          populateParameterMenu(f);
        }
      })
    })
    window.parent.restoreTexts();
  })
}
function getFiltersForViz(viz,activeSheet,index){
  if(document.querySelector("[gs-id='f0']")==null)
    addWidgetToolbar();
  activeSheet.getFiltersAsync().then((current_filter)=>{
    if(typeof(tab_all_filters)!="undefined") {
      tab_all_filters[index].filters=[];
      current_filter.map((fl)=>{
        var found=false;
        tab_all_filters[index].filters.map(tb=>{
          if(tb.getFieldName()==fl.getFieldName())
            found=true;
        })
        if(found==false)
          tab_all_filters[index].filters.push(fl)

      })
      tab_all_filters[index].viz=viz;
    }
    current_filter.map((f)=>{
      tab_filter[index].map((cf)=>{
        if(cf==f.getFieldName()){
          populateFilterMenu(f);
        }
      })
    })
    window.parent.restoreTexts();
  })
}

