/* demo.ts */
import DatavistClient from './src/client';
import { Project } from './src/project';

async function main() {
  const client = new DatavistClient({ apiKey: 'qrwertjli3toh909' });

  // --------------------------------------------------------------
  // 1️⃣  Prompt‑based project – urls are passed as an array
  // --------------------------------------------------------------
  const project1 = await client.createProjectWithPrompt({
    title: 'Prompt Demo',
    urls: [
      'https://example.com',
    ],
    prompt: 'describe the page.',
    frequency: 'once',
    notifications: { email: 'you@example.com' },
  });
  console.log('✅ Project created –', project1);
  
  project1.notifications.email = "foo@foo.foo"
  console.log(project1)

  project1.save()
  
  project1.delete()
  
  // --------------------------------------------------------------
  // 2️⃣  Poll status via the dedicated method
  // --------------------------------------------------------------
  let status = await promptProj.getStatus();
  while (status !== 'finished') {
    console.log('⏳ Status:', status);
    await new Promise(r => setTimeout(r, 3000));
    status = await promptProj.getStatus();
  }
  console.log('🚀 Project finished!');

  // --------------------------------------------------------------
  // 3️⃣  Get the dataset as parsed JSON (no extra‑libs)
  // --------------------------------------------------------------
  const data = await promptProj.getDataset('json');
  console.log('📊 Rows extracted:', data.length);
  console.log('First row:', data[0]);

  const moreData = await client.extractDataWithPrompt({
  	url: 'https://books.toscrape.com',
  	prompt: 'give me a list of the cover images'
  });
  
  console.log("######moreData::::", moreData)

  const data3 = await client.extractDataWithSchema({
  	url: 'https://books.toscrape.com',
  	doc_type: 'Book',
  	properties: ['title']
  });
  
  console.log("######data3::::", data3)
  
}

main().catch(err => console.error('❌ Error:', err));