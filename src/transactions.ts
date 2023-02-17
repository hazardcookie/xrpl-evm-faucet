import { Client, Payment, Wallet } from 'xrpl';

export async function sign_submit_await(client: Client, transaction: Payment, wallet: Wallet) {
    const ts_prepared = await client.autofill(transaction);
    const ts_signed = wallet.sign(ts_prepared);
    const ts_result = await client.submitAndWait(ts_signed.tx_blob);
    // @ts-expect-error
    const meta = ts_result.result.meta.TransactionResult;

    if (meta == "tesSUCCESS") {
        console.log(`Transaction succeeded: https://devnet.xrpl.org/transactions/${ts_signed.hash}`)
    } else {
        console.log('Transaction failed: ', meta)
    }
    return meta;
}