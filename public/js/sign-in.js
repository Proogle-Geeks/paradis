$('.search').css('display','none');

$('#show-signup-form-btn').click(()=>{
    $('#sign-up-form-div').css('display','block');
    $('#sign-in-form').css('display','none');
    $('#show-signup-form-btn').css('display','none');
    $('p').css('display','none');
    $(window).click(event =>{
        console.log(event.target);
    })
})

$('#cancel-btn').click(()=>{
    $('#sign-up-form-div').css('display','none');
    $('#sign-in-form').css('display','block');
    $('#show-signup-form-btn').css('display','inline');
    $('p').css('display','block');
})