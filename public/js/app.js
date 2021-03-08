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

// read more in the search for image results
function myFunction() {
  var dots = document.getElementById("dots");
  var moreText = document.getElementById("more");
  var btnText = document.getElementById("myBtn");

  if (dots.style.display === "none") {
    dots.style.display = "inline";
    btnText.innerHTML = "See More Details";
    moreText.style.display = "none";
  } else {
    dots.style.display = "none";
    btnText.innerHTML = "See less Details";
    moreText.style.display = "inline";
  }
}