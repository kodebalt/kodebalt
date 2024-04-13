function getTextWidth(element) {
  var clone = element.cloneNode(true);
  clone.style.position = "absolute";
  clone.style.visibility = "hidden";
  clone.style.display = "inline";
  document.body.appendChild(clone);
  var width = clone.getBoundingClientRect().width;
  document.body.removeChild(clone);
  return width;
}

export function adjustWidth() {
  var header = document.getElementById("header");
  var subheaderContainer = document.getElementById("subheaderContainer");
  var headerTextWidth = getTextWidth(header);
  subheaderContainer.style.width = headerTextWidth + "px";
}

export function revertVisibility() {
  var elements = document.getElementsByClassName("text");
  for (var element of elements) {
    element.classList.remove("hidetext");
  }
}
