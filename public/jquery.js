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

$(document).ready(function () {
  const chords = [
    "C",
    "C#",
    "D",
    "D#",
    "E",
    "F",
    "F#",
    "G",
    "G#",
    "A",
    "A#",
    "B",
    "Cm",
    "C#m",
    "Dm",
    "D#m",
    "Em",
    "Fm",
    "F#m",
    "Gm",
    "G#m",
    "Am",
    "A#m",
    "Bm",
    "C7",
    "C#7",
    "D7",
    "D#7",
    "E7",
    "F7",
    "F#7",
    "G7",
    "G#7",
    "A7",
    "A#7",
    "B7",
    "Cdim",
    "C#dim",
    "Ddim",
    "D#dim",
    "Edim",
    "Fdim",
    "F#dim",
    "Gdim",
    "G#dim",
    "Adim",
    "A#dim",
    "Bdim",
  ];

  function randomChordGen() {
    let chord = chords[Math.floor(Math.random() * chords.length)];
    console.log(chord);
    $("#result").html(chord);
  }

  randomChordGen();
  // Call the randomChordGen function to generate a random chord

});
