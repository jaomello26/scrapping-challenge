from fastapi import APIRouter, HTTPException
from app.api_client import trigger_review_scraping, trigger_product_search, fetch_snapshot_data
from app.models import ReviewRequest, ProductSearchRequest

router = APIRouter()

@router.post("/reviews")
def get_reviews(review_request: ReviewRequest):
    payload = review_request.dict(exclude_unset=True)
    snapshot_id = trigger_review_scraping([payload])
    
    if snapshot_id:
        try:
            data = fetch_snapshot_data(snapshot_id)
            return {"data": data}
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Error fetching snapshot data: {str(e)}")
    
    raise HTTPException(status_code=500, detail="Failed to trigger the snapshot scraping process.")


@router.post("/products")
def search_products(search_request: ProductSearchRequest):
    payload = [search_request.dict()]
    snapshot_id = trigger_product_search(payload)

    if snapshot_id:
        try:
            data = fetch_snapshot_data(snapshot_id)
            return {"data": data}
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Error fetching product data: {str(e)}")

    raise HTTPException(status_code=500, detail="Failed to trigger the product search.")
