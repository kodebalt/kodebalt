export async function onRequestGet(context) {
   return context.env.LOGGER.fetch(context.request);
 }