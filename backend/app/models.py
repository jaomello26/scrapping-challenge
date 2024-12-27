from pydantic import BaseModel, HttpUrl, Field
from typing import Optional

class ReviewRequest(BaseModel):
    url: str
    days_range: Optional[int]
    keyword: Optional[str]
    sort_by: Optional[str]
    reviewer_type: Optional[str]
    filter_star: Optional[str]

class ProductSearchRequest(BaseModel):
    keyword: str