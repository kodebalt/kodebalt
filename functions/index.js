export async function onRequestGet(context) {
  context.waitUntil(context.env.LOGGER.fetch(context.request));
  //  context.env.LOGGER.fetch(context.request);
  return context.env.ASSETS.fetch(context.request);
}
