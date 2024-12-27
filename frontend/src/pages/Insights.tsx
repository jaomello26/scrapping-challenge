import React, { useState, useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card"
import { StarIcon } from "@radix-ui/react-icons"
import { Button } from "../components/ui/button"
import { Input } from "../components/ui/input"

// Mock data for demonstration
const mockResults = [
  { id: 1, name: 'Product 1', price: '$19.99', rating: 4.5, reviews: 1234 },
  { id: 2, name: 'Product 2', price: '$29.99', rating: 3.8, reviews: 567 },
  { id: 3, name: 'Product 3', price: '$39.99', rating: 4.2, reviews: 890 },
]

const Results: React.FC = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const [searchTerm, setSearchTerm] = useState('')
  const [results, setResults] = useState(mockResults)

  useEffect(() => {
    const searchParams = new URLSearchParams(location.search)
    const q = searchParams.get('q')
    if (q) {
      setSearchTerm(q)
      // Here you would typically fetch results based on the search term
      // For now, we'll just use the mock data
      setResults(mockResults)
    }
  }, [location.search])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    navigate(`/results?q=${encodeURIComponent(searchTerm)}`)
  }

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ y: 0 }}
        animate={{ y: -50 }}
        transition={{ duration: 0.5 }}
      >
        <form onSubmit={handleSearch} className="flex gap-2 mb-8">
          <Input
            type="text"
            placeholder="Enter the product you want a review summary for"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-grow"
          />
          <Button type="submit" className="bg-yellow-400 hover:bg-yellow-500 text-gray-900">
            Search
          </Button>
        </form>
      </motion.div>

      <h1 className="text-3xl font-bold text-gray-900">Results for "{searchTerm}"</h1>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {results.map((product, index) => (
          <motion.div
            key={product.id}
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
          >
            <Card className="hover:shadow-lg transition-shadow duration-300">
              <CardHeader>
                <CardTitle>{product.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-2">{product.price}</p>
                <div className="flex items-center mb-2">
                  <StarIcon className="w-5 h-5 text-yellow-400 mr-1" />
                  <span className="font-medium text-gray-900">{product.rating}</span>
                  <span className="text-gray-600 ml-2">({product.reviews} reviews)</span>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  )
}

export default Results

