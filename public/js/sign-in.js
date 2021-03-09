$('.search').css('display','none');
$('.login-btn').css('display','none')

$('#show-signup-form-btn').click(()=>{
    $('#sign-up-form-div').css('display','block');
    $('#sign-in-form').css('display','none');
    $('#show-signup-form-btn').css('display','none');
    $('p').css('display','none');
    // $(window).click(event =>{
    //     console.log(event.target);
    // })
})

$('#cancel-btn').click(()=>{
    $('#sign-up-form-div').css('display','none');
    $('#sign-in-form').css('display','block');
    $('#show-signup-form-btn').css('display','inline');
    $('p').css('display','block');
})

$('#show-update-form-btn').click(()=>{
    $('#update-info-form-div').css('display','block');
    $('#user-info-div').css('display','none');
    $('#show-update-form-btn').css('display','none');
    // $('p').css('display','none');
    // $(window).click(event =>{
    //     console.log(event.target);
    // })
})

$('#cancel-btn').click(()=>{
    $('#update-info-form-div').css('display','none');
    $('#user-info-div').css('display','block');
    $('#show-update-form-btn').css('display','inline');
    // $('p').css('display','block');
})