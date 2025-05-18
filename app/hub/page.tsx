"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { SmartjectCard } from "@/components/smartject-card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ChevronDown, ChevronUp, Filter, Search, X, Building2, Cpu, Workflow } from "lucide-react"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { smartjectService } from "@/lib/services"
import type { SmartjectType } from "@/lib/types"
import { Skeleton } from "@/components/ui/skeleton"

export default function SmartjectsHubPage() {
  const [query, setQuery] = useState("")
  const [selectedIndustries, setSelectedIndustries] = useState<string[]>([])
  const [selectedTechnologies, setSelectedTechnologies] = useState<string[]>([])
  const [selectedFunctions, setSelectedFunctions] = useState<string[]>([])
  const [isFilterOpen, setIsFilterOpen] = useState(true)
  const [smartjects, setSmartjects] = useState<SmartjectType[]>([])
  const [industries, setIndustries] = useState<string[]>([])
  const [technologies, setTechnologies] = useState<string[]>([])
  const [functions, setFunctions] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // Fetch smartjects and filter options from Supabase
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true)
        const smartjectsData = await smartjectService.getSmartjects()
        setSmartjects(smartjectsData)

        // Extract unique industries, technologies, and functions
        const uniqueIndustries = Array.from(new Set(smartjectsData.flatMap((s) => s.industries || [])))
        const uniqueTechnologies = Array.from(new Set(smartjectsData.flatMap((s) => s.technologies || [])))
        const uniqueFunctions = Array.from(new Set(smartjectsData.flatMap((s) => s.businessFunctions || [])))

        setIndustries(uniqueIndustries)
        setTechnologies(uniqueTechnologies)
        setFunctions(uniqueFunctions)
      } catch (error) {
        console.error("Error fetching data:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [])

  const handleToggleFilter = (value: string, selected: string[], setSelected: (v: string[]) => void) => {
    if (selected.includes(value)) {
      setSelected(selected.filter((v) => v !== value))
    } else {
      setSelected([...selected, value])
    }
  }

  const clearAllFilters = () => {
    setSelectedIndustries([])
    setSelectedTechnologies([])
    setSelectedFunctions([])
  }

  const totalFiltersCount = selectedIndustries.length + selectedTechnologies.length + selectedFunctions.length

  const filteredSmartjects = smartjects.filter((s) => {
    const matchesQuery =
      s.title?.toLowerCase().includes(query.toLowerCase()) ||
      s.mission?.toLowerCase().includes(query.toLowerCase()) ||
      s.problematics?.toLowerCase().includes(query.toLowerCase()) ||
      s.scope?.toLowerCase().includes(query.toLowerCase())

    const matchesIndustries =
      selectedIndustries.length === 0 || selectedIndustries.some((i) => s.industries?.includes(i))

    const matchesTechnologies =
      selectedTechnologies.length === 0 || selectedTechnologies.some((t) => s.technologies?.includes(t))

    const matchesFunctions =
      selectedFunctions.length === 0 || selectedFunctions.some((f) => s.businessFunctions?.includes(f))

    return matchesQuery && matchesIndustries && matchesTechnologies && matchesFunctions
  })

  // Sort smartjects for different tabs
  const recentSmartjects = [...filteredSmartjects].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  )

  const mostNeededSmartjects = [...filteredSmartjects].sort((a, b) => b.votes.need - a.votes.need)

  const mostProvidedSmartjects = [...filteredSmartjects].sort((a, b) => b.votes.provide - a.votes.provide)

  const mostBelievedSmartjects = [...filteredSmartjects].sort((a, b) => b.votes.believe - a.votes.believe)

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Smartjects Hub</h1>
        <p className="text-muted-foreground mb-4">Explore all available AI implementation projects</p>

        {/* Search and Filter Bar */}
        <Card className="p-4 bg-muted/30">
          <div className="flex flex-col space-y-4">
            {/* Search Bar */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search smartjects..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Active Filters Display */}
            {totalFiltersCount > 0 && (
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-sm text-muted-foreground">Active filters:</span>
                {selectedIndustries.map((industry) => (
                  <Badge key={industry} variant="secondary" className="flex items-center gap-1">
                    <Building2 className="h-3 w-3 mr-1" />
                    {industry}
                    <X
                      className="h-3 w-3 cursor-pointer ml-1"
                      onClick={() => handleToggleFilter(industry, selectedIndustries, setSelectedIndustries)}
                    />
                  </Badge>
                ))}
                {selectedTechnologies.map((tech) => (
                  <Badge key={tech} variant="secondary" className="flex items-center gap-1">
                    <Cpu className="h-3 w-3 mr-1" />
                    {tech}
                    <X
                      className="h-3 w-3 cursor-pointer ml-1"
                      onClick={() => handleToggleFilter(tech, selectedTechnologies, setSelectedTechnologies)}
                    />
                  </Badge>
                ))}
                {selectedFunctions.map((func) => (
                  <Badge key={func} variant="secondary" className="flex items-center gap-1">
                    <Workflow className="h-3 w-3 mr-1" />
                    {func}
                    <X
                      className="h-3 w-3 cursor-pointer ml-1"
                      onClick={() => handleToggleFilter(func, selectedFunctions, setSelectedFunctions)}
                    />
                  </Badge>
                ))}
                <Button variant="ghost" size="sm" onClick={clearAllFilters} className="text-xs h-7 px-2">
                  Clear all
                </Button>
              </div>
            )}

            {/* Collapsible Filter Section */}
            <Collapsible open={isFilterOpen} onOpenChange={setIsFilterOpen}>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Filter className="h-4 w-4 mr-2" />
                  <span className="text-sm font-medium">Filters</span>
                  {totalFiltersCount > 0 && (
                    <Badge variant="secondary" className="ml-2 h-5 px-2">
                      {totalFiltersCount}
                    </Badge>
                  )}
                </div>
                <CollapsibleTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                    {isFilterOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                  </Button>
                </CollapsibleTrigger>
              </div>

              <CollapsibleContent className="pt-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Industries Filter */}
                  <FilterCategory
                    title="Industries"
                    icon={<Building2 className="h-4 w-4 mr-2" />}
                    options={industries}
                    selected={selectedIndustries}
                    onToggle={(value) => handleToggleFilter(value, selectedIndustries, setSelectedIndustries)}
                  />

                  {/* Technologies Filter */}
                  <FilterCategory
                    title="Technologies"
                    icon={<Cpu className="h-4 w-4 mr-2" />}
                    options={technologies}
                    selected={selectedTechnologies}
                    onToggle={(value) => handleToggleFilter(value, selectedTechnologies, setSelectedTechnologies)}
                  />

                  {/* Functions Filter */}
                  <FilterCategory
                    title="Functions"
                    icon={<Workflow className="h-4 w-4 mr-2" />}
                    options={functions}
                    selected={selectedFunctions}
                    onToggle={(value) => handleToggleFilter(value, selectedFunctions, setSelectedFunctions)}
                  />
                </div>
              </CollapsibleContent>
            </Collapsible>
          </div>
        </Card>
      </div>

      <Tabs defaultValue="recent">
        <TabsList className="mb-6">
          <TabsTrigger value="recent">Recent</TabsTrigger>
          <TabsTrigger value="most-needed">Most Needed</TabsTrigger>
          <TabsTrigger value="most-provided">Most Provided</TabsTrigger>
          <TabsTrigger value="most-believed">Most Believed</TabsTrigger>
        </TabsList>

        <TabsContent value="recent" className="space-y-4">
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array(6)
                .fill(0)
                .map((_, i) => (
                  <Card key={i} className="h-[400px]">
                    <div className="h-40 relative">
                      <Skeleton className="h-full w-full" />
                    </div>
                    <div className="p-5 space-y-4">
                      <Skeleton className="h-6 w-3/4" />
                      <div className="space-y-2">
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-2/3" />
                      </div>
                      <div className="flex gap-2">
                        <Skeleton className="h-8 w-20" />
                        <Skeleton className="h-8 w-20" />
                      </div>
                    </div>
                  </Card>
                ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {recentSmartjects.map((smartject) => (
                <SmartjectCard key={smartject.id} smartject={smartject} />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="most-needed" className="space-y-4">
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array(6)
                .fill(0)
                .map((_, i) => (
                  <Card key={i} className="h-[400px]">
                    <div className="h-40 relative">
                      <Skeleton className="h-full w-full" />
                    </div>
                    <div className="p-5 space-y-4">
                      <Skeleton className="h-6 w-3/4" />
                      <div className="space-y-2">
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-2/3" />
                      </div>
                      <div className="flex gap-2">
                        <Skeleton className="h-8 w-20" />
                        <Skeleton className="h-8 w-20" />
                      </div>
                    </div>
                  </Card>
                ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {mostNeededSmartjects.map((smartject) => (
                <SmartjectCard key={smartject.id} smartject={smartject} />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="most-provided" className="space-y-4">
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array(6)
                .fill(0)
                .map((_, i) => (
                  <Card key={i} className="h-[400px]">
                    <div className="h-40 relative">
                      <Skeleton className="h-full w-full" />
                    </div>
                    <div className="p-5 space-y-4">
                      <Skeleton className="h-6 w-3/4" />
                      <div className="space-y-2">
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-2/3" />
                      </div>
                      <div className="flex gap-2">
                        <Skeleton className="h-8 w-20" />
                        <Skeleton className="h-8 w-20" />
                      </div>
                    </div>
                  </Card>
                ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {mostProvidedSmartjects.map((smartject) => (
                <SmartjectCard key={smartject.id} smartject={smartject} />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="most-believed" className="space-y-4">
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array(6)
                .fill(0)
                .map((_, i) => (
                  <Card key={i} className="h-[400px]">
                    <div className="h-40 relative">
                      <Skeleton className="h-full w-full" />
                    </div>
                    <div className="p-5 space-y-4">
                      <Skeleton className="h-6 w-3/4" />
                      <div className="space-y-2">
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-2/3" />
                      </div>
                      <div className="flex gap-2">
                        <Skeleton className="h-8 w-20" />
                        <Skeleton className="h-8 w-20" />
                      </div>
                    </div>
                  </Card>
                ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {mostBelievedSmartjects.map((smartject) => (
                <SmartjectCard key={smartject.id} smartject={smartject} />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}

// Filter Category Component
function FilterCategory({
  title,
  icon,
  options,
  selected,
  onToggle,
}: {
  title: string
  icon: React.ReactNode
  options: string[]
  selected: string[]
  onToggle: (value: string) => void
}) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" className="w-full justify-between" aria-expanded={selected.length > 0}>
          <div className="flex items-center">
            {icon}
            <span>{title}</span>
          </div>
          {selected.length > 0 && (
            <Badge variant="secondary" className="ml-2">
              {selected.length}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-56 p-0" align="start">
        <div className="p-2">
          {options.map((option) => (
            <div
              key={option}
              className={`
                flex items-center justify-between p-2 rounded-md cursor-pointer text-sm
                ${selected.includes(option) ? "bg-primary/10" : "hover:bg-muted"}
              `}
              onClick={() => onToggle(option)}
            >
              <span>{option}</span>
              {selected.includes(option) && (
                <Badge variant="secondary" className="h-5 px-1.5">
                  <X className="h-3 w-3" />
                </Badge>
              )}
            </div>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  )
}
