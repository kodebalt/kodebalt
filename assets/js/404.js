import { adjustWidth, revertVisibility } from "./shared.js";

function init(firstRun) {
  adjustWidth();
  if (firstRun) {
    revertVisibility();
  }
}

window.addEventListener("load", () => {
  init(true);
});
window.addEventListener("resize", () => {
  init(false);
});
