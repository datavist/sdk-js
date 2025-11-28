## 📚  Datavist SDK – Quick‑Start Guide  

---

## 1️⃣ Getting Started  

```bash
npm i @datavist/sdk
# or if you are using Yarn
yarn add @datavist/sdk
```

```ts
// src/index.ts
import { DatavistClient, Project } from "@datavist/sdk";

const client = new DatavistClient({
  apiKey: "YOUR_API_KEY",                 // <-- replace with yours
  // baseUrl defaults to https://api.datavist.xyz/v1
  retry: true,                            // optional – retry on 429/5xx
});
```

---

## 2️⃣ Basic Example  

The code below runs the whole lifecycle of a **prompt‑based** project and prints useful info at each step.

```ts
import { DatavistClient } from "@datavist/sdk";

(async () => {
  const client = new DatavistClient({ apiKey: "jl40924fb5cc4e3fb58a1b263b1325hk2" });

  // -------------------------------------------------
  // 1️⃣  Create a project (prompt flavour)
  // -------------------------------------------------
  const proj = await client.createProjectWithPrompt({
    title: "Prompt Demo",
    urls: ["https://example.com/"],            // ← array is accepted
    prompt: "describe the page.",
    frequency: "once",
    email: "you@example.com",                 // optional notifications
  });

  console.log("✅ Project created –", proj);

  // -------------------------------------------------
  // 2️⃣  Extract the data (the project already ran)
  // -------------------------------------------------
  const csv = await proj.getDataset("csv");
  console.log("📥 CSV data (first 200 chars):", csv.slice(0, 200));

  // -------------------------------------------------
  // 3️⃣  Get status & row count
  // -------------------------------------------------
  const status = await proj.getStatus();
  console.log("🔄 Status:", status);

  const rowCount = await proj.getRowCount();
  console.log("📊 Row count:", rowCount);

  // -------------------------------------------------
  // 4️⃣  Update a few mutable fields
  // -------------------------------------------------
  proj.title = "Prompt Demo – Updated";
  proj.frequency = "daily";          // allowed for prompt flavour
  await proj.save();                 // only the dirty fields are PATCHed

  console.log("✏️ Project updated – new title:", proj.title);

  // -------------------------------------------------
  // 5️⃣  Delete the project (clean up)
  // -------------------------------------------------
  await proj.delete();
  console.log("🗑️ Project deleted");
})();
```

---

## 3️⃣ Create Project With Prompt  

```ts
const promptProj = await client.createProjectWithPrompt({
  title: "Prompt Demo",
  urls: ["https://example.com/"],
  prompt: "describe the page.",
  frequency: "once",
  email: "you@example.com",
});
console.log(promptProj.id);          // → "6929b7f98d95d700230fcc92"
`

*Returned type:* `Project` (flavour automatically set to `"prompt"` and the original URL array stored internally.)

---

## 4️⃣ Create Project With Schema  

```ts
const schemaProj = await client.createProjectWithSchema({
  title: "Schema Demo",
  urls: ["https://example.com/products"],
  doc_type: "product",
  extraction_scope: "auto",
  properties: ['title', 'sku'],
  frequency: "daily",
});
console.log(schemaProj.id);
```

*Returned type:* `Project` (flavour `"schema"`).   Only the fields listed in `UpdatableSchemaFields` can be edited later (`title`,doc_type`, `properties`, `extraction_scope`, `frequency`, `email`, `webhook`, `max_pagination_pages`, `max_details_pages`).

---

## 5️⃣ Create Project With Workflow  

Workflow = **prompt + schema** (first run a prompt, then interpret the result with a schema).

```ts
const workflowProj = await client.createProjectWithWorkflow({
  title: "Workflow Demo",
  urls: ["https://example.com/articles"],
  prompt: "extract the article headline and summary.",
  doc_type: "article",
  extraction_scope: "auto",
  properties: {
    headline: { path: "$.headline", type: "string" },
    summary:  { path: "$.summary",  type: "string" },
  },
  frequency: "weekly",
});
console.log(workflowProj.id);
```

*Returned type:* `Project` (flavour `"workflow"`).

---

## 6️⃣ Extract Data **Without** a Project  

Sometimes you just need a one‑off extraction and don’t want to store a project.

### 6.1 Prompt‑based one‑off  

```ts
const rawCsv = await client.extractDataWithPrompt({
  urls: ["https://example.com/"],
  prompt: "list all links on the page.",
});
console.log("One‑off CSV:", rawCsv);
```

### 6.2 Schema‑based one‑off extraction  

```ts
const rawJson = await client.extractDataWithSchema({
  urls: ["https://example.com/products"],
  doc_type: "product",
  extraction_scope: "auto",
  properties: {
    price: { path: "$.price", type: "number" },
    name:  { path: "$.name",  type: "string" },
  },
});
console.log("One‑off JSON‑L:", rawJson);
```

---

## 7️⃣ Get Project (Read‑only)

```ts
const fetched = await client.getProject(promptProj.id);
console.log("Fetched project title:", fetched.title);
```

> `client.getProject` returns the **raw JSON** (`ProjectRaw`).  
> If you need the high‑level wrapper, just do:  

```ts
const proj = new Project(client, fetched, "prompt", ["https://example.com/"]);
```

---

## 8️⃣  

Only **mutable** fields (according to the flavour whitelist) can be changed.  
The `Project` wrapper tracks dirty fields automatically.

```ts
proj.title = "New Title";
proj = "hourly";      // allowed for prompt flavour
await proj.save();              // PATCHes only `title` & `frequency`
console.log("✅ Updated fields persisted");
```

---

## 9️⃣ Delete Project  

```ts
await proj.delete();            // HTTP DELETE /project/:id
console.log("🗑️ Project removed from the server");
```

---

## 🔟 Get Project Status  

```ts
const status = await proj.getStatus();   // calls /project/:id/status
console.log("Current status:", status);
```

Possible values: `"waiting"`, `"running"`, `"finished"`, `"error"`, `"disabled"` …

---

## 1️⃣1️⃣ Get Project Row Count  

```ts
const rows = await proj.getRowCount();   // calls /project/data/:id/count
console.log("Rows extracted so far:", rows);
```

The API response is `{ count: number }`; the wrapper returns the **number** directly.

---

## 1️⃣2️⃣ Get Project Dataset (CSV / JSON‑L / JSON)  

```ts
import { writeFile } from "fs/promises";

// ---- CSV ---------------------------------------------------------
const csv = await proj.getDataset("csv");
await writeFile("./output.csv", csv);
console.log("✅ CSV written to ./output.csv");

// ----‑L ------------------------------------------------------
const jsonl = await proj.getDataset("jsonl");
await writeFile("./output.jsonl", jsonl);
console.log("✅ JSON‑L written to ./output.jsonl");

// ---- JSON (array) ------------------------------------------------
const jsonArray = await proj.getDataset("json");
await writeFile("./output.json", JSON.stringify(jsonArray, null, 2));
console.log("✅ JSON array written to ./output.json");

// ---- Pagination example (only first 100 rows) -------------------
const first100 = await proj.getDataset("json", { limit: 100 });
console.log(`Fetched ${first100.length} rows`);
```

*All three formats are supported by the same method (`getDataset`).*  
You can also pass `offset` / `limit` to page through large result sets.

---

## 1️⃣3️⃣ Project Object – What it **looks like**  

When you runbasic example** (or any of the “create” calls) you will see something similar to the console output you posted:

```
✅ Project created – Project {
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
