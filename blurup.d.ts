export type Options = {
  type?: string;
  blur?: number;
  quality?: number;
  time?: number | undefined;
  thumbnailToken?: string | undefined;
  width?: string | number;
  height?: string | number;
};

export type BlurUpResult = {
  width: number;
  height: number;
  aspectRatio: number;
  imageURL: URL;
  imageDataURL: string;
  blurDataURL: string;
};

export function createBlurUp(playbackId: string, options?: Options): Promise<BlurUpResult>;

export default createBlurUp;
