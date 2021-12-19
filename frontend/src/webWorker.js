let setupSoundWorker = new Worker(new URL('./worker.js', import.meta.url))
if (window.Worker) {
  const myWorker = new Worker('worker.js')
} else {
}
