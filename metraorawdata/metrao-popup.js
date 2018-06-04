
'use strict';

document.addEventListener('DOMContentLoaded', function () {
  var divs = document.querySelectorAll('#actions div');
  for (var i = 0; i < divs.length; i++) {
    divs[i].addEventListener('click', handleMenu);
  }  

});  

function handleMenu(event) {
  chrome.runtime.sendMessage('getMetraoData');

}  
