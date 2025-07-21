---
title: Sui Indexer
description: Hướng dẫn sử dụng Sui Indexer để query dữ liệu blockchain hiệu quả
---

# Sui Indexer

Sui Indexer là một công cụ mạnh mẽ giúp index và query dữ liệu từ Sui blockchain một cách hiệu quả. Nó cung cấp GraphQL API để truy vấn dữ liệu phức tạp.

## Tại sao cần Indexer?

- **Hiệu suất**: Query nhanh hơn so với RPC trực tiếp
- **Tính năng**: Hỗ trợ các query phức tạp, filtering, sorting
- **Lịch sử**: Truy cập dữ liệu lịch sử đầy đủ
- **Aggregation**: Tính toán thống kê và metrics

## GraphQL Endpoint

```
Mainnet: https://sui-mainnet.mystenlabs.com/graphql
Testnet: https://sui-testnet.mystenlabs.com/graphql
Devnet: https://sui-devnet.mystenlabs.com/graphql
```

## Cài đặt Client

### JavaScript/TypeScript

```bash
npm install @apollo/client graphql
```

```typescript
import { ApolloClient, InMemoryCache, gql } from '@apollo/client';

const client = new ApolloClient({
  uri: 'https://sui-testnet.mystenlabs.com/graphql',
  cache: new InMemoryCache(),
});
```

### Python

```bash
pip install gql[all]
```

```python
from gql import gql, Client
from gql.transport.requests import RequestsHTTPTransport

transport = RequestsHTTPTransport(
    url="https://sui-testnet.mystenlabs.com/graphql"
)
client = Client(transport=transport, fetch_schema_from_transport=True)
```

## Query cơ bản

### Lấy thông tin Objects

```graphql
query GetObjects($address: SuiAddress!) {
  address(address: $address) {
    objects {
      nodes {
        objectId
        version
        digest
        type {
          repr
        }
        owner {
          ... on AddressOwner {
            owner {
              address
            }
          }
          ... on Shared {
            initialSharedVersion
          }
          ... on Immutable {
            __typename
          }
        }
      }
    }
  }
}
```

### Lấy Balance

```graphql
query GetBalance($address: SuiAddress!, $type: String) {
  address(address: $address) {
    balance(type: $type) {
      totalBalance
    }
    balances {
      nodes {
        coinType {
          repr
        }
        totalBalance
      }
    }
  }
}
```

### Lấy Transaction History

```graphql
query GetTransactions($address: SuiAddress!, $first: Int, $after: String) {
  address(address: $address) {
    transactionBlocks(first: $first, after: $after) {
      pageInfo {
        hasNextPage
        endCursor
      }
      nodes {
        digest
        sender {
          address
        }
        gasInput {
          gasSponsor {
            address
          }
          gasPrice
          gasBudget
        }
        effects {
          status
          gasEffects {
            gasUsed
          }
        }
        expiration {
          epochId
        }
      }
    }
  }
}
```

## Query nâng cao

### Events Filtering

```graphql
query GetEvents($type: String!, $first: Int) {
  events(
    filter: { eventType: $type }
    first: $first
  ) {
    nodes {
      sendingModule {
        package {
          address
        }
        name
      }
      type {
        repr
      }
      senders {
        address
      }
      timestamp
      json
    }
  }
}
```

### Objects với Dynamic Fields

```graphql
query GetObjectWithDynamicFields($id: SuiAddress!) {
  object(address: $id) {
    dynamicFields {
      nodes {
        name {
          type {
            repr
          }
          json
        }
        value {
          ... on MoveObject {
            contents {
              json
            }
          }
        }
      }
    }
  }
}
```

### Package và Modules

```graphql
query GetPackage($id: SuiAddress!) {
  object(address: $id) {
    asMovePackage {
      modules {
        nodes {
          name
          functions {
            nodes {
              name
              visibility
              parameters {
                type {
                  signature
                }
              }
              return_ {
                signature
              }
            }
          }
          structs {
            nodes {
              name
              abilities
              fields {
                name
                type {
                  signature
                }
              }
            }
          }
        }
      }
    }
  }
}
```

