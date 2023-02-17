import { sign_submit_await } from './transactions'
import { Wallet, xrpToDrops, Client, Payment } from 'xrpl'

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
  if (result == 'tesSUCCESS') {
    console.log(`View your mapped EVM sidechain wallet: https://evm-sidechain.xrpl.org/address/${evm_wallet_address}`)
  }

  return result
}
