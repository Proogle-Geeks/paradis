'use strict';


$(document).ready(function () {
  $('.in').click(function () {
    $('.burger').toggle(1800);
  });
  $('.in').click(function () {
    $('.burger-outer').toggle(1400);
  });
  $('.in').click(function () {
    $('.burger-outer-big').toggle(1000);
  });
  $('.in').hover(function () {
    $('.burger-test').toggle(400);
  });


  $('.btn-details0').click(function () {
    $('.more-txt0').toggle(600);
    $('.less-txt0').toggle(600);
    $(this).text($(this).text() == 'see less details' ? 'see more details' : 'see less details');

  });
  $('.btn-details1').click(function () {
    $('.more-txt1').toggle(600);
    $('.less-txt1').toggle(600);
    $(this).text($(this).text() == 'see less details' ? 'see more details' : 'see less details');
  });
  $('.btn-details2').click(function () {
    $('.more-txt2').toggle(600);
    $('.less-txt2').toggle(600);
    $(this).text($(this).text() == 'see less details' ? 'see more details' : 'see less details');
  });
 
  
});

// Animating the headline 
const spans = document.querySelectorAll('.word span');

spans.forEach((span, idx) => {
	span.addEventListener('click', (e) => {
		e.target.classList.add('active');
	});
	span.addEventListener('animationend', (e) => {
		e.target.classList.remove('active');
	});
	
	// Initial animation
	setTimeout(() => {
		span.classList.add('active');
	}, 750 * (idx+1))
});