## JavaScript Implementation

### Setup Client

```typescript
// indexer-client.ts
import { ApolloClient, InMemoryCache, gql } from '@apollo/client';

export class SuiIndexerClient {
  private client: ApolloClient<any>;

  constructor(endpoint: string) {
    this.client = new ApolloClient({
      uri: endpoint,
      cache: new InMemoryCache(),
    });
  }

  async getObjects(address: string) {
    const query = gql`
      query GetObjects($address: SuiAddress!) {
        address(address: $address) {
          objects {
            nodes {
              objectId
              version
              type {
                repr
              }
              owner {
                ... on AddressOwner {
                  owner {
                    address
                  }
                }
              }
            }
          }
        }
      }
    `;

    const result = await this.client.query({
      query,
      variables: { address },
    });

    return result.data.address.objects.nodes;
  }

  async getBalance(address: string, coinType?: string) {
    const query = gql`
      query GetBalance($address: SuiAddress!, $type: String) {
        address(address: $address) {
          balance(type: $type) {
            totalBalance
          }
        }
      }
    `;

    const result = await this.client.query({
      query,
      variables: { address, type: coinType },
    });

    return result.data.address.balance.totalBalance;
  }

  async getTransactions(address: string, first: number = 10) {
    const query = gql`
      query GetTransactions($address: SuiAddress!, $first: Int) {
        address(address: $address) {
          transactionBlocks(first: $first) {
            nodes {
              digest
              sender {
                address
              }
              effects {
                status
                gasEffects {
                  gasUsed
                }
              }
            }
          }
        }
      }
    `;

    const result = await this.client.query({
      query,
      variables: { address, first },
    });

    return result.data.address.transactionBlocks.nodes;
  }

  async getEvents(eventType: string, first: number = 10) {
    const query = gql`
      query GetEvents($type: String!, $first: Int) {
        events(filter: { eventType: $type }, first: $first) {
          nodes {
            sendingModule {
              package {
                address
              }
              name
            }
            type {
              repr
            }
            timestamp
            json
          }
        }
      }
    `;

    const result = await this.client.query({
      query,
      variables: { type: eventType, first },
    });

    return result.data.events.nodes;
  }
}
```

### Usage Example

```typescript
// app.ts
import { SuiIndexerClient } from './indexer-client';

const indexer = new SuiIndexerClient('https://sui-testnet.mystenlabs.com/graphql');

async function main() {
  const address = '0x123...';

  // Get objects
  const objects = await indexer.getObjects(address);
  console.log('Objects:', objects);

  // Get SUI balance
  const balance = await indexer.getBalance(address);
  console.log('SUI Balance:', balance);

  // Get transactions
  const transactions = await indexer.getTransactions(address, 5);
  console.log('Recent transactions:', transactions);

  // Get events
  const events = await indexer.getEvents('0x2::coin::CoinMetadata', 10);
  console.log('Coin events:', events);
}

main().catch(console.error);
```

## React Hooks

```typescript
// hooks/useIndexer.ts
import { useState, useEffect } from 'react';
import { SuiIndexerClient } from '../indexer-client';

export function useObjects(address: string) {
  const [objects, setObjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const indexer = new SuiIndexerClient('https://sui-testnet.mystenlabs.com/graphql');
    
    indexer.getObjects(address)
      .then(setObjects)
      .catch(setError)
      .finally(() => setLoading(false));
  }, [address]);

  return { objects, loading, error };
}

export function useBalance(address: string, coinType?: string) {
  const [balance, setBalance] = useState('0');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const indexer = new SuiIndexerClient('https://sui-testnet.mystenlabs.com/graphql');
    
    indexer.getBalance(address, coinType)
      .then(setBalance)
      .finally(() => setLoading(false));
  }, [address, coinType]);

  return { balance, loading };
}

export function useTransactions(address: string, count: number = 10) {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const indexer = new SuiIndexerClient('https://sui-testnet.mystenlabs.com/graphql');
    
    indexer.getTransactions(address, count)
      .then(setTransactions)
      .finally(() => setLoading(false));
  }, [address, count]);

  return { transactions, loading };
}
```

