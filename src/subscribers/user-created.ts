import {
  type SubscriberConfig,
  type SubscriberArgs,
} from "@medusajs/framework"
import { createPriceSetWorkflow } from "../workflows/create-price-set"

export default async function handleUserCreated({
  event: { data },
  container,
}: SubscriberArgs<{ id: string }>) {
  const { result } = await createPriceSetWorkflow(container)
    .run()

  console.log(result)
}

export const config: SubscriberConfig = {
  event: "user.created",
}