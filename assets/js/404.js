import { revertVisibility, resizeSubheader } from "./shared.js";

window.addEventListener("load", () => {
  revertVisibility();
  resizeSubheader();
});
window.addEventListener("resize", () => {
  resizeSubheader();
});
