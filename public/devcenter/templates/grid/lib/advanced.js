function showFilterBox(el){
  document.querySelector(`div[mid='${el}']`).classList.toggle("show");
  document.querySelectorAll(`.dropdown-content`).forEach((dd)=>{if(dd.getAttribute("mid")!=el)dd.classList.remove("show")});
}

function populateFilterMenu(fil){
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

function populateParameterMenu(param){
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
          populateParameterMenu(f);
        }
      })
    })
    window.parent.restoreTexts();
  })
}

function getFiltersForViz(index){
  activeSheet.getFiltersAsync().then((current_filter)=>{
    tab_all_filters[index]={filters:current_filter,viz:viz};
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

function hideDropDownList(filterName){
  document.querySelector(`div[mid='${filterName}']`).classList.remove("show")
}

function hideEditAsk(){
  document.getElementsByClassName("webedit")[0].style.display = "none";
  document.getElementsByClassName("askdata")[0].style.display = "none";
}

function showWebEditIfExist(index){
  var ids;
  tab_web.map((el,id)=>{
    if(el.key==String(index))
      ids=id;
  })
  if(tab_web[ids].val=="true")
    document.getElementsByClassName("webedit")[0].style.display = "block";
}

function showAskIfExist(index){
  var ids;
  tab_ask.map((el,id)=>{
    if(el.key==String(index))
      ids=id;
  })
  if(tab_ask[ids] && tab_ask[ids].val && tab_ask[ids].val!=""){
    document.getElementsByClassName("askdata")[0].style.display = "block";
  }
}

function navigateToSheet(workbook,sheetName,index){
  workbook.activateSheetAsync(sheetName).then(()=>{
    activeSheet=workbook.getActiveSheet();  
    const removeElements = (elms) => elms.forEach(el => el.remove());
    removeElements( document.querySelectorAll(".filter_dropdown") );
    getFiltersForViz(index);
    getParametersForViz(index);
    if(tab_web[index].val=="true")
      document.getElementsByClassName("webedit")[0].style.display = "block";
  });
}

function clearFiltersMenu(){
  const removeElements = (elms) => elms.forEach(el => el.remove());
  removeElements( document.querySelectorAll(".filter_dropdown") );
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
  }
}