import Arweave from 'arweave';

interface ContentPayload {
  content: any[],
  type: string
}

async function uploadArweave(data: ContentPayload) {
  const arweave = Arweave.init({ host: 'arweave.net' });
  const key = await arweave.wallets.generate();
  const transaction = await arweave.createTransaction({
    "data": JSON.stringify(data)
  }, key);
  transaction.addTag('Content-Type', 'application/json');
  await arweave.transactions.sign(transaction, key);
  const { id } = transaction;
  const uploader = await arweave.transactions.getUploader(transaction);
  while (!uploader.isComplete) {
    await uploader.uploadChunk();
    console.log(`${uploader.pctComplete}% complete, ${uploader.uploadedChunks}/${uploader.totalChunks}`);
  }
  return `https://arweave.net/${id}`
};

const dummyData = {
  type: "blocks",
  content: [{
    type: "paragraph",
    data: {
      text: "Hello World"
    }
  }]
};

try {
  console.log(dummyData)
  uploadArweave(dummyData);
} catch (e) {
  console.log(e);
}