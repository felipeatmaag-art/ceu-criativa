import processArtworkPixels from '@/components/create/processArtworkPixels';
self.onmessage = ({ data: { buffer, width, height } }) => {
  try {
    const pixels = new Uint8ClampedArray(buffer);
    const metadata = processArtworkPixels(pixels, width, height);
    self.postMessage({ buffer: pixels.buffer, metadata }, [pixels.buffer]);
  } catch (error) { self.postMessage({ error: error.message }); }
};