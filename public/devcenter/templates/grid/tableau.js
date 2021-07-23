var viz,workbook, activeSheet, options, placeholderDiv,askindex=-1;

function loadVizInit () {
  initialize();
  loadVizByIndex(0);
}
function loadVizByIndex (index,force) {
  var url = tab_server[index];
  if(url=="")
    return;
  hideEditAskButton();
  showAskButtonIfExist(index);
  var isSameWorkbook=false;
  if(workbook && !force){
    var sheets = workbook.getPublishedSheetsInfo();
    sheets.map((sh)=>{
      if(sh.getUrl()==url){
        console.log("ACTIVATE INSTEAD OF LOAD !!")
        navigateToSheet(workbook,sh.getName(),index);
        isSameWorkbook=true;
      }
    })
  }
  if(!isSameWorkbook){
    placeholderDiv = document.getElementById("tableauViz");
    options = {width: '100%',height: '100%',hideTabs: true,hideToolbar: true,showShareOptions: false,
        onFirstInteractive: function () {
          workbook = viz.getWorkbook();
          activeSheet = workbook.getActiveSheet();
          getFiltersForViz(index);
          getParametersForViz(index);
          showWebEditIfExist(index);
        }
    }
    if(url)
      loadViz(placeholderDiv, url, options);
  }
}
function loadViz (placeholderDiv, url, options) {
  if(viz)
    viz.dispose();
  viz = new tableau.Viz(placeholderDiv, url, options);
  clearFiltersMenu();
}
function launchAsk(){
  if(askindex!=-1){
    loadVizByIndex(askindex,true);
    askindex=-1;
    return;
  }
  var containerDiv = document.getElementById("tableauViz");
  hideEditButton()
  var ask_options = {width: '100%',height: '100%',
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
    hideEditAskButton()
    edit_url = current_url.split('?')[0].replace('/views', '/authoring');                  
    edit_options = {hideTabs: true,hideToolbar: true,width: '100%',height: '100%',
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
function applyFilter(filterName,value) {
  activeSheet.applyFilterAsync(filterName,value,tableau.FilterUpdateType.REPLACE);
  hideDropDownList(filterName);
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

