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

## Usage

```javascript
import { createBlurUp } from '@mux/blurup';

const muxPlaybackId = 'O6LdRc0112FEJXH00bGsN9Q31yu5EIVHTgjTKRkKtEq1k';
const { blurDataURL } = await createBlurUp(muxPlaybackId, { time: 0 });
```
