import processArtworkPixels from '@/components/create/processArtworkPixels';

export default function processArtworkImage(image) {
  const { width, height } = image;
  return new Promise((resolve, reject) => {
    let worker, timer, finished = false;
    const cleanup = () => { clearTimeout(timer); worker?.terminate(); };
    const fallback = async (error) => {
      if (finished) return;
      finished = true;
      cleanup();
      console.warn('Processamento paralelo indisponível; usando recorte local.', error?.message || error);
      // Keep the source buffer intact so a worker loading/crash error cannot lose the artwork.
      await new Promise(done => setTimeout(done, 0));
      try {
        const metadata = processArtworkPixels(image.data, width, height);
        resolve({ buffer: image.data.buffer, metadata });
      } catch (failure) { reject(failure); }
    };
    try {
      worker = new Worker(new URL('./artwork.worker.js', import.meta.url), { type: 'module' });
      timer = setTimeout(() => fallback(new Error('Tempo limite do processamento paralelo.')), 30000);
      worker.onmessage = ({ data }) => {
        if (finished) return;
        finished = true; cleanup();
        // A validation error is not a worker failure: never bypass transparency validation.
        data.error ? reject(new Error(data.error)) : resolve(data);
      };
      worker.onerror = event => { event.preventDefault(); fallback(event); };
      worker.onmessageerror = fallback;
      const buffer = image.data.buffer.slice(0);
      worker.postMessage({ buffer, width, height }, [buffer]);
    } catch (error) { fallback(error); }
  });
}