# @mux/blurup

JavaScript API to generate a blurry image placeholder for a Mux video.

The library retrieves a tiny video poster image from the Mux API
and generates a blurry image placeholder by upscaling the image and
applying a Gaussian blur.

See the blog post for more information:
[www.mux.com/blog/blurry-image-placeholders-on-the-web](https://www.mux.com/blog/blurry-image-placeholders-on-the-web)

## Installation

```bash
npm install @mux/blurup
```

## Usage ([Demo](https://blurup.vercel.app/))

```javascript
import { createBlurUp } from '@mux/blurup';

const options = {};
const muxPlaybackId = 'O6LdRc0112FEJXH00bGsN9Q31yu5EIVHTgjTKRkKtEq1k';

const { blurDataURL, aspectRatio } = await createBlurUp(muxPlaybackId, options);
console.log(blurDataURL, aspectRatio);
```

### Options

| Parameter      | Type               | Description                                                                                                                                                                                                                  | Default     |
| -------------- | ------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------- |
| time           | `number`           | The video timestamp from which to grab the blurhash. (If you're using a `thumbnailToken`, then the `time` option will have no effect; encode `time` in your token according to the secure video playback guide linked below) | `undefined` |
| width          | `string`           | Width of the output blurry image placeholder.                                                                                                                                                                                | `100%`      |
| height         | `string`           | Height of the output blurry image placeholder.                                                                                                                                                                               | `100%`      |
| precision      | `number`           | Increase this value to see more details but also increase the length of the data URL.                                                                                                                                        | `1`         |
| thumbnailToken | `string`           | Videos with playback restrictions may require a thumbnail token. See https://docs.mux.com/guides/video/secure-video-playback for details.                                                                                    | `undefined` |
| type           | `webp` `png` `jpg` | Image type to use in the output blurry image placeholder.                                                                                                                                                                    | `webp`      |


### Using `blurDataURL` with Mux Player

#### mux-player element

```html
<mux-player
  placeholder="{blurDataURL}"
  style="aspect-ratio: {aspectRatio}"
></mux-player>
```

#### mux-player-react and mux-player-react/lazy

```jsx
<MuxPlayer placeholder={blurDataURL} style={{ aspectRatio }} />
```

### Using `blurDataURL` with native elements

#### HTML

```html
<img src="{blurDataURL}" width="300" style="aspect-ratio: {aspectRatio}">
```

#### CSS

```css
background-image: url('{blurDataURL}');
aspect-ratio: {aspectRatio};
```
