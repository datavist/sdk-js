## 📚  Datavist SDK – Quick‑Start Guide  
Datavist is an AI software-as-a-service that can reliably extract and monitor data from complex pages (modals, tables, etc.).

You will need to create a [Datavist](https://datavist.xyz) account to use the SDK (Software Development Kit). It only takes a few seconds. Extractions cost 1 cent per page. Deposit as little as $1 to get started and pay-as-you-go.

---

## 1️⃣ Getting Started  

```bash
npm i @datavist/sdk
# or if you are using Yarn
yarn add @datavist/sdk
```

```js
// src/index.js
import { DatavistClient, Project } from "@datavist/sdk";

const client = new DatavistClient({
  apiKey: "YOUR_API_KEY",                 // <-- replace with yours
  baseUrl: "https://api.datavist.xyz/v1", // optional
  retry: true,                            // optional
});
```

---

## 2️⃣ Usage

There are two ways to use Datavist: 

- Create/save a project that stores your settings and data in the cloud.
- Extract data in real-time--you are responsible for saving your own data and settings.

## 3️⃣ Create Project

### 3.1 Create Project With Prompt

```js
import { DatavistClient } from "@datavist/sdk";

(async () => {
  const client = new DatavistClient({ apiKey: "YOUR_API_KEY_" });

  const proj = await client.createProjectWithPrompt({
    title: "Prompt Demo",
    urls: ["https://example.com/"],
    prompt: "describe the page.",
    frequency: "once",
    email: "you@example.com",                 // optional notifications
  });

  console.log("✅ Project created –", proj);

  proj.start() // you have to explicitly start project to begin the crawler
})()
```

### 3.2 Create Project With Schema  

```js
const schemaProj = await client.createProjectWithSchema({
  title: "Schema Demo",
  urls: ["https://example.com/products"],
  doc_type: "product",
  extraction_scope: "auto",
  properties: ['title', 'sku'],
  frequency: "daily",
});

console.log(schemaProj.id);

schemaProj.start()
```

*Returned type:* `Project` (flavour `"schema"`).   Only the fields listed in `UpdatableSchemaFields` can be edited later (`title`,doc_type`, `properties`, `extraction_scope`, `frequency`, `email`, `webhook`, `max_pagination_pages`, `max_details_pages`).


### 3.3 Create Project With Workflow  

```js
const workflowProj = await client.createProjectWithWorkflow({
  title: "Workflow Demo",
  urls: ["https://example.com/articles"],
  prompt: "extract the article headline and summary.",
  doc_type: "article",
  extraction_scope: "auto",
  properties: ['title', 'summary'],
  frequency: "weekly",
});
console.log(workflowProj.id);

workflowProj.start()
```

*Returned type:* `Project` (flavour `"workflow"`).



## 4️⃣ Extract Data


Sometimes you just need a one‑off extraction and don’t want to store a project.

### 4.1 Extract Data With Prompt

```js
const rawCsv = await client.extractDataWithPrompt({
  urls: ["https://example.com/"],
  prompt: "list all links on the page.",
});
console.log("One‑off CSV:", rawCsv);
```

### 4.2 Extract Data With Schema 

```js
const rawJson = await client.extractDataWithSchema({
  urls: ["https://example.com/products"],
  doc_type: "product",
  extraction_scope: "auto",
  properties: ['name', 'price'],
});
console.log("One‑off JSON‑L:", rawJson);
```

## 5️⃣ Usage

### 5.1  Get Project Dataset (CSV / JSON / JSONL)

```js
import { writeFile } from "fs/promises";

// ---- CSV ---------------------------------------------------------
const csv = await proj.getDataset("csv");
await writeFile("./output.csv", csv);
console.log("✅ CSV written to ./output.csv");

// ---- JSON (array) ------------------------------------------------
const jsonArray = await proj.getDataset("json");
await writeFile("./output.json", JSON.stringify(jsonArray, null, 2));
console.log("✅ JSON array written to ./output.json");

// ---- Pagination example (only first 100 rows) -------------------
const first100 = await proj.getDataset("json", { limit: 100 });
console.log(`Fetched ${first100.length} rows`);

// ----‑JSONL ------------------------------------------------------
const jsonl = await proj.getDataset("jsonl");
await writeFile("./output.jsonl", jsonl);
console.log("✅ JSON‑L written to ./output.jsonl");
```

*All three formats are supported by the same method (`getDataset`).*  
You can also pass `offset` / `limit` to page through large result sets.


### 5.2 Get Status

```js
const status = await proj.getStatus();
console.log("🔄 Status:", status);
```
Possible values: `"pending"`, `"waiting"`, `"running"`, `"finished"`, `"error"`, `"disabled"`


### 5.3 Get Row Count

```js
const rowCount = await proj.getRowCount();
console.log("📊 Row count:", rowCount);
```


### 5.4 Modify/Update Project

```js
proj.title = "Prompt Demo – Updated";
proj.frequency = "daily";          // allowed for prompt flavour
await proj.save();                 // only the dirty fields are PATCHed

console.log("✏️ Project updated – new title:", proj.title);
```

### 5.5 Delete Project

```js
await proj.delete();
console.log("🗑️ Project deleted");
```

### 5.6 Get Project

```js
const fetched = await client.getProject(promptProj.id);
console.log("Fetched project title:", fetched.title);
```

> `client.getProject` returns the **raw JSON** (`ProjectRaw`).  
> If you need the high‑level wrapper, just do:  

```js
const proj = new Project(client, fetched, "prompt", ["https://example.com/"]);
```


## 6️⃣ Project Object – Example  

```
Project {
  dirty: Set(0) {},
  client: DatavistClient {
    apiKey: 'jl40924fb5cc4e3fb58a1b263b1325hk2',
    baseUrl: 'https://api.datavist.xyz/v1',
    retry: false
  },
  _data: {
    notifications: { email: 'you@example.com', webhook: '' },
    title: 'Prompt Demo',
    extraction_scope: 'auto',
    prompt: 'describe the page.',
    frequency: 'once',
    last_activity: null,
   : null,
    row_count: 1,
    status: 'finished',
    error_msg: '',
    max_details_pages: 0,
    max_pagination_pages: 0,
    total_project_revenue: 0.01,
    use_details_page: false,
    _id: '6929b7f98d95d700230fcc92',
    doc_type: 'custom',
    user: '01428235fc5ba20002342jkwjk2',
    createdAt: '2025-11-28T14:55:53.242Z',
    updatedAt: '2025-11-28T14:55:56.250Z',
    __v: 0,
    urls: 'https://example.com/',
    properties: { custom: [Array] }
  },
  _urls: 'https://example.com' ],
  whitelist: Set(6) { 'title', 'prompt', 'frequency', 'email', 'webhook', 'urls' }
}
```




