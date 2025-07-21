import { defineRouteConfig } from "@medusajs/admin-sdk"
import { Container, Heading, Badge, Text, Button } from "@medusajs/ui"
import { useQuery } from "@tanstack/react-query"
import { sdk } from "../lib/sdk.ts"
import { Link, useNavigate } from "react-router-dom"

interface PriceList {
  id: string
  title: string
  status: "active" | "draft"
  description?: string
  updated_at: string
  starts_at?: string | null
  ends_at?: string | null
}

const PriceListCard = ({ pl }: { pl: PriceList }) => {
  const currentDate = new Date()
  const startDate = pl.starts_at ? new Date(pl.starts_at) : null
  const endDate = pl.ends_at ? new Date(pl.ends_at) : null

  let statusColor: React.ComponentProps<typeof Badge>["color"] = "grey"
  let statusLabel = "Черновик"

  if (startDate && startDate > currentDate) {
    statusColor = "orange"
    statusLabel = "Запланирован"
  } else if (endDate && endDate < currentDate) {
    statusColor = "red"
    statusLabel = "Истек"
  } else if (pl.status === "active") {
    statusColor = "green"
    statusLabel = "Активен"
  }

  return (
    <Link 
      to={`/price-lists/${pl.id}`}
      className="block bg-ui-bg-base rounded-lg border border-ui-border-base p-4 hover:shadow-elevation-card-hover transition-shadow h-full"
    >
      <div className="flex justify-between items-start mb-3">
        <Heading level="h3" className="text-lg font-medium truncate max-w-[70%]">
          {pl.title}
        </Heading>
        <Badge color={statusColor}>{statusLabel}</Badge>
      </div>

      {(statusLabel === "Запланирован" || statusLabel === "Истек") && (
        <div className="mb-4">
          {statusLabel === "Запланирован" && (
            <div className="flex items-center justify-between text-ui-fg-subtle text-sm mb-1">
              <span>Начало:</span>
              <span className="font-medium">
                {pl.starts_at ? new Date(pl.starts_at).toLocaleDateString('ru-RU') : "-"}
              </span>
            </div>
          )}
          <div className="flex items-center justify-between text-ui-fg-subtle text-sm">
            <span>{statusLabel === "Истек" ? "Окончание:" : "Окончание:"}</span>
            <span className="font-medium">
              {pl.ends_at ? new Date(pl.ends_at).toLocaleDateString('ru-RU') : "-"}
            </span>
          </div>
        </div>
      )}

      <Text className="text-ui-fg-subtle mb-4 line-clamp-2">
        {pl.description || "Без описания"}
      </Text>
      
      <div className="flex justify-between items-center text-ui-fg-muted">
        <Text as="span" size="small" leading="compact">
          Обновлено:
        </Text>
        <Text as="span" size="small" leading="compact">
          {new Date(pl.updated_at).toLocaleDateString('ru-RU')}
        </Text>
      </div>
    </Link>
  )
}

const PriceListsPage = () => {
  const navigate = useNavigate()
  
  const priceListsQuery = useQuery({
    queryKey: ["price-lists"],
    queryFn: () => sdk.admin.priceList.list({
      fields: "id,title,status,description,updated_at,starts_at,ends_at"
    }),
  })

  if (priceListsQuery.isLoading) {
    return (
      <Container>
        <Heading level="h2">Прайс-листы</Heading>
        <div className="flex justify-center py-12">
          <span>Загрузка данных...</span>
        </div>
      </Container>
    )
  }

  if (priceListsQuery.error) {
    return (
      <Container>
        <Heading level="h2">Прайс-листы</Heading>
        <div className="bg-rose-100 text-rose-800 p-4 rounded-md">
          Ошибка: {priceListsQuery.error.message}
        </div>
      </Container>
    )
  }

  const priceLists = priceListsQuery.data?.price_lists as PriceList[] || []

  const statusGroups = [
    { 
      title: "Активные", 
      filter: (item: PriceList) => 
        item.status === "active" && 
        (!item.ends_at || new Date(item.ends_at) > new Date()) &&
        (!item.starts_at || new Date(item.starts_at) <= new Date())
    },
    { 
      title: "Запланированные", 
      filter: (item: PriceList) => 
        item.starts_at && new Date(item.starts_at) > new Date()
    },
    { 
      title: "Черновики", 
      filter: (item: PriceList) => 
        item.status === "draft" && 
        (!item.ends_at || new Date(item.ends_at) > new Date()) &&
        (!item.starts_at || new Date(item.starts_at) <= new Date())
    },
    { 
      title: "Истекшие", 
      filter: (item: PriceList) => 
        item.ends_at && new Date(item.ends_at) < new Date()
    }
  ]

  return (
    <Container>
      <div className="flex justify-between items-center mb-6">
        <Heading level="h2">Управление прайс-листами</Heading>
        <div className="flex items-center gap-2">
          <div className="bg-ui-bg-subtle text-ui-fg-subtle px-2 py-1 rounded-full text-sm">
            Всего: {priceLists.length}
          </div>
          <Button 
            size="small" 
            variant="secondary"
            onClick={() => navigate("/price-lists/create")}
          >
            Новый прайс-лист
          </Button>
        </div>
      </div>

      {priceLists.length === 0 ? (
        <div className="bg-ui-bg-subtle rounded-lg p-8 text-center">
          <p className="text-ui-fg-subtle">Прайс-листы не найдены</p>
          <Button 
            className="mt-4" 
            onClick={() => navigate("/price-lists/create")}
          >
            Создать первый
          </Button>
        </div>
      ) : (
        <div className="space-y-8">
          {statusGroups.map((group) => {
            const filteredItems = priceLists.filter(group.filter)
            if (filteredItems.length === 0) return null
            
            return (
              <section key={group.title}>
                <Heading level="h3" className="text-lg font-medium mb-4">
                  {group.title} <span className="text-ui-fg-muted">({filteredItems.length})</span>
                </Heading>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredItems.map((item) => (
                    <PriceListCard key={item.id} pl={item} />
                  ))}
                </div>
              </section>
            )
          })}
        </div>
      )}
    </Container>
  )
}

export const config = defineRouteConfig({
  label: "Прайс-листы",
})

export default PriceListsPage