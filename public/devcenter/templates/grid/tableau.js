var viz,workbook, activeSheet, options, placeholderDiv,askindex=-1;

// var tab_server = [
//   "https://eu-west-1a.online.tableau.com/t/alteirac/views/Accounttracking/Accounttracking",
//   "https://eu-west-1a.online.tableau.com/t/alteirac/views/demo/Shipping",
//   "https://eu-west-1a.online.tableau.com/t/alteirac/views/demo/Forecast",
//   "https://eu-west-1a.online.tableau.com/t/alteirac/views/SuperstoredemoStoryTest/SalesbyProduct"
// ]
var tab_server = [
  "",
  "",
  "",
  ""
]
var tab_filter=[[],[],[],[]];
var tab_web=[[],[],[],[]];
var tab_ask=[[],[],[],[]];
var tab_param=[[],[],[],[]];

var tab_all_filters=[[],[],[],[]];
var tab_all_params=[[],[],[],[]];

function loadVizInit () {
  loadVizByIndex(0);
}
function loadVizByIndex (index,force) {
  var url = tab_server[index];
  if(url=="")
    return;
  document.getElementsByClassName("webedit")[0].style.display = "none";
  document.getElementsByClassName("askdata")[0].style.display = "none";
  if(tab_ask[index] && tab_ask[index].val && tab_ask[index].val!=""){
    document.getElementsByClassName("askdata")[0].style.display = "block";
  }
  var stop=false;
  if(workbook && !force){
    var sheets = workbook.getPublishedSheetsInfo();
    sheets.map((sh)=>{
      if(sh.getUrl()==url){
        console.log("ACTIVATE INSTEAD OF LOAD !!")
        workbook.activateSheetAsync(sh.getName()).then(()=>{
          activeSheet = workbook.getActiveSheet();
          const removeElements = (elms) => elms.forEach(el => el.remove());
          removeElements( document.querySelectorAll(".filter_dropdown") );
          getFiltersForViz(index);
          getParametersForViz(index);
          if(tab_web[index].val=="true")
            document.getElementsByClassName("webedit")[0].style.display = "block";
        });
        stop=true;
      }
    })
  }
  if(!stop){
    placeholderDiv = document.getElementById("tableauViz");
    options = {
        width: '100%',
        height: '100%',
        hideTabs: true,
        hideToolbar: true,
        showShareOptions: false,
        onFirstInteractive: function () {
          workbook = viz.getWorkbook();
          activeSheet = workbook.getActiveSheet();
          getFiltersForViz(index);
          getParametersForViz(index);
          if(tab_web[index].val=="true")
            document.getElementsByClassName("webedit")[0].style.display = "block";
        }
    }
    if(url)
      loadViz(placeholderDiv, url, options);
  }
}
function loadViz (placeholderDiv, url, options) {
  if (viz) {
      viz.dispose();
  }
  viz = new tableau.Viz(placeholderDiv, url, options);
  const removeElements = (elms) => elms.forEach(el => el.remove());
  removeElements( document.querySelectorAll(".filter_dropdown") );
}
function launchAsk(){
  if(askindex!=-1){
    loadVizByIndex(askindex,true);
    askindex=-1;
    return;
  }
  var containerDiv = document.getElementById("tableauViz");
  document.getElementsByClassName("webedit")[0].style.display = "none";
  var ask_options = {
    width: '100%',
    height: '100%',
  };
  viz.getCurrentUrlAsync().then(function(current_url){
    var index=tab_server.indexOf(current_url.split("?")[0]);
    askindex=index;
    loadViz (containerDiv, tab_ask[index].val, ask_options);    
  })
  
}
function launchEdit() {
  var containerDiv = document.getElementById("tableauViz");
  viz.getCurrentUrlAsync().then(function(current_url){
    document.getElementsByClassName("webedit")[0].style.display = "none";
    document.getElementsByClassName("askdata")[0].style.display = "none";
    edit_url = current_url.split('?')[0].replace('/views', '/authoring');                  
    edit_options = {
      hideTabs: true,
      hideToolbar: true,
      width: '100%',
      height: '100%',
      onFirstInteractive: function () {
          var iframe = document.querySelectorAll('iframe')[0];
          iframe.onload = function(){
              viz.getCurrentUrlAsync().then (function(current_url){
                var index=tab_server.indexOf(current_url.split("?")[0]);
                loadVizByIndex(index,true)
              })
          }
      }
    };
    loadViz (containerDiv, edit_url, edit_options);          
  })
}
function showFilterBox(el){
  document.querySelector(`div[mid='${el}']`).classList.toggle("show");
  document.querySelectorAll(`.dropdown-content`).forEach((dd)=>{if(dd.getAttribute("mid")!=el)dd.classList.remove("show")});
}
function displayFilter(fil){
  var links="";
  fil.getAppliedValues().map((val)=>{
    var found=false;
    document.querySelectorAll(`[filName="${fil.getFieldName()}"]`).forEach((el)=>{
      if(el.text==val.value)
        found=true;
    })
    if(!found ){
      links+=`<a filName="${fil.getFieldName()}" href="#" class="filter-entry" onclick="applyFilter('${fil.getFieldName()}','${val.value}')">${val.value}</a>`;
    }
  })
  var list=`
  <span class="filter_dropdown">
    <a id="builder-text-${fil.getFieldName()}" class="editable" onclick="showFilterBox('${fil.getFieldName()}')" href="#">${fil.getFieldName()}</a>
    <div mid="${fil.getFieldName()}" class="dropdown-content">
    ${links}
    </div>
  </span>`
  if(document.querySelector(`div[mid='${fil.getFieldName()}']`)==null){
    document.getElementsByClassName("ButtonBar")[0].innerHTML+=list;
  }
  else{
    document.querySelector(`div[mid='${fil.getFieldName()}']`).innerHTML+=links;
  }
}
function getFiltersForViz(index){
  activeSheet.getFiltersAsync().then((current_filter)=>{
    tab_all_filters[index]={filters:current_filter,viz:viz};
    current_filter.map((f)=>{
      tab_filter[index].map((cf)=>{
        if(cf==f.getFieldName()){
          displayFilter(f);
        }
      })
    })
    window.parent.restoreTexts();
  })
}
function displayParameter(param){
  var links="";
  param.getAllowableValues().map((val)=>{
    var found=false;
    document.querySelectorAll(`[paramName="${param.getName()}"]`).forEach((el)=>{
      if(el.text==val.value)
        found=true;
    })
    if(!found ){
      links+=`<a paramName="${param.getName()}" href="#" class="filter-entry" onclick="applyParam('${param.getName()}','${val.value}')">${val.value}</a>`;
    }
  })
  var list=`
  <span class="filter_dropdown">
    <a id="builder-text-${param.getName()}" class="editable" onclick="showFilterBox('${param.getName()}')" href="#">${param.getName()}</a>
    <div mid="${param.getName()}" class="dropdown-content">
    ${links}
    </div>
  </span>`
  if(document.querySelector(`div[mid='${param.getName()}']`)==null){
    document.getElementsByClassName("ButtonBar")[0].innerHTML+=list;
  }
  else{
    document.querySelector(`div[mid='${param.getName()}']`).innerHTML+=links;
  }
}
function getParametersForViz(index){
  workbook.getParametersAsync().then((current_param)=>{
    tab_all_params[index]={parameters:current_param,viz:viz};
    current_param.map((f)=>{
      tab_param[index].map((cf)=>{
        if(cf==f.getName()){
          displayParameter(f);
        }
      })
    })
    window.parent.restoreTexts();
  })
}
function applyFilter(filterName,value) {
  activeSheet.applyFilterAsync(filterName,value,tableau.FilterUpdateType.REPLACE);
  document.querySelector(`div[mid='${filterName}']`).classList.remove("show")
}
function resetViz() {
  viz.revertAllAsync();
}
function dataDownload() {
  viz.showExportDataDialog();
}
function saveView() {
  viz.showCustomViewsDialog();
}
function applyParam(paramName,value) {
  workbook.changeParameterValueAsync(paramName, value)
}

