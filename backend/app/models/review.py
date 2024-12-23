from pydantic import BaseModel, HttpUrl, Field
from typing import Optional

class ReviewRequest(BaseModel):
    url: str = Field(..., description="Product URL to get reviews from")
    days_range: Optional[int] = Field(None, description="The number of past days to consider when collecting reviews, missing value indicates no limit.")
    keyword: Optional[str] = Field(None, description="Filter reviews by a specific keyword.")
    sort_by: Optional[str] = Field(None, description="Sort order of the reviews (e.g., recent, helpful).")
    reviewer_type: Optional[str] = Field(None, description="Type of reviewer (e.g., all_reviews, verified_purchase).")
    filter_star: Optional[str] = Field(None, description="Filter reviews by star rating (e.g., all_stars, five_star, four_star).")
