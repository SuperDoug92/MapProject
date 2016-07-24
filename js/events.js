var menu = document.getElementById("drawer");

menu.addEventListener('click', function(e) {
  drawer.classList.toggle('open');
  console.log(drawer.classList);
  e.stopPropagation();
});
