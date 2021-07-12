function ready(){
  $('html, body').css('overflow-y','visible')
  $('html, body').animate({ scrollTop: 0 }, 1000,()=>{$('html, body').css('overflow-y','hidden')});
}
function switchUsers(evt){
  $('html, body').css('overflow-y','visible')
  $('html, body').animate({ scrollTop: $('#Careers').offset().top}, 600,()=>{
    document.getElementById('ifr').contentWindow.managerOrStore(evt.srcElement.value);
    $('html, body').css('overflow-y','hidden')
  });
  $('#Careers').animate({ opacity: 1}, 600);
}