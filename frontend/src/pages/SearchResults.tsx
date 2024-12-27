import React, { useState, useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
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
  id: number;
  name: string;
  price: string;
  rating: number;
  reviews: number;
}

export interface ProductsResponse {
  products: Product[];
  totalPages: number;
}

const Results: React.FC = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const [searchTerm, setSearchTerm] = useState<string>('')
  const [currentPage, setCurrentPage] = useState<number>(1)
  const itemsPerPage: number = 9

  const { data, isLoading, error } = useQuery<ProductsResponse, Error>({
    queryKey: ['products', currentPage, searchTerm],
    queryFn: async (): Promise<ProductsResponse> => {
      const searchQuery = searchTerm ? `&q=${searchTerm}` : ''
      const response = await axios.get<Product[]>(
        `http://localhost:3001/products?_page=${currentPage}&_limit=${itemsPerPage}${searchQuery}`
      )
      const total = parseInt(response.headers['x-total-count'] || '0')
      return {
        products: response.data,
        totalPages: Math.ceil(total / itemsPerPage)
      }
    }
  })

  useEffect(() => {
    const searchParams = new URLSearchParams(location.search)
    const q = searchParams.get('q')
    if (q) {
      setSearchTerm(q)
      setCurrentPage(1)
    }
  }, [location.search])

  const handleSearch = (e: React.FormEvent<HTMLFormElement>): void => {
    e.preventDefault()
    setCurrentPage(1)
    navigate(`/results?q=${encodeURIComponent(searchTerm)}`)
  }

  const handlePageChange = (page: number): void => {
    setCurrentPage(page)
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <form onSubmit={handleSearch} className="flex gap-4">
        <Input
          type="text"
          value={searchTerm}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
            setSearchTerm(e.target.value)
          }
          placeholder="Search products..."
          className="flex-1"
        />
        <Button type="submit">Search</Button>
      </form>

      {/* Grid de produtos */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {data?.products.map((product: Product) => (
          <Card key={product.id}>
            <CardHeader>
              <CardTitle>{product.name}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{product.price}</p>
              <div className="flex items-center gap-2">
                <span>Rating: {product.rating}</span>
                <span>({product.reviews} reviews)</span>
              </div>
            </CardContent>
            <CardFooter>
              <Button className="w-full">View Details</Button>
            </CardFooter>
          </Card>
        ))}
      </div>

      {/* Paginação */}
      {data?.totalPages && data.totalPages > 1 && (
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious 
                onClick={() => handlePageChange(Math.max(currentPage - 1, 1))}
                className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                aria-disabled={currentPage === 1}
              />
            </PaginationItem>
            
            {Array.from({ length: data.totalPages }, (_, i) => i + 1).map((page) => (
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
                onClick={() => handlePageChange(Math.min(currentPage + 1, data.totalPages))}
                className={currentPage === data.totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                aria-disabled={currentPage === data.totalPages}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}

      {/* Loading e Error states */}
      {isLoading && (
        <div className="flex justify-center">
          <p>Loading...</p>
        </div>
      )}
      
      {error && (
        <div className="flex justify-center text-red-500">
          <p>Error loading products: {error.message}</p>
        </div>
      )}
    </div>
  )
}

export default Results
