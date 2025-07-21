import { defineRouteConfig } from "@medusajs/admin-sdk"
import { Container, Heading, Badge, Text, Button } from "@medusajs/ui"
import { useQuery } from "@tanstack/react-query"
import { sdk } from "../../lib/sdk.ts"
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
  const now = new Date()
  const startsAt = pl.starts_at ? new Date(pl.starts_at) : null
  const endsAt = pl.ends_at ? new Date(pl.ends_at) : null

  let badgeColor: React.ComponentProps<typeof Badge>["color"] = "grey"
  let badgeText = "Черновик"

  if (startsAt && startsAt > now) {
    badgeColor = "orange"
    badgeText = "Запланирован"
  } else if (endsAt && endsAt < now) {
    badgeColor = "red"
    badgeText = "Истек"
  } else if (pl.status === "active") {
    badgeColor = "green"
    badgeText = "Активен"
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
        <Badge color={badgeColor}>{badgeText}</Badge>
      </div>

      {(badgeText === "Запланирован" || badgeText === "Истек") && (
        <div className="mb-4">
          {badgeText === "Запланирован" && (
            <div className="flex items-center justify-between text-ui-fg-subtle text-sm mb-1">
              <span>Начало:</span>
              <span className="font-medium">
                {pl.starts_at ? new Date(pl.starts_at).toLocaleDateString('ru-RU') : "-"}
              </span>
            </div>
          )}
          <div className="flex items-center justify-between text-ui-fg-subtle text-sm">
            <span>{badgeText === "Истек" ? "Окончание:" : "Окончание:"}</span>
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

const CustomPriceListsPage = () => {
  const navigate = useNavigate()
  
  const { data, isLoading, error } = useQuery({
    queryKey: ["price-lists"],
    queryFn: () => sdk.admin.priceList.list({
      fields: "id,title,status,description,updated_at,starts_at,ends_at"
    }),
  })

  if (isLoading) {
    return (
      <Container>
        <Heading level="h2">Прайс-листы</Heading>
        <div className="flex justify-center py-12">
          <span>Загрузка...</span>
        </div>
      </Container>
    )
  }

  if (error) {
    return (
      <Container>
        <Heading level="h2">Прайс-листы</Heading>
        <div className="bg-rose-100 text-rose-800 p-4 rounded-md">
          Ошибка загрузки: {(error as Error).message}
        </div>
      </Container>
    )
  }

  const priceLists = data?.price_lists as PriceList[] || []

  const groups = [
    { title: "Активные", filter: (pl: PriceList) => 
      pl.status === "active" && 
      (!pl.ends_at || new Date(pl.ends_at) > new Date()) &&
      (!pl.starts_at || new Date(pl.starts_at) <= new Date())
    },
    { title: "Запланированные", filter: (pl: PriceList) => 
      pl.starts_at && new Date(pl.starts_at) > new Date()
    },
    { title: "Черновики", filter: (pl: PriceList) => 
      pl.status === "draft" && 
      (!pl.ends_at || new Date(pl.ends_at) > new Date()) &&
      (!pl.starts_at || new Date(pl.starts_at) <= new Date())
    },
    { title: "Истекшие", filter: (pl: PriceList) => 
      pl.ends_at && new Date(pl.ends_at) < new Date()
    }
  ]

  return (
    <Container>
      <div className="flex justify-between items-center mb-6">
        <Heading level="h2">Прайс-листы</Heading>
        <div className="flex items-center gap-2">
          <div className="bg-ui-bg-subtle text-ui-fg-subtle px-2 py-1 rounded-full text-sm">
            Всего: {priceLists.length}
          </div>
          <Button 
            size="small" 
            variant="secondary"
            onClick={() => navigate("/price-lists/create")}
          >
            Создать прайс-лист
          </Button>
        </div>
      </div>

      {priceLists.length === 0 ? (
        <div className="bg-ui-bg-subtle rounded-lg p-8 text-center">
          <p className="text-ui-fg-subtle">Нет доступных прайс-листов</p>
        </div>
      ) : (
        <div className="space-y-8">
          {groups.map((group) => {
            const filteredLists = priceLists.filter(group.filter)
            if (filteredLists.length === 0) return null
            
            return (
              <div key={group.title}>
                <Heading level="h3" className="text-lg font-medium mb-4">
                  {group.title} ({filteredLists.length})
                </Heading>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredLists.map((pl) => (
                    <PriceListCard key={pl.id} pl={pl} />
                  ))}
                </div>
              </div>
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

export default CustomPriceListsPage