import * as sdk from "@superhuman/plugins-sdk";
export const connector = sdk.newConnector();

// Regular expression that matches Superhuman-hosted images.
const HostedImageUrlRegex = /^https:\/\/(?:[a-z0-9-]+\.)*codahosted\.io\//i;

// Formula that calculates the file size of an image.
connector.addFormula({
  name: "FileSize",
  description: "Gets the file size of an image, in bytes.",
  parameters: [
    sdk.makeParameter({
      type: sdk.ParameterType.Image,
      name: "image",
      description:
        "The image to operate on. Not compatible with Image URL columns.",
    }),
  ],
  resultType: sdk.ValueType.Number,
  execute: async function ([imageUrl], context) {
    // Throw an error if the image isn't Superhuman-hosted. Image URL
    // columns can contain images on any domain, but by default Packs can only
    // access image attachments hosted on codahosted.io.
    if (!imageUrl.match(HostedImageUrlRegex)) {
      throw new sdk.UserVisibleError("Not compatible with Image URL columns.");
    }
    // Fetch the image content.
    let response = await context.fetcher.fetch({
      method: "GET",
      url: imageUrl,
      isBinaryResponse: true, // Required when fetching binary content.
    });
    // The binary content of the response is returned as a Node.js Buffer.
    // See: https://nodejs.org/api/buffer.html
    let buffer = response.body as Buffer;
    // Return the length, in bytes.
    return buffer.length;
  },
});
