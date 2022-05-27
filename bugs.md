# on Gnosis for user 0x42430c8517c3c3e8754f1d6c23af538037452bd7

can't find any mints or burns but there is a liquidityPosition, so it should have mints, right?

```
{
  mints(first:10, where: { to: "0x42430c8517c3c3e8754f1d6c23af538037452bd7", timestamp_gt: 0 }) {
    id
  },
  burns(first:10,  where: { to: "0x42430c8517c3c3e8754f1d6c23af538037452bd7", timestamp_gt: 0 }) {
    id,
    timestamp
  },
  liquidityPositions(where: { user: "0x42430c8517c3c3e8754f1d6c23af538037452bd7" }) {
    id,
    pair {
      id,
      token0 {
        name
      },
      token1 {
        name
      }
    },
    liquidityTokenBalance
  },
  liquidityPositionSnapshots(where: { user: "0x42430c8517c3c3e8754f1d6c23af538037452bd7" }) {
    id,
    pair {
      id,
      token0 {
        name
      },
      token1 {
        name
      }
    },
    liquidityTokenBalance
  },
  users(where: { id: "0x42430c8517c3c3e8754f1d6c23af538037452bd7" }) {
    liquidityPositions {
      pair {
        id
      }
    }
  }
}
```

0x0dedd9ed281a4cb7fbc91a4ef7790dd8f669c899
0x4ffad6ac852c0af0aa301376f4c5dea3a928b120