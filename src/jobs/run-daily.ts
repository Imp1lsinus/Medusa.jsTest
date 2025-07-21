import { MedusaContainer } from "@medusajs/framework/types"
import { createPriceSetWorkflow } from "../workflows/create-price-set"

export default async function myCustomJob(
  container: MedusaContainer
) {
  const { result } = await createPriceSetWorkflow(container)
    .run()

  console.log(result)
}

export const config = {
  name: "run-once-a-day",
  schedule: `0 0 * * *`,
}
