$(function () {
  //menu-btn
  $('.menu-btn').click(function () {
    if ($(this).attr('data-open') == "false") {
      $(this).addClass('menu-btn-close');
      $('.menu').addClass('open');
      $('.wallet-wrapper').addClass('open');
      $(this).attr('data-open','true');
    } else {
      $(this).removeClass('menu-btn-close');
      $('.menu').removeClass('open');
      $('.wallet-wrapper').removeClass('open');
      $(this).attr('data-open','false');
    }
  });

  //set wallet
  $('.set-wallet-item').click(function () {
    $(this).addClass('selected').siblings().removeClass('selected');
  });
});