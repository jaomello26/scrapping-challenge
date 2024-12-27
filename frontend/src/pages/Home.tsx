import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from "../components/ui/button"
import { Input } from "../components/ui/input"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../components/ui/card"


const Home: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const navigate = useNavigate()

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    navigate(`/results?q=${encodeURIComponent(searchTerm)}`)
  }

  return (
      <Card className="w-full max-w-md mx-auto">
          <CardHeader>
           <CardTitle className="text-3xl font-bold text-center">Amazon Reviews</CardTitle>
          </CardHeader>
        <CardContent>
          <form onSubmit={handleSearch} className="space-y-4">
            <Input
              type="text"
              placeholder="Enter the product you want a review summary"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <Button type="submit" className="w-full bg-yellow-400 hover:bg-yellow-500 text-gray-900">
              Search
            </Button>
          </form>
        </CardContent>
        <CardDescription>
            <p className='text-center text-gray-600 text-sm mx-4 pb-4'>
          Search for an Amazon product or insert the URL link of the product to see the review summary.
            </p>
        </CardDescription> 
        
      </Card>
  )
}

export default Home

