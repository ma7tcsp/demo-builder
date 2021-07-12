var viz;
var workbook, activeSheet, selectedMarks, options, placeholderDiv, activeFilterSheet;

var tab_server = [
  "https://eu-west-1a.online.tableau.com/t/timpaynesite/views/GTA5/Howtolosealife",
  "https://eu-west-1a.online.tableau.com/t/timpaynesite/views/SalesMetricAnalysis-UK_0/Dashboard3"
]
var tab_filter=[[],[]];
var tab_all_filters=[[],[]];

function loadVizInit () {
  setTimeout(() => {
    loadVizByIndex(0,'viz-1');
    loadVizByIndex(1,'viz-2');  
  }, 1000);
}

function loadVizByIndex (index,id) {
  var url = tab_server[index];
  placeholderDiv = document.getElementById(id);
  options = {
      width: '100%',
      height: '100%',
      hideTabs: true,
      hideToolbar: true,
      showShareOptions: false,
      onFirstInteractive: function (me) {
        workbook = me.getViz().getWorkbook();
        activeSheet = workbook.getActiveSheet();
        getFiltersForViz(index,me.getViz());
      }
  }
  if(url)
    loadViz(placeholderDiv, url, options);


}

function loadViz (placeholderDiv, url, options) {
   viz = new tableau.Viz(placeholderDiv, url, options);
}

function getFiltersForViz(index,v){
  activeSheet.getFiltersAsync().then((current_filter)=>{
    tab_all_filters[index]={filters:current_filter,viz:v};
    tab_filter[index].map((f)=>{
      current_filter.map((cf)=>{
        if(f==cf.getFieldName()){
          displayFilter(cf);
        }
      })
    })
  })
}

function filterCountry() {
  workbook.getActiveSheet().applyFilterAsync("Region","Central","REPLACE")
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

function paramToggle() {
  workbook.changeParameterValueAsync("How to lose a life", "Busted")
}
