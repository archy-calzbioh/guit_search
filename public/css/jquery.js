$(document).ready(function () {
  $(".box").hover(
    function () {
      $(this).addClass("animate__heartBeat");
    },
    function () {
      $(this).removeClass("animate__heartBeat");
    }
  );
});
