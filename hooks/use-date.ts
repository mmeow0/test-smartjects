"use client"

import { useState, useCallback } from "react"
import { isValid, parse, format } from "date-fns"

export function useDate(initialDate?: Date) {
  const [date, setDate] = useState<Date | undefined>(initialDate)
  const [error, setError] = useState<string | null>(null)

  const handleDateChange = useCallback((newDate?: Date) => {
    if (!newDate) {
      setDate(undefined)
      setError(null)
      return
    }

    if (!isValid(newDate)) {
      setError("Please enter a valid date")
      return
    }

    setDate(newDate)
    setError(null)
  }, [])

  const parseDate = useCallback((dateString: string, formatString = "yyyy-MM-dd") => {
    try {
      const parsedDate = parse(dateString, formatString, new Date())
      if (isValid(parsedDate)) {
        setDate(parsedDate)
        setError(null)
        return parsedDate
      } else {
        setError("Invalid date format")
        return undefined
      }
    } catch (e) {
      setError("Error parsing date")
      return undefined
    }
  }, [])

  const formatDate = useCallback(
    (formatString = "PPP") => {
      if (!date || !isValid(date)) return ""
      return format(date, formatString)
    },
    [date],
  )

  return {
    date,
    setDate: handleDateChange,
    error,
    parseDate,
    formatDate,
    isValid: date ? isValid(date) : true,
  }
}
