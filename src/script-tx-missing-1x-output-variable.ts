import { Provider, Wallet } from "fuels";
import "dotenv/config";
import { measure } from "./helpers";
import { ContractTransfer, TransferParamsInput } from "../sway-programs/contracts/ContractTransfer";
import { Vec } from "../sway-programs/contracts/common";


async function main() {
  const provider = await Provider.create(process.env.PROVIDER_URL as string);
  const account = Wallet.fromPrivateKey(process.env.ACCOUNT_PVK_1 as string, provider);

  // Clear chain info cache
  Provider.clearChainAndNodeCaches()

  const { duration } = await measure(async () => {
    await provider.connect(process.env.PROVIDER_URL as string);
    const contract = new ContractTransfer(process.env.TRANSFER_CONTRACT_ID as string, account);

    const baseAssetId = provider.getBaseAssetId()
    const amount = 100

    // Only one transfer param, requiring 1 `OutputVariable`
    const params: Vec<TransferParamsInput> = [
      {
        recipient: { Address: { bits: account.address.toB256() } },
        asset_id: { bits: baseAssetId },
        amount,
      },
    ]

    const call = await contract.functions
      .execute_transfer(params)
      .callParams({
        forward: [amount, baseAssetId],
      })
      .call();

    return call.waitForResult()
  })

  console.log('script-transaction-missing-1x-output-variable', duration);
}

main()
