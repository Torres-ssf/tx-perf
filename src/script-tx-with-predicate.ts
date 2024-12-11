import { Provider, Wallet } from "fuels";
import "dotenv/config";
import { PredicateStdLibString } from "../sway-programs/predicates/PredicateStdLibString";
import { measure } from "./helpers";
import { ContractTransfer, TransferParamsInput } from "../sway-programs/contracts/ContractTransfer";
import { Vec } from "../sway-programs/contracts/common";


async function main() {
  const provider = await Provider.create(process.env.PROVIDER_URL as string)
  const account = Wallet.fromPrivateKey(process.env.ACCOUNT_PVK_1 as string, provider);

  // Funding predicate
  const tx = await account.transfer(process.env.PREDICATE_ADDRESS as string, 500);
  await tx.waitForResult()

  // Clear chain info cache
  Provider.clearChainAndNodeCaches()

  const { duration } = await measure(async () => {
    await provider.connect(process.env.PROVIDER_URL as string)
    const baseAssetId = provider.getBaseAssetId()
    const amount = 250

    const predicate = new PredicateStdLibString({
      provider,
      data: [1, 2, 'Hello World'],
    });

    const contract = new ContractTransfer(process.env.TRANSFER_CONTRACT_ID as string, predicate);
    const params: Vec<TransferParamsInput> = [
      {
        recipient: { Address: { bits: account.address.toB256() } },
        asset_id: { bits: baseAssetId },
        amount: amount,
      },
    ]

    const call = await contract.functions
      .execute_transfer(params)
      .txParams({ variableOutputs: 1 })
      .callParams({ forward: [amount, baseAssetId] })
      .call();

    return call.waitForResult()
  })

  console.log('script-transaction-with-predicate', duration);
}

main()
