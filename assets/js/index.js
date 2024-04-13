import { adjustWidth, revertVisibility } from "./shared.js";

const googlebotKeywords = ["Googlebot", "Google-InspectionTool"];
const isGooglebot = googlebotKeywords.some((keyword) => navigator.userAgent.includes(keyword));
if (!isGooglebot) {
  document.title = "Kodebalt: Page Not Found";
  document.querySelector("#header").textContent = "Page Not Found";
  document.querySelector("#subheaderContainer > .text").textContent = "Sorry, but the page you were trying to view does not exist, yet...";
}

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
