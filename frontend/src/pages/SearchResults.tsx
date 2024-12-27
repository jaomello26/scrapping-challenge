import React, { useState, useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import axios from 'axios'
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "../components/ui/card"
import { Button } from "../components/ui/button"
import { Input } from "../components/ui/input"
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "../components/ui/pagination"

export interface Product {
  title: string
  brand: string
  description: string
  final_price: number
  currency: string
  rating: number
  reviews_count: number
  image_url: string
  url: string
}

const Results: React.FC = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const [searchTerm, setSearchTerm] = useState<string>('')
  const [products, setProducts] = useState<Product[]>([])
  const [currentPage, setCurrentPage] = useState<number>(1)
  const itemsPerPage: number = 9

  const apiUrl = import.meta.env.VITE_API_URL

  useEffect(() => {
    const searchParams = new URLSearchParams(location.search)
    const q = searchParams.get('q')
    if (q) {
      setSearchTerm(q)
      fetchProducts(q)
    }
  }, [location.search])

  const useMockData = true
  const fetchProducts = async (keyword: string): Promise<void> => {
    if (useMockData) {
      setProducts([
        {
          "title": "FVRITO Aluminum Flywheel 10krpm for Predator 212 Non hemi Engine Ghost 212cc",
          "brand": "FVRITO",
          "description": "The motor can reach to excellent speed of 10k rpm making your engine achieve faster acceleration.",
          "final_price": 35.99,
          "currency": "USD",
          "rating": 4.4,
          "reviews_count": 76,
          "image_url": "https://m.media-amazon.com/images/I/61o79mDKecL._AC_SL1001_.jpg",
          "url": "https://www.amazon.com/FVRITO-Aluminum-Flywheel-Predator-Performance/dp/B0CN4K13ZJ"
        }
      ])

      return;
    }

    try {
      const response = await axios.post(`${apiUrl}/products`, { keyword })
      setProducts(response.data)
    } catch (error) {
      console.error("Error fetching products:", error)
    }
  }

  const handleSearch = (e: React.FormEvent<HTMLFormElement>): void => {
    e.preventDefault()
    navigate(`/results?q=${encodeURIComponent(searchTerm)}`)
    setCurrentPage(1)
  }

  const handlePageChange = (page: number): void => {
    setCurrentPage(page)
  }

  // Paginação local
  const paginatedProducts = products.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  return (
    <div className="container mx-auto p-6 space-y-6">
      <form onSubmit={handleSearch} className="flex gap-4">
        <Input
          type="text"
          value={searchTerm}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
          placeholder="Search products..."
          className="flex-1"
        />
        <Button type="submit">Search</Button>
      </form>

      {/* Grid de produtos */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {paginatedProducts.map((product: Product, index: number) => (
          <Card key={index}>
            <CardHeader>
              <CardTitle>{product.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <img src={product.image_url} alt={product.title} className="w-full h-48 object-cover" />
              <p className="text-2xl font-bold">
                {product.currency} {product.final_price.toFixed(2)}
              </p>
              <div className="flex items-center gap-2">
                <span>Rating: {product.rating}</span>
                <span>({product.reviews_count} reviews)</span>
              </div>
              <p className="text-sm text-gray-500">{product.brand}</p>
            </CardContent>
            <CardFooter>
              <a href={product.url} target="_blank" rel="noopener noreferrer">
                <Button className="w-full">View on Amazon</Button>
              </a>
            </CardFooter>
          </Card>
        ))}
      </div>

      {/* Paginação */}
      {products.length > itemsPerPage && (
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                onClick={() => handlePageChange(Math.max(currentPage - 1, 1))}
                className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                aria-disabled={currentPage === 1}
              />
            </PaginationItem>

            {Array.from(
              { length: Math.ceil(products.length / itemsPerPage) },
              (_, i) => i + 1
            ).map((page) => (
              <PaginationItem key={page}>
                <PaginationLink
                  onClick={() => handlePageChange(page)}
                  isActive={currentPage === page}
                >
                  {page}
                </PaginationLink>
              </PaginationItem>
            ))}

            <PaginationItem>
              <PaginationNext
                onClick={() => handlePageChange(Math.min(currentPage + 1, Math.ceil(products.length / itemsPerPage)))}
                className={currentPage === Math.ceil(products.length / itemsPerPage) ? "pointer-events-none opacity-50" : "cursor-pointer"}
                aria-disabled={currentPage === Math.ceil(products.length / itemsPerPage)}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}
    </div>
  )
}

export default Results
