import { imageDimensionsFromData } from 'image-dimensions';

const defaultOptions = {
  type: 'webp',
  precision: 1,
  time: undefined,
  thumbnailToken: undefined,
  width: '100%',
  height: '100%',
};

export async function createBlurUp(playbackId, options) {
  const {
    type,
    precision,
    time,
    thumbnailToken,
    width: svgWidth,
    height: svgHeight,
  } = {
    ...defaultOptions,
    ...options,
  };

  const imageURL = new URL(`https://image.mux.com/${playbackId}/thumbnail.${type}`);

  if (typeof time !== 'undefined' && typeof thumbnailToken !== 'undefined') {
    console.warn(
      '[@mux/blurup] When thumbnailToken is set, time will have no effect. Encode time in your token. See https://docs.mux.com/guides/video/secure-video-playback for more information.'
    );
  }

  imageURL.searchParams.set('width', precision * 16);
  imageURL.searchParams.set('height', precision * 16);

  if (typeof time !== 'undefined') {
    imageURL.searchParams.set('time', time);
  }

  if (typeof thumbnailToken !== 'undefined') {
    imageURL.searchParams.set('token', thumbnailToken);
  }

  const response = await fetch(imageURL, { headers: { Accept: `image/${type}` } });

  if (response.status === 403) {
    if (typeof options.thumbnailToken !== 'undefined') {
      throw new Error(
        `[@mux/blurup] Error fetching thumbnail. 403: Forbidden. The thumbnailToken option may be invalid. See https://docs.mux.com/guides/video/secure-video-playback for more information.`
      );
    } else {
      throw new Error(
        `[@mux/blurup] Error fetching thumbnail. 403: Forbidden. This Playback ID may require a thumbnail token. See https://docs.mux.com/guides/video/secure-video-playback for more information.`
      );
    }
  } else if (response.status >= 400) {
    throw new Error(
      `[@mux/blurhash] Error fetching thumbnail. ${response.status}: ${response.statusText}`
    );
  }

  const arrayBuffer = await response.arrayBuffer();
  const base64String = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)));
  const imageDataURL = `data:${response.headers.get('content-type')};base64,${base64String}`;
  const { width, height } = imageDimensionsFromData(arrayBuffer);

  return {
    width,
    height,
    aspectRatio: width / height,
    imageURL,
    imageDataURL,
    blurDataURL: `data:image/svg+xml;charset=utf-8,${svgBlurImage(imageDataURL, svgWidth, svgHeight)}`,
  };
}

function svgBlurImage(tinyImageDataURL, width, height) {
  const svg = /*html*/`<svg xmlns="http://www.w3.org/2000/svg" ${width ? `width="${width}"` : ''} ${height ? `height="${height}"` : ''}><filter id="b" color-interpolation-filters="sRGB"><feGaussianBlur stdDeviation="20"/><feComponentTransfer><feFuncA type="discrete" tableValues="1 1"/></feComponentTransfer></filter><g filter="url(#b)"><image width="100%" height="100%" href="${tinyImageDataURL}"/></g></svg>`;
  return svg.replace(/#/g, '%23');
}
