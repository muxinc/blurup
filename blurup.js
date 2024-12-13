import { imageDimensionsFromStream } from 'image-dimensions';

const defaultOptions = {
  type: 'webp',
  blur: 20,
  quality: 1,
  time: undefined,
  thumbnailToken: undefined,
  width: '100%',
  height: '100%',
};

export async function createBlurUp(playbackId, options) {
  let {
    type,
    blur,
    quality,
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

  quality = parseFloat(quality);

  if (isNaN(quality) || quality < 1) {
    throw new Error('[@mux/blurup] Quality must be greater or equal to 1');
  }
  imageURL.searchParams.set('width', 16 * quality);
  imageURL.searchParams.set('height', 16 * quality);

  time = parseFloat(time);

  if (time >= 0) {
    imageURL.searchParams.set('time', time);
  }

  if (typeof thumbnailToken !== 'undefined') {
    imageURL.searchParams.set('token', thumbnailToken);
  }

  const fetchOptions =  { headers: { Accept: `image/${type}` } }
  const imageFetch = fetch(imageURL, fetchOptions);

  // we also want to fetch the full-size source image from mux,
  // so that we can measure its width and height
  const sourceURL = new URL(imageURL);
  sourceURL.searchParams.delete('width');
  sourceURL.searchParams.delete('height');
  const sourceFetch = fetch(sourceURL, fetchOptions);

  const [response, sourceResponse] = await Promise.all([imageFetch, sourceFetch]);
  

  if (response.status === 403 || sourceResponse.status === 403) {
    if (typeof options.thumbnailToken !== 'undefined') {
      throw new Error(
        `[@mux/blurup] Error fetching thumbnail. 403: Forbidden. The thumbnailToken option may be invalid. See https://docs.mux.com/guides/video/secure-video-playback for more information.`
      );
    } else {
      throw new Error(
        `[@mux/blurup] Error fetching thumbnail. 403: Forbidden. This Playback ID may require a thumbnail token. See https://docs.mux.com/guides/video/secure-video-playback for more information.`
      );
    }
  } else if (response.status >= 400 ) {
    throw new Error(
      `[@mux/blurhash] Error fetching thumbnail. ${response.status}: ${response.statusText}`
    );
  } else if (sourceResponse.status >= 400 ) {
    throw new Error(
      `[@mux/blurhash] Error fetching thumbnail. ${sourceResponse.status}: ${sourceResponse.statusText}`
    );
  }

  // first, let's get the small image and blur it up a bit
  const arrayBuffer = await response.arrayBuffer();
  const base64String = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)));
  const imageDataURL = `data:${response.headers.get('content-type')};base64,${base64String}`;
  const blurDataURL =
  blur == 0
  ? imageDataURL
  : `data:image/svg+xml;charset=utf-8,${svgBlurImage(imageDataURL, svgWidth, svgHeight, blur)}`;
  
  // next, let's get the image size from the source image response
  const { width, height } = await imageDimensionsFromStream(sourceResponse.body);
  const aspectRatio = width / height;

  return {
    width,
    height,
    aspectRatio,
    imageURL,
    imageDataURL,
    blurDataURL,
  };
}

function svgBlurImage(tinyImageDataURL, width, height, stdDeviation) {
  const svg = /*html*/`<svg xmlns="http://www.w3.org/2000/svg" ${width ? `width="${width}"` : ''} ${height ? `height="${height}"` : ''}><filter id="b" color-interpolation-filters="sRGB"><feGaussianBlur stdDeviation="${stdDeviation}"/><feComponentTransfer><feFuncA type="discrete" tableValues="1 1"/></feComponentTransfer></filter><g filter="url(#b)"><image width="100%" height="100%" preserveAspectRatio="xMidYMid slice" href="${tinyImageDataURL}"/></g></svg>`;
  return svg.replace(/#/g, '%23');
}

export default createBlurUp;
