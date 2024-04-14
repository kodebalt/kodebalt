import { revertVisibility, resizeSubheader } from "./shared.js";

const botKeywords = ["Googlebot", "Google-InspectionTool", "bingbot"];
const isBot = botKeywords.some((keyword) => navigator.userAgent.includes(keyword));
if (!isBot) {
  document.title = "Kodebalt: Page Not Found";
  document.querySelector("#header").textContent = "Page Not Found";
  document.querySelector("#subheaderContainer > .text").textContent = "Sorry, but the page you were trying to view does not exist, yet...";
}

window.addEventListener("load", () => {
  revertVisibility();
  resizeSubheader();
});
window.addEventListener("resize", () => {
  resizeSubheader();
});
