'use strict'





$( document ).ready(function() {
  $(".in").click(function () {
    $(".burger").toggle(1800);
  });
  $(".in").click(function () {
    $(".burger-outer").toggle(1400);
  });
  $(".in").click(function () {
    $(".burger-outer-big").toggle(1000);
  });
});
