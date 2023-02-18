import { Client, Payment, TransactionMetadata, Wallet, xrpToDrops } from 'xrpl'

async function sign_submit_await(client: Client, transaction: Payment, wallet: Wallet) {
  const ts_prepared = await client.autofill(transaction)
  const ts_signed = wallet.sign(ts_prepared)
  const ts_result = await client.submitAndWait(ts_signed.tx_blob)
  const meta = ts_result.result.meta as TransactionMetadata

  if (meta && meta.TransactionResult == 'tesSUCCESS') {
    console.log(`Transaction succeeded: https://devnet.xrpl.org/transactions/${ts_signed.hash}`)
  } else {
    console.log('Transaction failed: ', meta)
  }
  return meta
}

export async function bridge(client: Client, xrpl_wallet: Wallet, evm_wallet_address: string, amount: number) {
  const transaction: Payment = {
    TransactionType: 'Payment',
    Account: xrpl_wallet.address,
    Amount: xrpToDrops(amount),
    Destination: 'radjmEZTb4zsyNUJGV4gcVPXrFTJAuskKa',
    Memos: [
      {
        Memo: {
          MemoData: Buffer.from(evm_wallet_address, 'utf8').toString('hex').toUpperCase()
        }
      }
    ]
  }

  const result = await sign_submit_await(client, transaction, xrpl_wallet)
  if (result.TransactionResult === 'tesSUCCESS') {
    console.log(`View your mapped EVM sidechain wallet: https://evm-sidechain.xrpl.org/address/${evm_wallet_address}`)
  }

  return result
}
