import React, { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card"
import { Badge } from "../components/ui/badge"
import { Button } from "../components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select"

interface KeyPhrase {
  phrase: string
  frequency: number
  sentiment: number
  review_indices: number[]
}

interface Review {
  rating: number
  author_name: string
  review_header: string
  review_text: string
  helpful_count: number
  review_posted_date: string
  review_country: string
  is_verified: boolean
}

interface ProductInfo {
  url: string
  name: string
  overall_rating: number
  total_reviews: number
  rating_distribution: {
    one_star: number
    two_star: number
    three_star: number
    four_star: number
    five_star: number
  }
  brand: string
}

interface ProductData {
  product_info: ProductInfo
  key_phrases: {
    positive: KeyPhrase[]
    negative: KeyPhrase[]
  }
  reviews: Review[]
}

const Insights: React.FC = () => {
  const { productId } = useParams()
  const [productData, setProductData] = useState<ProductData | null>(null)
  const [filteredReviews, setFilteredReviews] = useState<Review[]>([])
  const [selectedRating, setSelectedRating] = useState<string>('all')
  const [selectedSentiment, setSelectedSentiment] = useState<'all' | 'positive' | 'negative'>('all')
  const [selectedPhrase, setSelectedPhrase] = useState<string | null>(null)

  useEffect(() => {
    // TODO: Replace with actual API call
    const fetchData = async () => {
      try {
        const response = await fetch('/enhanced_formatted_data.json')
        const data = await response.json()
        setProductData(data)
        setFilteredReviews(data.reviews)
      } catch (error) {
        console.error('Error fetching product data:', error)
      }
    }
    fetchData()
  }, [productId])

  const filterReviews = () => {
    if (!productData) return

    let filtered = [...productData.reviews]

    // Filter by rating
    if (selectedRating !== 'all') {
      filtered = filtered.filter(review => review.rating === parseInt(selectedRating))
    }

    // Filter by phrase
    if (selectedPhrase) {
      const phraseData = [
        ...productData.key_phrases.positive,
        ...productData.key_phrases.negative
      ].find(p => p.phrase === selectedPhrase)

      if (phraseData) {
        filtered = filtered.filter((_, index) => 
          phraseData.review_indices.includes(index)
        )
      }
    }

    setFilteredReviews(filtered)
  }

  useEffect(() => {
    filterReviews()
  }, [selectedRating, selectedPhrase, selectedSentiment])

  if (!productData) {
    return <div>Loading...</div>
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex gap-6">
        {/* Left Column - Filters and Stats */}
        <div className="w-1/4 space-y-6">
          {/* Product Info Card */}
          <Card>
            <CardHeader>
              <CardTitle>{productData.product_info.name}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <p className="text-lg font-semibold">
                    {productData.product_info.overall_rating} / 5
                  </p>
                  <p className="text-sm text-gray-500">
                    Based on {productData.product_info.total_reviews} reviews
                  </p>
                </div>
                
                {/* Rating Distribution */}
                <div className="space-y-2">
                  {Object.entries(productData.product_info.rating_distribution)
                    .reverse()
                    .map(([rating, count]) => (
                      <div key={rating} className="flex items-center gap-2">
                        <span className="w-16">{rating.replace('_', ' ')}</span>
                        <div className="flex-1 h-2 bg-gray-200 rounded">
                          <div
                            className="h-full bg-yellow-400 rounded"
                            style={{
                              width: `${(count / productData.product_info.total_reviews) * 100}%`
                            }}
                          />
                        </div>
                        <span className="w-12 text-sm text-right">{count}</span>
                      </div>
                    ))}
                </div>

                {/* Rating Filter */}
                <Select
                  value={selectedRating}
                  onValueChange={setSelectedRating}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Filter by rating" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Ratings</SelectItem>
                    {[5, 4, 3, 2, 1].map(rating => (
                      <SelectItem key={rating} value={rating.toString()}>
                        {rating} Stars
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Key Phrases Card */}
          <Card>
            <CardHeader>
              <CardTitle>Key Phrases</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">Positive</h4>
                  <div className="flex flex-wrap gap-2">
                    {productData.key_phrases.positive.map((phrase) => (
                      <Badge
                        key={phrase.phrase}
                        variant="secondary"
                        className={`cursor-pointer ${
                          selectedPhrase === phrase.phrase ? 'bg-green-100' : ''
                        }`}
                        onClick={() => setSelectedPhrase(
                          selectedPhrase === phrase.phrase ? null : phrase.phrase
                        )}
                      >
                        {phrase.phrase} ({phrase.frequency})
                      </Badge>
                    ))}
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Negative</h4>
                  <div className="flex flex-wrap gap-2">
                    {productData.key_phrases.negative.map((phrase) => (
                      <Badge
                        key={phrase.phrase}
                        variant="secondary"
                        className={`cursor-pointer ${
                          selectedPhrase === phrase.phrase ? 'bg-red-100' : ''
                        }`}
                        onClick={() => setSelectedPhrase(
                          selectedPhrase === phrase.phrase ? null : phrase.phrase
                        )}
                      >
                        {phrase.phrase} ({phrase.frequency})
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Reviews */}
        <div className="w-3/4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Reviews</CardTitle>
              <span className="text-sm text-gray-500">
                Showing {filteredReviews.length} reviews
              </span>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {filteredReviews.map((review, index) => (
                  <Card key={index}>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="font-semibold">{review.review_header}</h4>
                          <div className="flex items-center gap-2 text-sm text-gray-500">
                            <span>{review.author_name}</span>
                            <span>•</span>
                            <span>{review.rating} stars</span>
                            <span>•</span>
                            <span>{review.review_posted_date}</span>
                          </div>
                        </div>
                        {review.helpful_count > 0 && (
                          <Badge variant="outline">
                            {review.helpful_count} found helpful
                          </Badge>
                        )}
                      </div>
                      <p className="mt-2">{review.review_text}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default Insights