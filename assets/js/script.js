function getTextWidth(element) {
  var clone = element.cloneNode(true);
  clone.style.position = 'absolute';
  clone.style.visibility = 'hidden';
  clone.style.display = 'inline';
  document.body.appendChild(clone);
  var width = clone.getBoundingClientRect().width;
  document.body.removeChild(clone);
  return width;
}

function adjustWidth() {
  var header = document.getElementById('header');
  var subheaderContainer = document.getElementById('subheaderContainer');
  var headerTextWidth = getTextWidth(header);
  subheaderContainer.style.width = headerTextWidth + 'px';
}

function revertVisibility() {
  var elements = document.getElementsByClassName('text');
  for (var element of elements) {
    element.classList.remove('hidetext');
  }
}

function resizeText() {
  if (window.innerWidth < window.innerHeight - 200) {
    document.getElementById('header').classList.add('headerMobile');
    document.getElementById('subheaderContainer').classList.add('subheaderMobile');
    document.getElementById('copyright').classList.add('copyrightMobile');
  } else {
    document.getElementById('header').classList.remove('headerMobile');
    document.getElementById('subheaderContainer').classList.remove('subheaderMobile');
    document.getElementById('copyright').classList.remove('copyrightMobile');
  }
}

function init(firstRun) {
  resizeText();
  adjustWidth();
  if (firstRun) {
    revertVisibility();
  }
}

window.addEventListener('load', (event) => {
  init(true);
});
window.addEventListener('resize', (event) => {
  init(false);
});
