function getTextRect(containerNode) {
  let textRect;
  let textRange = document.createRange();
  textRange.selectNodeContents(containerNode);
  textRect = textRange.getBoundingClientRect();
  textRange.detach();
  return textRect;
}

export function resizeSubheader() {
  var container = document.getElementById("header");
  const textRect = getTextRect(container);
  document.getElementById("subheaderContainer").style.width = textRect.width + "px";
}

export function revertVisibility() {
  var elements = document.getElementsByClassName("text");
  for (var element of elements) {
    element.classList.remove("hidetext");
  }
}
