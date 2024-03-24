export async function onRequestGet(context) {
  context.env.LOGGER.fetch(context.request);
  return fetch(context.request);
}