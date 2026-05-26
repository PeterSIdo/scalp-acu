import { useState } from 'react'

export function useSelectedPoint() {
  const [selectedPoint, setSelectedPoint] = useState(null)
  return { selectedPoint, setSelectedPoint }
}
