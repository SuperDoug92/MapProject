var nav_menu = document.getElementById("nav");
var nav_button = document.getElementById("nav_control");
nav_button.addEventListener('click', function(e) {
  nav_menu.classList.toggle('open');
  console.log("poop");
  console.log(drawer.classList);
  e.stopPropagation();
});
