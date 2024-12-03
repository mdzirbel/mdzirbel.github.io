
function togglePicture(name) {
  var x = document.getElementById(name);
  if (x.style.display === "block") {
    x.style.display = "none";
  } 
  else {
    x.style.display = "block";
  }
}