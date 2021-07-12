setTimeout(() => {
  managerOrStore("");
}, 2000); 
function managerOrStore(user){
  tabportal.goThumb();
  if(user.toLowerCase().indexOf("store")!=-1){
    $(".manager").hide();
    $(".store").show();
  }
  else{
    $(".store").hide();
    $(".manager").show();
  }
}

;(function(window, undefined) {
  var viz,viz1,viz2,viz3, widget, edit, curmarks,isEditLoaded=false;
  var selectMarks=[];
  var editHeight="100%";
  var askHeight="calc(100% - 0px)";
  var dashHeight="100vh";
  const DS_NAME="Sample-Superstore";
  const VIEW_PATH="https://eu-west-1a.online.tableau.com/t/alteirac/views/POC_Market_Pay_Embedded/POCMarketPay";
  const VIEW_PATH2="https://eu-west-1a.online.tableau.com/t/alteirac/views/POC_Market_Pay_Embedded/POCMarketPaymagasin";
  const VIEW_PATH3="https://eu-west-1a.online.tableau.com/t/alteirac/views/POC_Market_Pay_Embedded/DTAILDESOPRATIONS";
  const EDIT_PATH="https://eu-west-1a.online.tableau.com/t/alteirac/authoring/POC_Market_Pay_Embedded/POCMarketPay";
  const ASK_PATH=`https://eu-west-1a.online.tableau.com/t/alteirac/askData/operation_29-04-2021`;
  const FIELD_ACTION=["Magasin","Date de transaction","Type de Carte","N° de contrat","Crédit/Débit"];

  $( window ).resize(function() {
    resizeElements();
  });

  function resizeElements(){
    if(isEditLoaded==true && $(".three").is(":visible"))
      edit.setFrameSize($("#main").outerWidth()-43, $("#main").outerHeight()+63);
      viz.setFrameSize($("#main").outerWidth()-43, $("#main").outerHeight()-30);  
  }

  function loadVizInit() {
    urlView=`${VIEW_PATH}?:embed=y&render=true`;
    placeholderView = document.getElementById("tableauVizi");
    urlView2=`${VIEW_PATH2}?:embed=y&render=true`;
    placeholderView2 = document.getElementById("tableauVizi2");
    urlView3=`${VIEW_PATH3}?:embed=y&render=true`;
    placeholderView3 = document.getElementById("tableauVizi3");
    preloadEdit();
    preloadAsk();
    viz1=loadViz(placeholderView, urlView,viz1);
    viz2=loadViz(placeholderView2, urlView2,viz2);
    viz3=loadViz(placeholderView3, urlView3,viz3);
  }

  function loadViz(placeholderDiv, url,vizpoint) {
    var optView = {
      onFirstInteractive: function () {
        listenToMarksSelection(vizpoint);
        $(".dash").addClass("navi");
        $("#tableauVizi iframe").css("width","100%");
        setTimeout(() => {
          $("body").scrollTop(0);
        }, 5000);
      },
      device:mobileCheck()?'phone':'default',
      width: "99.9%",
      height: dashHeight,
      hideTabs: true,
      hideToolbar: true,
    };
    if (vizpoint) {
      vizpoint.dispose();
    }
    vizpoint = new tableau.Viz(placeholderDiv, url, optView);
    return vizpoint;
  }

  function showMarks(){
    $("#listartefact").empty();
    //MODIF FOR INVOICE HERE
    if(!$(".action").hasClass("disabled") && curmarks[0] && curmarks[0].getPairs().length==8){
      var pairs = curmarks[0].getPairs();
      var ele=
      `	<div class="invoice-box">
      <table cellpadding="0" cellspacing="0">
        <tr class="top">
          <td colspan="2">
            <table>
              <tr>
                <td class="title">
                  <img src="https://marketpay.eu/_nuxt/img/e63f5cc.svg" style="width: 100%; max-width: 300px" />
                </td>

                <td>
                  Facture #: ${pairs[4].value}<br />
                  Date: <input style="width:65%" value="${pairs[2].formattedValue}"></input><br />
                  Limite Paiement: 2 avril 2021
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <tr class="information">
          <td colspan="2">
            <table>
              <tr>
                <td>
                  2 rue Du Quatre Septembre<br />
                  75002<br />
                  Paris, FRANCE
                </td>

                <td>
                  ${pairs[3].value}<br />
                  Place des fours<br />
                  facturation@${pairs[3].value.replaceAll(" ","")}.fr
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <tr class="heading">
          <td>Methode de Paiement</td>

          <td>${pairs[5].value} #</td>
        </tr>

        <tr class="details">
          <td>${pairs[5].value} </td>

          <td><input style="width:55%;margin-left: -100px;" value="${pairs[7].formattedValue}€"></input></td>
        </tr>

        <tr class="heading">
          <td>Objet</td>

          <td>Prix</td>
        </tr>

        <tr class="item">
          <td style="width:45%" >Données X</td>

          <td><input style="width:55%;margin-left: -100px;" value="${pairs[7].formattedValue}€"></input></td>
        </tr>

        <tr class="total">
          <td style="width:45%"></td>

          <td>Total <br><input style="width:55%;margin-left: -100px;" value="${pairs[7].formattedValue}€"></input></td>
        </tr>
        <tr>
          <td>MARKET PAY. Siren : 808389191. SAS au capital de 15.340.000 euros Siege social : 153 Avenue d’Italie 75002 PARIS R.C.S.</td>
        </tr>
      </table>
      </div>`
      $('#listartefact').append(ele);
      $('#modalMgt').modal('toggle')
    }
  }

  function listenToMarksSelection(vizpoint) {
    vizpoint.addEventListener(tableau.TableauEventName.MARKS_SELECTION, onMarksSelection);
  }

  function onMarksSelection(marksEvent) {
      return marksEvent.getMarksAsync().then(reportSelectedMarks);
  }
  //MODIF FOR INVOICE HERE
  function reportSelectedMarks(marks) {
    curmarks=marks;
    if(curmarks.length>0 && curmarks[0].getPairs().length==8){
      $(".action").removeClass("disabled");
      $(".action").addClass("glow");
    }
    else{
      $(".action").addClass("disabled");
      $(".action").removeClass("glow");
    }
    selectMarks=[];
    for (var markIndex = 0; markIndex < curmarks.length; markIndex++) {
      var pairs = curmarks[markIndex].getPairs();
      for (var pairIndex = 0; pairIndex < pairs.length; pairIndex++) {
          var pair = pairs[pairIndex]; 
          if(pair.fieldName===FIELD_ACTION)
            selectMarks.push(pair.formattedValue)
      }
    }
    //console.log("["+selectMarks.join(",")+"]");
    //filterWidget('State',selectMarks);
  }

  function preloadEdit(){
    if(edit)
        edit.dispose()
    var placeholderEdit = document.getElementById("tableauEdit");
      edit_url = EDIT_PATH;
      edit_options = {
        width: "99%",
        height: editHeight,
        onFirstInteractive: function () {
          isEditLoaded=true;
          var iframe = $("#tableauEdit iframe")[0];
          $("#tableauEdit iframe").css("width","100%");
          $(".edit").removeClass("disabled");
          $(".edit").removeClass("loading");
          $(".edit").addClass("navi");
          iframe.onload = function () {
            setTimeout(() => {
              preloadEdit();
            }, 500);
          };
        },
      };
      edit=new tableau.Viz(placeholderEdit, edit_url, edit_options);
  }

  function preloadAsk(){
    var ask_url = ASK_PATH;
    $("#tableauAsk iframe").on("load", function() {
      $(".ask").removeClass("disabled");
      $(".ask").removeClass("loading");
      $(".ask").addClass("navi");
      isAskLoaded=true;
    })
    $("#tableauAsk iframe")[0].contentWindow.location=ask_url;
    $("#tableauAsk iframe")[0].style.height=askHeight;
  }

  function enableDashFeature(){
      $(".dashfeat").removeClass("disabled");
      if(curmarks && curmarks.length>0){
        $(".action").removeClass("disabled");
      }
      else{
        $(".action").addClass("disabled");
      }
  }

  function disableDashFeature(){
    $(".dashfeat").addClass("disabled");
    $(".action").addClass("disabled");
  }

  function goDash2(force){
    viz=viz2;
    if(!$(".dash").hasClass("selected") || force){
      enableDashFeature();
      //$(".export").removeClass("disabled");$(".views").removeClass("disabled");
      $(".bread").text("/ Dashboard / Plant Analysis");
      $(".dash").addClass("selected");
      $(".edit").removeClass("selected");
      $(".ask").removeClass("selected");
      $(".navigator").removeClass("selected");
      $(".one").css("z-index","1");
      $(".two").css("z-index","1");
      $(".twotwo").css("z-index","10");
      $(".twothree").css("z-index","1");
      $(".three").css("z-index","1");
      $(".four").css("z-index","1");
    }
  }
  function goDash3(force){
    viz=viz3;
    if(!$(".dash").hasClass("selected") || force){
      enableDashFeature();
      //$(".export").removeClass("disabled");$(".views").removeClass("disabled");
      $(".bread").text("/ Dashboard / Plant Analysis");
      $(".dash").addClass("selected");
      $(".edit").removeClass("selected");
      $(".ask").removeClass("selected");
      $(".navigator").removeClass("selected");
      $(".one").css("z-index","1");
      $(".two").css("z-index","1");
      $(".twotwo").css("z-index","1");
      $(".twothree").css("z-index","10");
      $(".three").css("z-index","1");
      $(".four").css("z-index","1");
    }
  }
  function goDash(force){
    viz=viz1;
    if(!$(".dash").hasClass("selected") || force){
      enableDashFeature();
      //$(".export").removeClass("disabled");$(".views").removeClass("disabled");
      $(".bread").text("/ Dashboard / Plant Analysis");
      $(".dash").addClass("selected");
      $(".edit").removeClass("selected");
      $(".ask").removeClass("selected");
      $(".navigator").removeClass("selected");
      $(".one").css("z-index","1");
      $(".two").css("z-index","10");
      $(".three").css("z-index","1");
      $(".four").css("z-index","1");
    }
  }

  function goEdit(){
    if(!$(".edit").hasClass("selected")){
      disableDashFeature();
      $(".bread").text("/ Dashboard / Edition");
      $(".edit").addClass("selected");
      $(".dash").removeClass("selected");
      $(".ask").removeClass("selected");
      $(".navigator").removeClass("selected");
      $(".three").css("z-index","10");
      $(".two").css("z-index","1");
      $(".twotwo").css("z-index","1");
      $(".four").css("z-index","1");
      $(".one").css("z-index","1");
      resizeElements();
    }
  }

  function goAsk(){
    if(!$(".ask").hasClass("selected")){
      disableDashFeature();
      $(".bread").text("/ Dashboard / Ask");
      $(".ask").addClass("selected");
      $(".dash").removeClass("selected");
      $(".edit").removeClass("selected");
      $(".navigator").removeClass("selected");
      $(".four").css("z-index","10");
      $(".three").css("z-index","1");
      $(".two").css("z-index","1");
      $(".twotwo").css("z-index","1");
      $(".one").css("z-index","1");
    }
  }

  function goExport(){
    if(!$(".export").hasClass("disabled")){
      viz.showExportPDFDialog();
    }
  }

  function goViews(){
    if(!$(".views").hasClass("disabled")){
      viz.showCustomViewsDialog();
    }
  }

  function filterWidget(filterName,value){
    var wid = widget.getWorkbook().getActiveSheet();
    if(value.length==0){
      wid.applyFilterAsync(filterName, value, tableau.FilterUpdateType.ALL)
      $(".profilt").text(`Profit per Month`);
      $(".profilt").prop("title",`Profit per Month`);
    }
    else{
      wid.applyFilterAsync(filterName, value, tableau.FilterUpdateType.REPLACE)
      if(value.length==1){
        $(".profilt").text(`Profit (${value[0]})`);
        $(".profilt").prop("title",value[0]);
      }
      else{
        $(".profilt").text(`Profit (${value.length} States)`);
        var tip="";
        value.map((elem)=>{
          tip=tip+(tip===""? "":", ")+elem;
        })
        $(".profilt").prop("title",tip);
      }  
    }
  }

  function filter(ev,filterName,value){
    // viz.getWorkbook().getActiveSheet().getWorksheets().map((s)=>{
      // widget.getWorkbook().getActiveSheet().getFiltersAsync().then(function(filters){
      //   filters.map((f)=>{
      //     console.log("FILTER",f)
      //   })
      // })
    // })
    var sheet = viz.getWorkbook().getActiveSheet().getWorksheets()[0];
    var wid = widget.getWorkbook().getActiveSheet();
    if(ev!=null && $(ev).hasClass("pressed")){
      sheet.applyFilterAsync(filterName, value, tableau.FilterUpdateType.ALL).then(()=>{
        $(ev).removeClass("pressed");
        $(".profilt").text(`Profit per Month`)
      });
      wid.applyFilterAsync(filterName, value, tableau.FilterUpdateType.ALL)
    }
    else{
      sheet.applyFilterAsync(filterName, value, tableau.FilterUpdateType.REPLACE).then(()=>{
        $(".filt").removeClass("pressed");
        $(ev).addClass("pressed");
        $(".profilt").text(`Profit (${value})`)
      });
      wid.applyFilterAsync(filterName, value, tableau.FilterUpdateType.REPLACE)
    }  
  }

  function toggleMenu(){
    if($("#main").hasClass("collapsed")){
      $(".tab-widget").css("opacity","0.01")
      $(".collapsable").removeClass("collapsed");
    }
    else{
      $(".collapsable").addClass("collapsed");
    }
    resizeElements();
  }

  function intro(){
    var it=introJs();
    it.setOptions({
      showBullets: false,
      showProgress: true,
      showStepNumbers: false,
      keyboardNavigation: true,
      highlightClass:"myhighlight"
    });
    if($("#main").hasClass("collapsed")){
      toggleMenu();
    }
    it.onafterchange(function(targetElement) {
      if($(targetElement).hasClass("tab-widget")){
        $(".myhighlight").addClass("low");
        $(".introjs-tooltipReferenceLayer").addClass("low");
      }
      else{
        $(".myhighlight").removeClass("low");
        $(".introjs-tooltipReferenceLayer").removeClass("low");
      }
      $("body").scrollLeft(100);

    });
    if(!$(".dash").hasClass("selected"))
      goDash();
    it.start();
  }

  function goThumb(){
    $(".one").css("z-index","10");
    $(".two").css("z-index","1");
    $(".twotwo").css("z-index","1");
    $(".twothree").css("z-index","1");
    $(".three").css("z-index","1");
    $(".four").css("z-index","1");
    $(".bread").text("/ Dashboard / Navigation");
    disableDashFeature();
    $(".navigator").addClass("selected");
    $(".ask").removeClass("selected");
    $(".dash").removeClass("selected");
    $(".edit").removeClass("selected");
  }

  window.tabportal={};
  window.tabportal.goThumb=goThumb;
  window.tabportal.intro=intro;
  window.tabportal.showMarks=showMarks;
  window.tabportal.toggleMenu=toggleMenu;
  window.tabportal.loadVizInit=loadVizInit;
  window.tabportal.goDash=goDash;
  window.tabportal.goDash2=goDash2;
  window.tabportal.goDash3=goDash3;
  window.tabportal.goEdit=goEdit;
  window.tabportal.goAsk=goAsk;
  window.tabportal.goExport=goExport;
  window.tabportal.goViews=goViews;
  window.tabportal.filter=filter;
})(window)
  