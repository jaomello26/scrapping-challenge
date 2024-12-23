from fastapi import APIRouter, HTTPException
from app.services.api_client import trigger_review_scraping, fetch_snapshot_data
from app.models.review import ReviewRequest

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
