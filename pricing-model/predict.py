# predict.py
import os
import sys
import json
from app import HotelDynamicPricingModel

def main():
    try:
        # Load input from Node.js
        input_data = json.loads(sys.argv[1])
        
        # Initialize and load model
        model = HotelDynamicPricingModel()
        BASE_DIR = os.path.dirname(os.path.abspath(__file__))
        model_path = os.path.join(BASE_DIR, 'hotel_pricing_model.pkl')
        
        # Remove print statements from load_model() in your HotelDynamicPricingModel class
        model.load_model(model_path)
        
        # Make prediction
        prediction = model.predict_price(
            checkin_date=input_data['checkin_date'],
            checkout_date=input_data['checkout_date'],
            room_type=input_data['room_type'],
            num_rooms=input_data['num_rooms']
        )
        
        # Return only JSON output
        sys.stdout.write(json.dumps(prediction))
        
    except Exception as e:
        # Return error as JSON
        error = {'error': str(e)}
        sys.stdout.write(json.dumps(error))
        sys.exit(1)

if __name__ == "__main__":
    main()