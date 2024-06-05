# RAG Experiments

# Ingestion Pipeline

- Queue webpage(s) to ingest
- Scrape HTML
  - Cleanup HTML and convert to markdown
- Send cleaned up markdown content to an LLM (`mixtral-8x7b` via Groq) to summarize
- Vectorized summarized content (OpenAI `text-embedding-3-small`)
- Store webpage embeddings in `pgvetor`
  - with summarized content + webpage url as metadata

## Ingestion Queue

- Webpage ingestion is handled asynchronously by a FIFO queue
  - The queue takes in a `user_id` and a `url` to scrape as [payload](./src/hermes/events/queueWebpageScrape.ts#L11-L14)
- Failures are handled by re-processing the same message with exponential backoff up to a configurable `maxRetries` number of times.
  - Any error thrown by the [handler](https://github.com/SwarnimWalavalkar/rag-experiments/blob/main/src/hermes/events/queueWebpageScrape.ts#L27) function is consider a failure

## Scrapers

The scraping flow supports bespoke scraping logic for different hostnames

Code Reference -> [app/services/webscraper](./src/app/services/webscraper/index.ts#L19-L22)

# Query (& Retrieval) Flow

- Submit a query
- Vectorize user query (OpenAI `text-embedding-3-small`)
- Find the most similar\* document from the corpus of documents ingested by the user
  - `*` = Highest cosine similarity threshold
- Send user query + retrieved context to LLM (OpenAI `gpt-4o`) to generate a response

## Query Caching

LLM responses are semantically cached using an in-memory FAISS vector store such that unnecessary LLM requests are avoided for very similar queries...

Code References

- [app/services/openai.service.ts#L85-L105](./src/app/services/ai/openai.service.ts#L85-L105)
- [app/services/vector/faiss.ts](./src/app/services/vector/faiss.ts)

# Known Issues

- Document retrieval is biased towards longer documents
- Puppeteer instance disconnects from the browser instance on error
  - Need to build better mechanisms for connection recovery

# Improvement Ideas

### Query Caching

- Integrate an LRU cache in the in-memory vector store to ensure a constant size

### Ingestion Queue

- Add support for concurrency
- Implement a DLQ for finally failed messages
- Decouple each step in the processing pipeline to increase resilience
  - Allow each step to fail and recover independently (with different retry policies since the nature of failure for different steps will be different)
  - A DAG dependency graph like structure for the processing flow

### RAG

- Better (re)ranking (with something like Cohere Command R)
- More structured processing
  - Better chunking and text splitting
- More structured retrieval system
  - Convert a user question to a more structured and expressive query object
    - Dynamically create a prompt with this object to improve precision and recall
- Add Observability

#### RAG Answering System

- Cite specific text chunks from source documents
- Structured Model Responses
  - Using something like [instructor-js](https://js.useinstructor.com/)
- Stream model responses

---

~

# Running the Project

## Setting Up

Setup .env from the default values in [.env.development](.env.development)

```
cp .env.development .env
```

Install node dependencies

```
pnpm i
```

Start dependencies in docker

```
make start
```

## Running the service

Start the development server

```
pnpm run dev
```

Or, start the service alongside all dependencies in docker

```
make start-all
```

The service will start listening on port `4001`

## Managing database Migrations

Migrations files are tracked in the [/migrations](/migrations) directory

```
make migrate [...args]

up [N]        Apply all or N up migrations
down [N]      Apply all or N down migrations

create NAME   Create a set of timestamped up/down migrations titled NAME
```

Migrations are internally handled with [https://github.com/golang-migrate/migrate](https://github.com/golang-migrate/migrate)

---

> This project was bootstrapped from [github.com/SwarnimWalavalkar/webServiceStarter](https://github.com/SwarnimWalavalkar/webServiceStarter)