## Analytics và Metrics

### DeFi TVL Tracking

```typescript
async function trackTVL(protocolPackage: string) {
  const query = gql`
    query GetTVL($package: SuiAddress!) {
      events(
        filter: { 
          emittingModule: { package: $package }
          eventType: "LiquidityAdded"
        }
        first: 1000
      ) {
        nodes {
          json
          timestamp
        }
      }
    }
  `;

  // Process events to calculate TVL over time
}
```

### NFT Collection Stats

```typescript
async function getNFTStats(collectionType: string) {
  const query = gql`
    query GetNFTStats($type: String!) {
      objects(
        filter: { type: $type }
        first: 1000
      ) {
        nodes {
          owner {
            ... on AddressOwner {
              owner {
                address
              }
            }
          }
          contents {
            json
          }
        }
      }
    }
  `;

  // Calculate floor price, volume, holders, etc.
}
```

## Pagination

```typescript
async function getAllTransactions(address: string) {
  let allTransactions = [];
  let cursor = null;
  let hasNextPage = true;

  while (hasNextPage) {
    const query = gql`
      query GetTransactions($address: SuiAddress!, $after: String) {
        address(address: $address) {
          transactionBlocks(first: 50, after: $after) {
            pageInfo {
              hasNextPage
              endCursor
            }
            nodes {
              digest
              effects {
                status
              }
            }
          }
        }
      }
    `;

    const result = await client.query({
      query,
      variables: { address, after: cursor },
    });

    const { nodes, pageInfo } = result.data.address.transactionBlocks;
    allTransactions.push(...nodes);
    
    hasNextPage = pageInfo.hasNextPage;
    cursor = pageInfo.endCursor;
  }

  return allTransactions;
}
```

## Subscription (Real-time)

```typescript
import { createClient } from 'graphql-ws';
import { gql } from '@apollo/client';

const wsClient = createClient({
  url: 'wss://sui-testnet.mystenlabs.com/graphql',
});

async function subscribeToEvents(eventType: string) {
  const subscription = gql`
    subscription OnNewEvents($type: String!) {
      events(filter: { eventType: $type }) {
        nodes {
          json
          timestamp
          senders {
            address
          }
        }
      }
    }
  `;

  const unsubscribe = wsClient.subscribe(
    { query: subscription, variables: { type: eventType } },
    {
      next: (data) => {
        console.log('New event:', data);
      },
      error: (err) => {
        console.error('Subscription error:', err);
      },
      complete: () => {
        console.log('Subscription completed');
      },
    }
  );

  return unsubscribe;
}
```

## Best Practices

1. **Pagination**: Sử dụng pagination cho large datasets
2. **Caching**: Cache kết quả để giảm số lượng requests
3. **Error Handling**: Xử lý network errors và rate limiting
4. **Batch Queries**: Combine multiple queries khi có thể
5. **Real-time**: Sử dụng subscriptions cho real-time updates
6. **Performance**: Chỉ query các fields cần thiết

## Ví dụ: DeFi Dashboard

```typescript
class DeFiDashboard {
  private indexer: SuiIndexerClient;

  constructor() {
    this.indexer = new SuiIndexerClient('https://sui-mainnet.mystenlabs.com/graphql');
  }

  async getDashboardData(userAddress: string) {
    const [balance, positions, transactions, events] = await Promise.all([
      this.indexer.getBalance(userAddress),
      this.getUserPositions(userAddress),
      this.indexer.getTransactions(userAddress, 10),
      this.getRecentEvents(userAddress),
    ]);

    return {
      totalBalance: balance,
      defiPositions: positions,
      recentActivity: transactions,
      protocolEvents: events,
    };
  }

  private async getUserPositions(address: string) {
    // Query user's DeFi positions across protocols
    // This would involve complex queries across multiple packages
  }

  private async getRecentEvents(address: string) {
    // Get recent DeFi-related events for the user
  }
}
```

Sui Indexer mang lại khả năng query mạnh mẽ và linh hoạt, giúp xây dựng các ứng dụng phức tạp với hiệu suất cao trên Sui blockchain! 