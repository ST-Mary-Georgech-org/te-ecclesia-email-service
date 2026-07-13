const queue = [];
let isProcessing = false;

const processQueue = async () => {
  if (isProcessing || queue.length === 0) {
    return;
  }

  isProcessing = true;
  const { task, resolve, reject } = queue.shift();

  try {
    const result = await task();
    resolve(result);
  } catch (error) {
    reject(error);
  } finally {
    isProcessing = false;
    processQueue();
  }
};

export const enqueueEmail = (task) =>
  new Promise((resolve, reject) => {
    queue.push({ task, resolve, reject });
    processQueue();
  });
