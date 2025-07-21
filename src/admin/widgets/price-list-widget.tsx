import { defineWidgetConfig } from "@medusajs/admin-sdk"
import { Container, Heading } from "@medusajs/ui"
import { DetailWidgetProps } from "@medusajs/framework/types"
import type { AdminPriceList } from "@medusajs/types"

const PriceListWidget = ({ data }: DetailWidgetProps<AdminPriceList>) => {
  return (
    <Container>
      <Heading level="h2">Мой виджет для прайс-листа {data.title}</Heading>
    </Container>
  )
}

export const config = defineWidgetConfig({
  zone: "price_list.details.before",
})

export default PriceListWidget